import React, { useState, useEffect } from 'react'
import { MdDownload, MdDelete, MdFilePresent } from 'react-icons/md'
import { BsFilePdf, BsSearch } from 'react-icons/bs'
import { FiRefreshCw } from 'react-icons/fi'
import '../styles/archivo.css'
import * as api from '../services/api'
import { generarPDFContenedor } from '../utils/pdfGenerator'
import { exportarExcel, exportarPaso1Excel } from '../utils/excelExporter'

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
      // Cargar SOLO contenedores completados y archivados (Activo = 0 Y Status = 'Completado')
      const todosLosContenedores = await api.obtenerTodosLosContenedores()
      const contenedoresArchivados = todosLosContenedores.filter(c => 
        !c.Activo && c.Status === 'Completado'
      )
      
      // Deduplicar por Paso1ID (prevenir duplicados por StrictMode)
      const vistosSet = new Set()
      const contenedoresDedupados = contenedoresArchivados.filter(c => {
        if (vistosSet.has(c.Paso1ID)) return false
        vistosSet.add(c.Paso1ID)
        return true
      })
      
      setContenedores(contenedoresDedupados)
      console.log('Archivados cargados:', contenedoresDedupados.length)
    } catch (error) {
      console.error('Error cargando contenedores archivados:', error);
      setContenedores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarContenedor = async (paso1ID) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este contenedor?')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/contenedores/${paso1ID}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        alert('Contenedor eliminado exitosamente');
        cargarContenedores();
      } else {
        alert('Error al eliminar: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error eliminando contenedor:', error);
      alert('Error al eliminar contenedor');
    }
  };

  const handleVerPDF = async (paso1ID) => {
    try {
      // Obtener datos completos del contenedor
      const response = await fetch(`http://localhost:5000/api/contenedores/${paso1ID}`);
      const result = await response.json();
      
      if (!result.success || !result.datos) {
        alert('Error al cargar datos del contenedor');
        return;
      }
      
      const datos = result.datos;
      
      // Obtener archivos
      const archivos = await fetch(`http://localhost:5000/api/archivos/${paso1ID}`)
        .then(r => r.json())
        .then(d => d.archivos || [])
        .catch(() => []);
      
      // Generar PDF con todos los datos
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
          TotalPallets: datos.TotalPallets,
          LongitudContenedor: datos.LongitudContenedor,
          Origen: datos.Origen,
          Empresas: datos.Empresas ? datos.Empresas.split(',') : []
        },
        {
          DescargaCompleta: datos.DescargaCompleta,
          FechaDescarga: datos.FechaDescarga,
          HoraDescarga: datos.HoraDescarga,
          InformacionAdicional: datos.InformacionAdicional,
          ObservacionesFinales: datos.ObservacionesFinales
        },
        archivos
      );
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar PDF: ' + error.message);
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
          <button className="search-btn">
            <BsSearch size={16} />
          </button>
        </div>
        <button className="export-btn">
          <MdFilePresent size={16} /> Exportar a Excel
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
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  Cargando contenedores...
                </td>
              </tr>
            ) : todosLosContenedores.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  No hay contenedores registrados
                </td>
              </tr>
            ) : (
              Object.entries(gruposContenedores).map(([fecha, contenedores]) => (
                <React.Fragment key={fecha}>
                  <tr>
                    <td colSpan="7" className="date-group">
                      {fecha} ({contenedores.length})
                    </td>
                  </tr>
                  {contenedores.map((c) => (
                    <tr key={c.Paso1ID}>
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
                        <button 
                          className="action-btn pdf-btn" 
                          title="Ver PDF"
                          onClick={() => handleVerPDF(c.Paso1ID)}
                        >
                          <BsFilePdf size={18} />
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          title="Eliminar"
                          onClick={() => handleEliminarContenedor(c.Paso1ID)}
                        >
                          <MdDelete size={18} />
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
