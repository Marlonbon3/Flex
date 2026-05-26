import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { MdHome, MdLocalShipping, MdFolder, MdBarChart, MdPeople } from 'react-icons/md'
import { IoNotifications, IoSettingsSharp, IoHelpCircleSharp } from 'react-icons/io5'
import { MdLogout, MdMenu, MdClose } from 'react-icons/md'
import Contenedores from './Contenedores'
import Archivo from './Archivo'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import '../styles/home.css'

export default function Home({ tab = 'inicio' }) {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState(tab)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setActiveMenu(tab)
  }, [tab])

  const handleLogout = () => {
    navigate('/')
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const cambiarTab = (nuevoTab) => {
    setActiveMenu(nuevoTab)
    navigate(`/${nuevoTab === 'inicio' ? 'inicio' : nuevoTab}`)
    closeMenu()
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
            onClick={() => cambiarTab('inicio')}
          >
            <MdHome className="menu-icon" />
            <span className="menu-text">Inicio</span>
          </button>
          <button
            className={`menu-item ${activeMenu === 'contenedores' ? 'active' : ''}`}
            onClick={() => cambiarTab('contenedores')}
          >
            <MdLocalShipping className="menu-icon" />
            <span className="menu-text">Contenedores</span>
          </button>
          <button
            className={`menu-item ${activeMenu === 'archivo' ? 'active' : ''}`}
            onClick={() => cambiarTab('archivo')}
          >
            <MdFolder className="menu-icon" />
            <span className="menu-text">Archivo</span>
          </button>
          <button
            className={`menu-item ${activeMenu === 'reportes' ? 'active' : ''}`}
            onClick={() => cambiarTab('reportes')}
          >
            <MdBarChart className="menu-icon" />
            <span className="menu-text">Reportes</span>
          </button>
          <button
            className={`menu-item ${activeMenu === 'turno' ? 'active' : ''}`}
            onClick={() => cambiarTab('turno')}
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

          {activeMenu === 'archivo' && <Archivo />}
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
