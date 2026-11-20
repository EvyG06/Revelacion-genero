# Invitación · Baby shower de Estefanía y Sebastián

Invitación web para celular y computador. Llega un sobre con una mariposa como sello; al tocarla, la mariposa se va volando y el sobre se abre. Cada familia confirma quiénes van y puede dejarle un mensaje a la bebé. Las respuestas se guardan, y Estefanía y Sebastián las ven en un panel privado.

Antes era la invitación a la revelación del bebé, que no se hizo. Las familias y sus links son los mismos. Lo que respondieron para la revelación se conserva aparte: el panel muestra sus mensajes y el Excel los trae en su propia hoja.

- **Invitación de cada familia:** `https://<dominio>/i/<código>` (el código lo crea el panel).
- **Panel privado:** `https://<dominio>/admin` (pide la clave `ADMIN_PASSWORD`).

## Probar en este computador

```bash
npm run dev
```

Abre `http://localhost:5173/i/prueba1` (familia de prueba) y `http://localhost:5173/admin`. La clave local está en `.env.local` y las respuestas de prueba se guardan en `.data/familias.json`.

No hay que instalar nada: es HTML, CSS y JavaScript sin dependencias.
