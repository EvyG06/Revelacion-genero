// Caja musical hecha con Web Audio: "Estrellita, ¿dónde estás?", melodía tradicional.
import { icono } from './ilustraciones.js';

const PULSOS_POR_MINUTO = 84;
const MELODIA = 'C5 C5 G5 G5 A5 A5 G5:2 F5 F5 E5 E5 D5 D5 C5:2 G5 G5 F5 F5 E5 E5 D5:2 G5 G5 F5 F5 E5 E5 D5:2 C5 C5 G5 G5 A5 A5 G5:2 F5 F5 E5 E5 D5 D5 C5:2 -:4';
// Un acorde cada dos pulsos, con la fundamental y la quinta.
const ACORDES = 'C C F C F C G C C F C G C F C G C C F C F C G C - -';
const FUNDAMENTALES = { C: 60, F: 53, G: 55 };
const SEMITONOS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const PREFERENCIA = 'revelacion-musica';

function partitura() {
  const eventos = [];
  let pulso = 0;
  for (const ficha of MELODIA.split(' ')) {
    const [nota, duracion = '1'] = ficha.split(':');
    if (nota !== '-') {
      const [, letra, octava] = nota.match(/([A-G])(\d)/);
      eventos.push({ pulso, nota: 12 * (Number(octava) + 1) + SEMITONOS[letra], volumen: 0.55 });
    }
    pulso += Number(duracion);
  }
  ACORDES.split(' ').forEach((acorde, i) => {
    if (acorde === '-') return;
    const fundamental = FUNDAMENTALES[acorde];
    eventos.push({ pulso: i * 2, nota: fundamental, volumen: 0.3 });
    eventos.push({ pulso: i * 2 + 1, nota: fundamental + 7, volumen: 0.2 });
  });
  return { eventos: eventos.sort((a, b) => a.pulso - b.pulso), largo: pulso };
}

function eco(contexto, segundos) {
  const muestras = Math.floor(contexto.sampleRate * segundos);
  const buffer = contexto.createBuffer(2, muestras, contexto.sampleRate);
  for (let canal = 0; canal < 2; canal++) {
    const datos = buffer.getChannelData(canal);
    for (let i = 0; i < muestras; i++) datos[i] = (Math.random() * 2 - 1) * (1 - i / muestras) ** 3.5;
  }
  return buffer;
}

function leerPreferencia() {
  try {
    return localStorage.getItem(PREFERENCIA);
  } catch {
    return null;
  }
}

function guardarPreferencia(valor) {
  try {
    localStorage.setItem(PREFERENCIA, valor);
  } catch {
    // Sin almacenamiento (modo privado): la preferencia solo dura esta visita.
  }
}

export function crearMusica(boton) {
  const { eventos, largo } = partitura();
  const segundosPorPulso = 60 / PULSOS_POR_MINUTO;
  let contexto = null;
  let salida = null;
  let temporizador = null;
  let activa = false;
  let indice = 0;
  let base = 0;

  boton.addEventListener('click', () => {
    if (activa) apagar();
    else encender();
    guardarPreferencia(activa ? 'si' : 'no');
  });
  document.addEventListener('visibilitychange', () => {
    if (!contexto || !activa) return;
    if (document.hidden) contexto.suspend();
    else contexto.resume();
  });
  pintarBoton();

  return {
    // Se llama dentro del toque al sello: los navegadores solo dejan sonar audio tras un gesto.
    alAbrir() {
      if (leerPreferencia() !== 'no') encender();
    },
    mostrarBoton() {
      boton.hidden = false;
    },
  };

  function preparar() {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (!Contexto) return false;
    contexto = new Contexto();
    salida = contexto.createGain();
    salida.gain.value = 0;
    const filtro = contexto.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 5200;
    const seco = contexto.createGain();
    seco.gain.value = 0.8;
    const reverberacion = contexto.createConvolver();
    reverberacion.buffer = eco(contexto, 2.6);
    const humedo = contexto.createGain();
    humedo.gain.value = 0.45;
    salida.connect(filtro);
    filtro.connect(seco).connect(contexto.destination);
    filtro.connect(reverberacion).connect(humedo).connect(contexto.destination);
    return true;
  }

  // Timbre de caja musical: una nota base con armónicos que se apagan rápido.
  function tocar(nota, cuando, volumen) {
    const frecuencia = 440 * 2 ** ((nota - 69) / 12);
    for (const [relacion, peso, caida] of [[1, 1, 2.4], [2, 0.3, 1.2], [3, 0.12, 0.7], [4.2, 0.07, 0.45]]) {
      const oscilador = contexto.createOscillator();
      const envolvente = contexto.createGain();
      oscilador.type = 'sine';
      oscilador.frequency.value = frecuencia * relacion;
      envolvente.gain.setValueAtTime(0.0001, cuando);
      envolvente.gain.exponentialRampToValueAtTime(volumen * peso, cuando + 0.006);
      envolvente.gain.exponentialRampToValueAtTime(0.0001, cuando + caida);
      oscilador.connect(envolvente).connect(salida);
      oscilador.start(cuando);
      oscilador.stop(cuando + caida + 0.05);
    }
  }

  function programar() {
    const horizonte = contexto.currentTime + 0.6;
    for (;;) {
      const evento = eventos[indice];
      const cuando = base + evento.pulso * segundosPorPulso;
      if (cuando > horizonte) break;
      if (cuando >= contexto.currentTime - 0.05) tocar(evento.nota, Math.max(cuando, contexto.currentTime), evento.volumen);
      indice += 1;
      if (indice === eventos.length) {
        indice = 0;
        base += largo * segundosPorPulso;
      }
    }
  }

  function encender() {
    if (!contexto && !preparar()) return;
    contexto.resume();
    if (!activa) {
      activa = true;
      indice = 0;
      base = contexto.currentTime + 0.15;
      programar();
      temporizador = setInterval(programar, 150);
    }
    salida.gain.cancelScheduledValues(contexto.currentTime);
    salida.gain.setTargetAtTime(0.2, contexto.currentTime, 0.6);
    pintarBoton();
  }

  function apagar() {
    if (!activa) return;
    activa = false;
    clearInterval(temporizador);
    salida.gain.cancelScheduledValues(contexto.currentTime);
    salida.gain.setTargetAtTime(0, contexto.currentTime, 0.15);
    setTimeout(() => {
      if (!activa) contexto.suspend();
    }, 700);
    pintarBoton();
  }

  function pintarBoton() {
    boton.innerHTML = icono(activa ? 'nota' : 'silencio');
    boton.setAttribute('aria-pressed', String(activa));
    boton.setAttribute('aria-label', activa ? 'Pausar la música' : 'Poner música');
  }
}
