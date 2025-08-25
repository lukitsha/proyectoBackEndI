const crypto = require('crypto');
const productsDAO = require('../dao/products.dao');
const { VALID_CATEGORIES, PAGINATION, FILTERS } = require('../../config/config');

class ProductsService {
  // ------------- Helpers de unicidad y validación -------------------

  async assertUniqueCode(code, excludeId = null) {
    const all = await productsDAO.getAllProducts();
    const clash = all.find(
      (p) => p.code === code && String(p.id) !== String(excludeId)
    );
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

    // status BOOLEAN (la consigna lo pide booleano)
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
        errors.push('Stock debe ser un entero mayor o igual a 0');
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

    // Validaciones específicas por categoría (tu modelo usa "specs")
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
        // si no hay category (en update parcial), no validamos específicos
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

      if (!caliber || typeof caliber !== 'string') {
        errors.push('Specs.caliber es requerido para réplicas');
      }
      if (weight === undefined || typeof weight !== 'number' || weight <= 0) {
        errors.push('Specs.weight debe ser un número mayor a 0');
      }
      if (length === undefined || typeof length !== 'number' || length <= 0) {
        errors.push('Specs.length debe ser un número mayor a 0');
      }
      if (!firingMode || typeof firingMode !== 'string') {
        errors.push('Specs.firingMode es requerido para réplicas');
      }
      if (typeof hopUp !== 'boolean') {
        errors.push('Specs.hopUp debe ser boolean');
      }
    }
  }

  validateMagazineFields(data, errors, isUpdate) {
    if (!isUpdate || data.specs !== undefined) {
      if (!data.specs || typeof data.specs !== 'object') {
        errors.push('Specs es requerido para cargadores');
        return;
      }
      const { capacity, compatibility, material } = data.specs;

      if (capacity === undefined || typeof capacity !== 'number' || capacity <= 0) {
        errors.push('Specs.capacity debe ser un número mayor a 0');
      }
      if (!compatibility || !Array.isArray(compatibility) || compatibility.length === 0) {
        errors.push('Specs.compatibility debe ser un array no vacío');
      }
      if (!material || typeof material !== 'string') {
        errors.push('Specs.material es requerido para cargadores');
      }
    }
  }

  validateBBsFields(data, errors, isUpdate) {
    if (!isUpdate || data.specs !== undefined) {
      if (!data.specs || typeof data.specs !== 'object') {
        errors.push('Specs es requerido para BBs');
        return;
      }
      const { weight, diameter, quantity, material } = data.specs;

      if (weight === undefined || typeof weight !== 'number' || weight <= 0) {
        errors.push('Specs.weight debe ser un número mayor a 0');
      }
      if (diameter === undefined || typeof diameter !== 'number' || diameter <= 0) {
        errors.push('Specs.diameter debe ser un número mayor a 0');
      }
      if (quantity === undefined || typeof quantity !== 'number' || quantity <= 0) {
        errors.push('Specs.quantity debe ser un número mayor a 0');
      }
      if (!material || typeof material !== 'string') {
        errors.push('Specs.material es requerido para BBs');
      }
    }
  }

  validateBatteryFields(data, errors, isUpdate) {
    if (!isUpdate || data.specs !== undefined) {
      if (!data.specs || typeof data.specs !== 'object') {
        errors.push('Specs es requerido para baterías');
        return;
      }
      const { voltage, capacity, chemistry, connector } = data.specs;

      if (voltage === undefined || typeof voltage !== 'number' || voltage <= 0) {
        errors.push('Specs.voltage debe ser un número mayor a 0');
      }
      if (capacity === undefined || typeof capacity !== 'number' || capacity <= 0) {
        errors.push('Specs.capacity debe ser un número mayor a 0');
      }
      if (!chemistry || typeof chemistry !== 'string') {
        errors.push('Specs.chemistry es requerido para baterías');
      }
      if (!connector || typeof connector !== 'string') {
        errors.push('Specs.connector es requerido para baterías');
      }
    }
  }

  // --- Filtros / paginación ----------------------------------------

  validateFilters(filters) {
    const validatedFilters = {};

    if (filters.category && VALID_CATEGORIES.includes(filters.category)) {
      validatedFilters.category = filters.category;
    }

    // status booleano: aceptar "true"/"false" (string) o boolean directo
    if (filters.status !== undefined) {
      if (typeof filters.status === 'boolean') {
        validatedFilters.status = filters.status;
      } else if (typeof filters.status === 'string') {
        const v = filters.status.toLowerCase();
        if (v === 'true') validatedFilters.status = true;
        if (v === 'false') validatedFilters.status = false;
      }
    }

    if (filters.minPrice !== undefined) {
      const minPrice = parseFloat(filters.minPrice);
      if (!isNaN(minPrice) && minPrice >= 0) {
        validatedFilters.minPrice = minPrice;
      }
    }

    if (filters.maxPrice !== undefined) {
      const maxPrice = parseFloat(filters.maxPrice);
      if (!isNaN(maxPrice) && maxPrice >= 0) {
        validatedFilters.maxPrice = maxPrice;
      }
    }

    if (filters.query && typeof filters.query === 'string') {
      validatedFilters.query = filters.query.trim();
    }

    return validatedFilters;
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
    // Ordenamiento
    products.sort((a, b) => {
      let aVal = a[pagination.sort];
      let bVal = b[pagination.sort];

      // Manejo especial para fechas
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

    // Paginación
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

  // --- Casos de uso -------------------------------------------------

  async getAllProducts(query = {}) {
    try {
      const filters = this.validateFilters(query);
      const products = await productsDAO.searchProducts(filters);

      if (!query.limit && !query.page && !query.sort) {
        return products;
      }

      const pagination = this.validatePagination(query);
      return this.applyPagination(products, pagination);
    } catch (error) {
      console.error('Error en getAllProducts:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      if (!id) {
        const error = new Error('ID de producto es requerido');
        error.statusCode = 400;
        throw error;
      }

      const product = await productsDAO.getProductById(String(id));

      if (!product) {
        const error = new Error(`Producto con ID ${id} no encontrado`);
        error.statusCode = 404;
        throw error;
      }

      return product;
    } catch (error) {
      console.error('Error en getProductById:', error);
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      // Completar defaults antes de validar
      const payload = {
        thumbnails: [],
        status: true, // default boolean
        ...productData,
      };

      // Validar datos
      this.validateProductData(payload);

      // Unicidad de code
      await this.assertUniqueCode(payload.code);

      // Crear producto
      const newProduct = {
        id: crypto.randomUUID(),
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return await productsDAO.createProduct(newProduct);
    } catch (error) {
      console.error('Error en createProduct:', error);
      throw error;
    }
  }

  async updateProduct(id, updateData) {
    try {
      if (!id) {
        const error = new Error('ID de producto es requerido');
        error.statusCode = 400;
        throw error;
      }

      const existingProduct = await productsDAO.getProductById(String(id));
      if (!existingProduct) {
        const error = new Error(`Producto con ID ${id} no encontrado`);
        error.statusCode = 404;
        throw error;
      }

      // Evitar actualización del ID
      const { id: _, ...dataToUpdate } = updateData;

      if (Object.keys(dataToUpdate).length === 0) {
        const error = new Error('No hay datos para actualizar');
        error.statusCode = 400;
        throw error;
      }

      // Validación parcial (update)
      this.validateProductData(dataToUpdate, true);

      // Si cambia el code, validar unicidad
      if (dataToUpdate.code && dataToUpdate.code !== existingProduct.code) {
        await this.assertUniqueCode(dataToUpdate.code, id);
      }

      dataToUpdate.updatedAt = new Date().toISOString();

      return await productsDAO.updateProduct(String(id), dataToUpdate);
    } catch (error) {
      console.error('Error en updateProduct:', error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      if (!id) {
        const error = new Error('ID de producto es requerido');
        error.statusCode = 400;
        throw error;
      }

      const deleted = await productsDAO.deleteProduct(String(id));

      if (!deleted) {
        const error = new Error(`Producto con ID ${id} no encontrado`);
        error.statusCode = 404;
        throw error;
      }

      return deleted;
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      throw error;
    }
  }
}

module.exports = new ProductsService();
