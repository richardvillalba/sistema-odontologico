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
    const colorClass = isIngreso ? 'emerald' : 'red';
    const ringClass = isIngreso ? 'focus:ring-emerald-500' : 'focus:ring-red-500';
    const btnClass = isIngreso
        ? 'bg-emerald-600 hover:bg-emerald-700'
        : 'bg-red-600 hover:bg-red-700';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-${colorClass}-100 flex items-center justify-center`}>
                            <svg className={`w-5 h-5 text-${colorClass}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isIngreso
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                }
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">
                                Registrar {isIngreso ? 'Ingreso' : 'Egreso'}
                            </h2>
                            <p className="text-sm text-slate-500 font-medium">
                                {isIngreso ? 'Entrada de dinero a la caja' : 'Salida de dinero de la caja'}
                            </p>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Categoría</label>
                        <select
                            value={form.categoria_id}
                            onChange={e => setForm(p => ({ ...p, categoria_id: e.target.value }))}
                            className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 ${ringClass} focus:border-transparent font-medium`}
                        >
                            <option value="">Sin categoría</option>
                            {categorias.map(c => (
                                <option key={c.categoria_id} value={c.categoria_id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Concepto *</label>
                        <input
                            type="text"
                            value={form.concepto}
                            onChange={e => { setForm(p => ({ ...p, concepto: e.target.value })); setError(''); }}
                            className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 ${ringClass} focus:border-transparent font-medium`}
                            placeholder="Descripción del movimiento"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Monto (Gs.) *</label>
                        <input
                            type="number"
                            min="1"
                            step="1000"
                            value={form.monto}
                            onChange={e => { setForm(p => ({ ...p, monto: e.target.value })); setError(''); }}
                            className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 ${ringClass} focus:border-transparent font-medium text-lg`}
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Referencia / Comprobante</label>
                        <input
                            type="text"
                            value={form.referencia}
                            onChange={e => setForm(p => ({ ...p, referencia: e.target.value }))}
                            className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 ${ringClass} focus:border-transparent font-medium`}
                            placeholder="Nro. de recibo u otro comprobante (opcional)"
                        />
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
                            className={`flex-1 px-4 py-2.5 text-white font-bold rounded-xl transition-colors disabled:opacity-60 ${btnClass}`}
                        >
                            {loading ? 'Guardando...' : `Registrar ${isIngreso ? 'Ingreso' : 'Egreso'}`}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Cerrar Caja</h2>
                            <p className="text-sm text-slate-500 font-medium">{caja.nombre}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Resumen */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Arqueo de Caja</h3>
                        <div className="space-y-2">
                            {[
                                { label: 'Saldo inicial', value: caja.saldo_inicial || 0, cls: 'text-slate-700' },
                                { label: 'Total ingresos', value: caja.total_ingresos || 0, cls: 'text-emerald-700' },
                                { label: 'Total egresos', value: -(caja.total_egresos || 0), cls: 'text-red-600' },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between text-sm font-bold">
                                    <span className="text-slate-600">{item.label}</span>
                                    <span className={item.cls}>{formatCurrency(Math.abs(item.value))}</span>
                                </div>
                            ))}
                            <div className="border-t border-slate-200 pt-2 flex justify-between font-black">
                                <span className="text-slate-800">Saldo final esperado</span>
                                <span className="text-slate-900 text-lg">{formatCurrency(saldoEsperado)}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Observaciones</label>
                        <textarea
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium resize-none"
                            placeholder="Notas del cierre (opcional)"
                            rows={2}
                        />
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
                            onClick={handleConfirm}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Cerrando...' : 'Confirmar Cierre'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Fila de Movimiento ───────────────────────────────────────────────────────
function MovimientoRow({ mov }) {
    const isIngreso = mov.tipo === 'INGRESO';
    return (
        <tr className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0 group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300 ${isIngreso ? 'bg-emerald-100 shadow-sm shadow-emerald-100' : 'bg-red-50 shadow-sm shadow-red-50'}`}>
                        <svg className={`w-5 h-5 ${isIngreso ? 'text-emerald-600' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isIngreso
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                            }
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 text-sm leading-tight truncate">{mov.concepto}</p>
                        {mov.categoria_nombre && (
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{mov.categoria_nombre}</p>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest ${isIngreso ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {isIngreso ? 'INGRESO' : 'EGRESO'}
                </span>
            </td>
            <td className={`px-6 py-4 text-right font-black text-lg tracking-tight ${isIngreso ? 'text-emerald-700' : 'text-red-600'}`}>
                {isIngreso ? '+' : '-'} {formatCurrency(mov.monto)}
            </td>
            <td className="px-6 py-4 text-center">
                <p className="text-xs font-bold text-slate-600">{new Date(mov.fecha_hora).toLocaleDateString()}</p>
                <p className="text-[10px] text-slate-400 font-medium">{new Date(mov.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </td>
            <td className="px-6 py-4 text-center">
                <div className="inline-flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                        <span className="text-[10px] font-black text-slate-500 leading-none">
                            {mov.nombre_usuario?.split(' ')[0][0]}{mov.nombre_usuario?.split(' ').slice(-1)[0][0]}
                        </span>
                    </div>
                    <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{mov.nombre_usuario || 'Sistemas'}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-center">
                <span className="px-2 py-1 bg-slate-50 rounded text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {mov.referencia || 'SIN REF'}
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
        ? movimientos.filter(m => m.tipo === filtroTipo)
        : movimientos;

    const totalIngresos = movimientos.filter(m => m.tipo === 'INGRESO').reduce((s, m) => s + (m.monto || 0), 0);
    const totalEgresos = movimientos.filter(m => m.tipo === 'EGRESO').reduce((s, m) => s + (m.monto || 0), 0);

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
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/caja')}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-blue-600 shadow-sm group transition-all"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">{caja.nombre}</h1>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${isAbierta ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isAbierta ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                {isAbierta ? 'ABIERTA' : 'CERRADA'}
                            </span>
                        </div>
                        {caja.fecha_apertura && (
                            <p className="text-slate-400 font-bold mt-1 text-[10px] sm:text-xs uppercase tracking-tighter">
                                Sesión iniciada el <span className="text-slate-600">{formatDateTime(caja.fecha_apertura)}</span>
                            </p>
                        )}
                    </div>
                </div>

                {isAbierta && (
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                            onClick={() => setModalMovimiento('EGRESO')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 border border-red-200 font-bold rounded-2xl hover:bg-red-100 transition-colors text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                            </svg>
                            Egreso
                        </button>
                        <button
                            onClick={() => setModalMovimiento('INGRESO')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            Ingreso
                        </button>
                        <button
                            onClick={() => setModalCerrar(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-colors text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Cerrar Caja
                        </button>
                    </div>
                )}
            </div>

            {/* Resumen financiero */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    {
                        label: 'Saldo Inicial',
                        value: formatCurrency(caja.saldo_inicial),
                        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
                        color: 'text-slate-900',
                        bg: 'bg-white',
                        iconBg: 'bg-slate-100',
                        iconColor: 'text-slate-500',
                        borderColor: 'border-slate-100'
                    },
                    {
                        label: 'Total Ingresos',
                        value: formatCurrency(totalIngresos),
                        icon: 'M12 4v16m8-8H4',
                        color: 'text-emerald-900',
                        bg: 'bg-gradient-to-br from-emerald-50 to-white',
                        iconBg: 'bg-emerald-500',
                        iconColor: 'text-white',
                        borderColor: 'border-emerald-100'
                    },
                    {
                        label: 'Total Egresos',
                        value: formatCurrency(totalEgresos),
                        icon: 'M20 12H4',
                        color: 'text-red-900',
                        bg: 'bg-gradient-to-br from-red-50 to-white',
                        iconBg: 'bg-red-500',
                        iconColor: 'text-white',
                        borderColor: 'border-red-100'
                    },
                    {
                        label: isAbierta ? 'Saldo Actual' : 'Saldo Final',
                        value: formatCurrency(isAbierta ? saldoActual : caja.saldo_final),
                        icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
                        color: isAbierta ? 'text-blue-900' : 'text-slate-900',
                        bg: isAbierta ? 'bg-gradient-to-br from-blue-50 to-white' : 'bg-white',
                        iconBg: isAbierta ? 'bg-blue-600' : 'bg-slate-800',
                        iconColor: 'text-white',
                        borderColor: isAbierta ? 'border-blue-100' : 'border-slate-100'
                    },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} rounded-[2rem] p-5 sm:p-6 border border-slate-200 shadow-sm transition-all hover:shadow-md duration-300`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${s.iconBg} flex items-center justify-center shadow-lg shadow-${s.iconBg.split('-')[1]}-100`}>
                                <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${s.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={s.icon} />
                                </svg>
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={`text-xl sm:text-2xl font-black ${s.color} tracking-tight`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Movimientos */}
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mx-1">
                <div className="px-6 py-5 sm:py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                    <div>
                        <h2 className="font-black text-slate-900 text-lg">Movimientos del Día</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{movimientos.length} registros encontrados</p>
                    </div>
                    <div className="flex bg-slate-100/80 p-1 rounded-xl w-fit">
                        {[
                            { label: 'Todos', value: '' },
                            { label: 'Ingresos', value: 'INGRESO' },
                            { label: 'Egresos', value: 'EGRESO' },
                        ].map(f => (
                            <button
                                key={f.value}
                                onClick={() => setFiltroTipo(f.value)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filtroTipo === f.value
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
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
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        {['Concepto / Categoría', 'Tipo', 'Monto', 'Fecha y Hora', 'Usuario', 'Referencia'].map(h => (
                                            <th key={h} className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest ${h === 'Monto' ? 'text-right' : 'text-left'} ${['Tipo', 'Fecha y Hora', 'Usuario', 'Referencia'].includes(h) ? 'text-center' : ''}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {movsFiltrados.map(mov => (
                                        <MovimientoRow key={mov.movimiento_id} mov={mov} />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {movsFiltrados.map(mov => {
                                const isIngreso = mov.tipo === 'INGRESO';
                                return (
                                    <div key={mov.movimiento_id} className="p-6 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isIngreso ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        {isIngreso
                                                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                                                        }
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 text-sm leading-tight truncate">{mov.concepto}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{mov.categoria_nombre || 'Sin categoría'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black text-lg ${isIngreso ? 'text-emerald-700' : 'text-red-600'}`}>
                                                    {isIngreso ? '+' : '-'} {formatCurrency(mov.monto)}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                    {new Date(mov.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500">
                                                    {mov.nombre_usuario?.charAt(0)}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500">{mov.nombre_usuario}</span>
                                            </div>
                                            <span className="px-2 py-0.5 bg-slate-50 rounded text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                                                {mov.referencia || 'SIN REF'}
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
