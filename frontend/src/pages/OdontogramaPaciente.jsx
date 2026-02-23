import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { odontogramaService, pacientesService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Diente from '../components/odontograma/Diente';
import DienteModal from '../components/odontograma/DienteModal';

// Mapeo de estados a colores
const ESTADO_COLORES = {
    'SANO': '#F1F5F9',
    'CARIES': '#F87171',
    'OBTURADO': '#60A5FA',
    'AUSENTE': '#1E293B',
    'CORONA': '#A78BFA',
    'ENDODONCIA': '#FBBF24',
    'IMPLANTE': '#34D399',
    'PROTESIS': '#F472B6',
    'FRACTURADO': '#FB923C',
    'EXTRACCION_INDICADA': '#EF4444',
};

const OdontogramaPaciente = () => {
    const { id: pacienteId } = useParams();
    const { empresaActiva } = useAuth();
    const queryClient = useQueryClient();
    const [selectedDiente, setSelectedDiente] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [viewMode, setViewMode] = useState('ALL'); // 'ALL', 'UPPER', 'LOWER'

    // Cargar datos del paciente
    const { data: paciente } = useQuery({
        queryKey: ['paciente', pacienteId],
        queryFn: () => pacientesService.getById(pacienteId).then(res => res.data),
    });

    // Cargar odontograma actual
    const { data: odontograma, isLoading, error } = useQuery({
        queryKey: ['odontograma', pacienteId, empresaActiva?.empresa_id],
        queryFn: () => odontogramaService.getActual(pacienteId, empresaActiva?.empresa_id).then(res => res.data),
    });

    // Cargar todos los hallazgos del paciente (para visualización en el odontograma)
    const { data: allHallazgosRes } = useQuery({
        queryKey: ['odontograma-hallazgos-all', pacienteId, empresaActiva?.empresa_id],
        queryFn: () => odontogramaService.getHallazgosAll(pacienteId, empresaActiva?.empresa_id).then(res => res.data),
        enabled: !!odontograma,
    });

    // Mutation para crear odontograma
    // ... existing mutations ...

    // Organizar hallazgos por número FDI para pasarlos al componente Diente
    const hallazgosPorDiente = {};
    if (allHallazgosRes?.items) {
        allHallazgosRes.items.forEach(h => {
            if (!hallazgosPorDiente[h.numero_fdi]) {
                hallazgosPorDiente[h.numero_fdi] = [];
            }
            hallazgosPorDiente[h.numero_fdi].push(h);
        });
    }

    // Organizar dientes por número FDI
    const dientesPorNumero = {};
    if (odontograma?.dientes) {
        odontograma.dientes.forEach(d => {
            dientesPorNumero[d.numero_fdi] = d;
        });
    }

    // ... arcadas definition ...

    const handleDienteClick = (numeroFdi) => {
        const diente = dientesPorNumero[numeroFdi];
        if (diente) {
            setSelectedDiente(diente);
            setShowModal(true);
        }
    };

    // ... handles ...

    const renderArcada = (arcada) => (
        <div className="flex justify-center gap-1 md:gap-2 flex-wrap min-w-max">
            {arcada[0].map(num => (
                <Diente
                    key={num}
                    numero={num}
                    hallazgos={hallazgosPorDiente[num] || []}
                    onClick={() => handleDienteClick(num)}
                />
            ))}

            <div className="w-8" /> {/* Separador central más amplio */}

            {arcada[1].map(num => (
                <Diente
                    key={num}
                    numero={num}
                    hallazgos={hallazgosPorDiente[num] || []}
                    onClick={() => handleDienteClick(num)}
                />
            ))}
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Si no hay odontograma, mostrar botón para crear
    if (!odontograma?.success || !odontograma?.dientes?.length) {
        // ... (no changes here for now)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-4">
                    <Link to={`/pacientes/${pacienteId}`} className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary transition-all shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Odontograma</h1>
                        <p className="text-slate-500 font-medium text-xs sm:text-sm">
                            {odontograma.paciente_nombre} • <span className="text-primary font-bold">{odontograma.numero_historia}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 bg-slate-100/50 p-2 rounded-2xl sm:bg-transparent sm:p-0">
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-wider border border-blue-100">
                        {odontograma.tipo}
                    </span>

                    {/* View Selector for Mobile */}
                    <div className="flex sm:hidden bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                        {[
                            { id: 'ALL', label: 'Todo' },
                            { id: 'UPPER', label: 'Sup' },
                            { id: 'LOWER', label: 'Inf' }
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setViewMode(m.id)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${viewMode === m.id ? 'bg-primary text-white shadow-md' : 'text-slate-400'}`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leyenda */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm overflow-x-auto no-scrollbar">
                <div className="flex gap-4 sm:gap-6 justify-start sm:justify-center min-w-max">
                    {[
                        { color: 'bg-red-500', label: 'Caries' },
                        { color: 'bg-blue-500', label: 'Obturación' },
                        { color: 'bg-amber-500', label: 'Otros' },
                    ].map(l => (
                        <div key={l.label} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${l.color} shadow-sm`} />
                            <span className="text-[10px] sm:text-xs font-bold text-slate-600 whitespace-nowrap uppercase tracking-tight">{l.label}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-0.5 bg-slate-300 rounded-full" />
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-tight">Sano</span>
                    </div>
                </div>
            </div>

            {/* Odontograma Visual */}
            <div className="bg-white rounded-[2rem] sm:rounded-3xl border border-slate-200 p-4 sm:p-8 shadow-md overflow-x-auto no-scrollbar scroll-smooth">
                <div className={`space-y-8 sm:space-y-12 min-w-max mx-auto max-w-4xl transition-all duration-500 ${viewMode !== 'ALL' ? 'py-10' : ''}`}>
                    {/* Arcada Superior */}
                    {(viewMode === 'ALL' || viewMode === 'UPPER') && (
                        <div className="relative animate-in fade-in slide-in-from-top-4 duration-500">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-center absolute -top-6 w-full">
                                Arcada Superior
                            </p>
                            <div className="md:scale-100 scale-110 sm:scale-125 transition-transform origin-center">
                                {renderArcada(arcadaSuperior)}
                            </div>
                        </div>
                    )}

                    {/* Línea Divisoria Estética */}
                    {viewMode === 'ALL' && (
                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px bg-slate-100 flex-1" />
                            <div className="w-2 h-2 rounded-full bg-slate-200" />
                            <div className="h-px bg-slate-100 flex-1" />
                        </div>
                    )}

                    {/* Arcada Inferior */}
                    {(viewMode === 'ALL' || viewMode === 'LOWER') && (
                        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="md:scale-100 scale-110 sm:scale-125 transition-transform origin-center">
                                {renderArcada(arcadaInferior)}
                            </div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-center absolute -bottom-6 w-full">
                                Arcada Inferior
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl">💡</span>
                <p className="text-blue-700 text-sm">
                    Haz click en cualquier diente para ver su información y modificar su estado.
                </p>
            </div>

            {/* Modal */}
            {showModal && selectedDiente && (
                <DienteModal
                    diente={selectedDiente}
                    odontogramaId={odontograma.odontograma_id}
                    onClose={handleCloseModal}
                    onEstadoChange={handleEstadoChange}
                    isUpdating={actualizarDiente.isPending}
                />
            )}
        </div>
    );
};

export default OdontogramaPaciente;
