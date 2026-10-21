// Escena inicial: la cigüeña llega volando, deja el sobre y el invitado lo abre.
import { esperar } from './comun.js';

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function iniciarApertura({ alAbrir, alTerminar }) {
  const escena = document.getElementById('apertura');
  const ave = escena.querySelector('.ave-vuelo');
  const carga = ave.querySelector('.carga-sobre');
  const sobre = document.getElementById('sobre');
  const intro = escena.querySelector('.apertura-intro');
  const enCurso = new Set();
  let listo = false;
  let abierto = false;
  let rapido = reducido;
  let saltoEn = -Infinity;

  sobre.addEventListener('click', abrir);
  // Un toque durante el vuelo lo adelanta hasta que el sobre está listo para abrir.
  escena.addEventListener('pointerdown', () => {
    if (listo || rapido) return;
    rapido = true;
    saltoEn = performance.now();
    enCurso.forEach((animacion) => animacion.finish());
  });

  llegar().catch(() => {});

  return {
    ponerDestinatario(nombre) {
      document.getElementById('destinatario').textContent = nombre;
    },
    cerrar() {
      enCurso.forEach((animacion) => animacion.cancel());
      escena.remove();
    },
  };

  function animar(elemento, cuadros, opciones) {
    const animacion = elemento.animate(cuadros, {
      fill: 'forwards',
      ...opciones,
      ...(rapido ? { duration: 1, delay: 0 } : {}),
    });
    enCurso.add(animacion);
    const quitar = () => enCurso.delete(animacion);
    animacion.finished.then(quitar, quitar);
    return animacion;
  }

  async function llegar() {
    animar(intro, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], {
      duration: 1000,
      easing: 'ease-out',
    });
    const { entrada, salida } = calcularRuta();
    await animar(ave, ruta(entrada), { duration: 2600, easing: 'cubic-bezier(.3,.6,.35,1)' }).finished;
    await soltarSobre();
    animar(ave, ruta(salida), { duration: 1900, easing: 'cubic-bezier(.55,0,.75,.45)' });
    escena.querySelectorAll('.aparece').forEach((nodo) => nodo.classList.add('visible'));
    sobre.classList.add('listo');
    listo = true;
    rapido = reducido;
  }

  // La cigüeña entra por la derecha, se detiene sobre el lugar del sobre y sale por arriba a la izquierda.
  // Los puntos se calculan en coordenadas de la pantalla y se pasan a la posición propia del ave.
  function calcularRuta() {
    ave.style.transform = 'translate(0px, 0px)';
    const rAve = ave.getBoundingClientRect();
    const rCarga = carga.getBoundingClientRect();
    const rSobre = sobre.getBoundingClientRect();
    const ancho = innerWidth;
    const alto = innerHeight;
    const desfaseX = rCarga.left + rCarga.width / 2 - rAve.left;
    const desfaseY = rCarga.top + rCarga.height / 2 - rAve.top;
    const parada = {
      x: rSobre.left + rSobre.width / 2 - desfaseX,
      y: Math.max(alto * 0.04, rSobre.top - rSobre.height * 0.35 - desfaseY),
    };
    const local = (puntos) => puntos.map(({ x, y }) => ({ x: x - rAve.left, y: y - rAve.top }));
    return {
      entrada: local([
        { x: ancho + 30, y: parada.y - alto * 0.1 },
        { x: ancho * 0.8, y: parada.y + alto * 0.16 },
        { x: parada.x + ancho * 0.28, y: parada.y - alto * 0.08 },
        parada,
      ]),
      salida: local([
        parada,
        { x: parada.x - ancho * 0.18, y: parada.y + alto * 0.03 },
        { x: -rAve.width * 0.5, y: parada.y - alto * 0.22 },
        { x: -rAve.width - 40, y: -rAve.height - alto * 0.04 },
      ]),
    };
  }

  async function soltarSobre() {
    const rCarga = carga.getBoundingClientRect();
    const rSobre = sobre.getBoundingClientRect();
    carga.style.visibility = 'hidden';
    // El texto de llegada le cede el lugar al "Para …" del sobre.
    animar(intro, [{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: 'ease' });
    const dx = rCarga.left + rCarga.width / 2 - (rSobre.left + rSobre.width / 2);
    const dy = rCarga.top + rCarga.height / 2 - (rSobre.top + rSobre.height / 2);
    const escala = Math.max(0.08, rCarga.width / rSobre.width);
    sobre.style.opacity = '1';
    const caida = animar(sobre, [
      { transform: `translate(${dx}px, ${dy}px) scale(${escala}) rotate(-12deg)` },
      { transform: `translate(${dx * 0.25}px, ${dy * 0.1}px) scale(.92) rotate(5deg)`, offset: 0.65 },
      { transform: 'none' },
    ], { duration: 1100, easing: 'cubic-bezier(.33,.66,.4,1)' });
    await caida.finished;
    caida.cancel();
  }

  async function abrir() {
    if (!listo || abierto || performance.now() - saltoEn < 450) return;
    abierto = true;
    alAbrir?.();
    const sello = sobre.querySelector('.sello');
    const solapa = sobre.querySelector('.sobre-solapa');
    const tarjeta = sobre.querySelector('.sobre-tarjeta');
    sobre.classList.remove('listo');
    escena.querySelectorAll('.aparece').forEach((nodo) => nodo.classList.remove('visible'));

    animar(sello, [
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: 'translate(-50%, -50%) scale(1.45)', opacity: 0 },
    ], { duration: 420, easing: 'ease-out' });
    await animar(solapa, [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(90deg)' }], {
      duration: 360,
      delay: 200,
      easing: 'ease-in',
    }).finished;
    solapa.style.zIndex = '1';
    await animar(solapa, [{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(180deg)' }], {
      duration: 360,
      easing: 'ease-out',
    }).finished;
    await animar(tarjeta, [{ transform: 'translateY(0)' }, { transform: 'translateY(-60%)' }], {
      duration: 950,
      easing: 'cubic-bezier(.2,.8,.2,1)',
    }).finished;
    await esperar(reducido ? 0 : 350);
    alTerminar?.();
    await animar(escena, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: 'ease' }).finished;
    escena.remove();
  }
}

// Cuadros clave a lo largo de una curva de Bézier, con la cigüeña inclinada según la dirección.
function ruta([p0, p1, p2, p3], pasos = 36) {
  const cuadros = [];
  for (let i = 0; i <= pasos; i++) {
    const t = i / pasos;
    const u = 1 - t;
    const x = u ** 3 * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t ** 3 * p3.x;
    const y = u ** 3 * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t ** 3 * p3.y;
    const dx = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
    const dy = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
    const inclinacion = Math.max(-16, Math.min(16, (-Math.atan2(dy, Math.abs(dx) || 1) * 180) / Math.PI / 2));
    cuadros.push({ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${inclinacion.toFixed(1)}deg)` });
  }
  return cuadros;
}
