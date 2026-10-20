import { ICONO_NINA, ICONO_NINO } from './ilustraciones.js';

export const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (caracter) => ENTIDADES[caracter]);
}

export function lugares(cantidad) {
  return `${cantidad} ${cantidad === 1 ? 'lugar reservado' : 'lugares reservados'}`;
}

// Barra de "Así van las apuestas". Arranca en 50/50 y animarMarcador la lleva a su valor.
export function marcador(apuestas) {
  const nina = apuestas?.nina ?? 0;
  const nino = apuestas?.nino ?? 0;
  const total = nina + nino;
  const pNina = total ? Math.round((nina / total) * 100) : 50;
  const pNino = 100 - pNina;
  return `<div class="marcador">
    <p class="marcador-titulo">Así van las apuestas</p>
    <div class="marcador-barra" role="img" aria-label="Team Niña ${pNina} %, Team Niño ${pNino} %">
      <span class="marcador-nina" data-ancho="${pNina}%"></span>
      <span class="marcador-nino" data-ancho="${pNino}%"></span>
    </div>
    <div class="marcador-equipos">
      <span class="equipo equipo-nina">${ICONO_NINA}<span>Team Niña</span><strong>${pNina}%</strong></span>
      <span class="equipo equipo-nino"><strong>${pNino}%</strong><span>Team Niño</span>${ICONO_NINO}</span>
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
