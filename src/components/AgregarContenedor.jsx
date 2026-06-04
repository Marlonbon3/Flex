import React, { useState, useRef } from 'react';
import '../styles/agregarContenedor.css';
import { MdArrowBack, MdDelete, MdImage } from 'react-icons/md';
import { FiCamera, FiUpload, FiX } from 'react-icons/fi';
import * as api from '../services/api';
import ConfirmDialog from './ConfirmDialog';

export default function AgregarContenedor({ onClose, initialPaso1ID, contenedorData }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [paso1ID, setPaso1ID] = useState(initialPaso1ID || null);

  const [formData, setFormData] = useState({
    trailerNo: '',
    trailerType: '',
    seaContainerType: '',
    usoEmbarques: '',
    portOfEntry: '',
    comments: '',
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
    firmaResponsable: '',
    condiciones: {
      cond1: false, cond2: false, cond3: false, cond4: false,
      cond5: false, cond6: false, cond7: false, cond8: false
    },
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
  const [paso1IDState, setPaso1IDState] = useState(initialPaso1ID || null);
  const [loading, setLoading] = useState(false);
  const signatureCanvasRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Dialog state
  const [dialog, setDialog] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });

  const showAlert = (title, message, type = 'info') => {
    setDialog({ isOpen: true, type, title, message, onConfirm: null });
  };

  const showConfirm = (title, message, onConfirm) => {
    setDialog({ isOpen: true, type: 'confirm', title, message, onConfirm });
  };

  const closeDialog = () => setDialog(d => ({ ...d, isOpen: false }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, firmaResponsable: '' }));
  };

  const handleSaveSignature = () => {
    if (signatureCanvasRef.current) {
      const signatureDataUrl = signatureCanvasRef.current.toDataURL('image/png');
      setFormData(prev => ({ ...prev, firmaResponsable: signatureDataUrl }));
      showAlert('Firma guardada', 'La firma ha sido registrada correctamente.', 'success');
    }
  };

  // Setup canvas when step 2 becomes active
  React.useEffect(() => {
    if (currentStep !== 2) return;

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || canvas.offsetWidth || 600;
    canvas.height = 250;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0A1B5B';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // If there's a saved signature, restore it
    if (formData.firmaResponsable) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = formData.firmaResponsable;
    }

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const getPos = (e) => {
      const r = canvas.getBoundingClientRect();
      const scaleX = canvas.width / r.width;
      const scaleY = canvas.height / r.height;
      if (e.touches && e.touches.length > 0) {
        return {
          x: (e.touches[0].clientX - r.left) * scaleX,
          y: (e.touches[0].clientY - r.top) * scaleY
        };
      }
      return {
        x: (e.clientX - r.left) * scaleX,
        y: (e.clientY - r.top) * scaleY
      };
    };

    const startDrawing = (e) => {
      e.preventDefault();
      isDrawing = true;
      const { x, y } = getPos(e);
      lastX = x;
      lastY = y;
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x;
      lastY = y;
    };

    const stopDrawing = (e) => {
      if (e) e.preventDefault();
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [currentStep]);

  // Pre-load existing data
  React.useEffect(() => {
    const cargarDatos = async () => {
      if (!initialPaso1ID) return;
      try {
        setLoading(true);
        const datosCompletos = await api.cargarPaso1(initialPaso1ID);
        if (datosCompletos) {
          setPaso1IDState(initialPaso1ID);
          setFormData(prev => ({
            ...prev,
            trailerNo: datosCompletos.TrailerNo || '',
            trailerType: datosCompletos.TrailerType || '',
            seaContainerType: datosCompletos.SeaContainerType || '',
            usoEmbarques: datosCompletos.UsoEmbarques || '',
            portOfEntry: datosCompletos.PortOfEntry || '',
            comments: datosCompletos.Comments || '',
            qtyPallets: datosCompletos.QtyPallets || '',
            emptyDate: datosCompletos.EmptyDate ? new Date(datosCompletos.EmptyDate).toISOString().split('T')[0] : '',
            sealSanLuis: datosCompletos.SealSanLuis || '',
            departureDate: datosCompletos.DepartureDate ? new Date(datosCompletos.DepartureDate).toISOString().split('T')[0] : '',
            sealYuma: datosCompletos.SealYuma || '',
            agingA: datosCompletos.AgingA || '',
            actualDate: datosCompletos.ActualDate ? new Date(datosCompletos.ActualDate).toISOString().split('T')[0] : '',
            itemType: datosCompletos.ItemType || '',
            aging: datosCompletos.Aging || '',
            bookingNo: datosCompletos.BookingNo || '',
            dateExitPort: datosCompletos.DateExitPort ? new Date(datosCompletos.DateExitPort).toISOString().split('T')[0] : '',
            poNo: datosCompletos.PoNo || '',
            cajaTrailer: datosCompletos.CajaTrailer || '',
            placas: datosCompletos.Placas || '',
            estado: datosCompletos.Estado || '',
            fechaLlegada: datosCompletos.FechaLlegada ? new Date(datosCompletos.FechaLlegada).toISOString().split('T')[0] : '',
            turno: datosCompletos.Turno || '1er turno',
            sellos: datosCompletos.Sellos || '',
            rampa: datosCompletos.Rampa || '',
            horaRegistro: datosCompletos.HoraRegistro || '',
            totalPallets: datosCompletos.TotalPallets || '',
            longitudContenedor: datosCompletos.LongitudContenedor || '',
            origen: datosCompletos.Origen || '',
            empresas: datosCompletos.Empresas ? JSON.parse(datosCompletos.Empresas) : [],
            responsableDescarga: datosCompletos.ResponsableDescarga || '',
            firmaResponsable: datosCompletos.FirmaResponsable || ''
          }));
          if (datosCompletos.Paso2ID) {
            setCurrentStep(2);
          } else {
            setCurrentStep(1);
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [initialPaso1ID]);

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      const usuarioActual = api.obtenerUsuarioActual();
      const usuarioID = usuarioActual?.id || 1;
      try {
        setLoading(true);
        if (currentStep === 1) {
          let response;
          if (paso1IDState) {
            response = await api.actualizarPaso1(paso1IDState, formData, usuarioID);
          } else {
            response = await api.guardarPaso1(formData, usuarioID);
            if (response.success && response.paso1ID) {
              setPaso1IDState(response.paso1ID);
            }
          }
          if (!response.success) {
            showAlert('Error', 'No se pudo guardar el Paso 1. Verifica los datos e intenta de nuevo.', 'error');
            setLoading(false);
            return;
          }
        } else if (currentStep === 2) {
          if (!paso1IDState) {
            showAlert('Atención', 'Primero debes guardar el Paso 1.', 'info');
            setLoading(false);
            return;
          }
          let horaLimpia = null;
          if (formData.horaRegistro && formData.horaRegistro.trim() !== '') {
            const match = formData.horaRegistro.match(/(\d{1,2}):(\d{2})/);
            if (match) {
              horaLimpia = `${String(parseInt(match[1])).padStart(2, '0')}:${match[2]}:00`;
            }
          }
          const inspeccionData = { ...formData, horaRegistro: horaLimpia, empresas: formData.empresas || [], paso1ID: paso1IDState };
          const response = await api.guardarPaso2(inspeccionData, usuarioID);
          if (!response.success) {
            showAlert('Error', 'No se pudo guardar el Paso 2. Verifica los datos e intenta de nuevo.', 'error');
            setLoading(false);
            return;
          }
          await api.actualizarEstado(paso1IDState, 2, true);
        }
      } catch (error) {
        showAlert('Error', error.message, 'error');
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const usuarioActual = api.obtenerUsuarioActual();
      const usuarioID = usuarioActual?.id || 1;

      if (currentStep === 1) {
        let response;
        if (paso1IDState) {
          response = await api.actualizarPaso1(paso1IDState, formData, usuarioID);
          if (response.success) {
            showAlert('Guardado', 'Paso 1 actualizado exitosamente.', 'success');
          } else {
            showAlert('Error', 'Error al actualizar Paso 1: ' + api.procesarError(response), 'error');
          }
        } else {
          response = await api.guardarPaso1(formData, usuarioID);
          if (response.success && response.paso1ID) {
            setPaso1IDState(response.paso1ID);
            showAlert('Guardado', 'Paso 1 guardado exitosamente.', 'success');
          } else {
            showAlert('Error', 'Error al guardar Paso 1: ' + api.procesarError(response), 'error');
          }
        }
      } else if (currentStep === 2) {
        if (!paso1IDState) {
          showAlert('Atención', 'Primero debes guardar el Paso 1.', 'info');
          setLoading(false);
          return;
        }
        let horaLimpia = null;
        if (formData.horaRegistro && formData.horaRegistro.trim() !== '') {
          const match = formData.horaRegistro.match(/(\d{1,2}):(\d{2})/);
          if (match) {
            horaLimpia = `${String(parseInt(match[1])).padStart(2, '0')}:${match[2]}:00`;
          }
        }
        const inspeccionData = { ...formData, horaRegistro: horaLimpia, empresas: formData.empresas || [], paso1ID: paso1IDState };
        const response = await api.guardarPaso2(inspeccionData, usuarioID);
        if (response.success) {
          showAlert('Guardado', 'Paso 2 guardado exitosamente.', 'success');
          await api.actualizarEstado(paso1IDState, 2, true);
        } else {
          showAlert('Error', 'Error al guardar Paso 2: ' + (response.error || 'Sin detalles'), 'error');
        }
      } else if (currentStep === 3) {
        const paso1IdFinal = paso1IDState || paso1ID;
        if (!paso1IdFinal) {
          showAlert('Error', 'No se encontró el ID del contenedor. Guarda primero el Paso 1.', 'error');
          setLoading(false);
          return;
        }
        if (attachments.length === 0) {
          showAlert('Atención', 'Sube al menos un documento para completar el Paso 3.', 'info');
          setLoading(false);
          return;
        }
        const response = await api.guardarPaso3(paso1IdFinal, attachments, usuarioID);
        if (response.success) {
          showAlert('Completado', 'Contenedor completado y archivado exitosamente.', 'success');
          setTimeout(() => onClose(), 1200);
        } else {
          showAlert('Error', 'Error al guardar documentos: ' + (response.error || 'Sin detalles'), 'error');
        }
      }
    } catch (error) {
      showAlert('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === totalSteps) {
      await handleSave();
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
            <h1>{paso1IDState ? 'Continuar con los Pasos' : 'Nueva llegada de contenedor'}</h1>
            <p>{paso1IDState
              ? 'Completa los pasos 2 y 3 para finalizar el registro.'
              : 'Registra la información de la llegada del contenedor al almacén.'}</p>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
          </div>
          <div className="progress-steps">
            {[1, 2, 3].map(n => (
              <span key={n} className={`step ${currentStep >= n ? 'active' : ''} ${currentStep === n ? 'current' : ''}`}>
                <span className="step-number">{n}</span>
                <span className="step-label">{n === 1 ? 'Información Básica' : n === 2 ? 'Inspección de Trailer' : 'Documentos'}</span>
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-grid">

            {/* PASO 1 */}
            {currentStep === 1 && (
              <>
                <div className="step-title full-width">
                  <h2>Paso 1 de 3: Información Completa del Contenedor</h2>
                  <p>Completa todos los datos principales y adicionales del contenedor</p>
                </div>

                <div className="inspection-section full-width">
                  <h3 className="section-title">Información Básica</h3>
                </div>

                <div className="form-group">
                  <label htmlFor="trailerNo">TRAILER NO. <span className="required">*</span></label>
                  <input id="trailerNo" type="text" name="trailerNo" placeholder="Ingresa el número de trailer" value={formData.trailerNo} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label htmlFor="trailerType">TRAILER TYPE <span className="required">*</span></label>
                  <select id="trailerType" name="trailerType" value={formData.trailerType} onChange={handleInputChange} required>
                    <option value="">Selecciona el tipo de trailer</option>
                    <option value="flatbed">Flatbed</option>
                    <option value="refrigerated">Refrigerated</option>
                    <option value="tanker">Tanker</option>
                    <option value="van">Van</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="seaContainerType">SEA CONTAINER TYPE</label>
                  <input id="seaContainerType" type="text" name="seaContainerType" placeholder="Ingresa el tipo de contenedor" value={formData.seaContainerType} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="usoEmbarques">USO EMBARQUES</label>
                  <select id="usoEmbarques" name="usoEmbarques" value={formData.usoEmbarques} onChange={handleInputChange}>
                    <option value="">Selecciona una opción</option>
                    <option value="export">Exportación</option>
                    <option value="import">Importación</option>
                    <option value="storage">Almacenamiento</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="portOfEntry">PORT OF ENTRY</label>
                  <input id="portOfEntry" type="text" name="portOfEntry" placeholder="Ingresa el puerto de entrada" value={formData.portOfEntry} onChange={handleInputChange} />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="comments">COMMENTS</label>
                  <textarea id="comments" name="comments" placeholder="Ingresa comentarios" value={formData.comments} onChange={handleInputChange} rows="3"></textarea>
                </div>

                <div className="inspection-section full-width">
                  <h3 className="section-title">Información Adicional</h3>
                </div>

                <div className="form-group">
                  <label htmlFor="qtyPallets">QTY OF PALLETS</label>
                  <input id="qtyPallets" type="number" name="qtyPallets" placeholder="Cantidad de pallets" value={formData.qtyPallets} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="emptyDate">EMPTY DATE</label>
                  <input id="emptyDate" type="date" name="emptyDate" value={formData.emptyDate} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="sealSanLuis">SEAL # (SanLuis)</label>
                  <input id="sealSanLuis" type="text" name="sealSanLuis" placeholder="Número de sello" value={formData.sealSanLuis} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="departureDate">DEPARTURE DATE</label>
                  <input id="departureDate" type="date" name="departureDate" value={formData.departureDate} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="sealYuma">SEAL # (Yuma)</label>
                  <input id="sealYuma" type="text" name="sealYuma" placeholder="Número de sello" value={formData.sealYuma} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="agingA">AGING A</label>
                  <input id="agingA" type="text" name="agingA" placeholder="Valor A" value={formData.agingA} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="actualDate">ACTUAL DATE <span className="required">*</span></label>
                  <input id="actualDate" type="date" name="actualDate" value={formData.actualDate} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label htmlFor="itemType">ITEM TYPE</label>
                  <input id="itemType" type="text" name="itemType" placeholder="Tipo de item" value={formData.itemType} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="aging">AGING</label>
                  <input id="aging" type="text" name="aging" placeholder="Valor de aging" value={formData.aging} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="bookingNo">BOOKING #</label>
                  <input id="bookingNo" type="text" name="bookingNo" placeholder="Número de booking" value={formData.bookingNo} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="dateExitPort">DATE EXIT OF PORT</label>
                  <input id="dateExitPort" type="date" name="dateExitPort" value={formData.dateExitPort} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label htmlFor="poNo">PO.# <span className="required">*</span></label>
                  <input id="poNo" type="text" name="poNo" placeholder="Número de PO" value={formData.poNo} onChange={handleInputChange} required />
                </div>

                <div className="form-group full-width">
                  <label>ATTACHMENTS</label>
                  <div className="attachments-section">
                    <div className="file-input-wrapper">
                      <input type="file" id="fileInput" multiple onChange={handleFileChange} className="hidden-file-input" />
                      <label htmlFor="fileInput" className="file-input-label">
                        <span className="link-icon">+</span>
                        <span className="link-text">Agregar archivos</span>
                      </label>
                      <span className="file-hint">o arrastra y suelta aquí</span>
                    </div>
                    {attachments.length > 0 && (
                      <div className="attachments-list">
                        {attachments.map((file, index) => (
                          <div key={index} className="attachment-item">
                            <span className="file-name">{file.name}</span>
                            <button type="button" className="remove-file" onClick={() => removeAttachment(index)}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* PASO 2 */}
            {currentStep === 2 && (
              <>
                <div className="step-title full-width">
                  <h2>Paso 2 de 3: Inspección de Trailer/Contenedor Marítimo</h2>
                  <p>Registra los resultados de la inspección del trailer o contenedor</p>
                </div>

                <div className="inspection-section">
                  <h3 className="section-title">Caja de Trailer</h3>
                  <div className="form-group">
                    <label htmlFor="cajaTrailer">CAJA DE TRAILER / TCN <span className="required">*</span></label>
                    <input id="cajaTrailer" type="text" name="cajaTrailer" placeholder="Ej. TCN2194580" value={formData.cajaTrailer} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="placas">PLACAS</label>
                    <input id="placas" type="text" name="placas" placeholder="Ingresa placas" value={formData.placas} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="estado">ESTADO</label>
                    <input id="estado" type="text" name="estado" placeholder="Ej. Bueno, Dañado" value={formData.estado} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fechaLlegada">FECHA LLEGADA</label>
                    <input id="fechaLlegada" type="date" name="fechaLlegada" value={formData.fechaLlegada} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="inspection-section">
                  <h3 className="section-title">Turno</h3>
                  <div className="radio-group">
                    {['1er turno', '2do turno'].map(t => (
                      <label key={t}>
                        <input type="radio" name="turno" value={t} checked={formData.turno === t} onChange={handleInputChange} />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>

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
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              condiciones: { ...prev.condiciones, [condKey]: e.target.checked }
                            }))}
                          />
                          <span>{condition}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="inspection-section">
                  <h3 className="section-title">Información de Llegada</h3>
                  <div className="form-group">
                    <label htmlFor="sellos">SELLOS</label>
                    <input id="sellos" type="text" name="sellos" placeholder="Ingresa sellos" value={formData.sellos} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="rampa">RAMPA</label>
                    <input id="rampa" type="text" name="rampa" placeholder="Ej. 7" value={formData.rampa} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="horaRegistro">HORA REGISTRO</label>
                    <input id="horaRegistro" type="time" name="horaRegistro" value={formData.horaRegistro} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="totalPallets">TOTAL PALLETS</label>
                    <input id="totalPallets" type="number" name="totalPallets" placeholder="Cantidad" value={formData.totalPallets} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="inspection-section">
                  <h3 className="section-title">Longitud de Contenedor</h3>
                  <div className="radio-group-inline">
                    {["20'", "40'", "48'", "53'", "Otro"].map(length => (
                      <label key={length}>
                        <input type="radio" name="longitudContenedor" value={length} checked={formData.longitudContenedor === length} onChange={handleInputChange} />
                        {length}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="inspection-section">
                  <h3 className="section-title">ORIGEN (ARRIBO)</h3>
                  <div className="radio-group-inline">
                    {['Aire', 'Marítimo', 'Nacional', 'Importación'].map(orig => (
                      <label key={orig}>
                        <input type="radio" name="origen" value={orig} checked={formData.origen === orig} onChange={handleInputChange} />
                        {orig}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="inspection-section">
                  <h3 className="section-title">EMPRESAS</h3>
                  <div className="checkbox-group-inline">
                    {['BOSE', 'DYSON', 'NESTLE'].map(company => (
                      <label key={company}>
                        <input
                          type="checkbox"
                          checked={formData.empresas.includes(company)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, empresas: [...prev.empresas, company] }));
                            } else {
                              setFormData(prev => ({ ...prev, empresas: prev.empresas.filter(c => c !== company) }));
                            }
                          }}
                        />
                        {company}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="inspection-section full-width">
                  <h3 className="section-title">Firma del Responsable de Descarga</h3>
                  <div className="signature-container">
                    <p className="signature-label">Firma (escribir con el dedo en la tableta o con el mouse)</p>
                    <div style={{ width: '100%', touchAction: 'none' }}>
                      <canvas
                        ref={signatureCanvasRef}
                        className="signature-canvas"
                        style={{
                          display: 'block',
                          width: '100%',
                          height: '250px',
                          borderRadius: '8px',
                          border: '1.5px solid #dae2ea',
                          background: 'white',
                          cursor: 'crosshair',
                          touchAction: 'none'
                        }}
                      />
                    </div>
                    <div className="signature-buttons">
                      <button type="button" className="btn-clear-signature" onClick={handleClearSignature}>
                        Limpiar Firma
                      </button>
                      <button type="button" className="btn-save-signature" onClick={handleSaveSignature}>
                        Guardar Firma
                      </button>
                    </div>
                    {formData.firmaResponsable && (
                      <div className="signature-saved">
                        <p>Firma registrada correctamente</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* PASO 3 */}
            {currentStep === 3 && (
              <>
                <div className="step-title full-width">
                  <h2>Paso 3 de 3: Documentos</h2>
                  <p>Captura o sube fotos y documentos del contenedor</p>
                </div>

                <div className="scan-section full-width">
                  <div className="scan-buttons-container">
                    <button type="button" className="btn-scan-camera" onClick={() => cameraInputRef.current?.click()}>
                      <FiCamera size={24} />
                      <span className="scan-text">Capturar Foto</span>
                    </button>
                    <button type="button" className="btn-scan-upload" onClick={() => cameraInputRef.current?.click()}>
                      <FiUpload size={24} />
                      <span className="scan-text">Subir Archivo</span>
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
                      <h3 className="section-title">Documentos ({attachments.length})</h3>
                      <div className="documents-list">
                        {attachments.map((file, index) => (
                          <div key={index} className="document-item">
                            <div className="document-info">
                              <span className="document-icon">
                                {file.type.startsWith('image/') ? <MdImage size={20} /> : <FiUpload size={20} />}
                              </span>
                              <div className="document-details">
                                <span className="document-name">{file.name}</span>
                                <span className="document-size">{(file.size / 1024).toFixed(2)} KB</span>
                              </div>
                            </div>
                            <button type="button" className="remove-document" onClick={() => removeAttachment(index)} title="Eliminar">
                              <FiX size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-action btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="button" className="btn-action btn-save" onClick={handleSave} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            {currentStep > 1 && (
              <button type="button" className="btn-action btn-previous" onClick={handlePrevious}>Atrás</button>
            )}
            {currentStep < totalSteps && (
              <button type="button" className="btn-action btn-next" onClick={handleNext} disabled={loading}>Siguiente</button>
            )}
          </div>
        </form>
      </div>

      <ConfirmDialog
        isOpen={dialog.isOpen}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onConfirm={dialog.onConfirm}
        onClose={closeDialog}
      />
    </div>
  );
}
