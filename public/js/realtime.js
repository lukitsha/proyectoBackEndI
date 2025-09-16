/* public/js/realtime.js */

/* ------------------ Helpers de red ------------------ */
async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  let body = null;
  try { body = await res.json(); } catch (_) {}
  if (!res.ok) {
    const msg = (body && (body.message || body.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

// Intenta normalizar cualquier forma de respuesta del API
function extractProducts(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  return (
    payload.payload?.docs ??
    payload.payload ??
    payload.data ??
    payload.products ??
    []
  );
}

/* ------------------ Carga inicial y refresco ------------------ */
async function loadAndRenderProducts() {
  try {
    const raw = await fetchJSON('/api/products');
    const products = extractProducts(raw).map(p => ({
      ...p,
      _id: p._id || p.id,
      category: (p.category || 'general').toLowerCase(),
    }));
    renderProducts(products);
  } catch (err) {
    console.error('Error al cargar productos:', err);
    showToast(`Error al cargar: ${err.message}`, 'error');
    renderProducts([]); // muestra empty state
  }
}

/* ------------------ Submit: Crear ------------------ */
function wireCreateForm() {
  const form = document.getElementById('ws-create-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = prepareFormData(form);

      // Validaciones mínimas por las dudas
      if (!data.title || data.title.trim().length < 3) throw new Error('Título inválido');
      if (!data.code) throw new Error('Código es obligatorio');
      if (!data.category || !['replicas','magazines','bbs','batteries'].includes(data.category))
        throw new Error('Categoría inválida');
      if (!(data.price > 0)) throw new Error('Precio debe ser > 0');
      if (data.stock == null || data.stock < 0) throw new Error('Stock inválido');

      await fetchJSON('/api/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      showToast('✨ Producto creado exitosamente!', 'success');
      form.reset();

      // Oculta specs dinámicos hasta elegir categoría otra vez
      const specs = document.getElementById('specs-container');
      const dyn = document.getElementById('dynamic-specs');
      if (specs && dyn) { specs.style.display = 'none'; dyn.innerHTML = ''; }

      await loadAndRenderProducts();
    } catch (err) {
      console.error('Error al crear:', err);
      showToast(`No se pudo crear: ${err.message}`, 'error');
    }
  });
}

/* ------------------ Submit: Eliminar ------------------ */
function wireDeleteForm() {
  const form = document.getElementById('ws-delete-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = (form.id || form.deleteId || {}).value || document.getElementById('deleteId')?.value;
    if (!id) { showToast('Ingresá un ID', 'error'); return; }

    try {
      await fetchJSON(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
      showToast('🗑️ Producto eliminado exitosamente!', 'success');
      form.reset();
      await loadAndRenderProducts();
    } catch (err) {
      console.error('Error al eliminar:', err);
      showToast(`No se pudo eliminar: ${err.message}`, 'error');
    }
  });
}

/* ------------------ Socket.IO (opcional, si existe) ------------------ */
function tryWireSockets() {
  if (typeof io !== 'function') return; // no está socket.io en la página
  try {
    const socket = io();

    socket.on('connect', () => {
      // Opcional: podrías avisar conectado
      console.log('✅ Conectado al servidor via Socket.IO');
    });

    // Algunas convenciones típicas
    socket.on('users:count', (n) => {
      const el = document.getElementById('usersCount');
      if (el && Number.isFinite(n)) el.textContent = n;
    });
    socket.on('userCount', (n) => {
      const el = document.getElementById('usersCount');
      if (el && Number.isFinite(n)) el.textContent = n;
    });

    // Cuando el servidor indique que cambió algo, refrescamos
    ['products:changed','products:update','products:updated','products:list'].forEach(evt => {
      socket.on(evt, (data) => {
        if (data && Array.isArray(data)) {
          // Si el servidor envía directamente los productos
          const products = extractProducts(data).map(p => ({
            ...p,
            _id: p._id || p.id,
            category: (p.category || 'general').toLowerCase(),
          }));
          renderProducts(products);
        } else {
          // Si no, refrescamos desde la API
          loadAndRenderProducts();
        }
      });
    });

    socket.on('ws:error', (message) => {
      showToast(message, 'error');
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor');
    });

  } catch (err) {
    console.warn('Socket.IO no disponible:', err.message);
  }
}

/* ==================== NUEVAS FUNCIONES MEJORADAS ==================== */

/* ------------------ Función para copiar ID al portapapeles ------------------ */
function copyProductId(id) {
  // Crear input temporal
  const tempInput = document.createElement('input');
  tempInput.value = id;
  document.body.appendChild(tempInput);
  tempInput.select();
  
  try {
    // Ejecutar comando de copiar
    document.execCommand('copy');
    
    // Buscar el botón que fue clickeado
    const btn = event.target.closest('.copy-id-btn');
    if (btn) {
      // Guardar HTML original
      const originalHTML = btn.innerHTML;
      
      // Cambiar a check mark
      btn.innerHTML = '✓';
      btn.classList.add('copied');
      
      // Restaurar después de 2 segundos
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('copied');
      }, 2000);
    }
    
    // Mostrar toast de éxito
    showToast(`ID ${id} copiado al portapapeles!`, 'success');
    
    // También llenar automáticamente el campo de eliminar
    const deleteInput = document.getElementById('deleteId');
    if (deleteInput) {
      deleteInput.value = id;
      // Highlight temporal
      deleteInput.style.border = '2px solid #16a34a';
      deleteInput.style.boxShadow = '0 0 10px rgba(22, 163, 74, 0.3)';
      
      setTimeout(() => {
        deleteInput.style.border = '';
        deleteInput.style.boxShadow = '';
      }, 1500);
    }
    
  } catch (err) {
    console.error('Error al copiar:', err);
    showToast('Error al copiar ID', 'error');
  }
  
  // Limpiar
  document.body.removeChild(tempInput);
}

/* ------------------ Render tarjetas MEJORADO con nueva estructura ------------------ */
function firstDefined(...vals){ return vals.find(v => v != null); }

window.renderProducts = function renderProducts(products){
  const list = document.getElementById('products-list');
  const empty = document.getElementById('empty-state');
  if (!list || !empty) return;

  if (!products || !products.length){
    list.style.display = 'none';
    empty.style.display = 'flex'; // cambiar a flex para centrar mejor
    return;
  }

  list.style.display = 'grid';
  empty.style.display = 'none';

  const html = products.map(p => {
    const id = p._id || p.id || '';
    const cat = (p.category || 'general').toLowerCase();
    const price = Number(p.price || 0).toFixed(2);
    const stock = Number(p.stock || 0);
    const stockClass = stock === 0 ? 'out' : (stock <= 10 ? 'low' : '');
    const img = Array.isArray(p.thumbnails) && p.thumbnails[0]
      ? `<img src="${p.thumbnails[0]}" alt="${p.title || ''}">`
      : '<div style="font-size:2.2rem;color:#525252">🎯</div>';

    // Specs destacados por categoría 
    const s = p.specs || {};
    let ordered = [];
    if (cat === 'replicas') {
      ordered = [
        ['Calibre', s.caliber],
        ['Peso', s.weight ? `${s.weight}kg` : undefined],
        ['Longitud', s.length ? `${s.length}cm` : undefined],
        ['Modo', s.firingMode],
        ['Hop-Up', s.hopUp != null ? (s.hopUp ? 'Sí' : 'No') : undefined],
      ];
    } else if (cat === 'magazines') {
      ordered = [
        ['Capacidad', s.capacity],
        ['Material', s.material],
        ['Compatible', Array.isArray(s.compatibility) ? s.compatibility.join(', ') : s.compatibility],
      ];
    } else if (cat === 'bbs') {
      ordered = [
        ['Peso', s.weight ? `${s.weight}g` : undefined],
        ['Diámetro', s.diameter ? `${s.diameter}mm` : undefined],
        ['Cantidad', s.quantity],
        ['Material', s.material],
      ];
    } else if (cat === 'batteries') {
      ordered = [
        ['Voltaje', s.voltage ? `${s.voltage}V` : undefined],
        ['Capacidad', s.capacity ? `${s.capacity}mAh` : undefined],
        ['Química', s.chemistry],
        ['Conector', s.connector],
      ];
    } else {
      // general: mostrar primeros 4 cualquiera
      ordered = Object.entries(s).slice(0,4);
    }

    const specChips = ordered
      .filter(([_, v]) => v !== undefined && v !== null && String(v).trim() !== '')
      .slice(0, 4)
      .map(([k, v]) => `<span class="spec"><strong>${k}:</strong> ${v}</span>`)
      .join('');

    // NUEVA ESTRUCTURA CON ID EN MÚLTIPLES LÍNEAS
  return `
  <article class="card" data-product-id="${id}">
    <!-- Header con ID en múltiples líneas -->
    <div class="card-header">
      <div class="pid">
        <span class="pid-label">ID:</span>
        <span class="pid-value">${id}</span>
        <button class="copy-id-btn" onclick="copyProductId('${id}')" title="Copiar ID">
          📋 Copiar
        </button>
      </div>
      <span class="cat">${cat}</span>
    </div>

    <!-- Contenido principal -->
    <div class="card-content">
      <div class="thumb">${img}</div>
      <h3 class="title">${(p.title || 'Sin título')}</h3>
      <p class="desc">${(p.description || 'Sin descripción')}</p>
      ${ specChips ? `<div class="specs">${specChips}</div>` : '' }
    </div>

    <!-- Footer con precio, stock y acciones -->
    <div class="card-footer">
      <span class="price">$${price}</span>
      <div class="actions">
        <span class="stock ${stockClass}">Stock: ${stock}</span>
        <button class="delete-btn" onclick="deleteProduct('${id}')">Eliminar</button>
      </div>
    </div>
  </article>
  `;
  }).join('');

  list.innerHTML = html;
};

/* ------------------ Eliminar producto MEJORADO con auto-fill ------------------ */
window.deleteProduct = async function deleteProduct(id){
  if (!id) return;
  
  // Auto-fill del campo de ID
  const deleteInput = document.getElementById('deleteId');
  if (deleteInput) {
    deleteInput.value = id;
    // Highlight temporal del input
    deleteInput.style.border = '2px solid #dc2626';
    deleteInput.style.boxShadow = '0 0 10px rgba(220, 38, 38, 0.5)';
    
    // Scroll al formulario de eliminar
    deleteInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
      deleteInput.style.border = '';
      deleteInput.style.boxShadow = '';
    }, 1500);
  }
  
  // Confirmación mejorada
  if (!confirm(`¿Estás seguro de eliminar el producto con ID:\n${id}?`)) return;
  
  try {
    await fetchJSON(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    showToast('🗑️ Producto eliminado exitosamente!', 'success');
    await loadAndRenderProducts();
  } catch (err) {
    showToast(`No se pudo eliminar: ${err.message}`, 'error');
  }
};

/* ------------------ Función toast mejorada ------------------ */
window.showToast = function showToast(message, type = 'info') {
  // Verificar si ya existe el contenedor
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Icono según tipo
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  
  toast.innerHTML = `<span>${icon}</span> ${message}`;
  container.appendChild(toast);
  
  // Auto-remover después de 3 segundos
  setTimeout(() => {
    toast.style.animation = 'slideInRight .3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

/* ------------------ Función prepareFormData  ------------------ */
window.prepareFormData = function prepareFormData(form) {
  const formData = new FormData(form);
  const data = {};
  
  // Procesar campos base
  for (let [key, value] of formData.entries()) {
    // Convertir números
    if (key === 'price' || key === 'stock') {
      data[key] = Number(value);
    }
    // Checkbox status
    else if (key === 'status') {
      data[key] = form.status.checked;
    }
    // Thumbnails como array
    else if (key === 'thumbnails' && value) {
      data[key] = [value];
    }
    // Campos normales (excepto specs)
    else if (value && !['caliber', 'weight', 'length', 'firingMode', 'hopUp', 
                        'capacity', 'compatibility', 'material', 'diameter', 
                        'quantity', 'voltage', 'chemistry', 'connector'].includes(key)) {
      data[key] = value;
    }
  }
  
  // Procesar specs según categoría
  const category = data.category;
  if (category) {
    data.specs = {};
    
    switch(category) {
      case 'replicas':
        data.specs.caliber = formData.get('caliber');
        data.specs.weight = Number(formData.get('weight'));
        data.specs.length = Number(formData.get('length'));
        data.specs.firingMode = formData.get('firingMode');
        data.specs.hopUp = form.hopUp ? form.hopUp.checked : false;
        break;
        
      case 'magazines':
        data.specs.capacity = Number(formData.get('capacity'));
        data.specs.material = formData.get('material');
        const comp = formData.get('compatibility');
        data.specs.compatibility = comp ? comp.split(',').map(c => c.trim()).filter(Boolean) : [];
        break;
        
      case 'bbs':
        data.specs.weight = Number(formData.get('weight'));
        data.specs.diameter = Number(formData.get('diameter'));
        data.specs.quantity = Number(formData.get('quantity'));
        data.specs.material = formData.get('material');
        break;
        
      case 'batteries':
        data.specs.voltage = Number(formData.get('voltage'));
        data.specs.capacity = Number(formData.get('capacity'));
        data.specs.chemistry = formData.get('chemistry');
        data.specs.connector = formData.get('connector');
        break;
    }
  }
  
  return data;
};

/* ------------------ Exponer funciones globalmente ------------------ */
window.copyProductId = copyProductId;
window.loadAndRenderProducts = loadAndRenderProducts;

/* ------------------ Inicio ------------------ */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Realtime Products iniciado');
  
  wireCreateForm();
  wireDeleteForm();
  tryWireSockets();
  loadAndRenderProducts();
  
  // Inicializar los specs dinámicos si existen
  const categorySelect = document.getElementById('category');
  if (categorySelect && window.categorySpecs) {
    categorySelect.addEventListener('change', function(e) {
      const box = document.getElementById('specs-container');
      const dyn = document.getElementById('dynamic-specs');
      if (e.target.value && window.categorySpecs[e.target.value]) {
        box.style.display = 'block';
        dyn.innerHTML = window.categorySpecs[e.target.value];
      } else {
        box.style.display = 'none';
        dyn.innerHTML = '';
      }
    });
  }
});