import React, { useState } from 'react'

export default function Login() {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí implementarás la lógica de autenticación
    alert(`Usuario: ${user}\nContraseña: ${password}`)
  }

  return (
    <div className="page-root">
      <aside className="left-panel">
        <div className="brand">
          <h1>Bienvenido de vuelta</h1>
          <p>Inicia sesión para acceder al sistema de recibos.</p>
        </div>
      </aside>

      <main className="right-panel">
        <div className="card">
          <img src="/logo.png" alt="Flex logo" className="logo" />
          <h2>Iniciar sesión</h2>
          <p className="subtitle">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span className="field-label">Usuario</span>
              <div className="input-wrap">
                <svg className="icon" viewBox="0 0 24 24"><path fill="#7b8aa3" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"/></svg>
                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="field">
              <span className="field-label">Contraseña</span>
              <div className="input-wrap">
                <svg className="icon" viewBox="0 0 24 24"><path fill="#7b8aa3" d="M17 8V7a5 5 0 0 0-10 0v1H5v11h14V8h-2zM9 7a3 3 0 0 1 6 0v1H9V7z"/></svg>
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye"
                  onClick={() => setShow((s) => !s)}
                  aria-label="Mostrar contraseña"
                >
                  {show ? (
                    <svg viewBox="0 0 24 24" className="eye-icon"><path fill="#7b8aa3" d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="eye-icon"><path fill="#7b8aa3" d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>
                  )}
                </button>
              </div>
            </label>

            <button className="primary" type="submit">Iniciar sesión</button>
          </form>

          <p className="foot"><svg viewBox="0 0 24 24" className="lock-icon"><path fill="#9aa7bd" d="M12 1a4 4 0 0 0-4 4v3H6v11h12V8h-2V5a4 4 0 0 0-4-4zM9 8V5a3 3 0 0 1 6 0v3H9z"/></svg> Acceso exclusivo para usuarios autorizados</p>
        </div>
      </main>
    </div>
  )
}
