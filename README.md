# 💝 Catálogo & Tienda Día de la Madre | Coolify Ready 🚀

Plataforma de comercio electrónico de alta conversión para regalos y detalles del **Día de la Madre**, con catálogo público interactivo, checkout automatizado a **WhatsApp** y un panel administrativo `/admin` completo para gestionar productos, stock, precios, categorías y subir fotos.

Arquitectura desacoplada en dos servicios independientes:
* 📂 **`backend/`**: Servidor Node.js con Express, PostgreSQL, carga de imágenes y autenticación segura con cookies.
* 📂 **`frontend/`**: Aplicación Next.js 16 (React 19) optimizada con Tailwind CSS y modo `standalone` para contenedores Docker.
* 🐳 **`docker-compose.yml`**: Orquestación lista para desplegar en **Coolify** con PostgreSQL, Backend y Frontend en 1 clic.

---

## 🏗️ Estructura del Proyecto

```text
Dia-de-la-Madre/
├── backend/                  # Servidor Express & Base de Datos
│   ├── src/
│   │   ├── routes/           # Endpoints: products, categories, admin, upload, cron
│   │   ├── db.ts             # Cliente PostgreSQL con auto-inicialización y fallback
│   │   └── index.ts          # Servidor Express con CORS, cookies y uploads
│   ├── data/                 # Semillas iniciales (products.json, categories.json)
│   ├── uploads/              # Volumen persistente para imágenes subidas
│   ├── Dockerfile            # Imagen optimizada Node.js Alpine
│   └── package.json
│
├── frontend/                 # Aplicación Next.js (App Router)
│   ├── src/app/              # Páginas de Tienda (/), Admin (/admin) y estilos
│   ├── public/               # Iconos y assets estáticos
│   ├── next.config.ts        # Rewrites transparentes hacia el backend y output standalone
│   ├── Dockerfile            # Imagen multi-stage Next.js
│   └── package.json
│
├── docker-compose.yml        # Orquestación de Coolify (db + backend + frontend)
├── .env.example              # Plantilla de variables de entorno
└── README.md
```

---

## 🚀 Despliegue en Coolify

Coolify permite desplegar esta arquitectura fácilmente usando Git y Docker Compose:

### Opción A: Despliegue con Docker Compose en Coolify (Recomendado)

1. En tu panel de **Coolify**, ve a tu proyecto y selecciona **+ New Resource**.
2. Selecciona **Docker Compose Empty** o **Git Repository**.
3. Si conectas tu repositorio Git:
   - Selecciona el repositorio de GitHub.
   - En **Build Pack**, elige **Docker Compose**.
   - Coolify detectará automáticamente el archivo `docker-compose.yml`.
4. Configura las variables de entorno en la pestaña **Environment Variables** de Coolify:
   - `DB_USER`: `postgres`
   - `DB_PASSWORD`: (Una contraseña segura, ej: `mama_secret_pass_2026`)
   - `DB_NAME`: `diadelamadre`
   - `ADMIN_PASSWORD`: Tu contraseña para ingresar a `/admin` (ej: `Mama2026`)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`: El número de WhatsApp (ej: `59175767332`)
   - `FRONTEND_URL`: El dominio público de tu tienda (ej: `https://tienda.tudominio.com`)
5. Asigna tu dominio en Coolify al servicio **frontend** (puerto `3000`).
6. Haz clic en **Deploy**. ¡Coolify levantará la base de datos PostgreSQL, el backend y el frontend automáticamente!

---

## 💻 Desarrollo Local

Si deseas probar el backend y frontend localmente en tu máquina:

### 1. Iniciar el Backend
```bash
cd backend
npm install
npm run dev
```
El servidor backend correrá en `http://localhost:5000`.

### 2. Iniciar el Frontend
En otra terminal:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web correrá en `http://localhost:3000`.

### 3. O ejecutar todo con Docker Compose localmente
```bash
docker compose up --build
```

---

## 🔐 Panel de Control Administrativo

* URL: `http://localhost:3000/admin` (o `https://tu-dominio.com/admin`)
* Contraseña por defecto: `Mama2026` (configurable mediante `ADMIN_PASSWORD`)
* Funcionalidades:
  - Crear, editar y eliminar productos.
  - Subir imágenes desde el dispositivo o cámara.
  - Gestión y reasignación de categorías.
  - Edición rápida de stock y precios directamente en la tabla.
