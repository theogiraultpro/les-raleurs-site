import React from 'react'
import ReactDOM from 'react-dom/client'
import { inject } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import App from "./app/App"
import './styles/index.css'

// Statistiques de visite (Vercel Web Analytics) et vitesse réelle chez les
// visiteurs (Speed Insights) : sans cookies, donc sans bandeau de consentement.
// La page /admin n'est pas comptée.
const isAdmin = () => window.location.pathname.startsWith('/admin')
inject({ beforeSend: (event) => (isAdmin() || new URL(event.url).pathname.startsWith('/admin') ? null : event) })
injectSpeedInsights({ beforeSend: (event) => (isAdmin() ? null : event) })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
