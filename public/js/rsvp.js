// Confirmación en pasos: asistencia → cuántos → quiénes y su apuesta → mensaje → gracias.
import { EVENTO } from './evento.js';
import { GLOBO, ciguena, icono } from './ilustraciones.js';
import { animarMarcador, chip, esc, esperar, lugares, marcador } from './comun.js';
import { soltarGlobos } from './globos.js';

const PASOS = ['asistencia', 'cantidad', 'personas', 'mensaje'];

export function montarRsvp(raiz, { codigo, datos, recargar, alResponder }) {
  const cuerpo = raiz.querySelector('[data-rsvp-cuerpo]');
  const cupo = raiz.querySelector('[data-rsvp-cupo]');
  const estado = { paso: 'asistencia', asiste: null, cantidad: 1, personas: [], mensaje: '', enviando: false };
  let familia = null;
  let apuestas = null;

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
    apuestas = nuevos.apuestas;
    cupo.textContent = `Tienen ${lugares(familia.cupo)} para ustedes.`;
    cargarRespuesta();
    ir(familia.respuesta ? 'gracias' : 'asistencia', false);
  }

  function cargarRespuesta() {
    const respuesta = familia.respuesta;
    estado.asiste = respuesta ? respuesta.asiste : null;
    estado.personas = respuesta ? respuesta.personas.map((persona) => ({ ...persona })) : [];
    estado.cantidad = respuesta ? respuesta.personas.length : 1;
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
    if (paso === 'gracias') animarMarcador(cuerpo);
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

  // Un globito por paso: los ya hechos se llenan y el actual sube un poco.
  function indicador() {
    const actual = PASOS.indexOf(estado.paso);
    const globos = PASOS.map((_, i) => `<li class="${i < actual ? 'hecho' : i === actual ? 'actual' : ''}">${GLOBO}</li>`).join('');
    return `<ol class="rsvp-pasos" aria-label="Paso ${actual + 1} de ${PASOS.length}">${globos}</ol>`;
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
          <span class="opcion-globos"><span class="g-rosa">${GLOBO}</span><span class="g-cielo">${GLOBO}</span></span>
          <span class="opcion-texto"><strong>¡Sí, allí estaremos!</strong><small>Cuéntennos quiénes van</small></span>
        </button>
        <button type="button" class="opcion ${estado.asiste === false ? 'elegida' : ''}" data-accion="asistir" data-valor="no">
          <span class="opcion-globos"><span class="g-arena">${GLOBO}</span></span>
          <span class="opcion-texto"><strong>No podremos ir</strong><small>Igual pueden dejar su apuesta</small></span>
        </button>
      </div>
    </div>`;
  }

  function vistaCantidad() {
    const minimo = estado.asiste ? 1 : 0;
    const globos = Array.from({ length: familia.cupo }, (_, i) => `
      <button type="button" class="asiento ${i < estado.cantidad ? 'ocupado' : ''}" data-accion="elegir" data-valor="${i + 1}" aria-label="${i + 1} ${i === 0 ? 'persona' : 'personas'}">${GLOBO}</button>`).join('');
    return `<div class="paso">
      ${indicador()}
      <h3 class="paso-titulo">${estado.asiste ? '¿Cuántos vienen?' : '¡Los vamos a extrañar!'}</h3>
      <p class="paso-texto">${estado.asiste
        ? 'Toquen un globo por cada persona o usen los botones.'
        : 'Aunque no vengan, pueden dejar su apuesta. ¿Cuántos quieren apostar?'}</p>
      <div class="contador">
        <button type="button" class="contador-boton" data-accion="menos" aria-label="Uno menos" ${estado.cantidad <= minimo ? 'disabled' : ''}>${icono('menos')}</button>
        <output class="contador-numero" aria-live="polite">${estado.cantidad}</output>
        <button type="button" class="contador-boton" data-accion="mas" aria-label="Uno más" ${estado.cantidad >= familia.cupo ? 'disabled' : ''}>${icono('mas')}</button>
      </div>
      <div class="asientos">${globos}</div>
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
        <div class="apuesta" role="radiogroup" aria-label="¿Qué cree la persona ${i + 1} que será?">
          ${botonApuesta('nina', persona.apuesta)}
          ${botonApuesta('nino', persona.apuesta)}
        </div>
      </li>`).join('');
    return `<div class="paso">
      ${indicador()}
      <h3 class="paso-titulo">${estado.asiste ? '¿Quiénes vienen?' : '¿Quiénes apuestan?'}</h3>
      <p class="paso-texto">Escriban el nombre de cada uno y elijan su globo: ¿niña o niño?</p>
      <ol class="personas">${filas}</ol>
      <p class="paso-error" role="alert"></p>
      ${navegacion('Siguiente')}
    </div>`;
  }

  function botonApuesta(valor, actual) {
    return `<button type="button" role="radio" class="apuesta-boton apuesta-${valor}" aria-checked="${actual === valor}" data-accion="apostar" data-valor="${valor}">
      ${GLOBO}<span>${valor === 'nina' ? 'Niña' : 'Niño'}</span>
    </button>`;
  }

  function vistaMensaje() {
    return `<div class="paso">
      ${indicador()}
      <h3 class="paso-titulo">Un mensaje para el bebé</h3>
      <p class="paso-texto">Es opcional: unas palabras bonitas que ${EVENTO.papas} podrán guardar para siempre.</p>
      <label class="mensaje">
        <span class="sr">Mensaje para el bebé</span>
        <textarea name="mensaje" rows="4" maxlength="500" placeholder="Escriban aquí sus buenos deseos…">${esc(estado.mensaje)}</textarea>
        <span class="mensaje-contador" data-contador>${estado.mensaje.length}/500</span>
      </label>
      <p class="paso-error" role="alert"></p>
      ${navegacion('Enviar respuesta', 'enviar')}
    </div>`;
  }

  function vistaEnviando() {
    return `<div class="paso enviando" aria-live="polite">
      <div class="enviando-ave">${ciguena({ carga: 'sobre' })}</div>
      <p class="paso-texto">La cigüeña está llevando su respuesta…</p>
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
      ${marcador(apuestas)}
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
      if (estado.asiste && estado.cantidad < 1) estado.cantidad = 1;
      boton.classList.add('elegida');
      setTimeout(() => ir('cantidad'), 220);
    } else if (accion === 'menos') cambiarCantidad(estado.cantidad - 1);
    else if (accion === 'mas') cambiarCantidad(estado.cantidad + 1);
    else if (accion === 'elegir') cambiarCantidad(Number(valor));
    else if (accion === 'apostar') apostar(boton, valor);
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
    const minimo = estado.asiste ? 1 : 0;
    estado.cantidad = Math.max(minimo, Math.min(familia.cupo, cantidad));
    ir('cantidad', false);
    cuerpo.querySelector('.contador-numero').animate(
      [{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
      { duration: 260, easing: 'ease-out' },
    );
  }

  function apostar(boton, valor) {
    const fila = boton.closest('.persona');
    estado.personas[Number(fila.dataset.indice)].apuesta = valor;
    fila.querySelectorAll('.apuesta-boton').forEach((opcion) => {
      opcion.setAttribute('aria-checked', String(opcion.dataset.valor === valor));
    });
    fila.classList.remove('con-error');
    // El globo elegido da un saltito hacia arriba, como si se inflara.
    boton.querySelector('.globo').animate(
      [{ transform: 'translateY(0) scale(.9)' }, { transform: 'translateY(-7px) scale(1.12)' }, { transform: 'translateY(0) scale(1)' }],
      { duration: 520, easing: 'cubic-bezier(.3,1.6,.5,1)' },
    );
  }

  function pasoAnterior() {
    if (estado.paso === 'mensaje') return estado.cantidad ? 'personas' : 'cantidad';
    if (estado.paso === 'personas') return 'cantidad';
    return 'asistencia';
  }

  function siguiente() {
    if (estado.paso === 'cantidad') {
      while (estado.personas.length < estado.cantidad) estado.personas.push({ nombre: '', apuesta: null });
      estado.personas.length = estado.cantidad;
      ir(estado.cantidad ? 'personas' : 'mensaje');
    } else if (estado.paso === 'personas' && personasCompletas()) {
      ir('mensaje');
    }
  }

  function personasCompletas() {
    const filas = cuerpo.querySelectorAll('.persona');
    for (const [i, persona] of estado.personas.entries()) {
      if (!persona.nombre.trim()) return marcarError(filas[i], `Falta el nombre de la persona ${i + 1}.`, true);
      if (!persona.apuesta) return marcarError(filas[i], `¿Qué cree ${persona.nombre.trim()} que será: niña o niño?`);
    }
    return true;
  }

  function marcarError(fila, mensaje, enfocar = false) {
    mostrarError(mensaje);
    fila.classList.add('con-error');
    fila.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
      { duration: 320 },
    );
    if (enfocar) fila.querySelector('input').focus();
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
      personas: estado.personas.map(({ nombre, apuesta }) => ({ nombre: nombre.trim(), apuesta })),
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
      apuestas = resultado.apuestas;
      cargarRespuesta();
      ir('gracias');
      raiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
      soltarGlobos();
      alResponder?.(familia);
    } catch (error) {
      ir('mensaje');
      mostrarError(error instanceof TypeError ? 'No hay conexión. Revisen su internet e inténtenlo de nuevo.' : error.message);
    } finally {
      estado.enviando = false;
    }
  }
}
