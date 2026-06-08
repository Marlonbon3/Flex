import React, { useState, useEffect } from 'react'
import '../styles/reportes.css'
import * as api from '../services/api'
import { FiRefreshCw } from 'react-icons/fi'
import { MdLocalShipping, MdCheckCircle, MdPending, MdInventory } from 'react-icons/md'

export default function Reportes() {
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargar = async () => {
    setLoading(true)
    setError(null)
    const d = await api.obtenerReportes()
    if (!d) setError('No se pudo conectar con el servidor')
    else setDatos(d)
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  if (loading) return <div className="rep-loading"><FiRefreshCw className="rep-spin" size={32} /><p>Cargando reportes...</p></div>
  if (error) return <div className="rep-error"><p>{error}</p><button onClick={cargar} className="rep-retry-btn">Reintentar</button></div>
  if (!datos) return null

  const total = datos.totalContenedores || 0
  const completados = datos.porStatus?.find(s => s.Status === 'Completado')?.Total || 0
  const enProceso = total - completados

  const maxTurno = Math.max(...(datos.porTurno?.map(t => t.Total) || [0]), 1)
  const maxOrigen = Math.max(...(datos.porOrigen?.map(o => o.Total) || [0]), 1)
  const maxEmpresa = Math.max(...(datos.porEmpresa?.map(e => e.Total) || [0]), 1)
  const maxMes = Math.max(...(datos.porMes?.map(m => m.Total) || [0]), 1)

  const pctCompletados = total > 0 ? Math.round((completados / total) * 100) : 0

  return (
    <div className="rep-container">
      <div className="rep-page-header">
        <div>
          <h2>Dashboard de Reportes</h2>
          <p>Resumen operativo de contenedores y trailers</p>
        </div>
        <button className="rep-refresh-btn" onClick={cargar} title="Actualizar">
          <FiRefreshCw size={16} /> Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="rep-kpi-row">
        <div className="rep-kpi-card rep-kpi-blue">
          <div className="rep-kpi-icon"><MdLocalShipping size={28} /></div>
          <div className="rep-kpi-body">
            <div className="rep-kpi-value">{total}</div>
            <div className="rep-kpi-label">Total Contenedores</div>
          </div>
        </div>
        <div className="rep-kpi-card rep-kpi-green">
          <div className="rep-kpi-icon"><MdCheckCircle size={28} /></div>
          <div className="rep-kpi-body">
            <div className="rep-kpi-value">{completados}</div>
            <div className="rep-kpi-label">Completados</div>
            <div className="rep-kpi-sub">{pctCompletados}% del total</div>
          </div>
        </div>
        <div className="rep-kpi-card rep-kpi-orange">
          <div className="rep-kpi-icon"><MdPending size={28} /></div>
          <div className="rep-kpi-body">
            <div className="rep-kpi-value">{enProceso}</div>
            <div className="rep-kpi-label">En Proceso</div>
          </div>
        </div>
        <div className="rep-kpi-card rep-kpi-purple">
          <div className="rep-kpi-icon"><MdInventory size={28} /></div>
          <div className="rep-kpi-body">
            <div className="rep-kpi-value">{(datos.palletsTotales || 0).toLocaleString()}</div>
            <div className="rep-kpi-label">Pallets Totales</div>
          </div>
        </div>
      </div>

      {/* Progress bar total */}
      <div className="rep-progress-card">
        <div className="rep-progress-header">
          <span>Progreso de completado</span>
          <span>{pctCompletados}%</span>
        </div>
        <div className="rep-progress-bar-bg">
          <div className="rep-progress-bar-fill" style={{ width: `${pctCompletados}%` }} />
        </div>
      </div>

      {/* Charts row */}
      <div className="rep-charts-row">
        {/* Por Turno */}
        <div className="rep-chart-card">
          <h3>Por Turno</h3>
          {datos.porTurno?.length > 0 ? datos.porTurno.map(t => (
            <div key={t.Turno} className="rep-bar-row">
              <span className="rep-bar-label">{t.Turno}</span>
              <div className="rep-bar-bg">
                <div className="rep-bar-fill rep-bar-blue" style={{ width: `${(t.Total / maxTurno) * 100}%` }} />
              </div>
              <span className="rep-bar-value">{t.Total}</span>
            </div>
          )) : <p className="rep-no-data">Sin datos</p>}
        </div>

        {/* Por Origen */}
        <div className="rep-chart-card">
          <h3>Por Origen</h3>
          {datos.porOrigen?.length > 0 ? datos.porOrigen.map(o => (
            <div key={o.Origen} className="rep-bar-row">
              <span className="rep-bar-label">{o.Origen}</span>
              <div className="rep-bar-bg">
                <div className="rep-bar-fill rep-bar-green" style={{ width: `${(o.Total / maxOrigen) * 100}%` }} />
              </div>
              <span className="rep-bar-value">{o.Total}</span>
            </div>
          )) : <p className="rep-no-data">Sin datos</p>}
        </div>

        {/* Por Empresa */}
        <div className="rep-chart-card">
          <h3>Por Empresa</h3>
          {datos.porEmpresa?.length > 0 ? datos.porEmpresa.map(e => (
            <div key={e.Empresa} className="rep-bar-row">
              <span className="rep-bar-label">{e.Empresa}</span>
              <div className="rep-bar-bg">
                <div className="rep-bar-fill rep-bar-orange" style={{ width: `${(e.Total / maxEmpresa) * 100}%` }} />
              </div>
              <span className="rep-bar-value">{e.Total}</span>
            </div>
          )) : <p className="rep-no-data">Sin datos</p>}
        </div>
      </div>

      {/* Monthly trend */}
      <div className="rep-month-card">
        <h3>Contenedores por Mes <span className="rep-month-sub">(últimos 6 meses)</span></h3>
        {datos.porMes?.length > 0 ? (
          <div className="rep-month-bars">
            {datos.porMes.map(m => (
              <div key={m.Mes} className="rep-month-col">
                <div className="rep-month-bar-wrap">
                  <div className="rep-month-bar" style={{ height: `${Math.max((m.Total / maxMes) * 100, 4)}%` }}>
                    <span className="rep-month-count">{m.Total}</span>
                  </div>
                </div>
                <div className="rep-month-label">{m.Mes}</div>
              </div>
            ))}
          </div>
        ) : <p className="rep-no-data">Sin datos de meses</p>}
      </div>
    </div>
  )
}
