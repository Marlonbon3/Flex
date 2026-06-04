import * as XLSX from 'xlsx';

// Blue header style injected via raw XML after the workbook is built.
// We patch the worksheet XML to add a shared-style that paints headers blue.
const HEADER_BG = '0A46FF';   // Azul primario de la app
const HEADER_FG = 'FFFFFF';   // Texto blanco

const buildStyledWorkbook = (sheetName, headers, rows, colWidths) => {
  // 1. Build the data array: first row = headers, rest = data rows
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // 2. Column widths
  ws['!cols'] = colWidths.map(w => ({ wch: w }));

  // 3. Freeze the header row
  ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft' };

  // 4. Inject styles via the raw XML approach supported in xlsx 0.18.x
  //    We manually set the `s` property on each cell and pass `cellStyles: true` on write.
  //    Header row index = 0 (row 1 in Excel)
  headers.forEach((_, colIdx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
    if (!ws[cellRef]) return;
    ws[cellRef].s = {
      fill: { patternType: 'solid', fgColor: { rgb: HEADER_BG } },
      font: { bold: true, color: { rgb: HEADER_FG }, sz: 11 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: false },
      border: {
        bottom: { style: 'thin', color: { rgb: 'FFFFFF' } }
      }
    };
  });

  // 5. Style data rows: alternating light-blue tint
  rows.forEach((_, rowIdx) => {
    const r = rowIdx + 1; // +1 because row 0 is header
    const bg = rowIdx % 2 === 0 ? 'F0F5FC' : 'FFFFFF';
    headers.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r, c: colIdx });
      if (!ws[cellRef]) return;
      ws[cellRef].s = {
        fill: { patternType: 'solid', fgColor: { rgb: bg } },
        font: { sz: 10, color: { rgb: '0A1B5B' } },
        alignment: { vertical: 'center' }
      };
    });
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return wb;
};

export const exportarExcel = (contenedores, fileName = 'Contenedores.xlsx') => {
  const headers = [
    'Trailer No.', 'Tipo Trailer', 'Contenedor', 'Puerto Entrada',
    'Uso', 'Booking #', 'PO #', 'Qty Pallets',
    'Status', 'Activo', 'Fecha Creación', 'Fecha Completado'
  ];

  const rows = contenedores.map(c => [
    c.TrailerNo || 'N/A',
    c.TrailerType || 'N/A',
    c.SeaContainerType || 'N/A',
    c.PortOfEntry || 'N/A',
    c.UsoEmbarques || 'N/A',
    c.BookingNo || 'N/A',
    c.PoNo || 'N/A',
    c.QtyPallets ?? 0,
    c.Status || 'En proceso',
    c.Activo ? 'Sí' : 'No',
    formatDate(c.FechaCreacion),
    c.FechaCompletado ? formatDate(c.FechaCompletado) : 'Pendiente'
  ]);

  const colWidths = [15, 15, 15, 18, 15, 12, 12, 12, 15, 8, 15, 15];
  const wb = buildStyledWorkbook('Contenedores', headers, rows, colWidths);

  XLSX.writeFile(wb, fileName, { cellStyles: true, bookSST: false });
};

export const exportarPaso1Excel = (paso1Data, fileName = 'Paso1.xlsx') => {
  const headers = ['Campo', 'Valor'];
  const rows = [
    ['Trailer No.',    paso1Data.TrailerNo    || 'N/A'],
    ['Tipo Trailer',   paso1Data.TrailerType  || 'N/A'],
    ['Contenedor',     paso1Data.SeaContainerType || 'N/A'],
    ['Uso',            paso1Data.UsoEmbarques || 'N/A'],
    ['Puerto Entrada', paso1Data.PortOfEntry  || 'N/A'],
    ['Booking #',      paso1Data.BookingNo    || 'N/A'],
    ['PO #',           paso1Data.PoNo         || 'N/A'],
    ['Qty Pallets',    paso1Data.QtyPallets   ?? 0],
    ['Comentarios',    paso1Data.Comments     || 'N/A']
  ];

  const wb = buildStyledWorkbook('Paso 1', headers, rows, [25, 45]);
  XLSX.writeFile(wb, fileName, { cellStyles: true, bookSST: false });
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return 'N/A';
  }
};
