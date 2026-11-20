import { guardarFamilia, obtenerFamilia } from '../server/store.js';
import { codigoValido, error, json, leerJson, linea, manejar, parrafo } from '../server/util.js';

// La confirmación del baby shower se guarda en `confirmacion`. Lo que respondieron para la
// revelación (que no se hizo) queda intacto en `respuesta`, y solo lo ve el panel.

// La invitación de una familia y, si ya confirmó, su respuesta.
export const GET = manejar(async (peticion) => {
  const familia = await buscar(peticion);
  if (!familia) return error('Invitación no encontrada.', 404);
  return json({ familia: publica(familia) });
});

// Guarda la confirmación de la familia (o la reemplaza si la cambian).
export const POST = manejar(async (peticion) => {
  const familia = await buscar(peticion);
  if (!familia) return error('Invitación no encontrada.', 404);
  const cuerpo = await leerJson(peticion);
  if (!cuerpo || typeof cuerpo.asiste !== 'boolean') return error('Cuéntennos si nos acompañarán.');

  const personas = cuerpo.asiste && Array.isArray(cuerpo.personas) ? cuerpo.personas : [];
  if (personas.length > familia.cupo) {
    return error(`Tienen ${familia.cupo} ${familia.cupo === 1 ? 'lugar reservado' : 'lugares reservados'}.`);
  }
  if (cuerpo.asiste && personas.length === 0) return error('Agreguen al menos una persona.');

  const limpias = [];
  for (const persona of personas) {
    const nombre = linea(persona?.nombre, 60);
    if (!nombre) return error('Escriban el nombre de cada persona.');
    limpias.push({ nombre });
  }

  familia.confirmacion = {
    asiste: cuerpo.asiste,
    personas: limpias,
    mensaje: parrafo(cuerpo.mensaje, 500),
    actualizada: new Date().toISOString(),
  };
  await guardarFamilia(familia);
  return json({ familia: publica(familia) });
});

async function buscar(peticion) {
  const codigo = new URL(peticion.url).searchParams.get('c');
  return codigoValido(codigo) ? obtenerFamilia(codigo) : null;
}

function publica({ nombre, cupo, confirmacion }) {
  return { nombre, cupo, respuesta: confirmacion ?? null };
}
