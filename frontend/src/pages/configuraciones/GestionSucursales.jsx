import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sucursalesService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AsignacionUsuarioSucursal from '../../components/configuraciones/AsignacionUsuarioSucursal';

// ─── Modal: Crear / Editar Sucursal ──────────────────────────────────────────
function ModalSucursal({ sucursal, empresaId, usuarioId, onClose, onSuccess }) {
    const esEdicion = !!sucursal;
    const [form, setForm] = useState({
        nombre: sucursal?.nombre || '',
        direccion: sucursal?.direccion || '',
        telefono: sucursal?.telefono || '',
        email: sucursal?.email || '',
        ciudad: sucursal?.ciudad || '',
        es_principal: sucursal?.es_principal || 'N',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nombre.trim()) { setError('El nombre es requerido'); return; }

        try {
            setLoading(true);
            let res;
            if (esEdicion) {
                res = await sucursalesService.update(sucursal.sucursal_id, {
                    nombre: form.nombre.trim(),
                    direccion: form.direccion.trim() || null,
                    telefono: form.telefono.trim() || null,
                    email: form.email.trim() || null,
                    ciudad: form.ciudad.trim() || null,
                    modificado_por: usuarioId,
                });
            } else {
                res = await sucursalesService.create({
                    empresa_id: empresaId,
                    nombre: form.nombre.trim(),
                    direccion: form.direccion.trim() || null,
                    telefono: form.telefono.trim() || null,
                    email: form.email.trim() || null,
                    ciudad: form.ciudad.trim() || null,
                    es_principal: form.es_principal,
                    creado_por: usuarioId,
                });
            }

            if (res.data.resultado === 1) {
                onSuccess(esEdicion ? 'Sucursal actualizada' : 'Sucursal creada exitosamente');
            } else {
                setError(res.data.mensaje || 'Error al guardar');
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
                    <h2 className="text-xl font-black text-slate-900">
                        {esEdicion ? 'Editar Sucursal' : 'Nueva Sucursal'}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                        {esEdicion ? `Editando: ${sucursal.nombre}` : 'Registrar una nueva sucursal'}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {esEdicion && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Código</label>
                                <input
                                    type="text"
                                    value={sucursal?.codigo || ''}
                                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium font-mono cursor-not-allowed"
                                    disabled
                                />
                                <p className="text-[11px] text-slate-400 mt-1">El código se asigna automáticamente</p>
                            </div>
                        )}
                        <div className={esEdicion ? '' : 'md:col-span-2'}>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Nombre *</label>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={e => { setForm(p => ({ ...p, nombre: e.target.value })); setError(''); }}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                placeholder="Ej: Sucursal Centro"
                                autoFocus
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Dirección</label>
                            <input
                                type="text"
                                value={form.direccion}
                                onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                placeholder="Dirección de la sucursal"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5">Ciudad</label>
                            <input
                                type="text"
                                value={form.ciudad}
                                onChange={e => setForm(p => ({ ...p, ciudad: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                placeholder="Ej: Asunción"
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
                                placeholder="sucursal@email.com"
                            />
                        </div>
                        {!esEdicion && (
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.es_principal === 'S'}
                                        onChange={e => setForm(p => ({ ...p, es_principal: e.target.checked ? 'S' : 'N' }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                                <span className="text-sm font-bold text-slate-700">Sucursal Principal</span>
                            </div>
                        )}
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
                            {loading ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Sucursal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function GestionSucursales() {
    const { usuario, empresaActiva } = useAuth();
    const [searchParams] = useSearchParams();
    const usuarioId = usuario?.usuario_id;

    // Tomar empresa_id de query param o de la empresa activa
    const empresaId = searchParams.get('empresa_id')
        ? parseInt(searchParams.get('empresa_id'))
        : empresaActiva?.empresa_id;

    const [sucursales, setSucursales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modal, setModal] = useState(null); // null | { modo: 'crear' } | { modo: 'editar', sucursal }
    const [asignacionSucursal, setAsignacionSucursal] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const cargarSucursales = useCallback(async () => {
        if (!empresaId) return;
        try {
            setLoading(true);
            setError('');
            const res = await sucursalesService.getAll(empresaId);
            setSucursales(res.data.items || []);
        } catch {
            setError('Error al cargar las sucursales');
        } finally {
            setLoading(false);
        }
    }, [empresaId]);

    useEffect(() => { cargarSucursales(); }, [cargarSucursales]);

    const handleToggleStatus = async (sucursal) => {
        const nuevoEstado = sucursal.activo === 'S' ? 'N' : 'S';
        try {
            const res = await sucursalesService.toggleStatus(sucursal.sucursal_id, nuevoEstado, usuarioId);
            if (res.data.resultado === 1) {
                showToast(res.data.mensaje);
                cargarSucursales();
            } else {
                showToast(res.data.mensaje || 'Error', 'error');
            }
        } catch {
            showToast('Error de conexión', 'error');
        }
    };

    const handleSuccess = (msg) => {
        setModal(null);
        showToast(msg);
        cargarSucursales();
    };

    const activas = sucursales.filter(s => s.activo === 'S').length;
    const totalUsuarios = sucursales.reduce((sum, s) => sum + (s.total_usuarios || 0), 0);

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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Sucursales</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Sucursales de la empresa activa
                    </p>
                </div>
                <button
                    onClick={() => setModal({ modo: 'crear' })}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Sucursal
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Total Sucursales', value: sucursales.length, color: 'text-blue-700', bg: 'bg-blue-50' },
                    { label: 'Activas', value: activas, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                    { label: 'Usuarios Asignados', value: totalUsuarios, color: 'text-indigo-700', bg: 'bg-indigo-50' },
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
                    <h2 className="font-black text-slate-900">Sucursales registradas</h2>
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
                ) : sucursales.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p className="text-slate-700 font-black">No hay sucursales registradas</p>
                        <p className="text-slate-400 text-sm font-medium mt-1 mb-5">Creá la primera sucursal de esta empresa</p>
                        <button
                            onClick={() => setModal({ modo: 'crear' })}
                            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Crear sucursal
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {['Sucursal', 'Código', 'Ciudad', 'Usuarios', 'Principal', 'Estado', 'Acciones'].map((h, i) => (
                                        <th key={h} className={`px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest ${i >= 4 ? 'text-center' : 'text-left'} ${i === 6 ? 'text-right' : ''}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sucursales.map(suc => (
                                    <tr key={suc.sucursal_id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${suc.activo === 'S' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                                    <svg className={`w-6 h-6 ${suc.activo === 'S' ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-slate-900 leading-tight">{suc.nombre}</p>
                                                    {suc.direccion && (
                                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate max-w-[200px]">{suc.direccion}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-sm font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">{suc.codigo}</span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                                            {suc.ciudad || '-'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold">
                                                {suc.total_usuarios || 0}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {suc.es_principal === 'S' ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black border border-amber-200">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    PRINCIPAL
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(suc)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 ${suc.activo === 'S'
                                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${suc.activo === 'S' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                                {suc.activo === 'S' ? 'Activa' : 'Inactiva'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setAsignacionSucursal(suc)}
                                                    className="px-3 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                                                >
                                                    Usuarios
                                                </button>
                                                <button
                                                    onClick={() => setModal({ modo: 'editar', sucursal: suc })}
                                                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                    Editar
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
            {modal && (
                <ModalSucursal
                    sucursal={modal.modo === 'editar' ? modal.sucursal : null}
                    empresaId={empresaId}
                    usuarioId={usuarioId}
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                />
            )}

            {asignacionSucursal && (
                <AsignacionUsuarioSucursal
                    sucursal={asignacionSucursal}
                    onClose={() => { setAsignacionSucursal(null); cargarSucursales(); }}
                />
            )}
        </div>
    );
}
