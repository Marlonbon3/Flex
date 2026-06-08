import React, { useState, useEffect } from 'react'
import { MdDownload, MdDelete, MdFilePresent, MdEdit } from 'react-icons/md'
import { BsFilePdf, BsSearch } from 'react-icons/bs'
import { FiRefreshCw } from 'react-icons/fi'
import '../styles/archivo.css'
import * as api from '../services/api'
import { generarPDFContenedor } from '../utils/pdfGenerator'
import { exportarExcel } from '../utils/excelExporter'
import AgregarContenedor from './AgregarContenedor'
import { useAlert } from './AlertProvider'

export default function Archivo() {
  const { toast, confirm } = useAlert()
  const [contenedores, setContenedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('Todos los tipos')
  const [contenedorEditar, setContenedorEditar] = useState(null)

  useEffect(() => {
    cargarContenedores()
  }, [])

  const cargarContenedores = async () => {
    try {
      setLoading(true)
      const todosLosContenedores = await api.obtenerTodosLosContenedores()
      const contenedoresArchivados = todosLosContenedores.filter(c =>
        !c.Activo && c.Status === 'Completado'
      )

      const vistosSet = new Set()
      const contenedoresDedupados = contenedoresArchivados.filter(c => {
        if (vistosSet.has(c.Paso1ID)) return false
        vistosSet.add(c.Paso1ID)
        return true
      })

      setContenedores(contenedoresDedupados)
    } catch (error) {
      console.error('Error cargando contenedores archivados:', error)
      setContenedores([])
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarContenedor = async (paso1ID) => {
    const ok = await confirm('¿Estás seguro de que deseas eliminar este contenedor?')
    if (!ok) return
    try {
      const response = await fetch(`http://localhost:5000/api/contenedores/${paso1ID}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        toast('Contenedor eliminado exitosamente', 'success')
        cargarContenedores()
      } else {
        toast('Error al eliminar: ' + (data.error || 'Error desconocido'), 'error')
      }
    } catch (error) {
      console.error('Error eliminando contenedor:', error)
      toast('Error al eliminar contenedor', 'error')
    }
  }

  const handleVerPDF = async (paso1ID) => {
    try {
      const response = await fetch(`http://localhost:5000/api/contenedores/${paso1ID}`)
      const result = await response.json()

      if (!result.success || !result.datos) {
        toast('Error al cargar datos del contenedor', 'error')
        return
      }

      const datos = result.datos

      const archivos = await fetch(`http://localhost:5000/api/archivos/${paso1ID}`)
        .then(r => r.json())
        .then(d => d.archivos || [])
        .catch(() => [])

      generarPDFContenedor(
        {
          TrailerNo: datos.TrailerNo,
          TrailerType: datos.TrailerType,
          SeaContainerType: datos.SeaContainerType,
          UsoEmbarques: datos.UsoEmbarques,
          PortOfEntry: datos.PortOfEntry,
          BookingNo: datos.BookingNo,
          PoNo: datos.PoNo,
          QtyPallets: datos.QtyPallets,
          EmptyDate: datos.EmptyDate,
          SealSanLuis: datos.SealSanLuis,
          DepartureDate: datos.DepartureDate,
          SealYuma: datos.SealYuma,
          AgingA: datos.AgingA,
          ActualDate: datos.ActualDate,
          ItemType: datos.ItemType,
          Comments: datos.Comments,
          FechaCreacion: datos.FechaCreacion,
          Aging: datos.Aging,
          DateExitPort: datos.DateExitPort
        },
        {
          CajaTrailer: datos.CajaTrailer,
          Placas: datos.Placas,
          Estado: datos.Estado,
          FechaLlegada: datos.FechaLlegada,
          Turno: datos.Turno,
          Sellos: datos.Sellos,
          Rampa: datos.Rampa,
          TotalPallets: datos.TotalPallets,
          LongitudContenedor: datos.LongitudContenedor,
          Origen: datos.Origen,
          Empresas: datos.Empresas ? datos.Empresas.split(',') : [],
          Cond1: datos.Cond1,
          Cond2: datos.Cond2,
          Cond3: datos.Cond3,
          Cond4: datos.Cond4,
          Cond5: datos.Cond5,
          Cond6: datos.Cond6,
          Cond7: datos.Cond7,
          Cond8: datos.Cond8,
          FirmaResponsable: datos.FirmaResponsable
        },
        null,
        archivos
      )
    } catch (error) {
      console.error('Error generando PDF:', error)
      toast('Error al generar PDF: ' + error.message, 'error')
    }
  }

  const agruparPorFecha = (lista) => {
    const grupos = {}
    lista.forEach(c => {
      const fecha = new Date(c.FechaCreacion).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      if (!grupos[fecha]) grupos[fecha] = []
      grupos[fecha].push(c)
    })
    return grupos
  }

  const filtrar = (lista) => {
    return lista.filter(c => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const match =
          c.TrailerNo?.toLowerCase().includes(term) ||
          c.SeaContainerType?.toLowerCase().includes(term) ||
          c.PortOfEntry?.toLowerCase().includes(term)
        if (!match) return false
      }
      if (startDate && new Date(c.FechaCreacion) < new Date(startDate)) return false
      if (endDate) {
        const fin = new Date(endDate)
        fin.setHours(23, 59, 59, 999)
        if (new Date(c.FechaCreacion) > fin) return false
      }
      if (tipoFiltro !== 'Todos los tipos') {
        if (tipoFiltro === 'Llegada' && !c.UsoEmbarques?.toLowerCase().includes('llegada')) return false
        if (tipoFiltro === 'Inspección' && !c.UsoEmbarques?.toLowerCase().includes('inspecci')) return false
      }
      return true
    })
  }

  const gruposContenedores = agruparPorFecha(filtrar(contenedores))
  const todosLosContenedores = Object.values(gruposContenedores).flat()

  return (
    <>
      <section className="archivo-section">
        <div className="archivo-header">
          <h2>Archivo de Documentos</h2>
          <p>Consulta, visualiza y descarga los documentos generados en el flujo operativo.</p>
        </div>

        <div className="archivo-filters">
          <div className="filter-group">
            <input
              type="date"
              className="date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>-</span>
            <input
              type="date"
              className="date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button className="filter-btn" onClick={() => { setStartDate(''); setEndDate('') }} title="Limpiar fechas">
              <FiRefreshCw size={16} />
            </button>
          </div>
          <select
            className="filter-select"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
          >
            <option>Todos los tipos</option>
            <option>Inspección</option>
            <option>Llegada</option>
            <option>Otros</option>
          </select>
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar documento, trailer, contenedor..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">
              <BsSearch size={16} />
            </button>
          </div>
          <button className="export-btn" onClick={() => exportarExcel(todosLosContenedores, 'Archivo.xlsx')}>
            <MdFilePresent size={16} /> Exportar a Excel
          </button>
        </div>

        <div className="archivo-table">
          <table>
            <thead>
              <tr>
                <th>FECHA</th>
                <th>TIPO DE DOCUMENTO</th>
                <th>TRAILER NO.</th>
                <th>CONTENEDOR</th>
                <th>PUERTO DE ENTRADA</th>
                <th>GENERADO POR</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    Cargando contenedores...
                  </td>
                </tr>
              ) : todosLosContenedores.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    No hay contenedores registrados
                  </td>
                </tr>
              ) : (
                Object.entries(gruposContenedores).map(([fecha, items]) => (
                  <React.Fragment key={fecha}>
                    <tr>
                      <td colSpan="7" className="date-group">
                        {fecha} ({items.length})
                      </td>
                    </tr>
                    {items.map((c) => (
                      <tr key={c.Paso1ID}>
                        <td>
                          {new Date(c.FechaCreacion).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td>Nueva llegada de contenedor</td>
                        <td>{c.TrailerNo || 'N/A'}</td>
                        <td>{c.SeaContainerType || 'N/A'}</td>
                        <td>{c.PortOfEntry || 'N/A'}</td>
                        <td>Usuario #{c.UsuarioCreadorID || 'N/A'}</td>
                        <td className="actions">
                          <button
                            className="action-btn pdf-btn"
                            title="Ver PDF"
                            onClick={() => handleVerPDF(c.Paso1ID)}
                          >
                            <BsFilePdf size={18} />
                          </button>
                          <button
                            className="action-btn edit-btn"
                            title="Editar"
                            onClick={() => setContenedorEditar({ paso1ID: c.Paso1ID, trailerNo: c.TrailerNo })}
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            title="Eliminar"
                            onClick={() => handleEliminarContenedor(c.Paso1ID)}
                          >
                            <MdDelete size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="archivo-footer">
          <p>Mostrando 1 a {todosLosContenedores.length} de {todosLosContenedores.length} documentos</p>
          <div className="pagination">
            <button className="pag-btn">←</button>
            <button className="pag-btn active">1</button>
            <button className="pag-btn">→</button>
            <select className="items-per-page">
              <option>10 por página</option>
              <option>20 por página</option>
              <option>50 por página</option>
            </select>
          </div>
        </div>
      </section>

      {contenedorEditar && (
        <AgregarContenedor
          onClose={() => { setContenedorEditar(null); cargarContenedores() }}
          initialPaso1ID={contenedorEditar.paso1ID}
          contenedorData={contenedorEditar}
        />
      )}
    </>
  )
}
