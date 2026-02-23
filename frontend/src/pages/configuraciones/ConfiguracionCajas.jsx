import { useState, useEffect, useCallback } from 'react';
import { cajaService, empresasService } from '../../services/api';
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
                onSuccess(esEdicion ? 'Caja actualizada exitosamente' : 'Caja creada exitosamente');
            } else {
                setError(res.data.mensaje || 'Error al guardar');
            }
        } catch {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-primary-dark/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-500">
            <div className="bg-surface-card rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20">
                <div className="px-10 py-8 border-b border-border flex justify-between items-center bg-surface-raised/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">
                                {esEdicion ? 'Configurar Terminal' : 'Nueva Terminal de Caja'}
                            </h3>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Definición operativa de punto de cobro</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-danger hover:bg-danger/10 transition-all active:scale-95"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    {error && (
                        <div className="bg-danger/10 border-2 border-danger/20 text-danger px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-shake">
                            ⚠️ {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Nombre Identificador</label>
                        <input
                            type="text" required
                            value={form.nombre}
                            onChange={e => { setForm(p => ({ ...p, nombre: e.target.value })); setError(''); }}
                            className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                            placeholder="EJ: CAJA PRINCIPAL PB"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Notas Operativas</label>
                        <textarea
                            value={form.descripcion}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm resize-none"
                            placeholder="DESCRIPCIÓN DE LA UBICACIÓN O USO ESPECÍFICO"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">
                            Agente Responsable Asignado
                        </label>
                        <div className="relative">
                            <select
                                value={form.usuario_asignado_id}
                                onChange={e => setForm(p => ({ ...p, usuario_asignado_id: e.target.value }))}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-[11px] font-black uppercase tracking-widest text-text-primary shadow-sm appearance-none"
                            >
                                <option value="">ACCESO NO RESTRINGIDO (LIBRE)</option>
                                {usuarios.map(u => (
                                    <option key={u.usuario_id} value={u.usuario_id}>
                                        {u.nombre} {u.apellido} — @{u.username}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary opacity-40">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-30 mt-3 ml-1">
                            Nota: Si se asigna un funcionario, solo él podrá operar esta terminal.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-8 py-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] hover:bg-surface-raised rounded-2xl transition-all active:scale-95"
                        >
                            Abortar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Sincronizando...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>{esEdicion ? 'Actualizar Parámetros' : 'Confirmar Alta'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Fila de caja ─────────────────────────────────────────────────────────────
function CajaRow({ caja, usuarios, onEditar }) {
    const isAbierta = caja.estado === 'ABIERTA';
    const usuario = usuarios.find(u => u.usuario_id === caja.usuario_asignado_id);

    return (
        <tr className="hover:bg-surface-raised/30 transition-colors group">
            <td className="px-8 py-6">
                <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105 ${isAbierta ? 'bg-success/10 shadow-sm' : 'bg-surface-raised shadow-sm'}`}>
                        <svg className={`w-7 h-7 ${isAbierta ? 'text-success' : 'text-text-secondary opacity-40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-base font-black text-text-primary uppercase tracking-tight leading-tight">{caja.nombre}</p>
                        {caja.descripcion && (
                            <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mt-1 opacity-40">{caja.descripcion}</p>
                        )}
                    </div>
                </div>
            </td>

            <td className="px-8 py-6 text-center">
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${isAbierta ? 'bg-success/5 text-success border-success/20' : 'bg-surface-raised text-text-secondary border-border'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isAbierta ? 'bg-success animate-pulse' : 'bg-text-secondary/40'}`}></span>
                    {isAbierta ? 'Activa / Operativa' : 'Módulo Cerrado'}
                </span>
            </td>

            <td className="px-8 py-6">
                {usuario ? (
                    <div className="flex items-center gap-4 bg-white/50 p-2.5 rounded-2xl border border-border pr-5 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                            <span className="text-xs font-black text-white">
                                {usuario.nombre?.[0]}{usuario.apellido?.[0]}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-black text-text-primary uppercase tracking-tight leading-tight">
                                {usuario.nombre} {usuario.apellido}
                            </p>
                            <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-40 mt-0.5">@{usuario.username}</p>
                        </div>
                    </div>
                ) : (
                    <span className="inline-flex items-center gap-3 px-5 py-2.5 bg-surface-raised border border-border rounded-2xl text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-40">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Acceso Universal
                    </span>
                )}
            </td>

            <td className="px-8 py-6 text-right">
                <button
                    onClick={() => onEditar(caja)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-raised text-text-secondary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95 group/btn border border-border"
                    title="Editar Parámetros"
                >
                    <svg className="w-5 h-5 transition-transform group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
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
                empresasService.getUsuarios(empresaId),
            ]);
            setCajas(cajasRes.data.items || []);
            setUsuarios(usersRes.data.items || []);
        } catch {
            setError('Error al cargar la infraestructura de cajas');
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Toast Clinical Style */}
            {toast && (
                <div className={`fixed bottom-10 right-10 z-[110] px-8 py-5 rounded-[2rem] shadow-2xl border-2 flex items-center gap-5 animate-in slide-in-from-right-20 duration-500 ${toast.type === 'success'
                    ? 'bg-surface-card border-success/30 text-success'
                    : 'bg-surface-card border-danger/30 text-danger'
                    }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-success/10' : 'bg-danger/10'}`}>
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest">{toast.type === 'success' ? 'Operación Exitosa' : 'Sistema en Contingencia'}</p>
                        <p className="text-[10px] font-bold opacity-70 mt-0.5">{toast.msg}</ p>
                    </div>
                </div>
            )}

            {/* Header Section Standardized */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                        Tesorería y <span className="text-primary">Terminales de Caja</span>
                    </h1>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Gestión de puntos de cobro y asignación responsabilidades técnicas</p>
                </div>
                <button
                    onClick={() => setModal({ modo: 'crear' })}
                    className="flex items-center justify-center gap-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Registrar Terminal</span>
                </button>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Total Terminales', value: cajas.length, color: 'text-primary', bg: 'bg-primary/5', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                    { label: 'Cajas Abiertas', value: cajasAbiertas, color: 'text-success', bg: 'bg-success/5', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'Agentes Asignados', value: cajasConUsuario, color: 'text-secondary', bg: 'bg-secondary/5', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                ].map((s, idx) => (
                    <div key={idx} className={`${s.bg} rounded-[2.5rem] p-8 border border-border shadow-sm flex items-center gap-8 transition-all hover:scale-[1.02] duration-300 group`}>
                        <div className={`w-20 h-20 rounded-[1.5rem] bg-white shadow-lg flex items-center justify-center font-black text-3xl tabular-nums ${s.color} transition-transform group-hover:scale-110`}>
                            {s.value}
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] leading-none mb-2.5 opacity-40">{s.label}</p>
                            <div className="flex items-center gap-2">
                                <svg className={`w-4 h-4 ${s.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={s.icon} />
                                </svg>
                                <span className="text-[10px] font-black uppercase text-text-primary tracking-widest">Estado de RED</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* List Section Standardized */}
            <div className="bg-surface-card rounded-[2.5rem] shadow-sm border border-border overflow-hidden">
                <div className="px-10 py-6 border-b border-border flex justify-between items-center bg-surface-raised/50">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Terminales Registradas</h2>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Inventario técnico de puntos de operación financiera</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-text-secondary">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="mt-4 font-black text-[10px] uppercase tracking-widest opacity-40">Consultando Infraestructura...</span>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-danger font-black uppercase tracking-widest text-sm">{error}</div>
                ) : cajas.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-surface-raised rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-text-secondary opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <p className="text-xl font-black text-text-primary uppercase tracking-tight">Sin Terminales Activas</p>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mt-2 mb-10">Es necesario definir al menos una terminal para operar</p>
                        <button
                            onClick={() => setModal({ modo: 'crear' })}
                            className="px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                        >
                            Alta de Primer Caja
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-raised/50 border-b border-border">
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Identificación / Nombre</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Estado Operativo</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Agente Asignado</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
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

            {/* Information Alert Standardized */}
            <div className="bg-primary/5 border-2 border-primary/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left transition-all hover:bg-primary/10">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center shrink-0">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <p className="text-xl font-black text-text-primary uppercase tracking-tight mb-2">Protocolo de Asignación y Operativa</p>
                    <p className="text-[11px] text-text-secondary font-black uppercase tracking-widest opacity-60 leading-relaxed max-w-4xl">
                        Las terminales configuradas como <span className="text-primary opacity-100">"Acceso Universal"</span> permiten la apertura remota por cualquier personal con privilegios técnicos.
                        La asignación de un <span className="text-primary opacity-100">"Agente Responsable"</span> restringe el ciclo de vida de la caja exclusivamente a dicho funcionario, garantizando la trazabilidad
                        y el control centralizado de los flujos de tesorería institucional. Los perfiles administrativos mantienen visibilidad global sobre todos los puntos de cobro.
                    </p>
                </div>
            </div>

            {/* Modals Standardized internally */}
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
