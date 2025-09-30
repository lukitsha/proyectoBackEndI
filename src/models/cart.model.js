const { Schema, model, Types } = require('mongoose');

const CartSchema = new Schema({
  products: [{
    product:  { type: Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 }
  }]
}, { timestamps: true });

// índice para acceso rápido por producto dentro del carrito
CartSchema.index({ 'products.product': 1 });

module.exports = model('Cart', CartSchema);
