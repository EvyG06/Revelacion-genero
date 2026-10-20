// Exporta la lista de invitados a Excel (.xlsx) sin librerías: un ZIP sin compresión con el XML mínimo.

const ESTADOS = { asiste: 'Asiste', no: 'No asiste', pendiente: 'Pendiente' };
const APUESTAS = { nina: 'Niña', nino: 'Niño' };

export function descargarExcel(familias, enlace) {
  const estado = (familia) => ESTADOS[!familia.respuesta ? 'pendiente' : familia.respuesta.asiste ? 'asiste' : 'no'];
  const invitados = [['Familia', 'Estado', 'Nombre', 'Apuesta', 'Link']];
  const resumen = [['Familia', 'Estado', 'Lugares reservados', 'Personas que asisten', 'Apuestas niña', 'Apuestas niño', 'Mensaje para el bebé', 'Respondió', 'Link']];

  for (const familia of familias) {
    const personas = familia.respuesta?.personas ?? [];
    if (personas.length) {
      for (const persona of personas) {
        invitados.push([familia.nombre, estado(familia), persona.nombre, APUESTAS[persona.apuesta], enlace(familia)]);
      }
    } else {
      invitados.push([familia.nombre, estado(familia), '', '', enlace(familia)]);
    }
    resumen.push([
      familia.nombre,
      estado(familia),
      familia.cupo,
      familia.respuesta?.asiste ? personas.length : 0,
      personas.filter((p) => p.apuesta === 'nina').length,
      personas.filter((p) => p.apuesta === 'nino').length,
      familia.respuesta?.mensaje ?? '',
      familia.respuesta ? new Date(familia.respuesta.actualizada).toLocaleString('es-CO') : '',
      enlace(familia),
    ]);
  }

  const archivo = libro([
    { nombre: 'Invitados', filas: invitados, anchos: [30, 12, 28, 10, 40] },
    { nombre: 'Familias', filas: resumen, anchos: [30, 12, 12, 14, 12, 12, 48, 20, 40] },
  ]);
  const url = URL.createObjectURL(archivo);
  const enlaceDescarga = document.createElement('a');
  enlaceDescarga.href = url;
  enlaceDescarga.download = `invitados-revelacion-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.append(enlaceDescarga);
  enlaceDescarga.click();
  enlaceDescarga.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const ESPACIOS = {
  tipos: 'http://schemas.openxmlformats.org/package/2006/content-types',
  relaciones: 'http://schemas.openxmlformats.org/package/2006/relationships',
  hoja: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
  documento: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
};
const TIPO = 'application/vnd.openxmlformats-officedocument.spreadsheetml';

const ESTILOS = `<styleSheet xmlns="${ESPACIOS.hoja}">
<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF3EADD"/><bgColor indexed="64"/></patternFill></fill></fills>
<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
</styleSheet>`;

function libro(hojas) {
  const xml = (contenido) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${contenido}`;
  const partes = [
    ['[Content_Types].xml', `<Types xmlns="${ESPACIOS.tipos}"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${TIPO}.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="${TIPO}.styles+xml"/>${hojas.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="${TIPO}.worksheet+xml"/>`).join('')}</Types>`],
    ['_rels/.rels', `<Relationships xmlns="${ESPACIOS.relaciones}"><Relationship Id="rId1" Type="${ESPACIOS.documento}/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ['xl/workbook.xml', `<workbook xmlns="${ESPACIOS.hoja}" xmlns:r="${ESPACIOS.documento}"><sheets>${hojas.map((hoja, i) => `<sheet name="${escXml(hoja.nombre)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`],
    ['xl/_rels/workbook.xml.rels', `<Relationships xmlns="${ESPACIOS.relaciones}">${hojas.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${ESPACIOS.documento}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${hojas.length + 1}" Type="${ESPACIOS.documento}/styles" Target="styles.xml"/></Relationships>`],
    ['xl/styles.xml', ESTILOS],
    ...hojas.map((hoja, i) => [`xl/worksheets/sheet${i + 1}.xml`, hojaXml(hoja)]),
  ];
  const codificador = new TextEncoder();
  return zip(partes.map(([nombre, contenido]) => ({ nombre, datos: codificador.encode(xml(contenido)) })));
}

function hojaXml({ filas, anchos }) {
  const columnas = anchos.map((ancho, i) => `<col min="${i + 1}" max="${i + 1}" width="${ancho}" customWidth="1"/>`).join('');
  const datos = filas
    .map((fila, r) => `<row r="${r + 1}">${fila.map((valor, c) => celda(valor, `${String.fromCharCode(65 + c)}${r + 1}`, r === 0)).join('')}</row>`)
    .join('');
  return `<worksheet xmlns="${ESPACIOS.hoja}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${columnas}</cols><sheetData>${datos}</sheetData></worksheet>`;
}

function celda(valor, referencia, encabezado) {
  const estilo = encabezado ? ' s="1"' : '';
  if (typeof valor === 'number') return `<c r="${referencia}"${estilo}><v>${valor}</v></c>`;
  return `<c r="${referencia}"${estilo} t="inlineStr"><is><t xml:space="preserve">${escXml(valor)}</t></is></c>`;
}

function escXml(texto) {
  return String(texto ?? '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

// ---------- ZIP sin compresión ----------

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabla[n] = c >>> 0;
  }
  return tabla;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (const byte of bytes) c = TABLA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(archivos) {
  const codificador = new TextEncoder();
  const locales = [];
  const centrales = [];
  let desplazamiento = 0;
  for (const { nombre, datos } of archivos) {
    const nombreBytes = codificador.encode(nombre);
    const crc = crc32(datos);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true);
    local.setUint16(12, 0x21, true); // 1 de enero de 1980
    local.setUint32(14, crc, true);
    local.setUint32(18, datos.length, true);
    local.setUint32(22, datos.length, true);
    local.setUint16(26, nombreBytes.length, true);
    locales.push(new Uint8Array(local.buffer), nombreBytes, datos);

    const central = new DataView(new ArrayBuffer(46));
    central.setUint32(0, 0x02014b50, true);
    central.setUint16(4, 20, true);
    central.setUint16(6, 20, true);
    central.setUint16(8, 0x0800, true);
    central.setUint16(14, 0x21, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, datos.length, true);
    central.setUint32(24, datos.length, true);
    central.setUint16(28, nombreBytes.length, true);
    central.setUint32(42, desplazamiento, true);
    centrales.push(new Uint8Array(central.buffer), nombreBytes);
    desplazamiento += 30 + nombreBytes.length + datos.length;
  }
  const tamanoCentral = centrales.reduce((suma, parte) => suma + parte.length, 0);
  const fin = new DataView(new ArrayBuffer(22));
  fin.setUint32(0, 0x06054b50, true);
  fin.setUint16(8, archivos.length, true);
  fin.setUint16(10, archivos.length, true);
  fin.setUint32(12, tamanoCentral, true);
  fin.setUint32(16, desplazamiento, true);
  return new Blob([...locales, ...centrales, new Uint8Array(fin.buffer)], { type: `${TIPO}.sheet` });
}
