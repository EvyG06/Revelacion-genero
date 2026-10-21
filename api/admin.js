import { eliminarFamilia, guardarFamilia, listarFamilias, obtenerFamilia } from '../server/store.js';
import { codigoValido, entero, error, esAdmin, json, leerJson, linea, manejar, nuevoCodigo } from '../server/util.js';

// Todas las familias, en el orden en que se agregaron.
export const GET = manejar(async (peticion) => {
  if (!esAdmin(peticion)) return noAutorizado();
  const familias = await listarFamilias();
  familias.sort((a, b) => a.creada.localeCompare(b.creada));
  return json({ familias });
});

// Agrega una familia y le asigna el código de su link.
export const POST = manejar(async (peticion) => {
  if (!esAdmin(peticion)) return noAutorizado();
  const cuerpo = (await leerJson(peticion)) ?? {};
  const nombre = linea(cuerpo.nombre, 80);
  const cupo = entero(cuerpo.cupo, 1, 30);
  if (!nombre) return error('Escribe el nombre de la familia.');
  if (!cupo) return error('Los lugares deben ser un número entre 1 y 30.');

  let codigo = nuevoCodigo();
  while (await obtenerFamilia(codigo)) codigo = nuevoCodigo();
  const familia = { codigo, nombre, cupo, creada: new Date().toISOString(), respuesta: null };
  await guardarFamilia(familia);
  return json({ familia }, 201);
});

// Cambia el nombre o los lugares, o borra la respuesta para que la familia vuelva a responder.
export const PATCH = manejar(async (peticion) => {
  if (!esAdmin(peticion)) return noAutorizado();
  const cuerpo = (await leerJson(peticion)) ?? {};
  const familia = codigoValido(cuerpo.codigo) ? await obtenerFamilia(cuerpo.codigo) : null;
  if (!familia) return error('No encontramos esa familia.', 404);

  if ('nombre' in cuerpo) {
    const nombre = linea(cuerpo.nombre, 80);
    if (!nombre) return error('Escribe el nombre de la familia.');
    familia.nombre = nombre;
  }
  if ('cupo' in cuerpo) {
    const cupo = entero(cuerpo.cupo, 1, 30);
    if (!cupo) return error('Los lugares deben ser un número entre 1 y 30.');
    familia.cupo = cupo;
  }
  if (cuerpo.borrarRespuesta === true) familia.respuesta = null;

  await guardarFamilia(familia);
  return json({ familia });
});

export const DELETE = manejar(async (peticion) => {
  if (!esAdmin(peticion)) return noAutorizado();
  const codigo = new URL(peticion.url).searchParams.get('c');
  if (!codigoValido(codigo)) return error('No encontramos esa familia.', 404);
  await eliminarFamilia(codigo);
  return json({ ok: true });
});

function noAutorizado() {
  if (!process.env.ADMIN_PASSWORD) return error('Falta configurar ADMIN_PASSWORD en Vercel.', 503);
  return error('La clave no es correcta.', 401);
}
