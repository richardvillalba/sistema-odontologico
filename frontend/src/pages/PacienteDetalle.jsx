import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pacientesService, ubicacionesService, billingService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { calculateAge, formatDate } from '../utils/format';
import Odontograma3D from '../components/odontograma/Odontograma3D';
import PlanTratamiento from '../components/tratamientos/PlanTratamiento';
import HistoriaClinica from '../components/historia/HistoriaClinica';
import CuentaCorriente from '../components/facturacion/CuentaCorriente';

const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 font-medium";
const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1";

const ModalEditarPaciente = ({ paciente, onClose, onSuccess }) => {
    const { empresaActiva } = useAuth();
    const [tab, setTab] = useState('basico');
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        nombre: paciente.nombre || '',
        apellido: paciente.apellido || '',
        documento_tipo: paciente.documento_tipo || 'CI',
        documento_numero: paciente.documento_numero || '',
        fecha_nacimiento: paciente.fecha_nacimiento ? paciente.fecha_nacimiento.substring(0, 10) : '',
        genero: paciente.genero || '',
        telefono_principal: paciente.telefono_principal || '',
        telefono_secundario: paciente.telefono_secundario || '',
        email: paciente.email || '',
        direccion: paciente.direccion || '',
        departamento_id: paciente.departamento_id || '',
        ciudad_id: paciente.ciudad_id || '',
        barrio_id: paciente.barrio_id || '',
        grupo_sanguineo: paciente.grupo_sanguineo || '',
        alergias: paciente.alergias || '',
        contacto_emergencia_nombre: paciente.contacto_emergencia_nombre || '',
        contacto_emergencia_telefono: paciente.contacto_emergencia_telefono || '',
        contacto_emergencia_relacion: paciente.contacto_emergencia_relacion || '',
    });

    const { data: deptosRes } = useQuery({ queryKey: ['departamentos'], queryFn: () => ubicacionesService.getDepartamentos() });
    const { data: ciudadesRes } = useQuery({ queryKey: ['ciudades', form.departamento_id], queryFn: () => ubicacionesService.getCiudades(form.departamento_id), enabled: !!form.departamento_id });
    const { data: barriosRes } = useQuery({ queryKey: ['barrios', form.ciudad_id], queryFn: () => ubicacionesService.getBarrios(form.ciudad_id), enabled: !!form.ciudad_id });
    const departamentos = deptosRes?.data?.items || [];
    const ciudades = ciudadesRes?.data?.items || [];
    const barrios = barriosRes?.data?.items || [];

    const mutation = useMutation({
        mutationFn: (data) => pacientesService.update(paciente.paciente_id, data),
        onSuccess: (res) => {
            const resultado = res?.data?.resultado;
            if (resultado === 0) {
                setError(res?.data?.mensaje || 'Error al actualizar el paciente.');
                return;
            }
            onSuccess();
        },
        onError: (err) => setError(err?.response?.data?.mensaje || err.message || 'Error al actualizar.'),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'departamento_id') setForm(p => ({ ...p, departamento_id: value, ciudad_id: '', barrio_id: '' }));
        else if (name === 'ciudad_id') setForm(p => ({ ...p, ciudad_id: value, barrio_id: '' }));
        else setForm(p => ({ ...p, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        if (!form.nombre.trim() || !form.apellido.trim()) { setError('Nombre y apellido son obligatorios.'); return; }
        mutation.mutate({
            empresa_id: empresaActiva?.empresa_id,
            nombre: form.nombre.trim(),
            apellido: form.apellido.trim(),
            documento_tipo: form.documento_tipo,
            documento_numero: form.documento_numero.trim() || null,
            fecha_nacimiento: form.fecha_nacimiento || null,
            genero: form.genero || null,
            grupo_sanguineo: form.grupo_sanguineo || null,
            email: form.email.trim() || null,
            telefono_principal: form.telefono_principal.trim() || null,
            telefono_secundario: form.telefono_secundario.trim() || null,
            direccion: form.direccion.trim() || null,
            departamento_id: form.departamento_id || null,
            ciudad_id: form.ciudad_id || null,
            barrio_id: form.barrio_id || null,
            alergias: form.alergias.trim() || null,
            contacto_emergencia_nombre: form.contacto_emergencia_nombre.trim() || null,
            contacto_emergencia_telefono: form.contacto_emergencia_telefono.trim() || null,
            contacto_emergencia_relacion: form.contacto_emergencia_relacion.trim() || null,
        });
    };

    const tabs = [{ id: 'basico', label: 'Datos Básicos' }, { id: 'medico', label: 'Datos Médicos' }, { id: 'emergencia', label: 'Emergencia' }];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 sm:px-8 py-4 sm:py-6 text-white shrink-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Editar Paciente</h2>
                            <p className="text-indigo-200 text-sm font-medium mt-0.5 truncate max-w-[200px] sm:max-w-none">{paciente.nombre_completo}</p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-white/20 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="flex gap-1 mt-4 sm:mt-5 bg-white/10 p-1 rounded-xl overflow-x-auto no-scrollbar">
                        {tabs.map(t => (
                            <button key={t.id} type="button" onClick={() => setTab(t.id)}
                                className={`flex-1 min-w-[100px] py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-100 hover:text-white'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="px-6 sm:px-8 py-6 overflow-y-auto flex-1">
                        {error && (
                            <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-3">
                                <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                                <p className="text-sm text-rose-700 font-semibold">{error}</p>
                            </div>
                        )}
                        {tab === 'basico' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className={labelClass}>Nombre *</label><input type="text" name="nombre" value={form.nombre} onChange={handleChange} className={inputClass} /></div>
                                    <div><label className={labelClass}>Apellido *</label><input type="text" name="apellido" value={form.apellido} onChange={handleChange} className={inputClass} /></div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div><label className={labelClass}>Tipo Doc.</label>
                                        <select name="documento_tipo" value={form.documento_tipo} onChange={handleChange} className={inputClass}>
                                            <option value="CI">C.I.</option><option value="RUC">RUC</option><option value="PASAPORTE">Pasaporte</option><option value="DNI">DNI</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2"><label className={labelClass}>Nro. Documento</label><input type="text" name="documento_numero" value={form.documento_numero} onChange={handleChange} className={inputClass} /></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className={labelClass}>Fecha de Nacimiento</label><input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} className={inputClass} /></div>
                                    <div><label className={labelClass}>Género</label>
                                        <select name="genero" value={form.genero} onChange={handleChange} className={inputClass}>
                                            <option value="">-- Sin especificar --</option><option value="M">Masculino</option><option value="F">Femenino</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className={labelClass}>Teléfono Principal</label><input type="text" name="telefono_principal" value={form.telefono_principal} onChange={handleChange} className={inputClass} /></div>
                                    <div><label className={labelClass}>Teléfono Secundario</label><input type="text" name="telefono_secundario" value={form.telefono_secundario} onChange={handleChange} className={inputClass} /></div>
                                </div>
                                <div><label className={labelClass}>Correo Electrónico</label><input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} /></div>
                                <div><label className={labelClass}>Dirección</label><input type="text" name="direccion" value={form.direccion} onChange={handleChange} className={inputClass} /></div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div><label className={labelClass}>Departamento</label>
                                        <select name="departamento_id" value={form.departamento_id} onChange={handleChange} className={inputClass}>
                                            <option value="">-- Seleccionar --</option>
                                            {departamentos.map(d => <option key={d.departamento_id} value={d.departamento_id}>{d.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div><label className={labelClass}>Ciudad</label>
                                        <select name="ciudad_id" value={form.ciudad_id} onChange={handleChange} className={inputClass} disabled={!form.departamento_id}>
                                            <option value="">-- Seleccionar --</option>
                                            {ciudades.map(c => <option key={c.ciudad_id} value={c.ciudad_id}>{c.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div><label className={labelClass}>Barrio</label>
                                        <select name="barrio_id" value={form.barrio_id} onChange={handleChange} className={inputClass} disabled={!form.ciudad_id}>
                                            <option value="">-- Seleccionar --</option>
                                            {barrios.map(b => <option key={b.barrio_id} value={b.barrio_id}>{b.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                        {tab === 'medico' && (
                            <div className="space-y-4">
                                <div><label className={labelClass}>Grupo Sanguíneo</label>
                                    <select name="grupo_sanguineo" value={form.grupo_sanguineo} onChange={handleChange} className={inputClass}>
                                        <option value="">-- Desconocido --</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div><label className={labelClass}>Alergias conocidas</label>
                                    <textarea name="alergias" value={form.alergias} onChange={handleChange} className={`${inputClass} resize-none`} rows="5" placeholder="Ej: Penicilina, látex..." />
                                </div>
                            </div>
                        )}
                        {tab === 'emergencia' && (
                            <div className="space-y-4">
                                <div><label className={labelClass}>Nombre del Contacto</label><input type="text" name="contacto_emergencia_nombre" value={form.contacto_emergencia_nombre} onChange={handleChange} className={inputClass} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className={labelClass}>Teléfono de Contacto</label><input type="text" name="contacto_emergencia_telefono" value={form.contacto_emergencia_telefono} onChange={handleChange} className={inputClass} /></div>
                                    <div><label className={labelClass}>Relación</label>
                                        <select name="contacto_emergencia_relacion" value={form.contacto_emergencia_relacion} onChange={handleChange} className={inputClass}>
                                            <option value="">-- Seleccionar --</option>
                                            {['Cónyuge', 'Padre/Madre', 'Hijo/a', 'Hermano/a', 'Amigo/a', 'Otro'].map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="px-6 sm:px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                        <div className="flex gap-1.5 order-last sm:order-first">
                            {tabs.map(t => (
                                <div key={t.id} onClick={() => setTab(t.id)} className={`h-1.5 rounded-full cursor-pointer transition-all ${tab === t.id ? 'bg-indigo-600 w-5' : 'bg-slate-300 w-1.5'}`} />
                            ))}
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-6 py-2.5 text-slate-500 font-bold hover:text-slate-700 transition-colors text-sm">Cancelar</button>
                            <button type="submit" disabled={mutation.isPending} className="flex-1 sm:flex-none px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2 text-sm">
                                {mutation.isPending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Guardando...</> : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PacienteDetalle = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'info');
    const [showEditModal, setShowEditModal] = useState(false);

    // Sincronizar pestaña si cambian los parámetros de búsqueda (ej: al navegar desde Historias)
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Si el tab activo no está disponible por permisos, ir al primero disponible
    useEffect(() => {
        if (tabs.length > 0 && !tabs.some(t => t.id === activeTab)) {
            setActiveTab(tabs[0].id);
        }
    }, [tabs.length, activeTab]);

    // Función para cambiar de pestaña actualizando el URL
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    // Queries
    const { data: patientRes, isLoading: loadingPatient } = useQuery({
        queryKey: ['paciente', id],
        queryFn: () => pacientesService.getById(id),
    });

    const { data: cuentaRes } = useQuery({
        queryKey: ['cuenta-corriente', id],
        queryFn: () => billingService.getCuentaCorrientePaciente(id),
        enabled: !!id
    });

    const paciente = patientRes?.data?.items?.[0];
    const facturasPendientes = cuentaRes?.data?.items || [];
    const totalPendiente = facturasPendientes.reduce((acc, f) => acc + (f.saldo_pendiente || 0), 0);

    if (loadingPatient) return <div className="p-20 text-center animate-pulse font-bold text-slate-400">Cargando expediente...</div>;
    if (!paciente) return <div className="p-20 text-center text-rose-500 font-bold text-xl">Paciente no encontrado.</div>;

    const { tieneAccesoPrograma } = useAuth();

    const allTabs = [
        { id: 'info', label: 'Información Personal', icon: '👤', codigo: 'PAC_INFO' },
        { id: 'odontograma', label: 'Odontograma', icon: '🦷', codigo: 'PAC_ODONTOGRAMA' },
        { id: 'historia', label: 'Historia Clínica', icon: '📋', codigo: 'PAC_HISTORIA' },
        { id: 'tratamientos', label: 'Tratamientos', icon: '💊', codigo: 'PAC_TRATAMIENTOS' },
        { id: 'facturacion', label: 'Facturación / Pagos', icon: '💰', codigo: 'PAC_FACTURACION' },
        { id: 'archivos', label: 'Archivos / Rayos X', icon: '📁', codigo: 'PAC_ARCHIVOS' },
    ];

    const tabs = allTabs.filter(t => tieneAccesoPrograma(t.codigo));

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Cabecera del Expediente */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                    <div className="w-20 h-20 sm:w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl sm:text-4xl font-black text-primary border border-white/10 shrink-0">
                        {paciente.nombre?.charAt(0)}{paciente.apellido?.charAt(0)}
                    </div>
                    <div className="text-center md:text-left flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight truncate w-full sm:w-auto text-center sm:text-left">{paciente.nombre_completo}</h1>
                            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">ACTIVO</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 mt-3 text-slate-400 font-medium text-xs sm:text-sm">
                            <span className="flex items-center gap-2">🆔 {paciente.documento_numero}</span>
                            <span className="flex items-center gap-2">📂 HC: {paciente.numero_historia}</span>
                            <span className="flex items-center gap-2">🎂 {calculateAge(paciente.fecha_nacimiento)} años</span>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button onClick={() => setShowEditModal(true)} className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl font-bold transition-all text-sm">Editar Perfil</button>
                        <button className="flex-1 sm:flex-none bg-primary hover:bg-blue-600 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all text-sm">Nueva Cita</button>
                    </div>
                </div>
            </div>

            {/* Navegación por Pestañas */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 p-1 bg-slate-100 rounded-2xl w-full">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`px-4 sm:px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm ${activeTab === tab.id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        <span className="hidden xs:inline">{tab.label}</span>
                        {activeTab === tab.id && <span className="xs:hidden">{tab.label}</span>}
                    </button>
                ))}
            </div>

            {/* Contenido Dinámico */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm min-h-[400px]">
                        {activeTab === 'info' && (
                            <div className="space-y-8 animate-in slide-in-from-left-2 duration-300">
                                <h3 className="text-xl font-black text-slate-800">Detalles de Contacto</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fecha de Nacimiento</p>
                                        <p className="font-bold text-slate-700">{formatDate(paciente.fecha_nacimiento)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Género</p>
                                        <p className="font-bold text-slate-700">{paciente.genero === 'M' ? 'Masculino' : paciente.genero === 'F' ? 'Femenino' : '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Teléfono Principal</p>
                                        <p className="font-bold text-slate-700">{paciente.telefono_principal || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Teléfono Secundario</p>
                                        <p className="font-bold text-slate-700">{paciente.telefono_secundario || '—'}</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Correo Electrónico</p>
                                        <p className="font-bold text-slate-700">{paciente.email || '—'}</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dirección</p>
                                        <p className="font-bold text-slate-700">{paciente.direccion || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Departamento</p>
                                        <p className="font-bold text-slate-700">{paciente.departamento_nombre || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ciudad</p>
                                        <p className="font-bold text-slate-700">{paciente.ciudad_nombre || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Barrio</p>
                                        <p className="font-bold text-slate-700">{paciente.barrio_nombre || '—'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'odontograma' && <Odontograma3D />}

                        {activeTab === 'historia' && <HistoriaClinica pacienteId={id} paciente={paciente} />}

                        {activeTab === 'tratamientos' && <PlanTratamiento pacienteId={id} />}

                        {activeTab === 'facturacion' && <CuentaCorriente pacienteId={id} />}

                        {activeTab === 'archivos' && (
                            <div className="text-center py-40">
                                <div className="text-4xl mb-4">🏗️</div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest">Módulo en Desarrollo</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar del Expediente */}
                <div className="space-y-8">
                    {/* Alertas Críticas */}
                    <div className="bg-rose-600 rounded-3xl p-6 text-white shadow-xl">
                        <h4 className="font-black text-sm uppercase tracking-widest mb-4 opacity-80">Importante</h4>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚡</span>
                            <p className="text-sm font-bold leading-relaxed">
                                {paciente.alergias || 'No se han reportado alergias críticas para este paciente.'}
                            </p>
                        </div>
                    </div>

                    {/* Resumen de Cuenta */}
                    <div className={`rounded-3xl p-6 border shadow-sm transition-all duration-500 ${totalPendiente > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-200'}`}>
                        <h4 className="font-black text-sm uppercase text-slate-400 tracking-widest mb-6">Estado de Cuenta</h4>
                        <div className="space-y-4">
                            <div className={`flex justify-between items-center p-4 rounded-2xl transition-colors ${totalPendiente > 0 ? 'bg-white border border-rose-100 shadow-sm' : 'bg-slate-50'}`}>
                                <span className="text-xs font-bold text-slate-500">Saldo Pendiente</span>
                                <span className={`text-xl font-black ${totalPendiente > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {new Intl.NumberFormat('es-PY').format(totalPendiente)} Gs
                                </span>
                            </div>
                            <button
                                onClick={() => setActiveTab('facturacion')}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-slate-900/10"
                            >
                                Gestionar Pagos
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <ModalEditarPaciente
                    paciente={paciente}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        queryClient.invalidateQueries(['paciente', id]);
                    }}
                />
            )}
        </div>
    );
};

export default PacienteDetalle;
