import { EVENTO } from './evento.js';
import { ciguena, pintarDefiniciones, pintarIconos, pintarNubecitas, pintarRecortes } from './ilustraciones.js';
import { iniciarApertura } from './apertura.js';
import { montarRsvp } from './rsvp.js';
import { crearMusica } from './musica.js';
import { soltarGlobos } from './globos.js';

const codigo = leerCodigo();
const musica = crearMusica(document.getElementById('musica'));

pintarDefiniciones();
document.querySelectorAll('[data-ave]').forEach((nodo) => {
  nodo.innerHTML = ciguena({ carga: nodo.dataset.ave });
});
pintarRecortes();
pintarNubecitas();
pintarIconos();
pintarEvento();
iniciarCuentaRegresiva(document.getElementById('cuenta'));

if (codigo) arrancar();
else mostrarSinInvitacion();

async function arrancar() {
  const apertura = iniciarApertura({ alAbrir: () => musica.alAbrir(), alTerminar: mostrarInvitacion });
  const datos = await cargar();
  if (datos.estado === 404) {
    apertura.cerrar();
    mostrarSinInvitacion();
    return;
  }
  if (datos.familia) {
    apertura.ponerDestinatario(datos.familia.nombre);
    document.getElementById('saludo').textContent = `¡Hola, ${datos.familia.nombre}!`;
    actualizarBotonConfirmar(datos.familia);
  }
  montarRsvp(document.getElementById('rsvp'), {
    codigo,
    datos,
    recargar: cargar,
    alResponder: actualizarBotonConfirmar,
  });
}

async function cargar() {
  try {
    const respuesta = await fetch(`/api/invitacion?c=${encodeURIComponent(codigo)}`);
    const datos = await respuesta.json().catch(() => ({}));
    return { estado: respuesta.status, ...datos };
  } catch {
    return { estado: 0, error: 'No pudimos cargar su invitación. Revisen su conexión a internet.' };
  }
}

function leerCodigo() {
  const ruta = location.pathname.match(/^\/i\/([a-z0-9]+)\/?$/i);
  const codigo = ruta?.[1] ?? new URLSearchParams(location.search).get('c');
  return codigo ? codigo.toLowerCase() : null;
}

function mostrarInvitacion() {
  const principal = document.getElementById('invitacion');
  principal.hidden = false;
  document.body.classList.remove('bloqueado');
  scrollTo(0, 0);
  principal.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: 'ease' });
  soltarGlobos({ cantidad: 16 });
  musica.mostrarBoton();
}

function mostrarSinInvitacion() {
  document.getElementById('apertura')?.remove();
  document.body.classList.remove('bloqueado');
  document.getElementById('sinInvitacion').hidden = false;
}

function actualizarBotonConfirmar(familia) {
  document.querySelector('#irConfirmar span').textContent = familia.respuesta ? 'Ver su respuesta' : 'Confirmar asistencia';
}

function pintarEvento() {
  document.querySelectorAll('[data-evento]').forEach((nodo) => {
    nodo.textContent = EVENTO[nodo.dataset.evento];
  });
  // Bloque de fecha al estilo de las invitaciones impresas: mes, día de la semana, día y año.
  const formato = (opciones) => new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', ...opciones }).format(new Date(EVENTO.inicio));
  const partes = { mes: { month: 'long' }, semana: { weekday: 'long' }, dia: { day: '2-digit' }, anio: { year: 'numeric' } };
  document.querySelectorAll('[data-fecha]').forEach((nodo) => {
    nodo.textContent = formato(partes[nodo.dataset.fecha]);
  });
  const enlaces = { mapa: EVENTO.mapa, waze: EVENTO.waze, calendario: enlaceCalendario() };
  document.querySelectorAll('[data-enlace]').forEach((enlace) => {
    enlace.href = enlaces[enlace.dataset.enlace];
  });
}

// iPhone y Mac abren el .ics en su calendario; el resto usa Google Calendar.
function enlaceCalendario() {
  if (/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) return '/api/calendario';
  const formato = (iso) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const parametros = new URLSearchParams({
    action: 'TEMPLATE',
    text: EVENTO.titulo,
    dates: `${formato(EVENTO.inicio)}/${formato(EVENTO.fin)}`,
    details: `¿Niña o niño? Acompáñennos a descubrirlo.\nCómo llegar: ${EVENTO.mapa}`,
    location: EVENTO.lugar,
    ctz: 'America/Bogota',
  });
  return `https://calendar.google.com/calendar/render?${parametros}`;
}

function iniciarCuentaRegresiva(nodo) {
  const destino = new Date(EVENTO.inicio).getTime();
  const unidades = Object.fromEntries([...nodo.querySelectorAll('[data-unidad]')].map((n) => [n.dataset.unidad, n]));
  const dos = (numero) => String(numero).padStart(2, '0');
  const actualizar = () => {
    const resta = destino - Date.now();
    if (resta <= 0) {
      clearInterval(intervalo);
      const enCurso = -resta < 6 * 3600 * 1000;
      nodo.innerHTML = `<p class="cuenta-hoy">${enCurso ? '¡Hoy es el gran día!' : '¡Gracias por acompañarnos!'}</p>`;
      return;
    }
    const segundos = Math.floor(resta / 1000);
    unidades.dias.textContent = Math.floor(segundos / 86400);
    unidades.horas.textContent = dos(Math.floor((segundos % 86400) / 3600));
    unidades.minutos.textContent = dos(Math.floor((segundos % 3600) / 60));
    unidades.segundos.textContent = dos(segundos % 60);
  };
  const intervalo = setInterval(actualizar, 1000);
  actualizar();
}
