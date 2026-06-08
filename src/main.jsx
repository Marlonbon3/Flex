import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AlertProvider from './components/AlertProvider'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AlertProvider>
      <App />
    </AlertProvider>
  </React.StrictMode>
)
