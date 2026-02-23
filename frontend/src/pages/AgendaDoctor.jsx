import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citasService, doctoresService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const AgendaDoctor = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;

    const today = new Date().toISOString().split('T')[0];
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState(today);
    const [cancelModal, setCancelModal] = useState(null);
    const [motivoCancelacion, setMotivoCancelacion] = useState('');

    // Queries
    const { data: doctoresData } = useQuery({
        queryKey: ['doctores', empresaId],
        queryFn: () => doctoresService.getAll(),
    });

    const { data: agendaData, isLoading } = useQuery({
        queryKey: ['agenda', selectedDate, empresaId],
        queryFn: () => citasService.getAll({ empresa_id: empresaId, fecha: selectedDate }),
        enabled: !!empresaId,
    });

    const doctores = doctoresData?.data?.items || [];
    const todasLasCitas = agendaData?.data?.items || [];

    // Filtrar por doctor si hay uno seleccionado
    const agenda = selectedDoctor
        ? todasLasCitas.filter(c => String(c.doctor_id) === String(selectedDoctor))
        : todasLasCitas;

    // Mutations
    const cambiarEstadoMutation = useMutation({
        mutationFn: ({ id, estado, motivo }) => citasService.cambiarEstado(id, estado, motivo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agenda'] });
            setCancelModal(null);
            setMotivoCancelacion('');
        },
    });

    // Stats
    const stats = {
        total: agenda.length,
        programadas: agenda.filter(c => c.estado === 'PROGRAMADA').length,
        confirmadas: agenda.filter(c => c.estado === 'CONFIRMADA').length,
        completadas: agenda.filter(c => c.estado === 'COMPLETADA').length,
    };

    // Navigation helpers
    const changeDate = (offset) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + offset);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const formatDateLabel = (dateStr) => {
        if (dateStr === today) return 'Hoy';
        const d = new Date(dateStr + 'T12:00:00');
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'COMPLETADA': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'CANCELADA': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'NO_ASISTIO': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'CONFIRMADA': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'EN_ATENCION': return 'bg-violet-100 text-violet-700 border-violet-200';
            case 'PROGRAMADA': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getTimelineColor = (status) => {
        switch (status) {
            case 'COMPLETADA': return 'border-emerald-500';
            case 'CANCELADA': return 'border-rose-400';
            case 'NO_ASISTIO': return 'border-rose-400';
            case 'CONFIRMADA': return 'border-blue-500';
            case 'EN_ATENCION': return 'border-violet-500';
            case 'PROGRAMADA': return 'border-amber-500';
            default: return 'border-primary';
        }
    };

    const selectedDoctorName = (() => {
        const doc = doctores.find(d => String(d.usuario_id) === String(selectedDoctor));
        if (!doc) return '';
        return `Dr. ${doc.nombre} ${doc.apellido}`;
    })();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Agenda Médica</h1>
                <p className="text-slate-500 font-medium">Vista diaria de citas por especialista</p>
            </div>

            {/* Selectors */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[220px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Doctor</label>
                    <select
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700 cursor-pointer"
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                    >
                        <option value="">Todos los doctores</option>
                        {doctores.map(d => (
                            <option key={d.usuario_id} value={d.usuario_id}>
                                Dr. {d.nombre} {d.apellido}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="min-w-[180px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Fecha</label>
                    <input
                        type="date"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => changeDate(-1)}
                        className="px-3 py-2.5 rounded-l-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all"
                        title="Día anterior"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        onClick={() => setSelectedDate(today)}
                        className={`px-4 py-2.5 border border-slate-200 font-bold text-sm transition-all ${selectedDate === today ? 'bg-primary text-white border-primary' : 'bg-white text-primary hover:bg-primary/5'}`}
                    >
                        Hoy
                    </button>
                    <button
                        onClick={() => changeDate(1)}
                        className="px-3 py-2.5 rounded-r-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all"
                        title="Día siguiente"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {/* Stats */}
            {!isLoading && agenda.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                        <p className="text-2xl font-black text-slate-800">{stats.total}</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Programadas</p>
                        <p className="text-2xl font-black text-amber-700">{stats.programadas}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-center">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Confirmadas</p>
                        <p className="text-2xl font-black text-blue-700">{stats.confirmadas}</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Completadas</p>
                        <p className="text-2xl font-black text-emerald-700">{stats.completadas}</p>
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Cronograma del Día
                        {selectedDoctorName
                            ? <span className="text-slate-400 font-normal text-sm ml-2">— {selectedDoctorName}</span>
                            : <span className="text-slate-400 font-normal text-sm ml-2">— Todos los doctores</span>
                        }
                    </h3>
                    <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-bold">
                        {formatDateLabel(selectedDate)}
                    </span>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : agenda.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="font-bold">Sin citas programadas</p>
                        <p className="text-xs text-slate-400 mt-1">No hay turnos para este día</p>
                    </div>
                ) : (
                    <div className="p-6 md:p-8 space-y-1">
                        {agenda.map((cita) => {
                            const estado = cita.estado || 'PROGRAMADA';
                            const canConfirm = estado === 'PROGRAMADA';
                            const canComplete = estado === 'PROGRAMADA' || estado === 'CONFIRMADA' || estado === 'EN_ATENCION';
                            const canCancel = estado === 'PROGRAMADA' || estado === 'CONFIRMADA';
                            const isInactive = estado === 'CANCELADA' || estado === 'COMPLETADA' || estado === 'NO_ASISTIO';

                            return (
                                <div key={cita.cita_id} className="flex gap-4 md:gap-6 group">
                                    {/* Time column */}
                                    <div className="w-16 pt-1 text-right shrink-0">
                                        <p className="text-sm font-black text-slate-900">{cita.hora_inicio}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{cita.duracion_minutos || 30} min</p>
                                    </div>

                                    {/* Timeline line */}
                                    <div className="relative flex-1 pb-6 border-l-2 border-slate-100 pl-6 md:pl-8 group-last:pb-0">
                                        <div className={`absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-white border-4 ${getTimelineColor(estado)} transition-transform group-hover:scale-125`}></div>

                                        {/* Card */}
                                        <div className={`border p-4 md:p-5 rounded-2xl transition-all ${isInactive ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-slate-50 border-slate-100 group-hover:bg-white group-hover:shadow-lg group-hover:border-primary/20'}`}>
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <h4 className="font-bold text-slate-800 text-base leading-tight">{cita.paciente_nombre}</h4>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(estado)}`}>
                                                            {estado.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    {/* Doctor - visible cuando no hay filtro de doctor */}
                                                    {cita.doctor_nombre && (
                                                        <p className="text-[10px] text-slate-500 font-bold mb-1">
                                                            Dr. {cita.doctor_nombre}
                                                        </p>
                                                    )}
                                                    {cita.tipo_cita && (
                                                        <p className="text-[10px] text-primary font-bold tracking-widest uppercase mb-1">
                                                            {cita.tipo_cita.replace('_', ' ')}
                                                        </p>
                                                    )}
                                                    <p className="text-slate-500 text-sm">
                                                        {cita.motivo_consulta || 'Sin motivo especificado'}
                                                    </p>
                                                    {cita.hora_fin && (
                                                        <p className="text-[10px] text-slate-400 mt-1">{cita.hora_inicio} — {cita.hora_fin}</p>
                                                    )}
                                                </div>

                                                {/* Quick action: ver paciente */}
                                                <button
                                                    onClick={() => navigate(`/pacientes/${cita.paciente_id}`)}
                                                    className="p-2 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-slate-400 transition-all shrink-0"
                                                    title="Ver paciente"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                </button>
                                            </div>

                                            {/* Actions */}
                                            {!isInactive && (
                                                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                                                    {canConfirm && (
                                                        <button
                                                            onClick={() => cambiarEstadoMutation.mutate({ id: cita.cita_id, estado: 'CONFIRMADA' })}
                                                            disabled={cambiarEstadoMutation.isPending}
                                                            className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                                                        >
                                                            Confirmar
                                                        </button>
                                                    )}
                                                    {canComplete && (
                                                        <button
                                                            onClick={() => cambiarEstadoMutation.mutate({ id: cita.cita_id, estado: 'COMPLETADA' })}
                                                            disabled={cambiarEstadoMutation.isPending}
                                                            className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all"
                                                        >
                                                            Completar
                                                        </button>
                                                    )}
                                                    {canCancel && (
                                                        <button
                                                            onClick={() => setCancelModal(cita)}
                                                            disabled={cambiarEstadoMutation.isPending}
                                                            className="text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de cancelación */}
            {cancelModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in duration-300">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="font-black text-lg text-slate-800">Cancelar Cita</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {cancelModal.paciente_nombre} — {cancelModal.hora_inicio}
                            </p>
                        </div>
                        <div className="p-6">
                            <label className="text-xs font-bold text-slate-500 mb-2 block">Motivo de cancelación *</label>
                            <textarea
                                rows={3}
                                value={motivoCancelacion}
                                onChange={(e) => setMotivoCancelacion(e.target.value)}
                                placeholder="Ingrese el motivo..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm"
                                autoFocus
                            />
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => { setCancelModal(null); setMotivoCancelacion(''); }}
                                className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm"
                            >
                                Volver
                            </button>
                            <button
                                onClick={() => {
                                    if (!motivoCancelacion.trim()) return;
                                    cambiarEstadoMutation.mutate({
                                        id: cancelModal.cita_id,
                                        estado: 'CANCELADA',
                                        motivo: motivoCancelacion.trim(),
                                    });
                                }}
                                disabled={!motivoCancelacion.trim() || cambiarEstadoMutation.isPending}
                                className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {cambiarEstadoMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgendaDoctor;
