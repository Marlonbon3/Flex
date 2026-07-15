import React, { useState, useEffect } from 'react'
import '../styles/reportes.css'
import * as api from '../services/api'
import { FiRefreshCw, FiChevronDown } from 'react-icons/fi'
import {
  MdLocalShipping, MdCheckCircle, MdPending,
  MdInventory, MdTrendingUp
} from 'react-icons/md'

const PERIODOS = [
  { key: 'dia',    label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes',    label: 'Este mes' },
]

const ORIGEN_COLORS = [
  '#8B5CF6', '#0A46FF', '#10B981', '#F59E0B', '#EF4444', '#06B6D4',
]

function parseMes(yyyymm) {
  if (!yyyymm) return ''
  const [y, m] = yyyymm.split('-')
  const names = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${names[parseInt(m, 10) - 1]} ${y}`
}

function StatusBadge({ status }) {
  const ok = status === 'Completado'
  return (
    <span className={`rep-sbadge ${ok ? 'rep-sbadge-ok' : 'rep-sbadge-proc'}`}>
      {ok ? '✓ Completado' : '● En proceso'}
    </span>
  )
}

export default function Reportes() {
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const [periodo, setPeriodo] = useState('dia')
  const [expanded, setExpanded] = useState(null)

  const cargar = async (p) => {
    setLoading(true)
    setError(null)
    const d = await api.obtenerReportes(p)
    if (!d) setError('No se pudo conectar con el servidor')
    else setDatos(d)
    setLoading(false)
  }

  useEffect(() => { cargar(periodo) }, [periodo])

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id)

  if (error) return (
    <div className="rep-state-screen">
      <p className="rep-error-msg">{error}</p>
      <button onClick={() => cargar(periodo)} className="btn-primary">Reintentar</button>
    </div>
  )

  const total       = datos?.totalContenedores || 0
  const completados = datos?.porStatus?.find(s => s.Status === 'Completado')?.Total || 0
  const enProceso   = total - completados
  const pallets     = datos?.palletsTotales || 0
  const pct         = total > 0 ? Math.round((completados / total) * 100) : 0

  const contenedores     = datos?.contenedores     || []
  const porOrigenPallets = datos?.porOrigenPallets || []
  const maxPallets = Math.max(...porOrigenPallets.map(o => o.TotalPallets), 1)

  const maxTurno   = Math.max(...(datos?.porTurno?.map(t => t.Total)   || [0]), 1)
  const maxOrigen  = Math.max(...(datos?.porOrigen?.map(o => o.Total)  || [0]), 1)
  const maxEmpresa = Math.max(...(datos?.porEmpresa?.map(e => e.Total) || [0]), 1)
  const maxMes     = Math.max(...(datos?.porMes?.map(m => m.Total)     || [0]), 1)

  const kpis = [
    { id: 'total',       icon: <MdLocalShipping size={22}/>, label: 'Total Contenedores', value: total,                    accent: '#0A46FF', bg: '#eef4ff' },
    { id: 'completados', icon: <MdCheckCircle   size={22}/>, label: 'Completados',         value: completados,              accent: '#10B981', bg: '#ecfdf5', sub: `${pct}% del total` },
    { id: 'proceso',     icon: <MdPending       size={22}/>, label: 'En Proceso',          value: enProceso,                accent: '#F59E0B', bg: '#fffbeb' },
    { id: 'pallets',     icon: <MdInventory     size={22}/>, label: 'Pallets Totales',     value: pallets.toLocaleString(), accent: '#8B5CF6', bg: '#f5f3ff' },
  ]

  const getItems = () => {
    if (expanded === 'total')       return contenedores
    if (expanded === 'completados') return contenedores.filter(c => c.Status === 'Completado')
    if (expanded === 'proceso')     return contenedores.filter(c => c.Status !== 'Completado')
    return []
  }

  const activeKpi = kpis.find(k => k.id === expanded)

  return (
    <div className="rep-container">

      {/* ── Header ── */}
      <div className="section-header">
        <div className="header-info">
          <h2>Dashboard de Reportes</h2>
          <p>Resumen operativo de contenedores y trailers</p>
        </div>
        <div className="header-actions" style={{ width: 'auto' }}>
          <button className="btn-secondary" onClick={() => cargar(periodo)}>
            <FiRefreshCw size={15} className={loading ? 'rep-spin' : ''} /> Actualizar
          </button>
        </div>
      </div>

      {/* ── Period Toggle ── */}
      <div className="rep-periodo-bar">
        <div className="rep-periodo-toggle">
          {PERIODOS.map(p => (
            <button
              key={p.key}
              className={`rep-periodo-btn${periodo === p.key ? ' active' : ''}`}
              onClick={() => { setPeriodo(p.key); setExpanded(null) }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <span className="rep-periodo-hint">Todos los datos filtrados por período</span>
      </div>

      {loading ? (
        <div className="rep-state-screen">
          <FiRefreshCw className="rep-spin" size={28} />
          <p>Cargando reportes…</p>
        </div>
      ) : (
        <>
          {/* ── KPI Grid (clickable) ── */}
          <div className="rep-kpi-grid">
            {kpis.map((k) => (
              <div
                key={k.id}
                className={`rep-kpi rep-kpi-click${expanded === k.id ? ' rep-kpi-open' : ''}`}
                style={{ '--accent': k.accent, '--bg': k.bg }}
                onClick={() => toggleExpand(k.id)}
              >
                <div className="rep-kpi-icon">{k.icon}</div>
                <div className="rep-kpi-body">
                  <div className="rep-kpi-value">{k.value}</div>
                  <div className="rep-kpi-label">{k.label}</div>
                  {k.sub && <div className="rep-kpi-sub">{k.sub}</div>}
                </div>
                <FiChevronDown
                  size={16}
                  className={`rep-kpi-chevron${expanded === k.id ? ' flipped' : ''}`}
                />
              </div>
            ))}
          </div>

          {/* ── Expanded Panel ── */}
          {expanded && (
            <div className="rep-panel" style={{ '--accent': activeKpi?.accent || '#0A46FF' }}>
              <div className="rep-panel-header">
                <div className="rep-panel-title-row">
                  <span className="rep-panel-dot" />
                  <span className="rep-panel-title">{activeKpi?.label}</span>
                  <span className="rep-panel-count">
                    {expanded === 'pallets'
                      ? `${pallets.toLocaleString()} pallets`
                      : `${getItems().length} contenedor${getItems().length !== 1 ? 'es' : ''}`}
                  </span>
                </div>
                <button className="rep-panel-close" onClick={() => setExpanded(null)}>✕</button>
              </div>

              {expanded === 'pallets' ? (
                <div className="rep-panel-pallets">
                  {/* Badges resumen */}
                  {porOrigenPallets.length > 0 && (
                    <div className="rep-pallets-badges">
                      {porOrigenPallets.map((o, i) => (
                        <span
                          key={o.Origen}
                          className="rep-pallets-badge"
                          style={{ '--c': ORIGEN_COLORS[i % ORIGEN_COLORS.length] }}
                        >
                          <strong>{o.TotalPallets}</strong> de {o.Origen}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Barras por origen */}
                  {porOrigenPallets.length > 0 ? (
                    <div className="rep-panel-bars">
                      {porOrigenPallets.map((o, i) => (
                        <div key={o.Origen} className="rep-pallets-row">
                          <div className="rep-pallets-row-header">
                            <span className="rep-bar-lbl">{o.Origen}</span>
                            <span className="rep-pallets-meta">
                              <strong>{o.TotalPallets}</strong> pallets
                              <span className="rep-sep">·</span>
                              {o.Contenedores} trailer{o.Contenedores !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="rep-bar-track">
                            <div className="rep-bar-fill" style={{
                              width: `${Math.max((o.TotalPallets / maxPallets) * 100, 3)}%`,
                              background: ORIGEN_COLORS[i % ORIGEN_COLORS.length]
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rep-no-data">Sin pallets registrados en este período</p>
                  )}

                  {/* Lista contenedores con pallets */}
                  {contenedores.filter(c => c.TotalPallets > 0).length > 0 && (
                    <>
                      <div className="rep-panel-list-label">Desglose por contenedor</div>
                      <div className="rep-panel-list">
                        <div className="rep-list-head">
                          <span>Trailer</span>
                          <span>Origen</span>
                          <span>Turno</span>
                          <span>Pallets</span>
                          <span>Estado</span>
                        </div>
                        {contenedores
                          .filter(c => c.TotalPallets > 0)
                          .sort((a, b) => b.TotalPallets - a.TotalPallets)
                          .map(c => (
                            <div key={c.Paso1ID} className="rep-list-row">
                              <span className="rep-list-trailer">{c.TrailerNo || '—'}</span>
                              <span className="rep-list-cell">{c.Origen}</span>
                              <span className="rep-list-cell">{c.Turno}</span>
                              <span className="rep-list-num">{c.TotalPallets}</span>
                              <StatusBadge status={c.Status} />
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* Lista para total / completados / proceso */
                <div className="rep-panel-list-wrap">
                  {getItems().length === 0 ? (
                    <p className="rep-no-data">Sin contenedores en este período</p>
                  ) : (
                    <div className="rep-panel-list">
                      <div className="rep-list-head">
                        <span>Trailer</span>
                        <span>Origen</span>
                        <span>Turno</span>
                        <span>Pallets</span>
                        <span>Estado</span>
                      </div>
                      {getItems().map(c => (
                        <div key={c.Paso1ID} className="rep-list-row">
                          <span className="rep-list-trailer">{c.TrailerNo || '—'}</span>
                          <span className="rep-list-cell">{c.Origen}</span>
                          <span className="rep-list-cell">{c.Turno}</span>
                          <span className="rep-list-num">{c.TotalPallets || 0}</span>
                          <StatusBadge status={c.Status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Progress + Monthly ── */}
          <div className="rep-mid-row">
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

            <div className="rep-card rep-month-card">
              <div className="rep-card-title">
                Contenedores por mes
                <span className="rep-card-sub">últimos 6 meses</span>
              </div>
              {datos?.porMes?.length > 0 ? (
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

          {/* ── Bar Charts Grid ── */}
          <div className="rep-charts-grid">
            <div className="rep-card">
              <div className="rep-card-title">Por Turno</div>
              <div className="rep-bars">
                {datos?.porTurno?.length > 0
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
                {datos?.porOrigen?.length > 0
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
                {datos?.porEmpresa?.length > 0
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
        </>
      )}
    </div>
  )
}
