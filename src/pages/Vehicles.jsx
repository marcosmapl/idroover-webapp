import React, { useEffect, useState, useMemo } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import * as api from '../services/api'
import { useToast } from '../components/ToastProvider'
import { Form, Button, Container } from 'react-bootstrap'
const VEHICLES_KEY = 'idroove_vehicles'

const defaultSeed = {
    Manaus: [
    ],
    Fortaleza: [
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
    const [perPage, setPerPage] = useState(() => Number(localStorage.getItem('vehicles_per_page')) || 10)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const { pushToast, setLoading, isLoading } = useToast()

    useEffect(() => {
        // Try to fetch from backend first
        let mounted = true
        setLoading(true)
        setError(null)
        api.getVehicles()
            .then((data) => {
                if (!mounted) return
                // normalize into units by codigoUnidade into names
                const byUnit = (data || []).reduce((acc, v) => {
                    const code = v.codigoUnidade || v.codigo_unidade || v.unidade || 0
                    acc[code] = acc[code] || []
                    acc[code].push(v)
                    return acc
                }, {})
                setVehiclesData(byUnit)
            })
            .catch((err) => {
                setError('Não foi possível carregar os dados do servidor. Usando dados locais.')
                pushToast('Não foi possível carregar os dados do servidor. Usando dados locais.', 'error')
                // fallback: localStorage seeded data
                const data = loadVehiclesData()
                setVehiclesData(data)
            })
            .finally(() => { if (mounted) setLoading(false) })
        return () => { mounted = false }
    }, [])

    useEffect(() => {
        // selectedUnit maps to numeric codes used in API (assumption)
        const unitMap = { Manaus: 1, Fortaleza: 2 }
        const code = unitMap[selectedUnit] || selectedUnit

        if (vehiclesData[selectedUnit]) setVehicles(vehiclesData[selectedUnit])
        else if (vehiclesData[code]) setVehicles(vehiclesData[code])
        else if (Array.isArray(vehiclesData) && vehiclesData.length > 0) {
            // if API returned flat array, filter by codigoUnidade
            setVehicles((vehiclesData || []).filter(v => (v.codigoUnidade || v.codigo_unidade || v.unidade) == code))
        }
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

    const handleDelete = async (id) => {
        if (!window.confirm('Deseja excluir este veículo?')) return
        // determine which key in vehiclesData holds the current unit list
        const unitMap = { Manaus: 1, Fortaleza: 2 }
        const code = unitMap[selectedUnit] || selectedUnit
        const keyToUse = vehiclesData[selectedUnit] ? selectedUnit : (vehiclesData[code] ? code : selectedUnit)

        try {
            setLoading(true)
            // try backend delete
            await api.deleteVehicle(id)
            const sourceList = vehiclesData[keyToUse] || []
            const updated = sourceList.filter(v => v.id !== id)
            const newData = { ...vehiclesData, [keyToUse]: updated }
            setVehiclesData(newData)
            // persist local copy as fallback cache
            saveVehiclesData(newData)
            pushToast('Veículo excluído com sucesso', 'success')
        } catch (err) {
            // fallback to local storage behavior
            const sourceList = vehiclesData[keyToUse] || vehicles
            const updated = sourceList.filter(v => v.id !== id)
            const newData = { ...vehiclesData, [keyToUse]: updated }
            setVehiclesData(newData)
            saveVehiclesData(newData)
            pushToast('Veículo removido localmente (API indisponível)', 'info')
        } finally {
            setLoading(false)
        }
    }

    // Forms are moved to a dedicated page for create/edit

    const exportCSV = () => {
        const rows = [
            ['Placa', 'Renavam', 'Ano', 'Marca', 'Modelo', 'Motorização', 'Tipo Câmbio', 'Kilometragem', 'Direção', 'Cor', 'Portas', 'Tipo Combustível', 'Categoria'],
            ...filtered.map(v => [v.placa, v.renavam || '-', v.ano, v.marca, v.modelo, v.motorizacao, v.tipoCambio || v.cambio, v.kilometragem, v.direcao, v.cor, v.portas, v.tipoCombustivel || v.combustivel, v.categoria])
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
        if (!printable) return pushToast('Erro ao exportar PDF', 'error')
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

    // Use context pushToast

    const handlePageChange = (p) => { if (p >= 1 && p <= totalPages) setPage(p) }

    return (
        <Container className="app-container">
            <div className="app-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
                <h2>Gerenciamento de Veículos - {selectedUnit}</h2>
            </div>

            {isLoading && <div style={{ marginBottom: 12, color: '#666' }}>Carregando dados...</div>}
            {error && <div style={{ marginBottom: 12, color: '#e55b5b' }}>{error}</div>}

            <div className="vehicles-controls">
                <div className="vehicles-left">
                    <label className="per-page-label">
                        Quantidade de Registros:
                        <select className="per-page-select select-style" value={perPage} onChange={(e) => { const v = Number(e.target.value); setPerPage(v); localStorage.setItem('vehicles_per_page', String(v)); setPage(1); }}>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </label>
                </div>
                <div className="vehicles-right">
                    <Form.Control value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar veículos..." style={{ minWidth: 220 }} />
                    <Button onClick={handleAdd}>Adicionar</Button>
                </div>
            </div>

            <div className="app-card vehicles-card">
                <div style={{ overflowX: 'visible' }}>
                    <div id="vehicles-printable" className="vehicles-table-wrap">
                        <table className="vehicles-table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Placa</th>
                                    <th>Renavam</th>
                                    <th>Ano</th>
                                    <th>Marca</th>
                                    <th>Modelo</th>
                                    <th>Motorização</th>
                                    <th>Tipo Câmbio</th>
                                    <th>Km</th>
                                    <th>Direção</th>
                                    <th>Cor</th>
                                    <th>Portas</th>
                                    <th>Combustível</th>
                                    <th>Categoria</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {segment.length === 0 ? (
                                    <tr><td colSpan={14} style={{ textAlign: 'center' }}>Nenhum veículo encontrado</td></tr>
                                ) : (
                                    segment.map(v => (
                                        <tr key={v.id || v.placa}>
                                            <td>{v.placa}</td>
                                            <td>{v.renavam || '-'}</td>
                                            <td>{v.ano}</td>
                                            <td>{v.marca}</td>
                                            <td>{v.modelo}</td>
                                            <td>{v.motorizacao}</td>
                                            <td>{v.tipoCambio}</td>
                                            <td>{v.kilometragem}</td>
                                            <td>{v.direcao}</td>
                                            <td>{v.cor}</td>
                                            <td>{v.portas}</td>
                                            <td>{v.tipoCombustivel || v.combustivel}</td>
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

            <div className="vehicles-footer">
                <div>
                    <Button onClick={() => handlePageChange(page - 1)}>Anterior</Button>
                    <span style={{ margin: '0 8px' }}>Página {page}/{totalPages}</span>
                    <Button onClick={() => handlePageChange(page + 1)}>Próxima</Button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button className="actions" onClick={exportPDF}>Exportar PDF</Button>
                    <Button className="actions" onClick={exportCSV}>Exportar Excel</Button>
                </div>
            </div>
            {/* Spinner and toasts are rendered by ToastProvider globally */}
        </Container>
    )
}
