import React, { useState, useEffect } from 'react'
import '../styles/archivo.css'
import * as api from '../services/api'

export default function Archivo() {
  const [contenedores, setContenedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos de la BD al montar el componente
  useEffect(() => {
    cargarContenedores();
  }, []);

  const cargarContenedores = async () => {
    try {
      setLoading(true);
      // Cargar SOLO contenedores inactivos/archivados (Activo = 0)
      const todosLosContenedores = await api.obtenerTodosLosContenedores()
      const contenedoresArchivados = todosLosContenedores.filter(c => c.Activo === 0)
      setContenedores(contenedoresArchivados)
      console.log('✓ Archivados cargados:', contenedoresArchivados.length)
    } catch (error) {
      console.error('Error cargando contenedores archivados:', error);
      setContenedores([]);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar contenedores por fecha
  const agruparPorFecha = (contenedores) => {
    const grupos = {};
    contenedores.forEach(c => {
      const fecha = new Date(c.FechaCreacion).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!grupos[fecha]) {
        grupos[fecha] = [];
      }
      grupos[fecha].push(c);
    });
    return grupos;
  };

  const filtrar = (contenedores) => {
    if (!searchTerm) return contenedores;
    return contenedores.filter(c => 
      c.TrailerNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.SeaContainerType?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const gruposContenedores = agruparPorFecha(filtrar(contenedores));
  const todosLosContenedores = Object.values(gruposContenedores).flat();

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
          <input 
            type="text" 
            placeholder="Buscar documento, trailer, contenedor..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  Cargando contenedores... ⏳
                </td>
              </tr>
            ) : todosLosContenedores.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  No hay contenedores registrados 📭
                </td>
              </tr>
            ) : (
              Object.entries(gruposContenedores).map(([fecha, contenedores]) => (
                <React.Fragment key={fecha}>
                  <tr>
                    <td colSpan="7" className="date-group">
                      📅 {fecha} ({contenedores.length})
                    </td>
                  </tr>
                  {contenedores.map((c) => (
                    <tr key={c.id}>
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
                        <span className="icon" title="Ver detalles">👁️</span>
                        <span className="icon" title="Eliminar" style={{ cursor: 'pointer' }}>🗑️</span>
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
  )
}
