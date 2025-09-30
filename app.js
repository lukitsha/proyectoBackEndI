// app.js
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');

const productsRouter = require('./src/routes/products.routes');
const cartsRouter = require('./src/routes/carts.routes');

const app = express();

/* ========= Middlewares base ========= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

/* ========= Archivos estáticos ========= */
app.use(express.static(path.join(__dirname, 'public')));

/* ========= Handlebars ========= */
const viewsDir = path.join(__dirname, 'src', 'views');

app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(viewsDir, 'layouts'),
  partialsDir: path.join(viewsDir, 'partials'),
  helpers: {
    eq: (a, b) => a === b,
    lte: (a, b) => Number(a) <= Number(b),
    typeof: (v) => typeof v,
    multiply: (a, b) => Number(a) * Number(b), // ✅ Nuevo helper
  },
}));
app.set('view engine', 'handlebars');
app.set('views', viewsDir);

/* ========= Vistas (Home / Tiempo Real) =========
   Montaje "a prueba de fallos": si falta el router o tiene un error,
   no se cae el server y te avisa en consola.
*/
(() => {
  try {
    const viewsRouter = require('./src/routes/views.router');
    app.use('/', viewsRouter);
    console.log('✓ Views router montado en "/"');
  } catch (err) {
    console.warn('⚠ No se pudo montar views.router:', err.message);
    console.warn('   > La ruta "/" mostrará 404 JSON hasta que exista y compile.');
  }
})();

/* ========= Bienvenida API ========= */
app.get('/api', (_req, res) => {
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
      { method: 'GET', path: '/api/carts/:cid/summary', description: 'Resumen (totales)' },
    ],
  });
});

/* ========= Routers de negocio ========= */
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

/* ========= 404 Web (HTML) =========
   Si acepta HTML y no es /api/*, renderizamos una vista bonita.
*/
app.use((req, res, next) => {
  const wantsHTML = req.accepts('html') && !req.originalUrl.startsWith('/api/');
  if (wantsHTML) {
    return res.status(404).render('errors/404', { pageTitle: '404 - Not Found' });
  }
  next();
});

/* ========= 404 JSON (API) ========= */
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    availableEndpoints: ['/api/products', '/api/carts', '/api'],
  });
});

/* ========= Manejo de errores ========= */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;

  // Si es web y acepta HTML, renderizamos 500.s
  if (_req && _req.accepts && _req.accepts('html') && !_req.originalUrl.startsWith('/api/')) {
    return res.status(status).render('errors/500', {
      pageTitle: 'Error',
      message: err.message || 'Error interno del servidor',
    });
  }

  // Fallback JSON (API)
  res.status(status).json({
    error: err.name || 'Error',
    message: err.message || 'Error interno del servidor',
  });
});

module.exports = app;
