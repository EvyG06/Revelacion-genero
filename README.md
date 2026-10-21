# Invitación · Revelación del bebé de Estefanía y Sebastián

Invitación web para celular. La cigüeña llega con un sobre, la familia lo abre, confirma quiénes van y cada persona apuesta si será niña o niño. Las respuestas se guardan, y Estefanía y Sebastián las ven en un panel privado.

- **Invitación de cada familia:** `https://<dominio>/i/<código>` (el código lo crea el panel).
- **Panel privado:** `https://<dominio>/admin` (pide la clave `ADMIN_PASSWORD`).

## Probar en este computador

```bash
npm run dev
```

Abre `http://localhost:5173/i/prueba1` (familia de prueba) y `http://localhost:5173/admin`. La clave local está en `.env.local` y las respuestas de prueba se guardan en `.data/familias.json`.

No hay que instalar nada: es HTML, CSS y JavaScript sin dependencias.

## Publicar en Vercel

1. Sube esta carpeta a un repositorio privado de GitHub.
2. En Vercel: **Add New → Project**, importa el repositorio y deja el preset **Other** (`vercel.json` ya indica que la página está en `public/`).
3. En el proyecto: **Storage → Create Database → Upstash for Redis** (plan gratis) y conéctala al proyecto. Vercel agrega `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
4. En **Settings → Environment Variables** agrega `ADMIN_PASSWORD` con la clave del panel.
5. Vuelve a desplegar (**Deployments → Redeploy**) para que tome las variables.
6. Con el dominio definitivo, cambia `og:image` en `public/index.html` por la dirección completa (`https://<dominio>/og.jpg`) para que WhatsApp muestre la imagen.

## Cambiar datos del evento

Todo sale de `public/js/evento.js`: fecha, hora, lugar, links del mapa y fecha límite para confirmar. Si cambian los textos de la imagen de WhatsApp, regenérala con `node scripts/og.mjs` (usa Google Chrome y crea `public/og.jpg`).

## Cómo está hecho

- `public/`: la invitación (`index.html`), el panel (`admin.html`) y los estilos. Los ositos con globos, las estrellas y las nubes salen de la acuarela `public/img/osos.webp`, recortada por capas para animarlas. La cigüeña y los globos son SVG con un filtro de acuarela. La música es una caja musical generada con Web Audio, así que no hay archivos de audio.
- `api/`: funciones de Vercel. `invitacion.js` lee y guarda la respuesta de una familia, `admin.js` maneja las familias (con clave) y `calendario.js` genera el archivo `.ics`.
- `server/`: guardado en Redis (o en `.data/` cuando se prueba en local) y validaciones.
- `dev-server.js`: servidor local que imita a Vercel.
