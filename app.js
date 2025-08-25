const express = require('express');
const morgan = require('morgan');

const productsRouter = require('./src/routes/products.routes');
const cartsRouter = require('./src/routes/carts.routes');

const app = express();

// Middlewares
app.use(express.json());
app.use(morgan('combined'));

// “Bienvenida” a la API
app.get('/api', (req, res) => {
  res.json({
    name: 'Airsoft E-commerce API',
    version: '1.0.0',
    status: 'OK',
    availableEndpoints: [
      { method: 'GET', path: '/api/products', description: 'Listar productos' },
      { method: 'GET', path: '/api/products/:pid', description: 'Obtener producto por ID' },
      { method: 'POST', path: '/api/products', description: 'Crear producto' },
      { method: 'PUT', path: '/api/products/:pid', description: 'Actualizar producto' },
      { method: 'DELETE', path: '/api/products/:pid', description: 'Eliminar producto' },
      { method: 'POST', path: '/api/carts', description: 'Crear carrito' },
      { method: 'GET', path: '/api/carts/:cid', description: 'Obtener carrito (IDs de productos)' },
      { method: 'GET', path: '/api/carts/:cid/details', description: 'Obtener carrito con detalles' },
      { method: 'POST', path: '/api/carts/:cid/product/:pid', description: 'Agregar producto al carrito' },
      { method: 'PUT', path: '/api/carts/:cid/product/:pid', description: 'Actualizar cantidad' },
      { method: 'DELETE', path: '/api/carts/:cid/product/:pid', description: 'Eliminar producto del carrito' },
      { method: 'GET', path: '/api/carts/:cid/summary', description: 'Resumen (totales)' }
    ]
  });
});

// Rutas de negocio
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// 404 para endpoints no encontrados
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    availableEndpoints: ['/api/products', '/api/carts']
  });
});

// Manejo de errores
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.name || 'Error',
    message: err.message || 'Error interno del servidor'
  });
});

module.exports = app;
