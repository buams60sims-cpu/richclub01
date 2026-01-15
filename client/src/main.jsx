import React from 'react'
import ReactDOM from 'react-dom/client'
import './utils/axiosGuard' // 🔥 Guard against rogue axios instances (DEV only)
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
