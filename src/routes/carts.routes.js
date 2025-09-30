// src/routes/carts.routes.js
const express = require('express');
const cartsController = require('../controllers/carts.controller');

const router = express.Router();

// Crear nuevo carrito
router.post('/', cartsController.createCart);

// GET con populate (trae productos completos)
router.get('/:cid', cartsController.getCart);

// Resumen del carrito
router.get('/:cid/summary', cartsController.getCartSummary);

// Agregar producto al carrito
router.post('/:cid/product/:pid', cartsController.addProductToCart);

// Eliminar un producto del carrito
router.delete('/:cid/products/:pid', cartsController.removeProduct);

// Reemplazar todos los productos del carrito
router.put('/:cid', cartsController.replaceAll);

// Actualizar SOLO la cantidad de un producto
router.put('/:cid/products/:pid', cartsController.updateQuantity);

// Vaciar el carrito (eliminar todos los productos)
router.delete('/:cid', cartsController.clearCart);

module.exports = router;
