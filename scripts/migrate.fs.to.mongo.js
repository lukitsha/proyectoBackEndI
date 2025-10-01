/**
 * Script para migrar productos del SEED (FS legacy) a MongoDB Atlas
 * Ejecutar con: npm run migrate
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/product.model');
const { SEED_PRODUCTS } = require('./seed');

// Función para transformar los productos del SEED al formato correcto
function transformSeedProduct(product, index) {
  // Generar código único basado en categoría y título si no existe
  const generateCode = () => {
    const categoryPrefix = product.category?.substring(0, 3).toUpperCase() || 'PRD';
    const titlePart = product.title?.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') || '';
    return `${categoryPrefix}-${titlePart}-${String(index + 1).padStart(3, '0')}`;
  };

  return {
    title: product.title,
    description: product.description,
    // Usar código existente o generar uno único
    code: product.code || generateCode(),
    price: product.price,
    category: product.category,
    stock: product.stock,
    // Convertir status de "active" a true
    status: product.status === 'active' || product.status === true,
    thumbnails: product.thumbnails || [],
    specs: product.specs || {}
  };
}

(async () => {
  try {
    console.log('🌐 Conectando a MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ Conectado a MongoDB en host: ${conn.connection.host}`);
    console.log(`📂 Base de datos: ${conn.connection.name}`);

    // Limpia la colección antes de migrar
    const deleteResult = await Product.deleteMany({});
    console.log(`🧹 ${deleteResult.deletedCount} productos existentes eliminados`);

    // Verificar que hay productos para migrar
    if (!SEED_PRODUCTS || SEED_PRODUCTS.length === 0) {
      console.log('⚠️  No hay productos en el SEED para migrar');
      process.exit(0);
    }

    console.log(`📦 Preparando para insertar ${SEED_PRODUCTS.length} productos...`);
    
    // Transformar los productos al formato correcto
    console.log('🔄 Transformando productos...');
    const transformedProducts = SEED_PRODUCTS.map((product, index) => {
      const transformed = transformSeedProduct(product, index);
      
      // Mostrar solo las primeras 5 transformaciones para no llenar la consola
      if (index < 5) {
        console.log(`   ✓ ${product.title?.substring(0, 30)}... → code: ${transformed.code}`);
      }
      
      return transformed;
    });

    // Verificar códigos únicos
    const codes = new Set();
    const duplicates = [];
    transformedProducts.forEach(p => {
      if (codes.has(p.code)) {
        duplicates.push(p.code);
      }
      codes.add(p.code);
    });

    if (duplicates.length > 0) {
      console.log('⚠️  Resolviendo códigos duplicados...');
      transformedProducts.forEach((p, idx) => {
        if (duplicates.includes(p.code)) {
          p.code = `${p.code}-${Date.now()}-${idx}`;
        }
      });
    }

    // Insertar todos los productos
    console.log('💾 Insertando en MongoDB...');
    const result = await Product.insertMany(transformedProducts, { 
      ordered: false // Continuar si alguno falla
    });
    
    console.log(`\n✅ Migración completa: ${result.length} productos insertados.`);

    // Mostrar resumen por categoría
    const categoryCounts = {};
    result.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });
    
    console.log('\n📊 Resumen por categoría:');
    const categoryNames = {
      replicas: '   • Réplicas',
      magazines: '   • Cargadores',
      bbs: '   • BBs',
      batteries: '   • Baterías'
    };
    
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`${categoryNames[cat] || cat}: ${count} productos`);
    });

    // Mostrar algunos ejemplos
    console.log('\n📝 Primeros 3 productos insertados:');
    result.slice(0, 3).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.title.substring(0, 40)}...`);
      console.log(`      Code: ${p.code} | Precio: $${p.price} | Stock: ${p.stock}`);
    });

    console.log('\n🎯 Los productos ya están disponibles en MongoDB Atlas.');
    console.log('🚀 Puedes iniciar tu servidor con: npm run dev');

    // Cerrar conexión
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (err) {
    console.error('\n❌ Error durante la migración:', err.message);
    
    // Errores de validación detallados
    if (err.name === 'ValidationError') {
      console.error('\n📋 Detalles de validación:');
      Object.keys(err.errors).forEach(field => {
        console.error(`   • ${field}: ${err.errors[field].message}`);
      });
    }
    
    // Error de duplicados
    if (err.code === 11000) {
      console.error('\n⚠️  Error de código duplicado:', err.keyValue);
      console.error('   Ejecuta el script nuevamente, ya se limpió la BD');
    }
    
    // Cerrar conexión
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
})();