// Ilustraciones de la invitación: la cigüeña (SVG con filtro de acuarela), los globos
// y los recortes de la acuarela de osos, estrellas y nubes (public/img/osos.webp).

// ---------- Recortes de la acuarela ----------

const IMAGEN = '/img/osos.webp';
const RECORTES = {
  osoNina: '0 135 450 760',
  osoNino: '640 145 460 750',
  nubes: '0 1560 1125 440',
  estrella1: '528 912 66 66',
  estrella2: '68 1124 56 56',
  estrella3: '962 1128 68 68',
  estrella4: '112 1638 64 64',
  estrella5: '816 1620 70 70',
};

// Cada recorte es la misma imagen vista por una ventana distinta (viewBox), así se descarga una sola vez.
export function recorte(nombre) {
  return `<svg class="recorte" viewBox="${RECORTES[nombre]}" aria-hidden="true" focusable="false"><image href="${IMAGEN}" width="1125" height="2000"/></svg>`;
}

export function pintarRecortes(raiz = document) {
  raiz.querySelectorAll('[data-recorte]').forEach((nodo) => {
    nodo.innerHTML = recorte(nodo.dataset.recorte);
  });
}

// Filtro que da bordes irregulares y textura de pigmento a lo dibujado en SVG.
export const DEFINICIONES = `<svg class="sr" aria-hidden="true" focusable="false"><defs>
  <linearGradient id="plumaje" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/>
    <stop offset=".55" stop-color="#FCF8F2"/>
    <stop offset="1" stop-color="#EFE5D8"/>
  </linearGradient>
  <linearGradient id="ala-luz" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#FFFFFF"/>
    <stop offset=".7" stop-color="#F8F2EA"/>
    <stop offset="1" stop-color="#ECE1D3"/>
  </linearGradient>
  <filter id="acuarela" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="4" result="ondas"/>
    <feDisplacementMap in="SourceGraphic" in2="ondas" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="bordes"/>
    <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="11" result="grano"/>
    <feColorMatrix in="grano" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.6 1.15" result="poros"/>
    <feComposite in="bordes" in2="poros" operator="in" result="pigmento"/>
    <feGaussianBlur in="pigmento" stdDeviation=".3"/>
  </filter>
</defs></svg>`;

export function pintarDefiniciones() {
  document.body.insertAdjacentHTML('afterbegin', DEFINICIONES);
}

// ---------- Cigüeña ----------

const BLANCO = '#FFFDF9';
const BORDE = '#D8CABA';
const SOMBRA = '#EEE4D7';
const PICO = '#E9A68A';
const PICO_LUZ = '#F4C3AE';
const PICO_SOMBRA = '#CF8B70';
const TELA = '#F3E6D4';
const TELA_SOMBRA = '#DCC7AB';

// Mira a la izquierda; el ala se dibuja con el hombro en (0, 0).
const CUERPO = 'M124 94C126 78 152 70 180 72C206 74 228 82 242 90L262 86L252 95L265 101L244 102C224 112 192 118 166 116C140 114 122 108 124 94Z';
const CUELLO = 'M76 74C92 82 108 88 130 92';
const ALA_BASE = 'M0 4C-6-24 0-56 20-80C30-92 40-100 52-106C50-86 48-64 44-44C40-26 34-10 28 6Z';
const ALA_PLUMAS = 'M52-106C60-112 68-114 74-114C70-110 68-106 66-102C74-104 80-102 84-98C78-94 74-90 70-88C78-88 84-84 86-80C80-76 74-72 68-70C74-66 78-60 78-56C70-54 62-50 58-46C64-40 66-34 66-30C58-28 52-24 48-20C52-14 52-8 50-4C44-2 36 2 28 6C34-10 40-26 44-44C48-64 50-86 52-106Z';
const ALA_VETAS = 'M60-98C64-90 66-84 67-78M70-84C70-76 69-70 66-64M64-56C62-48 58-42 54-36M56-28C52-22 48-16 44-10';
const ALA_LAVADO = 'M10-4C8-30 16-56 34-84';

const ala = ({ base, plumas, vetas, borde = '' }) => `
  <path d="${ALA_BASE}" fill="${base}" ${borde}/>
  <path d="${ALA_LAVADO}" fill="none" stroke="${SOMBRA}" stroke-width="7" stroke-linecap="round" opacity=".6"/>
  <path d="${ALA_PLUMAS}" fill="${plumas}"/>
  <path d="${ALA_VETAS}" fill="none" stroke="${vetas}" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>`;

// El bulto cuelga del pico: una punta de la tela va detrás del pico y otra delante.
const BULTO_ATRAS = `<path d="M40 92C42 86 46 80 50 75C49 82 47 88 44 94Z" fill="${TELA_SOMBRA}"/>`;
const BULTO = `
  <path d="M33 92C29 87 25 81 22 75C28 78 33 83 38 89Z" fill="${TELA}" stroke="${TELA_SOMBRA}" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M36 96C14 98 6 128 19 140C27 148 47 148 55 140C67 126 59 98 36 96Z" fill="${TELA}" stroke="${TELA_SOMBRA}" stroke-width="1.4"/>
  <path d="M22 132C30 140 46 140 54 130C50 142 26 144 22 132Z" fill="${TELA_SOMBRA}" opacity=".5"/>
  <path d="M26 104C22 110 20 118 21 124" fill="none" stroke="#FFFDF9" stroke-width="3" stroke-linecap="round" opacity=".7"/>
  <circle cx="25" cy="116" r="3" fill="#EBB7B5"/><circle cx="47" cy="111" r="3" fill="#A8CBE6"/>
  <circle cx="51" cy="128" r="2.6" fill="#EBB7B5"/><circle cx="23" cy="130" r="2.4" fill="#A8CBE6"/>
  <circle cx="40" cy="141" r="2.2" fill="#EBB7B5"/>
  <text x="37" y="131" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-weight="600" font-size="22" fill="#B89B7B">?</text>
  <ellipse cx="36" cy="94" rx="7" ry="4.6" fill="${TELA}" stroke="${TELA_SOMBRA}" stroke-width="1.4"/>`;
const SOBRE = `<g class="carga-sobre">
  <path d="M36 82V101" stroke="#B9A285" stroke-width="1.3"/>
  <rect x="16" y="100" width="40" height="28" rx="3" fill="${TELA}" stroke="#CDB79A" stroke-width="1.3"/>
  <path d="M17 101L36 116L55 101" fill="none" stroke="#CDB79A" stroke-width="1.3" stroke-linejoin="round"/>
  <circle cx="36" cy="115" r="4.4" fill="#C7A45C"/>
</g>`;

export function ciguena({ carga = 'bulto' } = {}) {
  const borde = `stroke="${BORDE}" stroke-width="1.6" stroke-linejoin="round"`;
  return `<svg class="ciguena" viewBox="-14 -24 300 180" aria-hidden="true" focusable="false">
  <g filter="url(#acuarela)">
    <g transform="translate(150 84) scale(.9)">${ala({ base: '#F2EAE0', plumas: '#A6927F', vetas: '#BBA996' })}</g>
    <g fill="none" stroke="${PICO}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M212 108L280 116M280 116l7-4M280 116l8 1"/>
      <path d="M216 112L276 128M276 128l7-3M276 128l7 3"/>
    </g>
    <path d="${CUELLO}" fill="none" stroke="${BORDE}" stroke-width="18.5" stroke-linecap="round"/>
    <circle cx="72" cy="70" r="14.2" fill="${BORDE}"/>
    <path d="${CUERPO}" fill="url(#plumaje)" ${borde}/>
    <path d="${CUELLO}" fill="none" stroke="${BLANCO}" stroke-width="15.5" stroke-linecap="round"/>
    <circle cx="72" cy="70" r="13" fill="${BLANCO}"/>
    <circle cx="76" cy="74" r="9" fill="${SOMBRA}" opacity=".35"/>
    <path d="M136 106C162 116 204 114 232 101C206 108 168 111 136 106Z" fill="${SOMBRA}"/>
    <path d="M150 80C170 76 196 78 214 86C196 82 172 81 150 80Z" fill="${SOMBRA}" opacity=".7"/>
    <path d="M84 81C98 87 110 90 124 92" fill="none" stroke="${SOMBRA}" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    ${carga === 'bulto' ? BULTO_ATRAS : ''}
    <path d="M62 67L14 88L62 78Z" fill="${PICO}" stroke="${PICO_SOMBRA}" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M59 69.5L24 84.5" stroke="${PICO_LUZ}" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <path d="M61 73L19 86" stroke="${PICO_SOMBRA}" stroke-width="1" stroke-linecap="round"/>
    <circle cx="70" cy="66" r="2.7" fill="#4A3A2E"/>
    <circle cx="71" cy="65" r=".9" fill="#fff"/>
    <ellipse cx="78" cy="74" rx="4" ry="2.6" fill="#F2B7AE" opacity=".75"/>
    <g transform="translate(166 86)">${ala({ base: 'url(#ala-luz)', plumas: '#8C7767', vetas: '#A7937F', borde })}</g>
    ${carga === 'bulto' ? BULTO : carga === 'sobre' ? SOBRE : ''}
  </g>
</svg>`;
}

// ---------- Nubecitas del fondo ----------

// Nube pequeña en acuarela que cruza el fondo: borde beige, centro claro y un brillo blanco.
export const NUBECITA = `<svg class="nube-svg" viewBox="0 0 140 72" aria-hidden="true" focusable="false">
  <g filter="url(#acuarela)">
    <path d="M24 64C10 64 4 52 12 44c-4-12 8-22 22-16 4-14 24-20 36-8 10-10 32-6 34 10 14-2 26 10 20 22 8 6 2 14-8 12Z" fill="#EDE2D2"/>
    <path d="M32.8 56.6C21.6 56.6 16.8 47 23.2 40.6C20 31 29.6 23 40.8 27.8C44 16.6 60 11.8 69.6 21.4C77.6 13.4 95.2 16.6 96.8 29.4C108 27.8 117.6 37.4 112.8 47C119.2 51.8 114.4 58.2 106.4 56.6Z" fill="#F8F3EB"/>
    <path d="M44 27c4-6 12-8 18-4M80 23c5-4 12-4 16 0" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity=".85"/>
  </g>
</svg>`;

export function pintarNubecitas(raiz = document) {
  raiz.querySelectorAll('[data-nubecita]').forEach((nodo) => {
    nodo.innerHTML = NUBECITA;
  });
}

// ---------- Globos ----------

// Toma el color del texto (currentColor); la clase globo-cuerpo permite dibujarlo solo con borde.
export const GLOBO = `<svg class="globo" viewBox="0 0 40 66" aria-hidden="true" focusable="false">
  <path class="globo-cuerpo" d="M20 2C9.5 2 3 10.5 3 20.5 3 32 12 42 20 45c8-3 17-13 17-24.5C37 10.5 30.5 2 20 2Z" fill="currentColor"/>
  <path d="M33 27c-2 7-7 12-13 15" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" opacity=".05"/>
  <path class="globo-brillo" d="M10 13c2-4 5.5-6 9.5-6.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
  <path d="M17.5 45.5 20 49l2.5-3.5Z" fill="currentColor"/>
  <path d="M20 49c-3 4 3 7 0 10.5s2 5 0 6" fill="none" stroke="#B9A592" stroke-width="1"/>
</svg>`;

// ---------- Íconos de línea ----------

const ICONOS = {
  calendario: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  ubicacion: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
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
