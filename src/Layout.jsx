import React, { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'

export default function Layout({ isAuthenticated }) {
    // Persist selected unit across page loads in localStorage
    const initialUnit = localStorage.getItem('idroove_selected_unit') || 'Manaus'
    const [selectedUnit, setSelectedUnit] = useState(initialUnit)

    useEffect(() => {
        localStorage.setItem('idroove_selected_unit', selectedUnit)
    }, [selectedUnit])

    if (!isAuthenticated()) return <Navigate to="/login" replace />

    return (
        <div>
            <Header selectedUnit={selectedUnit} onSelectUnit={setSelectedUnit} />
            <Outlet context={{ selectedUnit, setSelectedUnit }} />
            <Footer />
        </div>
    )
}
