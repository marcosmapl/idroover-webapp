import React from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Header({ selectedUnit, onSelectUnit }) {
    const navigate = useNavigate()
    const handleLogout = () => {
        localStorage.removeItem('idroove_user')
        navigate('/login')
    }

    const handleUnitChange = (value) => {
        onSelectUnit(value)
        // persist selected unit
        localStorage.setItem('idroove_selected_unit', value)
    }

    return (
        <header className="topbar">
            <div className="topbar-brand">iDroove Car</div>
            <nav className="topbar-nav" style={{ display: 'flex', gap: 25, margin: '10px 0' }}>
                <Link to="/">Início</Link>
                <Link to="/vehicles">Veículos</Link>
                <a href="#">Atendimento</a>
                <a href="#">Financeiro</a>
                <a href="#">Vendas</a>
            </nav>
            <div className="topbar-actions">
                <select value={selectedUnit} onChange={(e) => handleUnitChange(e.target.value)}>
                    <option value="Manaus">Manaus</option>
                    <option value="Fortaleza">Fortaleza</option>
                </select>
                <button className="btn" onClick={handleLogout}>Sair</button>
            </div>
        </header>
    )
}
