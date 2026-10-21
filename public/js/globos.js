// Globos que suben desde abajo de la pantalla para celebrar.
import { GLOBO } from './ilustraciones.js';

const COLORES = ['#EBB7B5', '#A8CBE6', '#E2D3BF', '#F2D4D1', '#CFE2F1', '#D2BFA5'];

export function soltarGlobos({ cantidad = 12, colores = COLORES } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const capa = document.createElement('div');
  capa.className = 'capa-globos';
  capa.setAttribute('aria-hidden', 'true');
  document.body.append(capa);

  let restantes = cantidad;
  for (let i = 0; i < cantidad; i++) {
    const globo = document.createElement('span');
    globo.className = 'globo-vuelo';
    globo.innerHTML = GLOBO;
    globo.style.color = colores[i % colores.length];
    globo.style.left = `${4 + Math.random() * 88}%`;
    globo.style.width = `${30 + Math.random() * 30}px`;
    capa.append(globo);

    const subida = innerHeight + 220;
    const vaiven = 18 + Math.random() * 26;
    const giro = (Math.random() - 0.5) * 16;
    const animacion = globo.animate([
      { transform: `translate(0, 0) rotate(${giro}deg)`, opacity: 0 },
      { opacity: 1, offset: 0.08 },
      { transform: `translate(${vaiven}px, -${subida * 0.35}px) rotate(${-giro}deg)`, offset: 0.35 },
      { transform: `translate(${-vaiven}px, -${subida * 0.7}px) rotate(${giro}deg)`, offset: 0.7 },
      { transform: `translate(${vaiven * 0.5}px, -${subida}px) rotate(0deg)`, opacity: 1 },
    ], {
      duration: 3400 + Math.random() * 1600,
      delay: Math.random() * 700,
      easing: 'cubic-bezier(.45,.05,.6,1)',
      fill: 'both',
    });
    animacion.finished.finally(() => {
      restantes -= 1;
      if (!restantes) capa.remove();
    });
  }
}
