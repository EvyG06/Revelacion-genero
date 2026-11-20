// Panel privado: agregar familias, enviar sus links y ver quién confirmó.
import { EVENTO } from './evento.js';
import { icono, pintarIconos, pintarMariposas } from './ilustraciones.js';
import { chip, esc, lugares } from './comun.js';
import { descargarExcel } from './xlsx.js';

const GUARDADA = 'revelacion-clave';
const ETIQUETAS = { pendiente: 'Pendiente', asiste: 'Asiste', no: 'No asiste' };

let clave = leerClave();
let familias = [];
let filtro = 'todas';
let editando = null;
let temporizadorAviso = null;

const lista = document.getElementById('familias');
pintarMariposas();
pintarIconos();

document.getElementById('formAcceso').addEventListener('submit', entrar);
document.getElementById('formFamilia').addEventListener('submit', agregarFamilia);
document.getElementById('refrescar').addEventListener('click', () => cargar());
document.getElementById('salir').addEventListener('click', salir);
document.getElementById('descargar').addEventListener('click', () => descargarExcel(familias, enlace));
document.getElementById('filtros').addEventListener('click', cambiarFiltro);
lista.addEventListener('click', accionFamilia);
lista.addEventListener('submit', guardarEdicion);

if (clave) cargar();
else mostrarAcceso();

// Se actualiza solo cada minuto mientras el panel está a la vista.
setInterval(() => {
  if (clave && !document.hidden && !editando) cargar({ silencioso: true });
}, 60_000);

// ---------- Datos ----------

async function api(metodo, ruta = '', cuerpo) {
  const respuesta = await fetch(`/api/admin${ruta}`, {
    method: metodo,
    headers: {
      'x-clave': encodeURIComponent(clave),
      ...(cuerpo ? { 'content-type': 'application/json' } : {}),
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (respuesta.status === 401) {
    olvidarClave();
    mostrarAcceso(datos.error);
    throw Object.assign(new Error(datos.error), { mostrado: true });
  }
  if (!respuesta.ok) throw new Error(datos.error || 'Algo salió mal. Inténtalo de nuevo.');
  return datos;
}

async function cargar({ silencioso = false } = {}) {
  try {
    ({ familias } = await api('GET'));
    mostrarTablero();
    pintar();
  } catch (error) {
    if (!error.mostrado && !silencioso) {
      if (document.getElementById('tablero').hidden) mostrarAcceso(error.message);
      else avisar(error.message);
    }
  }
}

async function entrar(evento) {
  evento.preventDefault();
  clave = document.getElementById('clave').value;
  if (document.getElementById('recordar').checked) guardarClave(clave);
  document.getElementById('errorAcceso').textContent = '';
  await cargar();
}

function salir() {
  olvidarClave();
  familias = [];
  mostrarAcceso();
}

async function agregarFamilia(evento) {
  evento.preventDefault();
  const formulario = evento.currentTarget;
  const nombre = document.getElementById('nombreFamilia');
  const cupo = document.getElementById('cupoFamilia');
  try {
    const { familia } = await api('POST', '', { nombre: nombre.value, cupo: Number(cupo.value) });
    familias.push(familia);
    nombre.value = '';
    filtro = 'todas';
    pintar();
    const tarjeta = lista.querySelector(`[data-codigo="${familia.codigo}"]`);
    tarjeta?.classList.add('nueva');
    tarjeta?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    avisar('Familia agregada. Ya puedes enviarle su link.');
    formulario.querySelector('input').focus({ preventScroll: true });
  } catch (error) {
    if (!error.mostrado) avisar(error.message);
  }
}

async function accionFamilia(evento) {
  const boton = evento.target.closest('[data-accion]');
  if (!boton) return;
  const codigo = boton.closest('[data-codigo]').dataset.codigo;
  const familia = familias.find((f) => f.codigo === codigo);
  const accion = boton.dataset.accion;
  try {
    if (accion === 'copiar') await copiar(enlace(familia));
    else if (accion === 'editar') {
      editando = codigo;
      pintarFamilias();
      lista.querySelector('.form-edicion input')?.focus();
    } else if (accion === 'cancelar') {
      editando = null;
      pintarFamilias();
    } else if (accion === 'reiniciar') {
      if (!confirm(`¿Borrar la confirmación de ${familia.nombre}? Podrán volver a responder con el mismo link.`)) return;
      reemplazar((await api('PATCH', '', { codigo, borrarRespuesta: true })).familia);
      avisar('Confirmación borrada.');
    } else if (accion === 'eliminar') {
      if (!confirm(`¿Eliminar a ${familia.nombre}? Su link dejará de funcionar.`)) return;
      await api('DELETE', `?c=${encodeURIComponent(codigo)}`);
      familias = familias.filter((f) => f.codigo !== codigo);
      pintar();
      avisar('Familia eliminada.');
    }
  } catch (error) {
    if (!error.mostrado) avisar(error.message);
  }
}

async function guardarEdicion(evento) {
  evento.preventDefault();
  const formulario = evento.target;
  const datos = new FormData(formulario);
  try {
    const { familia } = await api('PATCH', '', {
      codigo: formulario.dataset.codigo,
      nombre: datos.get('nombre'),
      cupo: Number(datos.get('cupo')),
    });
    editando = null;
    reemplazar(familia);
    avisar('Cambios guardados.');
  } catch (error) {
    if (!error.mostrado) avisar(error.message);
  }
}

function reemplazar(familia) {
  familias = familias.map((f) => (f.codigo === familia.codigo ? familia : f));
  pintar();
}

function cambiarFiltro(evento) {
  const boton = evento.target.closest('[data-filtro]');
  if (!boton) return;
  filtro = boton.dataset.filtro;
  pintarFamilias();
}

// ---------- Vistas ----------

function mostrarAcceso(mensaje = '') {
  document.getElementById('tablero').hidden = true;
  document.getElementById('acceso').hidden = false;
  document.getElementById('errorAcceso').textContent = mensaje;
  document.getElementById('clave').value = '';
}

function mostrarTablero() {
  document.getElementById('acceso').hidden = true;
  document.getElementById('tablero').hidden = false;
}

function pintar() {
  pintarResumen();
  pintarFamilias();
  pintarMensajes();
  document.getElementById('actualizado').textContent =
    `Actualizado a las ${new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}`;
}

// La confirmación del baby shower está en `confirmacion`; `respuesta` es lo que contestaron para la revelación.
const estadoDe = (familia) => (!familia.confirmacion ? 'pendiente' : familia.confirmacion.asiste ? 'asiste' : 'no');

function pintarResumen() {
  const respondieron = familias.filter((f) => f.confirmacion);
  const asisten = respondieron.filter((f) => f.confirmacion.asiste);
  const personas = asisten.reduce((suma, f) => suma + f.confirmacion.personas.length, 0);
  const reservados = familias.reduce((suma, f) => suma + f.cupo, 0);

  document.getElementById('resumen').innerHTML = `
    <div class="dato dato-destacado"><strong>${personas}</strong><span>Personas confirmadas</span><small>de ${reservados} lugares</small></div>
    <div class="dato"><strong>${asisten.length}</strong><span>Familias asisten</span><small>de ${familias.length} invitadas</small></div>
    <div class="dato"><strong>${familias.length - respondieron.length}</strong><span>Pendientes</span><small>sin responder</small></div>
    <div class="dato"><strong>${respondieron.length - asisten.length}</strong><span>No asisten</span><small>familias</small></div>`;

  const cuenta = { todas: familias.length, asiste: asisten.length, no: respondieron.length - asisten.length, pendiente: familias.length - respondieron.length };
  document.querySelectorAll('[data-filtro]').forEach((boton) => {
    boton.querySelector('span')?.remove();
    boton.insertAdjacentHTML('beforeend', `<span>${cuenta[boton.dataset.filtro]}</span>`);
  });
}

function pintarFamilias() {
  document.querySelectorAll('[data-filtro]').forEach((boton) => {
    boton.setAttribute('aria-selected', String(boton.dataset.filtro === filtro));
  });
  const visibles = familias.filter((f) => filtro === 'todas' || estadoDe(f) === filtro);
  if (!familias.length) {
    lista.innerHTML = '<li class="vacio">Todavía no hay familias. Agrega la primera arriba y envíale su link por WhatsApp.</li>';
    return;
  }
  lista.innerHTML = visibles.length
    ? visibles.map((f) => (f.codigo === editando ? vistaEdicion(f) : vistaFamilia(f))).join('')
    : '<li class="vacio">No hay familias en este grupo.</li>';
}

function vistaFamilia(familia) {
  const estado = estadoDe(familia);
  const confirmacion = familia.confirmacion;
  const personas = confirmacion?.personas ?? [];
  const meta = estado === 'asiste'
    ? `${personas.length} de ${familia.cupo} ${familia.cupo === 1 ? 'lugar' : 'lugares'}`
    : lugares(familia.cupo);
  const fecha = confirmacion
    ? ` · respondió el ${new Date(confirmacion.actualizada).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`
    : '';
  const chips = personas.map(chip).join('');
  return `<li class="familia" data-codigo="${familia.codigo}">
    <div class="familia-cabecera">
      <div>
        <h3 class="familia-nombre">${esc(familia.nombre)}</h3>
        <p class="familia-meta">${meta}${fecha}</p>
      </div>
      <span class="estado estado-${estado}">${ETIQUETAS[estado]}</span>
    </div>
    ${chips ? `<ul class="chips">${chips}</ul>` : ''}
    ${confirmacion?.mensaje ? `<p class="familia-mensaje">“${esc(confirmacion.mensaje)}”</p>` : ''}
    <div class="familia-acciones">
      <a class="boton boton-chico boton-whatsapp" href="${esc(whatsapp(familia))}" target="_blank" rel="noopener">${icono('whatsapp')}<span>Enviar</span></a>
      <button type="button" class="boton boton-chico" data-accion="copiar">${icono('copiar')}<span>Copiar link</span></button>
      <a class="boton-icono" href="${esc(enlace(familia))}" target="_blank" rel="noopener" aria-label="Ver la invitación de ${esc(familia.nombre)}">${icono('ojo')}</a>
      <button type="button" class="boton-icono" data-accion="editar" aria-label="Editar ${esc(familia.nombre)}">${icono('editar')}</button>
      ${confirmacion ? `<button type="button" class="boton-icono" data-accion="reiniciar" aria-label="Borrar la confirmación de ${esc(familia.nombre)}">${icono('reiniciar')}</button>` : ''}
      <button type="button" class="boton-icono boton-peligro" data-accion="eliminar" aria-label="Eliminar a ${esc(familia.nombre)}">${icono('basura')}</button>
    </div>
  </li>`;
}

function vistaEdicion(familia) {
  return `<li class="familia" data-codigo="${familia.codigo}">
    <form class="form-edicion" data-codigo="${familia.codigo}">
      <label class="campo"><span>Nombre</span><input name="nombre" value="${esc(familia.nombre)}" maxlength="80" required></label>
      <label class="campo"><span>Lugares</span><input name="cupo" type="number" min="1" max="30" value="${familia.cupo}" inputmode="numeric" required></label>
      <div class="form-edicion-acciones">
        <button type="button" class="boton boton-chico" data-accion="cancelar">Cancelar</button>
        <button type="submit" class="boton boton-chico boton-principal">Guardar</button>
      </div>
    </form>
  </li>`;
}

function pintarMensajes() {
  const lista = (mensajes) => `<div class="mensajes-lista">${mensajes.map(({ nombre, mensaje }) => `
    <blockquote class="mensaje-item"><p>“${esc(mensaje)}”</p><cite>${esc(nombre)}</cite></blockquote>`).join('')}</div>`;
  const nuevos = familias.filter((f) => f.confirmacion?.mensaje).map((f) => ({ nombre: f.nombre, mensaje: f.confirmacion.mensaje }));
  const antes = familias.filter((f) => f.respuesta?.mensaje).map((f) => ({ nombre: f.nombre, mensaje: f.respuesta.mensaje }));
  document.getElementById('mensajes').innerHTML = `<h2 class="bloque-titulo" id="tituloMensajes">Mensajes para la bebé</h2>
    ${nuevos.length ? lista(nuevos) : '<p class="vacio">Aquí aparecerán los mensajes que dejen para la bebé.</p>'}
    ${antes.length ? `<div class="mensajes-antes">
      <h3 class="mensajes-antes-titulo">Los que dejaron para la revelación</h3>
      <p class="mensajes-antes-nota">Llegaron cuando la invitación era para la revelación. Se guardan aquí.</p>
      ${lista(antes)}
    </div>` : ''}`;
}

// ---------- Utilidades ----------

function enlace(familia) {
  return `${location.origin}/i/${familia.codigo}`;
}

function whatsapp(familia) {
  const texto = [
    `¡Hola, ${familia.nombre}! 🦋`,
    '',
    `${EVENTO.papas} los invitan a su baby shower para celebrar la llegada de su hermosa bebé.`,
    '',
    `📅 ${EVENTO.fecha} · ${EVENTO.hora}`,
    `📍 ${EVENTO.lugar}`,
    '',
    'Abran su invitación y confirmen aquí:',
    enlace(familia),
  ].join('\n');
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    avisar('Link copiado.');
  } catch {
    prompt('Copia este link:', texto);
  }
}

function avisar(mensaje) {
  const aviso = document.getElementById('aviso');
  aviso.textContent = mensaje;
  aviso.classList.add('visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove('visible'), 2600);
}

function leerClave() {
  try {
    return localStorage.getItem(GUARDADA) || '';
  } catch {
    return '';
  }
}

function guardarClave(valor) {
  try {
    localStorage.setItem(GUARDADA, valor);
  } catch {
    // Sin almacenamiento: habrá que escribir la clave en cada visita.
  }
}

function olvidarClave() {
  clave = '';
  try {
    localStorage.removeItem(GUARDADA);
  } catch {
    // Nada que borrar.
  }
}
