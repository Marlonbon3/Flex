import { jsPDF } from 'jspdf';

const COLORS = {
  primary: [10, 70, 255],
  dark: [10, 27, 91],
  light: [240, 245, 252],
  border: [218, 226, 234],
  text: [123, 138, 163],
  white: [255, 255, 255],
  green: [16, 185, 129]
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

const createHeader = (doc, title, subtitle) => {
  // Header background
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_WIDTH, 30, 'F');

  // Company name
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('FLEXTRONICS TECHNOLOGIES', MARGIN, 13);

  // Title
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(title, MARGIN, 22);

  // Subtitle on the right
  doc.setFontSize(8);
  doc.text(subtitle, PAGE_WIDTH - MARGIN, 22, { align: 'right' });

  // Light separator
  doc.setFillColor(...COLORS.light);
  doc.rect(0, 30, PAGE_WIDTH, 4, 'F');

  return 42;
};

const addSection = (doc, yPos, title) => {
  yPos = checkPageBreak(doc, yPos, 15);
  doc.setFillColor(...COLORS.light);
  doc.rect(MARGIN, yPos - 5, CONTENT_WIDTH, 10, 'F');

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text(title, MARGIN + 4, yPos + 2);

  return yPos + 10;
};

const addTwoColumnFields = (doc, yPos, label1, value1, label2, value2) => {
  const colWidth = (CONTENT_WIDTH / 2) - 3;
  yPos = checkPageBreak(doc, yPos, 14);

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text(label1, MARGIN, yPos);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(9);
  const v1 = doc.splitTextToSize(String(value1 || 'N/A'), colWidth - 2);
  doc.text(v1, MARGIN, yPos + 5);

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text(label2, MARGIN + colWidth + 5, yPos);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(9);
  const v2 = doc.splitTextToSize(String(value2 || 'N/A'), colWidth - 2);
  doc.text(v2, MARGIN + colWidth + 5, yPos + 5);

  const lines = Math.max(v1.length, v2.length);
  return yPos + 5 + lines * 5 + 4;
};

const addField = (doc, yPos, label, value) => {
  yPos = checkPageBreak(doc, yPos, 14);
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text(label, MARGIN, yPos);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(String(value || 'N/A'), CONTENT_WIDTH);
  doc.text(lines, MARGIN, yPos + 5);
  return yPos + 5 + lines.length * 5 + 4;
};

const checkPageBreak = (doc, yPos, requiredSpace = 30) => {
  if (yPos + requiredSpace > PAGE_HEIGHT - 20) {
    doc.addPage();
    return 20;
  }
  return yPos;
};

const addPageNumber = (doc, pageNumber) => {
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text(`Pág. ${pageNumber}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 8, { align: 'center' });
  doc.text(formatDate(new Date()), PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 8, { align: 'right' });
};

export const generarPDFContenedor = (paso1Data, paso2Data, paso3Data, archivos) => {
  const doc = new jsPDF();
  let pageNum = 1;
  let yPos;

  // ── HOJA 1: PASO 1 ──
  yPos = createHeader(doc, 'RECIBO DE LLEGADA DE CONTENEDOR', 'Paso 1: Información General');

  yPos = addSection(doc, yPos, 'Información Básica del Contenedor');
  yPos = addTwoColumnFields(doc, yPos, 'TRAILER NO.', paso1Data.TrailerNo, 'TIPO DE TRAILER', paso1Data.TrailerType);
  yPos = addTwoColumnFields(doc, yPos, 'SEA CONTAINER TYPE', paso1Data.SeaContainerType, 'USO EMBARQUES', paso1Data.UsoEmbarques);
  yPos = addTwoColumnFields(doc, yPos, 'PUERTO DE ENTRADA', paso1Data.PortOfEntry, 'BOOKING #', paso1Data.BookingNo);
  yPos = addTwoColumnFields(doc, yPos, 'PO #', paso1Data.PoNo, 'FECHA CREACIÓN', formatDate(paso1Data.FechaCreacion));

  yPos = addSection(doc, yPos, 'Información Adicional');
  yPos = addTwoColumnFields(doc, yPos, 'QTY PALLETS', paso1Data.QtyPallets, 'EMPTY DATE', formatDate(paso1Data.EmptyDate));
  yPos = addTwoColumnFields(doc, yPos, 'SEAL # (SAN LUIS)', paso1Data.SealSanLuis, 'DEPARTURE DATE', formatDate(paso1Data.DepartureDate));
  yPos = addTwoColumnFields(doc, yPos, 'SEAL # (YUMA)', paso1Data.SealYuma, 'AGING A', paso1Data.AgingA);
  yPos = addTwoColumnFields(doc, yPos, 'ACTUAL DATE', formatDate(paso1Data.ActualDate), 'ITEM TYPE', paso1Data.ItemType);
  yPos = addTwoColumnFields(doc, yPos, 'AGING', paso1Data.Aging, 'DATE EXIT PORT', formatDate(paso1Data.DateExitPort));

  if (paso1Data.Comments) {
    yPos = addSection(doc, yPos, 'Comentarios');
    yPos = addField(doc, yPos, 'COMENTARIOS', paso1Data.Comments);
  }

  addPageNumber(doc, pageNum++);

  // ── HOJA 2: PASO 2 ──
  doc.addPage();
  yPos = createHeader(doc, 'INSPECCIÓN DE TRAILER/CONTENEDOR', 'Paso 2: Reporte de Inspección');

  if (paso2Data) {
    yPos = addSection(doc, yPos, 'Datos del Trailer');
    yPos = addTwoColumnFields(doc, yPos, 'CAJA TRAILER / TCN', paso2Data.CajaTrailer, 'PLACAS', paso2Data.Placas);
    yPos = addTwoColumnFields(doc, yPos, 'ESTADO', paso2Data.Estado, 'TURNO', paso2Data.Turno);
    yPos = addTwoColumnFields(doc, yPos, 'FECHA LLEGADA', formatDate(paso2Data.FechaLlegada), 'HORA REGISTRO', paso2Data.HoraRegistro);
    yPos = addTwoColumnFields(doc, yPos, 'RAMPA', paso2Data.Rampa, 'SELLOS', paso2Data.Sellos);
    yPos = addTwoColumnFields(doc, yPos, 'TOTAL PALLETS', paso2Data.TotalPallets, 'LONGITUD CONTENEDOR', paso2Data.LongitudContenedor);
    yPos = addTwoColumnFields(doc, yPos, 'ORIGEN', paso2Data.Origen, 'EMPRESAS', Array.isArray(paso2Data.Empresas) ? paso2Data.Empresas.join(', ') : (paso2Data.Empresas || 'N/A'));

    if (paso2Data.ResponsableDescarga) {
      yPos = addField(doc, yPos, 'RESPONSABLE DE DESCARGA', paso2Data.ResponsableDescarga);
    }

    // Checklist
    const checklistItems = [
      'Condiciones de las dos puertas del trailer',
      'Libre de olores extraños',
      'Sin plagas, basura o humedad',
      'Empaques de la carga cerrados',
      'Condiciones de la pared del fondo',
      'Condiciones de paredes internas',
      'Condiciones del techo interno',
      'Condiciones del piso/plataforma interna'
    ];
    const condValues = [
      paso2Data.Cond1, paso2Data.Cond2, paso2Data.Cond3, paso2Data.Cond4,
      paso2Data.Cond5, paso2Data.Cond6, paso2Data.Cond7, paso2Data.Cond8
    ];

    yPos = addSection(doc, yPos, 'Checklist de Revisión');
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    for (let i = 0; i < checklistItems.length; i++) {
      yPos = checkPageBreak(doc, yPos, 8);
      const checked = condValues[i];
      if (checked) {
        doc.setTextColor(...COLORS.green);
        doc.text('✓', MARGIN + 1, yPos);
      } else {
        doc.setTextColor(220, 50, 50);
        doc.text('✗', MARGIN + 1, yPos);
      }
      doc.setTextColor(...COLORS.dark);
      doc.text(checklistItems[i], MARGIN + 8, yPos);
      yPos += 7;
    }

    // Firma del responsable
    if (paso2Data.FirmaResponsable) {
      yPos = checkPageBreak(doc, yPos, 60);
      yPos = addSection(doc, yPos, 'Firma del Responsable');

      try {
        const firmaData = paso2Data.FirmaResponsable;
        const imgData = firmaData.startsWith('data:') ? firmaData : `data:image/png;base64,${firmaData}`;

        // Firma box border
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(0.5);
        doc.rect(MARGIN, yPos, 100, 35);

        doc.addImage(imgData, 'PNG', MARGIN + 1, yPos + 1, 98, 33);

        doc.setTextColor(...COLORS.text);
        doc.setFontSize(8);
        doc.text('Firma del Responsable de Descarga', MARGIN, yPos + 40);
        if (paso2Data.ResponsableDescarga) {
          doc.setTextColor(...COLORS.dark);
          doc.setFontSize(9);
          doc.setFont(undefined, 'bold');
          doc.text(paso2Data.ResponsableDescarga, MARGIN, yPos + 47);
        }
        yPos += 55;
      } catch (err) {
        console.error('Error embedding signature:', err);
        yPos = addField(doc, yPos, 'FIRMA', 'Firma disponible en el sistema');
      }
    }
  }

  addPageNumber(doc, pageNum++);

  // ── HOJA 3+: DOCUMENTOS ADJUNTOS ──
  if (archivos && archivos.length > 0) {
    doc.addPage();
    yPos = createHeader(doc, 'DOCUMENTOS ADJUNTOS', `Paso 3: ${archivos.length} archivo(s) adjunto(s)`);
    yPos = addSection(doc, yPos, `Archivos Adjuntos (${archivos.length})`);

    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      yPos = checkPageBreak(doc, yPos, 20);

      // File entry
      doc.setFillColor(248, 250, 252);
      doc.rect(MARGIN, yPos - 3, CONTENT_WIDTH, 14, 'F');

      doc.setTextColor(...COLORS.primary);
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text(`${i + 1}. ${archivo.NombreArchivo || archivo.nombre || 'Archivo'}`, MARGIN + 4, yPos + 5);

      doc.setTextColor(...COLORS.text);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      const tipoText = `Tipo: ${archivo.TipoArchivo || archivo.tipo || 'N/A'}  |  Fecha: ${formatDate(archivo.FechaCreacion)}`;
      doc.text(tipoText, MARGIN + 4, yPos + 10);
      yPos += 18;

      // Embed image if available
      const base64Content = archivo.ContenidoBase64 || archivo.contenido;
      const tipoArchivo = archivo.TipoArchivo || archivo.tipo || '';

      if (base64Content && (tipoArchivo.startsWith('image/') || tipoArchivo.includes('jpeg') || tipoArchivo.includes('png') || tipoArchivo.includes('jpg'))) {
        try {
          yPos = checkPageBreak(doc, yPos, 80);
          const imgData = base64Content.startsWith('data:') ? base64Content : `data:${tipoArchivo};base64,${base64Content}`;
          const maxWidth = CONTENT_WIDTH - 20;
          const maxHeight = 70;

          doc.setDrawColor(...COLORS.border);
          doc.setLineWidth(0.3);
          doc.rect(MARGIN + 10, yPos, maxWidth, maxHeight);
          doc.addImage(imgData, 'JPEG', MARGIN + 11, yPos + 1, maxWidth - 2, maxHeight - 2);
          yPos += maxHeight + 10;
        } catch (err) {
          console.warn('Could not embed image:', archivo.NombreArchivo, err.message);
        }
      }
    }

    addPageNumber(doc, pageNum++);
  }

  const fileName = `Contenedor-${paso1Data.TrailerNo || 'SN'}-${formatDateFile(new Date())}.pdf`;
  doc.save(fileName);
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

const formatDateFile = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}`;
};
