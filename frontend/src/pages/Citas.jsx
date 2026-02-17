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
        queryKey: ['pacientes-search', searchPaciente],
        queryFn: () => pacientesService.search(searchPaciente),
        enabled: searchPaciente.length >= 2
    });

    // Mutations
    const crearCitaMutation = useMutation({
        mutationFn: (data) => citasService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['citas']);
            setShowModal(false);
            resetForm();
        }
    });

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
        pendientes: citas.filter(c => c.estado === 'PENDIENTE').length,
        confirmadas: citas.filter(c => c.estado === 'CONFIRMADA').length,
        completadas: citas.filter(c => c.estado === 'COMPLETADA').length,
        canceladas: citas.filter(c => c.estado === 'CANCELADA').length,
    };

    const resetForm = () => {
        setFormCita({
            fecha: today.toISOString().split('T')[0],
            hora_inicio: '09:00',
            duracion_minutos: 30,
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
        if (!selectedPaciente) {
            alert('Debe seleccionar un paciente');
            return;
        }
        crearCitaMutation.mutate({
            paciente_id: selectedPaciente.paciente_id,
            ...formCita,
            empresa_id: empresaId
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'COMPLETADA': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'CANCELADA': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'CONFIRMADA': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'PENDIENTE': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETADA': return '✅';
            case 'CANCELADA': return '❌';
            case 'CONFIRMADA': return '📋';
            case 'PENDIENTE': return '⏳';
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
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Agenda de Citas</h1>
                    <p className="text-slate-500 font-medium">Gestiona los turnos y el flujo de pacientes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 w-fit"
                >
                    <span className="text-xl">+</span> Nueva Cita
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-black text-slate-800">{stats.total}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pendientes</p>
                    <p className="text-2xl font-black text-amber-700">{stats.pendientes}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Confirmadas</p>
                    <p className="text-2xl font-black text-blue-700">{stats.confirmadas}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Completadas</p>
                    <p className="text-2xl font-black text-emerald-700">{stats.completadas}</p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Canceladas</p>
                    <p className="text-2xl font-black text-rose-700">{stats.canceladas}</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Fecha</label>
                    <input
                        type="date"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Estado</label>
                    <select
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700 cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="PENDIENTE">Pendientes</option>
                        <option value="CONFIRMADA">Confirmadas</option>
                        <option value="COMPLETADA">Completadas</option>
                        <option value="CANCELADA">Canceladas</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterDate(today.toISOString().split('T')[0])}
                        className="px-4 py-2.5 text-primary font-bold text-sm hover:bg-primary/5 rounded-xl transition-all border border-primary/20"
                    >
                        Hoy
                    </button>
                    <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2.5 text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                            Lista
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-4 py-2.5 text-sm font-bold transition-all ${viewMode === 'week' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                            Semana
                        </button>
                    </div>
                </div>
            </div>

            {/* Vista de Lista */}
            {viewMode === 'list' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-20 text-center">
                            <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-slate-400 font-medium">Cargando agenda...</p>
                        </div>
                    ) : isError ? (
                        <div className="p-12 text-center text-rose-500 font-bold bg-rose-50">
                            Error: {error.message}
                        </div>
                    ) : citas.length === 0 ? (
                        <div className="p-20 text-center">
                            <div className="text-5xl mb-4 opacity-30">📅</div>
                            <p className="text-slate-800 font-bold text-lg">Sin citas programadas</p>
                            <p className="text-slate-400 text-sm mt-1">No hay citas para esta fecha</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 bg-primary text-white px-6 py-2 rounded-xl font-bold text-sm"
                            >
                                + Agendar Cita
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {citas.map((cita) => {
                                // Normalizar campos (mayúsculas/minúsculas)
                                const citaId = cita.cita_id || cita.CITA_ID;
                                const pacienteId = cita.paciente_id || cita.PACIENTE_ID;
                                const pacienteNombre = cita.paciente_nombre || cita.PACIENTE_NOMBRE || 'Sin nombre';
                                const doctorNombre = cita.doctor_nombre || cita.DOCTOR_NOMBRE || 'Sin asignar';
                                const horaInicio = cita.hora_inicio || cita.HORA_INICIO || '09:00';
                                const horaFin = cita.hora_fin || cita.HORA_FIN || '';
                                const motivoConsulta = cita.motivo_consulta || cita.MOTIVO_CONSULTA || 'Consulta general';
                                const estado = cita.estado || cita.ESTADO || 'PENDIENTE';
                                const duracion = cita.duracion_minutos || cita.DURACION_MINUTOS || 30;

                                return (
                                    <div
                                        key={citaId}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-all cursor-pointer group"
                                        onClick={() => setCitaDetalle({ ...cita, cita_id: citaId, paciente_id: pacienteId, paciente_nombre: pacienteNombre, doctor_nombre: doctorNombre, hora_inicio: horaInicio, hora_fin: horaFin, motivo_consulta: motivoConsulta, estado, duracion_minutos: duracion })}
                                    >
                                        <div className="w-20 text-center">
                                            <p className="text-xl font-black text-primary">{horaInicio}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">{duracion} min</p>
                                        </div>
                                        <div className="w-1 h-12 bg-gradient-to-b from-primary to-blue-300 rounded-full"></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-bold text-slate-800 group-hover:text-primary transition-colors">{pacienteNombre}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(estado)}`}>
                                                    {getStatusIcon(estado)} {estado}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">{motivoConsulta}</p>
                                            <p className="text-[10px] text-slate-400">Dr. {doctorNombre}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/pacientes/${pacienteId}`); }}
                                                className="p-2 bg-slate-100 hover:bg-primary hover:text-white rounded-lg transition-all"
                                                title="Ver paciente"
                                            >
                                                👁️
                                            </button>
                                            {estado !== 'COMPLETADA' && estado !== 'CANCELADA' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('¿Marcar como completada?')) {
                                                            cambiarEstadoMutation.mutate({ id: citaId, estado: 'COMPLETADA' });
                                                        }
                                                    }}
                                                    className="p-2 bg-emerald-100 hover:bg-emerald-500 hover:text-white text-emerald-700 rounded-lg transition-all"
                                                    title="Completar"
                                                >
                                                    ✓
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
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="min-w-[700px]">
                            <div className="grid grid-cols-8 border-b border-slate-200">
                                <div className="p-3 bg-slate-50"></div>
                                {weekDays.map((date, idx) => {
                                    const isToday = date.toDateString() === today.toDateString();
                                    const isSelected = date.toISOString().split('T')[0] === filterDate;
                                    return (
                                        <div
                                            key={idx}
                                            className={`p-3 text-center cursor-pointer transition-all ${isToday ? 'bg-primary/10' : 'bg-slate-50'} ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}`}
                                            onClick={() => setFilterDate(date.toISOString().split('T')[0])}
                                        >
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{dayNames[idx]}</p>
                                            <p className={`text-lg font-black ${isToday ? 'text-primary' : 'text-slate-700'}`}>{date.getDate()}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="max-h-[500px] overflow-y-auto">
                                {hours.map((hour) => (
                                    <div key={hour} className="grid grid-cols-8 border-b border-slate-100 min-h-[60px]">
                                        <div className="p-2 text-xs font-bold text-slate-400 bg-slate-50/50 flex items-start justify-end pr-3">
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
                                                <div key={idx} className="p-1 border-l border-slate-100 relative">
                                                    {citasHora.map((cita) => {
                                                        const citaId = cita.cita_id || cita.CITA_ID;
                                                        const estado = cita.estado || cita.ESTADO;
                                                        const pacienteNombre = cita.paciente_nombre || cita.PACIENTE_NOMBRE || '';
                                                        return (
                                                            <div
                                                                key={citaId}
                                                                className={`text-[10px] p-1 rounded mb-1 cursor-pointer truncate ${getStatusStyle(estado)}`}
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in duration-300">
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-800">Nueva Cita</h2>
                                <button
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitCita} className="p-6 space-y-4">
                            {/* LOV de Paciente Mejorado */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Paciente *</label>
                                {selectedPaciente ? (
                                    <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary">
                                                {selectedPaciente.nombre?.charAt(0) || selectedPaciente.NOMBRE?.charAt(0)}
                                                {selectedPaciente.apellido?.charAt(0) || selectedPaciente.APELLIDO?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">
                                                    {selectedPaciente.nombre_completo || selectedPaciente.NOMBRE_COMPLETO ||
                                                        `${selectedPaciente.nombre || selectedPaciente.NOMBRE} ${selectedPaciente.apellido || selectedPaciente.APELLIDO}`}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    HC: {selectedPaciente.numero_historia || selectedPaciente.NUMERO_HISTORIA} |
                                                    Doc: {selectedPaciente.documento_numero || selectedPaciente.DOCUMENTO_NUMERO}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedPaciente(null); setSearchPaciente(''); }}
                                            className="w-8 h-8 rounded-lg bg-rose-100 hover:bg-rose-200 flex items-center justify-center text-rose-600 transition-all"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                placeholder="Buscar por nombre, apellido o documento..."
                                                value={searchPaciente}
                                                onChange={(e) => {
                                                    setSearchPaciente(e.target.value);
                                                    setShowLOV(e.target.value.length >= 2);
                                                }}
                                                onFocus={() => searchPaciente.length >= 2 && setShowLOV(true)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>

                                        {/* LOV Dropdown */}
                                        {showLOV && searchPaciente.length >= 2 && (
                                            <div
                                                ref={lovRef}
                                                className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-hidden z-50"
                                            >
                                                {/* Header del LOV */}
                                                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        {pacientesResults.length} resultado(s)
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowLOV(false)}
                                                        className="text-slate-400 hover:text-slate-600 text-xs"
                                                    >
                                                        Cerrar
                                                    </button>
                                                </div>

                                                {/* Lista de resultados */}
                                                <div className="max-h-52 overflow-y-auto">
                                                    {pacientesResults.length === 0 ? (
                                                        <div className="px-4 py-6 text-center">
                                                            <p className="text-slate-400 text-sm">No se encontraron pacientes</p>
                                                            <p className="text-slate-300 text-xs mt-1">Intente con otro término</p>
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
                                                                    className="w-full text-left px-4 py-3 hover:bg-primary/5 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                                                                >
                                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-100 flex items-center justify-center text-sm font-bold text-primary">
                                                                        {nombre.charAt(0)}{apellido.charAt(0)}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-bold text-slate-800 truncate">{nombreCompleto}</p>
                                                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                                                            <span>📄 {documento}</span>
                                                                            {telefono && <span>📱 {telefono}</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-bold">
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Fecha *</label>
                                    <input
                                        type="date"
                                        value={formCita.fecha}
                                        onChange={(e) => setFormCita({ ...formCita, fecha: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none text-sm"
                                        min={today.toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Hora *</label>
                                    <select
                                        value={formCita.hora_inicio}
                                        onChange={(e) => setFormCita({ ...formCita, hora_inicio: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none text-sm cursor-pointer"
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
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Duración</label>
                                    <select
                                        value={formCita.duracion_minutos}
                                        onChange={(e) => setFormCita({ ...formCita, duracion_minutos: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none text-sm cursor-pointer"
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

                            {/* Doctor */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Doctor</label>
                                <select
                                    value={formCita.doctor_id}
                                    onChange={(e) => setFormCita({ ...formCita, doctor_id: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none cursor-pointer"
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
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Motivo de Consulta</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Control rutinario, dolor de muela..."
                                    value={formCita.motivo_consulta}
                                    onChange={(e) => setFormCita({ ...formCita, motivo_consulta: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none"
                                />
                            </div>

                            {/* Notas */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Notas adicionales</label>
                                <textarea
                                    rows={2}
                                    placeholder="Observaciones..."
                                    value={formCita.notas}
                                    onChange={(e) => setFormCita({ ...formCita, notas: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none resize-none"
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={crearCitaMutation.isPending || !selectedPaciente}
                                    className="flex-1 py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {crearCitaMutation.isPending ? 'Guardando...' : 'Agendar Cita'}
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
                    estado: citaDetalle.estado || citaDetalle.ESTADO || 'PENDIENTE',
                    tipoCita: citaDetalle.tipo_cita || citaDetalle.TIPO_CITA || 'CONSULTA',
                    consultorio: citaDetalle.consultorio || citaDetalle.CONSULTORIO || '',
                    observaciones: citaDetalle.observaciones || citaDetalle.OBSERVACIONES || ''
                };

                return (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in duration-300">
                            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-primary/10 to-blue-50 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-primary text-lg">
                                            {detalle.pacienteNombre.split(' ').slice(0, 2).map(n => n.charAt(0)).join('')}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cita #{detalle.citaId}</p>
                                            <h2 className="text-xl font-black text-slate-800">{detalle.pacienteNombre}</h2>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setCitaDetalle(null)}
                                        className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-center">
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusStyle(detalle.estado)}`}>
                                        {getStatusIcon(detalle.estado)} {detalle.estado}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-slate-50 p-3 rounded-xl text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Fecha</p>
                                        <p className="font-bold text-slate-800 text-sm">{detalle.fecha}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Hora</p>
                                        <p className="font-bold text-primary text-sm">{detalle.horaInicio}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl text-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Duración</p>
                                        <p className="font-bold text-slate-800 text-sm">{detalle.duracion} min</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-3 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Doctor Asignado</p>
                                    <p className="font-bold text-slate-800">Dr. {detalle.doctorNombre}</p>
                                </div>

                                <div className="bg-slate-50 p-3 rounded-xl">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Motivo de Consulta</p>
                                    <p className="text-slate-700">{detalle.motivoConsulta}</p>
                                </div>

                                {detalle.observaciones && (
                                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                                        <p className="text-[10px] font-bold text-amber-600 uppercase">Observaciones</p>
                                        <p className="text-amber-800 text-sm">{detalle.observaciones}</p>
                                    </div>
                                )}

                                {/* Acciones */}
                                <div className="flex flex-col gap-2 pt-2">
                                    <button
                                        onClick={() => { navigate(`/pacientes/${detalle.pacienteId}`); setCitaDetalle(null); }}
                                        className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>👤</span> Ver Expediente del Paciente
                                    </button>

                                    {detalle.estado === 'PENDIENTE' && (
                                        <button
                                            onClick={() => {
                                                cambiarEstadoMutation.mutate({ id: detalle.citaId, estado: 'CONFIRMADA' });
                                            }}
                                            disabled={cambiarEstadoMutation.isPending}
                                            className="w-full py-3 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span>📋</span> Confirmar Cita
                                        </button>
                                    )}

                                    {(detalle.estado === 'PENDIENTE' || detalle.estado === 'CONFIRMADA') && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => {
                                                    if (confirm('¿Marcar cita como completada?')) {
                                                        cambiarEstadoMutation.mutate({ id: detalle.citaId, estado: 'COMPLETADA' });
                                                    }
                                                }}
                                                disabled={cambiarEstadoMutation.isPending}
                                                className="py-3 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-all text-sm"
                                            >
                                                ✅ Completar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const motivo = prompt('Motivo de cancelación:');
                                                    if (motivo) {
                                                        cambiarEstadoMutation.mutate({ id: detalle.citaId, estado: 'CANCELADA', motivo });
                                                    }
                                                }}
                                                disabled={cambiarEstadoMutation.isPending}
                                                className="py-3 bg-rose-100 text-rose-700 font-bold rounded-xl hover:bg-rose-200 transition-all text-sm"
                                            >
                                                ❌ Cancelar
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
