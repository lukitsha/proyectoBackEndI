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
project/
├── index.js                 # Punto de entrada
├── app.js                   # Configuración Express
├── config/
│   ├── config.js           # Configuraciones generales
│   └── environment.js      # Variables de entorno
├── data/
│   ├── products.json       # Persistencia de productos
│   └── carts.json         # Persistencia de carritos
├── scripts/
│   └── seed.js            # Script de inicialización
└── src/
    ├── routes/            # Definición de endpoints y vistas
    ├── controllers/       # Lógica de controladores
    ├── services/         # Lógica de negocio y validaciones
    ├── dao/              # Acceso a datos (FileSystem)
    └── views/            # Plantillas Handlebars (home, realtime)
```

---

## 🛒 Dominio de Negocio: Airsoft

### Categorías de Productos
- **replicas**: Réplicas de armas (AEG, Gas, Spring)
- **magazines**: Cargadores y accesorios
- **bbs**: Balines de diferentes pesos y tipos
- **batteries**: Baterías y accesorios eléctricos

### Productos de Ejemplo Incluidos
- ASR117 AEG Assault Rifle
- M4A1 Carbine Tactical  
- Cargadores UMAG M4/M16 y AK-47
- BBs 0.28g Premium y 0.25g Tracer
- Baterías LiPo 11.1V y NiMH 9.6V

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
| POST | `/:cid/product/:pid` | Agrega producto al carrito |
| PUT | `/:cid/product/:pid` | Actualiza cantidad de producto |
| DELETE | `/:cid/product/:pid` | Remueve producto del carrito |
| DELETE | `/:cid` | Elimina carrito completo |

---

## 🖥️ Vistas Dinámicas

### Home (`/`)
- Catálogo dividido por categorías.  
- Filtro de productos por categoría.  
- Productos con **imagen, specs y estado de stock**.  
- Navegación intuitiva con Handlebars.

### RealTime Products (`/realtimeproducts`)
- Gestión en **tiempo real** con WebSockets.  
- Listado dinámico de productos (sin refrescar página).  
- Formulario para **crear productos** con specs dinámicos por categoría.  
- Formulario para **eliminar productos** seleccionando por ID.  
- Indicador de **usuarios conectados en vivo**.  

---

## 🖋️ Creación de Productos en Tiempo Real

En la vista `/realtimeproducts` se encuentra un formulario dinámico para crear productos.  
Los **campos generales obligatorios** son:  

- `title`: Título (mínimo 3 caracteres)  
- `code`: Código único (ej: `AK74-001`)  
- `category`: Categoría (replicas, magazines, bbs, batteries)  
- `price`: Precio mayor a 0  
- `stock`: Stock ≥ 0  
- `description`: Descripción (mínimo 10 caracteres)  
- `status`: Checkbox de producto activo/inactivo  
- `thumbnails`: URL de imagen (opcional)  

### Requisitos por Categoría

- **replicas**
  - `caliber`: ej. 6mm  
  - `weight`: peso en kg  
  - `length`: longitud en cm  
  - `firingMode`: modos de disparo (Semi/Auto)  
  - `hopUp`: booleano (true/false)  

- **magazines**
  - `capacity`: capacidad de BBs  
  - `material`: material del cargador (ej. polímero)  
  - `compatibility`: listado de compatibilidades (ej. M4, M16)  

- **bbs**
  - `weight`: peso en gramos  
  - `diameter`: diámetro en mm  
  - `quantity`: cantidad de BBs  
  - `material`: tipo (ej. Bio, Tracer)  

- **batteries**
  - `voltage`: voltaje en V  
  - `capacity`: capacidad en mAh  
  - `chemistry`: química (LiPo, NiMH, etc.)  
  - `connector`: conector (ej. Tamiya, Deans)  

### Ventajas del Modo Tiempo Real
- Cada producto creado se **agrega automáticamente** al listado sin refrescar.  
- Eliminación instantánea desde el listado con un clic en el botón 🗑️.  
- Indicador de **usuarios conectados en vivo**.  

---

## 📝 Ejemplos de Uso API

### Crear Producto
```bash
curl -X POST http://localhost:8080/api/products   -H "Content-Type: application/json"   -d '{
    "title": "M4A1 Carbine Elite",
    "description": "Réplica M4A1 con sistema AEG de alta calidad",
    "price": 48000,
    "category": "replicas",
    "stock": 10,
    "specs": {
      "caliber": "6mm",
      "weight": 2900,
      "length": 850,
      "firingMode": "Semi/Full Auto",
      "hopUp": true
    }
  }'
```

### Crear Carrito
```bash
curl -X POST http://localhost:8080/api/carts
```

### Agregar Producto al Carrito
```bash
curl -X POST http://localhost:8080/api/carts/{cartId}/product/{productId}   -H "Content-Type: application/json"   -d '{"quantity": 2}'
```

---

## 🎯 Características Técnicas

### Arquitectura
- **Capas**: DAO → Service → Controller → Route
- **Validaciones**: En capa Service
- **Error Handling**: Middleware global
- **IDs**: Generados con `crypto.randomUUID()`
- **Persistencia**: FileSystem (JSON)
- **Vistas**: Handlebars con layouts y parciales
- **Tiempo Real**: Implementación con Socket.IO

### Validaciones de Negocio
- **Stock**: Control automático al agregar productos al carrito
- **Categorías**: Validación de atributos específicos por categoría
- **Estados**: Solo productos activos pueden agregarse al carrito
- **Incremento**: Al agregar producto existente en carrito, incrementa quantity +1

### Configuración Avanzada
- **Modo Demo**: Activable via `DEMO_MODE=true`
- **Auto-seed**: Inicialización automática con `SEED_ON_START=true`
- **Paginación**: Hasta 100 elementos por página
- **Filtros**: Múltiples filtros combinables

---

## 🧪 Testing

### Con cURL
```bash
# Listar productos
curl http://localhost:8080/api/products

# Filtrar por categoría
curl "http://localhost:8080/api/products?category=replicas&limit=5"

# Crear carrito y agregar producto
CART_ID=$(curl -s -X POST http://localhost:8080/api/carts | jq -r '.data.id')
curl -X POST http://localhost:8080/api/carts/$CART_ID/product/{productId}
```

### Con Postman
Importar la colección `Airsoft_API.postman_collection.json` incluida en el proyecto.

---

## ⚠️ Consideraciones

### Limitaciones de FileSystem
- No es thread-safe para múltiples escrituras concurrentes
- Rendimiento limitado para grandes volúmenes de datos
- Solo para desarrollo/demo

### Próximas Mejoras
- Migración a base de datos (MongoDB/MySQL)
- Autenticación y autorización
- Middleware de logging avanzado
- Validación con schemas (Joi/Yup)
- Tests unitarios y de integración

---

## 📄 Variables de Entorno

```bash
PORT=8080                    # Puerto del servidor
DEMO_MODE=true              # Modo demo (muestra stack traces)
SEED_ON_START=true          # Inicializa datos al arrancar
```

---

## 🤝 Desarrollo

### Scripts disponibles
- `npm start`: Ejecuta en modo producción
- `npm run dev`: Ejecuta con nodemon (desarrollo)
- `npm run seed`: Inicializa datos de ejemplo
- `npm run reseed`: Reinicializa datos (--force)

### Estructura de commits
- `feat:` nuevas características
- `fix:` correcciones de bugs  
- `docs:` documentación
- `refactor:` refactorización de código

---

## 📞 Soporte

Para consultas sobre la implementación o errores encontrados, consultar:
- Issues del repositorio
- Documentación de CoderHouse
- Slack del curso

---

**Desarrollado por Luca Gaido para CoderHouse - Backend I**  
*Entrega #2: API REST + Vistas dinámicas con Handlebars + Tiempo Real con WebSockets*
