import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { citasService, pacientesService, doctoresService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Citas = () => {
    const navigate = useNavigate();
    const { usuario, empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;
    const queryClient = useQueryClient();
    const today = new Date();
    const [filterDate, setFilterDate] = useState(today.toISOString().split('T')[0]);
    const [filterStatus, setFilterStatus] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'week'
    const [showModal, setShowModal] = useState(false);
    const [searchPaciente, setSearchPaciente] = useState('');
    const [selectedPaciente, setSelectedPaciente] = useState(null);
    const [citaDetalle, setCitaDetalle] = useState(null);
    const [showLOV, setShowLOV] = useState(false);
    const searchInputRef = useRef(null);
    const lovRef = useRef(null);

    // Form para nueva cita
    const [formCita, setFormCita] = useState({
        fecha: today.toISOString().split('T')[0],
        hora_inicio: '09:00',
        duracion_minutos: 30,
        tipo_cita: 'CONSULTA_GENERAL',
        doctor_id: '',
        motivo_consulta: '',
        notas: ''
    });

    // Cerrar LOV al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (lovRef.current && !lovRef.current.contains(event.target) &&
                searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setShowLOV(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Queries
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['citas', filterDate, filterStatus, empresaId],
        queryFn: () => citasService.getAll({
            empresa_id: empresaId,
            fecha: filterDate,
            estado: filterStatus || undefined
        }),
    });

    const { data: doctoresRes } = useQuery({
        queryKey: ['doctores'],
        queryFn: () => doctoresService.getAll()
    });

    const { data: pacientesSearch } = useQuery({
        queryKey: ['pacientes-search', searchPaciente, empresaId],
        queryFn: () => pacientesService.search(searchPaciente, { empresa_id: empresaId }),
        enabled: searchPaciente.length >= 2
    });

    const [errorModal, setErrorModal] = useState('');

    // Estado para edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [editError, setEditError] = useState('');

    const openEditModal = (cita) => {
        const doctorId = cita.doctor_id || cita.DOCTOR_ID || '';
        setEditForm({
            fecha: cita.fecha || cita.FECHA || filterDate,
            hora_inicio: cita.hora_inicio || cita.HORA_INICIO || '09:00',
            duracion_minutos: cita.duracion_minutos || cita.DURACION_MINUTOS || 30,
            tipo_cita: cita.tipo_cita || cita.TIPO_CITA || 'CONSULTA_GENERAL',
            doctor_id: doctorId ? String(doctorId) : '',
            motivo_consulta: cita.motivo_consulta || cita.MOTIVO_CONSULTA || '',
            notas: cita.observaciones || cita.OBSERVACIONES || ''
        });
        setEditError('');
        setShowEditModal(true);
    };

    // Mutations
    const crearCitaMutation = useMutation({
        mutationFn: (data) => citasService.create(data),
        onSuccess: (res) => {
            if (res.data?.resultado === 1 || res.data?.resultado === '1') {
                queryClient.invalidateQueries(['citas']);
                setShowModal(false);
                resetForm();
            } else {
                setErrorModal(res.data?.mensaje || 'Error al guardar la cita');
            }
        },
        onError: (err) => {
            setErrorModal(err.response?.data?.mensaje || 'Error al conectar con el servidor');
        }
    });

    const actualizarCitaMutation = useMutation({
        mutationFn: ({ id, data }) => citasService.update(id, data),
        onSuccess: (res) => {
            if (res.data?.resultado === 1 || res.data?.resultado === '1') {
                queryClient.invalidateQueries(['citas']);
                setShowEditModal(false);
                setCitaDetalle(null);
            } else {
                setEditError(res.data?.mensaje || 'Error al actualizar la cita');
            }
        },
        onError: (err) => {
            setEditError(err.response?.data?.mensaje || 'Error al conectar con el servidor');
        }
    });

    const handleSubmitEdit = (e) => {
        e.preventDefault();
        if (!citaDetalle) return;
        setEditError('');
        const citaId = citaDetalle.cita_id || citaDetalle.CITA_ID;
        actualizarCitaMutation.mutate({
            id: citaId,
            data: {
                doctor_id: editForm.doctor_id ? String(editForm.doctor_id) : null,
                fecha: editForm.fecha,
                hora_inicio: editForm.hora_inicio,
                duracion_minutos: String(editForm.duracion_minutos),
                tipo_cita: editForm.tipo_cita,
                motivo_consulta: editForm.motivo_consulta || null,
                notas: editForm.notas || null,
                modificado_por: String(usuario?.usuario_id),
            }
        });
    };

    const cambiarEstadoMutation = useMutation({
        mutationFn: ({ id, estado, motivo }) => citasService.cambiarEstado(id, estado, motivo),
        onSuccess: () => {
            queryClient.invalidateQueries(['citas']);
            setCitaDetalle(null);
        }
    });

    const citas = data?.data?.items || [];
    const doctores = doctoresRes?.data?.items || doctoresRes?.data || [];
    const pacientesResults = pacientesSearch?.data?.items || pacientesSearch?.data || [];

    // Estadísticas del día
    const stats = {
        total: citas.length,
        pendientes: citas.filter(c => c.estado === 'PROGRAMADA').length,
        confirmadas: citas.filter(c => c.estado === 'CONFIRMADA').length,
        completadas: citas.filter(c => c.estado === 'COMPLETADA').length,
        canceladas: citas.filter(c => c.estado === 'CANCELADA' || c.estado === 'NO_ASISTIO').length,
    };

    const resetForm = () => {
        setFormCita({
            fecha: today.toISOString().split('T')[0],
            hora_inicio: '09:00',
            duracion_minutos: 30,
            tipo_cita: 'CONSULTA_GENERAL',
            doctor_id: '',
            motivo_consulta: '',
            notas: ''
        });
        setSelectedPaciente(null);
        setSearchPaciente('');
        setShowLOV(false);
    };

    const handleSubmitCita = (e) => {
        e.preventDefault();
        if (!selectedPaciente) return;
        setErrorModal('');
        crearCitaMutation.mutate({
            paciente_id: String(selectedPaciente.paciente_id || selectedPaciente.PACIENTE_ID),
            doctor_id: formCita.doctor_id ? String(formCita.doctor_id) : null,
            fecha: formCita.fecha,
            hora_inicio: formCita.hora_inicio,
            duracion_minutos: String(formCita.duracion_minutos),
            tipo_cita: formCita.tipo_cita,
            motivo_consulta: formCita.motivo_consulta || null,
            notas: formCita.notas || null,
            empresa_id: String(empresaId),
            creado_por: String(usuario?.usuario_id),
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'COMPLETADA': return 'bg-secondary-light text-secondary border-secondary/20';
            case 'CANCELADA': return 'bg-danger-light/30 text-danger border-danger/20';
            case 'NO_ASISTIO': return 'bg-danger-light/30 text-danger border-danger/20';
            case 'CONFIRMADA': return 'bg-primary-light text-primary border-primary/20';
            case 'EN_ATENCION': return 'bg-accent/10 text-accent border-accent/20';
            case 'PROGRAMADA': return 'bg-warning-light/30 text-warning border-warning/20';
            default: return 'bg-surface-raised text-text-secondary border-border';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETADA': return '✅';
            case 'CANCELADA': return '❌';
            case 'NO_ASISTIO': return '🚫';
            case 'CONFIRMADA': return '📋';
            case 'EN_ATENCION': return '🦷';
            case 'PROGRAMADA': return '⏳';
            default: return '📅';
        }
    };

    // Generar días de la semana
    const getWeekDays = () => {
        const days = [];
        const startOfWeek = new Date(filterDate);
        const dayOfWeek = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const weekDays = getWeekDays();
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    // Horarios para vista semanal
    const hours = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">Agenda de Citas</h1>
                    <p className="text-text-secondary font-medium">Gestiona los turnos y el flujo de pacientes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-primary/30 transition-all flex items-center gap-2 w-fit uppercase tracking-widest text-sm"
                >
                    <span className="text-xl">+</span> Nueva Cita
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-surface-card p-4 rounded-xl border border-border shadow-sm">
                    <p className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest">Total</p>
                    <p className="text-2xl font-black text-text-primary">{stats.total}</p>
                </div>
                <div className="bg-warning-light/30 p-4 rounded-xl border border-warning-light">
                    <p className="text-[10px] font-black text-warning-dark uppercase tracking-widest">Pendientes</p>
                    <p className="text-2xl font-black text-warning">{stats.pendientes}</p>
                </div>
                <div className="bg-primary-light/50 p-4 rounded-xl border border-primary-light">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Confirmadas</p>
                    <p className="text-2xl font-black text-primary-dark">{stats.confirmadas}</p>
                </div>
                <div className="bg-secondary-light p-4 rounded-xl border border-secondary/20">
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Completadas</p>
                    <p className="text-2xl font-black text-secondary-dark">{stats.completadas}</p>
                </div>
                <div className="bg-danger-light/30 p-4 rounded-xl border border-danger-light">
                    <p className="text-[10px] font-black text-danger uppercase tracking-widest">Canceladas</p>
                    <p className="text-2xl font-black text-danger-dark">{stats.canceladas}</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-surface-card p-4 rounded-xl shadow-sm border border-border flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1 block">Fecha</label>
                    <input
                        type="date"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-text-primary"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1 block">Estado</label>
                    <select
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-text-primary cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="PROGRAMADA">Programadas</option>
                        <option value="CONFIRMADA">Confirmadas</option>
                        <option value="EN_ATENCION">En atención</option>
                        <option value="COMPLETADA">Completadas</option>
                        <option value="CANCELADA">Canceladas</option>
                        <option value="NO_ASISTIO">No asistió</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterDate(today.toISOString().split('T')[0])}
                        className="px-4 py-2.5 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 rounded-xl transition-all border border-primary/20"
                    >
                        Hoy
                    </button>
                    <div className="flex rounded-xl border border-border overflow-hidden">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface-card text-text-secondary opacity-60 hover:bg-surface-raised'}`}
                        >
                            Lista
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-primary text-white' : 'bg-surface-card text-text-secondary opacity-60 hover:bg-surface-raised'}`}
                        >
                            Semana
                        </button>
                    </div>
                </div>
            </div>

            {/* Vista de Lista */}
            {viewMode === 'list' && (
                <div className="bg-surface-card rounded-xl shadow-sm border border-border overflow-hidden">
                    {isLoading ? (
                        <div className="p-20 text-center">
                            <div className="w-10 h-10 border-4 border-surface-raised border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-text-secondary opacity-40 font-black uppercase tracking-widest text-xs">Cargando agenda...</p>
                        </div>
                    ) : isError ? (
                        <div className="p-12 text-center text-danger font-bold bg-danger-light/20">
                            Error: {error.message}
                        </div>
                    ) : citas.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="text-5xl mb-4 opacity-10 filter grayscale">📅</div>
                            <p className="text-text-primary font-black text-lg">Sin citas programadas</p>
                            <p className="text-text-secondary opacity-60 text-sm mt-1">No hay citas para esta fecha</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20"
                            >
                                Agendar Cita
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {citas.map((cita) => {
                                // Normalizar campos (mayúsculas/minúsculas)
                                const citaId = cita.cita_id || cita.CITA_ID;
                                const pacienteId = cita.paciente_id || cita.PACIENTE_ID;
                                const pacienteNombre = cita.paciente_nombre || cita.PACIENTE_NOMBRE || 'Sin nombre';
                                const doctorNombre = cita.doctor_nombre || cita.DOCTOR_NOMBRE || 'Sin asignar';
                                const horaInicio = cita.hora_inicio || cita.HORA_INICIO || '09:00';
                                const horaFin = cita.hora_fin || cita.HORA_FIN || '';
                                const motivoConsulta = cita.motivo_consulta || cita.MOTIVO_CONSULTA || 'Consulta general';
                                const estado = cita.estado || cita.ESTADO || 'PROGRAMADA';
                                const duracion = cita.duracion_minutos || cita.DURACION_MINUTOS || 30;

                                return (
                                    <div
                                        key={citaId}
                                        className="flex items-center gap-4 p-4 hover:bg-surface-raised transition-all cursor-pointer group"
                                        onClick={() => setCitaDetalle({ ...cita, cita_id: citaId, paciente_id: pacienteId, paciente_nombre: pacienteNombre, doctor_nombre: doctorNombre, hora_inicio: horaInicio, hora_fin: horaFin, motivo_consulta: motivoConsulta, estado, duracion_minutos: duracion })}
                                    >
                                        <div className="w-20 text-center">
                                            <p className="text-xl font-black text-primary">{horaInicio}</p>
                                            <p className="text-[10px] text-text-secondary opacity-60 font-black uppercase tracking-widest">{duracion} min</p>
                                        </div>
                                        <div className="w-1 h-12 bg-gradient-to-b from-primary to-primary-light rounded-full"></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-bold text-text-primary group-hover:text-primary transition-colors">{pacienteNombre}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(estado)}`}>
                                                    {estado}
                                                </span>
                                            </div>
                                            <p className="text-xs text-text-secondary opacity-80 truncate">{motivoConsulta}</p>
                                            <p className="text-[10px] text-text-secondary opacity-60 font-medium">Dr. {doctorNombre}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/pacientes/${pacienteId}`); }}
                                                className="p-2.5 bg-surface-raised border border-border hover:border-primary/20 hover:bg-primary-light hover:text-primary rounded-xl transition-all"
                                                title="Ver paciente"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </button>
                                            {estado !== 'COMPLETADA' && estado !== 'CANCELADA' && estado !== 'NO_ASISTIO' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('¿Marcar como completada?')) {
                                                            cambiarEstadoMutation.mutate({ id: citaId, estado: 'COMPLETADA' });
                                                        }
                                                    }}
                                                    className="p-2.5 bg-secondary-light hover:bg-secondary text-secondary hover:text-white rounded-xl transition-all"
                                                    title="Completar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Vista Semanal */}
            {viewMode === 'week' && (
                <div className="bg-surface-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="min-w-[700px]">
                            <div className="grid grid-cols-8 border-b border-border">
                                <div className="p-3 bg-surface-raised"></div>
                                {weekDays.map((date, idx) => {
                                    const isToday = date.toDateString() === today.toDateString();
                                    const isSelected = date.toISOString().split('T')[0] === filterDate;
                                    return (
                                        <div
                                            key={idx}
                                            className={`p-3 text-center cursor-pointer transition-all ${isToday ? 'bg-primary/5' : 'bg-surface-raised'} ${isSelected ? 'ring-2 ring-primary ring-inset shadow-inner' : ''}`}
                                            onClick={() => setFilterDate(date.toISOString().split('T')[0])}
                                        >
                                            <p className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest">{dayNames[idx]}</p>
                                            <p className={`text-lg font-black ${isToday ? 'text-primary' : 'text-text-primary'}`}>{date.getDate()}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="max-h-[500px] overflow-y-auto overflow-x-hidden">
                                {hours.map((hour) => (
                                    <div key={hour} className="grid grid-cols-8 border-b border-border min-h-[60px]">
                                        <div className="p-2 text-[10px] font-black text-text-secondary opacity-40 bg-surface-raised flex items-start justify-end pr-3 uppercase tracking-tighter">
                                            {hour}
                                        </div>
                                        {weekDays.map((date, idx) => {
                                            const dateStr = date.toISOString().split('T')[0];
                                            const citasHora = citas.filter(c => {
                                                const citaFecha = c.fecha || c.FECHA || '';
                                                const citaHora = c.hora_inicio || c.HORA_INICIO || '';
                                                return citaFecha === dateStr && citaHora.startsWith(hour.split(':')[0]);
                                            });
                                            return (
                                                <div key={idx} className="p-1 border-l border-border relative">
                                                    {citasHora.map((cita) => {
                                                        const citaId = cita.cita_id || cita.CITA_ID;
                                                        const estado = cita.estado || cita.ESTADO;
                                                        const pacienteNombre = cita.paciente_nombre || cita.PACIENTE_NOMBRE || '';
                                                        return (
                                                            <div
                                                                key={citaId}
                                                                className={`text-[10px] p-1.5 rounded-lg mb-1 cursor-pointer truncate font-bold border transition-all hover:scale-[1.02] shadow-sm ${getStatusStyle(estado)}`}
                                                                onClick={() => setCitaDetalle(cita)}
                                                                title={pacienteNombre}
                                                            >
                                                                {pacienteNombre.split(' ')[0]}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nueva Cita */}
            {showModal && (
                <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
                    <div className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in duration-300 border border-border">
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-text-primary uppercase tracking-widest">Nueva Cita</h2>
                                <button
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="w-10 h-10 rounded-xl bg-surface-raised hover:bg-surface border border-border flex items-center justify-center text-text-secondary transition-all"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitCita} className="p-6 space-y-5">
                            {errorModal && (
                                <div className="bg-danger-light/20 border border-danger/20 text-danger text-[11px] font-black uppercase tracking-widest px-4 py-3 rounded-xl">
                                    {errorModal}
                                </div>
                            )}
                            {/* LOV de Paciente Mejorado */}
                            <div>
                                <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Paciente *</label>
                                {selectedPaciente ? (
                                    <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm shadow-inner">
                                                {selectedPaciente.nombre?.charAt(0) || selectedPaciente.NOMBRE?.charAt(0)}
                                                {selectedPaciente.apellido?.charAt(0) || selectedPaciente.APELLIDO?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-text-primary tracking-tight">
                                                    {selectedPaciente.nombre_completo || selectedPaciente.NOMBRE_COMPLETO ||
                                                        `${selectedPaciente.nombre || selectedPaciente.NOMBRE} ${selectedPaciente.apellido || selectedPaciente.APELLIDO}`}
                                                </p>
                                                <p className="text-[10px] text-text-secondary opacity-60 font-black uppercase tracking-widest mt-0.5">
                                                    HC: {selectedPaciente.numero_historia || selectedPaciente.NUMERO_HISTORIA} |
                                                    Doc: {selectedPaciente.documento_numero || selectedPaciente.DOCUMENTO_NUMERO}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedPaciente(null); setSearchPaciente(''); }}
                                            className="w-10 h-10 rounded-xl bg-danger-light/30 hover:bg-danger text-danger hover:text-white transition-all flex items-center justify-center border border-danger/10"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-40">🔍</span>
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                placeholder="Buscar por nombre, documento..."
                                                value={searchPaciente}
                                                onChange={(e) => {
                                                    setSearchPaciente(e.target.value);
                                                    setShowLOV(e.target.value.length >= 2);
                                                }}
                                                onFocus={() => searchPaciente.length >= 2 && setShowLOV(true)}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium"
                                            />
                                        </div>

                                        {/* LOV Dropdown */}
                                        {showLOV && searchPaciente.length >= 2 && (
                                            <div
                                                ref={lovRef}
                                                className="absolute top-full left-0 right-0 mt-2 bg-surface-card border border-border rounded-2xl shadow-2xl xl max-h-72 overflow-hidden z-[210] animate-in fade-in slide-in-from-top-2"
                                            >
                                                {/* Header del LOV */}
                                                <div className="bg-surface-raised px-4 py-3 border-b border-border flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest">
                                                        {pacientesResults.length} PACIENTES ENCONTRADOS
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowLOV(false)}
                                                        className="text-primary font-black text-[10px] uppercase tracking-widest"
                                                    >
                                                        Cerrar
                                                    </button>
                                                </div>

                                                {/* Lista de resultados */}
                                                <div className="max-h-60 overflow-y-auto">
                                                    {pacientesResults.length === 0 ? (
                                                        <div className="px-5 py-8 text-center">
                                                            <p className="text-text-secondary opacity-60 text-sm font-bold">No se encontraron pacientes</p>
                                                            <p className="text-text-secondary opacity-40 text-[10px] mt-1 uppercase tracking-widest">Intente con otro término</p>
                                                        </div>
                                                    ) : (
                                                        pacientesResults.map((p) => {
                                                            const nombre = p.nombre || p.NOMBRE || '';
                                                            const apellido = p.apellido || p.APELLIDO || '';
                                                            const nombreCompleto = p.nombre_completo || p.NOMBRE_COMPLETO || `${nombre} ${apellido}`;
                                                            const documento = p.documento_numero || p.DOCUMENTO_NUMERO || '';
                                                            const telefono = p.telefono_principal || p.TELEFONO_PRINCIPAL || '';
                                                            const historia = p.numero_historia || p.NUMERO_HISTORIA || '';

                                                            return (
                                                                <button
                                                                    key={p.paciente_id || p.PACIENTE_ID}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedPaciente(p);
                                                                        setSearchPaciente('');
                                                                        setShowLOV(false);
                                                                    }}
                                                                    className="w-full text-left px-5 py-3.5 hover:bg-primary/5 flex items-center gap-4 border-b border-border last:border-0 transition-colors group"
                                                                >
                                                                    <div className="w-10 h-10 rounded-xl bg-surface-raised group-hover:bg-primary-light flex items-center justify-center text-xs font-black text-text-secondary group-hover:text-primary transition-all">
                                                                        {nombre.charAt(0)}{apellido.charAt(0)}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-bold text-text-primary group-hover:text-primary transition-colors truncate">{nombreCompleto}</p>
                                                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">
                                                                            <span>📄 {documento}</span>
                                                                            {telefono && <span>📱 {telefono}</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="bg-surface-raised text-text-secondary opacity-60 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-border">
                                                                            HC: {historia}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Hint */}
                                        {!showLOV && searchPaciente.length < 2 && (
                                            <p className="text-[10px] text-slate-400 mt-1 ml-1">
                                                Escriba al menos 2 caracteres para buscar
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Fecha, Hora y Duración */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Fecha *</label>
                                    <input
                                        type="date"
                                        value={formCita.fecha}
                                        onChange={(e) => setFormCita({ ...formCita, fecha: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none text-sm font-medium transition-all"
                                        min={today.toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Hora *</label>
                                    <select
                                        value={formCita.hora_inicio}
                                        onChange={(e) => setFormCita({ ...formCita, hora_inicio: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none text-sm font-black cursor-pointer transition-all"
                                        required
                                    >
                                        {Array.from({ length: 24 }, (_, h) => {
                                            if (h < 8 || h > 20) return null;
                                            return ['00', '30'].map(m => (
                                                <option key={`${h}:${m}`} value={`${h.toString().padStart(2, '0')}:${m}`}>
                                                    {h.toString().padStart(2, '0')}:{m}
                                                </option>
                                            ));
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Duración</label>
                                    <select
                                        value={formCita.duracion_minutos}
                                        onChange={(e) => setFormCita({ ...formCita, duracion_minutos: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none text-sm font-black cursor-pointer transition-all"
                                    >
                                        <option value={15}>15 min</option>
                                        <option value={30}>30 min</option>
                                        <option value={45}>45 min</option>
                                        <option value={60}>1 hora</option>
                                        <option value={90}>1h 30min</option>
                                        <option value={120}>2 horas</option>
                                    </select>
                                </div>
                            </div>

                            {/* Tipo de cita */}
                            <div>
                                <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Tipo de Cita</label>
                                <select
                                    value={formCita.tipo_cita}
                                    onChange={(e) => setFormCita({ ...formCita, tipo_cita: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none font-black cursor-pointer transition-all"
                                >
                                    <option value="CONSULTA_GENERAL">Consulta General</option>
                                    <option value="CONTROL">Control</option>
                                    <option value="EMERGENCIA">Emergencia</option>
                                    <option value="LIMPIEZA">Limpieza Dental</option>
                                    <option value="ORTODONCIA">Ortodoncia</option>
                                    <option value="ENDODONCIA">Endodoncia</option>
                                    <option value="CIRUGIA">Cirugía</option>
                                    <option value="PROTESIS">Prótesis</option>
                                    <option value="ESTETICA">Estética</option>
                                    <option value="BLANQUEAMIENTO">Blanqueamiento</option>
                                    <option value="IMPLANTE">Implante</option>
                                </select>
                            </div>

                            {/* Doctor */}
                            <div>
                                <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Doctor</label>
                                <select
                                    value={formCita.doctor_id}
                                    onChange={(e) => setFormCita({ ...formCita, doctor_id: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none font-black cursor-pointer transition-all"
                                >
                                    <option value="">Seleccionar doctor...</option>
                                    {doctores.map(d => (
                                        <option key={d.usuario_id || d.USUARIO_ID} value={d.usuario_id || d.USUARIO_ID}>
                                            Dr. {d.nombre || d.NOMBRE} {d.apellido || d.APELLIDO}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Motivo */}
                            <div>
                                <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Motivo de Consulta</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Control rutinario, dolor de muela..."
                                    value={formCita.motivo_consulta}
                                    onChange={(e) => setFormCita({ ...formCita, motivo_consulta: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none font-medium transition-all"
                                />
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Notas adicionales</label>
                                <textarea
                                    rows={2}
                                    placeholder="Observaciones..."
                                    value={formCita.notes}
                                    onChange={(e) => setFormCita({ ...formCita, notas: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none resize-none font-medium transition-all"
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex gap-4 pt-3">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 py-4 px-4 bg-surface-raised text-text-secondary font-black uppercase tracking-widest rounded-xl hover:bg-surface border border-border transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={crearCitaMutation.isPending || !selectedPaciente}
                                    className="flex-1 py-4 px-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark shadow-xl shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {crearCitaMutation.isPending ? 'Guardando...' : 'Agendar Cita'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Cita */}
            {showEditModal && citaDetalle && (
                <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
                    <div className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in duration-300 border border-border">
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-text-primary uppercase tracking-widest">Editar Cita</h2>
                                    <p className="text-xs font-black text-text-secondary opacity-60 uppercase tracking-widest mt-1">
                                        {citaDetalle.paciente_nombre || citaDetalle.PACIENTE_NOMBRE}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="w-10 h-10 rounded-xl bg-surface-raised hover:bg-surface border border-border flex items-center justify-center text-text-secondary transition-all"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitEdit} className="p-6 space-y-5">
                            {editError && (
                                <div className="bg-danger-light/20 border border-danger/20 text-danger text-[11px] font-black uppercase tracking-widest px-4 py-3 rounded-xl">
                                    {editError}
                                </div>
                            )}

                            {/* Fecha, Hora y Duración */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Fecha *</label>
                                    <input
                                        type="date"
                                        value={editForm.fecha}
                                        onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none text-sm font-medium transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Hora *</label>
                                    <select
                                        value={editForm.hora_inicio}
                                        onChange={(e) => setEditForm({ ...editForm, hora_inicio: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none text-sm font-black cursor-pointer transition-all"
                                        required
                                    >
                                        {Array.from({ length: 24 }, (_, h) => {
                                            if (h < 8 || h > 20) return null;
                                            return ['00', '30'].map(m => (
                                                <option key={`${h}:${m}`} value={`${h.toString().padStart(2, '0')}:${m}`}>
                                                    {h.toString().padStart(2, '0')}:{m}
                                                </option>
                                            ));
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Duración</label>
                                    <select
                                        value={editForm.duracion_minutos}
                                        onChange={(e) => setEditForm({ ...editForm, duracion_minutos: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none text-sm font-black cursor-pointer transition-all"
                                    >
                                        <option value={15}>15 min</option>
                                        <option value={30}>30 min</option>
                                        <option value={45}>45 min</option>
                                        <option value={60}>1 hora</option>
                                        <option value={90}>1h 30min</option>
                                        <option value={120}>2 horas</option>
                                    </select>
                                </div>
                            </div>

                            {/* Tipo de cita */}
                            <div>
                                <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Tipo de Cita</label>
                                <select
                                    value={editForm.tipo_cita}
                                    onChange={(e) => setEditForm({ ...editForm, tipo_cita: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none font-black cursor-pointer transition-all"
                                >
                                    <option value="CONSULTA_GENERAL">Consulta General</option>
                                    <option value="CONTROL">Control</option>
                                    <option value="EMERGENCIA">Emergencia</option>
                                    <option value="LIMPIEZA">Limpieza Dental</option>
                                    <option value="ORTODONCIA">Ortodoncia</option>
                                    <option value="ENDODONCIA">Endodoncia</option>
                                    <option value="CIRUGIA">Cirugía</option>
                                    <option value="PROTESIS">Prótesis</option>
                                    <option value="ESTETICA">Estética</option>
                                    <option value="BLANQUEAMIENTO">Blanqueamiento</option>
                                    <option value="IMPLANTE">Implante</option>
                                </select>
                            </div>

                            {/* Doctor */}
                            <div>
                                <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Doctor</label>
                                <select
                                    value={editForm.doctor_id}
                                    onChange={(e) => setEditForm({ ...editForm, doctor_id: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none font-black cursor-pointer transition-all"
                                >
                                    <option value="">Sin asignar</option>
                                    {doctores.map(d => (
                                        <option key={d.usuario_id || d.USUARIO_ID} value={d.usuario_id || d.USUARIO_ID}>
                                            Dr. {d.nombre || d.NOMBRE} {d.apellido || d.APELLIDO}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Motivo */}
                            <div>
                                <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Motivo de Consulta</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Control rutinario, dolor de muela..."
                                    value={editForm.motivo_consulta}
                                    onChange={(e) => setEditForm({ ...editForm, motivo_consulta: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none font-medium transition-all"
                                />
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest mb-1.5 block">Notas adicionales</label>
                                <textarea
                                    rows={2}
                                    placeholder="Observaciones..."
                                    value={editForm.notas}
                                    onChange={(e) => setEditForm({ ...editForm, notas: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface-raised focus:bg-white focus:border-primary outline-none resize-none font-medium transition-all"
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex gap-4 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 py-4 px-4 bg-surface-raised text-text-secondary font-black uppercase tracking-widest rounded-xl hover:bg-surface border border-border transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={actualizarCitaMutation.isPending}
                                    className="flex-1 py-4 px-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark shadow-xl shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actualizarCitaMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detalle Cita */}
            {citaDetalle && (() => {
                // Normalizar datos del detalle
                const detalle = {
                    citaId: citaDetalle.cita_id || citaDetalle.CITA_ID,
                    pacienteId: citaDetalle.paciente_id || citaDetalle.PACIENTE_ID,
                    pacienteNombre: citaDetalle.paciente_nombre || citaDetalle.PACIENTE_NOMBRE || 'Sin nombre',
                    doctorNombre: citaDetalle.doctor_nombre || citaDetalle.DOCTOR_NOMBRE || 'Sin asignar',
                    fecha: citaDetalle.fecha || citaDetalle.FECHA || filterDate,
                    horaInicio: citaDetalle.hora_inicio || citaDetalle.HORA_INICIO || '09:00',
                    horaFin: citaDetalle.hora_fin || citaDetalle.HORA_FIN || '',
                    duracion: citaDetalle.duracion_minutos || citaDetalle.DURACION_MINUTOS || 30,
                    motivoConsulta: citaDetalle.motivo_consulta || citaDetalle.MOTIVO_CONSULTA || 'Consulta general',
                    estado: citaDetalle.estado || citaDetalle.ESTADO || 'PROGRAMADA',
                    tipoCita: citaDetalle.tipo_cita || citaDetalle.TIPO_CITA || 'CONSULTA',
                    consultorio: citaDetalle.consultorio || citaDetalle.CONSULTORIO || '',
                    observaciones: citaDetalle.observaciones || citaDetalle.OBSERVACIONES || ''
                };

                return (
                    <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
                        <div className="bg-surface-card rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in duration-300 border border-border overflow-hidden">
                            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-surface-raised">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center font-black text-primary text-xl border border-primary/5">
                                            {detalle.pacienteNombre.split(' ').slice(0, 2).map(n => n.charAt(0)).join('')}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-text-secondary opacity-40 uppercase tracking-widest">Cita #{detalle.citaId}</p>
                                            <h2 className="text-xl font-black text-text-primary tracking-tight">{detalle.pacienteNombre}</h2>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setCitaDetalle(null)}
                                        className="w-10 h-10 rounded-xl bg-white hover:bg-surface-raised flex items-center justify-center text-text-secondary shadow-sm border border-border transition-all"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-center">
                                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-current/20 ${getStatusStyle(detalle.estado)}`}>
                                        {detalle.estado}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-surface-raised p-4 rounded-2xl text-center border border-border shadow-sm">
                                        <p className="text-[9px] font-black text-text-secondary opacity-40 uppercase tracking-widest mb-1">Fecha</p>
                                        <p className="font-black text-text-primary text-xs">{detalle.fecha}</p>
                                    </div>
                                    <div className="bg-primary-light/30 p-4 rounded-2xl text-center border border-primary-light shadow-sm">
                                        <p className="text-[9px] font-black text-primary opacity-60 uppercase tracking-widest mb-1">Hora</p>
                                        <p className="font-black text-primary-dark text-xs">{detalle.horaInicio}</p>
                                    </div>
                                    <div className="bg-surface-raised p-4 rounded-2xl text-center border border-border shadow-sm">
                                        <p className="text-[9px] font-black text-text-secondary opacity-40 uppercase tracking-widest mb-1">Duración</p>
                                        <p className="font-black text-text-primary text-xs">{detalle.duracion} min</p>
                                    </div>
                                </div>

                                <div className="bg-surface-raised p-4 rounded-2xl border border-border shadow-sm">
                                    <p className="text-[9px] font-black text-text-secondary opacity-40 uppercase tracking-widest mb-1">Doctor Asignado</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-primary text-xs">🩺</span>
                                        <p className="font-black text-text-primary text-sm uppercase tracking-tight">Dr. {detalle.doctorNombre}</p>
                                    </div>
                                </div>

                                <div className="bg-surface-raised p-4 rounded-2xl border border-border shadow-sm">
                                    <p className="text-[9px] font-black text-text-secondary opacity-40 uppercase tracking-widest mb-1">Motivo de Consulta</p>
                                    <p className="text-text-primary text-sm font-medium">{detalle.motivoConsulta}</p>
                                </div>

                                {detalle.observaciones && (
                                    <div className="bg-warning-light/30 p-4 rounded-2xl border border-warning-light shadow-sm">
                                        <p className="text-[9px] font-black text-warning-dark opacity-80 uppercase tracking-widest mb-1">Observaciones</p>
                                        <p className="text-warning-dark text-sm font-medium leading-relaxed italic">"{detalle.observaciones}"</p>
                                    </div>
                                )}

                                {/* Acciones */}
                                <div className="flex flex-col gap-3 pt-4">
                                    <button
                                        onClick={() => { navigate(`/pacientes/${detalle.pacienteId}`); setCitaDetalle(null); }}
                                        className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary-dark shadow-xl shadow-primary/30 transition-all flex items-center justify-center gap-3 text-xs"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        Ver Expediente del Paciente
                                    </button>

                                    {(detalle.estado === 'PROGRAMADA' || detalle.estado === 'CONFIRMADA') && (
                                        <button
                                            onClick={() => openEditModal(citaDetalle)}
                                            className="w-full py-4 bg-surface-raised text-text-primary font-black uppercase tracking-widest rounded-xl hover:bg-surface border border-border shadow-sm transition-all flex items-center justify-center gap-3 text-xs"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            Editar Cita
                                        </button>
                                    )}

                                    {detalle.estado === 'PROGRAMADA' && (
                                        <button
                                            onClick={() => {
                                                cambiarEstadoMutation.mutate({ id: detalle.citaId, estado: 'CONFIRMADA' });
                                            }}
                                            disabled={cambiarEstadoMutation.isPending}
                                            className="w-full py-4 bg-primary-light text-primary font-black uppercase tracking-widest rounded-xl hover:bg-primary-light/80 border border-primary/20 transition-all flex items-center justify-center gap-3 text-xs"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Confirmar Cita
                                        </button>
                                    )}

                                    {(detalle.estado === 'PROGRAMADA' || detalle.estado === 'CONFIRMADA' || detalle.estado === 'EN_ATENCION') && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => {
                                                    if (confirm('¿Marcar cita como completada?')) {
                                                        cambiarEstadoMutation.mutate({ id: detalle.citaId, estado: 'COMPLETADA' });
                                                    }
                                                }}
                                                disabled={cambiarEstadoMutation.isPending}
                                                className="py-4 bg-secondary-light text-secondary font-black uppercase tracking-widest rounded-xl hover:bg-secondary hover:text-white border border-secondary/20 transition-all text-[10px] flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                Completar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const motivo = prompt('Motivo de cancelación:');
                                                    if (motivo) {
                                                        cambiarEstadoMutation.mutate({ id: detalle.citaId, estado: 'CANCELADA', motivo });
                                                    }
                                                }}
                                                disabled={cambiarEstadoMutation.isPending}
                                                className="py-4 bg-danger-light/30 text-danger font-black uppercase tracking-widest rounded-xl hover:bg-danger hover:text-white border border-danger/20 transition-all text-[10px] flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                                Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default Citas;
