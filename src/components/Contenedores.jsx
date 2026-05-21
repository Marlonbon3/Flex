import React, { useState } from 'react'
import { MdAdd, MdDownload } from 'react-icons/md'
import { HiEllipsisVertical } from 'react-icons/hi2'
import '../styles/contenedores.css'
import AgregarContenedor from './AgregarContenedor'

export default function Contenedores() {
  const [showFormModal, setShowFormModal] = useState(false)
  const [trailers, setTrailers] = useState([
    {
      id: 1,
      trailerNo: '2559IB',
      tipo: 'SWIFT',
      contenedor: 'R18',
      puertoEntrada: 'Calexico, CA',
      llegada: '5/14/2026 12:00',
      status: 'EMPTY'
    },
    {
      id: 2,
      trailerNo: '12405MSM',
      tipo: 'CHARGER',
      contenedor: 'R19',
      puertoEntrada: 'N/A',
      llegada: '5/8/2026 12:00',
      status: 'FINISHED'
    },
    {
      id: 3,
      trailerNo: '1415BVL',
      tipo: 'CHARGER',
      contenedor: 'R19',
      puertoEntrada: 'Calexico, CA',
      llegada: '5/11/2026 12:00',
      status: 'EMPTY'
    },
    {
      id: 4,
      trailerNo: '1490MSM',
      tipo: 'CHARGER',
      contenedor: 'OK para expo',
      puertoEntrada: 'San Luis, AZ',
      llegada: '5/13/2026 12:00',
      status: 'EMPTY'
    },
    {
      id: 5,
      trailerNo: '1505BVL',
      tipo: 'SWIFT',
      contenedor: 'R20',
      puertoEntrada: 'Otay Mesa, CA',
      llegada: '5/15/2026 09:00',
      status: 'LOADED'
    }
  ])

  const handleAgregar = () => {
    setShowFormModal(true)
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
            {trailers.map((trailer) => (
              <tr key={trailer.id}>
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
                  <button className="action-btn" title="Opciones">
                    <HiEllipsisVertical />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p>Mostrando los últimos 5 trailers activos en el flujo operativo.</p>
      </div>

      {showFormModal && <AgregarContenedor onClose={() => setShowFormModal(false)} />}
    </div>
  )
}
