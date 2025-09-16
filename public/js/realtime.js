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

      showToast('Producto creado', 'success');
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
      showToast('Producto eliminado', 'success');
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
    ['products:changed','products:update','products:updated'].forEach(evt => {
      socket.on(evt, () => loadAndRenderProducts());
    });
  } catch (err) {
    console.warn('Socket.IO no disponible:', err.message);
  }
}

/* ------------------ Render tarjetas estilo Home ------------------ */
function firstDefined(...vals){ return vals.find(v => v != null); }

window.renderProducts = function renderProducts(products){
  const list = document.getElementById('products-list');
  const empty = document.getElementById('empty-state');
  if (!list || !empty) return;

  if (!products || !products.length){
    list.style.display = 'none';
    empty.style.display = 'block';
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
      : ''; // sin "•" ni emojis para que no aparezca el puntito

    // Specs destacados por categoría (ordenados bonito)
    const s = p.specs || {};
    let ordered = [];
    if (cat === 'replicas') {
      ordered = [
        ['caliber', s.caliber],
        ['weight', s.weight],
        ['length', s.length],
        ['firingMode', s.firingMode],
        ['hopUp', s.hopUp != null ? (s.hopUp ? 'true' : 'false') : undefined],
      ];
    } else if (cat === 'magazines') {
      ordered = [
        ['capacity', s.capacity],
        ['material', s.material],
        ['compatibility', Array.isArray(s.compatibility) ? s.compatibility.join(', ') : s.compatibility],
      ];
    } else if (cat === 'bbs') {
      ordered = [
        ['weight', s.weight],
        ['diameter', s.diameter],
        ['quantity', s.quantity],
        ['material', s.material],
      ];
    } else if (cat === 'batteries') {
      ordered = [
        ['voltage', s.voltage],
        ['capacity', s.capacity],
        ['chemistry', s.chemistry],
        ['connector', s.connector],
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

    return `
      <article class="card" data-product-id="${id}">
        <div class="top">
          <span class="pid">ID: ${id}</span>
          <span class="cat">${cat}</span>
        </div>

        <div class="thumb">${img || '<div style="font-size:2.2rem;color:#525252">🎯</div>'}</div>

        <h3 class="title">${(p.title || 'Sin título')}</h3>
        <p class="desc">${(p.description || 'Sin descripción')}</p>

        ${ specChips ? `<div class="specs">${specChips}</div>` : '' }

        <div class="bottom">
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

window.deleteProduct = async function deleteProduct(id){
  if (!id) return;
  if (!confirm('¿Estás seguro de eliminar este producto?')) return;
  try {
    await fetchJSON(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    showToast('Producto eliminado', 'success');
    await loadAndRenderProducts();
  } catch (err) {
    showToast(`No se pudo eliminar: ${err.message}`, 'error');
  }
};

/* ------------------ Inicio ------------------ */
document.addEventListener('DOMContentLoaded', () => {
  wireCreateForm();
  wireDeleteForm();
  tryWireSockets();
  loadAndRenderProducts();
});
