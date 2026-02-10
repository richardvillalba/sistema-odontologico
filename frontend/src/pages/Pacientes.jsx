import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pacientesService } from '../services/api';
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
    grupo_sanguineo: '',
    alergias: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: ''
};

const ModalPaciente = ({ onClose, onSuccess, empresaId }) => {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
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
            alergias: form.alergias.trim() || null,
            contacto_emergencia_nombre: form.contacto_emergencia_nombre.trim() || null,
            contacto_emergencia_telefono: form.contacto_emergencia_telefono.trim() || null,
            contacto_emergencia_relacion: form.contacto_emergencia_relacion.trim() || null,
        });
    };

    const tabs = [
        { id: 'basico', label: 'Datos Básicos' },
        { id: 'medico', label: 'Datos Médicos' },
        { id: 'emergencia', label: 'Emergencia' }
    ];

    const inputClass = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-800 font-medium";
    const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1";

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Registrar Nuevo Paciente</h2>
                            <p className="text-blue-200 text-sm font-medium mt-0.5">Complete los datos del paciente</p>
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
                                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                                    tab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100 hover:text-white'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-8 py-6 max-h-[55vh] overflow-y-auto">
                        {error && (
                            <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-3">
                                <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                                <p className="text-sm text-rose-700 font-semibold">{error}</p>
                            </div>
                        )}

                        {/* TAB: Datos Básicos */}
                        {tab === 'basico' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Nombre *</label>
                                        <input type="text" name="nombre" value={form.nombre} onChange={handleChange} className={inputClass} placeholder="Nombre(s)" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Apellido *</label>
                                        <input type="text" name="apellido" value={form.apellido} onChange={handleChange} className={inputClass} placeholder="Apellido(s)" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
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
                                <div className="grid grid-cols-2 gap-4">
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
                                <div className="grid grid-cols-2 gap-4">
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
                                    <input type="text" name="direccion" value={form.direccion} onChange={handleChange} className={inputClass} placeholder="Av. Principal 123, Asunción" />
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
                                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => (
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
                                <p className="text-xs text-slate-400 font-medium bg-slate-50 rounded-xl p-3">
                                    Esta información es opcional pero recomendada para situaciones de emergencia durante el tratamiento.
                                </p>
                                <div>
                                    <label className={labelClass}>Nombre del Contacto</label>
                                    <input type="text" name="contacto_emergencia_nombre" value={form.contacto_emergencia_nombre} onChange={handleChange} className={inputClass} placeholder="Nombre completo" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                    <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <div className="flex gap-1.5">
                            {tabs.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className={`h-1.5 rounded-full cursor-pointer transition-all ${tab === t.id ? 'bg-blue-600 w-5' : 'bg-slate-300 w-1.5'}`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-black transition-all flex items-center gap-2"
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
    const { usuario } = useAuth();
    const empresaId = usuario?.empresa_id || 1;
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['pacientes', searchTerm, empresaId],
        queryFn: () => searchTerm
            ? pacientesService.search(searchTerm)
            : pacientesService.getAll({ empresa_id: empresaId }),
    });

    const pacientes = data?.data?.items || [];

    const getAvatarColor = (name) => {
        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pacientes</h1>
                    <p className="text-slate-500 font-medium">Gestiona la base de datos de tu clínica de manera eficiente.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2">
                        📥 Exportar
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <span className="text-xl leading-none">+</span> Registrar Paciente
                    </button>
                </div>
            </div>

            {/* Search & Stats Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, documento o número de historia..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-0 text-slate-600 font-medium placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pacientes</p>
                        <p className="text-2xl font-black">{pacientes.length}</p>
                    </div>
                    <div className="text-3xl relative z-10">👥</div>
                    <div className="absolute -right-4 -bottom-4 bg-white/5 w-24 h-24 rounded-full"></div>
                </div>
            </div>

            {/* Table Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-24 text-center">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400 font-bold animate-pulse">Sincronizando pacientes...</p>
                    </div>
                ) : isError ? (
                    <div className="p-16 text-center">
                        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl inline-block mb-4">
                            ⚠️ Error de conexión: {error.message}
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Paciente</th>
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Documento / HC</th>
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Edad</th>
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Contacto</th>
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Estado</th>
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pacientes.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="text-5xl">👥</div>
                                                <p className="text-slate-400 font-bold">No se encontraron pacientes</p>
                                                {!searchTerm && (
                                                    <button
                                                        onClick={() => setShowModal(true)}
                                                        className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                                                    >
                                                        + Registrar el primer paciente
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    pacientes.map((p) => (
                                        <tr key={p.paciente_id} className="hover:bg-slate-50/80 transition-all group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`${getAvatarColor(p.nombre)} w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-sm group-hover:scale-110 transition-transform`}>
                                                        {p.nombre?.charAt(0)}{p.apellido?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                            {p.nombre_completo || `${p.nombre} ${p.apellido}`}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-medium">
                                                            {p.fecha_registro ? `Registrado ${formatDate(p.fecha_registro)}` : 'En el sistema'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-bold text-slate-700">{p.documento_numero || '-'}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase">{p.numero_historia || '-'}</div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className="font-bold text-slate-700">{calculateAge(p.fecha_nacimiento)} años</div>
                                                <div className="text-[10px] font-black text-slate-400">{formatDate(p.fecha_nacimiento)}</div>
                                            </td>
                                            <td className="p-5">
                                                <div className="text-sm font-bold text-slate-700">{p.telefono_principal || 'Sin teléfono'}</div>
                                                <div className="text-xs text-slate-500 truncate max-w-[150px]">{p.email || 'Sin correo'}</div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${p.activo === 'S'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {p.activo === 'S' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-white hover:bg-blue-600 hover:border-blue-600 hover:shadow-md rounded-xl transition-all"
                                                        onClick={() => navigate(`/pacientes/${p.paciente_id}`)}
                                                        title="Ver Expediente"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-white hover:bg-emerald-600 hover:border-emerald-600 hover:shadow-md rounded-xl transition-all"
                                                        onClick={() => navigate(`/citas`)}
                                                        title="Nueva Cita"
                                                    >
                                                        📅
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
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
