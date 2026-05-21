import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { MdHome, MdLocalShipping, MdFolder, MdBarChart, MdPeople } from 'react-icons/md'
import { IoNotifications, IoSettingsSharp, IoHelpCircleSharp } from 'react-icons/io5'
import { MdLogout, MdMenu, MdClose } from 'react-icons/md'
import Contenedores from './Contenedores'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import '../styles/home.css'

export default function Home() {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState('inicio')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    navigate('/')
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const slides = [
    {
      title: 'Sistema de Gestión de Recibos',
      description: 'Digitalización moderna para optimizar tu operación logística',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80'
    },
    {
      title: 'Control y Monitoreo',
      description: 'Sigue en tiempo real el flujo de tus contenedores',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'
    },
    {
      title: 'Eficiencia Operativa',
      description: 'Automatiza procesos y reduce tiempos de gestión',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'
    }
  ]

  return (
    <div className="home-container">
      {/* Sidebar */}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/logo.png" alt="Flex" className="logo-small" />
        </div>

        <nav className="sidebar-menu">
          <button
            className={`menu-item ${activeMenu === 'inicio' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('inicio')
              closeMenu()
            }}
          >
            <MdHome className="menu-icon" />
            <span className="menu-text">Inicio</span>
          </button>
          <button
            className={`menu-item ${activeMenu === 'contenedores' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('contenedores')
              closeMenu()
            }}
          >
            <MdLocalShipping className="menu-icon" />
            <span className="menu-text">Contenedores</span>
          </button>
          <button
            className={`menu-item ${activeMenu === 'archivo' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('archivo')
              closeMenu()
            }}
          >
            <MdFolder className="menu-icon" />
            <span className="menu-text">Archivo</span>
          </button>
          <button
            className={`menu-item ${activeMenu === 'reportes' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('reportes')
              closeMenu()
            }}
          >
            <MdBarChart className="menu-icon" />
            <span className="menu-text">Reportes</span>
          </button>
          <button
            className={`menu-item ${activeMenu === 'turno' ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('turno')
              closeMenu()
            }}
          >
            <MdPeople className="menu-icon" />
            <span className="menu-text">Entrega de turno</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <MdLogout className="logout-icon" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <button className="menu-toggle" onClick={toggleMenu}>
            {menuOpen ? <MdClose /> : <MdMenu />}
          </button>
          <div className="header-left">
            <div>
              <h1>
                {activeMenu === 'inicio' && 'Flex - Sistema de Recibos'}
                {activeMenu === 'contenedores' && 'Trailers Flow Management'}
                {activeMenu === 'archivo' && 'Archivo'}
                {activeMenu === 'reportes' && 'Reportes'}
                {activeMenu === 'turno' && 'Entrega de Turno'}
              </h1>
              {activeMenu === 'contenedores' && (
                <p className="header-subtitle">Control y monitoreo del flujo operativo de trailers</p>
              )}
            </div>
          </div>
          <div className="header-right">
            <button className="icon-btn" title="Notificaciones">
              <IoNotifications />
            </button>
            <button className="icon-btn" title="Configuración">
              <IoSettingsSharp />
            </button>
            <button className="icon-btn" title="Ayuda">
              <IoHelpCircleSharp />
            </button>
            <button className="user-btn">JC</button>
          </div>
        </header>

        <div className="content-area">
          {activeMenu === 'inicio' && (
            <>
              {/* Carrusel */}
              <section className="carousel-section">
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 5000 }}
                  loop
                  className="carousel"
                >
                  {slides.map((slide, idx) => (
                    <SwiperSlide key={idx} className="carousel-slide">
                      <img src={slide.image} alt={slide.title} className="slide-image" />
                      <div className="slide-content">
                        <h2>{slide.title}</h2>
                        <p>{slide.description}</p>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </section>

              {/* Misión y Visión */}
              <section className="mission-vision">
                <div className="mission-card">
                  <div className="card-header">
                    <h3>Misión</h3>
                  </div>
                  <p>
                    Aprovechar la experiencia, capacidades y el alcance global para crear productos excepcionales que tengan un impacto positivo en el mundo. A nivel local, esto incluye proporcionar un entorno seguro con oportunidades de crecimiento y desarrollo para sus colaboradores.
                  </p>
                </div>

                <div className="vision-card">
                  <div className="card-header">
                    <h3>Visión</h3>
                  </div>
                  <p>
                    Ser el socio global más confiable en tecnología, cadena de suministro y soluciones avanzadas de manufactura. Todo esto integrando la inteligencia en el diseño y producción para permitir a las personas y empresas vivir de manera más inteligente ("Live Smarter").
                  </p>
                </div>
              </section>

              {/* Información de la Sede */}
              <section className="company-info">
                <h2>Sobre Nuestra Sede en Sonora</h2>
                <div className="info-cards">
                  <div className="info-card">
                    <h4>Empresa</h4>
                    <p>Flextronics Technologies</p>
                  </div>
                  <div className="info-card">
                    <h4>Ubicación</h4>
                    <p>San Luis Río Colorado (SLRC), Sonora, México</p>
                  </div>
                  <div className="info-card">
                    <h4>Operaciones</h4>
                    <p>Centro de Logística y Recuperación de Cadena de Suministro</p>
                  </div>
                  <div className="info-card">
                    <h4>Especialidad</h4>
                    <p>Manufactura, logística, gestión de recibos y distribución</p>
                  </div>
                  <div className="info-card">
                    <h4>Tecnología</h4>
                    <p>Soluciones digitales avanzadas para optimización operativa</p>
                  </div>
                  <div className="info-card">
                    <h4>Presencia Regional</h4>
                    <p>Lider en transformación digital logística en el noroeste de México</p>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeMenu === 'contenedores' && <Contenedores />}

          {activeMenu === 'archivo' && (
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
          )}
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p>&copy; 2026 Flextronics Technologies. SLRC. Todos los derechos reservados.</p>
            <p>Sistema de Gestión de Recibos v1.0 | Desarrollado con innovación y excelencia</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
