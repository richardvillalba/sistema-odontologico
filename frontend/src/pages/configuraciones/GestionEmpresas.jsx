import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { empresasService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AsignacionUsuarioEmpresa from '../../components/configuraciones/AsignacionUsuarioEmpresa';

// ─── Modal: Crear Empresa ────────────────────────────────────────────────────
function ModalEmpresa({ onClose, onSuccess, usuarioId }) {
    const [form, setForm] = useState({
        razon_social: '',
        nombre_comercial: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.razon_social.trim()) { setError('La razón social es requerida'); return; }
        if (!form.nombre_comercial.trim()) { setError('El nombre comercial es requerido'); return; }
        if (!form.ruc.trim()) { setError('El RUC es requerido'); return; }

        try {
            setLoading(true);
            const res = await empresasService.create({
                razon_social: form.razon_social.trim(),
                nombre_comercial: form.nombre_comercial.trim(),
                ruc: form.ruc.trim(),
                direccion: form.direccion.trim() || null,
                telefono: form.telefono.trim() || null,
                email: form.email.trim() || null,
                creado_por: usuarioId,
            });
            if (res.data.resultado === 1) {
                onSuccess('Empresa creada exitosamente');
            } else {
                setError(res.data.mensaje || 'Error al crear la empresa');
            }
        } catch {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-900">Nueva Empresa</h2>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                        Registrar una nueva empresa en el sistema
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Razón Social *</label>
                            <input
                                type="text"
                                value={form.razon_social}
                                onChange={e => { setForm(p => ({ ...p, razon_social: e.target.value })); setError(''); }}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                placeholder="Ej: Clínica Odontológica S.A."
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Nombre Comercial *</label>
                            <input
                                type="text"
                                value={form.nombre_comercial}
                                onChange={e => { setForm(p => ({ ...p, nombre_comercial: e.target.value })); setError(''); }}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                placeholder="Ej: OdontoPro"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">RUC *</label>
                            <input
                                type="text"
                                value={form.ruc}
                                onChange={e => { setForm(p => ({ ...p, ruc: e.target.value })); setError(''); }}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                placeholder="Ej: 80012345-6"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Dirección</label>
                            <input
                                type="text"
                                value={form.direccion}
                                onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                placeholder="Dirección de la empresa"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Teléfono</label>
                            <input
                                type="text"
                                value={form.telefono}
                                onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                placeholder="+595..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                placeholder="empresa@email.com"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Creando...' : 'Crear Empresa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function GestionEmpresas() {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const usuarioId = usuario?.usuario_id;

    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [asignacionEmpresa, setAsignacionEmpresa] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const cargarEmpresas = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const res = await empresasService.getAll();
            setEmpresas(res.data.items || []);
        } catch {
            setError('Error al cargar las empresas');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { cargarEmpresas(); }, [cargarEmpresas]);

    const handleToggleStatus = async (empresa) => {
        const nuevoEstado = empresa.activo === 'S' ? 'N' : 'S';
        try {
            const res = await empresasService.toggleStatus(empresa.empresa_id, nuevoEstado, usuarioId);
            if (res.data.resultado === 1) {
                showToast(res.data.mensaje);
                cargarEmpresas();
            } else {
                showToast(res.data.mensaje || 'Error', 'error');
            }
        } catch {
            showToast('Error de conexión', 'error');
        }
    };

    const handleSuccess = (msg) => {
        setShowModal(false);
        showToast(msg);
        cargarEmpresas();
    };

    const activas = empresas.filter(e => e.activo === 'S').length;
    const totalSucursales = empresas.reduce((s, e) => s + (e.total_sucursales || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-bold flex items-center gap-3 ${toast.type === 'success'
                    ? 'bg-white border-emerald-200 text-emerald-800'
                    : 'bg-white border-red-200 text-red-800'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Empresas</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Administración de empresas registradas en el sistema
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Empresa
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Total Empresas', value: empresas.length, color: 'text-blue-700', bg: 'bg-blue-50' },
                    { label: 'Activas', value: activas, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                    { label: 'Total Sucursales', value: totalSucursales, color: 'text-indigo-700', bg: 'bg-indigo-50' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-3xl p-6 border-2 border-white shadow-sm flex items-center gap-5`}>
                        <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-2xl ${s.color}`}>
                            {s.value}
                        </div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="font-black text-slate-900">Empresas registradas</h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <svg className="animate-spin h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : error ? (
                    <div className="py-10 text-center text-red-600 font-bold">{error}</div>
                ) : empresas.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <p className="text-slate-700 font-black">No hay empresas registradas</p>
                        <p className="text-slate-400 text-sm font-medium mt-1 mb-5">Creá la primera empresa del sistema</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Crear empresa
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {['Empresa', 'RUC', 'Sucursales', 'Usuarios', 'Estado', 'Acciones'].map((h, i) => (
                                        <th key={h} className={`px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest ${i >= 4 ? 'text-center' : 'text-left'} ${i === 5 ? 'text-right' : ''}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {empresas.map(empresa => (
                                    <tr key={empresa.empresa_id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${empresa.activo === 'S' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                                    <svg className={`w-6 h-6 ${empresa.activo === 'S' ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-slate-900 leading-tight">{empresa.nombre_comercial}</p>
                                                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{empresa.razon_social}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-sm font-bold text-slate-600">{empresa.ruc}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => navigate(`/configuraciones/sucursales?empresa_id=${empresa.empresa_id}`)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {empresa.total_sucursales} {empresa.total_sucursales === 1 ? 'sucursal' : 'sucursales'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                {empresa.total_usuarios}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(empresa)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 ${empresa.activo === 'S'
                                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${empresa.activo === 'S' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                                {empresa.activo === 'S' ? 'Activa' : 'Inactiva'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setAsignacionEmpresa(empresa)}
                                                    className="px-3 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                                                >
                                                    Usuarios
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/configuraciones/sucursales?empresa_id=${empresa.empresa_id}`)}
                                                    className="px-3 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
                                                >
                                                    Sucursales
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <ModalEmpresa
                    usuarioId={usuarioId}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleSuccess}
                />
            )}

            {asignacionEmpresa && (
                <AsignacionUsuarioEmpresa
                    empresa={asignacionEmpresa}
                    onClose={() => { setAsignacionEmpresa(null); cargarEmpresas(); }}
                />
            )}
        </div>
    );
}
