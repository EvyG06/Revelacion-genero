import { EVENTO } from '../public/js/evento.js';

// Archivo .ics para "Agregar al calendario" en iPhone y Mac.
export function GET() {
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Revelacion del bebe//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:revelacion-${fecha(EVENTO.inicio)}@invitacion`,
    `DTSTAMP:${fecha(new Date().toISOString())}`,
    `DTSTART:${fecha(EVENTO.inicio)}`,
    `DTEND:${fecha(EVENTO.fin)}`,
    `SUMMARY:${escapar(EVENTO.titulo)}`,
    `LOCATION:${escapar(EVENTO.lugar)}`,
    `DESCRIPTION:${escapar(`¿Niña o niño? Acompáñennos a descubrirlo.\nCómo llegar: ${EVENTO.mapa}`)}`,
    `URL:${EVENTO.mapa}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT3H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Hoy es la revelación del bebé',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return new Response(`${lineas.map(plegar).join('\r\n')}\r\n`, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': 'inline; filename="revelacion-bebe.ics"',
    },
  });
}

const fecha = (iso) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '');

const escapar = (texto) => texto.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

// Las líneas de un .ics no pueden pasar de 75 bytes; las siguientes empiezan con un espacio.
function plegar(linea) {
  const codificador = new TextEncoder();
  const partes = [];
  let actual = '';
  let bytes = 0;
  let limite = 75;
  for (const caracter of linea) {
    const tamano = codificador.encode(caracter).length;
    if (bytes + tamano > limite) {
      partes.push(actual);
      actual = '';
      bytes = 0;
      limite = 74;
    }
    actual += caracter;
    bytes += tamano;
  }
  partes.push(actual);
  return partes.join('\r\n ');
}
