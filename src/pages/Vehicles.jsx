import React, { useEffect, useState, useMemo } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'

const VEHICLES_KEY = 'idroove_vehicles'

const defaultSeed = {
    Manaus: [
        { id: 'M1', placa: 'AAA-1111', ano: 2022, marca: 'Toyota', modelo: 'Corolla', motorizacao: '2.0', cambio: 'Automático', kilometragem: 10000, direcao: 'Hidráulica', cor: 'Prata', portas: 4, combustivel: 'Gasolina', categoria: 'Sedan' },
        { id: 'M2', placa: 'BBB-2222', ano: 2021, marca: 'Honda', modelo: 'Civic', motorizacao: '1.5', cambio: 'Automático', kilometragem: 20000, direcao: 'Hidráulica', cor: 'Preto', portas: 4, combustivel: 'Gasolina', categoria: 'Sedan' }
    ],
    Fortaleza: [
        { id: 'F1', placa: 'CCC-3333', ano: 2020, marca: 'Ford', modelo: 'EcoSport', motorizacao: '1.5', cambio: 'Manual', kilometragem: 30000, direcao: 'Hidráulica', cor: 'Branco', portas: 4, combustivel: 'Flex', categoria: 'SUV' }
    ]
}

function loadVehiclesData() {
    try {
        // Support migration fallback from old key
        const raw = localStorage.getItem(VEHICLES_KEY) || localStorage.getItem('idroover_vehicles')
        if (!raw) {
            localStorage.setItem(VEHICLES_KEY, JSON.stringify(defaultSeed))
            return defaultSeed
        }
        return JSON.parse(raw)
    } catch (err) {
        localStorage.setItem(VEHICLES_KEY, JSON.stringify(defaultSeed))
        return defaultSeed
    }
}

function saveVehiclesData(obj) {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(obj))
}

export default function Vehicles() {
    const { selectedUnit } = useOutletContext()
    const [vehiclesData, setVehiclesData] = useState({})
    const [vehicles, setVehicles] = useState([])
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [perPage] = useState(5)
    const navigate = useNavigate()

    useEffect(() => {
        const data = loadVehiclesData()
        setVehiclesData(data)
    }, [])

    useEffect(() => {
        if (vehiclesData[selectedUnit]) setVehicles(vehiclesData[selectedUnit])
        else setVehicles([])
        setPage(1)
    }, [vehiclesData, selectedUnit])

    const filtered = useMemo(() => {
        if (!search) return vehicles
        const s = search.toLowerCase()
        return vehicles.filter(v => Object.values(v).some(val => String(val).toLowerCase().includes(s)))
    }, [vehicles, search])

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
    const segment = filtered.slice((page - 1) * perPage, page * perPage)

    const handleAdd = () => {
        navigate('/vehicles/new')
    }

    const handleEdit = (item) => {
        navigate(`/vehicles/${item.id}/edit`)
    }

    const handleDelete = (id) => {
        if (!window.confirm('Deseja excluir este veículo?')) return
        const updated = vehicles.filter(v => v.id !== id)
        const newData = { ...vehiclesData, [selectedUnit]: updated }
        setVehiclesData(newData)
        saveVehiclesData(newData)
    }

    // Forms are moved to a dedicated page for create/edit

    const exportCSV = () => {
        const rows = [
            ['Placa', 'Ano', 'Marca', 'Modelo', 'Motorização', 'Câmbio', 'Kilometragem', 'Direção', 'Cor', 'Portas', 'Combustível', 'Categoria'],
            ...filtered.map(v => [v.placa, v.ano, v.marca, v.modelo, v.motorizacao, v.cambio, v.kilometragem, v.direcao, v.cor, v.portas, v.combustivel, v.categoria])
        ]
        const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `vehicles_${selectedUnit}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const exportPDF = () => {
        const printable = document.getElementById('vehicles-printable')
        if (!printable) return alert('Erro ao exportar PDF')
        const w = window.open('', '_blank')
        w.document.write('<html><head><title>Exportar PDF</title>')
        w.document.write('<style>table{border-collapse:collapse;width:100%}td,th{padding:6px;border:1px solid #ddd}</style>')
        w.document.write('</head><body>')
        w.document.write('<h2>Veículos - ' + selectedUnit + '</h2>')
        w.document.write(printable.innerHTML)
        w.document.write('</body></html>')
        w.document.close()
        w.print()
    }

    const handlePageChange = (p) => { if (p >= 1 && p <= totalPages) setPage(p) }

    return (
        <div className="container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2>Gerenciamento de Veículos - {selectedUnit}</h2>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar veículos..." />
                    <button className="btn" onClick={handleAdd}>Adicionar</button>
                </div>
            </div>

            <div className="card vehicles-card">
                <div style={{ overflowX: 'visible' }}>
                    <div id="vehicles-printable" className="vehicles-table-wrap">
                        <table className="vehicles-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Placa</th><th>Ano</th><th>Marca</th><th>Modelo</th><th>Motorização</th><th>Câmbio</th><th>Km</th><th>Direção</th><th>Cor</th><th>Portas</th><th>Combustível</th><th>Categoria</th><th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {segment.length === 0 ? (
                                    <tr><td colSpan={13} style={{ textAlign: 'center' }}>Nenhum veículo encontrado</td></tr>
                                ) : (
                                    segment.map(v => (
                                        <tr key={v.id}>
                                            <td>{v.placa}</td>
                                            <td>{v.ano}</td>
                                            <td>{v.marca}</td>
                                            <td>{v.modelo}</td>
                                            <td>{v.motorizacao}</td>
                                            <td>{v.cambio}</td>
                                            <td>{v.kilometragem}</td>
                                            <td>{v.direcao}</td>
                                            <td>{v.cor}</td>
                                            <td>{v.portas}</td>
                                            <td>{v.combustivel}</td>
                                            <td>{v.categoria}</td>
                                            <td>
                                                <button title="Editar" aria-label="Editar" className="btn-icon btn-edit" onClick={() => handleEdit(v)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                                                </button>
                                                <button title="Excluir" aria-label="Excluir" className="btn-icon btn-delete" onClick={() => handleDelete(v.id)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Form moved to a dedicated page */}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <div>
                    <button className="btn" onClick={() => handlePageChange(page - 1)}>Anterior</button>
                    <span style={{ margin: '0 8px' }}>Página {page}/{totalPages}</span>
                    <button className="btn" onClick={() => handlePageChange(page + 1)}>Próxima</button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={exportPDF}>Exportar PDF</button>
                    <button className="btn" onClick={exportCSV}>Exportar Excel</button>
                </div>
            </div>
        </div>
    )
}
