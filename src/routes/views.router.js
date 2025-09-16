const { Router } = require('express');

// Service flexible
const svcMod = require('../services/products.service');
const svcInstance =
  (typeof svcMod === 'function') ? new svcMod()
  : (svcMod && typeof svcMod.default === 'function') ? new svcMod.default()
  : svcMod;

const getAllProducts =
  (svcInstance && typeof svcInstance.getAllProducts === 'function') ? svcInstance.getAllProducts.bind(svcInstance)
  : (svcInstance && typeof svcInstance.getAll === 'function') ? svcInstance.getAll.bind(svcInstance)
  : null;

if (!getAllProducts) {
  throw new Error('[views.router] No encontré getAllProducts() ni getAll() en ProductsService');
}

const router = Router();

const CATEGORY_META = {
  replicas:  { key: 'replicas',  title: 'Réplicas',   badge: 'replicas'  },
  magazines: { key: 'magazines', title: 'Cargadores', badge: 'magazines' },
  bbs:       { key: 'bbs',       title: 'BBs',        badge: 'bbs'       },
  batteries: { key: 'batteries', title: 'Baterías',   badge: 'batteries' },
};

const VALID_KEYS = Object.keys(CATEGORY_META);

router.get('/', async (req, res, next) => {
  try {
    const selected = (req.query.category || '').toLowerCase().trim();
    const activeKey = VALID_KEYS.includes(selected) ? selected : 'all';

    const products = await getAllProducts({});
    const normalized = (products || []).map(p => ({
      ...p,
      _id: p._id || p.id,
      category: (p.category || '').toLowerCase(),
    }));

    // Conteos por categoría para mostrar en la botonera
    const counts = VALID_KEYS.reduce((acc, k) => {
      acc[k] = normalized.filter(p => p.category === k).length;
      return acc;
    }, {});
    const total = normalized.length;

    // Armo las secciones
    let productsByCategory = Object.values(CATEGORY_META).map(meta => ({
      ...meta,
      items: normalized.filter(p => p.category === meta.key),
    }));

    // Si hay filtro, dejo solo esa sección
    if (activeKey !== 'all') {
      productsByCategory = productsByCategory.filter(s => s.key === activeKey);
    }

    res.render('home', {
      pageTitle: activeKey === 'all'
        ? 'Home'
        : `Home • ${CATEGORY_META[activeKey]?.title || ''}`,
      isHome: true,
      productsCount: total,
      productsByCategory,
      // datos para la UI de filtros
      filters: {
        active: activeKey,
        counts,
        total,
        categories: Object.values(CATEGORY_META).map(m => ({
          key: m.key,
          title: m.title,
          count: counts[m.key] || 0,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/realtimeproducts', (_req, res) => {
  res.render('realtimeproducts', { pageTitle: 'Tiempo Real', isRealtime: true });
});

module.exports = router;
