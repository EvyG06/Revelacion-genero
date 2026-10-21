// Guarda las familias en Redis (Upstash, conectado desde Vercel).
// En este computador, sin Redis configurado, usa un archivo en .data/ para poder probar.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { ConfiguracionFaltante } from './util.js';

const CLAVE = 'revelacion:familias';
const ARCHIVO = join(process.cwd(), '.data', 'familias.json');

function conexion() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url, token };
  if (process.env.VERCEL) {
    throw new ConfiguracionFaltante('Falta conectar la base de datos (Upstash for Redis) al proyecto en Vercel.');
  }
  return null;
}

async function redis({ url, token }, ...comando) {
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(comando),
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok || datos.error) throw new Error(`Redis: ${datos.error ?? respuesta.status}`);
  return datos.result;
}

async function leerArchivo() {
  try {
    return JSON.parse(await readFile(ARCHIVO, 'utf8'));
  } catch {
    return {};
  }
}

async function escribirArchivo(todas) {
  await mkdir(dirname(ARCHIVO), { recursive: true });
  await writeFile(ARCHIVO, JSON.stringify(todas, null, 2));
}

export async function obtenerFamilia(codigo) {
  const db = conexion();
  if (!db) return (await leerArchivo())[codigo] ?? null;
  const valor = await redis(db, 'HGET', CLAVE, codigo);
  return valor ? JSON.parse(valor) : null;
}

export async function listarFamilias() {
  const db = conexion();
  if (!db) return Object.values(await leerArchivo());
  const plano = (await redis(db, 'HGETALL', CLAVE)) ?? [];
  const familias = [];
  for (let i = 1; i < plano.length; i += 2) familias.push(JSON.parse(plano[i]));
  return familias;
}

export async function guardarFamilia(familia) {
  const db = conexion();
  if (!db) {
    const todas = await leerArchivo();
    todas[familia.codigo] = familia;
    return escribirArchivo(todas);
  }
  await redis(db, 'HSET', CLAVE, familia.codigo, JSON.stringify(familia));
}

export async function eliminarFamilia(codigo) {
  const db = conexion();
  if (!db) {
    const todas = await leerArchivo();
    delete todas[codigo];
    return escribirArchivo(todas);
  }
  await redis(db, 'HDEL', CLAVE, codigo);
}
