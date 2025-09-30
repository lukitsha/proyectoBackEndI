/**
 * Script para migrar productos del SEED (FS legacy) a MongoDB Atlas
 * Ejecutar con: node scripts/migrate.fs.to.mongo.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { ProductModel } = require('../src/models/product.model');
const { SEED_PRODUCTS } = require('./seed'); // importamos tu array de productos

(async () => {
  try {
    console.log('🌐 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'airsoft',
    });
    console.log('✅ Conectado a MongoDB');

    // Limpia la colección antes de migrar (opcional)
    await ProductModel.deleteMany({});
    console.log('🧹 Productos existentes eliminados');

    // Inserta todos los productos del SEED
    const result = await ProductModel.insertMany(SEED_PRODUCTS);
    console.log(`✅ Migración completa: ${result.length} productos insertados.`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la migración:', err.message);
    process.exit(1);
  }
})();
