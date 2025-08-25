const path = require('path');

const config = {
  // Paths de archivos de datos
  PRODUCTS_FILE: path.join(__dirname, '..', 'data', 'products.json'),
  CARTS_FILE: path.join(__dirname, '..', 'data', 'carts.json'),
  DATA_DIR: path.join(__dirname, '..', 'data'),

  // Configuraciones de negocio
  MAX_PRODUCTS_PER_PAGE: 50,
  DEFAULT_PAGE_SIZE: 10,

  // Categorías válidas de productos
  VALID_CATEGORIES: ['replicas', 'magazines', 'bbs', 'batteries'],


  // Configuraciones de paginación
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
  },

  // Configuraciones de filtros
  FILTERS: {
    VALID_SORT_FIELDS: ['title', 'price', 'category', 'createdAt'],
    VALID_SORT_ORDERS: ['asc', 'desc'],
  },
};

module.exports = config;
