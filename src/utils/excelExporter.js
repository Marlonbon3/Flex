import ExcelJS from 'exceljs';

const AZUL = '0A46FF';
const AZUL_OSCURO = '0A1B5B';
const GRIS_CLARO = 'F5F7FA';
const BLANCO = 'FFFFFF';
const BORDE_GRIS = 'DAE2EA';

const borderThin = {
  top: { style: 'thin', color: { argb: BORDE_GRIS } },
  left: { style: 'thin', color: { argb: BORDE_GRIS } },
  bottom: { style: 'thin', color: { argb: BORDE_GRIS } },
  right: { style: 'thin', color: { argb: BORDE_GRIS } },
};

const fontBase = { name: 'Calibri', size: 11 };

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const descargar = async (workbook, fileName) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportarExcel = async (contenedores, fileName = 'Archivo.xlsx') => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Flex-WebApp';
  wb.created = new Date();

  const ws = wb.addWorksheet('Contenedores', {
    views: [{ state: 'frozen', ySplit: 3 }],
  });

  // ── Columnas ────────────────────────────────────────────────────────
  ws.columns = [
    { key: 'trailer',   width: 16 },
    { key: 'tipo',      width: 18 },
    { key: 'contenedor',width: 18 },
    { key: 'puerto',    width: 20 },
    { key: 'uso',       width: 16 },
    { key: 'booking',   width: 14 },
    { key: 'po',        width: 14 },
    { key: 'pallets',   width: 12 },
    { key: 'status',    width: 15 },
    { key: 'creacion',  width: 15 },
    { key: 'completado',width: 15 },
  ];

  // ── Fila 1: Título ───────────────────────────────────────────────────
  ws.mergeCells('A1:K1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'REPORTE DE CONTENEDORES ARCHIVADOS';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: BLANCO } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_OSCURO } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 32;

  // ── Fila 2: Fecha generación ─────────────────────────────────────────
  ws.mergeCells('A2:K2');
  const subCell = ws.getCell('A2');
  subCell.value = `Generado: ${formatDate(new Date())}  |  Total registros: ${contenedores.length}`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: BLANCO } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 20;

  // ── Fila 3: Headers ──────────────────────────────────────────────────
  const headers = [
    'Trailer No.', 'Tipo Trailer', 'Contenedor', 'Puerto Entrada',
    'Uso', 'Booking #', 'PO #', 'Qty Pallets', 'Status',
    'Fecha Creación', 'Fecha Completado',
  ];
  const headerRow = ws.addRow(headers);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { ...fontBase, bold: true, color: { argb: BLANCO } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = borderThin;
  });

  // ── Filas de datos ───────────────────────────────────────────────────
  contenedores.forEach((c, i) => {
    const row = ws.addRow([
      c.TrailerNo || 'N/A',
      c.TrailerType || 'N/A',
      c.SeaContainerType || 'N/A',
      c.PortOfEntry || 'N/A',
      c.UsoEmbarques || 'N/A',
      c.BookingNo || 'N/A',
      c.PoNo || 'N/A',
      c.QtyPallets || 0,
      c.Status || 'En proceso',
      formatDate(c.FechaCreacion),
      c.FechaCompletado ? formatDate(c.FechaCompletado) : 'Pendiente',
    ]);
    row.height = 18;
    const bgColor = i % 2 === 0 ? BLANCO : GRIS_CLARO;
    row.eachCell((cell, colNumber) => {
      cell.font = { ...fontBase, color: { argb: AZUL_OSCURO } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.alignment = { horizontal: colNumber === 8 ? 'center' : 'left', vertical: 'middle' };
      cell.border = borderThin;
    });
    // Trailer No en azul negrita
    const trailerCell = row.getCell(1);
    trailerCell.font = { ...fontBase, bold: true, color: { argb: AZUL } };
  });

  await descargar(wb, fileName);
};

export const exportarPaso1Excel = async (paso1Data, fileName = 'Paso1.xlsx') => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Detalle Contenedor');

  ws.columns = [{ key: 'campo', width: 22 }, { key: 'valor', width: 45 }];

  // Título
  ws.mergeCells('A1:B1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'DETALLE DE CONTENEDOR';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: BLANCO } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_OSCURO } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 30;

  const campos = [
    ['Trailer No.', paso1Data.TrailerNo],
    ['Tipo Trailer', paso1Data.TrailerType],
    ['Contenedor', paso1Data.SeaContainerType],
    ['Uso', paso1Data.UsoEmbarques],
    ['Puerto Entrada', paso1Data.PortOfEntry],
    ['Booking #', paso1Data.BookingNo],
    ['PO #', paso1Data.PoNo],
    ['Qty Pallets', paso1Data.QtyPallets],
    ['Comentarios', paso1Data.Comments],
  ];

  campos.forEach(([campo, valor], i) => {
    const row = ws.addRow([campo, valor || 'N/A']);
    row.height = 18;
    const bg = i % 2 === 0 ? BLANCO : GRIS_CLARO;
    const campoCell = row.getCell(1);
    campoCell.font = { ...fontBase, bold: true, color: { argb: AZUL_OSCURO } };
    campoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    campoCell.border = borderThin;
    const valCell = row.getCell(2);
    valCell.font = { ...fontBase, color: { argb: AZUL_OSCURO } };
    valCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    valCell.border = borderThin;
  });

  await descargar(wb, fileName);
};
