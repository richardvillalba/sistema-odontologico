import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { odontogramaService, pacientesService } from '../services/api';
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
    const queryClient = useQueryClient();
    const [selectedDiente, setSelectedDiente] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Cargar datos del paciente
    const { data: paciente } = useQuery({
        queryKey: ['paciente', pacienteId],
        queryFn: () => pacientesService.getById(pacienteId).then(res => res.data),
    });

    // Cargar odontograma actual
    const { data: odontograma, isLoading, error } = useQuery({
        queryKey: ['odontograma', pacienteId],
        queryFn: () => odontogramaService.getActual(pacienteId).then(res => res.data),
    });

    // Mutation para crear odontograma
    const crearOdontograma = useMutation({
        mutationFn: (data) => odontogramaService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['odontograma', pacienteId]);
        },
    });

    // Mutation para actualizar diente
    const actualizarDiente = useMutation({
        mutationFn: ({ odontogramaId, data }) =>
            odontogramaService.actualizarDiente(odontogramaId, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['odontograma', pacienteId]);
        },
    });

    // Organizar dientes por número FDI
    const dientesPorNumero = {};
    if (odontograma?.dientes) {
        odontograma.dientes.forEach(d => {
            dientesPorNumero[d.numero_fdi] = d;
        });
    }

    // Arcadas dentales (numeración FDI)
    const arcadaSuperior = [
        [18, 17, 16, 15, 14, 13, 12, 11],
        [21, 22, 23, 24, 25, 26, 27, 28]
    ];

    const arcadaInferior = [
        [48, 47, 46, 45, 44, 43, 42, 41],
        [31, 32, 33, 34, 35, 36, 37, 38]
    ];

    const handleDienteClick = (numeroFdi) => {
        const diente = dientesPorNumero[numeroFdi];
        if (diente) {
            setSelectedDiente(diente);
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDiente(null);
    };

    const handleEstadoChange = async (nuevoEstado) => {
        if (!selectedDiente || !odontograma) return;

        await actualizarDiente.mutateAsync({
            odontogramaId: odontograma.odontograma_id,
            data: {
                numero_fdi: selectedDiente.numero_fdi,
                estado: nuevoEstado,
            }
        });
        handleCloseModal();
    };

    const handleCrearOdontograma = () => {
        crearOdontograma.mutate({
            paciente_id: parseInt(pacienteId),
            empresa_id: 1,
            tipo: 'PERMANENTE',
            observaciones: 'Odontograma inicial',
            creado_por: 1, // TODO: usar usuario logueado
        });
    };

    const getDienteColor = (numeroFdi) => {
        const diente = dientesPorNumero[numeroFdi];
        if (!diente) return '#F1F5F9';
        return ESTADO_COLORES[diente.estado] || '#F1F5F9';
    };

    const renderArcada = (arcada) => (
        <div className="flex justify-center gap-1 md:gap-2 flex-wrap">
            {arcada[0].map(num => (
                <div
                    key={num}
                    onClick={() => handleDienteClick(num)}
                    className="flex flex-col items-center cursor-pointer group"
                >
                    <span className="text-[10px] font-bold text-slate-400 mb-1 group-hover:text-primary">
                        {num}
                    </span>
                    <div
                        className="w-10 h-10 rounded-lg border-2 border-slate-200 group-hover:border-primary group-hover:scale-110 transition-all shadow-sm"
                        style={{ backgroundColor: getDienteColor(num) }}
                    />
                </div>
            ))}

            <div className="w-4" /> {/* Separador central */}

            {arcada[1].map(num => (
                <div
                    key={num}
                    onClick={() => handleDienteClick(num)}
                    className="flex flex-col items-center cursor-pointer group"
                >
                    <span className="text-[10px] font-bold text-slate-400 mb-1 group-hover:text-primary">
                        {num}
                    </span>
                    <div
                        className="w-10 h-10 rounded-lg border-2 border-slate-200 group-hover:border-primary group-hover:scale-110 transition-all shadow-sm"
                        style={{ backgroundColor: getDienteColor(num) }}
                    />
                </div>
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
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link to={`/pacientes/${pacienteId}`} className="text-slate-400 hover:text-primary">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Odontograma</h1>
                        {paciente?.items?.[0] && (
                            <p className="text-slate-500">
                                {paciente.items[0].nombre} {paciente.items[0].apellido}
                            </p>
                        )}
                    </div>
                </div>

                {/* No hay odontograma */}
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <div className="text-6xl mb-4">🦷</div>
                    <h2 className="text-xl font-bold text-slate-700 mb-2">
                        No hay odontograma registrado
                    </h2>
                    <p className="text-slate-500 mb-6">
                        Este paciente aún no tiene un odontograma. Crea uno para comenzar a registrar el estado dental.
                    </p>
                    <button
                        onClick={handleCrearOdontograma}
                        disabled={crearOdontograma.isPending}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
                    >
                        {crearOdontograma.isPending ? 'Creando...' : 'Crear Odontograma'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to={`/pacientes/${pacienteId}`} className="text-slate-400 hover:text-primary">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Odontograma</h1>
                        <p className="text-slate-500">
                            {odontograma.paciente_nombre} - {odontograma.numero_historia}
                        </p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                    {odontograma.tipo}
                </span>
            </div>

            {/* Leyenda */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap gap-4 justify-center">
                    {Object.entries(ESTADO_COLORES).map(([estado, color]) => (
                        <div key={estado} className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded border border-slate-300"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-xs text-slate-600 capitalize">
                                {estado.toLowerCase().replace('_', ' ')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Odontograma Visual */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
                <div className="space-y-8">
                    {/* Arcada Superior */}
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-4">
                            Arcada Superior
                        </p>
                        {renderArcada(arcadaSuperior)}
                    </div>

                    {/* Separador */}
                    <div className="h-px bg-slate-200" />

                    {/* Arcada Inferior */}
                    <div>
                        {renderArcada(arcadaInferior)}
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mt-4">
                            Arcada Inferior
                        </p>
                    </div>
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
