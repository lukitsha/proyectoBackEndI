# 🎯 Airsoft E-commerce API - LUCA GAIDO (BACKEND I)

API REST para e-commerce de productos Airsoft desarrollada con Node.js + Express. 
**Entrega #1 - CoderHouse Backend**

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
    ├── routes/            # Definición de endpoints
    ├── controllers/       # Lógica de controladores
    ├── services/         # Lógica de negocio y validaciones
    └── dao/              # Acceso a datos (FileSystem)
```

## 🛒 ENTREGABLE 1: Tienda Airsoft

### Categorías de Productos
- **replicas**: Réplicas de armas (AEG, Gas, Spring)
- **magazines**: Cargadores y accesorios
- **bbs**: Balines de diferentes pesos y tipos
- **batteries**: Baterías y accesorios eléctricos


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
- `category`: Filter por categoría (replicas, magazines, bbs, batteries)
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



## 🎯 Características Técnicas

### Arquitectura
- **Capas**: DAO → Service → Controller → Route
- **Validaciones**: En capa Service
- **Error Handling**: Middleware global
- **IDs**: Generados con `crypto.randomUUID()`
- **Persistencia**: FileSystem (JSON)

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


## 📄 Variables de Entorno

```bash
PORT=8080                    # Puerto del servidor
DEMO_MODE=true              # Modo demo (muestra stack traces)
SEED_ON_START=true          # Inicializa datos al arrancar
```

## 🤝 Desarrollo

### Scripts disponibles
- `npm start`: Ejecuta en modo producción
- `npm run dev`: Ejecuta con nodemon (desarrollo)
- `npm run seed`: Inicializa datos de ejemplo
- `npm run reseed`: Reinicializa datos (--force)


---

**Desarrollado por Luca Gaido para CoderHouse - Backend I**  
*Entrega #1: API REST con persistencia en FileSystem*