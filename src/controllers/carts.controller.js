// src/controllers/carts.controller.js
const cartsService = require('../services/carts.service');

class CartsController {
  // (opcional) Crear carrito
  async createCart(req, res, next) {
    try {
      const newCart = await cartsService.createCart();
      const io = req.app.get('io');
      if (io) io.emit('cartCreated', newCart);

      res.status(201).json({
        status: 'success',
        message: 'Carrito creado exitosamente',
        data: newCart
      });
    } catch (error) {
      next(error);
    }
  }

  // REQUISITO: GET con populate
  async getCart(req, res, next) {
    try {
      const cart = await cartsService.getPopulated(req.params.cid);
      res.json({
        status: 'success',
        data: cart
      });
    } catch (error) {
      next(error);
    }
  }

  // (opcional) Resumen con totales calculados
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

  // (opcional) Agregar producto al carrito
  async addProductToCart(req, res, next) {
    try {
      const { cid, pid } = req.params;
      const quantity = Number(req.body.quantity) || 1;

      const updatedCart = await cartsService.addProductToCart(cid, pid, quantity);

      const io = req.app.get('io');
      if (io) io.emit('cartUpdated', updatedCart);

      res.json({
        status: 'success',
        message: 'Producto agregado al carrito exitosamente',
        data: updatedCart
      });
    } catch (error) {
      next(error);
    }
  }

  // REQUISITO: eliminar un producto del carrito
  async removeProduct(req, res, next) {
    try {
      const { cid, pid } = req.params;
      const updatedCart = await cartsService.removeProduct(cid, pid);

      const io = req.app.get('io');
      if (io) io.emit('cartUpdated', updatedCart);

      res.json({
        status: 'success',
        message: 'Producto eliminado del carrito',
        data: updatedCart
      });
    } catch (error) {
      next(error);
    }
  }

  // REQUISITO: reemplazar todos los productos del carrito
  // Body esperado: [{ product: "<productId>", quantity: <number> }, ...]
  async replaceAll(req, res, next) {
    try {
      const { cid } = req.params;
      const productsArray = Array.isArray(req.body) ? req.body : [];
      const updatedCart = await cartsService.replaceAll(cid, productsArray);

      const io = req.app.get('io');
      if (io) io.emit('cartUpdated', updatedCart);

      res.json({
        status: 'success',
        message: 'Carrito actualizado (reemplazo total)',
        data: updatedCart
      });
    } catch (error) {
      next(error);
    }
  }

  // REQUISITO: actualizar SOLO la cantidad de un producto
  // Body esperado: { "quantity": number }
  async updateQuantity(req, res, next) {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined || Number.isNaN(Number(quantity))) {
        const err = new Error('quantity es requerido y debe ser numérico');
        err.statusCode = 400;
        throw err;
      }

      const updatedCart = await cartsService.updateQty(cid, pid, Number(quantity));

      const io = req.app.get('io');
      if (io) io.emit('cartUpdated', updatedCart);

      res.json({
        status: 'success',
        message: 'Cantidad actualizada',
        data: updatedCart
      });
    } catch (error) {
      next(error);
    }
  }

  // REQUISITO: vaciar el carrito (eliminar todos los productos)
  async clearCart(req, res, next) {
    try {
      const { cid } = req.params;
      const cleared = await cartsService.clear(cid);

      const io = req.app.get('io');
      if (io) io.emit('cartUpdated', cleared);

      res.json({
        status: 'success',
        message: 'Carrito vaciado',
        data: cleared
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartsController();
