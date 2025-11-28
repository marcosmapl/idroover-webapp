import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ToastProvider from './components/ToastProvider'
// Import project styles and Bootstrap CSS for React-Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <App />
            </ToastProvider>
        </BrowserRouter>
    </React.StrictMode>
)
