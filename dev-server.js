// Servidor local para probar la invitación sin instalar nada.
// Sirve /public, ejecuta las funciones de /api y replica las reglas de vercel.json.
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = fileURLToPath(new URL('.', import.meta.url));
const publico = join(raiz, 'public');
const puerto = Number(process.env.PORT) || 5173;

const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

cargarEnv(join(raiz, '.env.local'));

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/api/')) await ejecutarApi(req, res, url);
    else await servirArchivo(res, url.pathname);
  } catch (error) {
    console.error(error);
    responder(res, 500, 'Error interno');
  }
}).listen(puerto, () => {
  console.log(`Invitación: http://localhost:${puerto}`);
  console.log(`Panel:      http://localhost:${puerto}/admin`);
});

async function servirArchivo(res, ruta) {
  // Igual que vercel.json: /i/<codigo> muestra la invitación y cleanUrls quita el .html.
  if (ruta === '/' || /^\/i\/[^/]+\/?$/.test(ruta)) ruta = '/index.html';
  else if (!extname(ruta)) ruta += '.html';
  const archivo = normalize(join(publico, decodeURIComponent(ruta)));
  if (!archivo.startsWith(publico + sep)) return responder(res, 403, 'Prohibido');
  const contenido = await readFile(archivo).catch(() => null);
  if (!contenido) return responder(res, 404, 'No encontrado');
  res.writeHead(200, {
    'content-type': tipos[extname(archivo)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  res.end(contenido);
}

async function ejecutarApi(req, res, url) {
  const nombre = url.pathname.slice('/api/'.length).replace(/\/$/, '');
  const archivo = join(raiz, 'api', `${nombre}.js`);
  if (!/^[a-z-]+$/.test(nombre) || !existsSync(archivo)) return responder(res, 404, 'No encontrado');
  const modulo = await import(`${pathToFileURL(archivo).href}?v=${Date.now()}`);
  const manejador = modulo[req.method];
  if (typeof manejador !== 'function') return responder(res, 405, 'Método no permitido');

  const partes = [];
  for await (const parte of req) partes.push(parte);
  const peticion = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: partes.length ? Buffer.concat(partes) : undefined,
  });
  const respuesta = await manejador(peticion);
  res.writeHead(respuesta.status, Object.fromEntries(respuesta.headers));
  res.end(Buffer.from(await respuesta.arrayBuffer()));
}

function responder(res, estado, texto) {
  res.writeHead(estado, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(texto);
}

function cargarEnv(ruta) {
  if (!existsSync(ruta)) return;
  for (const linea of readFileSync(ruta, 'utf8').split(/\r?\n/)) {
    const coincidencia = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (coincidencia && process.env[coincidencia[1]] === undefined) {
      process.env[coincidencia[1]] = coincidencia[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
}
