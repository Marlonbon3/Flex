import React from 'react'
import '../styles/archivo.css'

export default function Archivo() {
  return (
    <section className="archivo-section">
      <div className="archivo-header">
        <h2>Archivo de Documentos</h2>
        <p>Consulta, visualiza y descarga los documentos generados en el flujo operativo.</p>
      </div>

      <div className="archivo-filters">
        <div className="filter-group">
          <input type="date" defaultValue="2026-05-07" className="date-input" />
          <span>-</span>
          <input type="date" defaultValue="2026-07-05" className="date-input" />
          <button className="filter-btn">↻</button>
        </div>
        <select className="filter-select">
          <option>Todos los tipos</option>
          <option>Inspección</option>
          <option>Llegada</option>
          <option>Otros</option>
        </select>
        <div className="search-box">
          <input type="text" placeholder="Buscar documento, trailer, contenedor..." className="search-input" />
          <button className="search-btn">🔍</button>
        </div>
        <button className="export-btn">📊 Exportar a Excel</button>
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
            <tr>
              <td colSpan="7" className="date-group">📅 Hoy, 7 de mayo de 2026 (3)</td>
            </tr>
            <tr>
              <td>04:10 PM</td>
              <td>Inspección de Trailer / Contenedor Marítimo</td>
              <td>TCNJI294580</td>
              <td>R19</td>
              <td>Calexico, CA</td>
              <td>Juan Pérez</td>
              <td className="actions"><span className="icon">👁️</span> <span className="icon">🗑️</span></td>
            </tr>
            <tr>
              <td>03:22 PM</td>
              <td>Nueva llegada de contenedor</td>
              <td>1240SMSM</td>
              <td>R19</td>
              <td>N/A</td>
              <td>Ana Gutiérrez</td>
              <td className="actions"><span className="icon">👁️</span> <span className="icon">🗑️</span></td>
            </tr>
            <tr>
              <td>02:06 PM</td>
              <td>Inspección de Trailer / Contenedor Marítimo</td>
              <td>1415BVL</td>
              <td>R9</td>
              <td>Calexico, CA</td>
              <td>Luis Ramírez</td>
              <td className="actions"><span className="icon">👁️</span> <span className="icon">🗑️</span></td>
            </tr>
            <tr>
              <td colSpan="7" className="date-group">📅 Ayer, 6 de mayo de 2026 (2)</td>
            </tr>
            <tr>
              <td>05:15 PM</td>
              <td>Nueva llegada de contenedor</td>
              <td>1490SMSM</td>
              <td>OK para expo</td>
              <td>San Luis, AZ</td>
              <td>Carlos López</td>
              <td className="actions"><span className="icon">👁️</span> <span className="icon">🗑️</span></td>
            </tr>
            <tr>
              <td>11:47 AM</td>
              <td>Inspección de Trailer / Contenedor Marítimo</td>
              <td>1506BVL</td>
              <td>R20</td>
              <td>Otay Mesa, CA</td>
              <td>María Fernanda</td>
              <td className="actions"><span className="icon">👁️</span> <span className="icon">🗑️</span></td>
            </tr>
            <tr>
              <td colSpan="7" className="date-group">📅 5 de mayo de 2026 (4)</td>
            </tr>
            <tr>
              <td>04:32 PM</td>
              <td>Inspección de Trailer / Contenedor Marítimo</td>
              <td>2255R1B</td>
              <td>R18</td>
              <td>Calexico, CA</td>
              <td>Juan Pérez</td>
              <td className="actions"><span className="icon">👁️</span> <span className="icon">🗑️</span></td>
            </tr>
            <tr>
              <td>03:11 PM</td>
              <td>Nueva llegada de contenedor</td>
              <td>1240SMSM</td>
              <td>R19</td>
              <td>N/A</td>
              <td>Ana Gutiérrez</td>
              <td className="actions"><span className="icon">👁️</span> <span className="icon">🗑️</span></td>
            </tr>
            <tr>
              <td>12:09 PM</td>
              <td>Inspección de Trailer / Contenedor Marítimo</td>
              <td>1415BVL</td>
              <td>R19</td>
              <td>Calexico, CA</td>
              <td>Luis Ramírez</td>
              <td className="actions"><span className="icon">👁️</span> <span className="icon">🗑️</span></td>
            </tr>
            <tr>
              <td>09:08 AM</td>
              <td>Nueva llegada de contenedor</td>
              <td>1606BVL</td>
              <td>R20</td>
              <td>Otay Mesa, CA</td>
              <td>María Fernanda</td>
              <td className="actions"><span className="icon">👁️</span> <span className="icon">🗑️</span></td>
            </tr>
            <tr>
              <td colSpan="7" className="date-group">📅 4 de mayo de 2026 (1)</td>
            </tr>
            <tr>
              <td>05:45 PM</td>
              <td>Inspección de Trailer / Contenedor Marítimo</td>
              <td>1490SMSM</td>
              <td>OK para expo</td>
              <td>San Luis, AZ</td>
              <td>Carlos López</td>
              <td className="actions"><span className="icon">👁️</span> <span className="icon">🗑️</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="archivo-footer">
        <p>Mostrando 1 a 10 de 30 documentos</p>
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
  )
}
