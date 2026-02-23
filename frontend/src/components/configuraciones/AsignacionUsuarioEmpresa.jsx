import React, { useState, useEffect } from 'react';
import { empresasService, rolesService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AsignacionUsuarioEmpresa = ({ empresa, onClose }) => {
    const { usuario } = useAuth();
    const [asignados, setAsignados] = useState([]);
    const [disponibles, setDisponibles] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [rolSeleccionado, setRolSeleccionado] = useState({});

    useEffect(() => {
        loadData();
    }, [empresa.empresa_id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [asignadosRes, disponiblesRes, rolesRes] = await Promise.all([
                empresasService.getUsuarios(empresa.empresa_id),
                empresasService.getUsuariosDisponibles(empresa.empresa_id),
                rolesService.getAll()
            ]);
            setAsignados(asignadosRes.data.items || []);
            setDisponibles(disponiblesRes.data.items || []);
            setRoles(rolesRes.data.items || []);
        } catch (err) {
            console.error("Error loading data:", err);
            setError("Falla crítica en la sincronización de agentes.");
        } finally {
            setLoading(false);
        }
    };

    const handleAsignar = async (u) => {
        const rolId = rolSeleccionado[u.usuario_id] || u.rol_id || null;
        if (!rolId) {
            setError("Es mandatorio definir un rol operativo.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const response = await empresasService.asignarUsuario(empresa.empresa_id, u.usuario_id, 'N', usuario?.usuario_id, rolId);
            if (response.data?.resultado === 1) {
                await loadData();
            } else {
                setError(response.data?.mensaje || "Error en el protocolo de asignación.");
            }
        } catch (err) {
            setError(err.response?.data?.mensaje || "Error de red en el clúster.");
        } finally {
            setSaving(false);
        }
    };

    const handleQuitar = async (usuarioId) => {
        setSaving(true);
        setError(null);
        try {
            await empresasService.quitarUsuario(empresa.empresa_id, usuarioId);
            await loadData();
        } catch (err) {
            setError(err.response?.data?.mensaje || "Error al revocar privilegios.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-primary-dark/60 backdrop-blur-md flex items-center justify-center z-[120] p-4 transition-all duration-500">
            <div className="bg-surface-card rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20">
                {/* Modal Header */}
                <div className="px-10 py-8 border-b border-border flex justify-between items-center bg-surface-raised/50">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
                            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Gestión de Staff Operativo</h3>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">
                                {empresa.nombre_comercial} <span className="mx-2 opacity-20">|</span> FICHA: {empresa.ruc}
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

                <div className="p-10">
                    {error && (
                        <div className="mb-8 p-5 bg-danger/10 border-2 border-danger/20 rounded-2xl flex items-center gap-4 text-danger animate-in slide-in-from-top-4 duration-300">
                            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</span>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-text-secondary/40">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <span className="mt-4 font-black text-[10px] uppercase tracking-[0.3em]">Accediendo al Cluster...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                            {/* Disponibles Column */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-border pb-4">
                                    <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.25em] flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-border"></span>
                                        Pool de Agentes
                                    </h4>
                                    <span className="bg-surface-raised px-3 py-1 rounded-full text-[9px] font-black text-text-secondary border border-border">{disponibles.length} DISP.</span>
                                </div>

                                <div className="space-y-4">
                                    {disponibles.length === 0 ? (
                                        <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl">
                                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-30 italic">No se detectan agentes externos</p>
                                        </div>
                                    ) : (
                                        disponibles.map(u => (
                                            <div key={u.usuario_id} className="p-6 rounded-[2rem] border-2 border-border bg-surface-raised/30 hover:bg-white hover:border-primary/30 transition-all duration-300 shadow-sm group">
                                                <div className="flex items-center justify-between gap-4 mb-4">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-black text-text-primary uppercase tracking-tight truncate">{u.nombre} {u.apellido}</p>
                                                        <p className="text-[10px] text-text-secondary font-bold truncate opacity-60 lowercase mt-0.5">{u.email}</p>
                                                    </div>
                                                    <button
                                                        disabled={saving}
                                                        onClick={() => handleAsignar(u)}
                                                        className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-95 shrink-0 shadow-sm group-hover:shadow-md"
                                                        title="Asignar a Entidad"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <select
                                                        value={rolSeleccionado[u.usuario_id] || u.rol_id || ''}
                                                        onChange={e => setRolSeleccionado(prev => ({ ...prev, [u.usuario_id]: Number(e.target.value) }))}
                                                        className="w-full text-[10px] px-4 py-2.5 bg-white border border-border rounded-xl font-black text-text-primary uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer"
                                                    >
                                                        <option value="">⚙️ DEFINIR ROL OPERATIVO</option>
                                                        {roles.map(r => (
                                                            <option key={r.rol_id} value={r.rol_id}>{r.nombre}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Asignados Column */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-border pb-4">
                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em] flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                        Staff de Entidad
                                    </h4>
                                    <span className="bg-primary/5 px-3 py-1 rounded-full text-[9px] font-black text-primary border border-primary/20">{asignados.length} ACTIVOS</span>
                                </div>

                                <div className="space-y-4">
                                    {asignados.length === 0 ? (
                                        <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl bg-surface-raised/20">
                                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-30 italic">Sin asignaciones registradas</p>
                                        </div>
                                    ) : (
                                        asignados.map(a => (
                                            <div key={a.usuario_id} className="flex items-center justify-between p-6 rounded-[2rem] border-2 border-primary/10 bg-primary/[0.02] hover:bg-white hover:border-primary/30 transition-all duration-300 shadow-sm relative overflow-hidden group">
                                                <div className="min-w-0 pr-4">
                                                    <p className="text-sm font-black text-text-primary uppercase tracking-tight truncate flex items-center gap-2">
                                                        {a.nombre} {a.apellido}
                                                        {a.es_principal === 'S' && <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></span>}
                                                    </p>
                                                    <p className="text-[10px] text-text-secondary font-bold truncate opacity-60 lowercase mt-0.5">{a.email}</p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        {a.rol && (
                                                            <span className="text-[9px] bg-primary text-white px-3 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                                                                {a.rol}
                                                            </span>
                                                        )}
                                                        {a.es_principal === 'S' && (
                                                            <span className="text-[8px] bg-warning/10 text-warning border border-warning/30 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest">
                                                                STAFF PRINCIPAL
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    disabled={saving}
                                                    onClick={() => handleQuitar(a.usuario_id)}
                                                    className="w-12 h-12 bg-danger/10 text-danger rounded-2xl flex items-center justify-center hover:bg-danger hover:text-white transition-all active:scale-95 shrink-0 shadow-sm transform group-hover:rotate-6"
                                                    title="Revocar Acceso"
                                                >
                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-10 py-8 border-t border-border bg-surface-raised/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-white border-2 border-border rounded-2xl text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] hover:bg-surface-card hover:text-text-primary transition-all active:scale-95 shadow-sm"
                    >
                        Cerrar Monitor
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AsignacionUsuarioEmpresa;
