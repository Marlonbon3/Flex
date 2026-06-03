import React, { useState, useRef } from 'react';
import '../styles/agregarContenedor.css';
import { MdArrowBack, MdDelete, MdImage } from 'react-icons/md';
import { FiCamera, FiUpload, FiX } from 'react-icons/fi';
import * as api from '../services/api';

export default function AgregarContenedor({ onClose, initialPaso1ID, contenedorData }) {
  // Iniciar en Paso 1 por defecto, será ajustado en el useEffect
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [paso1ID, setPaso1ID] = useState(initialPaso1ID || null);

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
  const [paso1IDState, setPaso1IDState] = useState(initialPaso1ID || null);
  const [loading, setLoading] = useState(false);
  const signatureCanvasRef = useRef(null);
  const cameraInputRef = useRef(null);

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
      alert('Firma guardada correctamente');
    }
  };

  React.useEffect(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    // Función para inicializar el canvas con dimensiones correctas
    const initializeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      
      // Si rect.width es 0, usar un ancho por defecto
      let width = rect.width > 0 ? rect.width : 400;
      let height = 300;
      
      // En mobile (ancho < 480px), ajustar altura
      if (window.innerWidth < 480) {
        height = 150;
      } else if (window.innerWidth < 768) {
        height = 200;
      }
      
      // Establecer dimensiones reales del canvas (resolución interna)
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar fondo blanco
      const context = canvas.getContext('2d');
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = 2;
      context.strokeStyle = '#0A1B5B';
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    // Esperar un poco para asegurar que el DOM esté listo
    setTimeout(initializeCanvas, 100);

    let isDrawing = false;

    const startDrawing = (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
      
      // Escalar coordenadas a la resolución interna del canvas
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const context = canvas.getContext('2d');
      context.beginPath();
      context.moveTo(x * scaleX, y * scaleY);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
      
      // Escalar coordenadas a la resolución interna del canvas
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const context = canvas.getContext('2d');
      context.lineTo(x * scaleX, y * scaleY);
      context.stroke();
    };

    const stopDrawing = () => {
      isDrawing = false;
      const context = canvas.getContext('2d');
      context.closePath();
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    // Re-inicializar cuando cambie el tamaño de la ventana
    const handleResize = () => {
      initializeCanvas();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Pre-cargar datos si hay un contenedor existente
  React.useEffect(() => {
    const cargarDatos = async () => {
      if (!initialPaso1ID) return;

      try {
        setLoading(true);
        const datosCompletos = await api.cargarPaso1(initialPaso1ID);
        
        if (datosCompletos) {
          setPaso1IDState(initialPaso1ID);
          
          // Cargar datos del Paso 1
          setFormData(prev => ({
            ...prev,
            // Paso 1
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
            
            // Paso 2 si existe
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
            firmaResponsable: datosCompletos.FirmaResponsable || '',
            condiciones: {
              cond1: datosCompletos.Cond1 === 1 || datosCompletos.Cond1 === true,
              cond2: datosCompletos.Cond2 === 1 || datosCompletos.Cond2 === true,
              cond3: datosCompletos.Cond3 === 1 || datosCompletos.Cond3 === true,
              cond4: datosCompletos.Cond4 === 1 || datosCompletos.Cond4 === true,
              cond5: datosCompletos.Cond5 === 1 || datosCompletos.Cond5 === true,
              cond6: datosCompletos.Cond6 === 1 || datosCompletos.Cond6 === true,
              cond7: datosCompletos.Cond7 === 1 || datosCompletos.Cond7 === true,
              cond8: datosCompletos.Cond8 === 1 || datosCompletos.Cond8 === true
            }
          }));
          
          // Si Paso 2 existe, ir directo a Paso 2
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
      // En Paso 1 y 2, guardar antes de avanzar
      if (currentStep === 1 || currentStep === 2) {
        const usuarioActual = api.obtenerUsuarioActual();
        const usuarioID = usuarioActual?.id || 1;
        
        try {
          setLoading(true);
          
          if (currentStep === 1) {
            // Guardar Paso 1 antes de avanzar
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
              alert('❌ Error al guardar Paso 1. Verifica los datos e intenta de nuevo.');
              setLoading(false);
              return;
            }
          } else if (currentStep === 2) {
            // Guardar Paso 2 antes de avanzar
            if (!paso1IDState) {
              alert('⚠️ Primero debes guardar el Paso 1');
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

            const inspeccionData = {
              ...formData,
              horaRegistro: horaLimpia,
              empresas: formData.empresas || [],
              paso1ID: paso1IDState
            };
            const response = await api.guardarPaso2(inspeccionData, usuarioID);
            
            if (!response.success) {
              alert('❌ Error al guardar Paso 2. Verifica los datos e intenta de nuevo.');
              setLoading(false);
              return;
            }
            
            await api.actualizarEstado(paso1IDState, 2, true);
          }
        } catch (error) {
          alert('❌ Error: ' + error.message);
          setLoading(false);
          return;
        } finally {
          setLoading(false);
        }
      }
      
      // Avanzar al siguiente paso
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
      // Obtener usuarioID del usuario autenticado
      const usuarioActual = api.obtenerUsuarioActual();
      const usuarioID = usuarioActual?.id || 1;

      if (currentStep === 1) {
        // PASO 1: Guardar o actualizar información básica del contenedor
        let response;
        
        if (paso1IDState) {
          // Es edición - actualizar contenedor existente
          response = await api.actualizarPaso1(paso1IDState, formData, usuarioID);
          if (response.success) {
            alert('[OK] Paso 1 actualizado exitosamente en BD');
          } else {
            alert('[ERROR] Error al actualizar Paso 1: ' + api.procesarError(response));
          }
        } else {
          // Es nuevo - crear nuevo contenedor
          response = await api.guardarPaso1(formData, usuarioID);
          if (response.success && response.paso1ID) {
            setPaso1IDState(response.paso1ID);
            alert('[OK] Paso 1 guardado exitosamente en BD');
          } else {
            alert('[ERROR] Error al guardar Paso 1: ' + api.procesarError(response));
          }
        }
      } else if (currentStep === 2) {
        // PASO 2: Guardar inspección + firma
        if (!paso1IDState) {
          alert('⚠️ Primero debes guardar el Paso 1');
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

        const inspeccionData = {
          ...formData,
          horaRegistro: horaLimpia,
          empresas: formData.empresas || [],
          paso1ID: paso1IDState
        };
        const response = await api.guardarPaso2(inspeccionData, usuarioID);
        if (response.success) {
          alert('[OK] Paso 2 guardado exitosamente en BD');
          await api.actualizarEstado(paso1IDState, 2, true);
        } else {
          alert('[ERROR] Error al guardar Paso 2: ' + (response.error || 'Sin detalles'));
        }
      } else if (currentStep === 3) {
        // PASO 3: Guardar documentos
        const paso1IdFinal = paso1IDState || paso1ID;
        
        console.log('[INFO] [PASO 3] Intentando guardar...');
        console.log('   - paso1ID:', paso1IdFinal);
        console.log('   - attachments.length:', attachments.length);
        
        if (!paso1IdFinal) {
          alert('Error: No se encontró el ID del contenedor. Guarda primero el Paso 1');
          setLoading(false);
          return;
        }

        if (attachments.length === 0) {
          alert('Sube al menos un documento para completar el Paso 3');
          setLoading(false);
          return;
        }

        console.log('[INFO] Enviando Paso 3 al servidor...');
        const response = await api.guardarPaso3(paso1IdFinal, attachments, usuarioID);
        console.log('[RESPONSE] Respuesta Paso 3:', response);
        
        if (response.success) {
          alert('¡Contenedor completado y archivado automáticamente!');
          // Esperar un poco y cerrar el modal para que actualice la lista
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          alert('Error al guardar documentos: ' + (response.error || 'Sin detalles'));
        }
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep === totalSteps) {
      await handleSave();
      // Después de guardar todo, cerrar el modal
      setTimeout(() => {
        onClose();
      }, 500);
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
                  <h2>Paso 3 de 3: Documentos</h2>
                  <p>Captura o sube fotos y documentos del contenedor</p>
                </div>

                <div className="scan-section full-width">
                  <div className="scan-buttons-container">
                    <button
                      type="button"
                      className="btn-scan-camera"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <FiCamera size={24} />
                      <span className="scan-text">Capturar Foto</span>
                    </button>
                    <button
                      type="button"
                      className="btn-scan-upload"
                      onClick={() => cameraInputRef.current?.click()}
                    >
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
                                <span className="document-size">
                                  {(file.size / 1024).toFixed(2)} KB
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="remove-document"
                              onClick={() => removeAttachment(index)}
                              title="Eliminar"
                            >
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
