import React, { useState, useEffect } from 'react'
import { MdSave, MdDeleteOutline, MdMoreVert } from 'react-icons/md'
import '../styles/entregaTurno.css'

export default function EntregaTurno() {
  const [fecha, setFecha] = useState('2026-05-07')
  const [turno, setTurno] = useState('1er turno (08:00 AM - 12:00 PM)')
  const [responsable, setResponsable] = useState('Juan Pérez')
  const [menuAbiertoRampa, setMenuAbiertoRampa] = useState(null)
  
  // Estado de las filas de la tabla
  const [filas, setFilas] = useState([
    {
      id: 1,
      rampa: 'DR-01',
      numTrailer: 1,
      trailes: '',
      contenido: '',
      pallets: '',
      cliente: '',
      origenTB: '',
      capacidad: '',
      estibas: '',
      comentario: ''
    },
    {
      id: 2,
      rampa: 'DR-02',
      numTrailer: 2,
      trailes: '',
      contenido: '',
      pallets: '',
      cliente: '',
      origenTB: '',
      capacidad: '',
      estibas: '',
      comentario: ''
    },
    {
      id: 3,
      rampa: 'DR-03',
      numTrailer: 3,
      trailes: '',
      contenido: '',
      pallets: '',
      cliente: '',
      origenTB: '',
      capacidad: '',
      estibas: '',
      comentario: ''
    },
    {
      id: 4,
      rampa: 'DR-04',
      numTrailer: 4,
      trailes: '',
      contenido: '',
      pallets: '',
      cliente: '',
      origenTB: '',
      capacidad: '',
      estibas: '',
      comentario: ''
    },
    {
      id: 5,
      rampa: 'DR-05',
      numTrailer: 5,
      trailes: '',
      contenido: '',
      pallets: '',
      cliente: '',
      origenTB: '',
      capacidad: '',
      estibas: '',
      comentario: ''
    },
    {
      id: 6,
      rampa: 'DR-06',
      numTrailer: 6,
      trailes: '',
      contenido: '',
      pallets: '',
      cliente: '',
      origenTB: '',
      capacidad: '',
      estibas: '',
      comentario: ''
    },
    {
      id: 7,
      rampa: 'DR-07',
      numTrailer: 7,
      trailes: '',
      contenido: '',
      pallets: '',
      cliente: '',
      origenTB: '',
      capacidad: '',
      estibas: '',
      comentario: ''
    },
    {
      id: 8,
      rampa: 'DR-08',
      numTrailer: 8,
      trailes: '',
      contenido: '',
      pallets: '',
      cliente: '',
      origenTB: '',
      capacidad: '',
      estibas: '',
      comentario: ''
    },
    {
      id: 9,
      rampa: 'DR-09',
      numTrailer: 9,
      trailes: '',
      contenido: '',
      pallets: '',
      cliente: '',
      origenTB: '',
      capacidad: '',
      estibas: '',
      comentario: ''
    },
    {
      id: 10,
      rampa: 'DR-10',
      numTrailer: 10,
      trailes: '',
      contenido: '',
      pallets: '',
      cliente: '',
      origenTB: '',
      capacidad: '',
      estibas: '',
      comentario: ''
    }
  ])

  // Actualizar un campo de una fila
  const actualizarCampo = (id, campo, valor) => {
    setFilas(filas.map(fila => 
      fila.id === id ? { ...fila, [campo]: valor } : fila
    ))
  }

  // Calcular porcentaje de uso
  const calcularPorcentajeUso = (pallets, capacidad) => {
    if (!pallets || !capacidad || capacidad === 0) return '—'
    const valor = (parseFloat(pallets) / parseFloat(capacidad)) * 100
    return valor.toFixed(2) + '%'
  }

  // Calcular total de tráilas descargadas
  const calcularTotal = () => {
    return filas.filter(fila => fila.trailes && fila.trailes !== '').length
  }

  // Limpiar todos los campos
  const limpiarFormulario = () => {
    setFilas(filas.map(fila => ({
      ...fila,
      trailes: '',
      contenido: '',
      pallets: '',
      cliente: '',
      origenTB: '',
      capacidad: '',
      estibas: '',
      comentario: ''
    })))
  }

  // Formatear fecha para mostrar
  const formatearFecha = (fechaISO) => {
    const [year, month, day] = fechaISO.split('-')
    return `${day}/${month}/${year}`
  }

  // Guardar entrega
  const guardarEntrega = () => {
    const datosEntrega = {
      fecha,
      turno,
      responsable,
      filas: filas.filter(f => f.trailes || f.contenido || f.pallets),
      totalTrailes: calcularTotal()
    }
    console.log('Entrega guardada:', datosEntrega)
    alert(`Entrega de turno guardada.\nTotal de tráilas: ${calcularTotal()}`)
  }

  return (
    <div className="entrega-turno-container">
      {/* Header Section */}
      <div className="section-header">
        <div className="header-info">
          <h2>Entrega de turno</h2>
          <p>Registra las tráilas descargadas por turno.</p>
        </div>
        
        <div className="header-actions">
          <button className="btn-primary" onClick={guardarEntrega}>
            <MdSave size={18} />
            Guardar entrega
          </button>
          <button className="btn-secondary" onClick={limpiarFormulario}>
            <MdDeleteOutline size={18} />
            Limpiar
          </button>
          <button className="btn-menu">
            <MdMoreVert size={18} />
          </button>
        </div>
      </div>

      {/* Filtros Section */}
      <div className="filtros-section">
        <div className="filtro-grupo">
          <label htmlFor="fecha">Fecha</label>
          <div className="input-con-icono">
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="input-fecha"
            />
          </div>
        </div>

        <div className="filtro-grupo">
          <label htmlFor="turno">Turno</label>
          <select
            id="turno"
            value={turno}
            onChange={(e) => setTurno(e.target.value)}
            className="select-filtro"
          >
            <option>1er turno (08:00 AM - 12:00 PM)</option>
            <option>2do turno (12:00 PM - 04:00 PM)</option>
          </select>
        </div>

        <div className="filtro-grupo">
          <label htmlFor="responsable">Responsable</label>
          <select
            id="responsable"
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            className="select-filtro"
          >
            <option>Juan Pérez</option>
            <option>María García</option>
            <option>Carlos López</option>
            <option>Ana Martínez</option>
          </select>
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="tabla-contenedor">
        <div className="tabla-wrapper">
          <table className="tabla-principal">
            <thead>
              <tr className="encabezado-tabla">
                {/* Columna RAMPAS */}
                <th colSpan="2" className="col-group-rampas">
                  RAMPAS
                </th>
                
                {/* Columnas TRÁILAS DESCARGADAS */}
                <th colSpan="7" className="col-group-trailes">
                  TRÁILAS DESCARGADAS
                </th>
                
                {/* Columna ESTIBAS */}
                <th className="col-group-estibas">
                  ESTIBAS
                </th>
                
                {/* Columna COMENTARIO */}
                <th className="col-group-comentario">
                  COMENTARIO
                </th>
              </tr>

              <tr className="subencabezado-tabla">
                {/* RAMPAS */}
                <th className="col-rampas">Rampas</th>
                <th className="col-trailer"># de tráiler</th>
                
                {/* TRÁILAS DESCARGADAS */}
                <th className="col-trailes">Tráilas</th>
                <th className="col-contenido">Contenido</th>
                <th className="col-pallets">Pallets</th>
                <th className="col-cliente">Cliente</th>
                <th className="col-origen">Origen del TB</th>
                <th className="col-capacidad">Capacidad (Pallets)</th>
                <th className="col-porcentaje">% Uso (Pallets Recibidos/Capacidad)</th>
                
                {/* ESTIBAS */}
                <th className="col-estibas">Estibas</th>
                
                {/* COMENTARIO */}
                <th className="col-comentario">Comentario</th>
              </tr>
            </thead>

            <tbody>
              {filas.map((fila) => (
                <tr key={fila.id} className="fila-datos">
                  {/* RAMPAS */}
                  <td className="col-rampas celda-rampa">{fila.rampa}</td>
                  <td className="col-trailer celda-input">
                    <input
                      type="number"
                      value={fila.numTrailer}
                      readOnly
                      className="input-celda"
                    />
                  </td>

                  {/* TRÁILAS DESCARGADAS */}
                  <td className="col-trailes celda-input">
                    <input
                      type="text"
                      value={fila.trailes}
                      onChange={(e) => actualizarCampo(fila.id, 'trailes', e.target.value)}
                      placeholder="—"
                      className="input-celda"
                    />
                  </td>
                  <td className="col-contenido celda-input">
                    <input
                      type="text"
                      value={fila.contenido}
                      onChange={(e) => actualizarCampo(fila.id, 'contenido', e.target.value)}
                      placeholder="—"
                      className="input-celda"
                    />
                  </td>
                  <td className="col-pallets celda-input">
                    <input
                      type="number"
                      value={fila.pallets}
                      onChange={(e) => actualizarCampo(fila.id, 'pallets', e.target.value)}
                      placeholder="—"
                      className="input-celda"
                    />
                  </td>
                  <td className="col-cliente celda-input">
                    <input
                      type="text"
                      value={fila.cliente}
                      onChange={(e) => actualizarCampo(fila.id, 'cliente', e.target.value)}
                      placeholder="—"
                      className="input-celda"
                    />
                  </td>
                  <td className="col-origen celda-input">
                    <input
                      type="text"
                      value={fila.origenTB}
                      onChange={(e) => actualizarCampo(fila.id, 'origenTB', e.target.value)}
                      placeholder="—"
                      className="input-celda"
                    />
                  </td>
                  <td className="col-capacidad celda-input">
                    <input
                      type="number"
                      value={fila.capacidad}
                      onChange={(e) => actualizarCampo(fila.id, 'capacidad', e.target.value)}
                      placeholder="—"
                      className="input-celda"
                    />
                  </td>
                  <td className="col-porcentaje celda-solo-lectura">
                    {calcularPorcentajeUso(fila.pallets, fila.capacidad)}
                  </td>

                  {/* ESTIBAS */}
                  <td className="col-estibas celda-input">
                    <input
                      type="text"
                      value={fila.estibas}
                      onChange={(e) => actualizarCampo(fila.id, 'estibas', e.target.value)}
                      placeholder="—"
                      className="input-celda"
                    />
                  </td>

                  {/* COMENTARIO */}
                  <td className="col-comentario celda-input">
                    <input
                      type="text"
                      value={fila.comentario}
                      onChange={(e) => actualizarCampo(fila.id, 'comentario', e.target.value)}
                      placeholder="—"
                      className="input-celda"
                    />
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="fila-total">
                <td colSpan="2" className="total-label">
                  Total de tráilas descargadas
                </td>
                <td colSpan="9" className="total-valor">
                  <span className="badge-total">{calcularTotal()}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
