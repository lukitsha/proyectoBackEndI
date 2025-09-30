const { CartsDAO, ProductsDAO } = require('../dao/factory');
const useMongo = String(process.env.PERSISTENCE || '').toLowerCase() === 'mongo';

class CartsService {
  constructor() {
    this.cartsDAO = new CartsDAO();
    this.productsDAO = new ProductsDAO();
  }

  // ---------- helpers DAO ----------
  async _daoCartGetById(id) {
    if (typeof this.cartsDAO.getById === 'function') return this.cartsDAO.getById(id);
    if (typeof this.cartsDAO.getCartById === 'function') return this.cartsDAO.getCartById(id);
    return null;
  }

  // ---------- básicos ----------
  async createCart() {
    if (typeof this.cartsDAO.create === 'function') return this.cartsDAO.create();
    // fallback FS
    if (typeof this.cartsDAO.createCart === 'function') {
      return this.cartsDAO.createCart({
        id: crypto.randomUUID(),
        products: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    throw new Error('DAO no soporta createCart');
  }

  async getCartById(id) {
    if (!id) {
      const error = new Error('ID de carrito es requerido');
      error.statusCode = 400;
      throw error;
    }
    const cart = await this._daoCartGetById(String(id));
    if (!cart) {
      const error = new Error(`Carrito con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    return cart;
  }

  // ---------- NUEVO: GET con populate ----------
  async getPopulated(id) {
    if (!id) {
      const error = new Error('ID de carrito es requerido');
      error.statusCode = 400;
      throw error;
    }
    if (useMongo && typeof this.cartsDAO.getPopulated === 'function') {
      const cart = await this.cartsDAO.getPopulated(id);
      if (!cart) {
        const error = new Error(`Carrito con ID ${id} no encontrado`);
        error.statusCode = 404;
        throw error;
      }
      return cart;
    }
    // FS fallback: emular detalle
    const cart = await this.getCartById(id);
    const productsWithDetails = await Promise.all(
      (cart.products || []).map(async (item) => {
        const prod = await (this.productsDAO.getById ? this.productsDAO.getById(item.product)
          : this.productsDAO.getProductById(item.product));
        return { product: prod || { id: item.product, title: 'Producto no encontrado', price: 0 }, quantity: item.quantity };
      })
    );
    return { ...cart, products: productsWithDetails };
  }

  // ---------- Añadir producto (se reutiliza para ambos modos) ----------
  async addProductToCart(cartId, productId, quantity = 1) {
    if (!cartId) {
      const error = new Error('ID de carrito es requerido');
      error.statusCode = 400;
      throw error;
    }
    if (!productId) {
      const error = new Error('ID de producto es requerido');
      error.statusCode = 400;
      throw error;
    }
    if (quantity <= 0) {
      const error = new Error('La cantidad debe ser mayor a 0');
      error.statusCode = 400;
      throw error;
    }

    const cart = await this._daoCartGetById(String(cartId));
    if (!cart) {
      const error = new Error(`Carrito con ID ${cartId} no encontrado`);
      error.statusCode = 404;
      throw error;
    }

    const product = await (this.productsDAO.getById ? this.productsDAO.getById(String(productId))
      : this.productsDAO.getProductById(String(productId)));
    if (!product) {
      const error = new Error(`Producto con ID ${productId} no encontrado`);
      error.statusCode = 404;
      throw error;
    }

    // reglas de stock / status
    if (product.stock === 0) {
      const error = new Error(`Producto ${product.title} sin stock disponible`);
      error.statusCode = 400;
      throw error;
    }
    if (product.status === false) {
      const error = new Error(`Producto ${product.title} no está disponible`);
      error.statusCode = 400;
      throw error;
    }

    // construir nuevo arreglo
    const current = Array.isArray(cart.products) ? cart.products.map(p => ({
      product: String(p.product || p.id || p._id),
      quantity: Number(p.quantity) || 1
    })) : [];

    const idx = current.findIndex(it => String(it.product) === String(productId));
    let newQty = quantity;
    if (idx >= 0) {
      newQty = current[idx].quantity + quantity;
    }

    if (newQty > (product.stock || 0)) {
      const error = new Error(`Stock insuficiente. Disponible: ${product.stock}, solicitado: ${newQty}`);
      error.statusCode = 400;
      throw error;
    }

    if (idx >= 0) current[idx].quantity = newQty;
    else current.push({ product: String(productId), quantity });

    // persistir
    if (useMongo && typeof this.cartsDAO.replaceProducts === 'function') {
      return this.cartsDAO.replaceProducts(String(cartId), current);
    }
    // FS fallback
    if (typeof this.cartsDAO.addProductToCart === 'function') {
      return this.cartsDAO.addProductToCart(String(cartId), String(productId), quantity);
    }
    throw new Error('DAO no soporta la operación addProductToCart');
  }

  // ---------- Entrega Final: endpoints nuevos ----------

  // DELETE /api/carts/:cid/products/:pid
  async removeProduct(cid, pid) {
    await this.getCartById(cid); // valida existencia
    if (useMongo && typeof this.cartsDAO.pullProduct === 'function') {
      return this.cartsDAO.pullProduct(String(cid), String(pid));
    }
    // FS fallback
    if (typeof this.cartsDAO.removeProductFromCart === 'function') {
      return this.cartsDAO.removeProductFromCart(String(cid), String(pid));
    }
    // genérico: recomponer arreglo
    const cart = await this._daoCartGetById(String(cid));
    cart.products = (cart.products || []).filter(p => String(p.product) !== String(pid));
    if (typeof this.cartsDAO.replaceProducts === 'function') {
      return this.cartsDAO.replaceProducts(String(cid), cart.products);
    }
    return cart;
  }

  // PUT /api/carts/:cid  (reemplazar todos los productos)
  async replaceAll(cid, productsArray) {
    await this.getCartById(cid); // valida existencia

    // Normalizar y validar cantidades
    const normalized = (productsArray || []).map(p => ({
      product: String(p.product),
      quantity: Math.max(1, Number(p.quantity) || 1)
    }));

    // Validar stock/estado
    for (const item of normalized) {
      const prod = await (this.productsDAO.getById ? this.productsDAO.getById(item.product)
        : this.productsDAO.getProductById(item.product));
      if (!prod) {
        const e = new Error(`Producto ${item.product} no existe`);
        e.statusCode = 400;
        throw e;
      }
      if (prod.status === false) {
        const e = new Error(`Producto ${prod.title} no está disponible`);
        e.statusCode = 400;
        throw e;
      }
      if (item.quantity > (prod.stock || 0)) {
        const e = new Error(`Stock insuficiente para ${prod.title}. Disponible: ${prod.stock}, solicitado: ${item.quantity}`);
        e.statusCode = 400;
        throw e;
      }
    }

    if (useMongo && typeof this.cartsDAO.replaceProducts === 'function') {
      return this.cartsDAO.replaceProducts(String(cid), normalized);
    }
    // FS fallback
    if (typeof this.cartsDAO.replaceAllProducts === 'function') {
      return this.cartsDAO.replaceAllProducts(String(cid), normalized);
    }
    // genérico
    const cart = await this._daoCartGetById(String(cid));
    cart.products = normalized;
    return cart;
  }

  // PUT /api/carts/:cid/products/:pid  (actualizar SOLO cantidad)
  async updateQty(cid, pid, qty) {
    await this.getCartById(cid); // valida existencia

    const quantity = Number(qty);
    if (!Number.isFinite(quantity) || quantity < 1) {
      // si piden 0 o negativo, elimina el ítem
      return this.removeProduct(cid, pid);
    }

    const prod = await (this.productsDAO.getById ? this.productsDAO.getById(String(pid))
      : this.productsDAO.getProductById(String(pid)));
    if (!prod) {
      const e = new Error(`Producto ${pid} no existe`);
      e.statusCode = 400;
      throw e;
    }
    if (quantity > (prod.stock || 0)) {
      const e = new Error(`Stock insuficiente. Disponible: ${prod.stock}, solicitado: ${quantity}`);
      e.statusCode = 400;
      throw e;
    }

    if (useMongo && typeof this.cartsDAO.setQuantity === 'function') {
      return this.cartsDAO.setQuantity(String(cid), String(pid), quantity);
    }
    // FS fallback
    if (typeof this.cartsDAO.updateProductQuantity === 'function') {
      return this.cartsDAO.updateProductQuantity(String(cid), String(pid), quantity);
    }
    // genérico
    const cart = await this._daoCartGetById(String(cid));
    const idx = (cart.products || []).findIndex(p => String(p.product) === String(pid));
    if (idx === -1) {
      cart.products.push({ product: String(pid), quantity });
    } else {
      cart.products[idx].quantity = quantity;
    }
    if (typeof this.cartsDAO.replaceProducts === 'function') {
      return this.cartsDAO.replaceProducts(String(cid), cart.products);
    }
    return cart;
  }

  // DELETE /api/carts/:cid  (vaciar carrito)
  async clear(cid) {
    await this.getCartById(cid); // valida existencia
    if (useMongo && typeof this.cartsDAO.clear === 'function') {
      return this.cartsDAO.clear(String(cid));
    }
    // FS fallback
    if (typeof this.cartsDAO.deleteCart === 'function') {
      // si tu FS realmente “elimina” el carrito, y no lo vacía, podrías querer
      // implementar cartsDAO.clearCart en FS; por ahora dejamos reemplazo:
      return this.replaceAll(String(cid), []);
    }
    // genérico
    const cart = await this._daoCartGetById(String(cid));
    cart.products = [];
    return cart;
  }

  // ---------- Extras compatibles con tu código existente ----------
  async getCartWithProductDetails(id) {
    // Mantengo este helper para tu summary/WS si lo usabas
    const cart = await this.getPopulated(id);
    // En Mongo ya viene “product” poblado; en FS ya resolvimos arriba
    return cart;
  }

  async getCartSummary(cartId) {
    const cart = await this.getPopulated(cartId);

    let totalProducts = 0;
    let totalAmount = 0;

    (cart.products || []).forEach((item) => {
      const price = item.product?.price || 0;
      totalProducts += item.quantity;
      totalAmount += price * item.quantity;
    });

    // Compatibilidad de IDs
    const cartIdOut = String(cart._id || cart.id);

    return {
      id: cartIdOut,
      totalProducts,
      totalAmount: Math.round(totalAmount * 100) / 100,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      products: cart.products,
    };
  }
}

module.exports = new CartsService();
