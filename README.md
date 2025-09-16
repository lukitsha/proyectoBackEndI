# 🎯 Airsoft E-commerce API - LUCA GAIDO (BACKEND I)

API REST y vistas dinámicas para un e-commerce de productos Airsoft desarrollada con **Node.js + Express + Handlebars + WebSockets**.  
**Entrega #2 - CoderHouse Backend**

---

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+ 
- npm

### Instalación
```bash
# Clonar repositorio
git clone <repository-url>
cd airsoft-ecommerce-api

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
cp .env.example .env
```

### Ejecución
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start

# Inicializar datos de ejemplo
npm run seed

# Reinicializar datos (sobrescribir)
npm run reseed
```

El servidor estará disponible en `http://localhost:8080`

---

## 📁 Estructura del Proyecto

```
airsoft-ecommerce-api/
├── config/
│   ├── config.js             # Configuraciones generales
│   └── environment.js        # Variables de entorno
├── data/
│   ├── products.json         # Persistencia de productos
│   └── carts.json           # Persistencia de carritos
├── public/
│   ├── css/                 # Estilos estáticos
│   └── js/
│       └── realtime.js      # Cliente WebSocket
├── scripts/
│   └── seed.js              # Script de inicialización de datos
├── src/
│   ├── controllers/
│   │   ├── carts.controller.js      # Controlador de carritos
│   │   └── products.controller.js   # Controlador de productos
│   ├── dao/
│   │   ├── carts.dao.js            # Acceso a datos de carritos
│   │   └── products.dao.js         # Acceso a datos de productos
│   ├── routes/
│   │   ├── carts.routes.js         # Rutas API de carritos
│   │   ├── products.routes.js      # Rutas API de productos
│   │   └── views.router.js         # Rutas de vistas (home, realtime)
│   ├── services/
│   │   ├── carts.service.js        # Lógica de negocio de carritos
│   │   └── products.service.js     # Lógica de negocio de productos
│   └── views/
│       ├── errors/
│       │   ├── 404.handlebars      # Vista de error 404
│       │   └── 500.handlebars      # Vista de error 500
│       ├── layouts/
│       │   └── main.handlebars     # Layout principal
│       ├── pages/
│       │   ├── home.handlebars     # Vista home del catálogo
│       │   └── realTimeProducts.handlebars  # Vista tiempo real
│       └── partials/
│           ├── footer.handlebars   # Footer reutilizable
│           ├── header.handlebars   # Header reutilizable
│           └── navbar.handlebars   # Navbar reutilizable
├── .env                     # Variables de entorno (no versionado)
├── .gitignore              # Archivos ignorados por git
├── app.js                  # Configuración de Express
├── index.js                # Punto de entrada del servidor
├── nodemon.json            # Configuración de nodemon
├── package.json            # Dependencias y scripts
└── README.md               # Documentación
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
| GET | `/` | Lista todos los productos (con filtros opcionales) |
| GET | `/:pid` | Obtiene producto por ID |
| POST | `/` | Crea nuevo producto |
| PUT | `/:pid` | Actualiza producto (excepto ID) |
| DELETE | `/:pid` | Elimina producto |

#### Filtros disponibles en GET `/api/products`:
- `category`: Filtro por categoría (replicas, magazines, bbs, batteries)
- `status`: Filtro por estado (active, inactive, discontinued) 
- `minPrice`, `maxPrice`: Rango de precios
- `query`: Búsqueda en título y descripción
- `limit`, `page`: Paginación
- `sort`, `order`: Ordenamiento

### Carritos (`/api/carts`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/` | Crea nuevo carrito |
| GET | `/:cid` | Lista productos del carrito |
| GET | `/:cid/summary` | Resumen del carrito con totales |
| GET | `/:cid/details` | Detalles completos con información de productos |
| POST | `/:cid/product/:pid` | Agrega producto al carrito |
| PUT | `/:cid/product/:pid` | Actualiza cantidad de producto |
| DELETE | `/:cid/product/:pid` | Remueve producto del carrito |
| DELETE | `/:cid` | Elimina carrito completo |

---

## 🖥️ Vistas Dinámicas

### Home (`/`)
- Catálogo dividido por categorías con renderizado server-side
- Filtro de productos por categoría mediante query params
- Productos con **imagen, especificaciones y estado de stock**
- Indicadores visuales para stock bajo (≤10) o sin stock
- Navegación intuitiva con Handlebars helpers personalizados

### RealTime Products (`/realtimeproducts`)
- Gestión en **tiempo real** con WebSockets bidireccional
- Listado dinámico de productos actualizado sin refrescar página
- Formulario para **crear productos** con validaciones y specs dinámicos por categoría
- Formulario para **eliminar productos** con confirmación
- Indicador de **usuarios conectados en vivo** actualizado en tiempo real
- Sincronización automática entre todos los clientes conectados

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
- `status`: Estado del producto (active/inactive)
- `thumbnails`: URLs de imágenes (array, opcional)

### Especificaciones por Categoría

#### **Réplicas** (`replicas`)
- `caliber`: Calibre del arma (ej. 6mm)  
- `weight`: Peso en kilogramos  
- `length`: Longitud en centímetros  
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
    "price": 48000,
    "category": "replicas",
    "stock": 10,
    "status": true,
    "specs": {
      "caliber": "6mm",
      "weight": 2.9,
      "length": 85,
      "firingMode": "Semi/Full Auto",
      "hopUp": true
    }
  }'
```

### Operaciones con Carrito
```bash
# Crear carrito
CART_ID=$(curl -s -X POST http://localhost:8080/api/carts | jq -r '.data.id')

# Agregar producto
curl -X POST http://localhost:8080/api/carts/$CART_ID/product/{productId} \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'

# Ver resumen del carrito
curl http://localhost:8080/api/carts/$CART_ID/summary
```

---

## 🎯 Características Técnicas

### Arquitectura en Capas
- **DAO (Data Access Object)**: Manejo de persistencia en FileSystem
- **Service**: Lógica de negocio y validaciones
- **Controller**: Procesamiento de requests/responses
- **Routes**: Definición de endpoints y middlewares
- **Views**: Renderizado con Handlebars

### Validaciones de Negocio
- **Unicidad de código**: Prevención de productos duplicados
- **Control de stock**: Validación al agregar productos al carrito
- **Categorías válidas**: Solo se aceptan las categorías definidas
- **Estados de producto**: Solo productos activos agregables al carrito
- **Incremento inteligente**: Si producto existe en carrito, incrementa cantidad

### Manejo de Errores
- Middleware global de errores con stack traces (modo desarrollo)
- Páginas de error personalizadas (404, 500)
- Validación de datos en múltiples capas
- Respuestas HTTP consistentes con códigos apropiados

### Persistencia
- FileSystem con archivos JSON
- Operaciones atómicas de lectura/escritura
- IDs únicos generados con `crypto.randomUUID()`
- Respaldo automático antes de operaciones destructivas

---

## 🧪 Testing

### Con cURL
```bash
# Listar productos con filtros
curl "http://localhost:8080/api/products?category=replicas&limit=5"

# Búsqueda por texto
curl "http://localhost:8080/api/products?query=tactical"

# Rango de precios
curl "http://localhost:8080/api/products?minPrice=10000&maxPrice=50000"
```

### Con Postman
Importar la colección incluida en el proyecto para testing completo de todos los endpoints.

### Testing de WebSockets
Abrir múltiples ventanas del navegador en `/realtimeproducts` para verificar sincronización en tiempo real.

---

## ⚠️ Consideraciones y Limitaciones

### FileSystem como Base de Datos
- No apto para producción con alto volumen
- Sin transacciones ACID
- Limitado a operaciones síncronas
- Recomendado solo para desarrollo/demo


---

## 📄 Variables de Entorno

```bash
# Puerto del servidor
PORT=8080

# Modo de ejecución (development/production)
NODE_ENV=development

# Modo demo - muestra stack traces completos
DEMO_MODE=true

# Inicialización automática de datos
SEED_ON_START=false

# Inicialización forzada (sobrescribe datos existentes)
INIT_DATA_ON_STARTUP=false
```

---

## 🤝 Desarrollo

### Scripts NPM
- `npm start`: Producción
- `npm run dev`: Desarrollo con nodemon
- `npm run seed`: Inicializa datos de ejemplo
- `npm run reseed`: Reinicializa datos (forzado)

### Estructura de Commits
- `feat:` nuevas características
- `fix:` correcciones
- `docs:` documentación
- `refactor:` refactorización
- `test:` pruebas
- `chore:` tareas de mantenimiento



---

**Desarrollado por Luca Gaido para CoderHouse - Backend I**  
*Entrega #2: API REST + Vistas dinámicas con Handlebars + WebSockets en Tiempo Real*