import React, { useState, useEffect } from 'react'
import { MdAdd, MdDownload, MdArchive, MdDelete } from 'react-icons/md'
import { HiEllipsisVertical } from 'react-icons/hi2'
import '../styles/contenedores.css'
import AgregarContenedor from './AgregarContenedor'
import ConfirmDialog from './ConfirmDialog'
import * as api from '../services/api'
import { exportarExcel } from '../utils/excelExporter'

export default function Contenedores() {
  const [showFormModal, setShowFormModal] = useState(false)
  const [trailers, setTrailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [contenedorSeleccionado, setContenedorSeleccionado] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(null)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const [dialog, setDialog] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null })

  const showAlert = (title, message, type = 'info') =>
    setDialog({ isOpen: true, type, title, message, onConfirm: null })

  const showConfirm = (title, message, onConfirm) =>
    setDialog({ isOpen: true, type: 'confirm', title, message, onConfirm })

  const closeDialog = () => setDialog(d => ({ ...d, isOpen: false }))

  useEffect(() => {
    cargarContenedores()
    // Close dropdown when clicking outside
    const handleOutsideClick = () => setMenuAbierto(null)
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  const cargarContenedores = async () => {
    try {
      setLoading(true)
      const contenedores = await api.obtenerTodosLosContenedores()
      const contenedoresActivos = contenedores.filter(c => c.Activo && (!c.Status || c.Status === 'En proceso'))

      const vistosSet = new Set()
      const deduped = contenedoresActivos.filter(c => {
        if (vistosSet.has(c.Paso1ID)) return false
        vistosSet.add(c.Paso1ID)
        return true
      })

      setTrailers(deduped.map(c => ({
        paso1ID: c.Paso1ID,
        trailerNo: c.TrailerNo || 'N/A',
        tipo: c.TrailerType || 'N/A',
        contenedor: c.SeaContainerType || 'N/A',
        puertoEntrada: c.PortOfEntry || 'N/A',
        llegada: c.FechaCreacion ? new Date(c.FechaCreacion).toLocaleString('es-MX') : 'N/A',
        status: c.Status || 'En proceso',
        _raw: c
      })))
    } catch (error) {
      console.error('Error cargando contenedores:', error)
      setTrailers([])
    } finally {
      setLoading(false)
    }
  }

  const handleAgregar = () => {
    setContenedorSeleccionado(null)
    setShowFormModal(true)
  }

  const handleCerrarModal = () => {
    setShowFormModal(false)
    setContenedorSeleccionado(null)
    cargarContenedores()
  }

  const handleClickFila = (trailer) => {
    setContenedorSeleccionado(trailer)
    setShowFormModal(true)
    setMenuAbierto(null)
  }

  const handleArchivar = (id, e) => {
    e.stopPropagation()
    setMenuAbierto(null)
    showConfirm(
      'Archivar contenedor',
      'Esta acción moverá el contenedor al archivo. Podrá consultarlo desde la sección de Archivo.',
      async () => {
        closeDialog()
        try {
          const resultado = await api.archivarContenedor(id)
          if (resultado.success) {
            showAlert('Archivado', 'El contenedor ha sido archivado exitosamente.', 'success')
            cargarContenedores()
          } else {
            showAlert('Error', resultado.error || 'No se pudo archivar el contenedor.', 'error')
          }
        } catch (error) {
          showAlert('Error', error.message, 'error')
        }
      }
    )
  }

  const handleEliminar = (id, e) => {
    e.stopPropagation()
    setMenuAbierto(null)
    showConfirm(
      'Eliminar contenedor',
      'Esta acción eliminará el contenedor de forma permanente. Esta operación no se puede deshacer.',
      async () => {
        closeDialog()
        try {
          const resultado = await api.eliminarContenedor(id)
          if (resultado.success) {
            showAlert('Eliminado', 'El contenedor ha sido eliminado exitosamente.', 'success')
            cargarContenedores()
          } else {
            showAlert('Error', resultado.error || 'No se pudo eliminar el contenedor.', 'error')
          }
        } catch (error) {
          showAlert('Error', error.message, 'error')
        }
      }
    )
  }

  const handleExportar = () => {
    if (trailers.length === 0) {
      showAlert('Sin datos', 'No hay contenedores activos para exportar.', 'info')
      return
    }
    exportarExcel(trailers.map(t => t._raw), 'Contenedores_Activos.xlsx')
    showAlert('Exportado', 'El archivo Excel ha sido generado correctamente.', 'success')
  }

  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase().replace(/\s/g, '-')
    return s
  }

  return (
    <div className="contenedores-container">
      <div className="header-actions">
        <button className="btn-primary" onClick={handleAgregar}>
          <MdAdd className="btn-icon" />
          Agregar nuevo contenedor
        </button>
        <button className="btn-secondary" onClick={handleExportar}>
          <MdDownload className="btn-icon" />
          Exportar a Excel
        </button>
      </div>

      <div className="table-wrapper">
        <table className="trailers-table">
          <thead>
            <tr>
              <th>TRAILER NO.</th>
              <th>TIPO DE TRAILER</th>
              <th>CONTENEDOR</th>
              <th>PUERTO DE ENTRADA</th>
              <th>LLEGADA</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#7b8aa3' }}>
                  Cargando contenedores...
                </td>
              </tr>
            ) : trailers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#7b8aa3' }}>
                  No hay contenedores registrados en el flujo activo.
                </td>
              </tr>
            ) : (
              trailers.map((trailer) => (
                <tr key={trailer.paso1ID} onClick={() => handleClickFila(trailer)} style={{ cursor: 'pointer' }}>
                  <td className="trailer-no">{trailer.trailerNo}</td>
                  <td>{trailer.tipo}</td>
                  <td>{trailer.contenedor}</td>
                  <td>{trailer.puertoEntrada}</td>
                  <td>{trailer.llegada}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(trailer.status)}`}>
                      {trailer.status}
                    </span>
                  </td>
                  <td className="actions-cell" onClick={e => e.stopPropagation()}>
                    <div className="menu-container">
                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (menuAbierto === trailer.paso1ID) {
                            setMenuAbierto(null)
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect()
                            setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
                            setMenuAbierto(trailer.paso1ID)
                          }
                        }}
                        title="Opciones"
                      >
                        <HiEllipsisVertical />
                      </button>
                      {menuAbierto === trailer.paso1ID && (
                        <div className="dropdown-menu" style={{ top: menuPos.top, right: menuPos.right }}>
                          <button
                            className="menu-option archivar"
                            onClick={(e) => handleArchivar(trailer.paso1ID, e)}
                          >
                            <MdArchive size={15} />
                            Archivar
                          </button>
                          <button
                            className="menu-option eliminar"
                            onClick={(e) => handleEliminar(trailer.paso1ID, e)}
                          >
                            <MdDelete size={15} />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p>Mostrando {trailers.length} trailer(s) en el flujo operativo activo.</p>
      </div>

      {showFormModal && (
        <AgregarContenedor
          onClose={handleCerrarModal}
          initialPaso1ID={contenedorSeleccionado?.paso1ID}
          contenedorData={contenedorSeleccionado}
        />
      )}

      <ConfirmDialog
        isOpen={dialog.isOpen}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        onConfirm={dialog.onConfirm}
        onClose={closeDialog}
        confirmText={dialog.type === 'confirm' ? 'Confirmar' : 'Aceptar'}
        cancelText="Cancelar"
      />
    </div>
  )
}
