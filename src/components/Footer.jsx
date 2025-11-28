import React from 'react'
import { Container } from 'react-bootstrap'

export default function Footer() {
    return (
        <footer className="app-site-footer">
            <Container style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>MAPL IT Solutions</div>
                <div>Sistema Integrado de Gestão Automotiva - SIGA</div>
                <div>v1.0.0</div>
            </Container>
        </footer>
    )
}
