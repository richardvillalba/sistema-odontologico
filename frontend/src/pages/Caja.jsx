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
        <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface-card rounded-[2rem] shadow-2xl w-full max-w-md border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden">
                <div className="p-8 border-b border-border bg-surface-raised/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-secondary-light/30 flex items-center justify-center border border-secondary/20">
                            <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Abrir Caja</h2>
                            <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-60 mt-0.5">{caja.nombre}</p>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-danger-light/20 border border-danger/20 text-danger text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse"></span>
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest px-1">Saldo Inicial (Gs.)</label>
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            value={saldoInicial}
                            onChange={e => { setSaldoInicial(e.target.value); setError(''); }}
                            className="w-full px-5 py-4 bg-surface-raised border border-border rounded-2xl text-text-primary focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-black text-2xl tracking-tight"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest px-1">Observaciones</label>
                        <textarea
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                            className="w-full px-5 py-4 bg-surface-raised border border-border rounded-2xl text-text-primary focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-sm resize-none"
                            placeholder="Notas opcionales..."
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
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-2 px-8 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                        >
                            {loading ? 'Procesando...' : 'Abrir Caja Ahora'}
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
            onClick={() => onClick(caja)}
            className="group bg-surface-card rounded-[2.5rem] border border-border transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/10 overflow-hidden hover:border-primary/30 cursor-pointer translate-y-0 hover:-translate-y-2"
        >
            <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 border ${isAbierta
                            ? 'bg-secondary text-white shadow-xl shadow-secondary/30 border-secondary/20'
                            : 'bg-surface-raised text-text-secondary border-border'
                            }`}>
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-black text-text-primary text-xl leading-tight uppercase tracking-tight">{caja.nombre}</h3>
                            {caja.descripcion && (
                                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mt-1 opacity-60 truncate max-w-[180px]">{caja.descripcion}</p>
                            )}
                        </div>
                    </div>
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border ${isAbierta ? 'bg-secondary-light/20 text-secondary border-secondary/20' : 'bg-surface-raised text-text-secondary border-border'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAbierta ? 'bg-secondary animate-pulse' : 'bg-text-secondary opacity-40'}`}></span>
                        {isAbierta ? 'ABIERTA' : 'CERRADA'}
                    </span>
                </div>

                {/* Saldo */}
                {isAbierta ? (
                    <div className="bg-surface-raised/50 border border-border rounded-3xl p-6 mb-8 relative overflow-hidden group-hover:bg-white transition-all duration-500">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                        <p className="text-[10px] font-black text-secondary uppercase tracking-[0.25em] mb-2 opacity-80">Saldo Disponible</p>
                        <p className="text-3xl font-black text-text-primary tracking-tighter">{formatCurrency(saldoActual)}</p>

                        <div className="flex gap-8 mt-6 pt-6 border-t border-border">
                            <div className="space-y-1">
                                <p className="text-[9px] text-text-secondary font-black uppercase tracking-widest opacity-40">Ingresos</p>
                                <p className="text-sm font-black text-secondary">{formatCurrency(caja.total_ingresos)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] text-text-secondary font-black uppercase tracking-widest opacity-40">Egresos</p>
                                <p className="text-sm font-black text-danger">{formatCurrency(caja.total_egresos)}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface-raised border-dashed border-2 border-border rounded-3xl p-8 mb-8 text-center">
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 leading-relaxed">Esta caja debe abrirse para iniciar operaciones</p>
                    </div>
                )}

                {/* Info */}
                <div className="text-[10px] text-text-secondary space-y-2.5 px-2">
                    {isAbierta && caja.fecha_apertura && (
                        <div className="flex justify-between items-center">
                            <span className="font-black uppercase tracking-widest opacity-40 text-[9px]">Apertura</span>
                            <span className="font-bold text-text-primary uppercase">{formatDateTime(caja.fecha_apertura)}</span>
                        </div>
                    )}
                    {!isAbierta && caja.fecha_cierre ? (
                        <div className="flex justify-between items-center">
                            <span className="font-black uppercase tracking-widest opacity-40 text-[9px]">Último Cierre</span>
                            <span className="font-bold text-text-primary uppercase">{formatDateTime(caja.fecha_cierre)}</span>
                        </div>
                    ) : !isAbierta && (
                        <div className="flex justify-between items-center">
                            <span className="font-black uppercase tracking-widest opacity-40 text-[9px]">Creada</span>
                            <span className="font-bold text-text-primary uppercase">{formatDateTime(caja.fecha_creacion)}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col gap-3">
                    {isAbierta ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); onClick(caja); }}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 group/btn"
                        >
                            Ver Detalles y Movimientos
                            <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onClick(caja); }}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-surface-raised border-2 border-border text-text-secondary font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-surface-card hover:border-primary/20 hover:text-primary transition-all group/btn"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Ver Arqueo e Historial
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAbrir(caja); }}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-secondary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-secondary-dark transition-all shadow-xl shadow-secondary/20"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                                Abrir Caja de Hoy
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function Caja() {
    const navigate = useNavigate();
    const { usuario, empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;
    const usuarioId = usuario?.usuario_id;

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

    // Filtrar cajas por usuario asignado (superadmin ve todas)
    const esSuperAdminUser = usuario?.es_superadmin === 'S';
    const cajasUsuario = esSuperAdminUser
        ? cajas
        : cajas.filter(c => c.usuario_asignado_id === usuarioId || !c.usuario_asignado_id);
    const cajasFiltradas = cajasUsuario;
    const cajasAbiertas = cajasUsuario.filter(c => c.estado === 'ABIERTA');
    const cajasCerradas = cajasUsuario.filter(c => c.estado === 'CERRADA');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight uppercase">Gestión de Caja</h1>
                    <p className="text-text-secondary font-medium text-sm md:text-base">Control centralizado de flujos de efectivo y cierres diarios.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Cajas', value: cajas.length, icon: '📦', color: 'bg-primary-light/30 text-primary border-primary/20' },
                    { label: 'Cajas Abiertas', value: cajasAbiertas.length, icon: '🔓', color: 'bg-secondary-light/30 text-secondary border-secondary/20' },
                    { label: 'Cajas Cerradas', value: cajasCerradas.length, icon: '🔒', color: 'bg-surface-raised text-text-secondary border-border' },
                ].map((s) => (
                    <div key={s.label} className="bg-surface-card rounded-[2rem] border border-border p-6 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center border ${s.color} font-black text-2xl`}>
                            {s.value}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mb-1">{s.label}</p>
                            <p className="text-lg font-black text-text-primary uppercase tracking-tight">Consolidado</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
                {[
                    { label: 'Todas las Cajas', value: '' },
                    { label: 'Activas/Abiertas', value: 'ABIERTA' },
                    { label: 'Finalizadas/Cerradas', value: 'CERRADA' },
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFiltroEstado(f.value)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filtroEstado === f.value
                            ? 'bg-primary text-white shadow-lg shadow-primary/25 border-transparent'
                            : 'bg-surface-card border border-border text-text-secondary hover:bg-surface-raised'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-surface-card rounded-[3rem] border border-border shadow-sm">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-4 border-4 border-secondary/10 border-b-secondary rounded-full animate-reverse-spin"></div>
                    </div>
                    <p className="text-[10px] text-text-secondary font-black uppercase tracking-[0.25em] mt-8 animate-pulse">Sincronizando Tesorería...</p>
                </div>
            ) : error ? (
                <div className="bg-danger-light/10 border-2 border-dashed border-danger/20 text-danger rounded-[2rem] p-12 text-center">
                    <p className="text-xl font-black uppercase tracking-tight mb-2">Error de Sincronización</p>
                    <p className="text-sm font-bold opacity-60">{error}</p>
                </div>
            ) : cajasFiltradas.length === 0 ? (
                <div className="bg-surface-raised rounded-[3rem] border-2 border-dashed border-border p-24 text-center">
                    <div className="w-20 h-20 bg-surface-card rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-border">
                        <svg className="w-10 h-10 text-text-secondary opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <p className="text-text-primary font-black text-2xl uppercase tracking-tight mb-2">No se encontraron cajas</p>
                    <p className="text-text-secondary text-sm font-medium max-w-sm mx-auto opacity-60">No tienes permisos asignados o no existen cajas configuradas para esta sucursal.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
