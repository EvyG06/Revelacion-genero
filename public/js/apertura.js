// Escena inicial: el sobre aparece, una mariposa llega volando y se posa encima como sello.
// Al tocarla, la mariposa se va, el sobre se abre y salen mariposas de la tarjeta.
import { esperar } from './comun.js';
import { soltarMariposas } from './mariposas.js';

const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function iniciarApertura({ alAbrir, alTerminar }) {
  const escena = document.getElementById('apertura');
  const sobre = document.getElementById('sobre');
  const mariposa = sobre.querySelector('.mariposa-sello');
  const intro = escena.querySelector('.apertura-intro');
  const enCurso = new Set();
  let listo = false;
  let abierto = false;
  let rapido = reducido;
  let saltoEn = -Infinity;

  sobre.addEventListener('click', abrir);
  // Un toque mientras la mariposa llega lo adelanta hasta que el sobre está listo para abrir.
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
    sobre.style.opacity = '1';
    await animar(sobre, [
      { opacity: 0, transform: 'translateY(-26px) rotate(-3deg)' },
      { opacity: 1, transform: 'none' },
    ], { duration: 900, delay: 350, easing: 'cubic-bezier(.2,.7,.3,1)' }).finished;

    // En pantallas anchas el recorrido es más largo: se le da más tiempo.
    const tiempo = Math.min(1.4, Math.max(1, innerWidth / 700));
    mariposa.classList.add('volando');
    mariposa.style.opacity = '1';
    await animar(mariposa, ruta(llegada()), { duration: 2300 * tiempo, easing: 'cubic-bezier(.25,.6,.3,1)' }).finished;
    mariposa.classList.replace('volando', 'posada');

    escena.querySelectorAll('.aparece').forEach((nodo) => nodo.classList.add('visible'));
    sobre.classList.add('listo');
    listo = true;
    rapido = reducido;
  }

  // Entra desde arriba a la derecha, da una vuelta y se posa en el sobre.
  // Los puntos van en píxeles relativos a donde la mariposa queda posada.
  function llegada() {
    const caja = mariposa.getBoundingClientRect();
    return [
      { x: innerWidth - caja.left + 30, y: -caja.top - caja.height - 30 },
      { x: (innerWidth - caja.left) * 0.2, y: -caja.top * 0.15 },
      { x: -caja.width * 0.9, y: -caja.height * 1.6 },
      { x: 0, y: 0 },
    ];
  }

  // Despega hacia arriba y sale por la esquina contraria.
  function partida() {
    const caja = mariposa.getBoundingClientRect();
    return [
      { x: 0, y: 0 },
      { x: caja.width * 0.4, y: -caja.height * 1.3 },
      { x: -caja.left * 0.6, y: -caja.top * 0.55 },
      { x: -caja.left - caja.width - 40, y: -caja.top - caja.height - 60 },
    ];
  }

  async function abrir() {
    if (!listo || abierto || performance.now() - saltoEn < 450) return;
    abierto = true;
    alAbrir?.();
    const solapa = sobre.querySelector('.sobre-solapa');
    const tarjeta = sobre.querySelector('.sobre-tarjeta');
    sobre.classList.remove('listo');
    escena.querySelectorAll('.aparece').forEach((nodo) => nodo.classList.remove('visible'));
    animar(intro, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, easing: 'ease' });

    mariposa.classList.replace('posada', 'volando');
    animar(mariposa, ruta(partida()), { duration: 1700, easing: 'cubic-bezier(.4,0,.7,.6)' });
    await esperar(reducido ? 0 : 420);

    await animar(solapa, [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(90deg)' }], {
      duration: 360,
      easing: 'ease-in',
    }).finished;
    solapa.style.zIndex = '1';
    await animar(solapa, [{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(180deg)' }], {
      duration: 360,
      easing: 'ease-out',
    }).finished;
    soltarMariposas({ cantidad: 9, desde: tarjeta.getBoundingClientRect() });
    await animar(tarjeta, [{ transform: 'translateY(0)' }, { transform: 'translateY(-60%)' }], {
      duration: 950,
      easing: 'cubic-bezier(.2,.8,.2,1)',
    }).finished;
    await esperar(reducido ? 0 : 700);
    alTerminar?.();
    await animar(escena, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: 'ease' }).finished;
    escena.remove();
  }
}

// Cuadros clave a lo largo de una curva de Bézier, inclinando la mariposa según la dirección.
// El último cuadro la deja derecha.
function ruta([p0, p1, p2, p3], pasos = 40) {
  const cuadros = [];
  for (let i = 0; i <= pasos; i++) {
    const t = i / pasos;
    const u = 1 - t;
    const x = u ** 3 * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t ** 3 * p3.x;
    const y = u ** 3 * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t ** 3 * p3.y;
    const dx = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
    const inclinacion = i === pasos ? 0 : Math.max(-18, Math.min(18, dx / 40));
    cuadros.push({ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${inclinacion.toFixed(1)}deg)` });
  }
  return cuadros;
}
