// Genera public/og.jpg, la imagen que muestra WhatsApp al compartir el link.
// Uso: node scripts/og.mjs              (captura con Google Chrome y comprime con sips, en macOS)
//      node scripts/og.mjs pagina.html  (solo escribe la página de 1200×630 para capturarla a mano)
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as esperar } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { EVENTO } from '../public/js/evento.js';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const salida = fileURLToPath(new URL('../public/og.jpg', import.meta.url));
const mariposa = (nombre) => pathToFileURL(fileURLToPath(new URL(`../public/img/mariposas/${nombre}.webp`, import.meta.url))).href;

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Great+Vibes&display=block">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body { position: relative; background: #F7F4F5; color: #3E3039; font-variant-numeric: lining-nums; }
  img { position: absolute; display: block; height: auto; }
  .polvo { left: -60px; top: -30px; width: 1320px; opacity: .8; }
  .arriba-izq { left: -40px; top: -46px; width: 230px; }
  .arriba-der { right: -36px; top: -40px; width: 250px; }
  .lado-izq { left: -70px; top: 300px; width: 330px; }
  .lado-der { right: -70px; top: 330px; width: 330px; }
  .grande { left: 50%; top: 14px; width: 330px; transform: translateX(-50%); }
  .chica { left: 250px; top: 120px; width: 46px; transform: rotate(-8deg); }
  .mini { right: 270px; top: 190px; width: 34px; }
  .texto { position: absolute; left: 230px; right: 230px; top: 262px; text-align: center; }
  h1 { margin: 0; font-family: 'Great Vibes', cursive; font-size: 124px; font-weight: 400; line-height: 1.05; color: #98809A; white-space: nowrap; }
  .papas { margin: 0; font-family: 'Great Vibes', cursive; font-size: 66px; line-height: 1.1; color: #C46A92; white-space: nowrap; }
  .fecha { margin: 14px 0 0; font-family: 'Cormorant Garamond', serif; font-size: 34px; font-style: italic; font-weight: 500; color: #6E5566; }
</style></head><body>
  <img class="polvo" src="${mariposa('polvo')}" alt="">
  <img class="arriba-izq" src="${mariposa('arriba-izq')}" alt="">
  <img class="arriba-der" src="${mariposa('arriba-der')}" alt="">
  <img class="lado-izq" src="${mariposa('lado-izq')}" alt="">
  <img class="lado-der" src="${mariposa('lado-der')}" alt="">
  <img class="grande" src="${mariposa('grande')}" alt="">
  <img class="chica" src="${mariposa('chica-lila')}" alt="">
  <img class="mini" src="${mariposa('chica-rosa')}" alt="">
  <div class="texto">
    <h1>Baby Shower</h1>
    <p class="papas">Estefanía &amp; Sebastián</p>
    <p class="fecha">${EVENTO.fecha} · ${EVENTO.hora}</p>
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
    '--allow-file-access-from-files',
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
    // En JPG pesa menos de 300 KB, el tamaño que WhatsApp muestra sin problemas.
    execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '84', captura, '--out', salida], { stdio: 'ignore' });
    console.log(`Imagen lista: ${salida}`);
  } finally {
    if (chrome.exitCode === null) {
      const cerrado = new Promise((resolver) => chrome.once('exit', resolver));
      chrome.kill('SIGKILL');
      await Promise.race([cerrado, esperar(3000)]);
    }
    rmSync(temporal, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  }
}
