// src/dao/mongo/products.mongo.dao.js
const Product = require('../../models/product.model');

class ProductsMongoDAO {
  // CRUD básico
  async create(data) {
    return Product.create(data);
  }

  async getById(id) {
    return Product.findById(id);
  }

  async getAll() {
    return Product.find({});
  }

  async update(id, data) {
    return Product.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return Product.findByIdAndDelete(id);
  }

  /**
   * Paginación + filtros + ordenamiento por precio (asc/desc)
   * query admitido:
   * {
   *   category: 'replicas' | 'magazines' | ... (opcional)
   *   status: true|false (opcional)
   *   text: 'string a buscar en title/description' (opcional)
   * }
   */
  async paginate({ page = 1, limit = 10, sort, query = {} }) {
    const filter = {};
    if (query.category) filter.category = query.category;
    if (typeof query.status === 'boolean') filter.status = query.status;
    if (query.text) {
      filter.$or = [
        { title: { $regex: query.text, $options: 'i' } },
        { description: { $regex: query.text, $options: 'i' } },
      ];
    }

    const options = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    };
    if (sort === 'asc' || sort === 'desc') {
      options.sort = { price: sort === 'asc' ? 1 : -1 };
    }

    return Product.paginate(filter, options);
  }
}

module.exports = ProductsMongoDAO;
