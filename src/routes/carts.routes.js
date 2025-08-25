const express = require('express');
const cartsController = require('../controllers/carts.controller');

const router = express.Router();

// POST /api/carts - Crear nuevo carrito
router.post('/', cartsController.createCart);

// GET /api/carts/:cid - Obtener productos del carrito
router.get('/:cid', cartsController.getCartById);

// GET /api/carts/:cid/summary - Obtener resumen del carrito con totales
router.get('/:cid/summary', cartsController.getCartSummary);

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', cartsController.addProductToCart);

// DELETE /api/carts/:cid/product/:pid - Remover producto del carrito
router.delete('/:cid/product/:pid', cartsController.removeProductFromCart);

// PUT /api/carts/:cid/product/:pid - Actualizar cantidad de producto
router.put('/:cid/product/:pid', cartsController.updateProductQuantity);

// DELETE /api/carts/:cid - Eliminar carrito completo
router.delete('/:cid', cartsController.deleteCart);

module.exports = router;