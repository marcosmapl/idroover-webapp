import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const REVENUE_KEY = 'idroove_revenue'

function seedRevenue() {
    // seed per unit sample monthly data
    const months = [
        'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'
    ]
    return {
        Manaus: months.map((m, i) => ({ month: m, value: Math.round(100000 + Math.random() * 900000) })),
        Fortaleza: months.map((m, i) => ({ month: m, value: Math.round(50000 + Math.random() * 600000) }))
    }
}

function loadRevenue() {
    try {
        // Support both new and old key names for migration safety
        const raw = localStorage.getItem(REVENUE_KEY) || localStorage.getItem('idroove_revenue')
        if (!raw) {
            const seeded = seedRevenue()
            localStorage.setItem(REVENUE_KEY, JSON.stringify(seeded))
            return seeded
        }
        return JSON.parse(raw)
    } catch (err) {
        const seeded = seedRevenue()
        localStorage.setItem(REVENUE_KEY, JSON.stringify(seeded))
        return seeded
    }
}

export default function RevenueChart({ unit }) {
    const [data, setData] = useState([])
    useEffect(() => {
        const r = loadRevenue()
        if (r[unit]) setData(r[unit])
        else setData([])
    }, [unit])

    const chartData = {
        labels: data.map(d => d.month),
        datasets: [
            {
                label: 'Faturamento (R$)',
                data: data.map(d => d.value),
                borderColor: '#0067b8',
                backgroundColor: 'rgba(0,103,184,0.1)',
                fill: true,
            }
        ]
    }

    const options = {
        plugins: { legend: { display: true } },
        elements: { point: { radius: 4 } },
    }

    return (
        <div className="app-card">
            <h4>Faturamento</h4>
            <Line data={chartData} options={options} />
        </div>
    )
}
