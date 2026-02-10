import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

// ─── Modal: Abrir Caja ────────────────────────────────────────────────────────
function ModalAbrirCaja({ caja, onClose, onSuccess, usuarioId }) {
    const [saldoInicial, setSaldoInicial] = useState('0');
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const monto = parseFloat(saldoInicial) || 0;
        if (monto < 0) { setError('El saldo inicial no puede ser negativo'); return; }
        try {
            setLoading(true);
            const res = await cajaService.abrir(caja.caja_id, {
                saldo_inicial: monto,
                usuario_id: usuarioId,
                observaciones: observaciones.trim() || null,
            });
            if (res.data.resultado === 1) {
                onSuccess();
            } else {
                setError(res.data.mensaje || 'Error al abrir la caja');
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
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Abrir Caja</h2>
                            <p className="text-sm text-slate-500 font-medium">{caja.nombre}</p>
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
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Saldo Inicial (Gs.)</label>
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            value={saldoInicial}
                            onChange={e => { setSaldoInicial(e.target.value); setError(''); }}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium text-lg"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Observaciones</label>
                        <textarea
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium resize-none"
                            placeholder="Opcional"
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
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Abriendo...' : 'Abrir Caja'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Tarjeta de Caja ──────────────────────────────────────────────────────────
function CajaCard({ caja, onAbrir, onClick }) {
    const isAbierta = caja.estado === 'ABIERTA';
    const saldoActual = (caja.saldo_inicial || 0) + (caja.total_ingresos || 0) - (caja.total_egresos || 0);

    return (
        <div
            onClick={() => isAbierta && onClick(caja)}
            className={`group bg-white rounded-3xl border-2 transition-all duration-300 shadow-sm hover:shadow-xl ${isAbierta
                    ? 'border-emerald-100 hover:border-emerald-500 cursor-pointer translate-y-0 hover:-translate-y-2'
                    : 'border-slate-100 opacity-90'
                }`}
        >
            <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${isAbierta
                                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200'
                                : 'bg-gradient-to-br from-slate-300 to-slate-400'
                            }`}>
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-xl leading-tight">{caja.nombre}</h3>
                            {caja.descripcion && (
                                <p className="text-sm text-slate-500 font-medium mt-1 truncate max-w-[200px]">{caja.descripcion}</p>
                            )}
                        </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider ${isAbierta ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isAbierta ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        {isAbierta ? 'ABIERTA' : 'CERRADA'}
                    </span>
                </div>

                {/* Saldo */}
                {isAbierta ? (
                    <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-5 mb-6 relative overflow-hidden group-hover:from-emerald-100 transition-colors duration-300">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Saldo Disponible</p>
                        <p className="text-3xl font-black text-emerald-900 tracking-tight">{formatCurrency(saldoActual)}</p>

                        <div className="flex gap-6 mt-4 pt-4 border-t border-emerald-200/50">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ingresos</p>
                                <p className="text-sm font-black text-emerald-700">{formatCurrency(caja.total_ingresos)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Egresos</p>
                                <p className="text-sm font-black text-red-600">{formatCurrency(caja.total_egresos)}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 text-center">
                        <p className="text-xs font-bold text-slate-400">Esta caja debe abrirse para registrar movimientos</p>
                    </div>
                )}

                {/* Info */}
                <div className="text-xs text-slate-400 space-y-1.5 px-1">
                    {isAbierta && caja.fecha_apertura && (
                        <div className="flex justify-between items-center">
                            <span className="font-bold uppercase tracking-tighter">Apertura</span>
                            <span className="font-extrabold text-slate-600">{formatDateTime(caja.fecha_apertura)}</span>
                        </div>
                    )}
                    {!isAbierta && caja.fecha_cierre ? (
                        <div className="flex justify-between items-center">
                            <span className="font-bold uppercase tracking-tighter">Último Cierre</span>
                            <span className="font-extrabold text-slate-600">{formatDateTime(caja.fecha_cierre)}</span>
                        </div>
                    ) : !isAbierta && (
                        <div className="flex justify-between items-center">
                            <span className="font-bold uppercase tracking-tighter">Creada</span>
                            <span className="font-extrabold text-slate-600">{formatDateTime(caja.fecha_creacion)}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-8">
                    {isAbierta ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); onClick(caja); }}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white font-black text-sm rounded-2xl hover:bg-black transition-all shadow-lg hover:grow"
                        >
                            Ver Detalles y Movimientos
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAbrir(caja); }}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 shadow-lg hover:scale-[1.02]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            Abrir Caja de Hoy
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function Caja() {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const empresaId = usuario?.empresa_id || 1;
    const usuarioId = usuario?.usuario_id || 1;

    const [cajas, setCajas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalAbrir, setModalAbrir] = useState(null); // caja seleccionada
    const [toast, setToast] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState(''); // '' | 'ABIERTA' | 'CERRADA'

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const cargarCajas = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const res = await cajaService.listar(empresaId, filtroEstado || null);
            setCajas(res.data.items || []);
        } catch {
            setError('Error al cargar las cajas');
        } finally {
            setLoading(false);
        }
    }, [empresaId, filtroEstado]);

    useEffect(() => { cargarCajas(); }, [cargarCajas]);

    const handleAbrirSuccess = () => {
        setModalAbrir(null);
        showToast('Caja abierta exitosamente');
        cargarCajas();
    };

    const cajasFiltradas = cajas;
    const cajasAbiertas = cajas.filter(c => c.estado === 'ABIERTA');
    const cajasCerradas = cajas.filter(c => c.estado === 'CERRADA');

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
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Caja</h1>
                <p className="text-slate-500 font-medium mt-1">Abrí tu caja para comenzar a registrar movimientos</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Cajas', value: cajas.length, color: 'bg-slate-100 text-slate-700' },
                    { label: 'Abiertas', value: cajasAbiertas.length, color: 'bg-emerald-100 text-emerald-700' },
                    { label: 'Cerradas', value: cajasCerradas.length, color: 'bg-slate-100 text-slate-500' },
                ].map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color} font-black text-xl`}>
                            {s.value}
                        </div>
                        <p className="text-sm font-bold text-slate-600">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
                {[
                    { label: 'Todas', value: '' },
                    { label: 'Abiertas', value: 'ABIERTA' },
                    { label: 'Cerradas', value: 'CERRADA' },
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFiltroEstado(f.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${filtroEstado === f.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-slate-500 font-bold text-sm">Cargando cajas...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center font-bold">
                    {error}
                </div>
            ) : cajasFiltradas.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <p className="text-slate-700 font-black text-lg">No hay cajas disponibles</p>
                    <p className="text-slate-500 text-sm font-medium mt-1">Contactá a un administrador para configurar las cajas</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cajasFiltradas.map(caja => (
                        <CajaCard
                            key={caja.caja_id}
                            caja={caja}
                            onAbrir={setModalAbrir}
                            onClick={(c) => navigate(`/caja/${c.caja_id}`)}
                        />
                    ))}
                </div>
            )}

            {/* Modales */}
            {modalAbrir && (
                <ModalAbrirCaja
                    caja={modalAbrir}
                    usuarioId={usuarioId}
                    onClose={() => setModalAbrir(null)}
                    onSuccess={handleAbrirSuccess}
                />
            )}
        </div>
    );
}
