import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { applyTheme, loadTheme } from './theme/palettes'

// Aplica la paleta guardada antes del primer render para evitar un parpadeo con los colores originales.
applyTheme(loadTheme())

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
