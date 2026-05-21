import React, { useState, useRef } from 'react';
import '../styles/agregarContenedor.css';
import { MdArrowBack } from 'react-icons/md';

export default function AgregarContenedor({ onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const signatureCanvasRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [formData, setFormData] = useState({
    // Paso 1: Información Básica
    trailerNo: '',
    trailerType: '',
    seaContainerType: '',
    usoEmbarques: '',
    portOfEntry: '',
    comments: '',

    // Paso 2: Inspección de Trailer/Contenedor
    cajaTrailer: '',
    placas: '',
    estado: '',
    fechaLlegada: '',
    turno: '1er turno',
    sellos: '',
    rampa: '',
    horaRegistro: '',
    totalPallets: '',
    longitudContenedor: '',
    origen: '',
    empresas: [],
    responsableDescarga: '',
    firmaResponsable: '', // Almacenar firma como data URL
    condiciones: {
      cond1: false,
      cond2: false,
      cond3: false,
      cond4: false,
      cond5: false,
      cond6: false,
      cond7: false,
      cond8: false
    },

    // Paso 3: Información Adicional
    qtyPallets: '',
    emptyDate: '',
    sealSanLuis: '',
    departureDate: '',
    sealYuma: '',
    agingA: '',
    actualDate: '',
    itemType: '',
    aging: '',
    bookingNo: '',
    dateExitPort: '',
    poNo: ''
  });

  const [attachments, setAttachments] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearSignature = () => {
    if (signatureCanvasRef.current) {
      const context = signatureCanvasRef.current.getContext('2d');
      context.clearRect(0, 0, signatureCanvasRef.current.width, signatureCanvasRef.current.height);
    }
  };

  const handleSaveSignature = () => {
    if (signatureCanvasRef.current) {
      const signatureDataUrl = signatureCanvasRef.current.toDataURL('image/png');
      setFormData(prev => ({
        ...prev,
        firmaResponsable: signatureDataUrl
      }));
    }
  };

  React.useEffect(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    // Esperar a que el canvas esté renderizado antes de inicializar
    const initCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = Math.max(250, rect.height) * window.devicePixelRatio;
      
      const context = canvas.getContext('2d');
      context.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      // Configuración del canvas
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = 2;
      context.strokeStyle = '#0A1B5B';
    };

    initCanvas();

    const context = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const handleStart = (e) => {
      e.preventDefault();
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();

      if (e.touches && e.touches.length > 0) {
        lastX = e.touches[0].clientX - rect.left;
        lastY = e.touches[0].clientY - rect.top;
      } else if (e.clientX !== undefined) {
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
      }
    };

    const handleMove = (e) => {
      if (!isDrawing) return;
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      let x, y;

      if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else if (e.clientX !== undefined) {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
      } else {
        return;
      }

      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(x, y);
      context.stroke();

      lastX = x;
      lastY = y;
    };

    const handleEnd = (e) => {
      e.preventDefault();
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', handleStart, false);
    canvas.addEventListener('mousemove', handleMove, false);
    canvas.addEventListener('mouseup', handleEnd, false);
    canvas.addEventListener('mouseout', handleEnd, false);
    canvas.addEventListener('touchstart', handleStart, false);
    canvas.addEventListener('touchmove', handleMove, false);
    canvas.addEventListener('touchend', handleEnd, false);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('mouseout', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
    };
  }, []);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSave = () => {
    console.log('Guardando formulario en paso:', currentStep);
    console.log('Datos:', formData);
    console.log('Adjuntos:', attachments);
    // Aquí irá la lógica para guardar en BD SQL Server
    alert(`Formulario guardado en paso ${currentStep}. Datos guardados temporalmente.`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep === totalSteps) {
      console.log('Completando y guardando formulario completo');
      console.log('Datos finales:', formData);
      console.log('Adjuntos finales:', attachments);
      // Aquí irá la lógica para guardar completo en BD
      alert('Contenedor agregado exitosamente!');
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <button className="back-btn" onClick={onClose} title="Cerrar">
            <MdArrowBack />
          </button>
          <div className="header-content">
            <h1>Nueva llegada de contenedor</h1>
            <p>Registra la información de la llegada del contenedor al almacén.</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
          </div>
          <div className="progress-steps">
            <span className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep === 1 ? 'current' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Información Básica</span>
            </span>
            <span className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep === 2 ? 'current' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Inspección de Trailer</span>
            </span>
            <span className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep === 3 ? 'current' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Información Adicional</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-grid">
            {/* PASO 1: Información Básica + Información Adicional (CRUD Completo) */}
            {currentStep === 1 && (
              <>
                <div className="step-title full-width">
                  <h2>Paso 1 de 3: Información Completa del Contenedor</h2>
                  <p>Completa todos los datos principales y adicionales del contenedor</p>
                </div>

                {/* SECCIÓN 1: Información Básica */}
                <div className="inspection-section full-width">
                  <h3 className="section-title">Información Básica</h3>
                </div>

                <div className="form-group">
                  <label htmlFor="trailerNo">TRAILER NO. <span className="required">*</span></label>
                  <input
                    id="trailerNo"
                    type="text"
                    name="trailerNo"
                    placeholder="Ingresa el número de trailer"
                    value={formData.trailerNo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="trailerType">TRAILER TYPE <span className="required">*</span></label>
                  <select
                    id="trailerType"
                    name="trailerType"
                    value={formData.trailerType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona el tipo de trailer</option>
                    <option value="flatbed">Flatbed</option>
                    <option value="refrigerated">Refrigerated</option>
                    <option value="tanker">Tanker</option>
                    <option value="van">Van</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="seaContainerType">SEA CONTAINER TYPE</label>
                  <input
                    id="seaContainerType"
                    type="text"
                    name="seaContainerType"
                    placeholder="Ingresa el tipo de contenedor"
                    value={formData.seaContainerType}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="usoEmbarques">USO EMBARQUES</label>
                  <select
                    id="usoEmbarques"
                    name="usoEmbarques"
                    value={formData.usoEmbarques}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="export">Exportación</option>
                    <option value="import">Importación</option>
                    <option value="storage">Almacenamiento</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="portOfEntry">PORT OF ENTRY</label>
                  <input
                    id="portOfEntry"
                    type="text"
                    name="portOfEntry"
                    placeholder="Ingresa el puerto de entrada"
                    value={formData.portOfEntry}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="comments">COMMENTS</label>
                  <textarea
                    id="comments"
                    name="comments"
                    placeholder="Ingresa comentarios"
                    value={formData.comments}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>

                {/* SECCIÓN 2: Información Adicional */}
                <div className="inspection-section full-width">
                  <h3 className="section-title">Información Adicional</h3>
                </div>

                <div className="form-group">
                  <label htmlFor="qtyPallets">QTY OF PALLETS</label>
                  <input
                    id="qtyPallets"
                    type="number"
                    name="qtyPallets"
                    placeholder="Ingresa la cantidad de pallets"
                    value={formData.qtyPallets}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emptyDate">EMPTY DATE</label>
                  <input
                    id="emptyDate"
                    type="date"
                    name="emptyDate"
                    value={formData.emptyDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sealSanLuis">SEAL # (SanLuis)</label>
                  <input
                    id="sealSanLuis"
                    type="text"
                    name="sealSanLuis"
                    placeholder="Ingresa número de sello"
                    value={formData.sealSanLuis}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="departureDate">DEPARTURE DATE</label>
                  <input
                    id="departureDate"
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sealYuma">SEAL # (Yuma)</label>
                  <input
                    id="sealYuma"
                    type="text"
                    name="sealYuma"
                    placeholder="Ingresa número de sello"
                    value={formData.sealYuma}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="agingA">AGING A</label>
                  <input
                    id="agingA"
                    type="text"
                    name="agingA"
                    placeholder="Ingresa el valor A"
                    value={formData.agingA}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="actualDate">ACTUAL DATE <span className="required">*</span></label>
                  <input
                    id="actualDate"
                    type="date"
                    name="actualDate"
                    value={formData.actualDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="itemType">ITEM TYPE</label>
                  <input
                    id="itemType"
                    type="text"
                    name="itemType"
                    placeholder="Ingresa el tipo de item"
                    value={formData.itemType}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="aging">AGING</label>
                  <input
                    id="aging"
                    type="text"
                    name="aging"
                    placeholder="Ingresa el valor de aging"
                    value={formData.aging}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bookingNo">BOOKING #</label>
                  <input
                    id="bookingNo"
                    type="text"
                    name="bookingNo"
                    placeholder="Ingresa el número de booking"
                    value={formData.bookingNo}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dateExitPort">DATE EXIT OF PORT</label>
                  <input
                    id="dateExitPort"
                    type="date"
                    name="dateExitPort"
                    value={formData.dateExitPort}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="poNo">PO.# <span className="required">*</span></label>
                  <input
                    id="poNo"
                    type="text"
                    name="poNo"
                    placeholder="Ingresa el número de PO"
                    value={formData.poNo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Attachments */}
                <div className="form-group full-width">
                  <label>ATTACHMENTS</label>
                  <div className="attachments-section">
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        id="fileInput"
                        multiple
                        onChange={handleFileChange}
                        className="hidden-file-input"
                      />
                      <label htmlFor="fileInput" className="file-input-label">
                        <span className="link-icon">🔗</span>
                        <span className="link-text">Agregar archivos</span>
                      </label>
                      <span className="file-hint">o arrastra y suelta aquí</span>
                    </div>

                    {attachments.length > 0 && (
                      <div className="attachments-list">
                        {attachments.map((file, index) => (
                          <div key={index} className="attachment-item">
                            <span className="file-name">{file.name}</span>
                            <button
                              type="button"
                              className="remove-file"
                              onClick={() => removeAttachment(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* PASO 2: Inspección de Trailer/Contenedor */}
            {currentStep === 2 && (
              <>
                <div className="step-title full-width">
                  <h2>Paso 2 de 3: Inspección de Trailer/Contenedor Marítimo</h2>
                  <p>Registra los resultados de la inspección del trailer o contenedor</p>
                </div>

                {/* Sección Izquierda: Datos Básicos del Trailer */}
                <div className="inspection-section">
                  <h3 className="section-title">Caja de Trailer</h3>
                  
                  <div className="form-group">
                    <label htmlFor="cajaTrailer">CAJA DE TRAILER / TCN <span className="required">*</span></label>
                    <input
                      id="cajaTrailer"
                      type="text"
                      name="cajaTrailer"
                      placeholder="Ej. TCN2194580"
                      value={formData.cajaTrailer}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="placas">PLACAS</label>
                    <input
                      id="placas"
                      type="text"
                      name="placas"
                      placeholder="Ingresa placas"
                      value={formData.placas}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="estado">ESTADO</label>
                    <input
                      id="estado"
                      type="text"
                      name="estado"
                      placeholder="Ej. Bueno, Dañado"
                      value={formData.estado}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fechaLlegada">FECHA LLEGADA</label>
                    <input
                      id="fechaLlegada"
                      type="date"
                      name="fechaLlegada"
                      value={formData.fechaLlegada}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Turno */}
                <div className="inspection-section">
                  <h3 className="section-title">Turno</h3>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name="turno"
                        value="1er turno"
                        checked={formData.turno === '1er turno'}
                        onChange={handleInputChange}
                      />
                      1er turno
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="turno"
                        value="2do turno"
                        checked={formData.turno === '2do turno'}
                        onChange={handleInputChange}
                      />
                      2do turno
                    </label>
                  </div>
                </div>

                {/* Checklist de Condiciones */}
                <div className="inspection-section full-width">
                  <h3 className="section-title">Revisar estos puntos antes de empezar a cargar/descargar el trailer</h3>
                  <div className="checklist">
                    {[
                      'Condiciones de las dos puertas del trailer',
                      'Revisar que se encuentre libre de olores extraños',
                      'Revisar que no tenga plagas, basura y humedad',
                      'Revisar que los empaques de la carga están cerrados',
                      'Condiciones de la pared del fondo del trailer',
                      'Condiciones de paredes internas del trailer',
                      'Condiciones internas del techo del trailer',
                      'Condiciones de piso | plataforma interna | del trailer'
                    ].map((condition, idx) => {
                      const condKey = `cond${idx + 1}`;
                      return (
                        <label key={idx} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={formData.condiciones[condKey]}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                condiciones: {
                                  ...prev.condiciones,
                                  [condKey]: e.target.checked
                                }
                              }));
                            }}
                          />
                          <span>{condition}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Información de Llegada */}
                <div className="inspection-section">
                  <h3 className="section-title">Información de Llegada</h3>
                  
                  <div className="form-group">
                    <label htmlFor="sellos">SELLOS</label>
                    <input
                      id="sellos"
                      type="text"
                      name="sellos"
                      placeholder="Ingresa sellos"
                      value={formData.sellos}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="rampa">RAMPA</label>
                    <input
                      id="rampa"
                      type="text"
                      name="rampa"
                      placeholder="Ej. 7"
                      value={formData.rampa}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="horaRegistro">HORA REGISTRO</label>
                    <input
                      id="horaRegistro"
                      type="time"
                      name="horaRegistro"
                      value={formData.horaRegistro}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="totalPallets">TOTAL PALLETS</label>
                    <input
                      id="totalPallets"
                      type="number"
                      name="totalPallets"
                      placeholder="Ingresa cantidad"
                      value={formData.totalPallets}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Longitud de Contenedor */}
                <div className="inspection-section">
                  <h3 className="section-title">Longitud de Contenedor</h3>
                  <div className="radio-group-inline">
                    {["20'", "40'", "48'", "53'", "Otro"].map((length) => (
                      <label key={length}>
                        <input
                          type="radio"
                          name="longitudContenedor"
                          value={length}
                          checked={formData.longitudContenedor === length}
                          onChange={handleInputChange}
                        />
                        {length}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Origen */}
                <div className="inspection-section">
                  <h3 className="section-title">ORIGEN (ARRIBO)</h3>
                  <div className="radio-group-inline">
                    {['Aire', 'Marítimo', 'Nacional', 'Importación'].map((orig) => (
                      <label key={orig}>
                        <input
                          type="radio"
                          name="origen"
                          value={orig}
                          checked={formData.origen === orig}
                          onChange={handleInputChange}
                        />
                        {orig}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Empresas */}
                <div className="inspection-section">
                  <h3 className="section-title">EMPRESAS</h3>
                  <div className="checkbox-group-inline">
                    {['BOSE', 'DYSON', 'NESTLE'].map((company) => (
                      <label key={company}>
                        <input
                          type="checkbox"
                          checked={formData.empresas.includes(company)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                empresas: [...prev.empresas, company]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                empresas: prev.empresas.filter(c => c !== company)
                              }));
                            }
                          }}
                        />
                        {company}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Responsable del Proceso de Descarga - Firma */}
                <div className="inspection-section full-width">
                  <h3 className="section-title">Firma del Responsable de Descarga</h3>
                  
                  <div className="signature-container">
                    <p className="signature-label">Firma (escribir con el dedo en la tableta)</p>
                    <div style={{ width: '100%' }}>
                      <canvas
                        ref={signatureCanvasRef}
                        className="signature-canvas"
                        style={{
                          display: 'block',
                          width: '100%',
                          minHeight: '250px',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                    <div className="signature-buttons">
                      <button
                        type="button"
                        className="btn-clear-signature"
                        onClick={handleClearSignature}
                      >
                        Limpiar Firma
                      </button>
                      <button
                        type="button"
                        className="btn-save-signature"
                        onClick={handleSaveSignature}
                      >
                        Guardar Firma
                      </button>
                    </div>
                    {formData.firmaResponsable && (
                      <div className="signature-saved">
                        <p>✓ Firma guardada correctamente</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* PASO 3: Escaneo de Documentos */}
            {currentStep === 3 && (
              <>
                <div className="step-title full-width">
                  <h2>Paso 3 de 3: Escaneo de Documentos</h2>
                  <p>Captura o sube documentos relacionados con el contenedor</p>
                </div>

                <div className="scan-section full-width">
                  <div className="scan-buttons-container">
                    <button
                      type="button"
                      className="btn-scan-camera"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <span className="scan-icon">📷</span>
                      <span className="scan-text">Capturar con Cámara</span>
                    </button>
                    <button
                      type="button"
                      className="btn-scan-upload"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <span className="scan-icon">📁</span>
                      <span className="scan-text">Subir Documento</span>
                    </button>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      multiple
                      capture="environment"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {attachments.length > 0 && (
                    <div className="scanned-documents">
                      <h3 className="section-title">Documentos Capturados</h3>
                      <div className="documents-list">
                        {attachments.map((file, index) => (
                          <div key={index} className="document-item">
                            <div className="document-info">
                              <span className="document-icon">
                                {file.type.startsWith('image/') ? '🖼️' : '📄'}
                              </span>
                              <div className="document-details">
                                <span className="document-name">{file.name}</span>
                                <span className="document-size">
                                  {(file.size / 1024).toFixed(2)} KB
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="remove-document"
                              onClick={() => removeAttachment(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="scan-info">
                    <p>📱 Optimizado para tabletas - toca los botones para capturar o subir documentos</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-action btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn-action btn-save" onClick={handleSave}>
              Guardar
            </button>
            {currentStep > 1 && (
              <button type="button" className="btn-action btn-previous" onClick={handlePrevious}>
                Atrás
              </button>
            )}
            {currentStep < totalSteps && (
              <button type="button" className="btn-action btn-next" onClick={handleNext}>
                Siguiente
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
