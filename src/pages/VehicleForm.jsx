import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import * as api from '../services/api'
import { useToast } from '../components/ToastProvider'
import { Form, Button, Row, Col } from 'react-bootstrap'

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
    const [unit] = useState(selectedUnit)
    const [form, setForm] = useState({ placa: '', renavam: '', ano: '', marca: '', modelo: '', categoria: '', cor: '', portas: '', motorizacao: '', tipoCambio: '', tipoCombustivel: '', direcao: '', kilometragem: '', situacaoLicenciamento: '', situacaoVeiculo: '' })
    const [editing, setEditing] = useState(false)
    const { pushToast, setLoading } = useToast()

    useEffect(() => {
        const data = loadVehiclesData()
        setVehiclesData(data)
        if (id) {
            // try to fetch single vehicle from API
            api.getVehicle(id)
                .then(found => {
                    if (found) {
                        setForm(found)
                        setEditing(true)
                        const codeToName = { 1: 'Manaus', 2: 'Fortaleza' }
                        const name = codeToName[found.codigoUnidade] || found.codigoUnidade || selectedUnit
                        setUnit(name)
                        return
                    }
                })
                .catch(() => {
                    // fallback to local storage search
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
                            const codeToName = { 1: 'Manaus', 2: 'Fortaleza' }
                            const name = codeToName[key] || key
                            setUnit(name)
                            return
                        }
                    }
                })
            return
        }
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
                // Map key (could be numeric code or name) back to unit name string
                const codeToName = { 1: 'Manaus', 2: 'Fortaleza' }
                const name = codeToName[key] || key
                setUnit(name)
                return
            }
        }
        // not found -> new
    }, [id, selectedUnit])

    const resetForm = () => setForm({ placa: '', renavam: '', ano: '', marca: '', modelo: '', categoria: '', cor: '', portas: '', motorizacao: '', tipoCambio: '', tipoCombustivel: '', direcao: '', kilometragem: '', situacaoLicenciamento: '', situacaoVeiculo: '' })

    const handleSave = (e) => {
        e.preventDefault()
        if (!form.placa) { pushToast('Placa é obrigatória', 'error'); return }
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

        // Build payload with allowed fields only (do not send id/createdAt/updatedAt)
        const payload = {
            placa: form.placa,
            renavam: form.renavam,
            ano: form.ano,
            marca: form.marca,
            modelo: form.modelo,
            categoria: form.categoria,
            cor: form.cor,
            portas: form.portas,
            motorizacao: form.motorizacao,
            tipoCombustivel: form.tipoCombustivel || form.combustivel,
            tipoCambio: form.tipoCambio,
            direcao: form.direcao,
            kilometragem: form.kilometragem,
            codigoUnidade: unit === 'Manaus' ? 1 : 2,
            situacaoLicenciamento: form.situacaoLicenciamento,
            situacaoVeiculo: form.situacaoVeiculo
        }

        if (editing) {
            const targetId = id || form.id
            setLoading(true)
            api.updateVehicle(targetId, payload)
                .then((res) => {
                    pushToast('Veículo atualizado com sucesso', 'success')
                    // update local cache with returned object when available
                    try {
                        const code = res?.codigoUnidade || res?.codigo_unidade || (unit === 'Manaus' ? 1 : 2)
                        const key = vehiclesData[code] ? code : unit
                        const list = (vehiclesData[key] || []).map(v => (v.id === (res.id || targetId) ? res : v))
                        const newData = { ...vehiclesData, [key]: list }
                        setVehiclesData(newData)
                        saveVehiclesData(newData)
                    } catch (e) { /* ignore cache update errors */ }
                    navigate('/vehicles')
                })
                .catch(() => { pushToast('Não foi possível atualizar o veículo', 'error'); navigate('/vehicles') })
                .finally(() => setLoading(false))
        } else {
            setLoading(true)
            api.createVehicle(payload)
                .then((res) => {
                    pushToast('Veículo criado com sucesso', 'success')
                    // add returned object to local cache when available
                    try {
                        const code = res?.codigoUnidade || res?.codigo_unidade || (unit === 'Manaus' ? 1 : 2)
                        const key = vehiclesData[code] ? code : unit
                        const list = [...(vehiclesData[key] || []), res]
                        const newData = { ...vehiclesData, [key]: list }
                        setVehiclesData(newData)
                        saveVehiclesData(newData)
                    } catch (e) { /* ignore */ }
                    navigate('/vehicles')
                })
                .catch(() => { pushToast('Não foi possível criar o veículo', 'error'); navigate('/vehicles') })
                .finally(() => setLoading(false))
        }
    }

    return (
        <div className="app-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2>{editing ? 'Editar Veículo' : 'Novo Veículo'} - {unit}</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" onClick={() => navigate('/vehicles')}>Voltar</Button>
                </div>
            </div>

            <div className='app-card'>
                <Form onSubmit={handleSave}>
                    <div className="form-section" style={{ marginBottom: 14 }}>
                        <h3 className="section-title">Informações Gerais</h3>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Placa</Form.Label>
                                    <Form.Control id="placa" value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Renavam</Form.Label>
                                    <Form.Control id="renavam" value={form.renavam} onChange={(e) => setForm({ ...form, renavam: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Ano</Form.Label>
                                    <Form.Control id="ano" value={form.ano} onChange={(e) => setForm({ ...form, ano: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Marca</Form.Label>
                                    <Form.Control id="marca" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Modelo</Form.Label>
                                    <Form.Control id="modelo" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Categoria</Form.Label>
                                    <Form.Control id="categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    <div className="form-section" style={{ marginBottom: 14 }}>
                        <h3 className="section-title">Especificações</h3>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Motorização</Form.Label>
                                    <Form.Control id="motorizacao" value={form.motorizacao} onChange={(e) => setForm({ ...form, motorizacao: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Tipo Câmbio</Form.Label>
                                    <Form.Control id="tipoCambio" value={form.tipoCambio} onChange={(e) => setForm({ ...form, tipoCambio: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Tipo Combustível</Form.Label>
                                    <Form.Select id="tipoCombustivel" value={form.tipoCombustivel} onChange={(e) => setForm({ ...form, tipoCombustivel: e.target.value })}>
                                        <option value="">-- Selecione --</option>
                                        <option value="Flex">Flex</option>
                                        <option value="Gasolina">Gasolina</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Elétrico">Elétrico</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Kilometragem</Form.Label>
                                    <Form.Control id="kilometragem" value={form.kilometragem} onChange={(e) => setForm({ ...form, kilometragem: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Direção</Form.Label>
                                    <Form.Control id="direcao" value={form.direcao} onChange={(e) => setForm({ ...form, direcao: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Portas</Form.Label>
                                    <Form.Control id="portas" value={form.portas} onChange={(e) => setForm({ ...form, portas: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Cor</Form.Label>
                                    <Form.Control id="cor" value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    <div className="form-section" style={{ marginBottom: 14 }}>
                        <h3 className="section-title">Situação</h3>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Situação do Veículo</Form.Label>
                                    <Form.Control id="situacaoVeiculo" value={form.situacaoVeiculo} onChange={(e) => setForm({ ...form, situacaoVeiculo: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Situação Licenciamento</Form.Label>
                                    <Form.Control id="situacaoLicenciamento" value={form.situacaoLicenciamento} onChange={(e) => setForm({ ...form, situacaoLicenciamento: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Unidade (fixa)</Form.Label>
                                    <Form.Control id="unidade" value={String(unit)} readOnly />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                        <Button variant="secondary" onClick={() => { resetForm(); navigate('/vehicles'); }}>Cancelar</Button>
                        <Button type='submit' variant="primary">Salvar</Button>
                    </div>
                </Form>
            </div>
        </div>
    )
}
