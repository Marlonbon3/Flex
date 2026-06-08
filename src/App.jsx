import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'

function ProtectedRoute({ children }) {
  const usuario = localStorage.getItem('usuario')
  if (!usuario) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inicio"       element={<ProtectedRoute><Home tab="inicio" /></ProtectedRoute>} />
        <Route path="/contenedores" element={<ProtectedRoute><Home tab="contenedores" /></ProtectedRoute>} />
        <Route path="/archivo"      element={<ProtectedRoute><Home tab="archivo" /></ProtectedRoute>} />
        <Route path="/reportes"     element={<ProtectedRoute><Home tab="reportes" /></ProtectedRoute>} />
        <Route path="/turno"        element={<ProtectedRoute><Home tab="turno" /></ProtectedRoute>} />
        <Route path="/admin"        element={<ProtectedRoute><Home tab="admin" /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
