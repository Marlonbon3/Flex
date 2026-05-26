import React, { useState, useEffect } from 'react'
import { MdAdd, MdDownload } from 'react-icons/md'
import { HiEllipsisVertical } from 'react-icons/hi2'
import '../styles/contenedores.css'
import AgregarContenedor from './AgregarContenedor'
import * as api from '../services/api'

export default function Contenedores() {
  const [showFormModal, setShowFormModal] = useState(false)
  const [trailers, setTrailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [contenedorSeleccionado, setContenedorSeleccionado] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(null)

  // Cargar contenedores de la BD
  useEffect(() => {
    cargarContenedores()
  }, [])

  const cargarContenedores = async () => {
    try {
      setLoading(true)
      const contenedores = await api.obtenerTodosLosContenedores()
      
      console.log('✓ Contenedores cargados de la API:', contenedores.length)
      
      // Filtrar solo activos (Activo = 1)
      const contenedoresActivos = contenedores.filter(c => c.Activo === 1)
      
      // Transformar datos de BD al formato de tabla
      const trailersMapeados = contenedoresActivos.map((c, idx) => ({
        paso1ID: c.Paso1ID,
        trailerNo: c.TrailerNo || 'N/A',
        tipo: c.TrailerType || 'N/A',
        contenedor: c.SeaContainerType || 'N/A',
        puertoEntrada: c.PortOfEntry || 'N/A',
        llegada: c.FechaCreacion ? new Date(c.FechaCreacion).toLocaleString('es-ES') : 'N/A',
        status: c.Estado || (c.Paso2Completado ? 'PASO2' : 'PASO1'),
        paso2ID: c.Paso2ID,
        paso3ID: c.Paso3ID
      }))

      setTrailers(trailersMapeados)
      console.log('✓ Trailers activos:', trailersMapeados.length)
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
    // Recargar contenedores después de cerrar el modal
    cargarContenedores()
  }

  const handleClickFila = (trailer) => {
    setContenedorSeleccionado(trailer)
    setShowFormModal(true)
    setMenuAbierto(null)
  }

  const handleArchivar = async (id, e) => {
    e.stopPropagation()
    if (window.confirm('¿Estás seguro de que deseas archivar este contenedor?')) {
      try {
        const resultado = await api.archivarContenedor(id)
        if (resultado.success) {
          alert('✅ Contenedor archivado exitosamente')
          cargarContenedores()
          setMenuAbierto(null)
        } else {
          alert('❌ Error: ' + resultado.error)
        }
      } catch (error) {
        alert('❌ Error archivando: ' + error.message)
      }
    }
  }

  const handleEliminar = async (id, e) => {
    e.stopPropagation()
    if (window.confirm('⚠️ ¿Estás seguro? Esto eliminará el contenedor DE LA BD de forma permanente')) {
      try {
        const resultado = await api.eliminarContenedor(id)
        if (resultado.success) {
          alert('✅ Contenedor eliminado exitosamente')
          cargarContenedores()
          setMenuAbierto(null)
        } else {
          alert('❌ Error: ' + resultado.error)
        }
      } catch (error) {
        alert('❌ Error eliminando: ' + error.message)
      }
    }
  }

  const handleExportar = () => {
    console.log('Exportar a Excel')
  }

  const getStatusClass = (status) => {
    return status.toLowerCase()
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
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  Cargando contenedores... ⏳
                </td>
              </tr>
            ) : trailers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  No hay contenedores registrados 📭
                </td>
              </tr>
            ) : (
              trailers.map((trailer) => (
                <tr key={trailer.id} onClick={() => handleClickFila(trailer)} style={{ cursor: 'pointer' }}>
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
                  <td className="actions-cell">
                    <div className="menu-container">
                      <button 
                        className="action-btn" 
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuAbierto(menuAbierto === trailer.id ? null : trailer.id)
                        }}
                        title="Opciones"
                      >
                        <HiEllipsisVertical />
                      </button>
                      {menuAbierto === trailer.id && (
                        <div className="dropdown-menu">
                          <button 
                            className="menu-option archivar"
                            onClick={(e) => handleArchivar(trailer.id, e)}
                          >
                            📦 Archivar
                          </button>
                          <button 
                            className="menu-option eliminar"
                            onClick={(e) => handleEliminar(trailer.id, e)}
                          >
                            🗑️ Eliminar
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
        <p>Mostrando {trailers.length} trailers activos en el flujo operativo.</p>
      </div>

      {showFormModal && (
        <AgregarContenedor 
          onClose={handleCerrarModal} 
          initialPaso1ID={contenedorSeleccionado?.paso1ID}
          contenedorData={contenedorSeleccionado}
        />
      )}
    </div>
  )
}
