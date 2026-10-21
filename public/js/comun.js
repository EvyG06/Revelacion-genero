import { GLOBO, recorte } from './ilustraciones.js';

export const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (caracter) => ENTIDADES[caracter]);
}

export function lugares(cantidad) {
  return `${cantidad} ${cantidad === 1 ? 'lugar reservado' : 'lugares reservados'}`;
}

// Nombre con un globo del color de su apuesta.
export function chip(persona) {
  return `<li class="chip chip-${persona.apuesta}">${GLOBO}<span>${esc(persona.nombre)}</span></li>`;
}

// "Así van las apuestas": el osito del equipo que va ganando se ve más grande.
// La barra arranca en 50/50 y animarMarcador la lleva a su valor.
export function marcador(apuestas) {
  const nina = apuestas?.nina ?? 0;
  const nino = apuestas?.nino ?? 0;
  const total = nina + nino;
  const pNina = total ? Math.round((nina / total) * 100) : 50;
  const pNino = 100 - pNina;
  const equipo = (clase, oso, nombre, porcentaje) => `
    <figure class="equipo equipo-${clase}" style="--peso:${porcentaje / 100}">
      <span class="equipo-oso">${recorte(oso)}</span>
      <figcaption><strong>${porcentaje}%</strong><span>${nombre}</span></figcaption>
    </figure>`;
  return `<div class="marcador">
    <p class="marcador-titulo">Así van las apuestas</p>
    <div class="marcador-equipos">
      ${equipo('nina', 'osoNina', 'Team Niña', pNina)}
      ${equipo('nino', 'osoNino', 'Team Niño', pNino)}
    </div>
    <div class="marcador-barra" role="img" aria-label="Team Niña ${pNina} %, Team Niño ${pNino} %">
      <span class="marcador-nina" data-ancho="${pNina}%"></span>
      <span class="marcador-nino" data-ancho="${pNino}%"></span>
    </div>
    <p class="marcador-total">${total ? `${total} ${total === 1 ? 'apuesta' : 'apuestas'} hasta ahora` : 'Todavía no hay apuestas'}</p>
  </div>`;
}

export function animarMarcador(raiz) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    raiz.querySelectorAll('[data-ancho]').forEach((barra) => {
      barra.style.width = barra.dataset.ancho;
    });
  }));
}
