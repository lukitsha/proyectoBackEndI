# 🎯 Airsoft E-commerce API - LUCA GAIDO (BACKEND I)

API REST y vistas dinámicas para un e-commerce de productos Airsoft desarrollada con **Node.js + Express + Handlebars + WebSockets + MongoDB Atlas**.  
**Entrega FINAL - CoderHouse Backend**

---

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+ 
- npm
- Cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/atlas)

### Instalación
```bash
# Clonar repositorio
git clone <repository-url>
cd airsoft-ecommerce-api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### Ejecución
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start

# Inicializar datos de ejemplo (FS legacy)
npm run seed

# Reinicializar datos (sobrescribir, FS legacy)
npm run reseed

# Migrar datos de FS a MongoDB
npm run migrate
```

El servidor estará disponible en `http://localhost:8080`

---

## 📁 Estructura del Proyecto

```
airsoft-ecommerce-api/
├── config/
│   ├── config.js               # Configuraciones generales
│   ├── environment.js          # Variables de entorno
│   └── db.js                   # Conexión a MongoDB (Atlas o local)
├── data/
│   ├── products.json           # Persistencia local de productos (FS legacy)
│   └── carts.json              # Persistencia local de carritos (FS legacy)
├── public/
│   ├── css/                    # Estilos estáticos
│   └── js/
│       ├── cart.js             # Sistema de carrito con localStorage y sync backend
│       └── realtime.js         # Cliente WebSocket para tiempo real
├── scripts/
│   ├── seed.js                 # Script de inicialización de datos en FS
│   └── migrate.fs.to.mongo.js  # Script para migrar JSON a Mongo
├── src/
│   ├── controllers/
│   │   ├── carts.controller.js     # Controlador de carritos (incluye endpoints extra)
│   │   └── products.controller.js  # Controlador de productos (paginación/filtros)
│   ├── dao/
│   │   ├── carts.dao.js            # DAO FileSystem para carritos
│   │   ├── products.dao.js         # DAO FileSystem para productos
│   │   ├── factory.js              # Factory para conmutar FS ↔ Mongo
│   │   └── mongo/                  # DAOs para persistencia en Mongo
│   │       ├── carts.mongo.dao.js  # DAO MongoDB con populate y lean()
│   │       └── products.mongo.dao.js
│   ├── models/
│   │   ├── cart.model.js           # Modelo Mongoose de carritos
│   │   └── product.model.js        # Modelo Mongoose de productos
│   ├── routes/
│   │   ├── carts.routes.js         # Rutas API de carritos (incluye endpoints nuevos)
│   │   ├── products.routes.js      # Rutas API de productos (paginación/filtros)
│   │   └── views.router.js         # Rutas de vistas (home, realtime, carts/:cid)
│   ├── services/
│   │   ├── carts.service.js        # Lógica de negocio de carritos (populate, qty, clear)
│   │   └── products.service.js     # Lógica de negocio de productos (paginación/filtros)
│   └── views/
│       ├── errors/
│       │   ├── 404.handlebars       # Vista de error 404
│       │   └── 500.handlebars       # Vista de error 500
│       ├── layouts/
│       │   └── main.handlebars      # Layout principal con SweetAlert2
│       ├── pages/
│       │   ├── home.handlebars      # Vista home con botones "Agregar al carrito"
│       │   ├── realTimeProducts.handlebars  # Vista en tiempo real con WebSocket
│       │   └── cartDetail.handlebars        # Vista detalle de carrito con productos
│       └── partials/
│           ├── footer.handlebars    # Footer reutilizable
│           ├── header.handlebars    # Header reutilizable
│           └── navbar.handlebars    # Navbar con ícono de carrito y contador
├── .env                       # Variables de entorno (Mongo URI, persistencia, etc.)
├── .env.example               # Plantilla de variables de entorno
├── .gitignore                 # Archivos ignorados por git
├── app.js                     # Configuración base de Express y middlewares
├── index.js                   # Punto de entrada del servidor (Express + WS + Mongo)
├── nodemon.json               # Configuración de nodemon
├── package.json               # Dependencias y scripts
├── README.md                  # Documentación
└── Testing_POSTMAN(Coleccion).json  # Colección Postman para testing
```

---

## 🛒 Dominio de Negocio: Airsoft

### Categorías de Productos
- **replicas**: Réplicas de armas (AEG, Gas, Spring)
- **magazines**: Cargadores y accesorios
- **bbs**: Balines de diferentes pesos y tipos
- **batteries**: Baterías y accesorios eléctricos

### Productos de Ejemplo Incluidos
- APS AEG ASK209 AK74 Tactical Advanced
- CYMA AEG G36C Sport ABS
- Classic Army AEG MP5 CA5A4
- Cargadores de diferentes capacidades
- BBs de varios pesos (0.20g - 0.28g)
- Baterías LiPo y NiMH de diversas capacidades

---

## 🔌 API Endpoints

### Productos (`/api/products`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Lista todos los productos (con filtros, paginación y ordenamiento) |
| GET | `/:pid` | Obtiene producto por ID |
| POST | `/` | Crea nuevo producto |
| PUT | `/:pid` | Actualiza producto (excepto ID) |
| DELETE | `/:pid` | Elimina producto |

#### Filtros disponibles en GET `/api/products`:
- `category`: Filtro por categoría (replicas, magazines, bbs, batteries)
- `status`: Filtro por estado (true/false) 
- `query`: Búsqueda en título y descripción
- `limit`, `page`: Paginación
- `sort`: Ordenamiento por precio (`asc`/`desc`)

### Carritos (`/api/carts`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/` | Crea nuevo carrito |
| GET | `/:cid` | Lista productos del carrito (populate de productos) |
| GET | `/:cid/summary` | Resumen del carrito con totales |
| POST | `/:cid/product/:pid` | Agrega producto al carrito |
| PUT | `/:cid` | Reemplaza todos los productos del carrito |
| PUT | `/:cid/products/:pid` | Actualiza cantidad de producto |
| DELETE | `/:cid/products/:pid` | Remueve producto específico del carrito |
| DELETE | `/:cid` | Vacía el carrito completo |

---

## 🖥️ Vistas Dinámicas

### Home (`/`)
- Catálogo de productos con **paginación y filtros**
- **Sistema de carrito integrado** con botones "Agregar al carrito"
- Control de cantidad con validación de stock en tiempo real
- Productos con **imagen, especificaciones y estado de stock**
- Indicadores visuales para stock bajo (≤10) o sin stock
- **Toast notifications** con SweetAlert2 para feedback de acciones
- Navegación intuitiva con Handlebars helpers personalizados

### RealTime Products (`/realtimeproducts`)
- Gestión en **tiempo real** con WebSockets bidireccional
- Listado dinámico de productos actualizado sin refrescar página
- Formulario para **crear productos** con validaciones y specs dinámicos por categoría
- Formulario para **eliminar productos** con confirmación
- Indicador de **usuarios conectados en vivo** actualizado en tiempo real
- Sincronización automática entre todos los clientes conectados

### Cart Detail (`/carts/:cid`)
- Vista de un carrito individual con productos poblados desde MongoDB
- **Eliminación individual de productos** con confirmación
- **Vaciado completo del carrito** con confirmación
- Subtotales por producto y total general
- Información de fecha de creación y última actualización
- Botones de acción (volver al catálogo, vaciar carrito, finalizar compra)

---

## 🛍️ Sistema de Carrito

### Características del Carrito
- **Persistencia dual**: localStorage (cliente) + MongoDB (servidor)
- **Sincronización automática** entre frontend y backend
- **Creación automática** del carrito al agregar el primer producto
- **Contador en tiempo real** en el navbar
- **Gestión de cantidades** con validación de stock
- **Recuperación inteligente** de carritos después de recargas

### CartManager (Frontend)
El sistema incluye un `CartManager` completo en JavaScript que:
- Mantiene sincronizado el estado entre localStorage y backend
- Crea automáticamente carritos cuando es necesario
- Valida stock antes de agregar productos
- Recupera carritos existentes al recargar la página
- Maneja la desincronización y la recrea cuando es necesario
- Proporciona feedback visual con animaciones y toasts

### Flujo de Trabajo
1. **Usuario agrega producto**: Se valida stock, se actualiza backend y localStorage
2. **Recarga de página**: Se recupera el carrito del localStorage y se sincroniza con backend
3. **Vista del carrito**: Se obtienen productos con `populate` y `.lean()` para Handlebars
4. **Eliminación**: Se actualiza tanto el backend como el localStorage

---

## 🔄 WebSocket Events

### Eventos del Servidor → Cliente
- `products:list`: Envío de lista completa de productos
- `users:count`: Actualización del contador de usuarios conectados
- `ws:error`: Notificación de errores del servidor

### Eventos del Cliente → Servidor
- `ws:createProduct`: Crear nuevo producto con validación en tiempo real
- `ws:deleteProduct`: Eliminar producto con confirmación
- `products:refresh`: Solicitar actualización manual del listado

### Características de Implementación
- Reconexión automática en caso de pérdida de conexión
- Broadcast a todos los clientes al modificar productos
- Validación de datos antes de broadcasting
- Manejo de errores con feedback visual al usuario

---

## 🖋️ Creación de Productos

### Campos Generales Obligatorios
- `title`: Título (mínimo 3 caracteres)  
- `code`: Código único (validación de duplicados)
- `category`: Categoría válida del sistema
- `price`: Precio mayor a 0  
- `stock`: Stock ≥ 0  
- `description`: Descripción (mínimo 10 caracteres)  
- `status`: Estado del producto (true/false)
- `thumbnails`: URLs de imágenes (array, opcional)

### Especificaciones por Categoría

#### **Réplicas** (`replicas`)
- `caliber`: Calibre del arma (ej. 6mm)  
- `weight`: Peso en gramos  
- `length`: Longitud en milímetros  
- `firingMode`: Modos de disparo disponibles
- `hopUp`: Sistema hop-up (boolean)

#### **Cargadores** (`magazines`)
- `capacity`: Capacidad de municiones
- `material`: Material de construcción
- `compatibility`: Array de modelos compatibles

#### **BBs** (`bbs`)
- `weight`: Peso en gramos  
- `diameter`: Diámetro en milímetros
- `quantity`: Cantidad por paquete
- `material`: Tipo (Bio, Tracer, etc.)

#### **Baterías** (`batteries`)
- `voltage`: Voltaje en V  
- `capacity`: Capacidad en mAh  
- `chemistry`: Tipo de química (LiPo, NiMH, etc.)
- `connector`: Tipo de conector

---

## 📝 Ejemplos de Uso API

### Crear Producto
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "M4A1 Carbine Elite",
    "description": "Réplica M4A1 con sistema AEG de alta calidad",
    "code": "M4-ELITE-001",
    "price": 299,
    "category": "replicas",
    "stock": 10,
    "status": true,
    "specs": {
      "caliber": "6mm",
      "weight": 2900,
      "length": 850,
      "firingMode": "Safe/Semi-Auto/Full-Auto",
      "hopUp": true
    }
  }'
```

### Operaciones con Carrito
```bash
# Crear carrito
CART_ID=$(curl -s -X POST http://localhost:8080/api/carts | jq -r '.data._id')

# Agregar producto
curl -X POST http://localhost:8080/api/carts/$CART_ID/product/{productId} \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'

# Ver resumen del carrito
curl http://localhost:8080/api/carts/$CART_ID/summary

# Actualizar cantidad de producto
curl -X PUT http://localhost:8080/api/carts/$CART_ID/products/{productId} \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'

# Eliminar producto del carrito
curl -X DELETE http://localhost:8080/api/carts/$CART_ID/products/{productId}

# Vaciar carrito completo
curl -X DELETE http://localhost:8080/api/carts/$CART_ID
```

---

## 🎯 Características Técnicas

### Arquitectura en Capas
- **DAO (Data Access Object)**: Manejo de persistencia en FileSystem y MongoDB
- **Service**: Lógica de negocio y validaciones
- **Controller**: Procesamiento de requests/responses
- **Routes**: Definición de endpoints y middlewares
- **Views**: Renderizado con Handlebars
- **Public JS**: Lógica del cliente (CartManager, WebSocket)

### Validaciones de Negocio
- **Unicidad de código**: Prevención de productos duplicados
- **Control de stock**: Validación al agregar productos al carrito
- **Categorías válidas**: Solo se aceptan las categorías definidas
- **Estados de producto**: Solo productos activos agregables al carrito
- **Incremento inteligente**: Si producto existe en carrito, incrementa cantidad
- **Stock en tiempo real**: Validación antes de cada operación

### Manejo de Errores
- Middleware global de errores con stack traces (modo desarrollo)
- Páginas de error personalizadas (404, 500)
- Validación de datos en múltiples capas
- Respuestas HTTP consistentes con códigos apropiados
- Feedback visual con SweetAlert2 para errores del usuario

### Persistencia
- **MongoDB Atlas** como persistencia principal (Entrega Final)
- **FileSystem (FS legacy)** como persistencia alternativa seleccionable
- Factory para conmutar entre FS y Mongo con variable de entorno `PERSISTENCE`
- **localStorage** para mantener estado del carrito en el cliente
- `.lean()` en queries Mongoose para compatibilidad con Handlebars

### Optimizaciones Implementadas
- **Populate eficiente** con `.lean()` para mejor performance
- **Sincronización inteligente** entre localStorage y backend
- **Lazy loading** de productos en vistas paginadas
- **Debouncing** en operaciones del carrito
- **Caché local** del carrito para reducir llamadas al servidor

---

## 🧪 Testing

### Con cURL
```bash
# Listar productos con filtros y paginación
curl "http://localhost:8080/api/products?category=replicas&limit=5&page=1&sort=asc"

# Búsqueda por texto
curl "http://localhost:8080/api/products?query=tactical"

# Rango de precios (si implementado)
curl "http://localhost:8080/api/products?minPrice=100&maxPrice=500"
```

### Con Postman
Importar la colección `Testing_POSTMAN(Coleccion).json` incluida en el proyecto para testing completo de todos los endpoints.

### Testing de WebSockets
Abrir múltiples ventanas del navegador en `/realtimeproducts` para verificar sincronización en tiempo real.

### Testing del Carrito
1. Navegar a la home `/`
2. Agregar productos al carrito con diferentes cantidades
3. Verificar el contador en el navbar
4. Ir al carrito desde el ícono del navbar
5. Probar eliminación individual y vaciado completo
6. Recargar la página para verificar persistencia

---

## 📄 Variables de Entorno

```bash
# Puerto del servidor
PORT=8080

# Entorno (development/production)
NODE_ENV=development

# Persistencia: mongo | fs
PERSISTENCE=mongo

# Conexión a Mongo Atlas
MONGO_URI="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/airsoft"

# Base URL para paginación de productos
BASE_URL=http://localhost:8080
```

---

## 🤝 Desarrollo

### Scripts NPM
- `npm start`: Producción
- `npm run dev`: Desarrollo con nodemon
- `npm run seed`: Inicializa datos de ejemplo (FS legacy)
- `npm run reseed`: Reinicializa datos (forzado, FS legacy)
- `npm run migrate`: Migra productos de FS a MongoDB

### Estructura de Commits
- `feat:` nuevas características
- `fix:` correcciones
- `docs:` documentación
- `refactor:` refactorización
- `test:` pruebas
- `chore:` tareas de mantenimiento

### Dependencias Principales
- **express**: Framework web
- **express-handlebars**: Motor de plantillas
- **mongoose**: ODM para MongoDB
- **socket.io**: WebSockets en tiempo real
- **sweetalert2**: Notificaciones elegantes (CDN)
- **dotenv**: Variables de entorno
- **nodemon**: Hot reload en desarrollo

---

## 📚 Documentación Adicional

### Handlebars Helpers Personalizados
- `eq`: Comparación de igualdad
- `lte`: Menor o igual que
- `typeof`: Tipo de variable
- `multiply`: Multiplicación para subtotales

### Consideraciones de Seguridad
- Validación de entrada en múltiples capas
- Sanitización de datos antes de persistencia
- Uso de `.lean()` para prevenir inyección de prototipos
- Variables de entorno para datos sensibles

---

**Desarrollado por Luca Gaido para CoderHouse - Backend I**  
*Entrega FINAL: API REST + Vistas dinámicas con Handlebars + WebSockets en Tiempo Real + MongoDB Atlas + Sistema de Carrito Persistente*