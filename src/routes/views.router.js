const { Router } = require('express');
const productsService = require('../services/products.service');
const cartsService = require('../services/carts.service');

const router = Router();

// Home con paginación Y CATEGORÍAS
router.get('/', async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, category, ...rest } = req.query;
    
    // Si hay categoría específica, obtener solo esos productos
    // Si no, obtener TODOS los productos para poder agruparlos
    const queryLimit = category ? limit : 100; // Sin categoría, traer más para mostrar todas
    
    // Obtener productos con paginación
    const result = await productsService.listWithPagination({
      limit: queryLimit,
      page,
      sort,
      query: { ...rest, category },
      baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`
    });

    // Obtener contadores REALES desde la BD
    const [replicasCount, magazinesCount, bbsCount, batteriesCount] = await Promise.all([
      productsService.countByCategory('replicas'),
      productsService.countByCategory('magazines'),
      productsService.countByCategory('bbs'),
      productsService.countByCategory('batteries')
    ]);

    // IMPORTANTE: Agrupar productos solo cuando NO hay filtro de categoría
    let groupedProducts = null;
    if (!category && result.payload && result.payload.length > 0) {
      // Agrupar los productos que vinieron de la BD
      groupedProducts = [
        {
          title: 'Réplicas',
          badge: 'REPLICAS',
          items: result.payload.filter(p => p.category === 'replicas')
        },
        {
          title: 'Cargadores',
          badge: 'MAGAZINES', 
          items: result.payload.filter(p => p.category === 'magazines')
        },
        {
          title: 'BBs',
          badge: 'BBS',
          items: result.payload.filter(p => p.category === 'bbs')
        },
        {
          title: 'Baterías',
          badge: 'BATTERIES',
          items: result.payload.filter(p => p.category === 'batteries')
        }
      ];
    }

    // Títulos de categoría para cuando hay filtro
    const categoryTitles = {
      'replicas': 'Réplicas',
      'magazines': 'Cargadores',
      'bbs': 'BBs',
      'batteries': 'Baterías'
    };

    // Construir links de paginación
    const buildLink = (pageNum) => {
      if (!pageNum) return null;
      const params = new URLSearchParams({
        page: pageNum,
        limit,
        ...(sort && { sort }),
        ...(category && { category })
      });
      return `/?${params.toString()}`;
    };

    // Calcular si hay productos
    const totalDocs = replicasCount + magazinesCount + bbsCount + batteriesCount;
    const hasAnyProducts = totalDocs > 0;

    const dataToRender = {
      pageTitle: 'Home',
      isHome: true,
      payload: result.payload,
      totalPages: result.totalPages,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      groupedProducts,
      currentCategory: category,
      currentCategoryTitle: categoryTitles[category],
      replicasCount,
      magazinesCount,
      bbsCount,
      batteriesCount,
      totalDocs,
      hasAnyProducts,
      prevLink: buildLink(result.prevPage),
      nextLink: buildLink(result.nextPage)
    };

    res.render('pages/home', dataToRender);
    
  } catch (err) {
    console.error('❌ Error en vista home:', err);
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