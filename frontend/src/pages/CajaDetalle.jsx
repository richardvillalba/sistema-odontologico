import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cajaService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'Gs. 0';
    return `Gs. ${Number(amount).toLocaleString('es-PY')}`;
};

const formatDateTime = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('es-PY', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// ─── Modal: Registrar Movimiento ──────────────────────────────────────────────
function ModalMovimiento({ tipo, cajaId, usuarioId, onClose, onSuccess }) {
    const [categorias, setCategorias] = useState([]);
    const [form, setForm] = useState({
        categoria_id: '',
        concepto: '',
        monto: '',
        referencia: '',
        observaciones: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cajaService.getCategorias(tipo).then(res => {
            setCategorias(res.data.items || []);
        }).catch(() => { });
    }, [tipo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.concepto.trim()) { setError('El concepto es requerido'); return; }
        const monto = parseFloat(form.monto);
        if (!monto || monto <= 0) { setError('Ingresá un monto válido mayor a cero'); return; }

        try {
            setLoading(true);
            const res = await cajaService.registrarMovimiento(cajaId, {
                tipo,
                categoria_id: form.categoria_id ? parseInt(form.categoria_id) : null,
                concepto: form.concepto.trim(),
                monto,
                referencia: form.referencia.trim() || null,
                observaciones: form.observaciones.trim() || null,
                registrado_por: usuarioId,
            });
            if (res.data.resultado === 1) {
                onSuccess();
            } else {
                setError(res.data.mensaje || 'Error al registrar movimiento');
            }
        } catch {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const isIngreso = tipo === 'INGRESO';
    const accentClass = isIngreso ? 'secondary' : 'danger';

    return (
        <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-card rounded-[2rem] shadow-2xl w-full max-w-md border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden">
                <div className={`p-8 border-b border-border ${isIngreso ? 'bg-secondary-light/5' : 'bg-danger-light/5'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${isIngreso ? 'bg-secondary text-white border-secondary/20 shadow-secondary/20' : 'bg-danger text-white border-danger/20 shadow-danger/20'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isIngreso
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                                }
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">
                                Registrar {isIngreso ? 'Ingreso' : 'Egreso'}
                            </h2>
                            <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-60 mt-0.5">
                                {isIngreso ? 'Entrada de valores a la caja' : 'Salida de valores de la caja'}
                            </p>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && (
                        <div className="bg-danger-light/20 border border-danger/20 text-danger text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse"></span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest px-1">Categoría</label>
                        <select
                            value={form.categoria_id}
                            onChange={e => setForm(p => ({ ...p, categoria_id: e.target.value }))}
                            className="w-full px-5 py-4 bg-surface-raised border border-border rounded-2xl text-text-primary focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-sm"
                        >
                            <option value="">Sin categoría asignada</option>
                            {categorias.map(c => (
                                <option key={c.categoria_id} value={c.categoria_id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest px-1">Concepto o Detalle *</label>
                        <input
                            type="text"
                            value={form.concepto}
                            onChange={e => { setForm(p => ({ ...p, concepto: e.target.value })); setError(''); }}
                            className="w-full px-5 py-4 bg-surface-raised border border-border rounded-2xl text-text-primary focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-sm"
                            placeholder="Ej: Pago de materiales, Cobro de consulta..."
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest px-1">Monto de la Operación (Gs.) *</label>
                        <input
                            type="number"
                            min="1"
                            step="1000"
                            value={form.monto}
                            onChange={e => { setForm(p => ({ ...p, monto: e.target.value })); setError(''); }}
                            className={`w-full px-5 py-4 bg-surface-raised border border-border rounded-2xl text-text-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-black text-2xl tracking-tight ${isIngreso ? 'focus:border-secondary' : 'focus:border-danger'}`}
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest px-1">Documento de Referencia</label>
                        <input
                            type="text"
                            value={form.referencia}
                            onChange={e => setForm(p => ({ ...p, referencia: e.target.value }))}
                            className="w-full px-5 py-4 bg-surface-raised border border-border rounded-2xl text-text-primary focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-xs"
                            placeholder="Nro. Recibo, Factura, Transferencia (opcional)"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-4 border border-border text-text-secondary font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-surface-raised transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-2 px-6 py-4 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all disabled:opacity-50 ${isIngreso ? 'bg-secondary hover:bg-secondary-dark shadow-secondary/20' : 'bg-danger hover:bg-danger-dark shadow-danger/20'}`}
                        >
                            {loading ? 'Guardando...' : `Confirmar ${isIngreso ? 'Ingreso' : 'Egreso'}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Modal: Cerrar Caja ───────────────────────────────────────────────────────
function ModalCerrarCaja({ caja, usuarioId, onClose, onSuccess }) {
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const saldoEsperado = (caja.saldo_inicial || 0) + (caja.total_ingresos || 0) - (caja.total_egresos || 0);

    const handleConfirm = async () => {
        try {
            setLoading(true);
            const res = await cajaService.cerrar(caja.caja_id, {
                usuario_id: usuarioId,
                observaciones: observaciones.trim() || null,
            });
            if (res.data.resultado === 1) {
                onSuccess(res.data.saldo_final);
            } else {
                setError(res.data.mensaje || 'Error al cerrar la caja');
            }
        } catch {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-card rounded-[2rem] shadow-2xl w-full max-w-md border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden">
                <div className="p-8 border-b border-border bg-surface-raised/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-warning-light/30 flex items-center justify-center border border-warning/20 shadow-xl shadow-warning-light/10">
                            <svg className="w-6 h-6 text-warning-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Arquero y Cierre</h2>
                            <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-60 mt-0.5">{caja.nombre}</p>
                        </div>
                    </div>
                </div>
                <div className="p-8 space-y-6">
                    {error && (
                        <div className="bg-danger-light/20 border border-danger/20 text-danger text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse"></span>
                            {error}
                        </div>
                    )}

                    {/* Resumen */}
                    <div className="bg-surface-raised border border-border rounded-2xl p-6 space-y-4">
                        <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Consolidado Final</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Saldo de Apertura', value: caja.saldo_inicial || 0, cls: 'text-text-primary' },
                                { label: 'Flujo de Ingresos', value: caja.total_ingresos || 0, cls: 'text-secondary' },
                                { label: 'Flujo de Egresos', value: -(caja.total_egresos || 0), cls: 'text-danger' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between text-xs font-bold">
                                    <span className="text-text-secondary">{item.label}</span>
                                    <span className={item.cls}>{formatCurrency(Math.abs(item.value))}</span>
                                </div>
                            ))}
                            <div className="border-t border-border pt-4 flex justify-between items-baseline">
                                <span className="text-[10px] font-black text-text-primary uppercase tracking-widest">Saldo de Cierre</span>
                                <span className="text-xl font-black text-text-primary tracking-tight">{formatCurrency(saldoEsperado)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest px-1">Notas de Cierre</label>
                        <textarea
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                            className="w-full px-5 py-4 bg-surface-raised border border-border rounded-2xl text-text-primary focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-sm resize-none"
                            placeholder="Comentarios adicionales sobre el arqueo..."
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-4 border border-border text-text-secondary font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-surface-raised transition-all"
                        >
                            Volver
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-2 px-8 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                        >
                            {loading ? 'Confirmando...' : 'Proceder al Cierre'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Fila de Movimiento ───────────────────────────────────────────────────────
function MovimientoRow({ mov }) {
    const isIngreso = mov.tipo?.trim() === 'INGRESO';
    return (
        <tr className="hover:bg-primary-light/5 transition-all border-b border-border last:border-0 group">
            <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-110 ${isIngreso ? 'bg-secondary text-white border-secondary/20 shadow-lg shadow-secondary/10' : 'bg-danger text-white border-danger/20 shadow-lg shadow-danger/10'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isIngreso
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                            }
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="font-black text-text-primary text-sm uppercase tracking-tight truncate leading-tight">{mov.concepto}</p>
                        {mov.categoria_nombre && (
                            <p className="text-[9px] text-text-secondary font-black uppercase tracking-[0.2em] mt-1 opacity-40">{mov.categoria_nombre}</p>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-5 text-center">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest border border-dashed ${isIngreso ? 'bg-secondary-light/20 text-secondary border-secondary/30' : 'bg-danger-light/20 text-danger border-danger/30'}`}>
                    {isIngreso ? 'INGRESO' : 'EGRESO'}
                </span>
            </td>
            <td className={`px-6 py-5 text-right font-black text-lg tracking-tighter ${isIngreso ? 'text-secondary' : 'text-danger'}`}>
                {isIngreso ? '+' : '-'} {formatCurrency(mov.monto)}
            </td>
            <td className="px-6 py-5 text-center">
                <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">{new Date(mov.fecha_hora).toLocaleDateString()}</p>
                <p className="text-[9px] text-text-secondary font-bold uppercase opacity-40">{new Date(mov.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </td>
            <td className="px-6 py-5 text-center">
                <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-surface-raised border border-border rounded-xl">
                    <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center shadow-md shadow-primary/10">
                        <span className="text-[9px] font-black leading-none">
                            {mov.nombre_usuario?.split(' ')[0][0]}{mov.nombre_usuario?.split(' ').slice(-1)[0][0]}
                        </span>
                    </div>
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-tight">{mov.nombre_usuario || 'Sistemas'}</span>
                </div>
            </td>
            <td className="px-6 py-5 text-center">
                <span className="px-3 py-1.5 bg-surface-raised border border-border rounded-lg text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-60">
                    {mov.referencia || 'SIN REF.'}
                </span>
            </td>
        </tr>
    );
}

// ─── Página de Detalle ────────────────────────────────────────────────────────
export default function CajaDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const usuarioId = usuario?.usuario_id;

    const [caja, setCaja] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalMovimiento, setModalMovimiento] = useState(null); // 'INGRESO' | 'EGRESO' | null
    const [modalCerrar, setModalCerrar] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const [cajaRes, movsRes] = await Promise.all([
                cajaService.getById(id),
                cajaService.getMovimientos(id),
            ]);
            const cajaData = cajaRes.data.items?.[0] || null;
            setCaja(cajaData);
            setMovimientos(movsRes.data.items || []);
        } catch {
            setError('Error al cargar los datos de la caja');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { cargarDatos(); }, [cargarDatos]);

    const handleMovimientoSuccess = () => {
        setModalMovimiento(null);
        showToast('Movimiento registrado');
        cargarDatos();
    };

    const handleCerrarSuccess = () => {
        setModalCerrar(false);
        showToast('Caja cerrada exitosamente');
        navigate('/caja');
    };

    const movsFiltrados = filtroTipo
        ? movimientos.filter(m => m.tipo?.trim() === filtroTipo)
        : movimientos;

    const totalIngresos = movimientos.filter(m => m.tipo?.trim() === 'INGRESO').reduce((s, m) => s + (m.monto || 0), 0);
    const totalEgresos = movimientos.filter(m => m.tipo?.trim() === 'EGRESO').reduce((s, m) => s + (m.monto || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </div>
        );
    }

    if (error || !caja) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-8 text-center font-bold">
                {error || 'Caja no encontrada'}
            </div>
        );
    }

    // Verificar que el usuario tiene acceso a esta caja
    const esSuperAdminUser = usuario?.es_superadmin === 'S';
    const tieneAccesoCaja = esSuperAdminUser || !caja.usuario_asignado_id || caja.usuario_asignado_id === usuarioId;
    if (!tieneAccesoCaja) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
                <p className="font-black text-amber-900 text-lg mb-2">No tienes acceso a esta caja</p>
                <p className="text-amber-700 text-sm font-medium mb-4">Esta caja esta asignada a otro usuario.</p>
                <button onClick={() => navigate('/caja')} className="px-6 py-2.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors">
                    Volver a Cajas
                </button>
            </div>
        );
    }

    const isAbierta = caja.estado === 'ABIERTA';
    const saldoActual = (caja.saldo_inicial || 0) + (caja.total_ingresos || 0) - (caja.total_egresos || 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-[1.5rem] shadow-2xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 ${toast.type === 'success'
                    ? 'bg-surface-card border-secondary/20 text-secondary'
                    : 'bg-surface-card border-danger/20 text-danger'
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-secondary animate-pulse' : 'bg-danger'}`}></span>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/caja')}
                        className="p-4 bg-surface-card border border-border rounded-2xl text-text-secondary hover:text-primary shadow-sm group transition-all"
                    >
                        <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-4">
                            <h1 className="text-2xl sm:text-3xl font-black text-text-primary uppercase tracking-tight leading-none">{caja.nombre}</h1>
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border ${isAbierta ? 'bg-secondary-light/20 text-secondary border-secondary/20' : 'bg-surface-raised text-text-secondary border-border'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isAbierta ? 'bg-secondary animate-pulse' : 'bg-text-secondary opacity-40'}`}></span>
                                {isAbierta ? 'SESIÓN ACTIVA' : 'CAJA CERRADA'}
                            </span>
                        </div>
                        {caja.fecha_apertura && (
                            <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">
                                Apertura: <span className="text-text-primary opacity-100">{formatDateTime(caja.fecha_apertura)}</span>
                            </p>
                        )}
                    </div>
                </div>

                {isAbierta && (
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setModalMovimiento('EGRESO')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-danger text-white font-black rounded-2xl hover:bg-danger-dark transition-all shadow-xl shadow-danger/20 text-[10px] uppercase tracking-widest"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" />
                            </svg>
                            Registrar Egreso
                        </button>
                        <button
                            onClick={() => setModalMovimiento('INGRESO')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-secondary text-white font-black rounded-2xl hover:bg-secondary-dark transition-all shadow-xl shadow-secondary/20 text-[10px] uppercase tracking-widest"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                            </svg>
                            Registrar Ingreso
                        </button>
                        <button
                            onClick={() => setModalCerrar(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-primary-dark text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-primary/20 text-[10px] uppercase tracking-widest border border-white/10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>

            {/* Arqueo de cierre - solo caja cerrada */}
            {!isAbierta && (
                <div className="bg-surface-raised border-2 border-border rounded-[2rem] p-8">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.25em] opacity-40 mb-6">Arqueo de Cierre</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Apertura', value: caja.saldo_inicial || 0, color: 'text-text-primary' },
                            { label: 'Total Ingresos', value: totalIngresos, color: 'text-secondary' },
                            { label: 'Total Egresos', value: totalEgresos, color: 'text-danger' },
                            { label: 'Saldo de Cierre', value: caja.saldo_final ?? ((caja.saldo_inicial || 0) + totalIngresos - totalEgresos), color: 'text-primary', highlight: true },
                        ].map(item => (
                            <div key={item.label} className={`${item.highlight ? 'bg-primary/5 border-2 border-primary/20 rounded-2xl p-4' : ''}`}>
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-1">{item.label}</p>
                                <p className={`text-xl font-black tracking-tighter ${item.color}`}>{formatCurrency(item.value)}</p>
                            </div>
                        ))}
                    </div>
                    {caja.fecha_cierre && (
                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-30 mt-6">
                            Cerrada el {formatDateTime(caja.fecha_cierre)}
                        </p>
                    )}
                </div>
            )}

            {/* Resumen financiero */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: 'Fondo Inicial',
                        value: formatCurrency(caja.saldo_inicial),
                        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
                        color: 'text-text-primary',
                        bg: 'bg-surface-card',
                        iconBg: 'bg-primary-light/30',
                        iconColor: 'text-primary'
                    },
                    {
                        label: 'Entradas',
                        value: formatCurrency(totalIngresos),
                        icon: 'M12 4v16m8-8H4',
                        color: 'text-secondary',
                        bg: 'bg-surface-card',
                        iconBg: 'bg-secondary-light/30',
                        iconColor: 'text-secondary'
                    },
                    {
                        label: 'Salidas',
                        value: formatCurrency(totalEgresos),
                        icon: 'M20 12H4',
                        color: 'text-danger',
                        bg: 'bg-surface-card',
                        iconBg: 'bg-danger-light/30',
                        iconColor: 'text-danger'
                    },
                    {
                        label: isAbierta ? 'Efectivo en Caja' : 'Saldo de Cierre',
                        value: formatCurrency(isAbierta ? saldoActual : caja.saldo_final),
                        icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
                        color: isAbierta ? 'text-primary' : 'text-text-primary',
                        bg: 'bg-surface-card',
                        iconBg: isAbierta ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-primary-dark text-white shadow-xl shadow-primary-dark/20',
                        iconColor: 'text-white'
                    },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-[2rem] p-6 border border-border shadow-sm transition-all hover:shadow-xl duration-500 group/card`}>
                        <div className="flex items-center justify-between mb-5">
                            <div className={`w-12 h-12 rounded-2xl ${s.iconBg} flex items-center justify-center transition-transform group-hover/card:scale-110 border border-transparent`}>
                                <svg className={`w-6 h-6 ${s.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={s.icon} />
                                </svg>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1.5 opacity-40">{s.label}</p>
                        <p className={`text-2xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Movimientos */}
            <div className="bg-surface-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden mx-1">
                <div className="px-8 py-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface-raised/50">
                    <div>
                        <h2 className="font-black text-text-primary text-xl uppercase tracking-tight">Registro de Movimientos</h2>
                        <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-40 mt-1">{movimientos.length} operaciones registradas en esta sesión</p>
                    </div>
                    <div className="flex bg-surface-card p-1.5 rounded-2xl border border-border shadow-sm">
                        {[
                            { label: 'Todos', value: '' },
                            { label: 'Ingresos', value: 'INGRESO' },
                            { label: 'Egresos', value: 'EGRESO' },
                        ].map(f => (
                            <button
                                key={f.value}
                                onClick={() => setFiltroTipo(f.value)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filtroTipo === f.value
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {movsFiltrados.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-slate-600 font-bold">Sin movimientos{filtroTipo ? ` de tipo ${filtroTipo}` : ''}</p>
                        {isAbierta && (
                            <p className="text-slate-400 text-sm font-medium mt-1">
                                Comience registrando un movimiento desde el panel superior.
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-surface-raised border-b border-border">
                                        {['Concepto y Categoría', 'Tipo', 'Monto Operación', 'Timestamp', 'Registrado Por', 'Referencia'].map(h => (
                                            <th key={h} className={`px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ${h.includes('Monto') ? 'text-right' : 'text-left'} ${['Tipo', 'Timestamp', 'Registrado Por', 'Referencia'].includes(h) ? 'text-center' : ''}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {movsFiltrados.map(mov => (
                                        <MovimientoRow key={mov.movimiento_id} mov={mov} />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden divide-y divide-border">
                            {movsFiltrados.map(mov => {
                                const isIngreso = mov.tipo?.trim() === 'INGRESO';
                                return (
                                    <div key={mov.movimiento_id} className="p-6 space-y-5 hover:bg-surface-raised/50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${isIngreso ? 'bg-secondary text-white border-secondary/20 shadow-lg shadow-secondary/10' : 'bg-danger text-white border-danger/20 shadow-lg shadow-danger/10'}`}>
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        {isIngreso
                                                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                                                        }
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-text-primary text-sm uppercase tracking-tight truncate leading-tight">{mov.concepto}</p>
                                                    <p className="text-[9px] text-text-secondary font-black uppercase tracking-[0.2em] mt-1 opacity-40">{mov.categoria_nombre || 'Sin categoría'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`font-black text-lg tracking-tighter ${isIngreso ? 'text-secondary' : 'text-danger'}`}>
                                                    {isIngreso ? '+' : '-'} {formatCurrency(mov.monto)}
                                                </p>
                                                <p className="text-[9px] text-text-secondary font-bold uppercase opacity-40">
                                                    {new Date(mov.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-border">
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-[9px] font-black text-text-secondary uppercase">
                                                    {mov.nombre_usuario?.charAt(0)}
                                                </div>
                                                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">{mov.nombre_usuario}</span>
                                            </div>
                                            <span className="px-3 py-1 bg-surface-raised border border-border rounded-lg text-[9px] font-black text-text-secondary uppercase tracking-[0.1em] opacity-60">
                                                {mov.referencia || 'SIN REF.'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Modales */}
            {modalMovimiento && (
                <ModalMovimiento
                    tipo={modalMovimiento}
                    cajaId={id}
                    usuarioId={usuarioId}
                    onClose={() => setModalMovimiento(null)}
                    onSuccess={handleMovimientoSuccess}
                />
            )}
            {modalCerrar && (
                <ModalCerrarCaja
                    caja={caja}
                    usuarioId={usuarioId}
                    onClose={() => setModalCerrar(false)}
                    onSuccess={handleCerrarSuccess}
                />
            )}
        </div>
    );
}
