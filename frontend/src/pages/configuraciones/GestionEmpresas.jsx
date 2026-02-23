import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { empresasService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AsignacionUsuarioEmpresa from '../../components/configuraciones/AsignacionUsuarioEmpresa';

// ─── Modal: Crear Empresa ────────────────────────────────────────────────────
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
                onSuccess('Unidad de Negocio creada exitosamente');
            } else {
                setError(res.data.mensaje || 'Error al crear la empresa');
            }
        } catch {
            setError('Error de conexión con el servidor central');
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Registro de Nueva Empresa</h3>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Alta de actor jurídico en el ecosistema</p>
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
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Razón Social Jurídica</label>
                            <input
                                type="text"
                                value={form.razon_social}
                                onChange={e => { setForm(p => ({ ...p, razon_social: e.target.value })); setError(''); }}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                placeholder="EJ: CORPORACIÓN DENTAL DEL SUR S.A."
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Nombre Comercial de Marca</label>
                            <input
                                type="text"
                                value={form.nombre_comercial}
                                onChange={e => { setForm(p => ({ ...p, nombre_comercial: e.target.value })); setError(''); }}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                placeholder="EJ: ODONTOCLÍNICAS"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">RUC Tributario</label>
                            <input
                                type="text"
                                value={form.ruc}
                                onChange={e => { setForm(p => ({ ...p, ruc: e.target.value })); setError(''); }}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                placeholder="EJ: 80012345-6"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Dirección Matriz</label>
                            <input
                                type="text"
                                value={form.direccion}
                                onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                placeholder="CENTRO ADMINISTRATIVO Y OPERATIVO"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Línea de Contacto</label>
                            <input
                                type="text"
                                value={form.telefono}
                                onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                placeholder="+595 21 000 000"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Portal / Email Institucional</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                placeholder="ADMIN@EMPRESA.COM"
                            />
                        </div>
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
                                    <span>Confirmar Alta</span>
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
            setError('Error de comunicación con el registro de entidades');
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
                showToast(res.data.mensaje || 'Error operativo', 'error');
            }
        } catch {
            showToast('Falla técnica de red', 'error');
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
                        <p className="text-[10px] font-bold opacity-70 mt-0.5">{toast.msg}</p>
                    </div>
                </div>
            )}

            {/* Header Section Standardized */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                        Gestión Global de <span className="text-primary">Entidades</span>
                    </h1>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Administración de empresas y unidades de negocio del holding</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Registrar Entidad</span>
                </button>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Entidades Registradas', value: empresas.length, color: 'text-primary', bg: 'bg-primary/5', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                    { label: 'Unidades Activas', value: activas, color: 'text-success', bg: 'bg-success/5', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { label: 'Nodos de Sucursal', value: totalSucursales, color: 'text-secondary', bg: 'bg-secondary/5', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
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
                                <span className="text-[10px] font-black uppercase text-text-primary tracking-widest">Estado RED</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* List Section Standardized */}
            <div className="bg-surface-card rounded-[2.5rem] shadow-sm border border-border overflow-hidden">
                <div className="px-10 py-6 border-b border-border flex justify-between items-center bg-surface-raised/50">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Censo de Empresas</h2>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Estructura organizativa y fiscal de la red clínica</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-text-secondary">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="mt-4 font-black text-[10px] uppercase tracking-widest opacity-40">Consultando Registro Nacional...</span>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-danger font-black uppercase tracking-widest text-sm">{error}</div>
                ) : empresas.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-surface-raised rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-text-secondary opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <p className="text-xl font-black text-text-primary uppercase tracking-tight">Sin Entidades Registradas</p>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mt-2 mb-10">Es mandatorio registrar una empresa para operar el sistema</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                        >
                            Alta de Primer Entidad
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-raised/50 border-b border-border">
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Unidad de Negocio</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Identificación Fiscal</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Nodos / Sucursales</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Staff Asignado</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Módulos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {empresas.map(empresa => (
                                    <tr key={empresa.empresa_id} className="hover:bg-surface-raised/30 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 shadow-sm ${empresa.activo === 'S' ? 'bg-primary/10' : 'bg-surface-raised'}`}>
                                                    <svg className={`w-7 h-7 ${empresa.activo === 'S' ? 'text-primary' : 'text-text-secondary opacity-40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-text-primary uppercase tracking-tight leading-tight">{empresa.nombre_comercial}</p>
                                                    <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest mt-1 opacity-40">{empresa.razon_social}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-mono text-[11px] font-black text-text-primary bg-surface-raised px-4 py-1.5 rounded-lg border border-border">
                                                {empresa.ruc}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button
                                                onClick={() => navigate(`/configuraciones/sucursales?empresa_id=${empresa.empresa_id}`)}
                                                className="inline-flex items-center gap-3 px-5 py-2.5 bg-secondary/5 text-secondary rounded-[1rem] border-2 border-secondary/10 text-[10px] font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-sm active:scale-95 group/suc"
                                            >
                                                <svg className="w-4 h-4 transition-transform group-hover/suc:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                {empresa.total_sucursales} {empresa.total_sucursales === 1 ? 'NODO' : 'NODOS'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-surface-raised border border-border rounded-xl text-[10px] text-text-primary font-black uppercase tracking-widest shadow-sm">
                                                <svg className="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                {empresa.total_usuarios} AGENTES
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(empresa)}
                                                className={`group/status inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border-2 active:scale-95 ${empresa.activo === 'S'
                                                    ? 'bg-success/5 text-success border-success/20 hover:bg-success hover:text-white hover:border-success'
                                                    : 'bg-surface-raised text-text-secondary border-border hover:bg-danger/5 hover:text-danger hover:border-danger/30'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${empresa.activo === 'S' ? 'bg-success group-hover/status:bg-white animate-pulse' : 'bg-text-secondary opacity-40'}`}></span>
                                                {empresa.activo === 'S' ? 'Operativo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => setAsignacionEmpresa(empresa)}
                                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95 group/btn"
                                                    title="Gestionar Accesos"
                                                >
                                                    <svg className="w-5 h-5 transition-transform group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/configuraciones/sucursales?empresa_id=${empresa.empresa_id}`)}
                                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-secondary text-white hover:bg-secondary-dark transition-all shadow-lg shadow-secondary/20 active:scale-95 group/btn"
                                                    title="Gestionar Sucursales"
                                                >
                                                    <svg className="w-5 h-5 transition-transform group-hover/btn:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
