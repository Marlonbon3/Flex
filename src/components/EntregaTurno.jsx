import React, { useState, useEffect } from 'react'
import { MdSave, MdDelete, MdFileDownload } from 'react-icons/md'
import { FiRefreshCw } from 'react-icons/fi'
import '../styles/entregaTurno.css'
import { useAlert } from './AlertProvider'
import { exportarEntregaTurno } from '../utils/excelExporter'
import DatePickerTablet from './DatePickerTablet'
import { obtenerUsuarioActual } from '../services/api'

const API_BASE = 'http://localhost:5000/api'

function detectarTurno() {
  const now = new Date()
  const hora = now.getHours()
  const min = now.getMinutes()
  // 1er turno: 6:45 AM – 6:45 PM
  const despues645am = hora > 6 || (hora === 6 && min >= 45)
  const antes645pm = hora < 18 || (hora === 18 && min < 45)
  return despues645am && antes645pm ? '1er turno' : '2do turno'
}

function hoyISO() {
  return new Date().toISOString().split('T')[0]
}

function parsearEmpresas(raw) {
  if (!raw) return '—'
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.join(', ') : raw
  } catch {
    return raw
  }
}

function calcularPorcentaje(totalPallets, qtyPallets) {
  const p = parseFloat(totalPallets)
  const c = parseFloat(qtyPallets)
  if (!p || !c || c === 0) return '—'
  return ((p / c) * 100).toFixed(1) + '%'
}

export default function EntregaTurno() {
  const { toast, confirm } = useAlert()
  const [fecha, setFecha] = useState(hoyISO())
  const [turno, setTurno] = useState(detectarTurno())

  const usuario = obtenerUsuarioActual()
  const puedeEditar = usuario?.rol?.toLowerCase() !== 'supervisor'
  const [contenedores, setContenedores] = useState([])
  const [loading, setLoading] = useState(false)
  const [entregasGuardadas, setEntregasGuardadas] = useState([])
  const [loadingEntregas, setLoadingEntregas] = useState(false)
  const [fechaFiltroEntregas, setFechaFiltroEntregas] = useState(hoyISO())

  const cargarDatos = async () => {
    if (!fecha) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/entrega-turno?fecha=${fecha}&turno=${encodeURIComponent(turno)}`)
      const data = await res.json()
      if (data.success) {
        setContenedores(data.datos)
      } else {
        toast('Error cargando datos: ' + data.error, 'error')
        setContenedores([])
      }
    } catch {
      toast('Error conectando al servidor', 'error')
      setContenedores([])
    } finally {
      setLoading(false)
    }
  }

  const cargarEntregasGuardadas = async () => {
    setLoadingEntregas(true)
    try {
      const res = await fetch(`${API_BASE}/entregas-guardadas`)
      const data = await res.json()
      if (data.success) setEntregasGuardadas(data.datos)
    } catch {}
    finally { setLoadingEntregas(false) }
  }

  useEffect(() => {
    cargarDatos()
  }, [fecha, turno])

  useEffect(() => {
    cargarEntregasGuardadas()
  }, [])

  const guardarEntrega = async () => {
    if (contenedores.length === 0) {
      toast('No hay contenedores para guardar en este turno', 'warning')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/entregas-guardadas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha,
          turno,
          totalTrailas: contenedores.length,
          datosJSON: contenedores
        })
      })
      const data = await res.json()
      if (data.success) {
        toast(`Entrega guardada. Total tráilas: ${contenedores.length}`, 'success')
        cargarEntregasGuardadas()
      } else {
        toast('Error guardando: ' + data.error, 'error')
      }
    } catch {
      toast('Error conectando al servidor', 'error')
    }
  }

  const handleEliminarEntrega = async (id) => {
    const ok = await confirm('¿Eliminar esta entrega guardada?')
    if (!ok) return
    try {
      const res = await fetch(`${API_BASE}/entregas-guardadas/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast('Entrega eliminada', 'success')
        cargarEntregasGuardadas()
      } else {
        toast('Error eliminando: ' + data.error, 'error')
      }
    } catch {
      toast('Error conectando al servidor', 'error')
    }
  }

  const handleExportarEntrega = async (entrega) => {
    try {
      const res = await fetch(`${API_BASE}/entregas-guardadas/${entrega.EntregaGuardadaID}/datos`)
      const data = await res.json()
      if (data.success) {
        const fechaStr = String(entrega.Fecha).split('T')[0]
        await exportarEntregaTurno(data.datos, entrega, `EntregaTurno_${fechaStr}_${entrega.Turno}.xlsx`)
      } else {
        toast('Error exportando: ' + data.error, 'error')
      }
    } catch {
      toast('Error exportando', 'error')
    }
  }

  return (
    <div className="entrega-turno-container">
      <div className="section-header">
        <div className="header-info">
          <h2>Entrega de turno</h2>
          <p>Contenedores completados y archivados para el turno seleccionado.</p>
        </div>
        <div className="header-actions">
          {puedeEditar && (
            <button className="btn-primary" onClick={guardarEntrega}>
              <MdSave size={18} />
              Guardar entrega
            </button>
          )}
          <button className="btn-secondary" onClick={cargarDatos}>
            <FiRefreshCw size={16} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="filtros-section">
        <div className="filtro-grupo">
          <label htmlFor="fecha">Fecha</label>
          <DatePickerTablet
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div className="filtro-grupo">
          <label htmlFor="turno">Turno</label>
          <select
            id="turno"
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            className="select-filtro"
          >
            <option value="1er turno">1er turno (6:45 AM – 6:45 PM)</option>
            <option value="2do turno">2do turno (6:45 PM – 6:45 AM)</option>
          </select>
        </div>

        <div className="filtro-grupo">
          <label>Total contenedores</label>
          <span className="badge-total" style={{ alignSelf: 'center', padding: '6px 16px', fontSize: '1rem' }}>
            {contenedores.length}
          </span>
        </div>
      </div>

      <div className="tabla-contenedor">
        <div className="tabla-wrapper">
          <table className="tabla-principal">
            <thead>
              <tr className="encabezado-tabla">
                <th colSpan="2" className="col-group-rampas">RAMPAS</th>
                <th colSpan="6" className="col-group-trailes">TRÁILAS DESCARGADAS</th>
                <th className="col-group-comentario">COMENTARIO</th>
              </tr>
              <tr className="subencabezado-tabla">
                <th className="col-rampas">Rampa</th>
                <th className="col-trailer">Tráiler No.</th>
                <th className="col-trailes">Caja Tráiler</th>
                <th className="col-contenido">Contenedor</th>
                <th className="col-pallets">Pallets recibidos</th>
                <th className="col-capacidad">Capacidad (Pallets)</th>
                <th className="col-porcentaje">% Uso</th>
                <th className="col-cliente">Cliente / Empresa</th>
                <th className="col-comentario">Comentario</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>
                    Cargando datos del turno...
                  </td>
                </tr>
              ) : contenedores.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#7b8aa3' }}>
                    No hay contenedores completados para {turno} del {fecha}
                  </td>
                </tr>
              ) : (
                contenedores.map((c) => (
                  <tr key={c.Paso1ID} className="fila-datos">
                    <td className="col-rampas celda-rampa">{c.Rampa || '—'}</td>
                    <td className="col-trailer celda-solo-lectura">{c.TrailerNo || '—'}</td>
                    <td className="col-trailes celda-solo-lectura">{c.CajaTrailer || '—'}</td>
                    <td className="col-contenido celda-solo-lectura">{c.SeaContainerType || '—'}</td>
                    <td className="col-pallets celda-solo-lectura">{c.TotalPallets ?? '—'}</td>
                    <td className="col-capacidad celda-solo-lectura">{c.QtyPallets ?? '—'}</td>
                    <td className="col-porcentaje celda-solo-lectura">
                      {calcularPorcentaje(c.TotalPallets, c.QtyPallets)}
                    </td>
                    <td className="col-cliente celda-solo-lectura">{parsearEmpresas(c.Empresas)}</td>
                    <td className="col-comentario celda-solo-lectura">{c.Comments || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="fila-total">
                <td colSpan="2" className="total-label">Total tráilas descargadas</td>
                <td colSpan="7" className="total-valor">
                  <span className="badge-total">{contenedores.length}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="entregas-guardadas-section">
        <div className="entregas-guardadas-header">
          <h3>Entregas de turno guardadas</h3>
          <div className="entregas-filtro-fecha">
            <label>Fecha</label>
            <DatePickerTablet
              value={fechaFiltroEntregas}
              onChange={(e) => setFechaFiltroEntregas(e.target.value)}
            />
            <button
              className="btn-secondary entregas-refresh-btn"
              onClick={() => setFechaFiltroEntregas(hoyISO())}
              title="Hoy"
            >
              <FiRefreshCw size={14} />
            </button>
          </div>
          <button className="btn-secondary entregas-refresh-btn" onClick={cargarEntregasGuardadas} title="Actualizar lista">
            <FiRefreshCw size={14} />
          </button>
        </div>

        {(() => {
          const entregasFiltradas = entregasGuardadas.filter(e =>
            String(e.Fecha).split('T')[0] === fechaFiltroEntregas
          )
          return (
            <div className="tabla-contenedor">
              <div className="tabla-wrapper">
                <table className="tabla-principal">
                  <thead>
                    <tr className="subencabezado-tabla">
                      <th>Hora guardado</th>
                      <th>Fecha turno</th>
                      <th>Turno</th>
                      <th>Total tráilas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingEntregas ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '16px' }}>Cargando...</td>
                      </tr>
                    ) : entregasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: '#7b8aa3' }}>
                          No hay entregas guardadas para el {fechaFiltroEntregas}
                        </td>
                      </tr>
                    ) : (
                      entregasFiltradas.map((e) => (
                        <tr key={e.EntregaGuardadaID} className="fila-datos">
                          <td className="celda-solo-lectura">
                            {new Date(e.FechaGuardado).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="celda-solo-lectura">{String(e.Fecha).split('T')[0]}</td>
                          <td className="celda-solo-lectura">{e.Turno}</td>
                          <td className="celda-solo-lectura">
                            <span className="badge-total" style={{ padding: '3px 10px', fontSize: '13px' }}>
                              {e.TotalTrailas}
                            </span>
                          </td>
                          <td className="celda-solo-lectura">
                            <div className="entrega-acciones">
                              <button
                                className="btn-accion-entrega btn-exportar"
                                title="Exportar a Excel"
                                onClick={() => handleExportarEntrega(e)}
                              >
                                <MdFileDownload size={16} />
                                <span>Exportar a Excel</span>
                              </button>
                              {puedeEditar && (
                                <button
                                  className="btn-accion-entrega btn-eliminar"
                                  title="Eliminar"
                                  onClick={() => handleEliminarEntrega(e.EntregaGuardadaID)}
                                >
                                  <MdDelete size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
