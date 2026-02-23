import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pacientesService, ubicacionesService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { calculateAge, formatDate } from '../utils/format';

const FORM_INICIAL = {
    nombre: '',
    apellido: '',
    documento_tipo: 'CI',
    documento_numero: '',
    fecha_nacimiento: '',
    genero: '',
    telefono_principal: '',
    telefono_secundario: '',
    email: '',
    direccion: '',
    departamento_id: '',
    ciudad_id: '',
    barrio_id: '',
    grupo_sanguineo: '',
    alergias: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: ''
};

const ModalPaciente = ({ onClose, onSuccess, empresaId }) => {
    const { usuario } = useAuth();
    const [form, setForm] = useState(FORM_INICIAL);
    const [tab, setTab] = useState('basico');
    const [error, setError] = useState(null);

    const mutation = useMutation({
        mutationFn: (data) => pacientesService.create(data),
        onSuccess: (res) => {
            const resultado = res?.data?.resultado ?? res?.data?.items?.[0]?.resultado;
            if (resultado === 0 || resultado === -1) {
                setError(res?.data?.mensaje || res?.data?.items?.[0]?.mensaje || 'Error al registrar el paciente.');
                return;
            }
            onSuccess();
        },
        onError: (err) => {
            setError(err?.response?.data?.mensaje || err.message || 'Error al registrar el paciente.');
        }
    });

    const { data: deptosRes } = useQuery({
        queryKey: ['departamentos'],
        queryFn: () => ubicacionesService.getDepartamentos(),
    });
    const { data: ciudadesRes } = useQuery({
        queryKey: ['ciudades', form.departamento_id],
        queryFn: () => ubicacionesService.getCiudades(form.departamento_id),
        enabled: !!form.departamento_id,
    });
    const { data: barriosRes } = useQuery({
        queryKey: ['barrios', form.ciudad_id],
        queryFn: () => ubicacionesService.getBarrios(form.ciudad_id),
        enabled: !!form.ciudad_id,
    });
    const departamentos = deptosRes?.data?.items || [];
    const ciudades = ciudadesRes?.data?.items || [];
    const barrios = barriosRes?.data?.items || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'departamento_id') {
            setForm(prev => ({ ...prev, departamento_id: value, ciudad_id: '', barrio_id: '' }));
        } else if (name === 'ciudad_id') {
            setForm(prev => ({ ...prev, ciudad_id: value, barrio_id: '' }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        if (!form.nombre.trim() || !form.apellido.trim()) {
            setError('Nombre y apellido son obligatorios.');
            return;
        }
        if (!form.documento_numero.trim()) {
            setError('El número de documento es obligatorio.');
            return;
        }
        if (!form.fecha_nacimiento) {
            setError('La fecha de nacimiento es obligatoria.');
            return;
        }
        mutation.mutate({
            empresa_id: empresaId,
            nombre: form.nombre.trim(),
            apellido: form.apellido.trim(),
            documento_tipo: form.documento_tipo,
            documento_numero: form.documento_numero.trim(),
            fecha_nacimiento: form.fecha_nacimiento,
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
            registrado_por: usuario?.usuario_id,
        });
    };

    const tabs = [
        { id: 'basico', label: 'Datos Básicos' },
        { id: 'medico', label: 'Datos Médicos' },
        { id: 'emergencia', label: 'Emergencia' }
    ];

    const inputClass = "w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-surface-raised text-text-primary font-medium";
    const labelClass = "block text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="bg-primary px-4 sm:px-8 py-4 sm:py-6 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Registrar Nuevo Paciente</h2>
                            <p className="text-primary-100 text-sm font-medium mt-0.5">Complete los datos del paciente</p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-white/20 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-1 mt-5 bg-white/10 p-1 rounded-xl">
                        {tabs.map(t => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTab(t.id)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${tab === t.id ? 'bg-white text-primary shadow-sm' : 'text-primary-100 hover:text-white'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-4 sm:px-8 py-4 sm:py-6 max-h-[55vh] overflow-y-auto">
                        {error && (
                            <div className="mb-4 bg-danger-light/50 border border-danger-light rounded-xl px-4 py-3 flex items-center gap-3">
                                <svg className="w-4 h-4 text-danger flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                                <p className="text-sm text-danger-dark font-semibold">{error}</p>
                            </div>
                        )}

                        {/* TAB: Datos Básicos */}
                        {tab === 'basico' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Nombre *</label>
                                        <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className={inputClass} placeholder="Nombre(s)" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Apellido *</label>
                                        <input type="text" name="apellido" value={form.apellido} onChange={handleChange} className={inputClass} placeholder="Apellido(s)" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Tipo Doc. *</label>
                                        <select name="documento_tipo" value={form.documento_tipo} onChange={handleChange} className={inputClass}>
                                            <option value="CI">C.I.</option>
                                            <option value="RUC">RUC</option>
                                            <option value="PASAPORTE">Pasaporte</option>
                                            <option value="DNI">DNI</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className={labelClass}>Nro. Documento *</label>
                                        <input type="text" name="documento_numero" value={form.documento_numero} onChange={handleChange} className={inputClass} placeholder="12345678" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Fecha de Nacimiento *</label>
                                        <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Género</label>
                                        <select name="genero" value={form.genero} onChange={handleChange} className={inputClass}>
                                            <option value="">-- Sin especificar --</option>
                                            <option value="M">Masculino</option>
                                            <option value="F">Femenino</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Teléfono Principal</label>
                                        <input type="text" name="telefono_principal" value={form.telefono_principal} onChange={handleChange} className={inputClass} placeholder="0981 000-000" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Teléfono Secundario</label>
                                        <input type="text" name="telefono_secundario" value={form.telefono_secundario} onChange={handleChange} className={inputClass} placeholder="021 000-000" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Correo Electrónico</label>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="paciente@email.com" />
                                </div>
                                <div>
                                    <label className={labelClass}>Dirección</label>
                                    <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className={inputClass} placeholder="Av. Principal 123" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Departamento</label>
                                        <select name="departamento_id" value={form.departamento_id} onChange={handleChange} className={inputClass}>
                                            <option value="">-- Seleccionar --</option>
                                            {departamentos.map(d => (
                                                <option key={d.departamento_id} value={d.departamento_id}>{d.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Ciudad</label>
                                        <select name="ciudad_id" value={form.ciudad_id} onChange={handleChange} className={inputClass} disabled={!form.departamento_id}>
                                            <option value="">-- Seleccionar --</option>
                                            {ciudades.map(c => (
                                                <option key={c.ciudad_id} value={c.ciudad_id}>{c.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Barrio</label>
                                        <select name="barrio_id" value={form.barrio_id} onChange={handleChange} className={inputClass} disabled={!form.ciudad_id}>
                                            <option value="">-- Seleccionar --</option>
                                            {barrios.map(b => (
                                                <option key={b.barrio_id} value={b.barrio_id}>{b.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: Datos Médicos */}
                        {tab === 'medico' && (
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Grupo Sanguíneo</label>
                                    <select name="grupo_sanguineo" value={form.grupo_sanguineo} onChange={handleChange} className={inputClass}>
                                        <option value="">-- Desconocido --</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Alergias conocidas</label>
                                    <textarea
                                        name="alergias"
                                        value={form.alergias}
                                        onChange={handleChange}
                                        className={`${inputClass} resize-none`}
                                        rows="5"
                                        placeholder="Ej: Penicilina, látex, anestesia local..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* TAB: Contacto de Emergencia */}
                        {tab === 'emergencia' && (
                            <div className="space-y-4">
                                <p className="text-xs text-text-secondary opacity-60 font-medium bg-surface-raised rounded-xl p-3 border border-border">
                                    Esta información es opcional pero recomendada para situaciones de emergencia durante el tratamiento.
                                </p>
                                <div>
                                    <label className={labelClass}>Nombre del Contacto</label>
                                    <input type="text" name="contacto_emergencia_nombre" value={form.contacto_emergencia_nombre} onChange={handleChange} className={inputClass} placeholder="Nombre completo" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Teléfono de Contacto</label>
                                        <input type="text" name="contacto_emergencia_telefono" value={form.contacto_emergencia_telefono} onChange={handleChange} className={inputClass} placeholder="0981 000-000" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Relación</label>
                                        <select name="contacto_emergencia_relacion" value={form.contacto_emergencia_relacion} onChange={handleChange} className={inputClass}>
                                            <option value="">-- Seleccionar --</option>
                                            <option value="Cónyuge">Cónyuge</option>
                                            <option value="Padre/Madre">Padre/Madre</option>
                                            <option value="Hijo/a">Hijo/a</option>
                                            <option value="Hermano/a">Hermano/a</option>
                                            <option value="Amigo/a">Amigo/a</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 sm:px-8 py-4 sm:py-5 border-t border-border bg-surface-raised flex justify-between items-center">
                        <div className="flex gap-1.5">
                            {tabs.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className={`h-1.5 rounded-full cursor-pointer transition-all ${tab === t.id ? 'bg-primary w-5' : 'bg-border w-1.5'}`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 text-text-secondary font-bold hover:text-text-primary transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="px-8 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-border text-white rounded-xl font-black transition-all flex items-center gap-2"
                            >
                                {mutation.isPending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Registrando...
                                    </>
                                ) : 'Registrar Paciente'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Pacientes = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { usuario, empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['pacientes', searchTerm, empresaId],
        queryFn: () => searchTerm
            ? pacientesService.search(searchTerm, { empresa_id: empresaId })
            : pacientesService.getAll({ empresa_id: empresaId }),
    });

    const pacientes = data?.data?.items || [];

    const getAvatarColor = (name) => {
        const colors = ['bg-primary', 'bg-secondary', 'bg-indigo-500', 'bg-amber-500', 'bg-danger', 'bg-violet-500'];
        const index = name?.length % colors.length;
        return colors[index];
    };

    const handleSuccess = () => {
        setShowModal(false);
        queryClient.invalidateQueries(['pacientes']);
        setToast({ type: 'success', msg: 'Paciente registrado correctamente.' });
        setTimeout(() => setToast(null), 3500);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                    <span>{toast.type === 'success' ? '✓' : '✕'}</span>
                    {toast.msg}
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">Pacientes</h1>
                    <p className="text-text-secondary font-medium text-sm md:text-base">Gestiona la base de datos de tu clínica.</p>
                </div>
                <div className="flex gap-3">
                    <button className="hidden sm:flex bg-surface-card hover:bg-surface-raised text-text-secondary font-bold px-5 py-2.5 rounded-xl border border-border shadow-sm transition-all items-center gap-2">
                        📥 Exportar
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary hover:bg-primary-dark text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <span className="text-xl leading-none">+</span> <span className="hidden sm:inline">Registrar</span> Paciente
                    </button>
                </div>
            </div>

            {/* Search & Stats Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-surface-card p-2 rounded-2xl shadow-sm border border-border flex items-center gap-3">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, documento o número de historia..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-0 text-text-primary font-medium placeholder:text-text-secondary/40"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="bg-primary-dark rounded-2xl p-4 flex items-center justify-between text-white shadow-lg overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary-100/60">Total Pacientes</p>
                        <p className="text-2xl font-black text-white">{pacientes.length}</p>
                    </div>
                    <div className="text-3xl relative z-10">👥</div>
                    <div className="absolute -right-4 -bottom-4 bg-white/5 w-24 h-24 rounded-full"></div>
                </div>
            </div>

            {/* Table Content */}
            <div className="bg-surface-card rounded-3xl shadow-sm border border-border overflow-hidden">
                {isLoading ? (
                    <div className="p-24 text-center">
                        <div className="w-12 h-12 border-4 border-surface-raised border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-text-secondary opacity-60 font-black animate-pulse uppercase tracking-widest text-xs">Sincronizando pacientes...</p>
                    </div>
                ) : isError ? (
                    <div className="p-16 text-center">
                        <div className="bg-danger-light/30 text-danger-dark border border-danger-light p-6 rounded-2xl inline-block mb-4 font-bold">
                            ⚠️ Error de conexión: {error.message}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-raised border-b border-border">
                                        <th className="p-5 font-black text-[10px] text-text-secondary opacity-60 uppercase tracking-widest">Paciente</th>
                                        <th className="p-5 font-black text-[10px] text-text-secondary opacity-60 uppercase tracking-widest">Documento / HC</th>
                                        <th className="p-5 font-black text-[10px] text-text-secondary opacity-60 uppercase tracking-widest text-center">Edad</th>
                                        <th className="p-5 font-black text-[10px] text-text-secondary opacity-60 uppercase tracking-widest">Contacto</th>
                                        <th className="p-5 font-black text-[10px] text-text-secondary opacity-60 uppercase tracking-widest text-center">Estado</th>
                                        <th className="p-5 font-black text-[10px] text-text-secondary opacity-60 uppercase tracking-widest text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {pacientes.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="text-5xl opacity-20 filter grayscale">👥</div>
                                                    <p className="text-text-secondary opacity-40 font-black uppercase tracking-widest text-xs">No se encontraron pacientes</p>
                                                    {!searchTerm && (
                                                        <button
                                                            onClick={() => setShowModal(true)}
                                                            className="mt-4 px-8 py-3 bg-primary text-white rounded-xl font-black text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 uppercase tracking-widest"
                                                        >
                                                            Registrar el primer paciente
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        pacientes.map((p) => (
                                            <tr key={p.paciente_id} className="hover:bg-surface-raised transition-all group">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`${getAvatarColor(p.nombre)} w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-sm group-hover:scale-110 transition-transform`}>
                                                            {p.nombre?.charAt(0)}{p.apellido?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-text-primary group-hover:text-primary transition-colors">
                                                                {p.nombre_completo || `${p.nombre} ${p.apellido}`}
                                                            </div>
                                                            <div className="text-xs text-text-secondary opacity-60 font-medium">
                                                                {p.fecha_registro ? `Registrado ${formatDate(p.fecha_registro)}` : 'En el sistema'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="font-bold text-text-primary">{p.documento_numero || '-'}</div>
                                                    <div className="text-[10px] font-black text-text-secondary opacity-60 uppercase">{p.numero_historia || '-'}</div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <div className="font-bold text-text-primary">{calculateAge(p.fecha_nacimiento)} años</div>
                                                    <div className="text-[10px] font-black text-text-secondary opacity-60">{formatDate(p.fecha_nacimiento)}</div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="text-sm font-bold text-text-primary">{p.telefono_principal || 'Sin teléfono'}</div>
                                                    <div className="text-xs text-text-secondary opacity-60 truncate max-w-[150px]">{p.email || 'Sin correo'}</div>
                                                </td>
                                                <td className="p-5 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${p.activo === 'S'
                                                        ? 'bg-secondary-light text-secondary'
                                                        : 'bg-surface-raised text-text-secondary opacity-60'
                                                        }`}>
                                                        {p.activo === 'S' ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            className="p-2.5 bg-surface-card border border-border text-text-secondary opacity-60 hover:text-primary hover:bg-primary-light hover:border-primary/20 hover:shadow-md rounded-xl transition-all"
                                                            onClick={() => navigate(`/pacientes/${p.paciente_id}`)}
                                                            title="Ver Expediente"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        </button>
                                                        <button
                                                            className="p-2.5 bg-surface-card border border-border text-text-secondary opacity-60 hover:text-secondary hover:bg-secondary-light hover:border-secondary/20 hover:shadow-md rounded-xl transition-all"
                                                            onClick={() => navigate(`/citas`)}
                                                            title="Nueva Cita"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card layout */}
                        <div className="md:hidden divide-y divide-border">
                            {pacientes.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="text-5xl mb-3 opacity-20 filter grayscale">👥</div>
                                    <p className="text-text-secondary opacity-40 font-black uppercase tracking-widest text-[10px]">No hay pacientes</p>
                                    {!searchTerm && (
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest"
                                        >
                                            Registrar paciente
                                        </button>
                                    )}
                                </div>
                            ) : (
                                pacientes.map((p) => (
                                    <div
                                        key={p.paciente_id}
                                        className="p-4 hover:bg-surface-raised transition-all active:bg-surface-raised cursor-pointer"
                                        onClick={() => navigate(`/pacientes/${p.paciente_id}`)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`${getAvatarColor(p.nombre)} w-11 h-11 rounded-xl flex items-center justify-center text-white font-black shadow-sm shrink-0`}>
                                                {p.nombre?.charAt(0)}{p.apellido?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="font-bold text-text-primary truncate">
                                                        {p.nombre_completo || `${p.nombre} ${p.apellido}`}
                                                    </p>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${p.activo === 'S' ? 'bg-secondary-light text-secondary' : 'bg-surface-raised text-text-secondary opacity-60'}`}>
                                                        {p.activo === 'S' ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary opacity-60">
                                                    <span>📄 {p.documento_numero || '-'}</span>
                                                    <span>📱 {p.telefono_principal || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-[10px] text-text-secondary opacity-40">
                                                    <span>{calculateAge(p.fecha_nacimiento)} años</span>
                                                    <span>HC: {p.numero_historia || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modal de nuevo paciente */}
            {showModal && (
                <ModalPaciente
                    empresaId={empresaId}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default Pacientes;
