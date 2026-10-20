// Confeti en tonos pastel, dibujado en un canvas que se borra al terminar.
const PASTEL = ['#F5D3CE', '#E9B1AA', '#D2E4EF', '#A6C6DC', '#EADBB9', '#D9BF8C'];

export function confeti({
  x = innerWidth / 2,
  y = innerHeight * 0.38,
  cantidad = 150,
  colores = PASTEL,
  velocidad = 13,
  dispersion = 80,
  gravedad = 0.3,
} = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lienzo = document.createElement('canvas');
  const escala = Math.min(devicePixelRatio || 1, 2);
  lienzo.className = 'confeti';
  lienzo.width = innerWidth * escala;
  lienzo.height = innerHeight * escala;
  document.body.append(lienzo);
  const ctx = lienzo.getContext('2d');
  ctx.scale(escala, escala);

  const piezas = Array.from({ length: cantidad }, () => {
    const angulo = ((-90 + (Math.random() - 0.5) * dispersion) * Math.PI) / 180;
    const rapidez = velocidad * (0.45 + Math.random() * 0.75);
    return {
      x,
      y,
      vx: Math.cos(angulo) * rapidez,
      vy: Math.sin(angulo) * rapidez,
      giro: Math.random() * Math.PI,
      vgiro: (Math.random() - 0.5) * 0.3,
      vaiven: Math.random() * Math.PI * 2,
      tamano: 5 + Math.random() * 6,
      color: colores[Math.floor(Math.random() * colores.length)],
      redondo: Math.random() < 0.35,
    };
  });

  const inicio = performance.now();
  let anterior = inicio;
  requestAnimationFrame(function cuadro(ahora) {
    const paso = Math.min(2.5, (ahora - anterior) / 16.7);
    const segundos = (ahora - inicio) / 1000;
    anterior = ahora;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let visibles = 0;
    for (const p of piezas) {
      const freno = 0.986 ** paso;
      p.vx *= freno;
      p.vy = p.vy * freno + gravedad * paso;
      p.x += (p.vx + Math.sin(p.vaiven) * 0.7) * paso;
      p.y += p.vy * paso;
      p.giro += p.vgiro * paso;
      p.vaiven += 0.08 * paso;
      if (p.y > innerHeight + 20) continue;
      visibles += 1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, 3.8 - segundos));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.giro);
      ctx.fillStyle = p.color;
      if (p.redondo) {
        ctx.beginPath();
        ctx.arc(0, 0, p.tamano / 2.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const alto = (p.tamano / 2) * Math.abs(Math.cos(p.vaiven)) + 1;
        ctx.fillRect(-p.tamano / 2, -alto / 2, p.tamano, alto);
      }
      ctx.restore();
    }
    if (visibles && segundos < 4.2) requestAnimationFrame(cuadro);
    else lienzo.remove();
  });
}
