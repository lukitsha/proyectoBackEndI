const { Router } = require('express');
const productsService = require('../services/products.service');
const cartsService = require('../services/carts.service');

const router = Router();

// Home con paginación
router.get('/', async (req, res, next) => {
  try {
    const { limit, page, sort, ...rest } = req.query;
    const result = await productsService.listWithPagination({
      limit,
      page,
      sort,
      query: rest,
      baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`
    });

    res.render('pages/home', {
      pageTitle: 'Home',
      isHome: true,
      ...result // contiene payload, page, totalPages, hasPrevPage, etc.
    });
  } catch (err) {
    next(err);
  }
});

// Vista en tiempo real
router.get('/realtimeproducts', (_req, res) => {
  res.render('pages/realTimeProducts', { pageTitle: 'Tiempo Real', isRealtime: true });
});

// Vista de carrito con populate
router.get('/carts/:cid', async (req, res, next) => {
  try {
    const cart = await cartsService.getPopulated(req.params.cid);
    const summary = await cartsService.getCartSummary(req.params.cid);

    res.render('pages/cartDetail', {
      pageTitle: 'Detalle de Carrito',
      isCart: true,
      cart,
      summary
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
