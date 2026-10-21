import { createHash, randomInt, timingSafeEqual } from 'node:crypto';

export function json(datos, estado = 200) {
  return Response.json(datos, { status: estado, headers: { 'cache-control': 'no-store' } });
}

export function error(mensaje, estado = 400) {
  return json({ error: mensaje }, estado);
}

// Falta algo por configurar en Vercel: su mensaje sí se le muestra a quien abre la página.
export class ConfiguracionFaltante extends Error {}

// Envuelve un manejador para que cualquier falla responda JSON en vez de un error 500 sin explicación.
export function manejar(manejador) {
  return async (peticion) => {
    try {
      return await manejador(peticion);
    } catch (falla) {
      console.error(falla);
      const mensaje = falla instanceof ConfiguracionFaltante
        ? falla.message
        : 'Algo falló en el servidor. Inténtalo de nuevo en un momento.';
      return error(mensaje, 503);
    }
  };
}

export async function leerJson(peticion) {
  try {
    const datos = await peticion.json();
    return datos && typeof datos === 'object' ? datos : null;
  } catch {
    return null;
  }
}

// Texto de una línea: sin saltos ni caracteres de control y con los espacios normalizados.
export function linea(valor, maximo) {
  if (typeof valor !== 'string') return '';
  return valor
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maximo);
}

// Texto largo: conserva los saltos de línea (como mucho dos seguidos).
export function parrafo(valor, maximo) {
  if (typeof valor !== 'string') return '';
  return valor
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maximo);
}

export function entero(valor, minimo, maximo) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= minimo && numero <= maximo ? numero : null;
}

// Sin letras que se confundan (0/o, 1/l/i) para que los links se puedan dictar.
const ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789';

export function nuevoCodigo(largo = 7) {
  let codigo = '';
  for (let i = 0; i < largo; i++) codigo += ALFABETO[randomInt(ALFABETO.length)];
  return codigo;
}

export function codigoValido(codigo) {
  return typeof codigo === 'string' && /^[a-z0-9]{4,24}$/.test(codigo);
}

// La clave viaja codificada con encodeURIComponent para admitir tildes y eñes.
export function esAdmin(peticion) {
  const clave = process.env.ADMIN_PASSWORD;
  if (!clave) return false;
  let enviada;
  try {
    enviada = decodeURIComponent(peticion.headers.get('x-clave') ?? '');
  } catch {
    return false;
  }
  const a = createHash('sha256').update(enviada).digest();
  const b = createHash('sha256').update(clave).digest();
  return timingSafeEqual(a, b);
}

export function contarApuestas(familias) {
  const conteo = { nina: 0, nino: 0 };
  for (const familia of familias) {
    for (const persona of familia.respuesta?.personas ?? []) {
      if (Object.hasOwn(conteo, persona.apuesta)) conteo[persona.apuesta] += 1;
    }
  }
  return conteo;
}
