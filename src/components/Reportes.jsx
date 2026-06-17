import React, { useState, useEffect } from 'react'
import '../styles/reportes.css'
import * as api from '../services/api'
import { FiRefreshCw } from 'react-icons/fi'
import {
  MdLocalShipping, MdCheckCircle, MdPending,
  MdInventory, MdTrendingUp
} from 'react-icons/md'

function parseMes(yyyymm) {
  if (!yyyymm) return ''
  const [y, m] = yyyymm.split('-')
  const names = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${names[parseInt(m, 10) - 1]} ${y}`
}

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

  if (loading) return (
    <div className="rep-state-screen">
      <FiRefreshCw className="rep-spin" size={28} />
      <p>Cargando reportes…</p>
    </div>
  )
  if (error) return (
    <div className="rep-state-screen">
      <p className="rep-error-msg">{error}</p>
      <button onClick={cargar} className="btn-primary">Reintentar</button>
    </div>
  )
  if (!datos) return null

  const total       = datos.totalContenedores || 0
  const completados = datos.porStatus?.find(s => s.Status === 'Completado')?.Total || 0
  const enProceso   = total - completados
  const pallets     = datos.palletsTotales || 0
  const pct         = total > 0 ? Math.round((completados / total) * 100) : 0

  const maxTurno   = Math.max(...(datos.porTurno?.map(t => t.Total)   || [0]), 1)
  const maxOrigen  = Math.max(...(datos.porOrigen?.map(o => o.Total)  || [0]), 1)
  const maxEmpresa = Math.max(...(datos.porEmpresa?.map(e => e.Total) || [0]), 1)
  const maxMes     = Math.max(...(datos.porMes?.map(m => m.Total)     || [0]), 1)

  const kpis = [
    { icon: <MdLocalShipping size={22}/>, label: 'Total Contenedores', value: total,       accent: '#0A46FF', bg: '#eef4ff' },
    { icon: <MdCheckCircle   size={22}/>, label: 'Completados',        value: completados,  accent: '#10B981', bg: '#ecfdf5', sub: `${pct}% del total` },
    { icon: <MdPending       size={22}/>, label: 'En Proceso',         value: enProceso,    accent: '#F59E0B', bg: '#fffbeb' },
    { icon: <MdInventory     size={22}/>, label: 'Pallets Totales',    value: pallets.toLocaleString(), accent: '#8B5CF6', bg: '#f5f3ff' },
  ]

  return (
    <div className="rep-container">

      {/* ── Header ── */}
      <div className="section-header">
        <div className="header-info">
          <h2>Dashboard de Reportes</h2>
          <p>Resumen operativo de contenedores y trailers</p>
        </div>
        <div className="header-actions" style={{ width: 'auto' }}>
          <button className="btn-secondary" onClick={cargar}>
            <FiRefreshCw size={15} /> Actualizar
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="rep-kpi-grid">
        {kpis.map((k, i) => (
          <div key={i} className="rep-kpi" style={{ '--accent': k.accent, '--bg': k.bg }}>
            <div className="rep-kpi-icon">{k.icon}</div>
            <div className="rep-kpi-body">
              <div className="rep-kpi-value">{k.value}</div>
              <div className="rep-kpi-label">{k.label}</div>
              {k.sub && <div className="rep-kpi-sub">{k.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Progress + Monthly ── */}
      <div className="rep-mid-row">

        {/* Progress card */}
        <div className="rep-card rep-progress-card">
          <div className="rep-card-title">
            <MdTrendingUp size={16} style={{ color: '#0A46FF' }} />
            Progreso de completado
          </div>
          <div className="rep-ring-wrap">
            <svg viewBox="0 0 120 120" className="rep-ring-svg">
              <circle cx="60" cy="60" r="48" className="rep-ring-bg" />
              <circle cx="60" cy="60" r="48" className="rep-ring-fill"
                strokeDasharray={`${pct * 3.016} 301.6`} />
            </svg>
            <div className="rep-ring-center">
              <span className="rep-ring-pct">{pct}%</span>
              <span className="rep-ring-sub">completado</span>
            </div>
          </div>
          <div className="rep-legend-row">
            <span className="rep-legend-dot" style={{ background: '#0A46FF' }} />
            <span>Completados <strong>{completados}</strong></span>
            <span className="rep-legend-dot rep-legend-dot-gray" />
            <span>En proceso <strong>{enProceso}</strong></span>
          </div>
        </div>

        {/* Monthly bar chart */}
        <div className="rep-card rep-month-card">
          <div className="rep-card-title">
            Contenedores por mes
            <span className="rep-card-sub">últimos 6 meses</span>
          </div>
          {datos.porMes?.length > 0 ? (
            <div className="rep-month-chart">
              {datos.porMes.map(m => (
                <div key={m.Mes} className="rep-month-col">
                  <span className="rep-month-num">{m.Total}</span>
                  <div className="rep-month-bar-wrap">
                    <div className="rep-month-bar"
                      style={{ height: `${Math.max((m.Total / maxMes) * 100, 6)}%` }} />
                  </div>
                  <span className="rep-month-lbl">{parseMes(m.Mes)}</span>
                </div>
              ))}
            </div>
          ) : <p className="rep-no-data">Sin datos de meses</p>}
        </div>
      </div>

      {/* ── Bar Charts Row ── */}
      <div className="rep-charts-grid">

        <div className="rep-card">
          <div className="rep-card-title">Por Turno</div>
          <div className="rep-bars">
            {datos.porTurno?.length > 0
              ? datos.porTurno.map(t => (
                <div key={t.Turno} className="rep-bar-row">
                  <span className="rep-bar-lbl">{t.Turno || '—'}</span>
                  <div className="rep-bar-track">
                    <div className="rep-bar-fill" style={{
                      width: `${(t.Total / maxTurno) * 100}%`,
                      background: 'linear-gradient(90deg,#0A46FF,#3D6BFF)'
                    }} />
                  </div>
                  <span className="rep-bar-num">{t.Total}</span>
                </div>
              ))
              : <p className="rep-no-data">Sin datos</p>}
          </div>
        </div>

        <div className="rep-card">
          <div className="rep-card-title">Por Origen</div>
          <div className="rep-bars">
            {datos.porOrigen?.length > 0
              ? datos.porOrigen.slice(0, 6).map(o => (
                <div key={o.Origen} className="rep-bar-row">
                  <span className="rep-bar-lbl">{o.Origen || '—'}</span>
                  <div className="rep-bar-track">
                    <div className="rep-bar-fill" style={{
                      width: `${(o.Total / maxOrigen) * 100}%`,
                      background: 'linear-gradient(90deg,#10B981,#34D399)'
                    }} />
                  </div>
                  <span className="rep-bar-num">{o.Total}</span>
                </div>
              ))
              : <p className="rep-no-data">Sin datos</p>}
          </div>
        </div>

        <div className="rep-card">
          <div className="rep-card-title">Por Empresa</div>
          <div className="rep-bars">
            {datos.porEmpresa?.length > 0
              ? datos.porEmpresa.slice(0, 6).map(e => (
                <div key={e.Empresa} className="rep-bar-row">
                  <span className="rep-bar-lbl">{e.Empresa || '—'}</span>
                  <div className="rep-bar-track">
                    <div className="rep-bar-fill" style={{
                      width: `${(e.Total / maxEmpresa) * 100}%`,
                      background: 'linear-gradient(90deg,#F59E0B,#FBBF24)'
                    }} />
                  </div>
                  <span className="rep-bar-num">{e.Total}</span>
                </div>
              ))
              : <p className="rep-no-data">Sin datos</p>}
          </div>
        </div>

      </div>
    </div>
  )
}
