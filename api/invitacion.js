import { guardarFamilia, listarFamilias, obtenerFamilia } from '../server/store.js';
import { codigoValido, contarApuestas, error, json, leerJson, linea, parrafo } from '../server/util.js';

const APUESTAS = new Set(['nina', 'nino']);

// La invitación de una familia y, si ya respondió, cómo van las apuestas.
export async function GET(peticion) {
  const familia = await buscar(peticion);
  if (!familia) return error('Invitación no encontrada.', 404);
  const apuestas = familia.respuesta ? contarApuestas(await listarFamilias()) : null;
  return json({ familia: publica(familia), apuestas });
}

// Guarda la respuesta de la familia (o la reemplaza si la cambian).
export async function POST(peticion) {
  const familia = await buscar(peticion);
  if (!familia) return error('Invitación no encontrada.', 404);
  const cuerpo = await leerJson(peticion);
  if (!cuerpo || typeof cuerpo.asiste !== 'boolean') return error('Cuéntennos si nos acompañarán.');

  const personas = Array.isArray(cuerpo.personas) ? cuerpo.personas : [];
  if (personas.length > familia.cupo) {
    return error(`Tienen ${familia.cupo} ${familia.cupo === 1 ? 'lugar reservado' : 'lugares reservados'}.`);
  }
  if (cuerpo.asiste && personas.length === 0) return error('Agreguen al menos una persona.');

  const limpias = [];
  for (const persona of personas) {
    const nombre = linea(persona?.nombre, 60);
    if (!nombre) return error('Escriban el nombre de cada persona.');
    if (!APUESTAS.has(persona.apuesta)) return error(`Falta la apuesta de ${nombre}.`);
    limpias.push({ nombre, apuesta: persona.apuesta });
  }

  familia.respuesta = {
    asiste: cuerpo.asiste,
    personas: limpias,
    mensaje: parrafo(cuerpo.mensaje, 500),
    actualizada: new Date().toISOString(),
  };
  await guardarFamilia(familia);
  return json({ familia: publica(familia), apuestas: contarApuestas(await listarFamilias()) });
}

async function buscar(peticion) {
  const codigo = new URL(peticion.url).searchParams.get('c');
  return codigoValido(codigo) ? obtenerFamilia(codigo) : null;
}

function publica({ nombre, cupo, respuesta }) {
  return { nombre, cupo, respuesta };
}
