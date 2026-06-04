import React, { useState, useEffect } from 'react'
import { MdDownload, MdDelete, MdFilePresent, MdEdit } from 'react-icons/md'
import { BsFilePdf, BsSearch } from 'react-icons/bs'
import '../styles/archivo.css'
import * as api from '../services/api'
import { generarPDFContenedor } from '../utils/pdfGenerator'
import { exportarExcel } from '../utils/excelExporter'
import AgregarContenedor from './AgregarContenedor'
import ConfirmDialog from './ConfirmDialog'

export default function Archivo() {
  const [contenedores, setContenedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [contenedorEditando, setContenedorEditando] = useState(null)
  const [dialog, setDialog] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null })

  const showAlert = (title, message, type = 'info') =>
    setDialog({ isOpen: true, type, title, message, onConfirm: null })

  const showConfirm = (title, message, onConfirm) =>
    setDialog({ isOpen: true, type: 'confirm', title, message, onConfirm })

  const closeDialog = () => setDialog(d => ({ ...d, isOpen: false }))

  useEffect(() => {
    cargarContenedores()
  }, [])

  const cargarContenedores = async () => {
    try {
      setLoading(true)
      const todos = await api.obtenerTodosLosContenedores()
      const archivados = todos.filter(c => !c.Activo)

      const vistosSet = new Set()
      const deduped = archivados.filter(c => {
        if (vistosSet.has(c.Paso1ID)) return false
        vistosSet.add(c.Paso1ID)
        return true
      })

      setContenedores(deduped)
    } catch (error) {
      console.error('Error cargando archivados:', error)
      setContenedores([])
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = (paso1ID) => {
    showConfirm(
      'Eliminar registro',
      'Esta acción eliminará el registro del archivo de forma permanente. Esta operación no se puede deshacer.',
      async () => {
        closeDialog()
        try {
          const response = await fetch(`http://localhost:5000/api/contenedores/${paso1ID}`, { method: 'DELETE' })
          const data = await response.json()
          if (data.success) {
            showAlert('Eliminado', 'El registro ha sido eliminado correctamente.', 'success')
            cargarContenedores()
          } else {
            showAlert('Error', data.error || 'No se pudo eliminar el registro.', 'error')
          }
        } catch (error) {
          showAlert('Error', 'Error al eliminar: ' + error.message, 'error')
        }
      }
    )
  }

  const handleVerPDF = async (paso1ID) => {
    try {
      const response = await fetch(`http://localhost:5000/api/contenedores/${paso1ID}`)
      const result = await response.json()

      if (!result.success || !result.datos) {
        showAlert('Error', 'No se pudieron cargar los datos del contenedor.', 'error')
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
          HoraRegistro: datos.HoraRegistro,
          TotalPallets: datos.TotalPallets,
          LongitudContenedor: datos.LongitudContenedor,
          Origen: datos.Origen,
          Empresas: datos.Empresas ? datos.Empresas.split(',') : [],
          ResponsableDescarga: datos.ResponsableDescarga,
          FirmaResponsable: datos.FirmaResponsable,
          Cond1: datos.Cond1, Cond2: datos.Cond2, Cond3: datos.Cond3, Cond4: datos.Cond4,
          Cond5: datos.Cond5, Cond6: datos.Cond6, Cond7: datos.Cond7, Cond8: datos.Cond8
        },
        {
          DescargaCompleta: datos.DescargaCompleta,
          FechaDescarga: datos.FechaDescarga,
          HoraDescarga: datos.HoraDescarga
        },
        archivos
      )
    } catch (error) {
      showAlert('Error', 'Error al generar el PDF: ' + error.message, 'error')
    }
  }

  const handleEditar = (contenedor) => {
    setContenedorEditando(contenedor)
  }

  const handleCerrarEdicion = () => {
    setContenedorEditando(null)
    cargarContenedores()
  }

  const handleExportar = () => {
    if (contenedores.length === 0) {
      showAlert('Sin datos', 'No hay registros en el archivo para exportar.', 'info')
      return
    }
    exportarExcel(contenedores, 'Archivo_Contenedores.xlsx')
    showAlert('Exportado', 'El archivo Excel ha sido generado correctamente.', 'success')
  }

  const filtrar = (lista) => {
    if (!searchTerm) return lista
    const q = searchTerm.toLowerCase()
    return lista.filter(c =>
      c.TrailerNo?.toLowerCase().includes(q) ||
      c.SeaContainerType?.toLowerCase().includes(q) ||
      c.PortOfEntry?.toLowerCase().includes(q)
    )
  }

  const agruparPorFecha = (lista) => {
    const grupos = {}
    lista.forEach(c => {
      const fecha = new Date(c.FechaCreacion).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
      if (!grupos[fecha]) grupos[fecha] = []
      grupos[fecha].push(c)
    })
    return grupos
  }

  const gruposContenedores = agruparPorFecha(filtrar(contenedores))
  const todosLosContenedores = Object.values(gruposContenedores).flat()

  return (
    <section className="archivo-section">
      <div className="archivo-header">
        <h2>Archivo de Documentos</h2>
        <p>Consulta, edita y descarga los documentos generados en el flujo operativo.</p>
      </div>

      <div className="archivo-filters">
        <div className="filter-group">
          <input type="date" defaultValue="2026-05-07" className="date-input" />
          <span style={{ color: '#7b8aa3' }}>—</span>
          <input type="date" defaultValue="2026-12-31" className="date-input" />
        </div>
        <select className="filter-select">
          <option>Todos los tipos</option>
          <option>Inspección</option>
          <option>Llegada</option>
          <option>Otros</option>
        </select>
        <div className="search-box">
          <BsSearch size={14} style={{ color: '#7b8aa3', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar por trailer, contenedor, puerto..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="export-btn" onClick={handleExportar}>
          <MdFilePresent size={15} />
          Exportar a Excel
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
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#7b8aa3' }}>
                  Cargando registros...
                </td>
              </tr>
            ) : todosLosContenedores.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#7b8aa3' }}>
                  No hay registros en el archivo.
                </td>
              </tr>
            ) : (
              Object.entries(gruposContenedores).map(([fecha, items]) => (
                <React.Fragment key={fecha}>
                  <tr>
                    <td colSpan="7" className="date-group">
                      {fecha} &nbsp;·&nbsp; {items.length} registro(s)
                    </td>
                  </tr>
                  {items.map((c) => (
                    <tr
                      key={c.Paso1ID}
                      className="archivo-row"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleEditar(c)}
                    >
                      <td>
                        {new Date(c.FechaCreacion).toLocaleTimeString('es-MX', {
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td>Llegada de contenedor</td>
                      <td style={{ fontWeight: 600, color: '#0A46FF' }}>{c.TrailerNo || 'N/A'}</td>
                      <td>{c.SeaContainerType || 'N/A'}</td>
                      <td>{c.PortOfEntry || 'N/A'}</td>
                      <td>Usuario #{c.UsuarioCreadorID || 'N/A'}</td>
                      <td className="actions" onClick={e => e.stopPropagation()}>
                        <button
                          className="action-btn-arch edit-btn"
                          title="Editar registro"
                          onClick={() => handleEditar(c)}
                        >
                          <MdEdit size={17} />
                        </button>
                        <button
                          className="action-btn-arch pdf-btn"
                          title="Descargar PDF"
                          onClick={() => handleVerPDF(c.Paso1ID)}
                        >
                          <BsFilePdf size={17} />
                        </button>
                        <button
                          className="action-btn-arch delete-btn"
                          title="Eliminar registro"
                          onClick={() => handleEliminar(c.Paso1ID)}
                        >
                          <MdDelete size={17} />
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
        <p>Mostrando {todosLosContenedores.length} de {contenedores.length} documento(s)</p>
        <div className="pagination">
          <button className="pag-btn">&#8592;</button>
          <button className="pag-btn active">1</button>
          <button className="pag-btn">&#8594;</button>
          <select className="items-per-page">
            <option>10 por página</option>
            <option>20 por página</option>
            <option>50 por página</option>
          </select>
        </div>
      </div>

      {contenedorEditando && (
        <AgregarContenedor
          onClose={handleCerrarEdicion}
          initialPaso1ID={contenedorEditando.Paso1ID}
          contenedorData={contenedorEditando}
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
    </section>
  )
}
