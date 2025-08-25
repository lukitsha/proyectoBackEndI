const fs = require('fs/promises');
const path = require('path');
const { CARTS_FILE, DATA_DIR } = require('../../config/config');

class CartsDAO {
  
  async ensureDataDir() {
    try {
      await fs.access(DATA_DIR);
    } catch (error) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  async readCarts() {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(CARTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw new Error(`Error leyendo carritos: ${error.message}`);
    }
  }

  async writeCarts(carts) {
    try {
      await this.ensureDataDir();
      await fs.writeFile(CARTS_FILE, JSON.stringify(carts, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Error escribiendo carritos: ${error.message}`);
    }
  }

  async getAllCarts() {
    return await this.readCarts();
  }

  async getCartById(id) {
    const carts = await this.readCarts();
    return carts.find(cart => cart.id === String(id));
  }

  async createCart(cartData) {
    const carts = await this.readCarts();
    carts.push(cartData);
    await this.writeCarts(carts);
    return cartData;
  }

  async updateCart(id, updateData) {
    const carts = await this.readCarts();
    const index = carts.findIndex(cart => cart.id === String(id));
    
    if (index === -1) {
      return null;
    }

    carts[index] = { ...carts[index], ...updateData };
    await this.writeCarts(carts);
    return carts[index];
  }

  async deleteCart(id) {
    const carts = await this.readCarts();
    const index = carts.findIndex(cart => cart.id === String(id));
    
    if (index === -1) {
      return null;
    }

    const deleted = carts.splice(index, 1)[0];
    await this.writeCarts(carts);
    return deleted;
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    const carts = await this.readCarts();
    const cartIndex = carts.findIndex(cart => cart.id === String(cartId));
    
    if (cartIndex === -1) {
      return null;
    }

    const cart = carts[cartIndex];
    const existingProductIndex = cart.products.findIndex(
      item => item.product === String(productId)
    );

    if (existingProductIndex >= 0) {
      // Si el producto ya existe, incrementar cantidad
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      // Si no existe, agregarlo
      cart.products.push({
        product: String(productId),
        quantity
      });
    }

    cart.updatedAt = new Date().toISOString();
    await this.writeCarts(carts);
    return cart;
  }

  async removeProductFromCart(cartId, productId) {
    const carts = await this.readCarts();
    const cartIndex = carts.findIndex(cart => cart.id === String(cartId));
    
    if (cartIndex === -1) {
      return null;
    }

    const cart = carts[cartIndex];
    const productIndex = cart.products.findIndex(
      item => item.product === String(productId)
    );

    if (productIndex === -1) {
      return cart;
    }

    cart.products.splice(productIndex, 1);
    cart.updatedAt = new Date().toISOString();
    await this.writeCarts(carts);
    return cart;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const carts = await this.readCarts();
    const cartIndex = carts.findIndex(cart => cart.id === String(cartId));
    
    if (cartIndex === -1) {
      return null;
    }

    const cart = carts[cartIndex];
    const productIndex = cart.products.findIndex(
      item => item.product === String(productId)
    );

    if (productIndex === -1) {
      return cart;
    }

    if (quantity <= 0) {
      cart.products.splice(productIndex, 1);
    } else {
      cart.products[productIndex].quantity = quantity;
    }

    cart.updatedAt = new Date().toISOString();
    await this.writeCarts(carts);
    return cart;
  }
}

module.exports = new CartsDAO();