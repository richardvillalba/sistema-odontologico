import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { odontogramaService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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
    const { usuario, empresaActiva } = useAuth();
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

    // Cargar tratamientos asignados a este diente
    const { data: tratamientosDienteRes, isLoading: loadingTratamientos } = useQuery({
        queryKey: ['tratamientos-diente', diente.diente_id],
        queryFn: () => odontogramaService.getTratamientosDiente(diente.diente_id).then(res => res.data),
        enabled: !!diente.diente_id,
    });

    // Cargar tratamientos sugeridos basados en el tipo de hallazgo seleccionado
    const { data: sugeridosRes, isLoading: loadingSugeridos } = useQuery({
        queryKey: ['tratamientos-sugeridos', nuevoHallazgo.tipo_hallazgo],
        queryFn: () => odontogramaService.getTratamientosSugeridos(nuevoHallazgo.tipo_hallazgo).then(res => res.data),
        enabled: activeTab === 'nuevo' && !!nuevoHallazgo.tipo_hallazgo,
    });

    // Mutation para registrar hallazgo
    const registrarHallazgo = useMutation({
        mutationFn: (data) => odontogramaService.registrarHallazgo(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['hallazgos', diente.diente_id]);
            queryClient.invalidateQueries(['odontograma-hallazgos-all']);
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

    // Mutation para asignar tratamiento
    const asignarTratamiento = useMutation({
        mutationFn: ({ catalogoId }) => odontogramaService.asignarTratamiento(diente.diente_id, catalogoId, usuario?.usuario_id),
        onSuccess: () => {
            queryClient.invalidateQueries(['tratamientos-diente', diente.diente_id]);
            setActiveTab('tratamientos');
        },
    });

    // Mutation para eliminar tratamiento
    const eliminarTratamiento = useMutation({
        mutationFn: (id) => odontogramaService.eliminarTratamiento(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['tratamientos-diente', diente.diente_id]);
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
            doctor_id: usuario?.usuario_id,
            empresa_id: empresaActiva?.empresa_id,
        });
    };

    const handleAsignarSugerido = (catalogoId) => {
        asignarTratamiento.mutate({ catalogoId });
    };

    const hallazgos = hallazgosData?.items || [];
    const estadoActual = ESTADOS.find(e => e.value === diente.estado);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 sm:py-6 border-b border-slate-200 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                Diente {diente.numero_fdi}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                {diente.tipo_diente?.replace('_', ' ')}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 sm:p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5 sm:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Estado actual highlight */}
                    <div className="mt-4 sm:mt-5 flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border border-slate-100"
                                style={{
                                    backgroundColor: estadoActual?.color,
                                    color: estadoActual?.value === 'AUSENTE' ? '#fff' : '#1E293B'
                                }}
                            >
                                {estadoActual?.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Estado Actual</p>
                                <p className="font-black text-slate-700 mt-1">{estadoActual?.label}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs with scroll for mobile */}
                <div className="border-b border-slate-200 bg-white shrink-0">
                    <div className="flex overflow-x-auto no-scrollbar scroll-smooth px-2">
                        {[
                            { id: 'estado', label: 'Estado', icon: '🦷' },
                            { id: 'hallazgos', label: `Hallazgos (${hallazgos.length})`, icon: '🔍' },
                            { id: 'tratamientos', label: `Plan (${tratamientosDienteRes?.items?.length || 0})`, icon: '📋' },
                            { id: 'nuevo', label: 'Nuevo', icon: '➕' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex-1 min-w-[100px] sm:min-w-0 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-b-2 ${activeTab === t.id
                                    ? 'text-primary border-primary bg-blue-50/10'
                                    : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50/50'
                                    }`}
                            >
                                <span className="text-sm">{t.icon}</span>
                                <span className="whitespace-nowrap">{t.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content area */}
                <div className="p-6 sm:p-8 overflow-y-auto min-h-[400px]">
                    {/* Tab: Cambiar Estado */}
                    {activeTab === 'estado' && (
                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {ESTADOS.map((estado) => (
                                <button
                                    key={estado.value}
                                    onClick={() => onEstadoChange(estado.value)}
                                    disabled={isUpdating || estado.value === diente.estado}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all relative group h-24 sm:h-auto ${estado.value === diente.estado
                                        ? 'border-primary bg-primary/5 ring-4 ring-primary/5 scale-[0.98]'
                                        : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-white active:scale-95'
                                        } disabled:opacity-40 disabled:scale-100`}
                                >
                                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3">
                                        <div
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl shadow-lg transition-transform group-hover:rotate-6 sm:group-hover:rotate-0"
                                            style={{
                                                backgroundColor: estado.color,
                                                color: estado.value === 'AUSENTE' ? '#fff' : '#1E293B'
                                            }}
                                        >
                                            {estado.icon}
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <span className="font-black text-slate-700 text-[10px] sm:text-xs uppercase tracking-widest leading-none block sm:inline">
                                                {estado.label}
                                            </span>
                                        </div>
                                    </div>
                                    {estado.value === diente.estado && (
                                        <div className="absolute top-2 right-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Tab: Hallazgos */}
                    {activeTab === 'hallazgos' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {loadingHallazgos ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cargando registros...</p>
                                </div>
                            ) : hallazgos.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-2 border-slate-100">
                                        <span className="text-4xl opacity-20">📭</span>
                                    </div>
                                    <p className="text-slate-600 font-black text-lg">Sin hallazgos clínicos</p>
                                    <p className="text-slate-400 font-medium text-sm mt-2 max-w-[200px] mx-auto">Comience registrando un nuevo hallazgo para este diente.</p>
                                    <button
                                        onClick={() => setActiveTab('nuevo')}
                                        className="mt-6 text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 px-6 py-3 rounded-xl transition-all"
                                    >
                                        Registrar Hallazgo +
                                    </button>
                                </div>
                            ) : (
                                hallazgos.map((h) => (
                                    <div
                                        key={h.hallazgo_id}
                                        className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-slate-800 text-sm sm:text-base uppercase tracking-tight">
                                                        {h.tipo_hallazgo}
                                                    </span>
                                                    {h.superficies_afectadas && (
                                                        <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-black text-slate-500 rounded-md">
                                                            S: {h.superficies_afectadas}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400 font-bold">
                                                    Dr. {h.doctor_nombre} • {new Date(h.fecha_deteccion).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] sm:text-xs px-3 py-1 rounded-full font-black uppercase tracking-widest ${h.severidad === 'LEVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                h.severidad === 'MODERADA' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    'bg-rose-50 text-rose-600 border border-rose-100'
                                                }`}>
                                                {h.severidad}
                                            </span>
                                        </div>
                                        {h.descripcion && (
                                            <p className="text-sm text-slate-600 mt-4 leading-relaxed bg-slate-50/50 p-4 rounded-2xl italic font-medium">"{h.descripcion}"</p>
                                        )}
                                        {h.requiere_tratamiento === 'S' && (
                                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                                <span className="text-[10px] text-orange-600 font-black uppercase tracking-widest">Requiere Tratamiento</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Tab: Tratamientos */}
                    {activeTab === 'tratamientos' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {loadingTratamientos ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Consultando plan...</p>
                                </div>
                            ) : !tratamientosDienteRes?.items?.length ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-2 border-slate-100">
                                        <span className="text-4xl opacity-20">📋</span>
                                    </div>
                                    <p className="text-slate-600 font-black text-lg">No hay tratamientos</p>
                                    <p className="text-slate-400 font-medium text-sm mt-2 max-w-[200px] mx-auto">Este diente no tiene procedimientos asignados actualmente.</p>
                                </div>
                            ) : (
                                tratamientosDienteRes.items.map((t) => (
                                    <div
                                        key={t.id}
                                        className="bg-blue-50/50 rounded-3xl p-5 border border-blue-100/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden group"
                                    >
                                        <div className="relative z-10 flex-1 w-full">
                                            <div className="flex justify-between items-start w-full">
                                                <span className="font-black text-blue-900 text-sm sm:text-base uppercase tracking-tight">
                                                    {t.nombre}
                                                </span>
                                                <span className="sm:hidden font-black text-blue-700 bg-white px-3 py-1 rounded-xl shadow-sm text-sm border border-blue-100">
                                                    {new Intl.NumberFormat('es-PY').format(t.costo)} Gs
                                                </span>
                                            </div>
                                            <p className="text-xs text-blue-600 mt-2 font-medium leading-relaxed line-clamp-2">{t.descripcion}</p>
                                            <div className="flex items-center gap-3 mt-4 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-1">🧑‍⚕️ {t.doctor_nombre || 'Asignado'}</span>
                                                <span className="hidden sm:inline font-black text-blue-800 bg-white/50 px-3 py-1 rounded-lg border border-blue-100/50">
                                                    {new Intl.NumberFormat('es-PY').format(t.costo)} Gs
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm('¿Desea eliminar este tratamiento?')) {
                                                    eliminarTratamiento.mutate(t.id);
                                                }
                                            }}
                                            className="self-end sm:self-center p-3 bg-white border border-rose-100 text-rose-500 rounded-2xl hover:bg-rose-50 hover:text-rose-700 transition-all shadow-sm hover:shadow-md"
                                            title="Eliminar tratamiento"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Tab: Nuevo Hallazgo */}
                    {activeTab === 'nuevo' && (
                        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Tipo de hallazgo */}
                            <div className="space-y-2 group">
                                <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">
                                    Tipo de Hallazgo
                                </label>
                                <select
                                    value={nuevoHallazgo.tipo_hallazgo}
                                    onChange={(e) => setNuevoHallazgo(prev => ({
                                        ...prev,
                                        tipo_hallazgo: e.target.value
                                    }))}
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-0 focus:border-primary/50 focus:bg-white transition-all appearance-none"
                                >
                                    {TIPOS_HALLAZGO.map(tipo => (
                                        <option key={tipo} value={tipo}>{tipo}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Superficies afectadas */}
                            <div className="space-y-3 group">
                                <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">
                                    Superficies Afectadas
                                </label>
                                <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                                    {SUPERFICIES.map(sup => (
                                        <button
                                            key={sup.value}
                                            type="button"
                                            onClick={() => handleSuperficieToggle(sup.value)}
                                            className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${nuevoHallazgo.superficies.includes(sup.value)
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                : 'bg-white text-slate-500 border-slate-50 hover:border-slate-200'
                                                }`}
                                        >
                                            {sup.label.split('/')[0]} ({sup.value})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Severidad */}
                            <div className="space-y-3 group">
                                <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">
                                    Nivel de Severidad
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
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${nuevoHallazgo.severidad === sev
                                                ? sev === 'LEVE' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' :
                                                    sev === 'MODERADA' ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' :
                                                        'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20'
                                                : 'bg-white text-slate-400 border-slate-50 hover:border-slate-200'
                                                }`}
                                        >
                                            {sev}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="space-y-2 group">
                                <label className="block text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">
                                    Observaciones / Descripción
                                </label>
                                <textarea
                                    value={nuevoHallazgo.descripcion}
                                    onChange={(e) => setNuevoHallazgo(prev => ({
                                        ...prev,
                                        descripcion: e.target.value
                                    }))}
                                    rows={3}
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-0 focus:border-primary/50 focus:bg-white transition-all resize-none italic"
                                    placeholder="Ej: Caries profunda con compromiso distal..."
                                />
                            </div>

                            {/* Requiere tratamiento checkbox */}
                            <label className="flex items-center gap-4 p-4 bg-orange-50/30 border-2 border-dashed border-orange-100 rounded-2xl cursor-pointer hover:bg-orange-50/50 transition-all">
                                <input
                                    type="checkbox"
                                    checked={nuevoHallazgo.requiere_tratamiento === 'S'}
                                    onChange={(e) => setNuevoHallazgo(prev => ({
                                        ...prev,
                                        requiere_tratamiento: e.target.checked ? 'S' : 'N'
                                    }))}
                                    className="w-6 h-6 rounded-lg border-2 border-orange-200 text-orange-500 focus:ring-orange-500/20"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-black text-orange-800 uppercase tracking-tight">Requiere Tratamiento</p>
                                    <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Abre sugerencias de presupuesto</p>
                                </div>
                            </label>

                            {/* Botón guardar hallazgo fix: move up to ensure visibility */}
                            <div className="pt-4">
                                <button
                                    onClick={handleSubmitHallazgo}
                                    disabled={registrarHallazgo.isPending}
                                    className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {registrarHallazgo.isPending ? (
                                        <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Registrar Hallazgo
                                            <span className="text-xl">💾</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Tratamientos Sugeridos Section */}
                            {nuevoHallazgo.requiere_tratamiento === 'S' && sugeridosRes?.items?.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-slate-100 animate-in zoom-in-95 duration-500">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        ✨ Sugerencias Inteligentes
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {sugeridosRes.items.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => handleAsignarSugerido(s.id)}
                                                disabled={asignarTratamiento.isPending}
                                                className="w-full flex items-center justify-between p-4 rounded-3xl bg-orange-50/50 border border-orange-100 hover:bg-white hover:border-orange-400 transition-all text-left shadow-sm group active:scale-95"
                                            >
                                                <div className="flex-1 pr-4">
                                                    <p className="text-xs font-black text-orange-900 uppercase tracking-tight group-hover:text-orange-600">
                                                        {s.nombre}
                                                    </p>
                                                    <p className="text-[10px] text-orange-500 font-bold mt-1 line-clamp-1">{s.descripcion}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-xs font-black text-orange-900">
                                                        {new Intl.NumberFormat('es-PY').format(s.costo_base)} Gs
                                                    </p>
                                                    <span className="text-[9px] text-white bg-orange-500 px-2 py-0.5 rounded-lg font-black uppercase tracking-wider mt-1 inline-block">Asignar +</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer simple for mobile */}
                <div className="bg-slate-50 px-6 py-5 border-t border-slate-200 shrink-0 sm:hidden">
                    <button
                        onClick={onClose}
                        className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] hover:text-slate-600 transition-all bg-white border border-slate-200 rounded-2xl shadow-sm"
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DienteModal;
