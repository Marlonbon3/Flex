import React, { useState, useEffect, useRef } from 'react'
import { MdAdd, MdArchive, MdDelete, MdCheckCircle, MdLayersClear } from 'react-icons/md'
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
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const dropdownRef = useRef(null)

  const usuario = api.obtenerUsuarioActual()
  const rol = usuario?.rol?.toLowerCase()
  const puedeEditar = rol !== 'supervisor'

  useEffect(() => {
    cargarContenedores()
  }, [])

  useEffect(() => {
    if (!menuAbierto) return
    const cerrarClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuAbierto(null)
      }
    }
    const cerrarScroll = () => setMenuAbierto(null)
    document.addEventListener('mousedown', cerrarClick)
    window.addEventListener('scroll', cerrarScroll, true)
    return () => {
      document.removeEventListener('mousedown', cerrarClick)
      window.removeEventListener('scroll', cerrarScroll, true)
    }
  }, [menuAbierto])

  const cargarContenedores = async () => {
    try {
      setLoading(true)
      const contenedores = await api.obtenerTodosLosContenedores()

      const contenedoresActivos = contenedores.filter(c => c.Activo)

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
        status: c.Status || 'En proceso',
        statusContenedor: c.StatusContenedor || '',
        loadType: c.LoadType || '',
        yardDestination: c.YardDestination || '',
        archivado: !!c.Archivado,
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

  const handleMenuToggle = (e, paso1ID) => {
    e.stopPropagation()
    if (menuAbierto === paso1ID) {
      setMenuAbierto(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right
    })
    setMenuAbierto(paso1ID)
  }

  const handleArchivar = async (id, e) => {
    e.stopPropagation()
    setMenuAbierto(null)
    const ok = await confirm('¿Estás seguro de que deseas archivar este contenedor?')
    if (!ok) return
    try {
      const resultado = await api.archivarContenedor(id)
      if (resultado.success) {
        toast('Contenedor archivado exitosamente', 'success')
        cargarContenedores()
      } else {
        toast('Error: ' + resultado.error, 'error')
      }
    } catch (error) {
      toast('Error archivando: ' + error.message, 'error')
    }
  }

  const handleEliminar = async (id, e) => {
    e.stopPropagation()
    setMenuAbierto(null)
    const ok = await confirm('¿Estás seguro? Esto eliminará el contenedor de forma permanente')
    if (!ok) return
    try {
      const resultado = await api.eliminarContenedor(id)
      if (resultado.success) {
        toast('Contenedor eliminado exitosamente', 'success')
        cargarContenedores()
      } else {
        toast('Error: ' + resultado.error, 'error')
      }
    } catch (error) {
      toast('Error eliminando: ' + error.message, 'error')
    }
  }

  const handleVaciar = async (id, e) => {
    e.stopPropagation()
    setMenuAbierto(null)
    const ok = await confirm('¿Vaciar los campos opcionales? Se conservarán Trailer No., Trailer Type, Actual Date y P.O.#')
    if (!ok) return
    try {
      const resultado = await api.vaciarContenedor(id)
      if (resultado.success) {
        toast('Campos vaciados correctamente', 'success')
        cargarContenedores()
      } else {
        toast('Error: ' + resultado.error, 'error')
      }
    } catch (error) {
      toast('Error vaciando: ' + error.message, 'error')
    }
  }

  const getStatusClass = (status) => {
    return status.toLowerCase()
  }

  return (
    <div className="contenedores-container">
      <div className="header-actions">
        {puedeEditar && (
          <button className="btn-primary" onClick={handleAgregar}>
            <MdAdd className="btn-icon" />
            Agregar nuevo contenedor
          </button>
        )}
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
              <th>YARD / DESTINATION</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  Cargando contenedores...
                </td>
              </tr>
            ) : trailers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  No hay contenedores registrados
                </td>
              </tr>
            ) : (
              trailers.map((trailer) => (
                <tr
                  key={trailer.paso1ID}
                  onClick={() => puedeEditar && handleClickFila(trailer)}
                  style={{ cursor: puedeEditar ? 'pointer' : 'default' }}
                >
                  <td className="trailer-no">{trailer.trailerNo}</td>
                  <td>{trailer.tipo}</td>
                  <td>{trailer.contenedor}</td>
                  <td>{trailer.puertoEntrada}</td>
                  <td>{trailer.llegada}</td>
                  <td>
                    {trailer.statusContenedor
                      ? <span className="status-badge status-custom">{trailer.statusContenedor}</span>
                      : trailer.loadType?.toUpperCase() === 'EMPTY'
                        ? <span className="status-badge empty-type">EMPTY</span>
                        : trailer.status === 'Completado'
                          ? <span className="status-badge completado">Completado</span>
                          : <span className="status-badge en-proceso">En proceso</span>
                    }
                  </td>
                  <td>
                    {trailer.yardDestination || '—'}
                    {trailer.archivado && (
                      <div className="archivado-indicator">
                        <MdCheckCircle size={12} />
                        Archivado
                      </div>
                    )}
                  </td>
                  <td className="actions-cell">
                    {puedeEditar && (
                      <div className="menu-container">
                        <button
                          className="action-btn"
                          onClick={(e) => handleMenuToggle(e, trailer.paso1ID)}
                          title="Opciones"
                        >
                          <HiEllipsisVertical />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {menuAbierto && (() => {
        const trailerActivo = trailers.find(t => t.paso1ID === menuAbierto)
        return (
          <div
            ref={dropdownRef}
            className="dropdown-menu"
            style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999 }}
          >
            <button
              className="menu-option archivar"
              onClick={(e) => handleArchivar(menuAbierto, e)}
            >
              <MdArchive size={15} /> Archivar
            </button>
            {trailerActivo?.archivado && (
              <button
                className="menu-option vaciar"
                onClick={(e) => handleVaciar(menuAbierto, e)}
              >
                <MdLayersClear size={15} /> Vaciar
              </button>
            )}
            <button
              className="menu-option eliminar"
              onClick={(e) => handleEliminar(menuAbierto, e)}
            >
              <MdDelete size={15} /> Eliminar
            </button>
          </div>
        )
      })()}

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
