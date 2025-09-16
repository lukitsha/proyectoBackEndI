const { Router } = require('express');
const ProductsService = require('../services/products.service');

const router = Router();

const CATEGORY_META = {
  replicas:  { key: 'replicas',  title: 'Réplicas',   badge: 'replicas'  },
  magazines: { key: 'magazines', title: 'Cargadores', badge: 'magazines' },
  bbs:       { key: 'bbs',       title: 'BBs',        badge: 'bbs'       },
  batteries: { key: 'batteries', title: 'Baterías',   badge: 'batteries' },
};

router.get('/', async (req, res, next) => {
  try {
    const svc = new ProductsService();
    const products = await svc.getAll();

    // agrupo por categoría que usamos en back: replicas | magazines | bbs | batteries
    const productsByCategory = Object.values(CATEGORY_META).map(meta => ({
      ...meta,
      items: (products || []).filter(p => (p.category || '').toLowerCase() === meta.key)
    }));

    res.render('home', {
      pageTitle: 'Home',
      isHome: true,
      productsCount: products?.length || 0,
      productsByCategory
    });
  } catch (err) {
    next(err);
  }
});

router.get('/realtimeproducts', async (_req, res) => {
  res.render('realTimeProducts', { pageTitle: 'Tiempo Real', isRealtime: true });
});

module.exports = router;
