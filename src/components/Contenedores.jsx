import React, { useState, useEffect } from 'react'
import { MdAdd, MdDownload, MdArchive, MdDelete } from 'react-icons/md'
import { HiEllipsisVertical } from 'react-icons/hi2'
import '../styles/contenedores.css'
import AgregarContenedor from './AgregarContenedor'
import * as api from '../services/api'
import { useAlert } from './AlertProvider'

export default function Contenedores() {
  const { toast, confirm } = useAlert()
  const [showFormModal, setShowFormModal] = useState(false)
  const [trailers, setTrailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [contenedorSeleccionado, setContenedorSeleccionado] = useState(null)
  const [menuAbierto, setMenuAbierto] = useState(null)

  useEffect(() => {
    cargarContenedores()
  }, [])

  const cargarContenedores = async () => {
    try {
      setLoading(true)
      const contenedores = await api.obtenerTodosLosContenedores()

      const contenedoresActivos = contenedores.filter(c => c.Activo && (!c.Status || c.Status === 'En proceso'))

      const vistosSet = new Set()
      const contenedoresDedupados = contenedoresActivos.filter(c => {
        if (vistosSet.has(c.Paso1ID)) return false
        vistosSet.add(c.Paso1ID)
        return true
      })

      const trailersMapeados = contenedoresDedupados.map((c) => ({
        paso1ID: c.Paso1ID,
        trailerNo: c.TrailerNo || 'N/A',
        tipo: c.TrailerType || 'N/A',
        contenedor: c.SeaContainerType || 'N/A',
        puertoEntrada: c.PortOfEntry || 'N/A',
        llegada: c.FechaCreacion ? new Date(c.FechaCreacion).toLocaleString('es-ES') : 'N/A',
        status: c.Status || (c.Paso2Completado ? 'PASO2' : 'En proceso'),
        paso2ID: c.Paso2ID,
        paso3ID: c.Paso3ID
      }))

      setTrailers(trailersMapeados)
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

  const handleArchivar = async (id, e) => {
    e.stopPropagation()
    const ok = await confirm('¿Estás seguro de que deseas archivar este contenedor?')
    if (!ok) return
    try {
      const resultado = await api.archivarContenedor(id)
      if (resultado.success) {
        toast('Contenedor archivado exitosamente', 'success')
        cargarContenedores()
        setMenuAbierto(null)
      } else {
        toast('Error: ' + resultado.error, 'error')
      }
    } catch (error) {
      toast('Error archivando: ' + error.message, 'error')
    }
  }

  const handleEliminar = async (id, e) => {
    e.stopPropagation()
    const ok = await confirm('¿Estás seguro? Esto eliminará el contenedor de forma permanente')
    if (!ok) return
    try {
      const resultado = await api.eliminarContenedor(id)
      if (resultado.success) {
        toast('Contenedor eliminado exitosamente', 'success')
        cargarContenedores()
        setMenuAbierto(null)
      } else {
        toast('Error: ' + resultado.error, 'error')
      }
    } catch (error) {
      toast('Error eliminando: ' + error.message, 'error')
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
                  Cargando contenedores...
                </td>
              </tr>
            ) : trailers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  No hay contenedores registrados
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
                  <td className="actions-cell">
                    <div className="menu-container">
                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuAbierto(menuAbierto === trailer.paso1ID ? null : trailer.paso1ID)
                        }}
                        title="Opciones"
                      >
                        <HiEllipsisVertical />
                      </button>
                      {menuAbierto === trailer.paso1ID && (
                        <div className="dropdown-menu">
                          <button
                            className="menu-option archivar"
                            onClick={(e) => handleArchivar(trailer.paso1ID, e)}
                          >
                            <MdArchive size={15} /> Archivar
                          </button>
                          <button
                            className="menu-option eliminar"
                            onClick={(e) => handleEliminar(trailer.paso1ID, e)}
                          >
                            <MdDelete size={15} /> Eliminar
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
