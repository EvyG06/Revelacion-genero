// Genera public/og.jpg, la imagen que muestra WhatsApp al compartir el link.
// Uso: node scripts/og.mjs              (captura con Google Chrome y comprime con sips, en macOS)
//      node scripts/og.mjs pagina.html  (solo escribe la página de 1200×630 para capturarla a mano)
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as esperar } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DEFINICIONES, ciguena, recorte } from '../public/js/ilustraciones.js';
import { EVENTO } from '../public/js/evento.js';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const salida = fileURLToPath(new URL('../public/og.jpg', import.meta.url));
const imagen = pathToFileURL(fileURLToPath(new URL('../public/img/osos.webp', import.meta.url))).href;

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,500&family=Sacramento&display=block">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body { position: relative; background: #FFFEFC; color: #5E4A3B; font-family: 'Cormorant Garamond', Georgia, serif; font-variant-numeric: lining-nums; }
  .capa { position: absolute; display: block; mix-blend-mode: multiply; }
  .capa svg { display: block; width: 100%; height: auto; }
  .oso-nina { left: 18px; top: -18px; width: 250px; }
  .oso-nino { right: 18px; top: -10px; width: 250px; }
  .nubes { left: -40px; right: -40px; bottom: -250px; }
  .estrella { width: 30px; }
  .ave { position: absolute; left: 50%; top: 34px; width: 250px; transform: translateX(-50%) rotate(-3deg); }
  .texto { position: absolute; left: 260px; right: 260px; top: 190px; text-align: center; }
  h1 { margin: 0; font-family: Sacramento, cursive; font-size: 128px; font-weight: 400; line-height: 1; white-space: nowrap; }
  .nina { color: #B4666A; } .nino { color: #4C7AA0; }
  .papas { margin: 14px 0 0; font-size: 30px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; }
  .fecha { margin: 8px 0 0; font-size: 30px; font-style: italic; font-weight: 500; color: #7F6A59; }
</style></head><body>
  ${DEFINICIONES}
  <span class="capa oso-nina">${recorte('osoNina')}</span>
  <span class="capa oso-nino">${recorte('osoNino')}</span>
  <span class="capa estrella" style="left:300px;top:70px">${recorte('estrella1')}</span>
  <span class="capa estrella" style="right:310px;top:120px">${recorte('estrella3')}</span>
  <span class="capa nubes">${recorte('nubes')}</span>
  <div class="ave">${ciguena({ carga: 'bulto' })}</div>
  <div class="texto">
    <h1>¿<span class="nina">Niña</span> o <span class="nino">niño</span>?</h1>
    <p class="papas">${EVENTO.papas}</p>
    <p class="fecha">${EVENTO.fecha} · ${EVENTO.hora}</p>
  </div>
</body></html>`.replaceAll('/img/osos.webp', imagen);

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
      chrome.kill();
      await Promise.race([cerrado, esperar(3000)]);
    }
    rmSync(temporal, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  }
}
