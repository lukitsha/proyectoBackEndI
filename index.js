// index.js
const http = require('http');
const app = require('./app');
// OJO: seguimos pudiendo usar el seed manual cuando queramos
const { initializeIfEmpty } = require('./scripts/seed');

const PORT = process.env.PORT || 8080;

// Permite habilitar la inicialización sólo si lo pedimos por env
const INIT_ON_START = String(process.env.INIT_DATA_ON_STARTUP || 'false').toLowerCase() === 'true';

const server = http.createServer(app);

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

