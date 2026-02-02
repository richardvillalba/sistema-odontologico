import React, { useState, useEffect } from 'react';
import { odontogramaService } from '../../services/api';

const ESTADOS_DIENTE = [
    { id: 'SANO', nombre: 'Bio-Íntegro / Sano', color: '#F1F5F9' },
    { id: 'CARIES', nombre: 'Caries Dental', color: '#F87171' },
    { id: 'OBTURADO', nombre: 'Restauración / Obturado', color: '#60A5FA' },
    { id: 'AUSENTE', nombre: 'Diente Ausente', color: '#94A3B8' },
    { id: 'CORONA', nombre: 'Corona Protésica', color: '#C084FC' },
    { id: 'ENDODONCIA', nombre: 'Tratamiento de Conducto', color: '#FBBF24' },
    { id: 'IMPLANTE', nombre: 'Implante Dental', color: '#2DD4BF' },
    { id: 'PROTESIS', nombre: 'Prótesis', color: '#FB923C' },
    { id: 'FRACTURADO', nombre: 'Fractura Dental', color: '#E11D48' },
    { id: 'EXTRACCION_INDICADA', nombre: 'Extracción Indicada', color: '#000000' }
];

const ESTADO_TRATAMIENTO_COLORS = {
    'PENDIENTE': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    'EN_PROGRESO': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    'COMPLETADO': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    'CANCELADO': { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' }
};

const FindingSelector = ({ toothPos, surface, dienteId, initialHistory = [], onSelect, onCancel }) => {
    const [observations, setObservations] = useState('');
    const [activeTab, setActiveTab] = useState('hallazgo'); // 'hallazgo' | 'tratamientos'
    const [step, setStep] = useState('select'); // 'select' | 'sugeridos'
    const [selectedHallazgo, setSelectedHallazgo] = useState(null);
    const [tratamientosSugeridos, setTratamientosSugeridos] = useState([]);
    const [tratamientosAsignados, setTratamientosAsignados] = useState([]);
    const [loadingTratamientos, setLoadingTratamientos] = useState(false);
    const [loadingAsignados, setLoadingAsignados] = useState(false);

    // Cargar tratamientos asignados al montar
    useEffect(() => {
        if (dienteId) {
            loadTratamientosAsignados();
        }
    }, [dienteId]);

    const loadTratamientosAsignados = async () => {
        if (!dienteId) return;
        setLoadingAsignados(true);
        try {
            const response = await odontogramaService.getTratamientosDiente(dienteId);
            const items = response.data?.items || response.data || [];
            setTratamientosAsignados(items);
        } catch (error) {
            console.error('Error cargando tratamientos asignados:', error);
        } finally {
            setLoadingAsignados(false);
        }
    };

    const handleHallazgoSelect = async (hallazgo) => {
        setSelectedHallazgo(hallazgo);

        // Si es SANO, no hay tratamiento que sugerir
        if (hallazgo.id === 'SANO') {
            onSelect(hallazgo.id, observations);
            return;
        }

        // Buscar tratamientos sugeridos
        setLoadingTratamientos(true);
        try {
            const response = await odontogramaService.getTratamientosSugeridos(hallazgo.id);
            const items = response.data?.items || response.data || [];
            setTratamientosSugeridos(items);
            setStep('sugeridos');
        } catch (error) {
            console.error('Error cargando tratamientos sugeridos:', error);
            // Si falla, continuar sin tratamientos
            onSelect(hallazgo.id, observations);
        } finally {
            setLoadingTratamientos(false);
        }
    };

    const handleTratamientoSelect = (tratamiento) => {
        onSelect(selectedHallazgo.id, observations, tratamiento);
    };

    const handleSkipTratamiento = () => {
        onSelect(selectedHallazgo.id, observations);
    };

    const formatPrice = (price) => {
        if (!price) return 'Consultar';
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

    const getEstadoStyle = (estado) => {
        return ESTADO_TRATAMIENTO_COLORS[estado] || ESTADO_TRATAMIENTO_COLORS['PENDIENTE'];
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200]">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-[550px] animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase">
                        Diente #{toothPos}
                    </h2>
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => { setActiveTab('hallazgo'); setStep('select'); }}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === 'hallazgo'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                        Nuevo Hallazgo
                    </button>
                    <button
                        onClick={() => setActiveTab('tratamientos')}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${
                            activeTab === 'tratamientos'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                        Tratamientos
                        {tratamientosAsignados.length > 0 && (
                            <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                                activeTab === 'tratamientos' ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white'
                            }`}>
                                {tratamientosAsignados.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* TAB: Nuevo Hallazgo */}
                    {activeTab === 'hallazgo' && step === 'select' && (
                        <>
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {ESTADOS_DIENTE.map(tipo => (
                                    <button
                                        key={tipo.id}
                                        className="text-left p-3 border border-slate-100 rounded-xl hover:bg-primary/5 hover:border-primary/20 flex items-center transition-all group"
                                        onClick={() => handleHallazgoSelect(tipo)}
                                        disabled={loadingTratamientos}
                                    >
                                        <span
                                            className="w-4 h-4 rounded-full mr-3 border border-slate-200 flex-shrink-0"
                                            style={{ backgroundColor: tipo.color }}
                                        />
                                        <span className="text-[11px] font-bold text-slate-700 leading-tight">{tipo.nombre}</span>
                                    </button>
                                ))}
                            </div>

                            {/* History Section */}
                            {initialHistory && initialHistory.length > 0 && (
                                <div className="mb-6 bg-slate-50 p-4 rounded-2xl max-h-[150px] overflow-y-auto custom-scrollbar">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 sticky top-0 bg-slate-50">Historial Clínico</p>
                                    <div className="space-y-2">
                                        {initialHistory.map((h, idx) => (
                                            <div key={idx} className="text-xs border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                                                <div className="flex justify-between font-bold text-slate-700">
                                                    <span>{h.tipo_hallazgo || h.TIPO_HALLAZGO}</span>
                                                    <span className="text-slate-400 text-[10px]">{formatDate(h.fecha_deteccion || h.FECHA_DETECCION)}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-1">
                                                    <span className="font-semibold">Dr. {h.doctor_nombre || h.DOCTOR_NOMBRE || 'Sistema'}</span>
                                                    {(h.descripcion || h.DESCRIPCION) && <span className="block italic mt-0.5">"{h.descripcion || h.DESCRIPCION}"</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Notas Clínicas</label>
                                <textarea
                                    className="w-full border border-slate-100 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/20 outline-none transition-all placeholder:text-slate-300"
                                    rows={2}
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                    placeholder="Describa el estado o tratamiento necesario..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-50">
                                <button
                                    className="flex-1 px-4 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs uppercase tracking-widest"
                                    onClick={onCancel}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="flex-1 bg-primary text-white px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
                                    onClick={() => onSelect('SANO', observations)}
                                >
                                    Marcar como Sano
                                </button>
                            </div>
                        </>
                    )}

                    {/* STEP: Tratamientos Sugeridos */}
                    {activeTab === 'hallazgo' && step === 'sugeridos' && (
                        <>
                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6">
                                <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Hallazgo Detectado</p>
                                <p className="text-lg font-black text-amber-800">{selectedHallazgo?.nombre}</p>
                            </div>

                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tratamientos Recomendados</p>

                            {loadingTratamientos ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <span className="ml-3 text-slate-500 font-medium">Cargando...</span>
                                </div>
                            ) : tratamientosSugeridos.length > 0 ? (
                                <div className="space-y-3 mb-6">
                                    {tratamientosSugeridos.map((trat, idx) => (
                                        <button
                                            key={trat.id || trat.ID || idx}
                                            className="w-full text-left p-4 border border-slate-100 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                                            onClick={() => handleTratamientoSelect(trat)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-800 group-hover:text-emerald-700">
                                                        {trat.nombre || trat.NOMBRE}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {trat.categoria || trat.CATEGORIA}
                                                    </p>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <p className="text-lg font-black text-emerald-600">
                                                        {formatPrice(trat.costo_base || trat.COSTO_BASE)}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                                        {trat.duracion_estimada || trat.DURACION_ESTIMADA || '30'} min
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-slate-50 rounded-2xl mb-6">
                                    <p className="text-slate-400 font-medium">No hay tratamientos sugeridos</p>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4 border-t border-slate-50">
                                <button
                                    className="flex-1 px-4 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs uppercase tracking-widest"
                                    onClick={() => setStep('select')}
                                >
                                    ← Volver
                                </button>
                                <button
                                    className="flex-1 bg-slate-200 text-slate-700 px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 transition-all"
                                    onClick={handleSkipTratamiento}
                                >
                                    Solo Hallazgo
                                </button>
                            </div>
                        </>
                    )}

                    {/* TAB: Tratamientos Asignados */}
                    {activeTab === 'tratamientos' && (
                        <>
                            {loadingAsignados ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                    <span className="ml-3 text-slate-500 font-medium">Cargando tratamientos...</span>
                                </div>
                            ) : tratamientosAsignados.length > 0 ? (
                                <div className="space-y-3">
                                    {tratamientosAsignados.map((trat, idx) => {
                                        const estado = trat.estado || trat.ESTADO || 'PENDIENTE';
                                        const estilos = getEstadoStyle(estado);
                                        return (
                                            <div
                                                key={trat.id || trat.ID || idx}
                                                className={`p-4 rounded-xl border ${estilos.border} ${estilos.bg}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-slate-800">
                                                            {trat.nombre || trat.NOMBRE || trat.tratamiento_nombre || trat.TRATAMIENTO_NOMBRE}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {trat.categoria || trat.CATEGORIA}
                                                        </p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${estilos.bg} ${estilos.text}`}>
                                                        {estado.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-end mt-3 pt-3 border-t border-slate-200/50">
                                                    <div className="text-[10px] text-slate-500">
                                                        <p>Asignado: {formatDate(trat.fecha_asignacion || trat.FECHA_ASIGNACION)}</p>
                                                        {(trat.doctor_nombre || trat.DOCTOR_NOMBRE) && (
                                                            <p className="mt-0.5">Dr. {trat.doctor_nombre || trat.DOCTOR_NOMBRE}</p>
                                                        )}
                                                    </div>
                                                    <p className="text-lg font-black text-slate-700">
                                                        {formatPrice(trat.costo || trat.COSTO || trat.costo_base || trat.COSTO_BASE)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-2xl">
                                    <div className="text-4xl mb-3">🦷</div>
                                    <p className="text-slate-500 font-medium">No hay tratamientos asignados</p>
                                    <p className="text-slate-400 text-sm mt-1">Registre un hallazgo para sugerir tratamientos</p>
                                </div>
                            )}

                            <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100">
                                <button
                                    className="flex-1 px-4 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors text-xs uppercase tracking-widest"
                                    onClick={onCancel}
                                >
                                    Cerrar
                                </button>
                                <button
                                    className="flex-1 bg-primary text-white px-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
                                    onClick={() => { setActiveTab('hallazgo'); setStep('select'); }}
                                >
                                    + Nuevo Hallazgo
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindingSelector;
