const { Schema, model } = require('mongoose');
const paginate = require('mongoose-paginate-v2');

const ProductSchema = new Schema({
  title:       { type: String, required: true, minlength: 3, trim: true },
  code:        { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true, minlength: 10, trim: true },
  price:       { type: Number, required: true, min: 0 },
  category:    { type: String, required: true, trim: true },
  stock:       { type: Number, required: true, min: 0 },
  status:      { type: Boolean, default: true },
  thumbnails:  [{ type: String, trim: true }],
  specs:       { type: Schema.Types.Mixed } // para detalles técnicos (ej: batería, fps, etc.)
}, { timestamps: true });

// Índices (filtros/orden)
ProductSchema.index({ price: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ title: 'text', description: 'text' }); // búsqueda por texto

ProductSchema.plugin(paginate);

module.exports = model('Product', ProductSchema);
