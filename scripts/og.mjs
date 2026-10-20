// Genera public/og.png, la imagen que muestra WhatsApp al compartir el link.
// Uso: node scripts/og.mjs              (toma la captura con Google Chrome)
//      node scripts/og.mjs pagina.html  (solo escribe la página de 1200×630 para capturarla a mano)
import { spawn } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as esperar } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { ciguena } from '../public/js/ilustraciones.js';
import { EVENTO } from '../public/js/evento.js';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const salida = fileURLToPath(new URL('../public/og.png', import.meta.url));

const nube = (x, y, ancho, opacidad = 1) => `
  <svg class="nube" style="left:${x}px;top:${y}px;width:${ancho}px;opacity:${opacidad}" viewBox="0 0 140 70">
    <path fill="#fff" d="M24 62C10 62 4 50 12 42c-4-12 8-22 22-16 4-14 24-20 36-8 10-10 32-6 34 10 14-2 26 10 20 22 8 6 2 14-8 12Z"/>
    <path fill="#EEE3D5" opacity=".75" d="M24 62c26 4 66 4 92 0-16-4-66-4-92 0Z"/>
  </svg>`;

const destello = (x, y, tamano) => `
  <svg class="destello" style="left:${x}px;top:${y}px;width:${tamano}px" viewBox="-12 -12 24 24">
    <path fill="#C9A66B" d="M0-11c1.2 8 3 9.8 11 11C3 1.2 1.2 3 0 11-1.2 3-3 1.2-11 0-3-1.2-1.2-3 0-11Z"/>
  </svg>`;

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,500&family=Great+Vibes&family=Quicksand:wght@600;700&display=block">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body {
    position: relative;
    font-family: Quicksand, 'Avenir Next', sans-serif;
    color: #574334;
    background:
      radial-gradient(700px 520px at 6% 0%, rgba(245, 211, 206, .75), transparent 70%),
      radial-gradient(760px 560px at 100% 100%, rgba(210, 228, 239, .85), transparent 70%),
      #FBF6EF;
  }
  .nube, .destello { position: absolute; }
  .nube { filter: drop-shadow(0 10px 14px rgba(150, 120, 90, .1)); }
  .ave { position: absolute; left: 30px; top: 175px; width: 480px; transform: rotate(-4deg); }
  .ave .ala { transform: rotate(-4deg); }
  .texto { position: absolute; left: 500px; right: 30px; top: 150px; text-align: center; }
  .ante { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: .26em; text-transform: uppercase; color: #B99B76; }
  h1 { margin: 14px 0 0; font-family: 'Great Vibes', 'Snell Roundhand', cursive; font-size: 116px; font-weight: 400; line-height: 1.1; white-space: nowrap; }
  .nina { color: #B25F58; } .nino { color: #4A7898; }
  .papas { margin: 6px 0 0; font-family: 'Cormorant Garamond', Didot, Georgia, serif; font-size: 44px; font-style: italic; font-weight: 500; }
  .fecha {
    display: inline-block; margin-top: 26px; padding: 14px 30px; border-radius: 999px;
    background: linear-gradient(100deg, #F5D3CE, #EEDDE4 50%, #D2E4EF);
    font-size: 26px; font-weight: 600;
  }
</style></head><body>
  ${nube(-30, 40, 230)}${nube(380, 480, 200, .9)}${nube(980, 20, 190, .85)}${nube(1020, 470, 150)}
  ${destello(130, 110, 22)}${destello(520, 90, 16)}${destello(1110, 230, 18)}${destello(600, 560, 14)}${destello(90, 520, 16)}
  <div class="ave">${ciguena({ carga: 'bulto' })}</div>
  <div class="texto">
    <p class="ante">La cigüeña viene en camino</p>
    <h1>¿<span class="nina">Niña</span> o <span class="nino">niño</span>?</h1>
    <p class="papas">${EVENTO.papas}</p>
    <div class="fecha">${EVENTO.fecha} · ${EVENTO.hora}</div>
  </div>
</body></html>`;

if (process.argv[2]) {
  writeFileSync(process.argv[2], html);
  console.log(`Página lista: ${process.argv[2]}`);
} else {
  const temporal = mkdtempSync(join(tmpdir(), 'og-'));
  const pagina = join(temporal, 'og.html');
  const captura = join(temporal, 'og.png');
  writeFileSync(pagina, html);
  // A veces Chrome queda abierto después de guardar la captura: se espera el archivo y se cierra.
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--disable-extensions',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--virtual-time-budget=5000',
    `--user-data-dir=${join(temporal, 'perfil')}`,
    '--window-size=1200,630',
    `--screenshot=${captura}`,
    `file://${pagina}`,
  ], { stdio: 'ignore' });
  try {
    for (let intento = 0; intento < 60 && !existsSync(captura); intento++) await esperar(500);
    if (!existsSync(captura)) throw new Error('Chrome no generó la imagen.');
    await esperar(500);
    copyFileSync(captura, salida);
    console.log(`Imagen lista: ${salida}`);
  } finally {
    if (chrome.exitCode === null) {
      const cerrado = new Promise((resolver) => chrome.once('exit', resolver));
      chrome.kill();
      await Promise.race([cerrado, esperar(3000)]);
    }
    rmSync(temporal, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  }
}
