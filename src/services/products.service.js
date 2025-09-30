const { VALID_CATEGORIES, PAGINATION, FILTERS } = require('../../config/config');
const { ProductsDAO } = require('../dao/factory'); // <- usa factory (FS ↔ Mongo)
const useMongo = String(process.env.PERSISTENCE || '').toLowerCase() === 'mongo';

class ProductsService {
  constructor() {
    this.productsDAO = new ProductsDAO();
  }

  // ---------- helpers de compatibilidad (FS/Mongo) ----------
  async _daoGetAll() {
    if (typeof this.productsDAO.getAll === 'function') return this.productsDAO.getAll();
    if (typeof this.productsDAO.getAllProducts === 'function') return this.productsDAO.getAllProducts();
    return [];
  }

  async _daoGetById(id) {
    if (typeof this.productsDAO.getById === 'function') return this.productsDAO.getById(id);
    if (typeof this.productsDAO.getProductById === 'function') return this.productsDAO.getProductById(id);
    return null;
  }

  async _daoCreate(data) {
    if (typeof this.productsDAO.create === 'function') return this.productsDAO.create(data);
    if (typeof this.productsDAO.createProduct === 'function') return this.productsDAO.createProduct(data);
    throw new Error('DAO no soporta create');
  }

  async _daoUpdate(id, data) {
    if (typeof this.productsDAO.update === 'function') return this.productsDAO.update(id, data);
    if (typeof this.productsDAO.updateProduct === 'function') return this.productsDAO.updateProduct(id, data);
    throw new Error('DAO no soporta update');
  }

  async _daoDelete(id) {
    if (typeof this.productsDAO.delete === 'function') return this.productsDAO.delete(id);
    if (typeof this.productsDAO.deleteProduct === 'function') return this.productsDAO.deleteProduct(id);
    throw new Error('DAO no soporta delete');
  }

  // ------------- Helpers de unicidad y validación -------------------
  async assertUniqueCode(code, excludeId = null) {
    const all = await this._daoGetAll();
    const clash = all.find((p) => {
      const pid = String(p._id || p.id);
      return p.code === code && pid !== String(excludeId || '');
    });
    if (clash) {
      const err = new Error(`El code '${code}' ya existe`);
      err.statusCode = 409;
      throw err;
    }
  }

  validateProductData(productData, isUpdate = false) {
    const errors = [];

    // title
    if (!isUpdate || productData.title !== undefined) {
      if (
        !productData.title ||
        typeof productData.title !== 'string' ||
        productData.title.trim().length < 3
      ) {
        errors.push('Title debe ser un string de al menos 3 caracteres');
      }
    }

    // description
    if (!isUpdate || productData.description !== undefined) {
      if (
        !productData.description ||
        typeof productData.description !== 'string' ||
        productData.description.trim().length < 10
      ) {
        errors.push('Description debe ser un string de al menos 10 caracteres');
      }
    }

    // code (obligatorio en create; opcional en update)
    if (!isUpdate || productData.code !== undefined) {
      if (
        typeof productData.code !== 'string' ||
        productData.code.trim().length === 0
      ) {
        errors.push('code es obligatorio y debe ser string no vacío');
      }
    }

    // price
    if (!isUpdate || productData.price !== undefined) {
      if (
        productData.price === undefined ||
        typeof productData.price !== 'number' ||
        productData.price <= 0
      ) {
        errors.push('Price debe ser un número mayor a 0');
      }
    }

    // category
    if (!isUpdate || productData.category !== undefined) {
      if (!productData.category || !VALID_CATEGORIES.includes(productData.category)) {
        errors.push(`Category debe ser uno de: ${VALID_CATEGORIES.join(', ')}`);
      }
    }

    // status BOOLEAN
    if (!isUpdate || productData.status !== undefined) {
      if (typeof productData.status !== 'boolean') {
        errors.push('Status debe ser boolean (true/false)');
      }
    }

    // stock
    if (!isUpdate || productData.stock !== undefined) {
      if (
        productData.stock === undefined ||
        typeof productData.stock !== 'number' ||
        !Number.isInteger(productData.stock) ||
        productData.stock < 0
      ) {
        errors.push('Stock debe ser un entero ≥ 0');
      }
    }

    // thumbnails: si se envía, debe ser array<string>
    if (productData.thumbnails !== undefined) {
      if (
        !Array.isArray(productData.thumbnails) ||
        !productData.thumbnails.every((t) => typeof t === 'string')
      ) {
        errors.push('thumbnails debe ser un array de strings');
      }
    }

    // Validaciones específicas por categoría (usa specs)
    this.validateCategorySpecificFields(productData, errors, isUpdate);

    if (errors.length > 0) {
      const error = new Error(`Errores de validación: ${errors.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
  }

  validateCategorySpecificFields(productData, errors, isUpdate) {
    const category = productData.category;

    switch (category) {
      case 'replicas':
        this.validateReplicaFields(productData, errors, isUpdate);
        break;
      case 'magazines':
        this.validateMagazineFields(productData, errors, isUpdate);
        break;
      case 'bbs':
        this.validateBBsFields(productData, errors, isUpdate);
        break;
      case 'batteries':
        this.validateBatteryFields(productData, errors, isUpdate);
        break;
      default:
        break;
    }
  }

  validateReplicaFields(data, errors, isUpdate) {
    if (!isUpdate || data.specs !== undefined) {
      if (!data.specs || typeof data.specs !== 'object') {
        errors.push('Specs es requerido para réplicas');
        return;
      }
      const { caliber, weight, length, firingMode, hopUp } = data.specs;

      if (!caliber || typeof caliber !== 'string') errors.push('Specs.caliber es requerido');
      if (weight === undefined || typeof weight !== 'number' || weight <= 0) errors.push('Specs.weight > 0');
      if (length === undefined || typeof length !== 'number' || length <= 0) errors.push('Specs.length > 0');
      if (!firingMode || typeof firingMode !== 'string') errors.push('Specs.firingMode es requerido');
      if (typeof hopUp !== 'boolean') errors.push('Specs.hopUp debe ser boolean');
    }
  }

  validateMagazineFields(data, errors, isUpdate) {
    if (!isUpdate || data.specs !== undefined) {
      if (!data.specs || typeof data.specs !== 'object') {
        errors.push('Specs es requerido para cargadores');
        return;
      }
      const { capacity, compatibility, material } = data.specs;

      if (capacity === undefined || typeof capacity !== 'number' || capacity <= 0) errors.push('Specs.capacity > 0');
      if (!compatibility || !Array.isArray(compatibility) || compatibility.length === 0) errors.push('Specs.compatibility array no vacío');
      if (!material || typeof material !== 'string') errors.push('Specs.material es requerido');
    }
  }

  validateBBsFields(data, errors, isUpdate) {
    if (!isUpdate || data.specs !== undefined) {
      if (!data.specs || typeof data.specs !== 'object') {
        errors.push('Specs es requerido para BBs');
        return;
      }
      const { weight, diameter, quantity, material } = data.specs;

      if (weight === undefined || typeof weight !== 'number' || weight <= 0) errors.push('Specs.weight > 0');
      if (diameter === undefined || typeof diameter !== 'number' || diameter <= 0) errors.push('Specs.diameter > 0');
      if (quantity === undefined || typeof quantity !== 'number' || quantity <= 0) errors.push('Specs.quantity > 0');
      if (!material || typeof material !== 'string') errors.push('Specs.material es requerido');
    }
  }

  validateBatteryFields(data, errors, isUpdate) {
    if (!isUpdate || data.specs !== undefined) {
      if (!data.specs || typeof data.specs !== 'object') {
        errors.push('Specs es requerido para baterías');
        return;
      }
      const { voltage, capacity, chemistry, connector } = data.specs;

      if (voltage === undefined || typeof voltage !== 'number' || voltage <= 0) errors.push('Specs.voltage > 0');
      if (capacity === undefined || typeof capacity !== 'number' || capacity <= 0) errors.push('Specs.capacity > 0');
      if (!chemistry || typeof chemistry !== 'string') errors.push('Specs.chemistry es requerido');
      if (!connector || typeof connector !== 'string') errors.push('Specs.connector es requerido');
    }
  }

  // ---------- filtros/paginación (para FS legacy) ----------
  validateFilters(filters) {
    const validated = {};

    if (filters.category && VALID_CATEGORIES.includes(filters.category)) {
      validated.category = filters.category;
    }

    if (filters.status !== undefined) {
      if (typeof filters.status === 'boolean') validated.status = filters.status;
      else if (typeof filters.status === 'string') {
        const v = filters.status.toLowerCase();
        if (v === 'true') validated.status = true;
        if (v === 'false') validated.status = false;
      }
    }

    if (filters.minPrice !== undefined) {
      const minPrice = parseFloat(filters.minPrice);
      if (!isNaN(minPrice) && minPrice >= 0) validated.minPrice = minPrice;
    }

    if (filters.maxPrice !== undefined) {
      const maxPrice = parseFloat(filters.maxPrice);
      if (!isNaN(maxPrice) && maxPrice >= 0) validated.maxPrice = maxPrice;
    }

    if (filters.query && typeof filters.query === 'string') {
      validated.query = filters.query.trim();
    }

    return validated;
  }

  validatePagination(query) {
    const limit = Math.min(
      parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT,
      PAGINATION.MAX_LIMIT
    );

    const page = Math.max(parseInt(query.page) || PAGINATION.DEFAULT_PAGE, 1);

    const sort = query.sort && FILTERS.VALID_SORT_FIELDS.includes(query.sort)
      ? query.sort
      : 'createdAt';

    const order = query.order && FILTERS.VALID_SORT_ORDERS.includes(query.order)
      ? query.order
      : 'desc';

    return { limit, page, sort, order };
  }

  applyPagination(products, pagination) {
    // Ordenamiento manual (FS)
    products.sort((a, b) => {
      let aVal = a[pagination.sort];
      let bVal = b[pagination.sort];

      if (pagination.sort === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (pagination.order === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: products.length,
        pages: Math.ceil(products.length / pagination.limit),
        hasNext: endIndex < products.length,
        hasPrev: pagination.page > 1,
      },
    };
  }

  // ---------- NUEVO: listado con formato de la rúbrica ----------
  async listWithPagination({ limit = 10, page = 1, sort, query = {}, baseUrl }) {
    // Normalizar sort a asc/desc por precio (consigna)
    const priceSort = sort === 'asc' || sort === 'desc' ? sort : undefined;

    // Normalizar query permitido por consigna
    const normalizedQuery = {
      category: query.category,
      status: (query.status === 'true') ? true : (query.status === 'false') ? false : undefined,
      text: query.q || query.text || query.query
    };

    if (useMongo && typeof this.productsDAO.paginate === 'function') {
      // --- Mongo con mongoose-paginate-v2 ---
      const result = await this.productsDAO.paginate({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sort: priceSort,
        query: normalizedQuery
      });

      const { docs, totalPages, page: cur, prevPage, nextPage, hasPrevPage, hasNextPage } = result;

      const mkLink = (p) => p ? `${baseUrl}/api/products?` + new URLSearchParams({
        page: p,
        limit: Number(limit) || 10,
        sort: priceSort || '',
        category: normalizedQuery.category || '',
        status: normalizedQuery.status === undefined ? '' : String(normalizedQuery.status),
        q: normalizedQuery.text || ''
      }).toString() : null;

      return {
        status: 'success',
        payload: docs,
        totalPages,
        prevPage,
        nextPage,
        page: cur,
        hasPrevPage,
        hasNextPage,
        prevLink: mkLink(prevPage),
        nextLink: mkLink(nextPage)
      };
    }

    // --- Modo FS (legacy): respeta tu lógica previa y adapta formato ---
    const filters = this.validateFilters({
      category: query.category,
      status: query.status,
      query: normalizedQuery.text
    });
    const all = await (this.productsDAO.searchProducts
      ? this.productsDAO.searchProducts(filters)
      : this._daoGetAll());

    const pagination = this.validatePagination({
      limit: String(limit),
      page: String(page),
      sort: 'price',            // consigna: ordenar por price
      order: priceSort || 'asc' // si no mandan sort, default sin orden — acá usamos asc para determinismo
    });

    const { products, pagination: meta } = this.applyPagination(all, pagination);

    const mkLink = (p) => p ? `${baseUrl}/api/products?` + new URLSearchParams({
      page: p,
      limit: pagination.limit,
      sort: priceSort || '',
      category: filters.category || '',
      status: (filters.status === undefined) ? '' : String(filters.status),
      q: filters.query || ''
    }).toString() : null;

    return {
      status: 'success',
      payload: products,
      totalPages: meta.pages,
      prevPage: meta.hasPrev ? meta.page - 1 : null,
      nextPage: meta.hasNext ? meta.page + 1 : null,
      page: meta.page,
      hasPrevPage: meta.hasPrev,
      hasNextPage: meta.hasNext,
      prevLink: mkLink(meta.hasPrev ? meta.page - 1 : null),
      nextLink: mkLink(meta.hasNext ? meta.page + 1 : null)
    };
  }

  // ---------- Casos de uso (compatibles con tus websockets) ----------
  async getAllProducts(query = {}) {
    // Usado por WS para listar
    if (useMongo) {
      // listar sin paginado (todos)
      if (typeof this.productsDAO.getAll === 'function') {
        return this.productsDAO.getAll();
      }
    }
    // FS legacy
    const filters = this.validateFilters(query);
    const products = this.productsDAO.searchProducts
      ? await this.productsDAO.searchProducts(filters)
      : await this._daoGetAll();

    if (!query.limit && !query.page && !query.sort) {
      return products;
    }

    const pagination = this.validatePagination(query);
    return this.applyPagination(products, pagination);
  }

  async getProductById(id) {
    if (!id) {
      const error = new Error('ID de producto es requerido');
      error.statusCode = 400;
      throw error;
    }
    const product = await this._daoGetById(String(id));
    if (!product) {
      const error = new Error(`Producto con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async createProduct(productData) {
    const payload = { thumbnails: [], status: true, ...productData };
    this.validateProductData(payload);

    // Unicidad de code (además del índice unique en Mongo)
    await this.assertUniqueCode(payload.code);

    // En Mongo, el _id lo genera la DB; en FS quedaba tu id manual
    return this._daoCreate({
      ...payload,
      ...(useMongo ? {} : { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    });
  }

  async updateProduct(id, updateData) {
    if (!id) {
      const error = new Error('ID de producto es requerido');
      error.statusCode = 400;
      throw error;
    }

    const existing = await this._daoGetById(String(id));
    if (!existing) {
      const error = new Error(`Producto con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }

    const { id: _omit, _id, ...dataToUpdate } = updateData;
    if (Object.keys(dataToUpdate).length === 0) {
      const error = new Error('No hay datos para actualizar');
      error.statusCode = 400;
      throw error;
    }

    this.validateProductData(dataToUpdate, true);

    if (dataToUpdate.code && dataToUpdate.code !== existing.code) {
      await this.assertUniqueCode(dataToUpdate.code, (existing._id || existing.id));
    }

    if (!useMongo) dataToUpdate.updatedAt = new Date().toISOString();

    return this._daoUpdate(String(id), dataToUpdate);
  }

  async deleteProduct(id) {
    if (!id) {
      const error = new Error('ID de producto es requerido');
      error.statusCode = 400;
      throw error;
    }
    const deleted = await this._daoDelete(String(id));
    if (!deleted) {
      const error = new Error(`Producto con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    return deleted;
  }
}

module.exports = new ProductsService();
