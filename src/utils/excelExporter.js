import * as XLSX from 'xlsx';

export const exportarExcel = (contenedores, fileName = 'Contenedores.xlsx') => {
  // Preparar datos para Excel
  const datos = contenedores.map((c) => ({
    'Trailer No.': c.TrailerNo || 'N/A',
    'Tipo Trailer': c.TrailerType || 'N/A',
    'Contenedor': c.SeaContainerType || 'N/A',
    'Puerto Entrada': c.PortOfEntry || 'N/A',
    'Uso': c.UsoEmbarques || 'N/A',
    'Booking #': c.BookingNo || 'N/A',
    'PO #': c.PoNo || 'N/A',
    'Qty Pallets': c.QtyPallets || 0,
    'Status': c.Status || 'En proceso',
    'Activo': c.Activo ? 'Sí' : 'No',
    'Fecha Creación': formatDate(c.FechaCreacion),
    'Fecha Completado': c.FechaCompletado ? formatDate(c.FechaCompletado) : 'Pendiente'
  }));

  // Crear workbook
  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Contenedores');

  // Ajustar ancho de columnas
  const colWidths = [
    { wch: 15 },  // Trailer No.
    { wch: 15 },  // Tipo Trailer
    { wch: 15 },  // Contenedor
    { wch: 18 },  // Puerto Entrada
    { wch: 15 },  // Uso
    { wch: 12 },  // Booking #
    { wch: 12 },  // PO #
    { wch: 12 },  // Qty Pallets
    { wch: 15 },  // Status
    { wch: 10 },  // Activo
    { wch: 15 },  // Fecha Creación
    { wch: 15 }   // Fecha Completado
  ];
  ws['!cols'] = colWidths;

  // Descargar
  XLSX.writeFile(wb, fileName);
};

export const exportarPaso1Excel = (paso1Data, fileName = 'Paso1.xlsx') => {
  const datos = [{
    'Campo': 'Trailer No.',
    'Valor': paso1Data.TrailerNo || 'N/A'
  }, {
    'Campo': 'Tipo Trailer',
    'Valor': paso1Data.TrailerType || 'N/A'
  }, {
    'Campo': 'Contenedor',
    'Valor': paso1Data.SeaContainerType || 'N/A'
  }, {
    'Campo': 'Uso',
    'Valor': paso1Data.UsoEmbarques || 'N/A'
  }, {
    'Campo': 'Puerto Entrada',
    'Valor': paso1Data.PortOfEntry || 'N/A'
  }, {
    'Campo': 'Booking #',
    'Valor': paso1Data.BookingNo || 'N/A'
  }, {
    'Campo': 'PO #',
    'Valor': paso1Data.PoNo || 'N/A'
  }, {
    'Campo': 'Qty Pallets',
    'Valor': paso1Data.QtyPallets || 0
  }, {
    'Campo': 'Comentarios',
    'Valor': paso1Data.Comments || 'N/A'
  }];

  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Paso 1');

  ws['!cols'] = [{ wch: 20 }, { wch: 40 }];
  XLSX.writeFile(wb, fileName);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};
