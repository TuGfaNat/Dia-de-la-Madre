# 💝 Regalos para Mamá | Shiro Neko Lab & TuGfaNat

Una plataforma de comercio electrónico elegante, minimalista y ultra-rápida optimizada para dispositivos móviles, diseñada especialmente para campañas del **Día de la Madre**. Permite a los clientes seleccionar regalos premium, armar un carrito de compras interactivo y realizar el pedido directamente por **WhatsApp**, mientras que ofrece al propietario un panel de control administrativo `/admin` para gestionar el inventario y catálogo en tiempo real.

---

## 🌟 Características Principales

### 📱 Experiencia del Cliente (Fácil y Rápida)
* **Diseño Premium e Intuitivo**: Estética romántica con una paleta de colores oscuros de lujo, tipografías nítidas (`Playfair Display` para títulos y `Outfit` para textos) y animaciones fluidas.
* **Filtros por Categorías**: Navegación ágil mediante pestañas horizontales de categorías ("Flores", "Joyas", "Chocolates", "Spa", etc.).
* **Buscador en Tiempo Real**: Filtrado de productos instantáneo tanto en computadoras como en móviles.
* **Carrito de Compras de Alta Conversión**: Carga instantánea, persistencia local (`localStorage`), control estricto de límites de inventario y Checkout automatizado formateado para **WhatsApp** (al número `+59175767332` con formato boliviano).
* **Sección de Confianza**: Tarjetas de garantía sobre el uso de materiales de alta calidad, opciones de personalización hechas a mano y acabados artesanales.

### 🔐 Panel Administrativo de Lujo (`/admin`)
* **Acceso Seguro**: Autenticación estática protegida mediante una cookie cifrada con contraseña personalizable (`ADMIN_PASSWORD`).
* **Edición Inline Ultrarrápida**: Permite modificar la cantidad de stock y el precio de venta de cualquier producto con solo hacer doble clic sobre el valor en la tabla, guardándose al instante.
* **Creación y Edición Detallada**: Ventanas flotantes (modales) para dar de alta o modificar productos, incluyendo títulos, descripciones, categorías, precios y stock.
* **Cámara e Imágenes integradas**: Capacidad de tomar fotos del producto directamente con la cámara del celular o seleccionar archivos para subirlos al servidor.
* **Métricas y Estadísticas Clave**: Tarjetas de rendimiento del catálogo (número de productos activos, valor total del inventario y alertas automáticas de productos agotados).

---

## 🛠️ Tecnologías Utilizadas

* **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/) - Renderizado híbrido óptimo y APIs Serverless integradas.
* **Estilizado**: [Tailwind CSS v4](https://tailwindcss.com/) - Diseño responsivo premium, variables CSS nativas y transiciones fluidas.
* **Base de Datos**: Arquitectura híbrida adaptativa (`src/lib/db.ts`):
  * **Local**: Base de datos ligera basada en un archivo JSON (`src/data/products.json`).
  * **Nube**: Conexión nativa con **Vercel KV** (Redis) si está conectado en producción.
* **Almacenamiento de Archivos (Fotos)**:
  * **Local**: Subida al disco local (`public/uploads`) en entorno de desarrollo.
  * **Nube**: Subida directa a **Vercel Blob** si está en producción.
* **Tipografías**: Google Fonts integradas con optimización de Next.js.

---

## 🚀 Instalación y Desarrollo Local

Sigue estos pasos para hacer correr el proyecto en tu computadora:

### Prerrequisitos
Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).

### Pasos
1. **Clonar el repositorio o descargar la carpeta**:
   ```bash
   cd Dia-de-la-Madre
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación**:
   * **Tienda pública**: Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
   * **Panel Administrativo**: Abre [http://localhost:3000/admin](http://localhost:3000/admin). La contraseña por defecto es `Mama2026`.

---

## 🌐 Despliegue en la Nube (Vercel)

Esta aplicación está completamente optimizada para desplegarse gratis en **Vercel** en menos de dos minutos:

### Paso 1: Repositorio en GitHub
Sube este código a tu cuenta de GitHub (puede ser un repositorio privado).

### Paso 2: Importar en Vercel
1. Ingresa a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..." > "Project"**.
3. Selecciona tu repositorio y haz clic en **"Import"**.

### Paso 3: Configurar Variables de Entorno (Opcional)
En la configuración del proyecto, despliega "Environment Variables" y añade si lo deseas:
* `ADMIN_PASSWORD`: Tu contraseña secreta para el panel `/admin` (por defecto es `Mama2026`).
* `NEXT_PUBLIC_WHATSAPP_NUMBER`: El número de WhatsApp donde llegarán los pedidos (por defecto es `59175767332`).

### Paso 4: Agregar Persistencia Real (¡Recomendado!)
Para evitar que tus productos y fotos nuevas se borren al reiniciar el servidor en Vercel:
1. En el panel de tu proyecto de Vercel, ve a la pestaña **Storage**.
2. Haz clic en **KV** (Redis) y créalo con las opciones gratuitas por defecto.
3. Haz clic en **Blob** (File Storage) y créalo con las opciones gratuitas por defecto.
4. Enlaza ambos servicios a tu proyecto haciendo clic en el botón de conectar.

¡Listo! El código detectará automáticamente las variables en la nube y activará el almacenamiento ilimitado de base de datos y fotos.

---

## 🛡️ Licencia y Derechos Reservados
Derechos reservados © 2026 **Shiro Neko Lab & TuGfaNat**. Desarrollado con dedicación y amor para todas las madres.
