import React, { useEffect, useState } from 'react';
import { billingService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AsignacionUsuarioTimbrado from './AsignacionUsuarioTimbrado';
import TimbradoForm from './TimbradoForm';

const TimbradosList = () => {
    const { empresaActiva, usuario } = useAuth();
    const empresaId = empresaActiva?.empresa_id;
    const [timbrados, setTimbrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTimbrado, setSelectedTimbrado] = useState(null);
    const [editingTimbrado, setEditingTimbrado] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTimbrados();
    }, []);

    const loadTimbrados = async () => {
        try {
            setLoading(true);
            const response = await billingService.getTimbrados(empresaId);
            setTimbrados(response.data.items || []);
            setError(null);
        } catch (error) {
            console.error("Error loading timbrados:", error);
            setError("No se pudieron cargar los timbrados fiscales.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (timbrado) => {
        const nuevoEstado = timbrado.activo === 'S' ? 'N' : 'S';
        setError(null);

        try {
            const response = await billingService.toggleTimbradoStatus(timbrado.timbrado_id, nuevoEstado, usuario?.usuario_id);
            if (response.data && response.data.resultado === 1) {
                loadTimbrados(); // Recargar lista
            } else {
                setError(response.data?.mensaje || "Error al cambiar el estado.");
            }
        } catch (error) {
            console.error("Error toggling status:", error);
            const msg = error.response?.data?.mensaje || "Error al conectar con el servidor.";
            setError(msg);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <span className="mt-4 font-black text-[10px] uppercase tracking-widest opacity-40">Accediendo a Registros Fiscales...</span>
        </div>
    );

    return (
        <>
            <div className="bg-surface-card rounded-[2.5rem] shadow-sm border border-border overflow-hidden animate-in fade-in duration-700">
                <div className="px-10 py-6 border-b border-border flex justify-between items-center bg-surface-raised/30">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Talonarios Registrados</h2>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Control de puntos de expedición y rangos técnicos</p>
                    </div>
                    {error && (
                        <div className="bg-danger/10 border-2 border-danger/20 text-danger px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest animate-shake">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-raised/50 border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Timbrado</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Establecimiento</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Rango de Folios</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Folio Actual</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Vencimiento</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Asignaciones</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Estado</th>
                                <th className="px-8 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {timbrados.length > 0 ? (
                                timbrados.map((timbrado) => (
                                    <tr key={timbrado.timbrado_id} className="hover:bg-surface-raised/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-text-primary tabular-nums">#{timbrado.numero_timbrado}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center">
                                                <span className="bg-white text-text-primary px-3 py-1.5 rounded-xl text-[11px] font-black font-mono border-2 border-border shadow-sm">
                                                    {timbrado.establecimiento}-{timbrado.punto_expedicion}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-[11px] font-bold font-mono text-text-secondary">
                                                <span className="opacity-40">{timbrado.numero_inicio.toString().padStart(7, '0')}</span>
                                                <span className="text-primary font-black">→</span>
                                                <span className="text-text-primary">{timbrado.numero_fin.toString().padStart(7, '0')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="bg-primary/5 text-primary px-4 py-1.5 rounded-full text-[11px] font-black font-mono border-2 border-primary/10">
                                                {timbrado.numero_actual.toString().padStart(7, '0')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`flex flex-col ${timbrado.dias_para_vencer < 30 ? 'text-danger' : 'text-text-primary'}`}>
                                                <span className="text-[11px] font-black uppercase">
                                                    {new Date(timbrado.fecha_vencimiento).toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                {timbrado.dias_para_vencer < 30 && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest mt-0.5">
                                                        CADUCA EN {timbrado.dias_para_vencer} DÍAS
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {timbrado.total_asignados > 0 ? (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                                    </svg>
                                                    <span className="text-[10px] font-black uppercase tracking-wider">{timbrado.total_asignados}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-30 italic">Sin agentes</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <button
                                                onClick={() => handleToggleStatus(timbrado)}
                                                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 border-2 ${timbrado.activo === 'S'
                                                    ? 'bg-success/5 text-success border-success/20'
                                                    : 'bg-surface-raised text-text-secondary border-border opacity-50'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${timbrado.activo === 'S' ? 'bg-success animate-pulse' : 'bg-text-secondary/40'}`}></span>
                                                {timbrado.activo === 'S' ? 'Operativo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setSelectedTimbrado(timbrado)}
                                                    title="Asignar Usuarios"
                                                    className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all active:scale-90"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setEditingTimbrado(timbrado)}
                                                    title="Editar Parámetros"
                                                    className="w-10 h-10 flex items-center justify-center bg-surface-raised text-text-secondary hover:bg-secondary hover:text-white rounded-xl transition-all active:scale-90"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-20">
                                            <svg className="w-16 h-16 text-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-lg font-black uppercase tracking-widest">Bóveda de Timbrados Vacía</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedTimbrado && (
                <AsignacionUsuarioTimbrado
                    timbrado={selectedTimbrado}
                    onClose={() => {
                        setSelectedTimbrado(null);
                        loadTimbrados(); // Recargar para ver cambios
                    }}
                />
            )}
            {editingTimbrado && (
                <TimbradoForm
                    initialData={editingTimbrado}
                    onClose={() => setEditingTimbrado(null)}
                    onSuccess={() => {
                        setEditingTimbrado(null);
                        loadTimbrados();
                    }}
                />
            )}
        </>
    );
};

export default TimbradosList;
