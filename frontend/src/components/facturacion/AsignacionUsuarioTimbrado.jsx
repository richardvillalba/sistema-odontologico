import React, { useState, useEffect } from 'react';
import { billingService, usersService } from '../../services/api';

const AsignacionUsuarioTimbrado = ({ timbrado, onClose }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [asignados, setAsignados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, [timbrado.timbrado_id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allUsersRes, assignedUsersRes] = await Promise.all([
                usersService.getAll(),
                billingService.getUsuariosTimbrado(timbrado.timbrado_id)
            ]);

            setUsuarios(allUsersRes.data.items || []);
            setAsignados(assignedUsersRes.data.items || []);
        } catch (error) {
            console.error("Error loading assignment data:", error);
            setError("Error al cargar los datos de asignación.");
        } finally {
            setLoading(false);
        }
    };

    const handleAsignar = async (usuarioId) => {
        setSaving(true);
        setError(null);
        try {
            const response = await billingService.asignarPuntoUsuario(usuarioId, timbrado.timbrado_id);
            if (response.data && response.data.resultado === 1) {
                await loadData();
            } else {
                setError(response.data?.mensaje || "Error al asignar el usuario.");
            }
        } catch (error) {
            console.error("Error assigning user:", error);
            setError(error.response?.data?.mensaje || "Error al conectar con el servidor.");
        } finally {
            setSaving(false);
        }
    };

    const handleQuitar = async (usuarioId) => {
        setSaving(true);
        setError(null);
        try {
            await billingService.quitarPuntoUsuario(usuarioId, timbrado.timbrado_id);
            await loadData();
        } catch (error) {
            console.error("Error removing assignment:", error);
            setError(error.response?.data?.mensaje || "Error al quitar la asignación.");
        } finally {
            setSaving(false);
        }
    };

    const isAsignado = (usuarioId) => asignados.some(a => a.usuario_id === usuarioId);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Asignación de Usuarios</h3>
                        <p className="text-xs text-slate-500 font-medium">Timbrado: {timbrado.numero_timbrado} ({timbrado.establecimiento}-{timbrado.punto_expedicion})</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-bold">{error}</span>
                        </div>
                    )}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-2">
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                    Usuarios Disponibles
                                </h4>
                                <div className="space-y-2">
                                    {usuarios.filter(u => !isAsignado(u.usuario_id)).map(u => (
                                        <div key={u.usuario_id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors bg-white shadow-sm">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-800">{u.nombre} {u.apellido}</span>
                                                <span className="text-xs text-slate-500">{u.email}</span>
                                            </div>
                                            <button
                                                disabled={saving}
                                                onClick={() => handleAsignar(u.usuario_id)}
                                                className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                                                title="Asignar"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    {usuarios.filter(u => !isAsignado(u.usuario_id)).length === 0 && (
                                        <p className="text-xs text-slate-400 text-center py-4 italic">No hay más usuarios disponibles</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    Usuarios Asignados
                                </h4>
                                <div className="space-y-2">
                                    {asignados.map(a => (
                                        <div key={a.usuario_id} className="flex items-center justify-between p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 transition-colors shadow-sm">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{a.nombre_completo || a.email}</span>
                                                <span className="text-[10px] text-indigo-600 font-medium uppercase tracking-wider">{a.activo === 'S' ? 'Activo' : 'Inactivo'}</span>
                                            </div>
                                            <button
                                                disabled={saving}
                                                onClick={() => handleQuitar(a.usuario_id)}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                title="Quitar"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    {asignados.length === 0 && (
                                        <p className="text-xs text-slate-400 text-center py-4 italic">No hay usuarios asignados</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AsignacionUsuarioTimbrado;
