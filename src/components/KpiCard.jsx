import React from 'react'

export default function KpiCard({ label, value, small }) {
    return (
        <div className="kpi-card app-card" style={{ minWidth: 180 }}>
            <div style={{ fontSize: small ? '0.9rem' : '1rem', color: '#666' }}>{label}</div>
            <div style={{ fontSize: small ? '1.4rem' : '2rem', fontWeight: 700 }}>{value}</div>
        </div>
    )
}
