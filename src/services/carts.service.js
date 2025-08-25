const crypto = require('crypto');
const cartsDAO = require('../dao/carts.dao');
const productsDAO = require('../dao/products.dao');

class CartsService {
  async createCart() {
    try {
      const newCart = {
        id: crypto.randomUUID(),
        products: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return await cartsDAO.createCart(newCart);
    } catch (error) {
      console.error('Error en createCart:', error);
      throw error;
    }
  }

  async getCartById(id) {
    try {
      if (!id) {
        const error = new Error('ID de carrito es requerido');
        error.statusCode = 400;
        throw error;
      }

      const cart = await cartsDAO.getCartById(String(id));
      if (!cart) {
        const error = new Error(`Carrito con ID ${id} no encontrado`);
        error.statusCode = 404;
        throw error;
      }

      return cart;
    } catch (error) {
      console.error('Error en getCartById:', error);
      throw error;
    }
  }

  async getCartWithProductDetails(id) {
    try {
      const cart = await this.getCartById(id);

      const productsWithDetails = await Promise.all(
        cart.products.map(async (item) => {
          const product = await productsDAO.getProductById(item.product);
          return {
            product: product || { id: item.product, title: 'Producto no encontrado', price: 0 },
            quantity: item.quantity,
          };
        })
      );

      return {
        ...cart,
        products: productsWithDetails,
      };
    } catch (error) {
      console.error('Error en getCartWithProductDetails:', error);
      throw error;
    }
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    try {
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

      const cart = await cartsDAO.getCartById(String(cartId));
      if (!cart) {
        const error = new Error(`Carrito con ID ${cartId} no encontrado`);
        error.statusCode = 404;
        throw error;
      }

      const product = await productsDAO.getProductById(String(productId));
      if (!product) {
        const error = new Error(`Producto con ID ${productId} no encontrado`);
        error.statusCode = 404;
        throw error;
      }

      // stock
      if (product.stock === 0) {
        const error = new Error(`Producto ${product.title} sin stock disponible`);
        error.statusCode = 400;
        throw error;
      }

      // disponibilidad por status booleano
      if (!product.status) {
        const error = new Error(`Producto ${product.title} no está disponible`);
        error.statusCode = 400;
        throw error;
      }

      if (quantity <= 0) {
        const error = new Error('La cantidad debe ser mayor a 0');
        error.statusCode = 400;
        throw error;
      }

      const existingItem = cart.products.find(
        (item) => item.product === String(productId)
      );
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const newTotalQuantity = currentQuantity + quantity;

      if (newTotalQuantity > product.stock) {
        const error = new Error(
          `Stock insuficiente. Disponible: ${product.stock}, solicitado: ${newTotalQuantity}`
        );
        error.statusCode = 400;
        throw error;
      }

      return await cartsDAO.addProductToCart(
        String(cartId),
        String(productId),
        quantity
      );
    } catch (error) {
      console.error('Error en addProductToCart:', error);
      throw error;
    }
  }

  async removeProductFromCart(cartId, productId) {
    try {
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

      const cart = await cartsDAO.getCartById(String(cartId));
      if (!cart) {
        const error = new Error(`Carrito con ID ${cartId} no encontrado`);
        error.statusCode = 404;
        throw error;
      }

      return await cartsDAO.removeProductFromCart(
        String(cartId),
        String(productId)
      );
    } catch (error) {
      console.error('Error en removeProductFromCart:', error);
      throw error;
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
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

      const cart = await cartsDAO.getCartById(String(cartId));
      if (!cart) {
        const error = new Error(`Carrito con ID ${cartId} no encontrado`);
        error.statusCode = 404;
        throw error;
      }

      // Si quantity <= 0, eliminamos ítem
      if (quantity <= 0) {
        return await this.removeProductFromCart(cartId, productId);
      }

      const product = await productsDAO.getProductById(String(productId));
      if (product && quantity > product.stock) {
        const error = new Error(
          `Stock insuficiente. Disponible: ${product.stock}, solicitado: ${quantity}`
        );
        error.statusCode = 400;
        throw error;
      }

      return await cartsDAO.updateProductQuantity(
        String(cartId),
        String(productId),
        quantity
      );
    } catch (error) {
      console.error('Error en updateProductQuantity:', error);
      throw error;
    }
  }

  async deleteCart(cartId) {
    try {
      if (!cartId) {
        const error = new Error('ID de carrito es requerido');
        error.statusCode = 400;
        throw error;
      }

      const deleted = await cartsDAO.deleteCart(String(cartId));
      if (!deleted) {
        const error = new Error(`Carrito con ID ${cartId} no encontrado`);
        error.statusCode = 404;
        throw error;
      }

      return deleted;
    } catch (error) {
      console.error('Error en deleteCart:', error);
      throw error;
    }
  }

  async getCartSummary(cartId) {
    try {
      const cartWithDetails = await this.getCartWithProductDetails(cartId);

      let totalProducts = 0;
      let totalAmount = 0;

      cartWithDetails.products.forEach((item) => {
        totalProducts += item.quantity;
        totalAmount += (item.product.price || 0) * item.quantity;
      });

      return {
        id: cartWithDetails.id,
        totalProducts,
        totalAmount: Math.round(totalAmount * 100) / 100,
        createdAt: cartWithDetails.createdAt,
        updatedAt: cartWithDetails.updatedAt,
        products: cartWithDetails.products,
      };
    } catch (error) {
      console.error('Error en getCartSummary:', error);
      throw error;
    }
  }
}

module.exports = new CartsService();
