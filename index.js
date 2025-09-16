// index.js
const http = require('http');
const app = require('./app');
// Seed manual opcional
const { initializeIfEmpty } = require('./scripts/seed');

const PORT = process.env.PORT || 8080;

// Permite habilitar la inicialización sólo si lo pedimos por env
const INIT_ON_START = String(process.env.INIT_DATA_ON_STARTUP || 'false').toLowerCase() === 'true';

// 1) Crear server HTTP con la app de Express
const server = http.createServer(app);

// 2) Montar Socket.IO sobre el mismo server
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

// 3) Hacer disponible `io` dentro de Express (req.app.get('io'))
app.set('io', io);

// Importar el *service instanciado* (NO se instancia aquí)
const productsService = require('./src/services/products.service');

// 4) Eventos base (conexión / desconexión)
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado:', socket.id);

  // Helper para enviar la lista a todos
  const broadcastProducts = async () => {
    const products = await productsService.getAllProducts();
    io.emit('products:list', products);
  };

  // 1) Lista inicial para este socket y contador de conectados
  (async () => {
    try {
      const products = await productsService.getAllProducts();
      socket.emit('products:list', products);
      io.emit('users:count', io.engine.clientsCount || 1);
    } catch (err) {
      socket.emit('ws:error', err?.message || 'Error al cargar productos');
    }
  })();

  // 2) Crear producto vía WS
  socket.on('ws:createProduct', async (payload, ack) => {
    try {
      const created = await productsService.createProduct(payload);
      await broadcastProducts(); // actualiza a TODOS
      if (ack) ack({ ok: true, data: created });
    } catch (err) {
      const msg = err?.message || 'Error creando producto';
      socket.emit('ws:error', msg);
      if (ack) ack({ ok: false, error: msg });
    }
  });

  // 3) Eliminar producto vía WS
  socket.on('ws:deleteProduct', async (id, ack) => {
    try {
      await productsService.deleteProduct(id);
      await broadcastProducts();
      if (ack) ack({ ok: true });
    } catch (err) {
      const msg = err?.message || 'Error eliminando producto';
      socket.emit('ws:error', msg);
      if (ack) ack({ ok: false, error: msg });
    }
  });

  // (opcional) Refresco manual desde el cliente
  socket.on('products:refresh', async (_, ack) => {
    try {
      const products = await productsService.getAllProducts();
      socket.emit('products:list', products);
      if (ack) ack({ ok: true });
    } catch (err) {
      const msg = err?.message || 'Error refrescando productos';
      socket.emit('ws:error', msg);
      if (ack) ack({ ok: false, error: msg });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Cliente desconectado:', socket.id);
    io.emit('users:count', io.engine.clientsCount || 0);
  });
});

// 5) Levantar el server
server.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`API disponible en http://localhost:${PORT}/api`);

  if (INIT_ON_START) {
    try {
      await initializeIfEmpty();
      console.log('Inicialización de datos ejecutada (por INIT_DATA_ON_STARTUP=true).');
    } catch (err) {
      console.error('Fallo al inicializar datos:', err?.message || err);
    }
  } else {
    console.log('Inicialización de datos omitida. (Ejecutá `npm run seed` o `npm run reseed` cuando quieras).');
  }
});
