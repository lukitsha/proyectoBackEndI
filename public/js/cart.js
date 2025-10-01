// Cart Manager - Sistema de carrito con localStorage
class CartManager {
    constructor() {
      this.cartId = localStorage.getItem('cartId');
      this.cart = this.loadCart();
      this.updateCartUI();
    }
  
    // Cargar carrito desde localStorage
    loadCart() {
      const cartData = localStorage.getItem('cart');
      return cartData ? JSON.parse(cartData) : { products: [] };
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
        this.cart = { products: [] }; // Resetear productos al crear nuevo carrito
        this.saveCart();
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
      if (!this.cartId) return;
  
      try {
        const response = await fetch(`/api/carts/${this.cartId}`);
        if (!response.ok) {
          // Si el carrito no existe en el backend, limpiar localStorage
          if (response.status === 404) {
            localStorage.removeItem('cartId');
            localStorage.removeItem('cart');
            this.cartId = null;
            this.cart = { products: [] };
            this.updateCartUI();
          }
          return false;
        }
  
        const data = await response.json();
        const backendCart = data.data;
        
        // Actualizar localStorage con los datos del backend
        this.cart.products = backendCart.products.map(item => ({
          id: item.product._id || item.product,
          title: item.product.title || 'Producto',
          price: item.product.price || 0,
          quantity: item.quantity
        }));
        
        this.saveCart();
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
  
      // Si no hay carrito, crear uno
      if (!this.cartId) {
        const newCartId = await this.createCart();
        if (!newCartId) return;
      } else {
        // Verificar que el carrito existe en el backend
        const exists = await this.syncWithBackend();
        if (!exists) {
          const newCartId = await this.createCart();
          if (!newCartId) return;
        }
      }
  
      // Agregar al backend
      try {
        const response = await fetch(`/api/carts/${this.cartId}/product/${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity })
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error al agregar el producto');
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
  
        // Feedback visual mejorado
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
  
        // SweetAlert2 con animación más suave
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
        const totalItems = this.cart.products.reduce((sum, p) => sum + p.quantity, 0);
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
  
        // Limpiar localStorage pero mantener el cartId
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
  
        // Recargar la página actual
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
  }
  
  // Instanciar el manager y sincronizar al cargar
  const cartManager = new CartManager();
  
  // Sincronizar con el backend al cargar la página
  document.addEventListener('DOMContentLoaded', async () => {
    if (cartManager.cartId) {
      await cartManager.syncWithBackend();
    }
  });
  
  // Funciones globales para los botones
  function addToCart(productId, title, price, stock) {
    cartManager.addProduct(productId, title, price, stock);
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
    if (cartManager.cartId) {
      window.location.href = `/carts/${cartManager.cartId}`;
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
  
  // Para la vista del carrito
  function clearCartFromView() {
    cartManager.clearCart();
  }