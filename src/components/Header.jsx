import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Navbar, Container, Nav, Form, Button } from 'react-bootstrap'

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
        <Navbar bg="light" expand="lg" className="topbar">
            <Container>
                <Navbar.Brand className="topbar-brand">iDroove Car</Navbar.Brand>
                <Navbar.Toggle aria-controls="main-nav" />
                <Navbar.Collapse id="main-nav">
                    <Nav className="me-auto topbar-nav">
                        <Nav.Link as={Link} to="/">Início</Nav.Link>
                        <Nav.Link as={Link} to="/vehicles">Veículos</Nav.Link>
                        <Nav.Link href="#">Atendimento</Nav.Link>
                        <Nav.Link href="#">Financeiro</Nav.Link>
                        <Nav.Link href="#">Vendas</Nav.Link>
                    </Nav>
                    <div className="topbar-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Form.Select value={selectedUnit} onChange={(e) => handleUnitChange(e.target.value)} aria-label="Selecionar unidade" style={{ width: 140 }}>
                            <option value="Manaus">Manaus</option>
                            <option value="Fortaleza">Fortaleza</option>
                        </Form.Select>
                        <Button variant="outline-secondary" onClick={handleLogout}>Sair</Button>
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}
