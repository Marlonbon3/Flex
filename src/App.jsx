import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import Home from './components/Home'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inicio" element={<Home tab="inicio" />} />
        <Route path="/contenedores" element={<Home tab="contenedores" />} />
        <Route path="/archivo" element={<Home tab="archivo" />} />
        <Route path="/reportes" element={<Home tab="reportes" />} />
        <Route path="/turno" element={<Home tab="turno" />} />
      </Routes>
    </BrowserRouter>
  )
}
