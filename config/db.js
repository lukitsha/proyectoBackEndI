// config/db.js
const mongoose = require('mongoose');

module.exports = async (uri) => {
  if (!uri) throw new Error('MONGO_URI no definida');
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    // opciones modernas (mongoose 7+ ya maneja defaults adecuados)
    autoIndex: true,
  });

  const conn = mongoose.connection;
  console.log(`✅ MongoDB Atlas conectado → DB: ${conn.name}`);
  return conn;
};
