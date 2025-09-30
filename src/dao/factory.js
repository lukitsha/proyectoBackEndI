// src/dao/factory.js
const useMongo = String(process.env.PERSISTENCE || '').toLowerCase() === 'mongo';

module.exports = {
  ProductsDAO: useMongo
    ? require('./mongo/products.mongo.dao')
    : require('./products.dao'),
  CartsDAO: useMongo
    ? require('./mongo/carts.mongo.dao')
    : require('./carts.dao'),
};
