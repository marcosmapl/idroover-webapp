import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

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
        // Debug: log to console so it's easy to confirm login happened
        console.log('iDroove: logged in as', user)
        // Use replace to avoid going back to the login page via browser back button
        navigate('/', { replace: true })
        // Fallback in case router navigation fails for some reason
        setTimeout(() => {
            if (location.pathname !== '/') window.location.href = '/'
        }, 200)
    }

    return (
        <div className="page login-page">
            <div className="card login-card">
                <h1>iDroove Car</h1>
                <p className="subtitle">Preencha com as credenciais de acesso:</p>
                <form onSubmit={handleSubmit} className="login-form">
                    <label>
                        E-mail
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@exemplo.com"
                        />
                    </label>
                    <label>
                        Senha
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Senha"
                        />
                    </label>
                    {error && <div className="error">{error}</div>}
                    <button type="submit" className="btn primary">Entrar</button>
                </form>
            </div>
            <Footer />
        </div>
    )
}
