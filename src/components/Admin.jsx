import React, { useState, useEffect } from 'react'
import '../styles/admin.css'
import * as api from '../services/api'
import { useAlert } from './AlertProvider'
import { MdDelete, MdAdd, MdPerson, MdPersonOff, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { FiRefreshCw, FiList, FiUsers } from 'react-icons/fi'

const LISTAS = [
  { key: 'trailerType',        label: 'Trailer Type' },
  { key: 'usoEmbarques',       label: 'Uso Embarques' },
  { key: 'portOfEntry',        label: 'Port of Entry' },
  { key: 'loadType',           label: 'Load Type' },
  { key: 'responsable',        label: 'Responsible' },
  { key: 'poNo',               label: 'P.O. #' },
  { key: 'empresas',           label: 'Empresas' },
  { key: 'origen',             label: 'Origen (Arribo)' },
  { key: 'longitudContenedor', label: 'Longitud Contenedor' }
]

const ROLES = ['Admin', 'Operador', 'Supervisor']

export default function Admin() {
  const { toast, confirm } = useAlert()
  const usuario = api.obtenerUsuarioActual()
  const esAdmin = usuario?.rol?.toLowerCase() === 'admin'

  const [seccion, setSeccion] = useState('listas')

  // ── Estado: Listas ──
  const [activeList, setActiveList] = useState('trailerType')
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(false)
  const [newEtiqueta, setNewEtiqueta] = useState('')
  const [savingItem, setSavingItem] = useState(false)

  // ── Estado: Usuarios ──
  const [usuarios, setUsuarios] = useState([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombreCompleto: '', email: '', contrasena: '', rol: '' })
  const [savingUsuario, setSavingUsuario] = useState(false)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  useEffect(() => {
    if (seccion === 'listas') cargarItems()
    if (seccion === 'usuarios') cargarUsuarios()
  }, [seccion, activeList])

  // ── Listas ──
  const cargarItems = async () => {
    setLoadingItems(true)
    setItems(await api.obtenerCatalogo(activeList))
    setLoadingItems(false)
  }

  const handleAgregarItem = async () => {
    if (!newEtiqueta.trim()) { toast('Escribe el nombre de la opción', 'warning'); return }
    setSavingItem(true)
    const res = await api.agregarItemCatalogo(activeList, newEtiqueta.trim(), newEtiqueta.trim(), usuario?.rol)
    setSavingItem(false)
    if (res.success) { toast('Opción agregada', 'success'); setNewEtiqueta(''); cargarItems() }
    else toast('Error: ' + (res.error || 'Sin detalles'), 'error')
  }

  const handleEliminarItem = async (id, etiqueta) => {
    if (!(await confirm(`¿Eliminar "${etiqueta}" de la lista?`))) return
    const res = await api.eliminarItemCatalogo(id, usuario?.rol)
    if (res.success) { toast('Opción eliminada', 'success'); cargarItems() }
    else toast('Error: ' + (res.error || 'Sin detalles'), 'error')
  }

  // ── Usuarios ──
  const cargarUsuarios = async () => {
    setLoadingUsuarios(true)
    setUsuarios(await api.obtenerUsuarios())
    setLoadingUsuarios(false)
  }

  const handleCampoUsuario = (e) => {
    const { name, value } = e.target
    setNuevoUsuario(prev => ({ ...prev, [name]: value }))
  }

  const handleCrearUsuario = async () => {
    const { nombreCompleto, email, contrasena, rol } = nuevoUsuario
    if (!nombreCompleto.trim()) { toast('Nombre completo requerido', 'warning'); return }
    if (!email.trim()) { toast('Email requerido', 'warning'); return }
    if (!contrasena.trim()) { toast('Contraseña requerida', 'warning'); return }
    if (!rol) { toast('Selecciona un rol', 'warning'); return }
    setSavingUsuario(true)
    const res = await api.crearUsuario({ nombreCompleto: nombreCompleto.trim(), email: email.trim(), contrasena: contrasena.trim(), rol })
    setSavingUsuario(false)
    if (res.success) {
      toast('Usuario creado correctamente', 'success')
      setNuevoUsuario({ nombreCompleto: '', email: '', contrasena: '', rol: '' })
      cargarUsuarios()
    } else toast('Error: ' + (res.error || 'Sin detalles'), 'error')
  }

  const handleToggleActivo = async (id, activo, nombre) => {
    const accion = activo ? 'desactivar' : 'activar'
    if (!(await confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} al usuario "${nombre}"?`))) return
    const res = await api.toggleActivoUsuario(id, !activo)
    if (res.success) { toast(`Usuario ${accion === 'activar' ? 'activado' : 'desactivado'}`, 'success'); cargarUsuarios() }
    else toast('Error: ' + (res.error || 'Sin detalles'), 'error')
  }

  if (!esAdmin) {
    return (
      <div className="admin-no-access">
        <h3>Acceso restringido</h3>
        <p>Solo usuarios con rol Administrador pueden acceder a esta sección.</p>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h2>Panel de Administración</h2>
          <p>Gestiona listas del formulario y cuentas de usuario</p>
        </div>
      </div>

      {/* Selector de sección */}
      <div className="admin-section-selector">
        <button
          className={`admin-section-btn ${seccion === 'listas' ? 'active' : ''}`}
          onClick={() => setSeccion('listas')}
        >
          <FiList size={16} /> Configuración de Listas
        </button>
        <button
          className={`admin-section-btn ${seccion === 'usuarios' ? 'active' : ''}`}
          onClick={() => setSeccion('usuarios')}
        >
          <FiUsers size={16} /> Usuarios
        </button>
      </div>

      {/* ══ SECCIÓN: LISTAS ══ */}
      {seccion === 'listas' && (
        <>
          <div className="admin-tabs">
            {LISTAS.map(l => (
              <button
                key={l.key}
                className={`admin-tab ${activeList === l.key ? 'active' : ''}`}
                onClick={() => setActiveList(l.key)}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="admin-content">
            <div className="admin-add-section">
              <h3>Agregar opción — {LISTAS.find(l => l.key === activeList)?.label}</h3>
              <div className="admin-add-row">
                <div className="admin-field-wrap">
                  <label>Nombre de la opción</label>
                  <input
                    type="text"
                    placeholder="Ej. San Luis Rio Colorado"
                    value={newEtiqueta}
                    onChange={e => setNewEtiqueta(e.target.value)}
                    className="admin-input"
                    onKeyDown={e => e.key === 'Enter' && handleAgregarItem()}
                  />
                </div>
                <button className="admin-btn-add" onClick={handleAgregarItem} disabled={savingItem}>
                  <MdAdd size={20} /> {savingItem ? 'Guardando...' : 'Agregar'}
                </button>
              </div>
            </div>

            <div className="admin-list-section">
              <div className="admin-list-header">
                <span>Opciones actuales ({items.length})</span>
                <button className="admin-btn-refresh-sm" onClick={cargarItems} title="Actualizar">
                  <FiRefreshCw size={13} />
                </button>
              </div>
              {loadingItems ? (
                <div className="admin-loading">Cargando...</div>
              ) : items.length === 0 ? (
                <div className="admin-empty">No hay opciones. Agrega la primera arriba.</div>
              ) : (
                <div className="admin-items">
                  {items.map(item => (
                    <div key={item.ListaID} className="admin-item">
                      <span className="admin-item-etiqueta">{item.Etiqueta}</span>
                      <button className="admin-btn-delete" onClick={() => handleEliminarItem(item.ListaID, item.Etiqueta)} title="Eliminar">
                        <MdDelete size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ══ SECCIÓN: USUARIOS ══ */}
      {seccion === 'usuarios' && (
        <div className="admin-content">
          {/* Formulario nuevo usuario */}
          <div className="admin-add-section">
            <h3>Agregar nuevo usuario</h3>
            <div className="admin-users-form">
              <div className="admin-field-wrap">
                <label>Nombre completo</label>
                <input
                  type="text"
                  name="nombreCompleto"
                  placeholder="Ej. Juan García"
                  value={nuevoUsuario.nombreCompleto}
                  onChange={handleCampoUsuario}
                  className="admin-input"
                />
              </div>
              <div className="admin-field-wrap">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="usuario@empresa.com"
                  value={nuevoUsuario.email}
                  onChange={handleCampoUsuario}
                  className="admin-input"
                />
              </div>
              <div className="admin-field-wrap">
                <label>Contraseña</label>
                <div className="admin-password-wrap">
                  <input
                    type={mostrarContrasena ? 'text' : 'password'}
                    name="contrasena"
                    placeholder="Contraseña"
                    value={nuevoUsuario.contrasena}
                    onChange={handleCampoUsuario}
                    className="admin-input"
                  />
                  <button
                    type="button"
                    className="admin-toggle-pass"
                    onClick={() => setMostrarContrasena(p => !p)}
                  >
                    {mostrarContrasena ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>
              <div className="admin-field-wrap">
                <label>Rol</label>
                <select name="rol" value={nuevoUsuario.rol} onChange={handleCampoUsuario} className="admin-input">
                  <option value="">Selecciona un rol</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button className="admin-btn-add admin-btn-crear" onClick={handleCrearUsuario} disabled={savingUsuario}>
                <MdAdd size={20} /> {savingUsuario ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </div>

          {/* Lista de usuarios */}
          <div className="admin-list-section">
            <div className="admin-list-header">
              <span>Usuarios registrados ({usuarios.length})</span>
              <button className="admin-btn-refresh-sm" onClick={cargarUsuarios} title="Actualizar">
                <FiRefreshCw size={13} />
              </button>
            </div>
            {loadingUsuarios ? (
              <div className="admin-loading">Cargando usuarios...</div>
            ) : usuarios.length === 0 ? (
              <div className="admin-empty">No hay usuarios registrados.</div>
            ) : (
              <div className="admin-items">
                {usuarios.map(u => (
                  <div key={u.UsuarioID} className={`admin-item admin-user-item ${!u.Activo ? 'admin-user-inactive' : ''}`}>
                    <div className="admin-item-info">
                      <span className="admin-item-etiqueta">{u.NombreCompleto}</span>
                      <span className="admin-user-meta">
                        {u.Email} &nbsp;·&nbsp;
                        <span className={`admin-rol-badge admin-rol-${u.Rol?.toLowerCase()}`}>{u.Rol}</span>
                        &nbsp;·&nbsp;
                        <span className={`admin-estado-badge ${u.Activo ? 'activo' : 'inactivo'}`}>
                          {u.Activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </span>
                    </div>
                    <button
                      className={`admin-btn-toggle ${u.Activo ? 'admin-btn-desactivar' : 'admin-btn-activar'}`}
                      onClick={() => handleToggleActivo(u.UsuarioID, u.Activo, u.NombreCompleto)}
                      title={u.Activo ? 'Desactivar' : 'Activar'}
                    >
                      {u.Activo ? <MdPersonOff size={18} /> : <MdPerson size={18} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
