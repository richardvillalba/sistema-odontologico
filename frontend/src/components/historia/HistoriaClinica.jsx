import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historiasService, doctoresService, odontogramaService } from '../../services/api';

const HistoriaClinica = ({ pacienteId, paciente }) => {
    const queryClient = useQueryClient();
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [consultaDetalle, setConsultaDetalle] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        motivo_consulta: '',
        anamnesis: '',
        examen_clinico: '',
        diagnostico: '',
        codigo_cie10: '',
        plan_tratamiento: '',
        presion_arterial: '',
        frecuencia_cardiaca: '',
        temperatura: '',
        proxima_cita: '',
        observaciones: '',
        doctor_id: 1
    });

    const { data: historiaRes, isLoading } = useQuery({
        queryKey: ['historia-clinica', pacienteId],
        queryFn: () => historiasService.getByPaciente(pacienteId),
        enabled: !!pacienteId
    });

    const { data: doctoresRes } = useQuery({
        queryKey: ['doctores'],
        queryFn: () => doctoresService.getAll()
    });

    // Datos del odontograma
    const { data: odontogramaRes } = useQuery({
        queryKey: ['odontograma', pacienteId],
        queryFn: () => odontogramaService.getActual(pacienteId),
        enabled: !!pacienteId
    });

    const { data: tratamientosRes } = useQuery({
        queryKey: ['tratamientos-odontograma', pacienteId],
        queryFn: () => odontogramaService.getTratamientosPaciente(pacienteId),
        enabled: !!pacienteId
    });

    const crearHistoriaMutation = useMutation({
        mutationFn: (data) => historiasService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['historia-clinica', pacienteId]);
            setMostrarFormulario(false);
            resetForm();
        },
        onError: (error) => {
            console.error('Error creando historia:', error);
            alert('Error al guardar la consulta');
        }
    });

    const historias = historiaRes?.data?.items || historiaRes?.data || [];
    const doctores = doctoresRes?.data?.items || doctoresRes?.data || [];
    const historiaActual = historias[0];

    // Datos del odontograma
    const odontograma = odontogramaRes?.data?.items?.[0] || odontogramaRes?.data;
    const dientes = odontograma?.dientes || [];
    const tratamientosOdontograma = tratamientosRes?.data?.items || tratamientosRes?.data || [];

    // Filtrar dientes con hallazgos (estado diferente a SANO)
    const dientesConHallazgos = dientes.filter(d => {
        const estado = d.estado || d.ESTADO;
        return estado && estado !== 'SANO' && estado !== 'sano';
    });

    // Generar sugerencias basadas en el odontograma
    const generarSugerenciasOdontograma = () => {
        let examenClinico = '';
        let diagnostico = '';
        let planTratamiento = '';

        // Generar texto de examen clínico basado en hallazgos
        if (dientesConHallazgos.length > 0) {
            const hallazgosPorTipo = {};
            dientesConHallazgos.forEach(d => {
                const estado = (d.estado || d.ESTADO || '').toUpperCase();
                const fdi = d.numero_fdi || d.NUMERO_FDI;
                if (!hallazgosPorTipo[estado]) hallazgosPorTipo[estado] = [];
                hallazgosPorTipo[estado].push(fdi);
            });

            const descripcionesHallazgos = {
                'CARIES': 'Lesión cariosa',
                'FRACTURA': 'Fractura dental',
                'FRACTURADO': 'Pieza fracturada',
                'AUSENTE': 'Pieza ausente',
                'ENDODONCIA': 'Tratamiento endodóntico previo',
                'CORONA': 'Corona protésica',
                'IMPLANTE': 'Implante dental',
                'OBTURADO': 'Restauración presente',
                'PERIODONTITIS': 'Enfermedad periodontal',
                'GINGIVITIS': 'Inflamación gingival',
                'EXTRACCION_INDICADA': 'Indicación de extracción',
            };

            const lineasExamen = [];
            Object.entries(hallazgosPorTipo).forEach(([tipo, piezas]) => {
                const desc = descripcionesHallazgos[tipo] || tipo;
                lineasExamen.push(`- ${desc} en pieza(s): ${piezas.join(', ')}`);
            });

            examenClinico = `Hallazgos del odontograma:\n${lineasExamen.join('\n')}`;
        }

        // Generar diagnóstico sugerido
        if (dientesConHallazgos.length > 0) {
            const tipos = [...new Set(dientesConHallazgos.map(d => (d.estado || d.ESTADO || '').toUpperCase()))];
            const diagnosticosPorTipo = {
                'CARIES': 'Caries dental',
                'FRACTURA': 'Traumatismo dental',
                'PERIODONTITIS': 'Enfermedad periodontal',
                'GINGIVITIS': 'Gingivitis',
            };
            const diagnosticos = tipos
                .map(t => diagnosticosPorTipo[t])
                .filter(Boolean);
            if (diagnosticos.length > 0) {
                diagnostico = diagnosticos.join(', ') + ` - ${dientesConHallazgos.length} pieza(s) afectada(s)`;
            }
        }

        // Generar plan de tratamiento sugerido basado en tratamientos pendientes
        if (tratamientosOdontograma.length > 0) {
            const lineasPlan = tratamientosOdontograma.slice(0, 5).map(t => {
                const nombre = t.nombre || t.NOMBRE || t.tipo_tratamiento || t.TIPO_TRATAMIENTO;
                const fdi = t.numero_fdi || t.NUMERO_FDI;
                return `- ${nombre} en pieza #${fdi}`;
            });
            planTratamiento = `Tratamientos pendientes del odontograma:\n${lineasPlan.join('\n')}`;
            if (tratamientosOdontograma.length > 5) {
                planTratamiento += `\n- Y ${tratamientosOdontograma.length - 5} tratamiento(s) más...`;
            }
        }

        return { examenClinico, diagnostico, planTratamiento };
    };

    // Abrir formulario con sugerencias del odontograma
    const abrirFormularioConSugerencias = () => {
        const sugerencias = generarSugerenciasOdontograma();
        setFormData(prev => ({
            ...prev,
            examen_clinico: sugerencias.examenClinico || prev.examen_clinico,
            diagnostico: sugerencias.diagnostico || prev.diagnostico,
            plan_tratamiento: sugerencias.planTratamiento || prev.plan_tratamiento,
        }));
        setMostrarFormulario(true);
    };

    const resetForm = () => {
        setFormData({
            motivo_consulta: '',
            anamnesis: '',
            examen_clinico: '',
            diagnostico: '',
            codigo_cie10: '',
            plan_tratamiento: '',
            presion_arterial: '',
            frecuencia_cardiaca: '',
            temperatura: '',
            proxima_cita: '',
            observaciones: '',
            doctor_id: 1
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        crearHistoriaMutation.mutate({
            paciente_id: pacienteId,
            ...formData
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('es-PY', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <span className="ml-4 text-slate-500 font-medium">Cargando historia clínica...</span>
            </div>
        );
    }

    // Formulario de Nueva Consulta - Diseño Premium
    if (mostrarFormulario) {
        const fechaHoy = new Date().toLocaleDateString('es-PY', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        return (
            <div className="animate-in slide-in-from-right-2 duration-500">
                {/* Header Premium */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-t-3xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                    <div className="relative flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <span className="text-xl">📝</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Nueva Consulta</h3>
                                    <p className="text-slate-400 text-xs capitalize">{fechaHoy}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setMostrarFormulario(false)}
                            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="bg-white rounded-b-3xl border border-t-0 border-slate-200 shadow-xl">
                    {/* Sección 1: Información General */}
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary text-xs font-black">1</span>
                            </div>
                            <h4 className="font-bold text-slate-700">Información General</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="group">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Doctor Responsable
                                </label>
                                <select
                                    name="doctor_id"
                                    value={formData.doctor_id}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer"
                                >
                                    {doctores.map(d => (
                                        <option key={d.usuario_id || d.USUARIO_ID} value={d.usuario_id || d.USUARIO_ID}>
                                            Dr. {d.nombre || d.NOMBRE} {d.apellido || d.APELLIDO}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="group">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Próxima Cita
                                </label>
                                <input
                                    type="date"
                                    name="proxima_cita"
                                    value={formData.proxima_cita}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Motivo de Consulta
                                <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="motivo_consulta"
                                value={formData.motivo_consulta}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Dolor en molar inferior derecho, sensibilidad al frío..."
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Sección 2: Signos Vitales */}
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-transparent">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <span className="text-blue-600 text-xs font-black">2</span>
                            </div>
                            <h4 className="font-bold text-slate-700">Signos Vitales</h4>
                            <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full ml-2">Opcional</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl p-4 border-2 border-blue-100 hover:border-blue-200 transition-all group">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="text-lg">💓</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Presión</span>
                                </div>
                                <input
                                    type="text"
                                    name="presion_arterial"
                                    value={formData.presion_arterial}
                                    onChange={handleChange}
                                    placeholder="120/80"
                                    className="w-full bg-blue-50/50 border-0 rounded-lg px-3 py-2 text-center text-lg font-black text-blue-700 placeholder:text-blue-300 focus:bg-blue-100/50 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                                <p className="text-[10px] text-slate-400 text-center mt-2">mmHg</p>
                            </div>

                            <div className="bg-white rounded-2xl p-4 border-2 border-rose-100 hover:border-rose-200 transition-all group">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="text-lg">❤️</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Pulso</span>
                                </div>
                                <input
                                    type="number"
                                    name="frecuencia_cardiaca"
                                    value={formData.frecuencia_cardiaca}
                                    onChange={handleChange}
                                    placeholder="72"
                                    className="w-full bg-rose-50/50 border-0 rounded-lg px-3 py-2 text-center text-lg font-black text-rose-700 placeholder:text-rose-300 focus:bg-rose-100/50 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                                />
                                <p className="text-[10px] text-slate-400 text-center mt-2">bpm</p>
                            </div>

                            <div className="bg-white rounded-2xl p-4 border-2 border-amber-100 hover:border-amber-200 transition-all group">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="text-lg">🌡️</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Temp</span>
                                </div>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="temperatura"
                                    value={formData.temperatura}
                                    onChange={handleChange}
                                    placeholder="36.5"
                                    className="w-full bg-amber-50/50 border-0 rounded-lg px-3 py-2 text-center text-lg font-black text-amber-700 placeholder:text-amber-300 focus:bg-amber-100/50 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                                />
                                <p className="text-[10px] text-slate-400 text-center mt-2">°C</p>
                            </div>
                        </div>
                    </div>

                    {/* Sección 3: Evaluación Clínica */}
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <span className="text-emerald-600 text-xs font-black">3</span>
                            </div>
                            <h4 className="font-bold text-slate-700">Evaluación Clínica</h4>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Anamnesis
                                </label>
                                <textarea
                                    name="anamnesis"
                                    value={formData.anamnesis}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Describa la historia de la enfermedad actual, síntomas, duración, antecedentes relevantes del paciente..."
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Examen Clínico
                                </label>
                                <textarea
                                    name="examen_clinico"
                                    value={formData.examen_clinico}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Hallazgos del examen físico y oral: estado de tejidos blandos, oclusión, higiene bucal..."
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección 4: Diagnóstico */}
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-primary text-xs font-black">4</span>
                            </div>
                            <h4 className="font-bold text-slate-700">Diagnóstico</h4>
                            <span className="text-rose-500 text-xs">*Requerido</span>
                        </div>

                        <div className="bg-white rounded-2xl border-2 border-primary/20 p-5">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-3">
                                    <label className="flex items-center gap-2 text-xs font-bold text-primary mb-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Diagnóstico Principal
                                    </label>
                                    <input
                                        type="text"
                                        name="diagnostico"
                                        value={formData.diagnostico}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ej: Caries dental profunda en pieza 36 con compromiso pulpar"
                                        className="w-full bg-primary/5 border-2 border-primary/20 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                        </svg>
                                        CIE-10
                                    </label>
                                    <input
                                        type="text"
                                        name="codigo_cie10"
                                        value={formData.codigo_cie10}
                                        onChange={handleChange}
                                        placeholder="K02.1"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-700 placeholder:text-slate-400 text-center focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección 5: Plan de Tratamiento */}
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <span className="text-emerald-600 text-xs font-black">5</span>
                            </div>
                            <h4 className="font-bold text-slate-700">Plan de Tratamiento</h4>
                        </div>

                        <textarea
                            name="plan_tratamiento"
                            value={formData.plan_tratamiento}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Detalle los procedimientos a realizar, medicación prescrita, indicaciones post-operatorias, cuidados en casa..."
                            className="w-full bg-emerald-50/50 border-2 border-emerald-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-emerald-400/70 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Sección 6: Observaciones */}
                    <div className="p-6 bg-slate-50/50">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                                <span className="text-slate-500 text-xs font-black">6</span>
                            </div>
                            <h4 className="font-bold text-slate-700">Observaciones Adicionales</h4>
                            <span className="text-[10px] text-slate-400 font-medium bg-slate-200 px-2 py-0.5 rounded-full ml-2">Opcional</span>
                        </div>

                        <textarea
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Notas adicionales, recomendaciones especiales, seguimiento..."
                            className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Botones de Acción */}
                    <div className="p-6 bg-gradient-to-r from-slate-100 to-slate-50 rounded-b-3xl">
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setMostrarFormulario(false)}
                                className="flex-1 py-4 px-6 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={crearHistoriaMutation.isPending}
                                className="flex-[2] py-4 px-6 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-primary transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {crearHistoriaMutation.isPending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Guardar Consulta
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    // Vista de Detalle de Consulta Anterior
    if (consultaDetalle) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setConsultaDetalle(null)}
                        className="text-slate-500 hover:text-slate-700 font-bold flex items-center gap-2"
                    >
                        ← Volver al historial
                    </button>
                </div>
                {renderConsultaDetalle(consultaDetalle)}
            </div>
        );
    }

    // Si no hay historia, mostrar opción de crear
    if (!historiaActual) {
        return (
            <div className="space-y-6 animate-in slide-in-from-left-2 duration-300">
                <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-slate-500 font-bold text-lg">No hay historia clínica registrada</p>
                    <p className="text-slate-400 text-sm mt-2 mb-6">
                        Cree la primera consulta para este paciente
                    </p>
                    <button
                        onClick={abrirFormularioConSugerencias}
                        className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
                    >
                        + Nueva Consulta
                    </button>
                </div>
            </div>
        );
    }

    // Función para renderizar detalle de consulta
    function renderConsultaDetalle(historia) {
        return (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 text-white p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Consulta</p>
                            <p className="text-lg font-black">{formatDate(historia.fecha_consulta || historia.FECHA_CONSULTA)}</p>
                        </div>
                        {(historia.doctor_nombre || historia.DOCTOR_NOMBRE) && (
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Atendido por</p>
                                <p className="font-bold">Dr. {historia.doctor_nombre || historia.DOCTOR_NOMBRE}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {(historia.motivo_consulta || historia.MOTIVO_CONSULTA) && (
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Motivo de Consulta</p>
                            <p className="text-slate-700 bg-slate-50 p-4 rounded-xl">
                                {historia.motivo_consulta || historia.MOTIVO_CONSULTA}
                            </p>
                        </div>
                    )}

                    {(historia.presion_arterial || historia.PRESION_ARTERIAL ||
                      historia.frecuencia_cardiaca || historia.FRECUENCIA_CARDIACA ||
                      historia.temperatura || historia.TEMPERATURA) && (
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Signos Vitales</p>
                            <div className="grid grid-cols-3 gap-4">
                                {(historia.presion_arterial || historia.PRESION_ARTERIAL) && (
                                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                                        <p className="text-2xl font-black text-blue-600">{historia.presion_arterial || historia.PRESION_ARTERIAL}</p>
                                        <p className="text-[10px] font-bold text-blue-400 uppercase mt-1">Presión Arterial</p>
                                    </div>
                                )}
                                {(historia.frecuencia_cardiaca || historia.FRECUENCIA_CARDIACA) && (
                                    <div className="bg-rose-50 p-4 rounded-xl text-center">
                                        <p className="text-2xl font-black text-rose-600">{historia.frecuencia_cardiaca || historia.FRECUENCIA_CARDIACA} <span className="text-sm">bpm</span></p>
                                        <p className="text-[10px] font-bold text-rose-400 uppercase mt-1">Frec. Cardíaca</p>
                                    </div>
                                )}
                                {(historia.temperatura || historia.TEMPERATURA) && (
                                    <div className="bg-amber-50 p-4 rounded-xl text-center">
                                        <p className="text-2xl font-black text-amber-600">{historia.temperatura || historia.TEMPERATURA}°C</p>
                                        <p className="text-[10px] font-bold text-amber-400 uppercase mt-1">Temperatura</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {(historia.anamnesis || historia.ANAMNESIS) && (
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Anamnesis</p>
                            <p className="text-slate-700 bg-slate-50 p-4 rounded-xl whitespace-pre-wrap">{historia.anamnesis || historia.ANAMNESIS}</p>
                        </div>
                    )}

                    {(historia.examen_clinico || historia.EXAMEN_CLINICO) && (
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Examen Clínico</p>
                            <p className="text-slate-700 bg-slate-50 p-4 rounded-xl whitespace-pre-wrap">{historia.examen_clinico || historia.EXAMEN_CLINICO}</p>
                        </div>
                    )}

                    {(historia.diagnostico || historia.DIAGNOSTICO) && (
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Diagnóstico</p>
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                                <p className="text-primary font-bold">{historia.diagnostico || historia.DIAGNOSTICO}</p>
                                {(historia.codigo_cie10 || historia.CODIGO_CIE10) && (
                                    <p className="text-xs text-slate-500 mt-1">CIE-10: {historia.codigo_cie10 || historia.CODIGO_CIE10}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {(historia.plan_tratamiento || historia.PLAN_TRATAMIENTO) && (
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plan de Tratamiento</p>
                            <p className="text-slate-700 bg-emerald-50 p-4 rounded-xl border border-emerald-200 whitespace-pre-wrap">{historia.plan_tratamiento || historia.PLAN_TRATAMIENTO}</p>
                        </div>
                    )}

                    {(historia.observaciones || historia.OBSERVACIONES) && (
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Observaciones</p>
                            <p className="text-slate-600 bg-slate-50 p-4 rounded-xl italic whitespace-pre-wrap">{historia.observaciones || historia.OBSERVACIONES}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Vista principal con historial
    return (
        <div className="space-y-6 animate-in slide-in-from-left-2 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-800">Historia Clínica</h3>
                    <p className="text-slate-500 text-sm mt-1">
                        {historias.length} consulta{historias.length !== 1 ? 's' : ''} registrada{historias.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={abrirFormularioConSugerencias}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
                >
                    + Nueva Consulta
                </button>
            </div>

            {/* Alergias */}
            {paciente?.alergias && (
                <div className="p-5 bg-rose-50 rounded-2xl border border-rose-200">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="text-rose-800 font-black text-sm uppercase tracking-widest mb-1">Alergias Reportadas</p>
                            <p className="text-rose-700 font-medium">{paciente.alergias}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Última Consulta */}
            {renderConsultaDetalle(historiaActual)}

            {/* Historial de Consultas Anteriores */}
            {historias.length > 1 && (
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Consultas Anteriores</p>
                    <div className="space-y-3">
                        {historias.slice(1).map((h, idx) => (
                            <div
                                key={h.historia_id || h.HISTORIA_ID || idx}
                                onClick={() => setConsultaDetalle(h)}
                                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-700">
                                            {formatDate(h.fecha_consulta || h.FECHA_CONSULTA)}
                                        </p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            {h.motivo_consulta || h.MOTIVO_CONSULTA || 'Consulta general'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {(h.doctor_nombre || h.DOCTOR_NOMBRE) && (
                                            <p className="text-xs text-slate-400">
                                                Dr. {h.doctor_nombre || h.DOCTOR_NOMBRE}
                                            </p>
                                        )}
                                        <span className="text-primary text-sm font-bold">Ver detalles →</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoriaClinica;
