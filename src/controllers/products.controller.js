// src/controllers/products.controller.js
const productsService = require('../services/products.service');

class ProductsController {
  // GET /api/products
  async getAllProducts(req, res, next) {
    try {
      const { limit, page, sort, ...rest } = req.query;
      const result = await productsService.listWithPagination({
        limit,
        page,
        sort,
        query: rest,
        baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await productsService.getProductById(req.params.pid);
      res.json({
        status: 'success',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const newProduct = await productsService.createProduct(req.body);

      // 🔔 Notificar a todos los clientes conectados (Realtime)
      const io = req.app.get('io');
      if (io) io.emit('products:changed');

      res.status(201).json({
        status: 'success',
        message: 'Producto creado exitosamente',
        data: newProduct
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const updatedProduct = await productsService.updateProduct(req.params.pid, req.body);

      // 🔔 (Recomendado) notificar también en updates
      const io = req.app.get('io');
      if (io) io.emit('products:changed');

      res.json({
        status: 'success',
        message: 'Producto actualizado exitosamente',
        data: updatedProduct
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const deletedProduct = await productsService.deleteProduct(req.params.pid);

      // 🔔 Notificar a todos los clientes conectados (Realtime)
      const io = req.app.get('io');
      if (io) io.emit('products:changed');

      res.json({
        status: 'success',
        message: 'Producto eliminado exitosamente',
        data: deletedProduct
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductsController();
