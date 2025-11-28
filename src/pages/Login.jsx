import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import { Container, Card, Form, Button } from 'react-bootstrap'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        // Very basic validation for demo purposes
        if (!email || !password) {
            setError('Por favor, preencha e-mail e senha')
            return
        }
        // Fake login - in real app call backend
        const user = { email, name: 'Usuário iDroove' }
        localStorage.setItem('idroove_user', JSON.stringify(user))
        console.log('iDroove: logged in as', user)
        navigate('/', { replace: true })
        setTimeout(() => {
            if (location.pathname !== '/') window.location.href = '/'
        }, 200)
    }

    return (
        <div className="app-page login-page">
            <Container style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Card className="app-login-card" style={{ width: '100%', maxWidth: 640 }}>
                    <Card.Body>
                        <Card.Title>iDroove Car</Card.Title>
                        <Card.Text className="subtitle">Preencha com as credenciais de acesso:</Card.Text>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="loginEmail">
                                <Form.Label>E-mail</Form.Label>
                                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@exemplo.com" />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="loginPassword">
                                <Form.Label>Senha</Form.Label>
                                <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
                            </Form.Group>
                            {error && <div className="error">{error}</div>}
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button type="submit" variant="primary">Entrar</Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
            <Footer />
        </div>
    )
}
