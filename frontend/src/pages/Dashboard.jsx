import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { pacientesService, citasService, dashboardService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/format';

const Dashboard = () => {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const hour = today.getHours();
    const [selectedDate, setSelectedDate] = useState(today);

    const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
    const nombreUsuario = usuario?.nombre || usuario?.username || 'Doctor';

    const empresaId = usuario?.empresa_id || 1;

    // Queries canónicas de Dashboard
    const { data: statsRes, isLoading: loadingStats } = useQuery({
        queryKey: ['dashboard-stats', empresaId],
        queryFn: () => dashboardService.getStats(empresaId),
    });

    const { data: actividadRes, isLoading: loadingActividad } = useQuery({
        queryKey: ['dashboard-actividad', empresaId],
        queryFn: () => dashboardService.getActividadSemanal(empresaId),
    });

    const { data: patientsData, isLoading: loadingPatients } = useQuery({
        queryKey: ['pacientes-dashboard', empresaId],
        queryFn: () => pacientesService.getAll({ empresa_id: empresaId, limit: 5 }),
    });

    const { data: citasToday, isLoading: loadingCitas } = useQuery({
        queryKey: ['citas-hoy', todayStr, empresaId],
        queryFn: () => citasService.getAll({ empresa_id: empresaId, fecha: todayStr }),
    });

    // Obtener citas de la semana para el gráfico
    const getWeekDates = () => {
        const dates = [];
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lunes
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };
    getWeekDates(); // Para futuras consultas de citas por día

    // Simular datos del gráfico semanal (en producción vendrían de la API)
    // Datos reales mapeados
    const statsData = statsRes?.data?.items?.[0] || statsRes?.data || {};
    const weeklyDataRaw = actividadRes?.data?.items || [];

    const weeklyData = weeklyDataRaw.length > 0 ? weeklyDataRaw.map(d => ({
        day: d.dia_nombre.charAt(0).toUpperCase() + d.dia_nombre.slice(1).toLowerCase().replace('.', ''),
        citas: d.total_citas,
        completadas: d.completadas
    })) : [
        { day: 'Lun', citas: 0, completadas: 0 },
        { day: 'Mar', citas: 0, completadas: 0 },
        { day: 'Mié', citas: 0, completadas: 0 },
        { day: 'Jue', citas: 0, completadas: 0 },
        { day: 'Vie', citas: 0, completadas: 0 },
        { day: 'Sáb', citas: 0, completadas: 0 },
        { day: 'Dom', citas: 0, completadas: 0 },
    ];

    const formatCurrency = (amount) => {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M Gs`;
        }
        return new Intl.NumberFormat('es-PY').format(amount) + ' Gs';
    };

    const maxCitas = Math.max(...weeklyData.map(d => d.citas), 1);

    const stats = [
        {
            label: 'Pacientes Registrados',
            value: statsData.total_pacientes || 0,
            icon: '👥',
            color: 'from-blue-600 to-indigo-600',
            bgColor: 'bg-blue-500',
            trend: 'Base de datos real',
            trendUp: true
        },
        {
            label: 'Citas para Hoy',
            value: statsData.citas_hoy || 0,
            icon: '📅',
            color: 'from-emerald-500 to-teal-600',
            bgColor: 'bg-emerald-500',
            trend: statsData.citas_hoy > 0 ? `${statsData.citas_hoy} pendientes` : 'Sin citas',
            trendUp: true
        },
        {
            label: 'Tratamientos Activos',
            value: statsData.tratamientos_activos || 0,
            icon: '💊',
            color: 'from-amber-500 to-orange-600',
            bgColor: 'bg-amber-500',
            trend: 'Tratamientos en proceso',
            trendUp: false
        },
        {
            label: 'Ingresos del Mes',
            value: formatCurrency(statsData.ingresos_mes || 0),
            icon: '💰',
            color: 'from-rose-500 to-pink-600',
            bgColor: 'bg-rose-500',
            trend: 'Mes actual',
            trendUp: true
        },
    ];

    const recentAppointments = citasToday?.data?.items?.slice(0, 5) || [];
    const recentPatients = patientsData?.data?.items?.slice(0, 4) || [];

    // Mini Calendario
    const generateCalendarDays = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = (firstDay.getDay() + 6) % 7; // Ajustar para que empiece en Lunes

        const days = [];
        // Días del mes anterior
        for (let i = startPadding - 1; i >= 0; i--) {
            const d = new Date(year, month, -i);
            days.push({ date: d, currentMonth: false });
        }
        // Días del mes actual
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({ date: new Date(year, month, i), currentMonth: true });
        }
        // Días del próximo mes
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), currentMonth: false });
        }
        return days;
    };

    const calendarDays = generateCalendarDays();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const isToday = (date) => {
        return date.toDateString() === today.toDateString();
    };

    // Días con citas (simulado)
    const daysWithAppointments = [3, 5, 8, 12, 15, 18, 22, 25, 28];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Greeting Section */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl"></div>
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">👋</span>
                            <h1 className="text-3xl font-black tracking-tight">{greeting}, {nombreUsuario}</h1>
                        </div>
                        <p className="text-slate-400 text-base font-medium">
                            Tienes <span className="text-white font-bold">{loadingStats ? '...' : statsData.citas_hoy || 0} cita{statsData.citas_hoy !== 1 ? 's' : ''}</span> programada{statsData.citas_hoy !== 1 ? 's' : ''} para hoy
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hoy es</p>
                                <p className="text-lg font-bold">{formatDate(todayStr)}</p>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-lg">
                                🗓️
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-[0.05] rounded-bl-full group-hover:opacity-[0.1] transition-opacity`}></div>
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`bg-gradient-to-br ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                    {stat.icon}
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {stat.trendUp ? '↑' : '→'} {stat.trend}
                                </span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Agenda & Chart */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Weekly Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Actividad Semanal</h3>
                                <p className="text-xs text-slate-400 mt-1">Citas programadas vs completadas</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                    <span className="text-slate-500 font-medium">Programadas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-slate-500 font-medium">Completadas</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-end justify-between gap-3 h-40">
                            {weeklyData.map((data, idx) => {
                                const isCurrentDay = idx === (today.getDay() + 6) % 7;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex flex-col items-center gap-1 relative" style={{ height: '120px' }}>
                                            {/* Barra de citas programadas */}
                                            <div
                                                className={`w-full max-w-[40px] rounded-t-lg transition-all ${isCurrentDay ? 'bg-primary' : 'bg-primary/30'}`}
                                                style={{ height: `${(data.citas / maxCitas) * 100}%`, minHeight: data.citas > 0 ? '8px' : '0' }}
                                            ></div>
                                            {/* Barra de completadas (overlay) */}
                                            <div
                                                className="absolute bottom-0 w-full max-w-[40px] bg-emerald-500 rounded-t-lg transition-all"
                                                style={{ height: `${(data.completadas / maxCitas) * 100}%`, minHeight: data.completadas > 0 ? '8px' : '0' }}
                                            ></div>
                                            {/* Número */}
                                            {data.citas > 0 && (
                                                <span className="absolute -top-5 text-[10px] font-bold text-slate-400">{data.citas}</span>
                                            )}
                                        </div>
                                        <span className={`text-xs font-bold ${isCurrentDay ? 'text-primary' : 'text-slate-400'}`}>
                                            {data.day}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Agenda del Día */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                Agenda del Día
                            </h3>
                            <Link to="/citas" className="text-primary text-xs font-bold hover:underline">Ver todas →</Link>
                        </div>
                        <div className="p-6">
                            {loadingCitas ? (
                                <div className="py-16 text-center">
                                    <div className="w-8 h-8 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                                    <p className="text-slate-400 font-medium text-sm">Cargando agenda...</p>
                                </div>
                            ) : recentAppointments.length === 0 ? (
                                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <div className="text-5xl mb-3">☕</div>
                                    <p className="text-slate-500 font-bold">Sin citas programadas</p>
                                    <p className="text-slate-400 text-sm mt-1">¡Disfruta el día libre!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentAppointments.map((cita, idx) => (
                                        <div
                                            key={cita.cita_id || idx}
                                            className="group flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-200"
                                            onClick={() => navigate(`/pacientes/${cita.paciente_id}`)}
                                        >
                                            <div className="w-16 text-center">
                                                <p className="text-lg font-black text-primary">{cita.hora_inicio || '09:00'}</p>
                                            </div>
                                            <div className="w-1 h-12 bg-gradient-to-b from-primary to-blue-300 rounded-full"></div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800">{cita.paciente_nombre || 'Paciente'}</p>
                                                <p className="text-xs text-slate-400 truncate">{cita.motivo_consulta || 'Consulta general'}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${cita.estado === 'CONFIRMADA' ? 'bg-emerald-100 text-emerald-700' :
                                                cita.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                {cita.estado || 'Pendiente'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Calendar & Quick Actions */}
                <div className="space-y-8">
                    {/* Mini Calendario */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-slate-800">
                                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                            </h3>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                                >
                                    →
                                </button>
                            </div>
                        </div>

                        {/* Días de la semana */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                                <div key={day} className="text-center text-[10px] font-bold text-slate-400 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Días del mes */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, idx) => {
                                const dayNum = day.date.getDate();
                                const hasAppointment = day.currentMonth && daysWithAppointments.includes(dayNum);
                                const isTodayDate = isToday(day.date);

                                return (
                                    <button
                                        key={idx}
                                        className={`aspect-square rounded-lg text-sm font-medium transition-all relative
                                            ${!day.currentMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-slate-100'}
                                            ${isTodayDate ? 'bg-primary text-white hover:bg-primary/90 font-bold' : ''}
                                        `}
                                    >
                                        {dayNum}
                                        {hasAppointment && !isTodayDate && (
                                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pacientes Recientes */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl overflow-hidden relative">
                        <div className="absolute -right-8 -top-8 opacity-10 text-8xl">👥</div>
                        <div className="flex items-center justify-between mb-5 relative z-10">
                            <h3 className="font-black">Pacientes Recientes</h3>
                            <Link to="/pacientes" className="text-slate-400 hover:text-white text-xs font-bold transition-colors">Ver todos →</Link>
                        </div>
                        <div className="space-y-3 relative z-10">
                            {loadingPatients ? (
                                <div className="text-slate-500 text-sm py-8 text-center">Cargando...</div>
                            ) : recentPatients.length === 0 ? (
                                <div className="text-slate-500 text-sm py-8 text-center">Sin pacientes recientes</div>
                            ) : recentPatients.map((p) => (
                                <Link
                                    key={p.paciente_id}
                                    to={`/pacientes/${p.paciente_id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-bold text-white group-hover:scale-110 transition-transform">
                                        {p.nombre?.charAt(0)}{p.apellido?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{p.nombre_completo}</p>
                                        <p className="text-[10px] text-slate-500">HC: {p.numero_historia}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h4 className="font-black text-slate-800 mb-4">Acciones Rápidas</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => navigate('/citas')}
                                className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-primary hover:text-white transition-all group"
                            >
                                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🦷</span>
                                <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-white">Nueva Cita</span>
                            </button>
                            <button
                                onClick={() => navigate('/pacientes')}
                                className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-emerald-600 hover:text-white transition-all group"
                            >
                                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">👤</span>
                                <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-white">Nuevo Paciente</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-amber-500 hover:text-white transition-all group">
                                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</span>
                                <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-white">Reportes</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-slate-900 hover:text-white transition-all group">
                                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">⚙️</span>
                                <span className="text-[10px] font-bold uppercase text-slate-500 group-hover:text-white">Configurar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Stats Bar */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-8">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasa de Asistencia</p>
                        <p className="text-2xl font-black">94%</p>
                    </div>
                    <div className="w-px h-10 bg-slate-700"></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Satisfacción</p>
                        <p className="text-2xl font-black">4.8 <span className="text-amber-400">★</span></p>
                    </div>
                    <div className="w-px h-10 bg-slate-700"></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Citas Esta Semana</p>
                        <p className="text-2xl font-black">{weeklyData.reduce((acc, d) => acc + d.citas, 0)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-400">Sistema operativo al 100%</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
