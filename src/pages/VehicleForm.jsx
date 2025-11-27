import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'

const VEHICLES_KEY = 'idroove_vehicles'

function loadVehiclesData() {
    try {
        const raw = localStorage.getItem(VEHICLES_KEY)
        if (!raw) return {}
        return JSON.parse(raw)
    } catch (err) {
        return {}
    }
}

function saveVehiclesData(obj) {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(obj))
}

export default function VehicleForm() {
    const { selectedUnit } = useOutletContext()
    const navigate = useNavigate()
    const { id } = useParams()
    const [vehiclesData, setVehiclesData] = useState({})
    const [unit, setUnit] = useState(selectedUnit)
    const [form, setForm] = useState({ placa: '', ano: '', marca: '', modelo: '', motorizacao: '', cambio: '', kilometragem: '', direcao: '', cor: '', portas: '', combustivel: '', categoria: '' })
    const [editing, setEditing] = useState(false)

    useEffect(() => {
        const data = loadVehiclesData()
        setVehiclesData(data)
        if (id) {
            // Try locate vehicle in the selected unit first
            if (data[selectedUnit]) {
                const found = data[selectedUnit].find(v => v.id === id)
                if (found) {
                    setForm(found)
                    setEditing(true)
                    setUnit(selectedUnit)
                    return
                }
            }
            // else look across all units
            for (const key of Object.keys(data)) {
                const found = data[key].find(v => v.id === id)
                if (found) {
                    setForm(found)
                    setEditing(true)
                    setUnit(key)
                    return
                }
            }
            // not found -> new
        }
    }, [id, selectedUnit])

    const resetForm = () => setForm({ placa: '', ano: '', marca: '', modelo: '', motorizacao: '', cambio: '', kilometragem: '', direcao: '', cor: '', portas: '', combustivel: '', categoria: '' })

    const handleSave = (e) => {
        e.preventDefault()
        if (!form.placa) return alert('Placa é obrigatória')
        const data = { ...vehiclesData }
        const list = data[unit] ? [...data[unit]] : []
        if (editing) {
            const updated = list.map(v => v.id === id ? { ...form, id } : v)
            data[unit] = updated
        } else {
            const newId = 'V' + Date.now()
            data[unit] = [...list, { ...form, id: newId }]
        }
        setVehiclesData(data)
        saveVehiclesData(data)
        navigate('/vehicles')
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2>{editing ? 'Editar Veículo' : 'Novo Veículo'} - {unit}</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className='btn' onClick={() => navigate('/vehicles')}>Voltar</button>
                </div>
            </div>

            <div className='card'>
                <form onSubmit={handleSave}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                        <div style={{ color: '#666' }}>Unidade:</div>
                        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                            <option value='Manaus'>Manaus</option>
                            <option value='Fortaleza'>Fortaleza</option>
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                        <input placeholder='Placa' value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value })} />
                        <input placeholder='Ano' value={form.ano} onChange={(e) => setForm({ ...form, ano: e.target.value })} />
                        <input placeholder='Marca' value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
                        <input placeholder='Modelo' value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
                        <input placeholder='Motorização' value={form.motorizacao} onChange={(e) => setForm({ ...form, motorizacao: e.target.value })} />
                        <input placeholder='Câmbio' value={form.cambio} onChange={(e) => setForm({ ...form, cambio: e.target.value })} />
                        <input placeholder='Kilometragem' value={form.kilometragem} onChange={(e) => setForm({ ...form, kilometragem: e.target.value })} />
                        <input placeholder='Direção' value={form.direcao} onChange={(e) => setForm({ ...form, direcao: e.target.value })} />
                        <input placeholder='Cor' value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} />
                        <input placeholder='Portas' value={form.portas} onChange={(e) => setForm({ ...form, portas: e.target.value })} />
                        <input placeholder='Combustível' value={form.combustivel} onChange={(e) => setForm({ ...form, combustivel: e.target.value })} />
                        <input placeholder='Categoria' value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                        <button type='button' className='btn' onClick={() => { resetForm(); navigate('/vehicles'); }}>Cancelar</button>
                        <button type='submit' className='btn primary'>Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
