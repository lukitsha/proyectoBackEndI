/**
 * Script para migrar productos del SEED (FS legacy) a MongoDB Atlas
 * Ejecutar con: npm run migrate
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { ProductModel } = require('../src/models/product.model');
const { SEED_PRODUCTS } = require('./seed'); // importamos tu array de productos

(async () => {
  try {
    console.log('🌐 Conectando a MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'airsoft',
    });

    console.log(`✅ Conectado a MongoDB en host: ${conn.connection.host}`);
    console.log(`📂 Base de datos: ${conn.connection.name}`);

    // Limpia la colección antes de migrar (opcional)
    await ProductModel.deleteMany({});
    console.log('🧹 Productos existentes eliminados');

    // Inserta todos los productos del SEED
    const result = await ProductModel.insertMany(SEED_PRODUCTS);
    console.log(`✅ Migración completa: ${result.length} productos insertados.`);

    // Mostrar IDs de confirmación (máx 5 para no llenar la consola)
    const ids = result.map(p => p._id.toString());
    console.log('🆔 IDs insertados (primeros 5):', ids.slice(0, 5));
    if (ids.length > 5) {
      console.log(`... y ${ids.length - 5} más`);
    }

    console.log('\n🎯 Confirmación: los productos ya están disponibles en tu MongoDB Atlas.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la migración:', err.message);
    process.exit(1);
  }
})();
