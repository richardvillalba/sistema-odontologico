import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { odontogramaService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TratamientosPendientes = ({ pacienteId, onAdd, addedItems }) => {
    const { empresaActiva } = useAuth();
    const { data: tratamientosRes, isLoading } = useQuery({
        queryKey: ['tratamientos-pendientes', pacienteId, empresaActiva?.empresa_id],
        queryFn: () => odontogramaService.getTratamientosPaciente(pacienteId, empresaActiva?.empresa_id),
        enabled: !!pacienteId
    });

    const tratamientos = tratamientosRes?.data?.items || tratamientosRes?.data || [];

    const isAlreadyAdded = (tratId) => {
        return addedItems.some(item => item.tratamiento_diente_id === tratId);
    };

    if (isLoading) return (
        <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (tratamientos.length === 0) return (
        <div className="p-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sin tratamientos pendientes</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {tratamientos.map((trat) => {
                const isAdded = isAlreadyAdded(trat.id || trat.ID);
                return (
                    <div
                        key={trat.id || trat.ID}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between h-full ${isAdded
                            ? 'bg-slate-50 border-slate-100 opacity-50 pointer-events-none'
                            : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'
                            }`}
                        onClick={() => !isAdded && onAdd({
                            tratamiento_paciente_id: null, // No vinculamos directamente, solo referencia informativa
                            tratamiento_diente_id: trat.id || trat.ID, // Para mostrar referencia en UI
                            descripcion: trat.nombre || trat.NOMBRE || trat.tipo_tratamiento || trat.TIPO_TRATAMIENTO,
                            cantidad: 1,
                            precio_unitario: trat.costo || trat.COSTO || 0,
                            descuento: 0
                        })}
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 line-clamp-2">
                                    {trat.nombre || trat.NOMBRE || trat.tipo_tratamiento || trat.TIPO_TRATAMIENTO}
                                </h4>
                                {isAdded && (
                                    <span className="bg-emerald-100 text-emerald-700 p-1 rounded-full">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                                {trat.numero_fdi && <span>🦷 Diente #{trat.numero_fdi}</span>}
                                <span>📅 {new Date(trat.fecha_asignacion).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between items-end">
                            <span className="text-lg font-black text-emerald-600">
                                {new Intl.NumberFormat('es-PY').format(trat.costo || trat.COSTO)} Gs
                            </span>
                            {!isAdded && (
                                <span className="text-indigo-600 text-[10px] font-black uppercase bg-indigo-50 px-2 py-1 rounded-md mb-1">
                                    Añadir
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TratamientosPendientes;
