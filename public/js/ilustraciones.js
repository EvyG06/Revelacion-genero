// Ilustraciones de la invitación: las mariposas en acuarela (recortadas de la imagen de
// referencia, en public/img/mariposas/) y los íconos de línea.

export const MARIPOSAS = '/img/mariposas';

// Mariposa pequeña, tal cual sale de la acuarela.
export function mariposita(nombre, clase = '') {
  return `<img class="${clase}" src="${MARIPOSAS}/${nombre}.webp" alt="" draggable="false">`;
}

// La mariposa grande: dos copias de la misma imagen, cada una muestra un ala y gira sobre el cuerpo.
export function mariposaGrande() {
  const ala = (lado) => `<img class="ala-${lado}" src="${MARIPOSAS}/grande.webp" alt="" draggable="false">`;
  return `${ala('izq')}${ala('der')}`;
}

export function pintarMariposas(raiz = document) {
  raiz.querySelectorAll('[data-mariposa]').forEach((nodo) => {
    nodo.innerHTML = mariposaGrande();
  });
}

// ---------- Íconos de línea ----------

const ICONOS = {
  calendario: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  ubicacion: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  sobre: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7.5 7.5 5.5 7.5-5.5"/>',
  navegar: '<path d="M20 4 4 11l6.5 2.5L13 20Z"/>',
  adelante: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  atras: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  menos: '<path d="M5 12h14"/>',
  editar: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>',
  enviar: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4Z"/>',
  nota: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  silencio: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/><path d="M3 3l18 18"/>',
  whatsapp: '<path d="M4.5 19.5l1.2-3.7A8 8 0 1 1 8.4 18.4Z"/><path d="M9.3 8.6c.1 2.8 2.4 5.2 5.2 5.7l1.2-1.4-1.9-1-1 .7a4 4 0 0 1-2.3-2.3l.7-1-1-1.9Z"/>',
  copiar: '<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
  ojo: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  basura: '<path d="M4.5 7h15M10 7V4.5h4V7M6.5 7l1 13h9l1-13"/>',
  descargar: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  refrescar: '<path d="M20 12a8 8 0 1 1-2.6-5.9M20 4.5V9h-4.5"/>',
  reiniciar: '<path d="M4 12a8 8 0 1 0 2.6-5.9M4 4.5V9h4.5"/>',
  salir: '<path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10M15 8l4 4-4 4M19 12H9.5"/>',
};

export function icono(nombre) {
  return `<svg class="icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONOS[nombre] ?? ''}</svg>`;
}

export function pintarIconos(raiz = document) {
  raiz.querySelectorAll('[data-icono]').forEach((nodo) => {
    nodo.innerHTML = icono(nodo.dataset.icono);
  });
}
