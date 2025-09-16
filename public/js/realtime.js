const socket = io();

// Render de lista usando el endpoint HTTP /api/products
async function renderList() {
  const ul = document.getElementById('products-list');
  if (!ul) return;

  ul.innerHTML = '<li>Cargando...</li>';

  try {
    const res = await fetch('/api/products');
    const payload = await res.json();
    const products = Array.isArray(payload) ? payload : (payload.data || []);

    ul.innerHTML = '';
    if (!products.length) {
      ul.innerHTML = '<li>No hay productos.</li>';
      return;
    }

    products.forEach(p => {
      const li = document.createElement('li');
      li.className = 'card';
      li.innerHTML = `
        <div class="title">${p.title}</div>
        <div class="meta">Precio: ${p.price} | Stock: ${p.stock} | ID: <code>${p.id}</code></div>
        ${p.description ? `<p class="desc">${p.description}</p>` : ''}
      `;
      ul.appendChild(li);
    });
  } catch (err) {
    ul.innerHTML = `<li>Error cargando productos: ${err?.message || err}</li>`;
  }
}

// Primera carga
renderList();

// Cuando el server avisa cambios, refresco lista
socket.on('products:changed', renderList);

// Formularios opcionales (crear/eliminar por WS)
const createForm = document.getElementById('ws-create-form');
const deleteForm = document.getElementById('ws-delete-form');

if (createForm) {
  createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(createForm);
    const payload = {
      title: fd.get('title'),
      price: Number(fd.get('price')),
      stock: Number(fd.get('stock')),
    };
    socket.emit('ws:createProduct', payload);
    createForm.reset();
  });
}

if (deleteForm) {
  deleteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(deleteForm);
    socket.emit('ws:deleteProduct', fd.get('id'));
    deleteForm.reset();
  });
}

// Errores WS
socket.on('ws:error', (msg) => {
  alert('Error WS: ' + msg);
});
