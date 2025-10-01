// src/dao/mongo/carts.mongo.dao.js
const Cart = require('../../models/cart.model');
const { Types } = require('mongoose');

class CartsMongoDAO {
  async create() {
    return Cart.create({ products: [] });
  }

  async getById(id) {
    return await Cart.findById(id).lean();  // lean para permisos
  }

  async getPopulated(id) {
    return await Cart.findById(id)
      .populate('products.product')
      .lean();  // permitimos el acceeso a handlebars para manejarlo
  }

  async replaceProducts(id, products) {
    // products: [{ product: <ObjectId|string>, quantity: <number> }, ...]
    const normalized = (products || []).map(p => ({
      product: Types.ObjectId.createFromHexString(
        typeof p.product === 'string' ? p.product : String(p.product)
      ),
      quantity: Number(p.quantity) || 1,
    }));
    return Cart.findByIdAndUpdate(id, { products: normalized }, { new: true });
  }

  async clear(id) {
    return Cart.findByIdAndUpdate(id, { products: [] }, { new: true });
  }

  async pullProduct(id, productId) {
    return Cart.findByIdAndUpdate(
      id,
      { $pull: { products: { product: productId } } },
      { new: true }
    );
  }

  async setQuantity(id, productId, quantity) {
    return Cart.findOneAndUpdate(
      { _id: id, 'products.product': productId },
      { $set: { 'products.$.quantity': quantity } },
      { new: true }
    );
  }
}

module.exports = CartsMongoDAO;
