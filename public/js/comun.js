import { mariposita } from './ilustraciones.js';

export const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (caracter) => ENTIDADES[caracter]);
}

export function lugares(cantidad) {
  return `${cantidad} ${cantidad === 1 ? 'lugar reservado' : 'lugares reservados'}`;
}

// Nombre de una persona que va, con una mariposita.
export function chip(persona) {
  return `<li class="chip">${mariposita('mini-rosa')}<span>${esc(persona.nombre)}</span></li>`;
}
