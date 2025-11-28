import React, { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import KpiCard from '../components/KpiCard'
import RevenueChart from '../components/RevenueChart'
import BrandDistributionChart from '../components/BrandDistributionChart'
import * as api from '../services/api'
import { useToast } from '../components/ToastProvider'
import { Container, Row, Col } from 'react-bootstrap'

export default function Dashboard() {
    const { selectedUnit } = useOutletContext()
    const userJson = localStorage.getItem('idroove_user')
    const user = userJson ? JSON.parse(userJson) : null

    const [vehicles, setVehicles] = React.useState([])
    const { pushToast, setLoading } = useToast()

    React.useEffect(() => {
        let mounted = true
        setLoading(true)
        api.getVehicles()
            .then((data) => {
                if (!mounted) return
                const unitMap = { Manaus: 1, Fortaleza: 2 }
                const code = unitMap[selectedUnit] || selectedUnit
                const list = (data || []).filter(v => (v.codigoUnidade || v.codigo_unidade || v.unidade) == code)
                setVehicles(list)
            })
            .catch(() => {
                const vehiclesData = JSON.parse(localStorage.getItem('idroove_vehicles') || '{}')
                setVehicles(vehiclesData[selectedUnit] || [])
                pushToast('Erro ao carregar dados do servidor. Dados locais utilizados', 'error')
            })
            .finally(() => { if (mounted) setLoading(false) })
        return () => { mounted = false }
    }, [selectedUnit])

    const kpis = useMemo(() => {
        const totalVehicles = vehicles.length
        const seminovos = vehicles.filter(v => (v.ano && (new Date()).getFullYear() - v.ano > 2)).length
        // Mock revenue and sales: sum of random according to vehicle age as a placeholder
        const revenue = vehicles.reduce((acc, v) => acc + ((v.ano ? (100000 / ((new Date()).getFullYear() - v.ano + 1)) : 20000)), 0)
        return { totalVehicles, seminovos, revenue: Math.round(revenue), newSales: Math.round(revenue / 10000), newServiceCalls: 2 }
    }, [vehicles])

    return (
        <div className="app-page">
            <Container>
                <h2>Bem-vindo, {user ? user.name : 'Usuário'}!</h2>
                <p>Unidade selecionada: <strong>{selectedUnit}</strong></p>

                {/* KPIs row */}
                <Row className="g-3" style={{ margin: '15px 0' }}>
                    <Col><KpiCard label="Total de Veículos" value={kpis.totalVehicles} /></Col>
                    <Col><KpiCard label="Seminovos" value={kpis.seminovos} /></Col>
                    <Col><KpiCard label="Vendas (mês)" value={kpis.newSales} /></Col>
                    <Col><KpiCard label="Atendimentos (mês)" value={kpis.newServiceCalls} /></Col>
                    <Col><KpiCard label="Faturamento (estimado)" value={`R$ ${kpis.revenue.toLocaleString()}`} /></Col>
                </Row>

                {/* Charts */}
                <Row style={{ display: 'flex', gap: 20 }}>
                    <Col md>{<RevenueChart unit={selectedUnit} />}</Col>
                    <Col md="auto" style={{ width: 380 }}>{<BrandDistributionChart unit={selectedUnit} />}</Col>
                </Row>
            </Container>
        </div>
    )
}
