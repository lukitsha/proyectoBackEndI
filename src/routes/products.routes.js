const express = require('express');
const productsController = require('../controllers/products.controller');

const router = express.Router();

// GET /api/products - Obtener todos los productos (con filtros opcionales)
router.get('/', productsController.getAllProducts);

// GET /api/products/:pid - Obtener producto por ID
router.get('/:pid', productsController.getProductById);

// POST /api/products - Crear nuevo producto
router.post('/', productsController.createProduct);

// PUT /api/products/:pid - Actualizar producto (excepto ID)
router.put('/:pid', productsController.updateProduct);

// DELETE /api/products/:pid - Eliminar producto
router.delete('/:pid', productsController.deleteProduct);

module.exports = router;