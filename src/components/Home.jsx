import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { MdHome, MdLocalShipping, MdFolder, MdBarChart, MdPeople } from 'react-icons/md'
import { MdLogout } from 'react-icons/md'
import * as api from '../services/api'
import Contenedores from './Contenedores'
import Archivo from './Archivo'
import EntregaTurno from './EntregaTurno'
import Reportes from './Reportes'
import Admin from './Admin'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import '../styles/home.css'

const AVATAR_COLORS = [
  '#0A46FF', '#7C3AED', '#DB2777', '#DC2626',
  '#EA580C', '#D97706', '#16A34A', '#0891B2',
  '#475569', '#1E293B',
]

const AVATAR_EMOJIS = [
  {
    cat: '🎮 Nintendo',
    items: ['🍄', '🌿', '⭐', '🐢', '🔥', '🌸', '👑', '🗡️', '🧚', '🦆'],
  },
  {
    cat: '👾 Arcade',
    items: ['👾', '🕹️', '🎯', '💣', '🏆', '⚡', '💎', '🔮', '🃏', '🎲'],
  },
  {
    cat: '⚔️ Armas',
    items: ['⚔️', '🗡️', '🛡️', '🏹', '🪃', '🔱', '⚡', '💥', '🔫', '🪖'],
  },
  {
    cat: '🐉 Fantasía',
    items: ['🐉', '🦄', '🧙', '🧝', '🦊', '🐺', '🦅', '🦁', '🐍', '🦂'],
  },
  {
    cat: '🚀 Sci-Fi',
    items: ['🚀', '👨‍🚀', '🤖', '👽', '🛸', '🌌', '⚙️', '🔬', '💻', '🛰️'],
  },
]

function getInitials(usuario) {
  if (!usuario) return 'U'
  if (usuario.nombre) {
    const parts = usuario.nombre.trim().split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase()
  }
  if (usuario.email) return usuario.email.substring(0, 2).toUpperCase()
  return 'U'
}

function avatarKey(usuario) {
  return `avatarColor_${usuario?.id || usuario?.email || 'default'}`
}

function emojiKey(usuario) {
  return `avatarEmoji_${usuario?.id || usuario?.email || 'default'}`
}

export default function Home({ tab = 'inicio' }) {
  const navigate = useNavigate()
  const [activeMenu, setActiveMenu] = useState(tab)
  const [menuOpen, setMenuOpen] = useState(false)
  const [usuario] = useState(() => api.obtenerUsuarioActual())
  const [avatarColor, setAvatarColor] = useState(() =>
    localStorage.getItem(avatarKey(api.obtenerUsuarioActual())) || '#0A46FF'
  )
  const [avatarEmoji, setAvatarEmoji] = useState(() =>
    localStorage.getItem(emojiKey(api.obtenerUsuarioActual())) || ''
  )
  const [showPicker, setShowPicker] = useState(false)
  const [pickerTab, setPickerTab] = useState('color')
  const [emojiCat, setEmojiCat] = useState(0)
  const pickerRef = useRef(null)

  useEffect(() => {
    setActiveMenu(tab)
  }, [tab])

  useEffect(() => {
    if (!showPicker) return
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPicker])

  const handleSelectColor = (color) => {
    setAvatarColor(color)
    localStorage.setItem(avatarKey(usuario), color)
  }

  const handleSelectEmoji = (emoji) => {
    setAvatarEmoji(emoji)
    localStorage.setItem(emojiKey(usuario), emoji)
    setShowPicker(false)
  }

  const handleClearEmoji = () => {
    setAvatarEmoji('')
    localStorage.removeItem(emojiKey(usuario))
  }

  const handleLogout = () => {
    api.logoutUsuario()
    navigate('/')
  }

  const toggleMenu = () => setMenuOpen(!menuOpen)
  const closeMenu = () => setMenuOpen(false)

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
          {usuario?.rol?.toLowerCase() === 'admin' && (
            <button
              className={`menu-item ${activeMenu === 'admin' ? 'active' : ''}`}
              onClick={() => cambiarTab('admin')}
            >
              <MdBarChart className="menu-icon" />
              <span className="menu-text">Administración</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar" style={{ background: avatarEmoji ? 'transparent' : avatarColor, fontSize: avatarEmoji ? '22px' : undefined }}>
              {avatarEmoji || getInitials(usuario)}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{usuario?.nombre || usuario?.email || 'Usuario'}</span>
              <span className={`sidebar-rol-badge sidebar-rol-${usuario?.rol?.toLowerCase()}`}>
                {usuario?.rol || 'Sin rol'}
              </span>
            </div>
          </div>
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
          <button className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Menú">
            <span className="hb-line" />
            <span className="hb-line" />
            <span className="hb-line" />
          </button>
          <div className="header-left">
            <div>
              <h1>
                {activeMenu === 'inicio' && 'Flex - Sistema de Recibos'}
                {activeMenu === 'contenedores' && 'Trailers Flow Management'}
                {activeMenu === 'archivo' && 'Archivo'}
                {activeMenu === 'reportes' && 'Reportes'}
                {activeMenu === 'admin' && 'Administración'}
                {activeMenu === 'turno' && 'Entrega de Turno'}
              </h1>
              {activeMenu === 'contenedores' && (
                <p className="header-subtitle">Control y monitoreo del flujo operativo de trailers</p>
              )}
            </div>
          </div>
          <div className="header-right">
            <div className="avatar-wrapper" ref={pickerRef}>
              <button
                className="user-btn"
                style={{ background: avatarEmoji ? 'transparent' : avatarColor, fontSize: avatarEmoji ? '22px' : undefined }}
                title="Personalizar avatar"
                onClick={() => setShowPicker(p => !p)}
              >
                {avatarEmoji || getInitials(usuario)}
              </button>

              {showPicker && (
                <div className="avatar-color-picker">
                  {/* Tabs */}
                  <div className="avatar-picker-tabs">
                    <button
                      className={`avatar-picker-tab${pickerTab === 'color' ? ' active' : ''}`}
                      onClick={() => setPickerTab('color')}
                    >
                      🎨 Color
                    </button>
                    <button
                      className={`avatar-picker-tab${pickerTab === 'emoji' ? ' active' : ''}`}
                      onClick={() => setPickerTab('emoji')}
                    >
                      👾 Avatar
                    </button>
                  </div>

                  {/* Tab: Color */}
                  {pickerTab === 'color' && (
                    <>
                      <p className="avatar-picker-label">Elige tu color</p>
                      <div className="avatar-color-grid">
                        {AVATAR_COLORS.map(c => (
                          <button
                            key={c}
                            className={`avatar-color-swatch${avatarColor === c ? ' selected' : ''}`}
                            style={{ background: c }}
                            onClick={() => handleSelectColor(c)}
                            title={c}
                          />
                        ))}
                      </div>
                      <div className="avatar-color-custom">
                        <label>Personalizado</label>
                        <input
                          type="color"
                          value={avatarColor}
                          onChange={e => handleSelectColor(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* Tab: Emoji */}
                  {pickerTab === 'emoji' && (
                    <>
                      {/* Categorías */}
                      <div className="emoji-cat-tabs">
                        {AVATAR_EMOJIS.map((g, i) => (
                          <button
                            key={i}
                            className={`emoji-cat-btn${emojiCat === i ? ' active' : ''}`}
                            onClick={() => setEmojiCat(i)}
                            title={g.cat}
                          >
                            {g.cat.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                      <p className="avatar-picker-label">{AVATAR_EMOJIS[emojiCat].cat}</p>
                      <div className="emoji-grid">
                        {AVATAR_EMOJIS[emojiCat].items.map((em, i) => (
                          <button
                            key={i}
                            className={`emoji-btn${avatarEmoji === em ? ' selected' : ''}`}
                            onClick={() => handleSelectEmoji(em)}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                      {avatarEmoji && (
                        <button className="emoji-clear-btn" onClick={handleClearEmoji}>
                          Usar iniciales
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
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
          {activeMenu === 'reportes' && <Reportes />}
          {activeMenu === 'turno' && <EntregaTurno />}
          {activeMenu === 'admin' && <Admin />}
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
