import { jsPDF } from 'jspdf';

const COLORS = {
  primary: [10, 70, 255],      // #0A46FF
  dark: [10, 27, 91],           // #0A1B5B
  light: [240, 245, 252],       // #f0f5fc
  border: [218, 226, 234],      // #dae2ea
  text: [123, 138, 163],        // #7b8aa3
};

const PAGE_WIDTH = 210;  // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

const createHeader = (doc, title, subtitle) => {
  // Logo/Header background
  doc.setFillColor(...COLORS.light);
  doc.rect(0, 0, PAGE_WIDTH, 35, 'F');
  
  // Company name
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('FLEX-WEBAPP', MARGIN, 15);
  
  // Title
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(title, MARGIN, 25);
  
  // Subtitle
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(subtitle, MARGIN, 32);
  
  return 40; // Return Y position after header
};

const addSection = (doc, yPos, title) => {
  // Section title
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(title, MARGIN, yPos);
  
  // Line under title
  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, yPos + 3, MARGIN + CONTENT_WIDTH, yPos + 3);
  
  return yPos + 10;
};

const addField = (doc, yPos, label, value, columnWidth = CONTENT_WIDTH) => {
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text(label + ':', MARGIN, yPos);
  
  doc.setTextColor(...COLORS.dark);
  doc.setFont(undefined, 'normal');
  const maxWidth = columnWidth - 5;
  const splitValue = doc.splitTextToSize(String(value || 'N/A'), maxWidth);
  doc.text(splitValue, MARGIN + 50, yPos);
  
  return yPos + 8;
};

const addTwoColumnFields = (doc, yPos, label1, value1, label2, value2) => {
  const colWidth = (CONTENT_WIDTH / 2) - 3;
  
  // Column 1
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text(label1 + ':', MARGIN, yPos);
  
  doc.setFont(undefined, 'normal');
  doc.text(String(value1 || 'N/A'), MARGIN, yPos + 5);
  
  // Column 2
  doc.setFont(undefined, 'bold');
  doc.text(label2 + ':', MARGIN + colWidth + 5, yPos);
  
  doc.setFont(undefined, 'normal');
  doc.text(String(value2 || 'N/A'), MARGIN + colWidth + 5, yPos + 5);
  
  return yPos + 13;
};

const checkPageBreak = (doc, yPos, requiredSpace = 30) => {
  if (yPos + requiredSpace > PAGE_HEIGHT - 20) {
    doc.addPage();
    return 20; // Return new Y position
  }
  return yPos;
};

const addPageNumber = (doc, pageNumber) => {
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(8);
  doc.text(`Página ${pageNumber}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: 'center' });
};

export const generarPDFContenedor = (paso1Data, paso2Data, paso3Data, archivos) => {
  const doc = new jsPDF();
  let pageNum = 1;
  let yPos = 20;
  
  // ============ HOJA 1: PASO 1 ============
  yPos = createHeader(doc, 'Información del Contenedor', 'Paso 1: Datos Básicos');
  
  // Información Básica
  yPos = addSection(doc, yPos, 'Información Básica');
  yPos = addTwoColumnFields(doc, yPos, 'Trailer No.', paso1Data.TrailerNo, 'Tipo', paso1Data.TrailerType);
  yPos = checkPageBreak(doc, yPos, 25);
  
  yPos = addTwoColumnFields(doc, yPos, 'Contenedor', paso1Data.SeaContainerType, 'Uso', paso1Data.UsoEmbarques);
  yPos = checkPageBreak(doc, yPos, 25);
  
  yPos = addTwoColumnFields(doc, yPos, 'Puerto Entrada', paso1Data.PortOfEntry, 'Booking #', paso1Data.BookingNo);
  yPos = checkPageBreak(doc, yPos, 25);
  
  yPos = addTwoColumnFields(doc, yPos, 'PO #', paso1Data.PoNo, 'Fecha Creación', formatDate(paso1Data.FechaCreacion));
  yPos = checkPageBreak(doc, yPos, 30);
  
  // Información Adicional
  yPos = addSection(doc, yPos, 'Información Adicional');
  yPos = addTwoColumnFields(doc, yPos, 'Qty Pallets', paso1Data.QtyPallets, 'Empty Date', formatDate(paso1Data.EmptyDate));
  yPos = checkPageBreak(doc, yPos, 25);
  
  yPos = addTwoColumnFields(doc, yPos, 'Seal San Luis', paso1Data.SealSanLuis, 'Departure Date', formatDate(paso1Data.DepartureDate));
  yPos = checkPageBreak(doc, yPos, 25);
  
  yPos = addTwoColumnFields(doc, yPos, 'Seal Yuma', paso1Data.SealYuma, 'Aging A', paso1Data.AgingA);
  yPos = checkPageBreak(doc, yPos, 25);
  
  yPos = addTwoColumnFields(doc, yPos, 'Actual Date', formatDate(paso1Data.ActualDate), 'Item Type', paso1Data.ItemType);
  yPos = checkPageBreak(doc, yPos, 25);
  
  if (paso1Data.Comments) {
    yPos = addSection(doc, yPos, 'Comentarios');
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const comments = doc.splitTextToSize(paso1Data.Comments, CONTENT_WIDTH);
    doc.text(comments, MARGIN, yPos);
  }
  
  addPageNumber(doc, pageNum);
  pageNum++;
  
  // ============ HOJA 2: PASO 2 ============
  doc.addPage();
  yPos = createHeader(doc, 'Inspección del Trailer', 'Paso 2: Reporte de Inspección');
  
  if (paso2Data) {
    yPos = addSection(doc, yPos, 'Información del Trailer');
    yPos = addTwoColumnFields(doc, yPos, 'Caja Trailer', paso2Data.CajaTrailer, 'Placas', paso2Data.Placas);
    yPos = checkPageBreak(doc, yPos, 25);
    
    yPos = addTwoColumnFields(doc, yPos, 'Estado', paso2Data.Estado, 'Turno', paso2Data.Turno);
    yPos = checkPageBreak(doc, yPos, 25);
    
    yPos = addTwoColumnFields(doc, yPos, 'Rampa', paso2Data.Rampa, 'Sellos', paso2Data.Sellos);
    yPos = checkPageBreak(doc, yPos, 25);
    
    yPos = addTwoColumnFields(doc, yPos, 'Total Pallets', paso2Data.TotalPallets, 'Longitud Container', paso2Data.LongitudContenedor);
    yPos = checkPageBreak(doc, yPos, 25);
    
    yPos = addTwoColumnFields(doc, yPos, 'Origen', paso2Data.Origen, 'Empresas', paso2Data.Empresas?.join(', ') || 'N/A');
    yPos = checkPageBreak(doc, yPos, 30);
    
    // Checklist
    const checklist = [
      { desc: 'Condiciones de las dos puertas del trailer', state: paso2Data.Cond1 },
      { desc: 'Revisar que se encuentre libre de olores extraños', state: paso2Data.Cond2 },
      { desc: 'Revisar que no tenga plagas, basura y humedad', state: paso2Data.Cond3 },
      { desc: 'Revisar que los empaques de la carga están cerrados', state: paso2Data.Cond4 },
      { desc: 'Condiciones de la pared del fondo del trailer', state: paso2Data.Cond5 },
      { desc: 'Condiciones de paredes internas del trailer', state: paso2Data.Cond6 },
      { desc: 'Condiciones internas del techo del trailer', state: paso2Data.Cond7 },
      { desc: 'Condiciones de piso | plataforma interna | del trailer', state: paso2Data.Cond8 }
    ];
    
    yPos = addSection(doc, yPos, 'Checklist de Revisión');
    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    checklist.forEach((item) => {
      yPos = checkPageBreak(doc, yPos, 10);
      const checked = item.state === 1 || item.state === true;

      // Draw checkbox square manually (Unicode symbols no son soportados por jsPDF)
      doc.setDrawColor(...COLORS.dark);
      doc.setLineWidth(0.4);
      doc.rect(MARGIN + 2, yPos - 3.5, 4, 4);
      if (checked) {
        doc.setLineWidth(0.7);
        doc.line(MARGIN + 2.6, yPos - 1.5, MARGIN + 4, yPos - 0.2);
        doc.line(MARGIN + 4, yPos - 0.2, MARGIN + 6.5, yPos - 3.8);
      }
      doc.setLineWidth(0.5);

      doc.setTextColor(...COLORS.dark);
      doc.text(item.desc, MARGIN + 8, yPos);
      yPos += 7;
    });
    
    // Firma
    if (paso2Data.FirmaResponsable) {
      yPos = checkPageBreak(doc, yPos, 40);
      yPos = addSection(doc, yPos, 'Firma del Responsable');
      try {
        // La firma viene como data URL: data:image/png;base64,...
        doc.addImage(paso2Data.FirmaResponsable, 'PNG', MARGIN, yPos, 80, 30);
        yPos += 35;
      } catch (error) {
        doc.setTextColor(...COLORS.text);
        doc.setFontSize(8);
        doc.text('Firma: [Imagen no disponible]', MARGIN, yPos);
        yPos += 10;
      }
    }
  }
  
  addPageNumber(doc, pageNum);
  pageNum++;
  
  // ============ HOJA 3: RESUMEN PASO 3 ============
  doc.addPage();
  yPos = createHeader(doc, 'Documentos del Archivero', 'Paso 3: Imágenes y documentos adjuntos');

  yPos = addSection(doc, yPos, 'Archivos adjuntos');
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const cantArchivos = archivos ? archivos.length : 0;
  doc.text(`Total de archivos adjuntos: ${cantArchivos}`, MARGIN, yPos);
  yPos += 6;
  if (cantArchivos > 0) {
    doc.text('Las imágenes se muestran en tamaño completo en las páginas siguientes.', MARGIN, yPos);
    yPos += 6;
    archivos.forEach((a, i) => {
      yPos = checkPageBreak(doc, yPos, 8);
      doc.setTextColor(...COLORS.text);
      doc.text(`${i + 1}. ${a.NombreArchivo} (${a.TipoArchivo || 'imagen'})`, MARGIN + 4, yPos);
      yPos += 6;
    });
  }

  addPageNumber(doc, pageNum);
  pageNum++;
  
  // ============ HOJA 4+: DOCUMENTOS (una hoja por imagen, tamaño completo) ============
  if (archivos && archivos.length > 0) {
    archivos.forEach((archivo, index) => {
      const mimeType = archivo.TipoArchivo || '';
      const isImage = archivo.ContenidoBase64 && (
        mimeType.startsWith('image/') ||
        mimeType === 'imagen' ||
        mimeType === 'foto'
      );

      doc.addPage();
      pageNum++;

      if (isImage) {
        try {
          let imageData = archivo.ContenidoBase64;
          if (!imageData.startsWith('data:')) {
            const mime = mimeType.startsWith('image/') ? mimeType : 'image/jpeg';
            imageData = `data:${mime};base64,` + imageData;
          }
          const format = imageData.includes('image/png') ? 'PNG' : 'JPEG';
          // Imagen ocupa la hoja completa (formato archivero)
          doc.addImage(imageData, format, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, '', 'FAST');
        } catch (error) {
          yPos = createHeader(doc, 'Documento Adjunto', `Archivo ${index + 1}`);
          doc.setTextColor(...COLORS.text);
          doc.setFontSize(9);
          doc.text(`[Imagen no disponible: ${archivo.NombreArchivo}]`, MARGIN, yPos);
          addPageNumber(doc, pageNum);
        }
      } else {
        yPos = createHeader(doc, 'Documento Adjunto', `Archivo ${index + 1}`);
        doc.setTextColor(...COLORS.dark);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(archivo.NombreArchivo, MARGIN, yPos);
        yPos += 8;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.text);
        doc.text(`Tipo: ${mimeType}`, MARGIN, yPos);
        yPos += 6;
        doc.text('[PDF o documento - ver archivo original]', MARGIN, yPos);
        addPageNumber(doc, pageNum);
      }
    });
  }
  
  // Descargar PDF
  const fileName = `Contenedor-${paso1Data.TrailerNo}-${formatDate(new Date())}.pdf`;
  doc.save(fileName);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};
