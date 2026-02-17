import { useState, useEffect, useCallback } from 'react';
import { cajaService, usersService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// ─── Modal: Crear / Editar Caja ───────────────────────────────────────────────
function ModalCaja({ caja, usuarios, empresaId, usuarioId, onClose, onSuccess }) {
    const esEdicion = !!caja;
    const [form, setForm] = useState({
        nombre: caja?.nombre || '',
        descripcion: caja?.descripcion || '',
        usuario_asignado_id: caja?.usuario_asignado_id || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nombre.trim()) { setError('El nombre es requerido'); return; }
        try {
            setLoading(true);
            const payload = {
                nombre: form.nombre.trim(),
                descripcion: form.descripcion.trim() || null,
                usuario_asignado_id: form.usuario_asignado_id ? parseInt(form.usuario_asignado_id) : null,
            };

            let res;
            if (esEdicion) {
                res = await cajaService.editar(caja.caja_id, {
                    ...payload,
                    modificado_por: usuarioId,
                });
            } else {
                res = await cajaService.crear({
                    ...payload,
                    empresa_id: empresaId,
                    creado_por: usuarioId,
                });
            }
            if (res.data.resultado === 1) {
                onSuccess(esEdicion ? 'Caja actualizada' : 'Caja creada');
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-900">
                        {esEdicion ? 'Editar Caja' : 'Nueva Caja'}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">
                        {esEdicion ? `Editando: ${caja.nombre}` : 'Registrar una nueva caja en la empresa'}
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Nombre *</label>
                        <input
                            type="text"
                            value={form.nombre}
                            onChange={e => { setForm(p => ({ ...p, nombre: e.target.value })); setError(''); }}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                            placeholder="Ej: Caja Principal, Caja N°2..."
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Descripción</label>
                        <textarea
                            value={form.descripcion}
                            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium resize-none"
                            placeholder="Descripción opcional"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Usuario Asignado
                        </label>
                        <select
                            value={form.usuario_asignado_id}
                            onChange={e => setForm(p => ({ ...p, usuario_asignado_id: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        >
                            <option value="">Sin asignación (acceso libre)</option>
                            {usuarios.map(u => (
                                <option key={u.usuario_id} value={u.usuario_id}>
                                    {u.nombre} {u.apellido} — @{u.username}
                                </option>
                            ))}
                        </select>
                        <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                            Si se asigna un usuario, solo ese usuario podrá operar la caja.
                        </p>
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
                            {loading ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Caja'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Modal: Confirmar eliminación ─────────────────────────────────────────────
// (En realidad no hay DELETE, solo mostrar info de que no se puede eliminar si está abierta)

// ─── Fila de caja ─────────────────────────────────────────────────────────────
function CajaRow({ caja, usuarios, onEditar }) {
    const isAbierta = caja.estado === 'ABIERTA';
    const usuario = usuarios.find(u => u.usuario_id === caja.usuario_asignado_id);

    return (
        <tr className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors group">
            {/* Nombre y descripción */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${isAbierta ? 'bg-emerald-100 shadow-sm shadow-emerald-100' : 'bg-slate-100 shadow-sm shadow-slate-50'}`}>
                        <svg className={`w-6 h-6 ${isAbierta ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-extrabold text-slate-900 leading-tight">{caja.nombre}</p>
                        {caja.descripcion && (
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1 truncate max-w-[250px]">{caja.descripcion}</p>
                        )}
                    </div>
                </div>
            </td>

            {/* Estado */}
            <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest ${isAbierta ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isAbierta ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    {isAbierta ? 'ABIERTA' : 'CERRADA'}
                </span>
            </td>

            {/* Usuario asignado */}
            <td className="px-6 py-4">
                {usuario ? (
                    <div className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-2xl border border-slate-100 pr-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                            <span className="text-xs font-black text-white">
                                {usuario.nombre?.[0]}{usuario.apellido?.[0]}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-slate-800 leading-tight">
                                {usuario.nombre} {usuario.apellido}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">@{usuario.username}</p>
                        </div>
                    </div>
                ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Acceso libre
                    </span>
                )}
            </td>

            {/* Acciones */}
            <td className="px-6 py-4 text-right">
                <button
                    onClick={() => onEditar(caja)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black text-slate-700 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm hover:shadow-md"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Editar Configuración
                </button>
            </td>
        </tr>
    );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function ConfiguracionCajas() {
    const { usuario, empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;
    const usuarioId = usuario?.usuario_id;

    const [cajas, setCajas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modal, setModal] = useState(null); // null | { modo: 'crear' } | { modo: 'editar', caja }
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const [cajasRes, usersRes] = await Promise.all([
                cajaService.listar(empresaId),
                usersService.getAll(),
            ]);
            setCajas(cajasRes.data.items || []);
            setUsuarios(usersRes.data.items || usersRes.data || []);
        } catch {
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    }, [empresaId]);

    useEffect(() => { cargarDatos(); }, [cargarDatos]);

    const handleSuccess = (msg) => {
        setModal(null);
        showToast(msg);
        cargarDatos();
    };

    const cajasAbiertas = cajas.filter(c => c.estado === 'ABIERTA').length;
    const cajasConUsuario = cajas.filter(c => c.usuario_asignado_id).length;

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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuración de Cajas</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Gestioná las cajas de la empresa y asigná usuarios responsables
                    </p>
                </div>
                <button
                    onClick={() => setModal({ modo: 'crear' })}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Caja
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Total Cajas', value: cajas.length, color: 'text-blue-700', bg: 'bg-blue-50', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                    { label: 'Abiertas ahora', value: cajasAbiertas, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'Con usuario asignado', value: cajasConUsuario, color: 'text-indigo-700', bg: 'bg-indigo-50', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-3xl p-6 border-2 border-white shadow-sm flex items-center gap-5 transition-all hover:shadow-md duration-300`}>
                        <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-2xl ${s.color}`}>
                            {s.value}
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{s.label}</p>
                            <div className="flex items-center gap-1">
                                <svg className={`w-3.5 h-3.5 ${s.color} opacity-60`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={s.icon} />
                                </svg>
                                <span className="text-xs font-bold text-slate-500">Métricas de red</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="font-black text-slate-900">Cajas registradas</h2>
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
                ) : cajas.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <p className="text-slate-700 font-black">No hay cajas registradas</p>
                        <p className="text-slate-400 text-sm font-medium mt-1 mb-5">Creá la primera caja de la empresa</p>
                        <button
                            onClick={() => setModal({ modo: 'crear' })}
                            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Crear caja
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    {['Caja', 'Estado', 'Usuario asignado', 'Acciones'].map((h, i) => (
                                        <th key={h} className={`px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest ${i === 3 ? 'text-right' : i === 1 ? 'text-center' : 'text-left'}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cajas.map(caja => (
                                    <CajaRow
                                        key={caja.caja_id}
                                        caja={caja}
                                        usuarios={usuarios}
                                        onEditar={(c) => setModal({ modo: 'editar', caja: c })}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <p className="font-black text-blue-900 text-sm">Sobre la asignación de usuarios</p>
                    <p className="text-blue-700 text-xs font-medium mt-1 leading-relaxed">
                        Una caja con <strong>acceso libre</strong> puede ser abierta por cualquier usuario con permisos de caja.
                        Si se asigna un <strong>usuario específico</strong>, solo ese usuario podrá abrir y operar esa caja.
                        Los administradores siempre pueden ver todas las cajas.
                    </p>
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <ModalCaja
                    caja={modal.modo === 'editar' ? modal.caja : null}
                    usuarios={usuarios}
                    empresaId={empresaId}
                    usuarioId={usuarioId}
                    onClose={() => setModal(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
