/**
 * InsightRAG Frontend - Vite/React entrypoint.
 *
 * Author: ManuelDuque
 * Date: 02/02/2026
 *
 * Bootstraps the React application and mounts it into the DOM.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)