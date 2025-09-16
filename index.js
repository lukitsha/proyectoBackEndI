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

// Contador de usuarios para mostrar en consola
let connectedUsers = 0;

// 4) Eventos base (conexión / desconexión)
io.on('connection', (socket) => {
  connectedUsers++;
  console.log(`🟢 Cliente conectado: ${socket.id} (Total: ${connectedUsers})`);

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
    connectedUsers--;
    console.log(`🔴 Cliente desconectado: ${socket.id} (Total: ${connectedUsers})`);
    io.emit('users:count', io.engine.clientsCount || 0);
  });
});

// 5) Levantar el server
server.listen(PORT, async () => {
  // Limpiar consola para mejor presentación
  console.clear();
  
  console.log('\n' + '='.repeat(70));
  console.log('🎯 AIRSOFT E-COMMERCE API - SERVIDOR INICIADO');
  console.log('='.repeat(70));
  
  console.log(`\n📍 Puerto: ${PORT}`);
  console.log(`🌐 URL Base: http://localhost:${PORT}`);
  
  console.log('\n' + '-'.repeat(70));
  console.log('📄 VISTAS DISPONIBLES:');
  console.log('-'.repeat(70));
  console.log(`  🏠 Home (Catálogo):        http://localhost:${PORT}/`);
  console.log(`  ⚡ Tiempo Real (WebSocket): http://localhost:${PORT}/realtimeproducts`);
  
  console.log('\n' + '-'.repeat(70));
  console.log('🔌 ENDPOINTS API:');
  console.log('-'.repeat(70));
  console.log(`  📦 Productos:              http://localhost:${PORT}/api/products`);
  console.log(`  🛒 Carritos:               http://localhost:${PORT}/api/carts`);
  console.log(`  📊 API Info:               http://localhost:${PORT}/api`);
  
  console.log('\n' + '-'.repeat(70));
  console.log('⚙️  COMANDOS ÚTILES:');
  console.log('-'.repeat(70));
  console.log('  npm run seed   → Inicializar datos de ejemplo');
  console.log('  npm run reseed → Reinicializar datos (sobrescribir)');
  console.log('  rs + Enter     → Reiniciar servidor (nodemon)');
  console.log('  Ctrl + C       → Detener servidor');
  
  console.log('\n' + '='.repeat(70));

  if (INIT_ON_START) {
    console.log('\n🌱 Inicializando datos de ejemplo...');
    try {
      await initializeIfEmpty();
      console.log('✅ Datos inicializados correctamente.');
    } catch (err) {
      console.error('❌ Error al inicializar datos:', err?.message || err);
    }
  } else {
    console.log('\n💡 Tip: Ejecutá `npm run seed` para cargar datos de ejemplo.');
  }
  
  console.log('\n✅ Servidor listo y escuchando...\n');
});

// Manejo de errores del servidor
server.on('error', (error) => {
  console.error('\n❌ Error del servidor:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`   El puerto ${PORT} ya está en uso.`);
    console.error('   Solución: lsof -i :${PORT} && kill -9 <PID>\n');
  }
  process.exit(1);
});