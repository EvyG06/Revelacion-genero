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

