const fs = require('fs/promises');
const path = require('path');
const { PRODUCTS_FILE, DATA_DIR } = require('../../config/config');

class ProductsDAO {
  
  async ensureDataDir() {
    try {
      await fs.access(DATA_DIR);
    } catch (error) {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  async readProducts() {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw new Error(`Error leyendo productos: ${error.message}`);
    }
  }

  async writeProducts(products) {
    try {
      await this.ensureDataDir();
      await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Error escribiendo productos: ${error.message}`);
    }
  }

  async getAllProducts() {
    return await this.readProducts();
  }

  async getProductById(id) {
    const products = await this.readProducts();
    return products.find(product => product.id === String(id));
  }

  async createProduct(productData) {
    const products = await this.readProducts();
    products.push(productData);
    await this.writeProducts(products);
    return productData;
  }

  async updateProduct(id, updateData) {
    const products = await this.readProducts();
    const index = products.findIndex(product => product.id === String(id));
    
    if (index === -1) {
      return null;
    }

    products[index] = { ...products[index], ...updateData };
    await this.writeProducts(products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.readProducts();
    const index = products.findIndex(product => product.id === String(id));
    
    if (index === -1) {
      return null;
    }

    const deleted = products.splice(index, 1)[0];
    await this.writeProducts(products);
    return deleted;
  }

  async getProductsByCategory(category) {
    const products = await this.readProducts();
    return products.filter(product => product.category === category);
  }

  async searchProducts(filters) {
    const products = await this.readProducts();
    let filtered = [...products];

    // Filtro por categoría
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Filtro por estado
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Filtro por rango de precio
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }

    // Búsqueda de texto en título y descripción
    if (filters.query) {
      const searchTerm = filters.query.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }
}

module.exports = new ProductsDAO();