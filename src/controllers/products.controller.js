const productsService = require('../services/products.service');

class ProductsController {

  async getAllProducts(req, res, next) {
    try {
      const result = await productsService.getAllProducts(req.query);
      
      // Si el resultado incluye paginación, enviar metadata
      if (result.products && result.pagination) {
        res.json({
          status: 'success',
          data: result.products,
          pagination: result.pagination
        });
      } else {
        // Resultado simple sin paginación
        res.json({
          status: 'success',
          data: result
        });
      }
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