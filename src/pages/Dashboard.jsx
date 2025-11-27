import React, { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import KpiCard from '../components/KpiCard'
import RevenueChart from '../components/RevenueChart'
import BrandDistributionChart from '../components/BrandDistributionChart'

export default function Dashboard() {
    const { selectedUnit } = useOutletContext()
    const userJson = localStorage.getItem('idroove_user') 
    const user = userJson ? JSON.parse(userJson) : null

    const vehiclesData = JSON.parse(localStorage.getItem('idroove_vehicles') || '{}')
    const vehicles = vehiclesData[selectedUnit] || []

    const kpis = useMemo(() => {
        const totalVehicles = vehicles.length
        const seminovos = vehicles.filter(v => (v.ano && (new Date()).getFullYear() - v.ano > 2)).length
        // Mock revenue and sales: sum of random according to vehicle age as a placeholder
        const revenue = vehicles.reduce((acc, v) => acc + ((v.ano ? (100000 / ((new Date()).getFullYear() - v.ano + 1)) : 20000)), 0)
        return { totalVehicles, seminovos, revenue: Math.round(revenue), newSales: Math.round(revenue / 10000), newServiceCalls: 2 }
    }, [vehicles])

    return (
        <div className="page">
            {/* Header is provided via Layout, nothing to render here */}
            <main className="container">
                <h2>Bem-vindo, {user ? user.name : 'Usuário'}!</h2>
                <p>Unidade selecionada: <strong>{selectedUnit}</strong></p>

                {/* KPIs row */}
                <section style={{ display: 'flex', gap: 20, margin: '15px 0' }}>
                    <KpiCard label="Total de Veículos" value={kpis.totalVehicles} />
                    <KpiCard label="Seminovos" value={kpis.seminovos} />
                    <KpiCard label="Vendas (mês)" value={kpis.newSales} />
                    <KpiCard label="Atendimentos (mês)" value={kpis.newServiceCalls} />
                    <KpiCard label="Faturamento (estimado)" value={`R$ ${kpis.revenue.toLocaleString()}`} />
                </section>

                {/* Charts */}
                <section style={{ display: 'flex', gap: 20 }}>
                    <div style={{ flex: 1 }}>
                        <RevenueChart unit={selectedUnit} />
                    </div>
                    <div style={{ width: 380 }}>
                        <BrandDistributionChart unit={selectedUnit} />
                    </div>
                </section>

            </main>
        </div>
    )
}
