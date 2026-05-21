import React, { useState } from 'react';
import '../styles/agregarContenedor.css';
import { MdArrowBack } from 'react-icons/md';

export default function AgregarContenedor({ onClose }) {
  const [formData, setFormData] = useState({
    trailerNo: '',
    trailerType: '',
    seaContainerType: '',
    usoEmbarques: '',
    portOfEntry: '',
    comments: '',
    arrivalTime: '',
    loadType: '',
    status: '',
    yardDestination: '',
    responsible: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar el contenedor
    console.log('Form submitted:', formData, attachments);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <button className="back-btn" onClick={onClose}>
            <MdArrowBack />
          </button>
          <div className="header-content">
            <h1>Nueva llegada de contenedor</h1>
            <p>Registra la información de la llegada del contenedor al almacén.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-grid">
            {/* Fila 1 */}
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

            {/* Fila 2 */}
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

            {/* Fila 3 */}
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

            {/* Fila 4 */}
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

            {/* Fila 5 */}
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

            {/* Fila 6 */}
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

            {/* Fila 7 */}
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

            {/* Fila 8 */}
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
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
