import React, { useEffect, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function BrandDistributionChart({ unit }) {
    const [data, setData] = useState([])

    useEffect(() => {
        try {
            const vehicles = JSON.parse(localStorage.getItem('idroove_vehicles') || '{}')
            const list = vehicles[unit] || []
            const byBrand = list.reduce((acc, v) => {
                acc[v.marca] = (acc[v.marca] || 0) + 1
                return acc
            }, {})
            setData(Object.entries(byBrand).map(([brand, count]) => ({ brand, count })))
        } catch (err) {
            setData([])
        }
    }, [unit])

    if (!data.length) {
        return (<div className="card"><h4>Distribuição por Marca</h4><p>Nenhum veículo cadastrado nessa unidade.</p></div>)
    }

    const chartData = {
        labels: data.map(d => d.brand),
        datasets: [{ data: data.map(d => d.count), backgroundColor: ['#0067b8', '#00bcd4', '#f44336', '#ff9800', '#8bc34a', '#9c27b0'] }]
    }

    return (
        <div className="card">
            <h4>Distribuição do Estoque por Marca</h4>
            <Doughnut data={chartData} />
        </div>
    )
}
