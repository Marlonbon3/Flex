import React, { useState } from 'react';
import '../styles/agregarContenedor.css';
import { MdArrowBack } from 'react-icons/md';

export default function AgregarContenedor({ onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    // Paso 1: Información Básica
    trailerNo: '',
    trailerType: '',
    seaContainerType: '',
    usoEmbarques: '',
    portOfEntry: '',
    comments: '',

    // Paso 2: Carga y Estado
    arrivalTime: '',
    loadType: '',
    status: '',
    yardDestination: '',
    responsible: '',

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
              <span className="step-label">Carga y Estado</span>
            </span>
            <span className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep === 3 ? 'current' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Información Adicional</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-grid">
            {/* PASO 1: Información Básica */}
            {currentStep === 1 && (
              <>
                <div className="step-title full-width">
                  <h2>Paso 1 de 3: Información Básica</h2>
                  <p>Completa los datos principales del contenedor</p>
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
              </>
            )}

            {/* PASO 2: Carga y Estado */}
            {currentStep === 2 && (
              <>
                <div className="step-title full-width">
                  <h2>Paso 2 de 3: Carga y Estado</h2>
                  <p>Define la información de carga y estado del contenedor</p>
                </div>

                <div className="form-group">
                  <label htmlFor="arrivalTime">ARRIVAL TIME <span className="required">*</span></label>
                  <input
                    id="arrivalTime"
                    type="datetime-local"
                    name="arrivalTime"
                    value={formData.arrivalTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="loadType">LOAD TYPE <span className="required">*</span></label>
                  <select
                    id="loadType"
                    name="loadType"
                    value={formData.loadType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona el tipo de carga</option>
                    <option value="full">Full</option>
                    <option value="partial">Partial</option>
                    <option value="empty">Empty</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">STATUS <span className="required">*</span></label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona estado</option>
                    <option value="loaded">Loaded</option>
                    <option value="empty">Empty</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="yardDestination">YARD / DESTINATION <span className="required">*</span></label>
                  <input
                    id="yardDestination"
                    type="text"
                    name="yardDestination"
                    placeholder="Ingresa el patio o destino"
                    value={formData.yardDestination}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="responsible">RESPONSIBLE <span className="required">*</span></label>
                  <select
                    id="responsible"
                    name="responsible"
                    value={formData.responsible}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecciona responsable</option>
                    <option value="juan">Juan Pérez</option>
                    <option value="ana">Ana Gutiérrez</option>
                    <option value="luis">Luis Ramírez</option>
                    <option value="maria">María Fernanda</option>
                  </select>
                </div>
              </>
            )}

            {/* PASO 3: Información Adicional */}
            {currentStep === 3 && (
              <>
                <div className="step-title full-width">
                  <h2>Paso 3 de 3: Información Adicional</h2>
                  <p>Completa los detalles finales y adjunta documentos</p>
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
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn-save" onClick={handleSave}>
              Guardar
            </button>
            {currentStep > 1 && (
              <button type="button" className="btn-previous" onClick={handlePrevious}>
                Atrás
              </button>
            )}
            {currentStep < totalSteps && (
              <button type="button" className="btn-next" onClick={handleNext}>
                Siguiente
              </button>
            )}
            {currentStep === totalSteps && (
              <button type="submit" className="btn-complete">
                Completar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
