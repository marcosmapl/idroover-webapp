import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import VehicleForm from './pages/VehicleForm'
import Layout from './Layout'

export default function App() {
    // Basic auth simulation using state in localStorage
    const isAuthenticated = () => !!localStorage.getItem('idroove_user')

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout isAuthenticated={isAuthenticated} />}>
                <Route index element={<Dashboard />} />
                <Route path="vehicles" element={<Vehicles />} />
                <Route path="vehicles/new" element={<VehicleForm />} />
                <Route path="vehicles/:id/edit" element={<VehicleForm />} />
            </Route>
            <Route path="/*" element={<Navigate to={isAuthenticated() ? '/' : '/login'} replace />} />
        </Routes>
    )
}
