const cartsService = require('../services/carts.service');

class CartsController {

  async createCart(req, res, next) {
    try {
      const newCart = await cartsService.createCart();

      // Emitir evento global de creación
      req.app.get('io').emit('cartCreated', newCart);
      
      res.status(201).json({
        status: 'success',
        message: 'Carrito creado exitosamente',
        data: newCart
      });
    } catch (error) {
      next(error);
    }
  }

  async getCartById(req, res, next) {
    try {
      const cart = await cartsService.getCartWithProductDetails(req.params.cid);
      
      res.json({
        status: 'success',
        data: cart
      });
    } catch (error) {
      next(error);
    }
  }

  async getCartSummary(req, res, next) {
    try {
      const summary = await cartsService.getCartSummary(req.params.cid);
      
      res.json({
        status: 'success',
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  async addProductToCart(req, res, next) {
    try {
      const { cid, pid } = req.params;
      const quantity = req.body.quantity || 1;
      
      const updatedCart = await cartsService.addProductToCart(cid, pid, quantity);

      // Emitir evento para notificar que se actualizó un carrito
      req.app.get('io').emit('cartUpdated', updatedCart);
      
      res.json({
        status: 'success',
        message: 'Producto agregado al carrito exitosamente',
        data: updatedCart
      });
    } catch (error) {
      next(error);
    }
  }

  async removeProductFromCart(req, res, next) {
    try {
      const { cid, pid } = req.params;
      
      const updatedCart = await cartsService.removeProductFromCart(cid, pid);

      // Emitir evento de actualización
      req.app.get('io').emit('cartUpdated', updatedCart);
      
      res.json({
        status: 'success',
        message: 'Producto removido del carrito exitosamente',
        data: updatedCart
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProductQuantity(req, res, next) {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;
      
      if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
        const error = new Error('Quantity debe ser un número mayor o igual a 0');
        error.statusCode = 400;
        throw error;
      }
      
      const updatedCart = await cartsService.updateProductQuantity(cid, pid, quantity);

      // Emitir evento de actualización
      req.app.get('io').emit('cartUpdated', updatedCart);
      
      res.json({
        status: 'success',
        message: 'Cantidad actualizada exitosamente',
        data: updatedCart
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCart(req, res, next) {
    try {
      const deletedCart = await cartsService.deleteCart(req.params.cid);

      // Emitir evento global de borrado
      req.app.get('io').emit('cartDeleted', deletedCart);
      
      res.json({
        status: 'success',
        message: 'Carrito eliminado exitosamente',
        data: deletedCart
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartsController();
