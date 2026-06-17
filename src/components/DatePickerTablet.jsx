import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FiCalendar } from 'react-icons/fi'
import '../styles/datePickerTablet.css'

const MESES_CORTO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MESES_LARGO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                     'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const ITEM_H = 52
const PAD    = 2   // items visibles arriba/abajo del centro

function parseDate(value) {
  if (!value) {
    const n = new Date()
    return { year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate() }
  }
  const [y, m, d] = value.split('-').map(Number)
  return { year: y || new Date().getFullYear(), month: m || 1, day: d || 1 }
}

function formatDisplay(value) {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  return `${d} ${MESES_LARGO[m - 1]} ${y}`
}

function padStr(n) { return String(n).padStart(2, '0') }

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const h = e => setMobile(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return mobile
}

// ── Rueda de scroll individual ──────────────────────────────────────
function DrumColumn({ items, value, onChange, renderItem }) {
  const scrollRef = useRef(null)
  const timerRef  = useRef(null)

  const scrollToIdx = useCallback((idx, smooth = true) => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ top: idx * ITEM_H, behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  // Posición inicial al abrir
  useEffect(() => {
    setTimeout(() => {
      const idx = items.indexOf(value)
      scrollToIdx(idx >= 0 ? idx : 0, false)
    }, 30)
  }, []) // solo en mount

  // Sincronizar si el valor cambia externamente (ej: mes cambia → día se recorta)
  useEffect(() => {
    const idx = items.indexOf(value)
    if (idx >= 0) scrollToIdx(idx, true)
  }, [value, items.length])

  const handleScroll = () => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!scrollRef.current) return
      const idx = Math.round(scrollRef.current.scrollTop / ITEM_H)
      const clamped = Math.max(0, Math.min(items.length - 1, idx))
      scrollToIdx(clamped, true)
      if (items[clamped] !== value) onChange(items[clamped])
    }, 120)
  }

  return (
    <div className="drum-col">
      <div ref={scrollRef} className="drum-scroll" onScroll={handleScroll}>
        {Array.from({ length: PAD }).map((_, i) => (
          <div key={`t${i}`} className="drum-item drum-pad" />
        ))}
        {items.map((item, i) => (
          <div
            key={item}
            className={`drum-item${item === value ? ' drum-active' : ''}`}
            onClick={() => { onChange(item); scrollToIdx(i) }}
          >
            {renderItem ? renderItem(item) : item}
          </div>
        ))}
        {Array.from({ length: PAD }).map((_, i) => (
          <div key={`b${i}`} className="drum-item drum-pad" />
        ))}
      </div>
      <div className="drum-fade-top" />
      <div className="drum-fade-bottom" />
      <div className="drum-selector" />
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────
export default function DatePickerTablet({ value, onChange, name, id, className }) {
  const isMobile = useIsMobile()
  const [open, setOpen]   = useState(false)
  const [draft, setDraft] = useState(() => parseDate(value))

  const currentYear = new Date().getFullYear()
  const years  = Array.from({ length: 8 }, (_, i) => currentYear - 7 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const daysInMonth = new Date(draft.year, draft.month, 0).getDate()
  const days   = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Sync cuando el valor externo cambia (ej: reset a hoy)
  useEffect(() => {
    if (!open) setDraft(parseDate(value))
  }, [value])

  const setDraftField = (field, val) => {
    setDraft(prev => {
      const next = { ...prev, [field]: val }
      // Recortar día si el mes/año cambia y el día ya no es válido
      if (field === 'month' || field === 'year') {
        const max = new Date(next.year, next.month, 0).getDate()
        if (next.day > max) next.day = max
      }
      return next
    })
  }

  const handleConfirm = () => {
    const { year, month, day } = draft
    onChange({ target: { name, value: `${year}-${padStr(month)}-${padStr(day)}` } })
    setOpen(false)
  }

  const handleCancel = () => {
    setDraft(parseDate(value))
    setOpen(false)
  }

  const handleOpen = () => {
    setDraft(parseDate(value))
    setOpen(true)
  }

  // ── Desktop: input nativo ──
  if (!isMobile) {
    return (
      <input
        id={id}
        type="date"
        name={name}
        value={value || ''}
        onChange={onChange}
        className={`dpt-native ${className || ''}`}
      />
    )
  }

  // ── Móvil/Tablet: botón + bottom sheet ──
  const display = formatDisplay(value)

  return (
    <>
      <button
        id={id}
        type="button"
        className={`dpt-trigger ${!display ? 'dpt-placeholder' : ''} ${className || ''}`}
        onClick={handleOpen}
      >
        <FiCalendar size={16} className="dpt-trigger-icon" />
        <span>{display || 'Seleccionar fecha'}</span>
      </button>

      {open && (
        <div className="dpt-backdrop" onClick={handleCancel}>
          <div className="dpt-sheet" onClick={e => e.stopPropagation()}>

            {/* Handle visual */}
            <div className="dpt-handle-bar" />

            {/* Título */}
            <div className="dpt-sheet-header">
              <span className="dpt-sheet-title">Seleccionar fecha</span>
            </div>

            {/* Labels de columnas */}
            <div className="dpt-col-labels">
              <span>Día</span>
              <span>Mes</span>
              <span>Año</span>
            </div>

            {/* Ruedas */}
            <div className="dpt-drums">
              <DrumColumn
                items={days}
                value={draft.day}
                onChange={v => setDraftField('day', v)}
              />
              <DrumColumn
                items={months}
                value={draft.month}
                onChange={v => setDraftField('month', v)}
                renderItem={m => MESES_CORTO[m - 1]}
              />
              <DrumColumn
                items={years}
                value={draft.year}
                onChange={v => setDraftField('year', v)}
              />
            </div>

            {/* Botones */}
            <div className="dpt-footer">
              <button className="dpt-btn dpt-btn-cancel" onClick={handleCancel}>
                Cancelar
              </button>
              <button className="dpt-btn dpt-btn-confirm" onClick={handleConfirm}>
                Aceptar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
