import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sucursalesService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AsignacionUsuarioSucursal from '../../components/configuraciones/AsignacionUsuarioSucursal';

// ─── Modal: Crear / Editar Sucursal ──────────────────────────────────────────
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
        if (!form.nombre.trim()) { setError('El nombre identificativo es requerido'); return; }

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
                onSuccess(esEdicion ? 'Nodo de red actualizado' : 'Nueva sucursal federada exitosamente');
            } else {
                setError(res.data.mensaje || 'Error en el protocolo de guardado');
            }
        } catch {
            setError('Falla de conexión con el núcleo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-primary-dark/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-500">
            <div className="bg-surface-card rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20">
                <div className="px-10 py-8 border-b border-border flex justify-between items-center bg-surface-raised/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">
                                {esEdicion ? 'Configuración de Nodo' : 'Alta de Sucursal'}
                            </h3>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">
                                {esEdicion ? `MODIFICANDO REGISTRO: ${sucursal.codigo}` : 'ESTABLECER NUEVO PUNTO DE ATENCIÓN'}
                            </p>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {esEdicion && (
                            <div className="md:col-span-2 flex items-center gap-4 bg-surface-raised p-4 rounded-2xl border border-border">
                                <div className="px-4 py-2 bg-white rounded-xl border border-border shadow-sm">
                                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest block opacity-40 mb-0.5">Identificador de Nodo</span>
                                    <span className="font-mono text-sm font-black text-primary">{sucursal?.codigo}</span>
                                </div>
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-30 leading-tight">Este código es inmutable y define la identidad única en el clúster regional.</p>
                            </div>
                        )}
                        <div className={esEdicion ? 'md:col-span-2' : 'md:col-span-2'}>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Nombre Descriptivo *</label>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={e => { setForm(p => ({ ...p, nombre: e.target.value })); setError(''); }}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                placeholder="EJ: SUCURSAL VILLA MORRA"
                                autoFocus
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Ubicación Geo-referencial</label>
                            <input
                                type="text"
                                value={form.direccion}
                                onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                placeholder="CALLE, NÚMERO Y REFERENCIAS"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Ciudad / Distrito</label>
                            <input
                                type="text"
                                value={form.ciudad}
                                onChange={e => setForm(p => ({ ...p, ciudad: e.target.value }))}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                placeholder="EJ: ASUNCIÓN"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Centralita / Teléfono</label>
                            <input
                                type="text"
                                value={form.telefono}
                                onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                placeholder="+595 21 000 000"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Canal de Comunicación Digital</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                placeholder="SUCURSAL@EMPRESA.COM"
                            />
                        </div>
                        {!esEdicion && (
                            <div className="md:col-span-2 flex items-center gap-4 bg-primary/5 p-5 rounded-[2rem] border border-primary/10 transition-all hover:bg-primary/10">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.es_principal === 'S'}
                                        onChange={e => setForm(p => ({ ...p, es_principal: e.target.checked ? 'S' : 'N' }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                                </label>
                                <div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest block">Nodo Prioritario (Matriz)</span>
                                    <span className="text-[9px] font-bold text-text-secondary opacity-50 block mt-0.5 uppercase tracking-wider">Establecer como centro operativo principal</span>
                                </div>
                            </div>
                        )}
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
                                    <span>{esEdicion ? 'Actualizar Ficha' : 'Confirmar Alta'}</span>
                                </>
                            )}
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
            setError('Falla en la sincronización de nodos distribuidos');
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
                showToast(res.data.mensaje || 'Restricción de seguridad', 'error');
            }
        } catch {
            showToast('Latencia crítica de red', 'error');
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
                        <p className="text-xs font-black uppercase tracking-widest">{toast.type === 'success' ? 'Sincronización Exitosa' : 'Incidencia Detectada'}</p>
                        <p className="text-[10px] font-bold opacity-70 mt-0.5">{toast.msg}</p>
                    </div>
                </div>
            )}

            {/* Header Section Standardized */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                        Gestión de <span className="text-primary">Nodos Académicos</span>
                    </h1>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Administración de sucursales y puntos de atención clínica</p>
                </div>
                <button
                    onClick={() => setModal({ modo: 'crear' })}
                    className="flex items-center justify-center gap-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Establecer Nodo</span>
                </button>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Nodos Federados', value: sucursales.length, color: 'text-primary', bg: 'bg-primary/5', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
                    { label: 'Unidades Activas', value: activas, color: 'text-success', bg: 'bg-success/5', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'Capital Humano Asignado', value: totalUsuarios, color: 'text-secondary', bg: 'bg-secondary/5', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
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
                                <span className="text-[10px] font-black uppercase text-text-primary tracking-widest">Protocolo RED</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* List Section Standardized */}
            <div className="bg-surface-card rounded-[2.5rem] shadow-sm border border-border overflow-hidden">
                <div className="px-10 py-6 border-b border-border flex justify-between items-center bg-surface-raised/50">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Censo de Infraestructura</h2>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Estructura física y puntos operativos de la corporación</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-text-secondary">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="mt-4 font-black text-[10px] uppercase tracking-widest opacity-40">Mapeando Topología...</span>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-danger font-black uppercase tracking-widest text-sm">{error}</div>
                ) : sucursales.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-surface-raised rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-text-secondary opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p className="text-xl font-black text-text-primary uppercase tracking-tight">Sin Nodos Declarados</p>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mt-2 mb-10">Es mandatorio establecer al menos una sucursal operativa</p>
                        <button
                            onClick={() => setModal({ modo: 'crear' })}
                            className="px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                        >
                            Declarar Nodo Inicial
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-raised/50 border-b border-border">
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Descriptor de Nodo</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Identidad (COD)</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Región / Ciudad</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Staff Asignado</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Jerarquía</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Comandos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {sucursales.map(suc => (
                                    <tr key={suc.sucursal_id} className="hover:bg-surface-raised/30 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 shadow-sm ${suc.activo === 'S' ? 'bg-secondary/10' : 'bg-surface-raised'}`}>
                                                    <svg className={`w-7 h-7 ${suc.activo === 'S' ? 'text-secondary' : 'text-text-secondary opacity-40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-text-primary uppercase tracking-tight leading-tight">{suc.nombre}</p>
                                                    {suc.direccion && (
                                                        <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mt-1 opacity-40 truncate max-w-[200px]">{suc.direccion}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-mono text-[11px] font-black text-text-primary bg-surface-raised px-4 py-1.5 rounded-lg border border-border">
                                                {suc.codigo}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black uppercase text-text-primary tracking-widest bg-white border border-border px-3 py-1 rounded-full shadow-sm">
                                                {suc.ciudad || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-surface-raised border border-border rounded-xl text-[10px] text-text-primary font-black uppercase tracking-widest shadow-sm">
                                                <svg className="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                {suc.total_usuarios || 0} AGENTES
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {suc.es_principal === 'S' ? (
                                                <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-warning/5 border-2 border-warning/20 rounded-full">
                                                    <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    <span className="text-[10px] font-black uppercase text-text-primary tracking-widest">NODO MATRIZ</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-text-secondary opacity-20 uppercase tracking-widest">ORDINARIO</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(suc)}
                                                className={`group/status inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border-2 active:scale-95 ${suc.activo === 'S'
                                                    ? 'bg-success/5 text-success border-success/20 hover:bg-success hover:text-white hover:border-success'
                                                    : 'bg-surface-raised text-text-secondary border-border hover:bg-danger/5 hover:text-danger hover:border-danger/30'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${suc.activo === 'S' ? 'bg-success group-hover/status:bg-white animate-pulse' : 'bg-text-secondary opacity-40'}`}></span>
                                                {suc.activo === 'S' ? 'Operativo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => setAsignacionSucursal(suc)}
                                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95 group/btn"
                                                    title="Gestionar Staff"
                                                >
                                                    <svg className="w-5 h-5 transition-transform group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setModal({ modo: 'editar', sucursal: suc })}
                                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-raised border-2 border-border text-text-secondary hover:text-primary hover:border-primary/30 transition-all shadow-sm active:scale-95 group/btn"
                                                    title="Editar Parámetros"
                                                >
                                                    <svg className="w-5 h-5 transition-transform group-hover/btn:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
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

            {/* Modal Contextual */}
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
