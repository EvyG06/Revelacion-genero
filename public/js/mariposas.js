// Mariposas que salen volando para celebrar: suben desde abajo de la pantalla
// o, al abrir el sobre, salen de la tarjeta en abanico.
import { MARIPOSAS } from './ilustraciones.js';

const PEQUENAS = ['chica-rosa', 'chica-lila', 'mini-rosa', 'abajo-rosa', 'abajo-lila'];

export function soltarMariposas({ cantidad = 12, desde = null } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const capa = document.createElement('div');
  capa.className = 'capa-mariposas';
  capa.setAttribute('aria-hidden', 'true');
  document.body.append(capa);

  let restantes = cantidad;
  for (let i = 0; i < cantidad; i++) {
    const mariposa = document.createElement('span');
    const ancho = 26 + Math.random() * 26;
    mariposa.className = 'mariposa-vuelo';
    mariposa.style.width = `${ancho}px`;
    mariposa.innerHTML = `<img src="${MARIPOSAS}/${PEQUENAS[i % PEQUENAS.length]}.webp" alt="" draggable="false">`;
    // Cada una aletea a destiempo de las demás.
    mariposa.firstElementChild.style.animationDelay = `${(-Math.random() * 0.2).toFixed(2)}s`;
    capa.append(mariposa);

    const vuelo = desde ? enAbanico(mariposa, desde, ancho, i / Math.max(1, cantidad - 1)) : desdeAbajo(mariposa);
    vuelo.finished.catch(() => {}).finally(() => {
      restantes -= 1;
      if (!restantes) capa.remove();
    });
  }
}

function desdeAbajo(mariposa) {
  mariposa.style.left = `${4 + Math.random() * 88}%`;
  mariposa.style.top = '100%';
  const subida = innerHeight + 180;
  const vaiven = 24 + Math.random() * 40;
  const giro = (Math.random() - 0.5) * 30;
  return mariposa.animate([
    { transform: `translate(0, 0) rotate(${giro}deg)`, opacity: 0 },
    { opacity: 1, offset: 0.08 },
    { transform: `translate(${vaiven}px, -${subida * 0.3}px) rotate(${-giro}deg)`, offset: 0.3 },
    { transform: `translate(${-vaiven}px, -${subida * 0.64}px) rotate(${giro}deg)`, offset: 0.64 },
    { transform: `translate(${vaiven * 0.6}px, -${subida}px) rotate(0deg)`, opacity: 1 },
  ], {
    duration: 4200 + Math.random() * 1800,
    delay: Math.random() * 900,
    easing: 'cubic-bezier(.45,.05,.6,1)',
    fill: 'both',
  });
}

// Salen del centro de la tarjeta hacia arriba, repartidas en un abanico, y se pierden por arriba.
function enAbanico(mariposa, caja, ancho, parte) {
  mariposa.style.left = `${caja.left + caja.width / 2 - ancho / 2}px`;
  mariposa.style.top = `${caja.top + caja.height * 0.3}px`;
  const angulo = ((-165 + 150 * parte + (Math.random() - 0.5) * 16) * Math.PI) / 180;
  const distancia = 150 + Math.random() * 200;
  const dx = Math.cos(angulo) * distancia;
  const dy = Math.sin(angulo) * distancia;
  const giro = (Math.random() - 0.5) * 40;
  return mariposa.animate([
    { transform: 'translate(0, 0) scale(.3)', opacity: 0 },
    { transform: `translate(${dx * 0.15}px, ${dy * 0.15}px) scale(.6) rotate(0deg)`, opacity: 1, offset: 0.12 },
    { transform: `translate(${dx * 0.75}px, ${dy * 0.75}px) scale(1) rotate(${giro}deg)`, opacity: 1, offset: 0.6 },
    { transform: `translate(${dx * 1.1}px, ${dy - 160}px) scale(1) rotate(${-giro}deg)`, opacity: 0 },
  ], {
    duration: 2600 + Math.random() * 1200,
    delay: Math.random() * 280,
    easing: 'cubic-bezier(.2,.6,.4,1)',
    fill: 'both',
  });
}
