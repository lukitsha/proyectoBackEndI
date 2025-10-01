// Cart Manager - Sistema de carrito con localStorage y sincronización con backend
class CartManager {
    constructor() {
      this.cartId = null;
      this.cart = { products: [] };
      this.isRecreating = false;
      this.init();
    }
  
    async init() {
      // Intentar recuperar datos del localStorage
      const savedCartId = localStorage.getItem('cartId');
      const savedCart = localStorage.getItem('cart');
      
      if (savedCartId && savedCart) {
        const localCart = JSON.parse(savedCart);
        const localProductCount = localCart.products?.length || 0;
        
        // Verificar el estado del carrito en el backend
        const backendCart = await this.getCartFromBackend(savedCartId);
        
        if (backendCart) {
          const backendProductCount = backendCart.products?.length || 0;
          
          // CASO 1: Backend tiene productos - usar esos
          if (backendProductCount > 0) {
            console.log(`Backend tiene ${backendProductCount} productos, sincronizando...`);
            this.cartId = savedCartId;
            this.cart.products = [];
            
            backendCart.products.forEach(item => {
              const product = item.product;
              if (product && typeof product === 'object') {
                this.cart.products.push({
                  id: product._id || product.id,
                  title: product.title || 'Producto',
                  price: product.price || 0,
                  quantity: item.quantity || 1
                });
              }
            });
            this.saveCart();
          }
          // CASO 2: Backend vacío pero localStorage tiene productos - RECREAR
          else if (localProductCount > 0) {
            console.log(`Backend vacío pero localStorage tiene ${localProductCount} productos. Recreando...`);
            // Eliminar el cartId viejo y recrear con productos
            localStorage.removeItem('cartId');
            this.cartId = null;
            await this.recreateCartWithProducts(localCart.products);
          }
          // CASO 3: Ambos vacíos - mantener el carrito vacío
          else {
            console.log('Carrito vacío en ambos lados');
            this.cartId = savedCartId;
            this.cart = { products: [] };
          }
        } else {
          // El carrito no existe en el backend
          console.log('Carrito no existe en backend');
          if (localProductCount > 0) {
            console.log(`Recreando carrito con ${localProductCount} productos del localStorage`);
            await this.recreateCartWithProducts(localCart.products);
          } else {
            this.resetLocalStorage();
          }
        }
      } else if (savedCart) {
        // Solo hay cart pero no cartId
        const localCart = JSON.parse(savedCart);
        if (localCart.products?.length > 0) {
          console.log('No hay cartId pero hay productos, creando carrito nuevo...');
          await this.recreateCartWithProducts(localCart.products);
        } else {
          this.resetLocalStorage();
        }
      } else if (savedCartId) {
        // Solo hay cartId pero no cart - verificar con backend
        const backendCart = await this.getCartFromBackend(savedCartId);
        if (backendCart && backendCart.products?.length > 0) {
          console.log('Recuperando productos del backend');
          this.cartId = savedCartId;
          await this.syncWithBackend();
        } else {
          this.resetLocalStorage();
        }
      }
      
      this.updateCartUI();
    }
  
    // Obtener carrito del backend
    async getCartFromBackend(cartId) {
      try {
        const response = await fetch(`/api/carts/${cartId}`);
        if (!response.ok) {
          console.log(`Carrito ${cartId} no encontrado en backend (${response.status})`);
          return null;
        }
        
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error('Error obteniendo carrito del backend:', error);
        return null;
      }
    }
  
    // Recrear carrito con productos existentes
    async recreateCartWithProducts(products) {
      if (!products || products.length === 0) return;
      
      this.isRecreating = true;
      console.log(`Recreando carrito con ${products.length} productos...`);
      
      // Crear nuevo carrito
      const newCartId = await this.createCart();
      if (!newCartId) {
        console.error('No se pudo crear nuevo carrito');
        this.resetLocalStorage();
        this.isRecreating = false;
        return;
      }
      
      // Agregar cada producto al nuevo carrito
      let successCount = 0;
      let failCount = 0;
      
      for (const product of products) {
        try {
          console.log(`Agregando ${product.title} x${product.quantity}...`);
          const response = await fetch(`/api/carts/${this.cartId}/product/${product.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: product.quantity || 1 })
          });
          
          if (response.ok) {
            successCount++;
            console.log(`✓ ${product.title} agregado`);
          } else {
            failCount++;
            console.error(`✗ Error agregando ${product.title}`);
          }
        } catch (error) {
          failCount++;
          console.error(`Error agregando producto ${product.id}:`, error);
        }
      }
      
      // Sincronizar con el backend para obtener el estado final
      await this.syncWithBackend();
      
      this.isRecreating = false;
      
      if (successCount > 0) {
        Swal.fire({
          icon: 'success',
          title: 'Carrito restaurado',
          html: `Se restauraron <b>${successCount}</b> productos en tu carrito${failCount > 0 ? `<br><small>${failCount} productos no pudieron ser restaurados</small>` : ''}`,
          timer: 4000,
          showConfirmButton: false,
          background: '#2d2d2d',
          color: '#e5e5e5'
        });
      } else if (failCount > 0) {
        this.resetLocalStorage();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron restaurar los productos del carrito',
          background: '#2d2d2d',
          color: '#e5e5e5'
        });
      }
    }
  
    // Resetear localStorage
    resetLocalStorage() {
      console.log('Reseteando localStorage...');
      localStorage.removeItem('cartId');
      localStorage.removeItem('cart');
      this.cartId = null;
      this.cart = { products: [] };
    }
  
    // Guardar carrito en localStorage
    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.cart));
      if (this.cartId) {
        localStorage.setItem('cartId', this.cartId);
      }
      this.updateCartUI();
    }
  
    // Crear carrito en el backend
    async createCart() {
      try {
        const response = await fetch('/api/carts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Error al crear el carrito');
        
        const data = await response.json();
        this.cartId = data.data._id || data.data.id;
        this.cart = { products: [] };
        this.saveCart();
        console.log('✓ Nuevo carrito creado:', this.cartId);
        return this.cartId;
      } catch (error) {
        console.error('Error creating cart:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear el carrito',
          background: '#2d2d2d',
          color: '#e5e5e5'
        });
        return null;
      }
    }
  
    // Sincronizar con el backend
    async syncWithBackend() {
      if (!this.cartId) return false;
  
      try {
        const response = await fetch(`/api/carts/${this.cartId}`);
        if (!response.ok) {
          if (response.status === 404) {
            console.log('Carrito no encontrado en backend, limpiando localStorage');
            this.resetLocalStorage();
          }
          return false;
        }
  
        const data = await response.json();
        const backendCart = data.data;
        
        // Actualizar localStorage con los datos del backend
        this.cart.products = [];
        
        if (backendCart.products && backendCart.products.length > 0) {
          backendCart.products.forEach(item => {
            const product = item.product;
            if (product && typeof product === 'object') {
              this.cart.products.push({
                id: product._id || product.id,
                title: product.title || 'Producto',
                price: product.price || 0,
                quantity: item.quantity || 1
              });
            }
          });
        }
        
        this.saveCart();
        console.log(`✓ Carrito sincronizado: ${this.cart.products.length} productos`);
        return true;
      } catch (error) {
        console.error('Error syncing with backend:', error);
        return false;
      }
    }
  
    // Agregar producto al carrito
    async addProduct(productId, title, price, stock) {
      const qtyInput = document.getElementById(`qty-${productId}`);
      const quantity = parseInt(qtyInput?.value || 1);
  
      if (quantity > stock) {
        Swal.fire({
          icon: 'error',
          title: 'Stock insuficiente',
          text: `Solo hay ${stock} unidades disponibles`,
          background: '#2d2d2d',
          color: '#e5e5e5',
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });
        return;
      }
  
      // Si no hay carrito, crear uno nuevo
      if (!this.cartId) {
        const newCartId = await this.createCart();
        if (!newCartId) return;
      }
  
      // Agregar al backend
      try {
        const response = await fetch(`/api/carts/${this.cartId}/product/${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity })
        });
  
        if (!response.ok) {
          if (response.status === 404) {
            console.log('Carrito no encontrado, creando nuevo...');
            this.resetLocalStorage();
            const newCartId = await this.createCart();
            if (!newCartId) return;
            
            const retryResponse = await fetch(`/api/carts/${this.cartId}/product/${productId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantity })
            });
            
            if (!retryResponse.ok) {
              const error = await retryResponse.json();
              throw new Error(error.error || 'Error al agregar el producto');
            }
          } else {
            const error = await response.json();
            throw new Error(error.error || 'Error al agregar el producto');
          }
        }
  
        // Actualizar localStorage
        const existingProduct = this.cart.products.find(p => p.id === productId);
        if (existingProduct) {
          existingProduct.quantity += quantity;
        } else {
          this.cart.products.push({
            id: productId,
            title,
            price,
            quantity
          });
        }
        this.saveCart();
  
        // Feedback visual
        const btn = document.querySelector(`article[data-product-id="${productId}"] .btn-add-cart`);
        if (btn) {
          btn.classList.add('added');
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<span>✓</span> Agregado';
          
          setTimeout(() => {
            btn.classList.remove('added');
            btn.innerHTML = originalHTML;
          }, 2000);
        }
  
        // Reset cantidad
        if (qtyInput) qtyInput.value = 1;
  
        // Toast de éxito
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: '#2d2d2d',
          color: '#e5e5e5',
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          },
          showClass: {
            popup: 'animate__animated animate__fadeInRight'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutRight'
          }
        });
  
        Toast.fire({
          icon: 'success',
          title: `${title}`,
          html: `<small>x${quantity} agregado al carrito</small>`
        });
  
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          background: '#2d2d2d',
          color: '#e5e5e5'
        });
      }
    }
  
    // Actualizar UI del carrito
    updateCartUI() {
      const cartCount = document.getElementById('cart-count');
      if (cartCount) {
        const totalItems = this.cart?.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'block' : 'none';
      }
    }
  
    // Limpiar carrito
    async clearCart() {
      if (!this.cartId) return;
  
      const result = await Swal.fire({
        title: '¿Vaciar carrito?',
        text: 'Se eliminarán todos los productos del carrito',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#404040',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar',
        background: '#2d2d2d',
        color: '#e5e5e5'
      });
  
      if (!result.isConfirmed) return;
  
      try {
        const response = await fetch(`/api/carts/${this.cartId}`, {
          method: 'DELETE'
        });
  
        if (!response.ok) throw new Error('Error al vaciar el carrito');
  
        this.cart = { products: [] };
        this.saveCart();
        this.updateCartUI();
  
        Swal.fire({
          icon: 'success',
          title: 'Carrito vaciado',
          timer: 1500,
          showConfirmButton: false,
          background: '#2d2d2d',
          color: '#e5e5e5'
        });
  
        setTimeout(() => {
          window.location.reload();
        }, 1500);
  
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo vaciar el carrito',
          background: '#2d2d2d',
          color: '#e5e5e5'
        });
      }
    }
  
    // Eliminar un producto del carrito
    async removeProduct(productId) {
      if (!this.cartId) return;
  
      try {
        const response = await fetch(`/api/carts/${this.cartId}/products/${productId}`, {
          method: 'DELETE'
        });
  
        if (!response.ok) throw new Error('Error al eliminar el producto');
  
        this.cart.products = this.cart.products.filter(p => p.id !== productId);
        this.saveCart();
        
        return true;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
  }
  
  // Instanciar el manager
  let cartManager;
  
  // Inicializar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', async () => {
    cartManager = new CartManager();
  });
  
  // Funciones globales
  function addToCart(productId, title, price, stock) {
    if (cartManager) {
      cartManager.addProduct(productId, title, price, stock);
    }
  }
  
  function increaseQty(productId, maxStock) {
    const input = document.getElementById(`qty-${productId}`);
    const currentValue = parseInt(input.value);
    if (currentValue < maxStock) {
      input.value = currentValue + 1;
    }
  }
  
  function decreaseQty(productId) {
    const input = document.getElementById(`qty-${productId}`);
    const currentValue = parseInt(input.value);
    if (currentValue > 1) {
      input.value = currentValue - 1;
    }
  }
  
  function goToCart() {
    if (cartManager && cartManager.cartId) {
      // Si está recreando, esperar un poco
      if (cartManager.isRecreating) {
        Swal.fire({
          icon: 'info',
          title: 'Restaurando carrito',
          text: 'Por favor espera mientras se restauran tus productos...',
          timer: 3000,
          showConfirmButton: false,
          background: '#2d2d2d',
          color: '#e5e5e5'
        });
        
        setTimeout(() => {
          window.location.href = `/carts/${cartManager.cartId}`;
        }, 3000);
      } else {
        window.location.href = `/carts/${cartManager.cartId}`;
      }
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Carrito vacío',
        text: 'Agrega productos para ver tu carrito',
        background: '#2d2d2d',
        color: '#e5e5e5'
      });
    }
  }
  
  function clearCartFromView() {
    if (cartManager) {
      cartManager.clearCart();
    }
  }
  
  async function removeFromCart(cartId, productId) {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Se quitará este producto del carrito',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#404040',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#2d2d2d',
      color: '#e5e5e5'
    });
  
    if (!result.isConfirmed) return;
  
    try {
      if (cartManager) {
        await cartManager.removeProduct(productId);
      } else {
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar el producto');
      }
  
      Swal.fire({
        icon: 'success',
        title: 'Producto eliminado',
        timer: 1500,
        showConfirmButton: false,
        background: '#2d2d2d',
        color: '#e5e5e5'
      });
  
      setTimeout(() => location.reload(), 1500);
  
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el producto',
        background: '#2d2d2d',
        color: '#e5e5e5'
      });
    }
  }