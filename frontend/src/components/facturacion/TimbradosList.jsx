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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Timbrados Fiscales</h2>
                        <p className="text-sm text-gray-500">Gestión de puntos de expedición y rangos</p>
                    </div>
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold animate-pulse">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Timbrado</th>
                                <th className="px-6 py-3">Punto Exp.</th>
                                <th className="px-6 py-3">Rango</th>
                                <th className="px-6 py-3">Actual</th>
                                <th className="px-6 py-3">Vencimiento</th>
                                <th className="px-6 py-3 text-center">Asignación</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {timbrados.length > 0 ? (
                                timbrados.map((timbrado) => (
                                    <tr key={timbrado.timbrado_id} className={`hover:bg-gray-50 transition-colors group ${timbrado.total_asignados > 0 ? 'bg-indigo-50/30' : ''}`}>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {timbrado.numero_timbrado}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <span className="bg-white text-gray-700 px-2 py-1 rounded text-xs font-bold font-mono border border-gray-200 shadow-sm">
                                                    {timbrado.establecimiento}-{timbrado.punto_expedicion}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                                            <span className="text-gray-400">{timbrado.numero_inicio}</span>
                                            <span className="mx-1">→</span>
                                            <span>{timbrado.numero_fin}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
                                                {timbrado.numero_actual}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <div className={`flex flex-col ${timbrado.dias_para_vencer < 30 ? 'text-red-600' : 'text-gray-600'
                                                }`}>
                                                <span className="font-semibold">
                                                    {new Date(timbrado.fecha_vencimiento).toLocaleDateString()}
                                                </span>
                                                {timbrado.dias_para_vencer < 30 && (
                                                    <span className="text-[10px] text-red-500 font-bold uppercase">
                                                        Vence en {timbrado.dias_para_vencer} días
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {timbrado.total_asignados > 0 ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                                    </svg>
                                                    {timbrado.total_asignados} {timbrado.total_asignados === 1 ? 'Usuario' : 'Usuarios'}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 font-medium">Sin asignar</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(timbrado)}
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 ${timbrado.activo === 'S'
                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                    : 'bg-gray-100 text-gray-800 border border-gray-200 opacity-60'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${timbrado.activo === 'S' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                                                    }`}></span>
                                                {timbrado.activo === 'S' ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    onClick={() => setSelectedTimbrado(timbrado)}
                                                    className="text-white hover:bg-indigo-700 bg-indigo-600 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all text-[10px] font-bold flex items-center gap-1"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    ASIGNAR
                                                </button>
                                                <button
                                                    onClick={() => setEditingTimbrado(timbrado)}
                                                    className="text-slate-600 hover:bg-slate-200 bg-slate-100 px-3 py-1.5 rounded-lg shadow-sm transition-all text-[10px] font-bold"
                                                >
                                                    EDITAR
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-lg font-medium text-gray-900">No hay timbrados registrados</p>
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
