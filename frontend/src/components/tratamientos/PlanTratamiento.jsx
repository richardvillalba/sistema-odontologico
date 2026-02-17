import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { odontogramaService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const PlanTratamiento = ({ pacienteId }) => {
    const { empresaActiva } = useAuth();
    const queryClient = useQueryClient();
    const [selectedTratamiento, setSelectedTratamiento] = useState(null);

    const { data: tratamientosRes, isLoading } = useQuery({
        queryKey: ['tratamientos-odontograma', pacienteId, empresaActiva?.empresa_id],
        queryFn: () => odontogramaService.getTratamientosPaciente(pacienteId, empresaActiva?.empresa_id),
        enabled: !!pacienteId
    });

    const eliminarMutation = useMutation({
        mutationFn: (id) => odontogramaService.eliminarTratamiento(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['tratamientos-odontograma', pacienteId]);
            setSelectedTratamiento(null);
        }
    });

    const tratamientos = tratamientosRes?.data?.items || tratamientosRes?.data || [];

    const formatPrice = (price) => {
        if (!price) return '0 Gs';
        return new Intl.NumberFormat('es-PY', {
            style: 'decimal',
            minimumFractionDigits: 0
        }).format(price) + ' Gs';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('es-PY', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Calcular total
    const total = tratamientos.reduce((acc, t) => acc + (t.costo || t.COSTO || 0), 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <span className="ml-4 text-slate-500 font-medium">Cargando plan de tratamiento...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-left-2 duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-800">Plan de Tratamiento</h3>
                    <p className="text-slate-500 text-sm mt-1">
                        {tratamientos.length} tratamiento{tratamientos.length !== 1 ? 's' : ''} registrado{tratamientos.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Card de Resumen */}
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Total del Plan</p>
                <p className="text-4xl font-black">{formatPrice(total)}</p>
                <p className="text-sm opacity-80 mt-2">{tratamientos.length} procedimientos</p>
            </div>

            {/* Lista de Tratamientos */}
            {tratamientos.length > 0 ? (
                <div className="space-y-3">
                    {tratamientos.map((trat, idx) => {
                        const dienteNum = trat.numero_fdi || trat.NUMERO_FDI;

                        return (
                            <div
                                key={trat.id || trat.ID || idx}
                                className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all cursor-pointer"
                                onClick={() => setSelectedTratamiento(trat)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-bold text-slate-800 text-lg">
                                                {trat.nombre || trat.NOMBRE || trat.tipo_tratamiento || trat.TIPO_TRATAMIENTO}
                                            </h4>
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700">
                                                Pendiente
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            {dienteNum && (
                                                <span className="flex items-center gap-1">
                                                    <span className="text-slate-400">🦷</span>
                                                    Diente #{dienteNum}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <span className="text-slate-400">📅</span>
                                                {formatDate(trat.fecha_asignacion || trat.FECHA_ASIGNACION)}
                                            </span>
                                            {(trat.doctor_nombre || trat.DOCTOR_NOMBRE) && (
                                                <span className="flex items-center gap-1">
                                                    <span className="text-slate-400">👨‍⚕️</span>
                                                    Dr. {trat.doctor_nombre || trat.DOCTOR_NOMBRE}
                                                </span>
                                            )}
                                        </div>
                                        {(trat.descripcion || trat.DESCRIPCION) && (
                                            <p className="text-xs text-slate-400 mt-2 line-clamp-1">
                                                {trat.descripcion || trat.DESCRIPCION}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black text-emerald-600">
                                            {formatPrice(trat.costo || trat.COSTO)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <div className="text-5xl mb-4">🦷</div>
                    <p className="text-slate-500 font-bold text-lg">No hay tratamientos registrados</p>
                    <p className="text-slate-400 text-sm mt-2">
                        Los tratamientos se agregan desde el odontograma al detectar hallazgos clínicos
                    </p>
                </div>
            )}

            {/* Modal de Detalle */}
            {selectedTratamiento && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200]">
                    <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-[450px] animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-800">Detalle del Tratamiento</h2>
                            <button
                                onClick={() => setSelectedTratamiento(null)}
                                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tratamiento</p>
                                <p className="text-lg font-black text-slate-800">
                                    {selectedTratamiento.nombre || selectedTratamiento.NOMBRE || selectedTratamiento.tipo_tratamiento || selectedTratamiento.TIPO_TRATAMIENTO}
                                </p>
                            </div>

                            {(selectedTratamiento.numero_fdi || selectedTratamiento.NUMERO_FDI) && (
                                <div className="bg-primary/5 p-4 rounded-2xl">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Pieza Dental</p>
                                    <p className="text-lg font-black text-primary">
                                        Diente #{selectedTratamiento.numero_fdi || selectedTratamiento.NUMERO_FDI}
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Costo</p>
                                    <p className="text-xl font-black text-emerald-600">
                                        {formatPrice(selectedTratamiento.costo || selectedTratamiento.COSTO)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha</p>
                                    <p className="font-bold text-slate-700">
                                        {formatDate(selectedTratamiento.fecha_asignacion || selectedTratamiento.FECHA_ASIGNACION)}
                                    </p>
                                </div>
                            </div>

                            {(selectedTratamiento.descripcion || selectedTratamiento.DESCRIPCION) && (
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Descripcion</p>
                                    <p className="text-sm text-slate-600">
                                        {selectedTratamiento.descripcion || selectedTratamiento.DESCRIPCION}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    if (confirm('¿Eliminar este tratamiento?')) {
                                        eliminarMutation.mutate(selectedTratamiento.id || selectedTratamiento.ID);
                                    }
                                }}
                                disabled={eliminarMutation.isPending}
                                className="flex-1 bg-rose-100 text-rose-700 py-4 rounded-2xl font-bold hover:bg-rose-200 transition-all disabled:opacity-50"
                            >
                                {eliminarMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                            </button>
                            <button
                                onClick={() => setSelectedTratamiento(null)}
                                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanTratamiento;
