// Confirmación en pasos: asistencia → cuántos → quiénes → mensaje → gracias.
// Si no pueden ir, pasan directo a dejarle un mensaje a la bebé.
import { EVENTO } from './evento.js';
import { icono, mariposaGrande, mariposita } from './ilustraciones.js';
import { chip, esc, esperar, lugares } from './comun.js';
import { soltarMariposas } from './mariposas.js';

const PASOS_SI = ['asistencia', 'cantidad', 'personas', 'mensaje'];
const PASOS_NO = ['asistencia', 'mensaje'];
const ASIENTOS = ['chica-rosa', 'chica-lila', 'mini-rosa'];

export function montarRsvp(raiz, { codigo, datos, recargar, alResponder }) {
  const cuerpo = raiz.querySelector('[data-rsvp-cuerpo]');
  const cupo = raiz.querySelector('[data-rsvp-cupo]');
  const estado = { paso: 'asistencia', asiste: null, cantidad: 1, personas: [], mensaje: '', enviando: false };
  let familia = null;

  cuerpo.addEventListener('click', alTocar);
  cuerpo.addEventListener('input', alEscribir);
  cuerpo.addEventListener('keydown', alPresionarTecla);
  usarDatos(datos);

  function usarDatos(nuevos) {
    if (!nuevos.familia) {
      cuerpo.innerHTML = vistaError(nuevos.error);
      return;
    }
    familia = nuevos.familia;
    cupo.textContent = `Tienen ${lugares(familia.cupo)} para ustedes.`;
    cargarRespuesta();
    ir(familia.respuesta ? 'gracias' : 'asistencia', false);
  }

  function cargarRespuesta() {
    const respuesta = familia.respuesta;
    estado.asiste = respuesta ? respuesta.asiste : null;
    estado.personas = respuesta ? respuesta.personas.map((persona) => ({ ...persona })) : [];
    estado.cantidad = Math.max(1, estado.personas.length);
    estado.mensaje = respuesta?.mensaje ?? '';
  }

  function ir(paso, animado = true) {
    estado.paso = paso;
    cuerpo.innerHTML = vista();
    if (animado) {
      cuerpo.firstElementChild?.animate(
        [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
        { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' },
      );
    }
  }

  function vista() {
    switch (estado.paso) {
      case 'asistencia': return vistaAsistencia();
      case 'cantidad': return vistaCantidad();
      case 'personas': return vistaPersonas();
      case 'mensaje': return vistaMensaje();
      case 'enviando': return vistaEnviando();
      default: return vistaGracias();
    }
  }

  // ---------- Vistas ----------

  // Una mariposita por paso: las de los pasos hechos se colorean y la actual crece.
  function indicador() {
    const pasos = estado.asiste === false ? PASOS_NO : PASOS_SI;
    const actual = pasos.indexOf(estado.paso);
    const items = pasos.map((_, i) => `<li class="${i < actual ? 'hecho' : i === actual ? 'actual' : ''}">${mariposita('chica-rosa')}</li>`).join('');
    return `<ol class="rsvp-pasos" aria-label="Paso ${actual + 1} de ${pasos.length}">${items}</ol>`;
  }

  function navegacion(texto, accion = 'siguiente') {
    return `<div class="navegacion">
      <button type="button" class="boton boton-suave" data-accion="atras">${icono('atras')}<span>Atrás</span></button>
      <button type="button" class="boton boton-principal" data-accion="${accion}">
        <span>${texto}</span>${icono(accion === 'enviar' ? 'enviar' : 'adelante')}
      </button>
    </div>`;
  }

  function vistaAsistencia() {
    return `<div class="paso">
      ${indicador()}
      <h3 class="paso-titulo">¿Nos acompañan?</h3>
      <div class="opciones">
        <button type="button" class="opcion ${estado.asiste === true ? 'elegida' : ''}" data-accion="asistir" data-valor="si">
          ${mariposita('chica-rosa')}
          <span class="opcion-texto"><strong>¡Sí, allí estaremos!</strong><small>Cuéntennos quiénes van</small></span>
        </button>
        <button type="button" class="opcion ${estado.asiste === false ? 'elegida' : ''}" data-accion="asistir" data-valor="no">
          ${mariposita('chica-lila')}
          <span class="opcion-texto"><strong>No podremos ir</strong><small>Igual pueden dejarle un mensaje a la bebé</small></span>
        </button>
      </div>
    </div>`;
  }

  function vistaCantidad() {
    const asientos = Array.from({ length: familia.cupo }, (_, i) => `
      <button type="button" class="asiento ${i < estado.cantidad ? 'ocupado' : ''}" data-accion="elegir" data-valor="${i + 1}" aria-label="${i + 1} ${i === 0 ? 'persona' : 'personas'}">${mariposita(ASIENTOS[i % ASIENTOS.length])}</button>`).join('');
    return `<div class="paso">
      ${indicador()}
      <h3 class="paso-titulo">¿Cuántos vienen?</h3>
      <p class="paso-texto">Toquen una mariposa por cada persona o usen los botones.</p>
      <div class="contador">
        <button type="button" class="contador-boton" data-accion="menos" aria-label="Uno menos" ${estado.cantidad <= 1 ? 'disabled' : ''}>${icono('menos')}</button>
        <output class="contador-numero" aria-live="polite">${estado.cantidad}</output>
        <button type="button" class="contador-boton" data-accion="mas" aria-label="Uno más" ${estado.cantidad >= familia.cupo ? 'disabled' : ''}>${icono('mas')}</button>
      </div>
      <div class="asientos">${asientos}</div>
      ${navegacion('Siguiente')}
    </div>`;
  }

  function vistaPersonas() {
    const filas = estado.personas.map((persona, i) => `
      <li class="persona" data-indice="${i}">
        <label class="persona-campo">
          <span class="persona-numero" aria-hidden="true">${i + 1}.</span>
          <input type="text" name="nombre" value="${esc(persona.nombre)}" maxlength="60"
            placeholder="${i === 0 ? 'Nombre (ej. Ana Gómez)' : 'Nombre'}" autocomplete="off" autocapitalize="words"
            enterkeyhint="${i === estado.personas.length - 1 ? 'done' : 'next'}" aria-label="Nombre de la persona ${i + 1}">
        </label>
      </li>`).join('');
    return `<div class="paso">
      ${indicador()}
      <h3 class="paso-titulo">¿Quiénes vienen?</h3>
      <p class="paso-texto">Escriban el nombre de cada uno.</p>
      <ol class="personas">${filas}</ol>
      <p class="paso-error" role="alert"></p>
      ${navegacion('Siguiente')}
    </div>`;
  }

  function vistaMensaje() {
    const titulo = estado.asiste ? 'Un mensaje para la bebé' : '¡Los vamos a extrañar!';
    const texto = estado.asiste
      ? `Es opcional: unas palabras bonitas que ${EVENTO.papas} podrán guardar para siempre.`
      : `Si quieren, déjenle un mensaje a la bebé. ${EVENTO.papas} lo podrán guardar para siempre.`;
    return `<div class="paso">
      ${indicador()}
      <h3 class="paso-titulo">${titulo}</h3>
      <p class="paso-texto">${texto}</p>
      <label class="mensaje">
        <span class="sr">Mensaje para la bebé</span>
        <textarea name="mensaje" rows="4" maxlength="500" placeholder="Escriban aquí sus buenos deseos…">${esc(estado.mensaje)}</textarea>
        <span class="mensaje-contador" data-contador>${estado.mensaje.length}/500</span>
      </label>
      <p class="paso-error" role="alert"></p>
      ${navegacion('Enviar respuesta', 'enviar')}
    </div>`;
  }

  function vistaEnviando() {
    return `<div class="paso enviando" aria-live="polite">
      <span class="mariposa mariposa-suelta volando" aria-hidden="true">${mariposaGrande()}</span>
      <p class="paso-texto">Una mariposa está llevando su respuesta…</p>
    </div>`;
  }

  function vistaGracias() {
    const { asiste, personas, mensaje } = familia.respuesta;
    return `<div class="paso gracias">
      <h3 class="gracias-titulo">${asiste ? '¡Gracias por confirmar!' : '¡Gracias por avisarnos!'}</h3>
      <p class="paso-texto">${asiste
        ? `¡Los esperamos el ${EVENTO.fecha.toLowerCase()} a las ${EVENTO.hora}!`
        : 'Los vamos a extrañar mucho. ¡Gracias por acompañarnos desde lejos!'}</p>
      ${personas.length ? `<ul class="chips">${personas.map(chip).join('')}</ul>` : ''}
      ${mensaje ? `<blockquote class="cita">“${esc(mensaje)}”</blockquote>` : ''}
      <button type="button" class="boton boton-suave" data-accion="cambiar">${icono('editar')}<span>Cambiar respuesta</span></button>
    </div>`;
  }

  function vistaError(mensaje) {
    return `<div class="paso">
      <p class="paso-texto">${esc(mensaje || 'No pudimos cargar su invitación.')}</p>
      <div class="navegacion navegacion-centro">
        <button type="button" class="boton" data-accion="reintentar">${icono('refrescar')}<span>Intentar de nuevo</span></button>
      </div>
    </div>`;
  }

  // ---------- Acciones ----------

  function alTocar(evento) {
    const boton = evento.target.closest('[data-accion]');
    if (!boton || boton.disabled) return;
    const { accion, valor } = boton.dataset;
    if (accion === 'asistir') {
      estado.asiste = valor === 'si';
      boton.classList.add('elegida');
      setTimeout(() => ir(estado.asiste ? 'cantidad' : 'mensaje'), 220);
    } else if (accion === 'menos') cambiarCantidad(estado.cantidad - 1);
    else if (accion === 'mas') cambiarCantidad(estado.cantidad + 1);
    else if (accion === 'elegir') cambiarCantidad(Number(valor));
    else if (accion === 'atras') ir(pasoAnterior());
    else if (accion === 'siguiente') siguiente();
    else if (accion === 'enviar') enviar();
    else if (accion === 'cambiar') {
      cargarRespuesta();
      ir('asistencia');
    } else if (accion === 'reintentar') {
      cuerpo.innerHTML = '<p class="cargando">Cargando…</p>';
      recargar().then(usarDatos);
    }
  }

  function alEscribir(evento) {
    const campo = evento.target;
    if (campo.name === 'nombre') {
      const fila = campo.closest('.persona');
      estado.personas[Number(fila.dataset.indice)].nombre = campo.value;
      fila.classList.remove('con-error');
    } else if (campo.name === 'mensaje') {
      estado.mensaje = campo.value;
      cuerpo.querySelector('[data-contador]').textContent = `${campo.value.length}/500`;
    }
  }

  function alPresionarTecla(evento) {
    if (evento.key !== 'Enter' || evento.target.name !== 'nombre') return;
    evento.preventDefault();
    const campos = [...cuerpo.querySelectorAll('input[name="nombre"]')];
    const siguienteCampo = campos[campos.indexOf(evento.target) + 1];
    if (siguienteCampo) siguienteCampo.focus();
    else evento.target.blur();
  }

  function cambiarCantidad(cantidad) {
    estado.cantidad = Math.max(1, Math.min(familia.cupo, cantidad));
    ir('cantidad', false);
    cuerpo.querySelector('.contador-numero').animate(
      [{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
      { duration: 260, easing: 'ease-out' },
    );
  }

  function pasoAnterior() {
    if (estado.paso === 'mensaje') return estado.asiste ? 'personas' : 'asistencia';
    if (estado.paso === 'personas') return 'cantidad';
    return 'asistencia';
  }

  function siguiente() {
    if (estado.paso === 'cantidad') {
      while (estado.personas.length < estado.cantidad) estado.personas.push({ nombre: '' });
      estado.personas.length = estado.cantidad;
      ir('personas');
    } else if (estado.paso === 'personas' && personasCompletas()) {
      ir('mensaje');
    }
  }

  function personasCompletas() {
    const filas = cuerpo.querySelectorAll('.persona');
    for (const [i, persona] of estado.personas.entries()) {
      if (!persona.nombre.trim()) return marcarError(filas[i], `Falta el nombre de la persona ${i + 1}.`);
    }
    return true;
  }

  function marcarError(fila, mensaje) {
    mostrarError(mensaje);
    fila.classList.add('con-error');
    fila.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
      { duration: 320 },
    );
    fila.querySelector('input').focus();
    return false;
  }

  function mostrarError(mensaje) {
    const nodo = cuerpo.querySelector('.paso-error');
    if (nodo) nodo.textContent = mensaje;
  }

  async function enviar() {
    if (estado.enviando) return;
    estado.enviando = true;
    const respuesta = {
      asiste: estado.asiste,
      personas: estado.asiste ? estado.personas.map(({ nombre }) => ({ nombre: nombre.trim() })) : [],
      mensaje: estado.mensaje.trim(),
    };
    ir('enviando');
    const inicio = performance.now();
    try {
      const peticion = await fetch(`/api/invitacion?c=${encodeURIComponent(codigo)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(respuesta),
      });
      const resultado = await peticion.json().catch(() => ({}));
      if (!peticion.ok) throw new Error(resultado.error || 'No pudimos guardar su respuesta. Inténtenlo de nuevo.');
      await esperar(Math.max(0, 1500 - (performance.now() - inicio)));
      familia = resultado.familia;
      cargarRespuesta();
      ir('gracias');
      raiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
      soltarMariposas();
      alResponder?.(familia);
    } catch (error) {
      ir('mensaje');
      mostrarError(error instanceof TypeError ? 'No hay conexión. Revisen su internet e inténtenlo de nuevo.' : error.message);
    } finally {
      estado.enviando = false;
    }
  }
}
