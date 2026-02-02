import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { odontogramaService } from '../../services/api';

const ESTADOS = [
    { value: 'SANO', label: 'Sano', color: '#F1F5F9', icon: '✓' },
    { value: 'CARIES', label: 'Caries', color: '#F87171', icon: '●' },
    { value: 'OBTURADO', label: 'Obturado', color: '#60A5FA', icon: '■' },
    { value: 'AUSENTE', label: 'Ausente', color: '#1E293B', icon: '✕' },
    { value: 'CORONA', label: 'Corona', color: '#A78BFA', icon: '◆' },
    { value: 'ENDODONCIA', label: 'Endodoncia', color: '#FBBF24', icon: '◎' },
    { value: 'IMPLANTE', label: 'Implante', color: '#34D399', icon: '▲' },
    { value: 'PROTESIS', label: 'Prótesis', color: '#F472B6', icon: '◇' },
    { value: 'FRACTURADO', label: 'Fracturado', color: '#FB923C', icon: '⚡' },
    { value: 'EXTRACCION_INDICADA', label: 'Extracción Indicada', color: '#EF4444', icon: '!' },
];

const TIPOS_HALLAZGO = [
    'CARIES',
    'FRACTURA',
    'DESGASTE',
    'MOVILIDAD',
    'GINGIVITIS',
    'PERIODONTITIS',
    'SENSIBILIDAD',
    'ABSCESO',
    'OTRO',
];

const SUPERFICIES = [
    { value: 'O', label: 'Oclusal' },
    { value: 'M', label: 'Mesial' },
    { value: 'D', label: 'Distal' },
    { value: 'V', label: 'Vestibular' },
    { value: 'P', label: 'Palatino/Lingual' },
];

const DienteModal = ({ diente, odontogramaId, onClose, onEstadoChange, isUpdating }) => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('estado');
    const [nuevoHallazgo, setNuevoHallazgo] = useState({
        tipo_hallazgo: 'CARIES',
        superficies: [],
        severidad: 'LEVE',
        descripcion: '',
        requiere_tratamiento: 'S',
    });

    // Cargar hallazgos del diente
    const { data: hallazgosData, isLoading: loadingHallazgos } = useQuery({
        queryKey: ['hallazgos', diente.diente_id],
        queryFn: () => odontogramaService.getHallazgosDiente(diente.diente_id).then(res => res.data),
        enabled: !!diente.diente_id,
    });

    // Mutation para registrar hallazgo
    const registrarHallazgo = useMutation({
        mutationFn: (data) => odontogramaService.registrarHallazgo(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['hallazgos', diente.diente_id]);
            setNuevoHallazgo({
                tipo_hallazgo: 'CARIES',
                superficies: [],
                severidad: 'LEVE',
                descripcion: '',
                requiere_tratamiento: 'S',
            });
            setActiveTab('hallazgos');
        },
    });

    const handleSuperficieToggle = (superficie) => {
        setNuevoHallazgo(prev => ({
            ...prev,
            superficies: prev.superficies.includes(superficie)
                ? prev.superficies.filter(s => s !== superficie)
                : [...prev.superficies, superficie]
        }));
    };

    const handleSubmitHallazgo = () => {
        registrarHallazgo.mutate({
            diente_id: diente.diente_id,
            tipo_hallazgo: nuevoHallazgo.tipo_hallazgo,
            superficies_afectadas: nuevoHallazgo.superficies.join(','),
            severidad: nuevoHallazgo.severidad,
            descripcion: nuevoHallazgo.descripcion,
            requiere_tratamiento: nuevoHallazgo.requiere_tratamiento,
            doctor_id: 1, // TODO: usar usuario logueado
        });
    };

    const hallazgos = hallazgosData?.items || [];
    const estadoActual = ESTADOS.find(e => e.value === diente.estado);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                Diente {diente.numero_fdi}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {diente.tipo_diente?.replace('_', ' ')} - Cuadrante {diente.cuadrante}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 p-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Estado actual */}
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-slate-600">Estado actual:</span>
                        <span
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                                backgroundColor: estadoActual?.color,
                                color: estadoActual?.value === 'AUSENTE' ? '#fff' : '#1E293B'
                            }}
                        >
                            {estadoActual?.icon} {estadoActual?.label}
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('estado')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'estado'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Cambiar Estado
                        </button>
                        <button
                            onClick={() => setActiveTab('hallazgos')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'hallazgos'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Hallazgos ({hallazgos.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('nuevo')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'nuevo'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            + Nuevo Hallazgo
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[50vh]">
                    {/* Tab: Cambiar Estado */}
                    {activeTab === 'estado' && (
                        <div className="grid grid-cols-2 gap-3">
                            {ESTADOS.map((estado) => (
                                <button
                                    key={estado.value}
                                    onClick={() => onEstadoChange(estado.value)}
                                    disabled={isUpdating || estado.value === diente.estado}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                                        estado.value === diente.estado
                                            ? 'border-primary bg-primary/5'
                                            : 'border-slate-200 hover:border-slate-300'
                                    } disabled:opacity-50`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                                            style={{
                                                backgroundColor: estado.color,
                                                color: estado.value === 'AUSENTE' ? '#fff' : '#1E293B'
                                            }}
                                        >
                                            {estado.icon}
                                        </div>
                                        <span className="font-medium text-slate-700">
                                            {estado.label}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Tab: Hallazgos */}
                    {activeTab === 'hallazgos' && (
                        <div className="space-y-3">
                            {loadingHallazgos ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                </div>
                            ) : hallazgos.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <p>No hay hallazgos registrados</p>
                                    <button
                                        onClick={() => setActiveTab('nuevo')}
                                        className="text-primary hover:underline mt-2"
                                    >
                                        Registrar primer hallazgo
                                    </button>
                                </div>
                            ) : (
                                hallazgos.map((h) => (
                                    <div
                                        key={h.hallazgo_id}
                                        className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="font-bold text-slate-800">
                                                    {h.tipo_hallazgo}
                                                </span>
                                                {h.superficies_afectadas && (
                                                    <span className="ml-2 text-sm text-slate-500">
                                                        ({h.superficies_afectadas})
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                h.severidad === 'LEVE' ? 'bg-green-100 text-green-700' :
                                                h.severidad === 'MODERADA' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {h.severidad}
                                            </span>
                                        </div>
                                        {h.descripcion && (
                                            <p className="text-sm text-slate-600 mt-2">{h.descripcion}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                            <span>{h.doctor_nombre}</span>
                                            <span>{new Date(h.fecha_deteccion).toLocaleDateString()}</span>
                                            {h.requiere_tratamiento === 'S' && (
                                                <span className="text-orange-500 font-medium">
                                                    Requiere tratamiento
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Tab: Nuevo Hallazgo */}
                    {activeTab === 'nuevo' && (
                        <div className="space-y-4">
                            {/* Tipo de hallazgo */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Tipo de Hallazgo
                                </label>
                                <select
                                    value={nuevoHallazgo.tipo_hallazgo}
                                    onChange={(e) => setNuevoHallazgo(prev => ({
                                        ...prev,
                                        tipo_hallazgo: e.target.value
                                    }))}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                >
                                    {TIPOS_HALLAZGO.map(tipo => (
                                        <option key={tipo} value={tipo}>{tipo}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Superficies afectadas */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Superficies Afectadas
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SUPERFICIES.map(sup => (
                                        <button
                                            key={sup.value}
                                            type="button"
                                            onClick={() => handleSuperficieToggle(sup.value)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                nuevoHallazgo.superficies.includes(sup.value)
                                                    ? 'bg-primary text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {sup.value} - {sup.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Severidad */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Severidad
                                </label>
                                <div className="flex gap-2">
                                    {['LEVE', 'MODERADA', 'SEVERA'].map(sev => (
                                        <button
                                            key={sev}
                                            type="button"
                                            onClick={() => setNuevoHallazgo(prev => ({
                                                ...prev,
                                                severidad: sev
                                            }))}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                nuevoHallazgo.severidad === sev
                                                    ? sev === 'LEVE' ? 'bg-green-500 text-white' :
                                                      sev === 'MODERADA' ? 'bg-yellow-500 text-white' :
                                                      'bg-red-500 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {sev}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={nuevoHallazgo.descripcion}
                                    onChange={(e) => setNuevoHallazgo(prev => ({
                                        ...prev,
                                        descripcion: e.target.value
                                    }))}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    placeholder="Descripción del hallazgo..."
                                />
                            </div>

                            {/* Requiere tratamiento */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={nuevoHallazgo.requiere_tratamiento === 'S'}
                                    onChange={(e) => setNuevoHallazgo(prev => ({
                                        ...prev,
                                        requiere_tratamiento: e.target.checked ? 'S' : 'N'
                                    }))}
                                    className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-slate-700">Requiere tratamiento</span>
                            </label>

                            {/* Botón guardar */}
                            <button
                                onClick={handleSubmitHallazgo}
                                disabled={registrarHallazgo.isPending}
                                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50"
                            >
                                {registrarHallazgo.isPending ? 'Guardando...' : 'Registrar Hallazgo'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-slate-600 hover:text-slate-800 font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DienteModal;
