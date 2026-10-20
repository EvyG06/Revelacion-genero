// Ilustraciones e íconos en SVG hechos a mano para la invitación.

const PICO = '#F0AA8E';
const PICO_SOMBRA = '#D98F73';
const CONTORNO = '#D3C1AB';
const TELA = '#F5EADB';
const TELA_SOMBRA = '#D9C4A8';

// La cigüeña mira a la izquierda; el ala se dibuja con el hombro en (0, 0) para poder aletear.
const CUERPO = 'M124 94C126 78 152 70 180 72C206 74 228 82 242 90L262 86L252 95L265 101L244 102C224 112 192 118 166 116C140 114 122 108 124 94Z';
const CUELLO = 'M76 74C92 82 108 88 130 92';
const ALA_BASE = 'M0 4C-6-24 0-56 20-80C30-92 40-100 52-106C50-86 48-64 44-44C40-26 34-10 28 6Z';
const ALA_PLUMAS = 'M52-106C60-112 68-114 74-114C70-110 68-106 66-102C74-104 80-102 84-98C78-94 74-90 70-88C78-88 84-84 86-80C80-76 74-72 68-70C74-66 78-60 78-56C70-54 62-50 58-46C64-40 66-34 66-30C58-28 52-24 48-20C52-14 52-8 50-4C44-2 36 2 28 6C34-10 40-26 44-44C48-64 50-86 52-106Z';

const ala = (clase, base, plumas, borde = '') => `<g class="ala ${clase}">
  <path d="${ALA_BASE}" fill="${base}" ${borde}/>
  <path d="${ALA_PLUMAS}" fill="${plumas}"/>
</g>`;

// El bulto cuelga del pico: una punta de la tela va detrás del pico y otra delante.
const BULTO_ATRAS = `<g class="columpio"><path d="M40 92C42 86 46 80 50 75C49 82 47 88 44 94Z" fill="${TELA_SOMBRA}"/></g>`;
const BULTO = `<g class="columpio">
  <path d="M33 92C29 87 25 81 22 75C28 78 33 83 38 89Z" fill="${TELA}" stroke="${TELA_SOMBRA}" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M36 96C14 98 6 128 19 140C27 148 47 148 55 140C67 126 59 98 36 96Z" fill="${TELA}" stroke="${TELA_SOMBRA}" stroke-width="1.5"/>
  <path d="M22 132C30 140 46 140 54 130C50 142 26 144 22 132Z" fill="${TELA_SOMBRA}" opacity=".45"/>
  <circle cx="24" cy="116" r="3" fill="#F5D3CE"/><circle cx="47" cy="111" r="3" fill="#D2E4EF"/>
  <circle cx="51" cy="128" r="2.6" fill="#F5D3CE"/><circle cx="22" cy="129" r="2.4" fill="#D2E4EF"/>
  <circle cx="40" cy="141" r="2.2" fill="#F5D3CE"/>
  <text x="37" y="131" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-weight="600" font-size="22" fill="#B99B76">?</text>
  <ellipse cx="36" cy="94" rx="7" ry="4.6" fill="${TELA}" stroke="${TELA_SOMBRA}" stroke-width="1.5"/>
</g>`;
const SOBRE = `<g class="carga-sobre"><g class="columpio">
  <path d="M36 82V101" stroke="#B9A285" stroke-width="1.4"/>
  <rect x="16" y="100" width="40" height="28" rx="3" fill="${TELA}" stroke="#CDB79A" stroke-width="1.4"/>
  <path d="M17 101L36 116L55 101" fill="none" stroke="#CDB79A" stroke-width="1.4" stroke-linejoin="round"/>
  <circle cx="36" cy="115" r="4.4" fill="#C9A66B"/>
</g></g>`;

export function ciguena({ carga = 'bulto' } = {}) {
  const borde = `stroke="${CONTORNO}" stroke-width="2" stroke-linejoin="round"`;
  return `<svg class="ciguena" viewBox="-14 -24 300 180" aria-hidden="true" focusable="false">
  <g class="ciguena-cuerpo">
    <g transform="translate(150 84) scale(.9)">${ala('ala-lejana', '#EFE6DA', '#A19284')}</g>
    <g fill="none" stroke="${PICO}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M212 108L280 116M280 116l7-4M280 116l8 1"/>
      <path d="M216 112L276 128M276 128l7-3M276 128l7 3"/>
    </g>
    <g fill="${CONTORNO}" stroke="${CONTORNO}" stroke-linejoin="round" stroke-linecap="round">
      <path d="${CUERPO}" stroke-width="4"/>
      <path d="${CUELLO}" fill="none" stroke-width="20"/>
      <circle cx="72" cy="70" r="15" stroke="none"/>
    </g>
    <g fill="#fff">
      <path d="${CUERPO}"/>
      <path d="${CUELLO}" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/>
      <circle cx="72" cy="70" r="13"/>
    </g>
    <path d="M136 106C162 116 204 114 232 101C206 108 168 111 136 106Z" fill="#F2E9DE"/>
    ${carga === 'bulto' ? BULTO_ATRAS : ''}
    <path d="M62 67L14 88L62 78Z" fill="${PICO}" stroke="${PICO_SOMBRA}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M61 73L19 86" stroke="${PICO_SOMBRA}" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="70" cy="66" r="2.8" fill="#4A3A2E"/>
    <circle cx="71" cy="65" r=".9" fill="#fff"/>
    <ellipse cx="78" cy="74" rx="4" ry="2.6" fill="#F5B8B0" opacity=".85"/>
    <g transform="translate(166 86)">${ala('ala-cercana', '#fff', '#7A6B60', borde)}</g>
    ${carga === 'bulto' ? BULTO : carga === 'sobre' ? SOBRE : ''}
  </g>
</svg>`;
}

// Moño para Team Niña y corbatín para Team Niño (toman el color del texto).
export const ICONO_NINA = `<svg class="icono-apuesta" viewBox="0 0 40 28" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M20 12.5C13 2.5 3 2 3.2 10c.2 7 9 8 16.8 3.6Zm0 0C27 2.5 37 2 36.8 10c-.2 7-9 8-16.8 3.6Z"/>
  <path fill="currentColor" opacity=".75" d="M18.2 14.6 12.5 26l4-.8 3-10.2Zm3.6 0L27.5 26l-4-.8-3-10.2Z"/>
  <circle cx="20" cy="13.2" r="4.2" fill="currentColor"/>
</svg>`;
export const ICONO_NINO = `<svg class="icono-apuesta" viewBox="0 0 40 28" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M17 14 4.5 6.2C3 5.3 1.5 6.3 1.5 8v12c0 1.7 1.5 2.7 3 1.8Zm6 0 12.5-7.8c1.5-.9 3 .1 3 1.8v12c0 1.7-1.5 2.7-3 1.8Z"/>
  <rect x="15.5" y="9.5" width="9" height="9" rx="2.6" fill="currentColor"/>
</svg>`;

const ICONOS = {
  calendario: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  ubicacion: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  navegar: '<path d="M20 4 4 11l6.5 2.5L13 20Z"/>',
  adelante: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  atras: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  corazon: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>',
  nube: '<path d="M7 18h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.1 9.6 4.2 4.2 0 0 0 7 18Z"/>',
  persona: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.6-6 7-6s6.2 2 7 6"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  menos: '<path d="M5 12h14"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
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
