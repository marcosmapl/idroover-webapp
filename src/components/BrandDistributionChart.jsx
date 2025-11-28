import React, { useEffect, useState } from 'react'
import * as api from '../services/api'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function BrandDistributionChart({ unit }) {
    const [data, setData] = useState([])

    useEffect(() => {
        let mounted = true
        api.getVehicles()
            .then(list => {
                if (!mounted) return
                const code = unit === 'Manaus' ? 1 : 2
                const filtered = (list || []).filter(v => (v.codigoUnidade || v.codigo_unidade || v.unidade) == code)
                const byBrand = filtered.reduce((acc, v) => { acc[v.marca] = (acc[v.marca] || 0) + 1; return acc }, {})
                setData(Object.entries(byBrand).map(([brand, count]) => ({ brand, count })))
            })
            .catch(() => {
                try {
                    const vehicles = JSON.parse(localStorage.getItem('idroove_vehicles') || '{}')
                    const list = vehicles[unit] || []
                    const byBrand = list.reduce((acc, v) => {
                        acc[v.marca] = (acc[v.marca] || 0) + 1
                        return acc
                    }, {})
                    setData(Object.entries(byBrand).map(([brand, count]) => ({ brand, count })))
                } catch {
                    setData([])
                }
            })
        return () => { mounted = false }
    }, [unit])

    if (!data.length) {
        return (<div className="app-card"><h4>Distribuição por Marca</h4><p>Nenhum veículo cadastrado nessa unidade.</p></div>)
    }

    const chartData = {
        labels: data.map(d => d.brand),
        datasets: [{ data: data.map(d => d.count), backgroundColor: ['#0067b8', '#00bcd4', '#f44336', '#ff9800', '#8bc34a', '#9c27b0'] }]
    }

    return (
        <div className="app-card">
            <h4>Distribuição do Estoque por Marca</h4>
            <Doughnut data={chartData} />
        </div>
    )
}
