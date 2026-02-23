import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { pacientesService, citasService, dashboardService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/format';

/* ────────────────────────── SVG Icon Components ────────────────────────── */
const Icon = ({ children, className = '' }) => (
    <svg className={`w-5 h-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{children}</svg>
);
const IconUsers = (p) => <Icon {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></Icon>;
const IconCalendar = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></Icon>;
const IconActivity = (p) => <Icon {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></Icon>;
const IconTrendUp = (p) => <Icon {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></Icon>;
const IconDollar = (p) => <Icon {...p}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></Icon>;
const IconChevronRight = (p) => <Icon {...p}><polyline points="9 18 15 12 9 6" /></Icon>;
const IconClock = (p) => <Icon {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>;
const IconArrowRight = (p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>;
const IconPlus = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>;
const IconTooth = (p) => <Icon {...p}><path d="M12 2C9.5 2 7.5 3.5 6.5 5.5C5.5 7.5 5 9 4 10.5C3 12 2 14 3 16.5C4 19 6 20 7.5 22C8.5 20 9 16 10 14C10.5 13 11 12.5 12 12.5C13 12.5 13.5 13 14 14C15 16 15.5 20 16.5 22C18 20 20 19 21 16.5C22 14 21 12 20 10.5C19 9 18.5 7.5 17.5 5.5C16.5 3.5 14.5 2 12 2Z" /></Icon>;

/* ────────────────────────── Stat Card Component ────────────────────────── */
const StatCard = ({ icon: IconComp, label, value, trend, trendLabel, accentColor, bgGradient }) => (
    <div className="group relative bg-surface-card rounded-2xl border border-border p-5 hover:shadow-lg hover:shadow-primary-100/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
        {/* Subtle accent glow */}
        <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full ${bgGradient} opacity-[0.07] group-hover:opacity-[0.12] blur-2xl transition-opacity duration-500`} />
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${bgGradient} flex items-center justify-center shadow-sm`}>
                    <IconComp className={`w-5 h-5 ${accentColor}`} />
                </div>
                {trend !== null && trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend >= 0 ? '↑' : '↓'} {trendLabel}
                    </div>
                )}
            </div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-extrabold text-text-primary tracking-tight">{value}</p>
        </div>
    </div>
);

/* ────────────────────────── Appointment Row ────────────────────────── */
const AppointmentRow = ({ cita, onClick }) => {
    const statusStyles = {
        CONFIRMADA: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
        PENDIENTE: 'bg-amber-50 text-amber-700 ring-amber-600/10',
        CANCELADA: 'bg-rose-50 text-rose-700 ring-rose-600/10',
        COMPLETADA: 'bg-sky-50 text-sky-700 ring-sky-600/10',
    };
    const estado = cita.estado || 'PENDIENTE';
    const style = statusStyles[estado] || 'bg-slate-50 text-slate-600 ring-slate-500/10';

    return (
        <div
            onClick={onClick}
            className="group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-primary-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-primary-100"
        >
            <div className="flex flex-col items-center w-14 shrink-0">
                <span className="text-sm font-extrabold text-primary tabular-nums">{cita.hora_inicio || '--:--'}</span>
                <span className="text-[10px] text-text-secondary opacity-60 font-medium">hrs</span>
            </div>
            <div className="w-px h-10 bg-gradient-to-b from-primary/60 to-primary/10 rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-primary truncate group-hover:text-primary transition-colors">{cita.paciente_nombre || 'Paciente'}</p>
                <p className="text-xs text-text-secondary opacity-60 truncate mt-0.5">{cita.motivo_consulta || 'Consulta general'}</p>
            </div>
            <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${style}`}>
                {estado}
            </span>
            <IconChevronRight className="w-4 h-4 text-text-secondary opacity-30 group-hover:text-primary transition-colors shrink-0" />
        </div>
    );
};

/* ────────────────────────── Mini Bar Chart ────────────────────────── */
const WeeklyChart = ({ data, maxVal }) => {
    const today = new Date();
    const currentDayIdx = (today.getDay() + 6) % 7;

    return (
        <div className="flex items-end justify-between gap-2 h-36 px-1">
            {data.map((d, i) => {
                const isToday = i === currentDayIdx;
                const barHeight = maxVal > 0 ? (d.citas / maxVal) * 100 : 0;
                const complHeight = maxVal > 0 ? (d.completadas / maxVal) * 100 : 0;

                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full flex flex-col items-center relative" style={{ height: '110px' }}>
                            {d.citas > 0 && (
                                <span className="text-[10px] font-bold text-text-secondary opacity-60 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{d.citas}</span>
                            )}
                            <div className="w-full flex-1 flex items-end justify-center">
                                <div className="relative w-full max-w-[32px]">
                                    <div
                                        className={`w-full rounded-lg transition-all duration-500 ${isToday ? 'bg-primary/20' : 'bg-surface-raised'}`}
                                        style={{ height: `${Math.max(barHeight, d.citas > 0 ? 8 : 0)}%`, minHeight: d.citas > 0 ? '6px' : '0' }}
                                    />
                                    <div
                                        className={`absolute bottom-0 left-0 w-full rounded-lg transition-all duration-500 ${isToday ? 'bg-primary' : 'bg-primary/50'}`}
                                        style={{ height: `${Math.max(complHeight, d.completadas > 0 ? 8 : 0)}%`, minHeight: d.completadas > 0 ? '6px' : '0' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <span className={`text-[11px] font-bold ${isToday ? 'text-primary' : 'text-text-secondary opacity-60'}`}>
                            {d.day}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

/* ────────────────────────── Main Dashboard ────────────────────────── */
const Dashboard = () => {
    const navigate = useNavigate();
    const { usuario, empresaActiva } = useAuth();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const hour = today.getHours();
    const [selectedDate, setSelectedDate] = useState(today);

    const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
    const nombreUsuario = usuario?.nombre || usuario?.username || 'Doctor';
    const empresaId = empresaActiva?.empresa_id;

    /* ── Queries ── */
    const { data: statsRes, isLoading: loadingStats } = useQuery({
        queryKey: ['dashboard-stats', empresaId],
        queryFn: () => dashboardService.getStats(empresaId),
    });

    const { data: actividadRes } = useQuery({
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

    /* ── Derived data ── */
    const statsData = statsRes?.data?.items?.[0] || statsRes?.data || {};
    const weeklyDataRaw = actividadRes?.data?.items || [];

    const weeklyData = useMemo(() => {
        if (weeklyDataRaw.length > 0) {
            return weeklyDataRaw.map(d => ({
                day: (d.dia_nombre || '').charAt(0).toUpperCase() + (d.dia_nombre || '').slice(1).toLowerCase().replace('.', ''),
                citas: d.total_citas || 0,
                completadas: d.completadas || 0,
            }));
        }
        return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => ({ day: d, citas: 0, completadas: 0 }));
    }, [weeklyDataRaw]);

    const formatCurrency = (amount) => {
        if (!amount) return '0 Gs';
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M Gs`;
        return new Intl.NumberFormat('es-PY').format(amount) + ' Gs';
    };

    const maxCitas = Math.max(...weeklyData.map(d => d.citas), 1);
    const recentAppointments = citasToday?.data?.items?.slice(0, 6) || [];
    const recentPatients = patientsData?.data?.items?.slice(0, 5) || [];
    const totalCitasSemana = weeklyData.reduce((a, d) => a + d.citas, 0);
    const totalCompletadas = weeklyData.reduce((a, d) => a + d.completadas, 0);

    /* ── Calendar helpers ── */
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const calendarDays = useMemo(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPad = (firstDay.getDay() + 6) % 7;
        const days = [];
        for (let i = startPad - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), currentMonth: false });
        for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(year, month, i), currentMonth: true });
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) days.push({ date: new Date(year, month + 1, i), currentMonth: false });
        return days;
    }, [selectedDate]);

    const isToday = (d) => d.toDateString() === today.toDateString();

    /* ── Date display ── */
    const dateDisplay = today.toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    /* ── Quick actions ── */
    const quickActions = [
        { label: 'Nueva Cita', icon: IconCalendar, path: '/citas', gradient: 'from-blue-500 to-blue-600' },
        { label: 'Nuevo Paciente', icon: IconUsers, path: '/pacientes', gradient: 'from-emerald-500 to-emerald-600' },
        { label: 'Odontograma', icon: IconTooth, path: '/pacientes', gradient: 'from-violet-500 to-violet-600' },
        { label: 'Facturación', icon: IconDollar, path: '/facturas', gradient: 'from-amber-500 to-amber-600' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ═══════════════════ HERO HEADER ═══════════════════ */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 via-primary-dark to-primary-900 p-6 md:p-8 text-white">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary-400/15 blur-3xl" />
                    <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(11,107,203,0.1),transparent_60%)]" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <p className="text-sm text-primary-100/90 font-medium capitalize">{dateDisplay}</p>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            {greeting}, <span className="text-white">{nombreUsuario}</span>
                        </h1>
                        <p className="text-primary-100/80 text-sm font-medium">
                            {loadingStats ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-3 h-3 border-2 border-primary-200/20 border-t-white rounded-full animate-spin" />
                                    Cargando resumen...
                                </span>
                            ) : (
                                <>
                                    Tienes <span className="text-white font-bold">{statsData.citas_hoy || 0} cita{(statsData.citas_hoy || 0) !== 1 ? 's' : ''}</span> programada{(statsData.citas_hoy || 0) !== 1 ? 's' : ''} para hoy
                                </>
                            )}
                        </p>
                    </div>

                    {/* Quick actions row in hero */}
                    <div className="hidden md:flex items-center gap-2">
                        {quickActions.slice(0, 2).map((action) => (
                            <button
                                key={action.label}
                                onClick={() => navigate(action.path)}
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition-all duration-200 group"
                            >
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm`}>
                                    <action.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════════════════ STATS GRID ═══════════════════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={IconUsers}
                    label="Pacientes"
                    value={loadingStats ? '...' : statsData.total_pacientes || 0}
                    trend={null}
                    trendLabel="Base de datos"
                    accentColor="text-white"
                    bgGradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    icon={IconCalendar}
                    label="Citas Hoy"
                    value={loadingStats ? '...' : statsData.citas_hoy || 0}
                    trend={statsData.citas_hoy > 0 ? 1 : null}
                    trendLabel={`${statsData.citas_hoy || 0} pendientes`}
                    accentColor="text-white"
                    bgGradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                />
                <StatCard
                    icon={IconActivity}
                    label="Tratamientos"
                    value={loadingStats ? '...' : statsData.tratamientos_activos || 0}
                    trend={null}
                    trendLabel="En proceso"
                    accentColor="text-white"
                    bgGradient="bg-gradient-to-br from-amber-500 to-orange-500"
                />
                <StatCard
                    icon={IconDollar}
                    label="Ingresos Mes"
                    value={loadingStats ? '...' : formatCurrency(statsData.ingresos_mes)}
                    trend={statsData.ingresos_mes > 0 ? 1 : null}
                    trendLabel="Mes actual"
                    accentColor="text-white"
                    bgGradient="bg-gradient-to-br from-violet-500 to-purple-600"
                />
            </div>

            {/* ═══════════════════ MAIN GRID ═══════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ─── LEFT COLUMN (8 cols) ─── */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Weekly Activity */}
                    <div className="bg-surface-card rounded-2xl border border-border p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-extrabold text-text-primary">Actividad Semanal</h3>
                                <p className="text-xs text-text-secondary mt-0.5">Citas programadas vs completadas</p>
                            </div>
                            <div className="flex items-center gap-5 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-primary/20" />
                                    <span className="text-text-secondary font-medium">Programadas</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                                    <span className="text-text-secondary font-medium">Completadas</span>
                                </div>
                            </div>
                        </div>
                        <WeeklyChart data={weeklyData} maxVal={maxCitas} />

                        {/* Weekly summary strip */}
                        <div className="mt-5 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-lg font-extrabold text-text-primary">{totalCitasSemana}</p>
                                <p className="text-[10px] font-semibold text-text-secondary opacity-60 uppercase tracking-wider">Total semana</p>
                            </div>
                            <div>
                                <p className="text-lg font-extrabold text-secondary">{totalCompletadas}</p>
                                <p className="text-[10px] font-semibold text-text-secondary opacity-60 uppercase tracking-wider">Completadas</p>
                            </div>
                            <div>
                                <p className="text-lg font-extrabold text-text-primary">
                                    {totalCitasSemana > 0 ? Math.round((totalCompletadas / totalCitasSemana) * 100) : 0}%
                                </p>
                                <p className="text-[10px] font-semibold text-text-secondary opacity-60 uppercase tracking-wider">Cumplimiento</p>
                            </div>
                        </div>
                    </div>

                    {/* Today's Agenda */}
                    <div className="bg-surface-card rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-light rounded-full" />
                                <div>
                                    <h3 className="text-base font-extrabold text-text-primary">Agenda del Día</h3>
                                    <p className="text-[11px] text-text-secondary opacity-60">{recentAppointments.length} cita{recentAppointments.length !== 1 ? 's' : ''} programada{recentAppointments.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <Link to="/citas" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 group">
                                Ver todas <IconArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        <div className="p-4">
                            {loadingCitas ? (
                                <div className="py-12 flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-[3px] border-slate-100 border-t-primary rounded-full animate-spin" />
                                    <p className="text-sm text-slate-400 font-medium">Cargando agenda...</p>
                                </div>
                            ) : recentAppointments.length === 0 ? (
                                <div className="py-10 flex flex-col items-center gap-3 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                        <IconCalendar className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-500">Sin citas programadas</p>
                                        <p className="text-xs text-slate-400 mt-0.5">¡Disfruta el día libre!</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/citas')}
                                        className="mt-2 px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                                    >
                                        <IconPlus className="w-3.5 h-3.5" /> Agendar cita
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {recentAppointments.map((cita, idx) => (
                                        <AppointmentRow
                                            key={cita.cita_id || idx}
                                            cita={cita}
                                            onClick={() => navigate(`/pacientes/${cita.paciente_id}`)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT COLUMN (4 cols) ─── */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Mini Calendar */}
                    <div className="bg-surface-card rounded-2xl border border-border p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-extrabold text-text-primary">
                                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                            </h3>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                                    className="w-7 h-7 rounded-lg bg-surface-raised hover:bg-primary-light flex items-center justify-center text-text-secondary hover:text-primary transition-colors text-xs font-bold"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                                    className="w-7 h-7 rounded-lg bg-surface-raised hover:bg-primary-light flex items-center justify-center text-text-secondary hover:text-primary transition-colors text-xs font-bold"
                                >
                                    ›
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                                <div key={d} className="text-center text-[10px] font-bold text-text-secondary opacity-40 py-1.5">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5">
                            {calendarDays.map((day, idx) => {
                                const isTodayDate = isToday(day.date);
                                return (
                                    <button
                                        key={idx}
                                        className={`aspect-square rounded-lg text-xs font-medium transition-all relative flex items-center justify-center
                                            ${!day.currentMonth ? 'text-text-secondary opacity-20' : 'text-text-primary hover:bg-primary-light hover:text-primary'}
                                            ${isTodayDate ? 'bg-primary text-white hover:bg-primary/90 font-bold shadow-sm shadow-primary/30' : ''}
                                        `}
                                    >
                                        {day.date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Patients */}
                    <div className="bg-primary-900 rounded-2xl p-5 text-white shadow-lg overflow-hidden relative">
                        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-extrabold">Pacientes Recientes</h3>
                                <Link to="/pacientes" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                                    Ver todos <IconChevronRight className="w-3 h-3" />
                                </Link>
                            </div>

                            {loadingPatients ? (
                                <div className="py-8 text-center">
                                    <div className="w-6 h-6 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin mx-auto" />
                                </div>
                            ) : recentPatients.length === 0 ? (
                                <div className="py-8 text-center text-sm text-slate-500">Sin pacientes recientes</div>
                            ) : (
                                <div className="space-y-2">
                                    {recentPatients.map((p) => (
                                        <Link
                                            key={p.paciente_id}
                                            to={`/pacientes/${p.paciente_id}`}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all group"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                                                {p.nombre?.charAt(0)}{p.apellido?.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate group-hover:text-blue-300 transition-colors">{p.nombre_completo || `${p.nombre} ${p.apellido}`}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">HC: {p.numero_historia || '---'}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-surface-card rounded-2xl border border-border p-5 shadow-sm">
                        <h4 className="text-sm font-extrabold text-text-primary mb-3">Acciones Rápidas</h4>
                        <div className="grid grid-cols-2 gap-2.5">
                            {quickActions.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => navigate(action.path)}
                                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition-all group"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all`}>
                                        <action.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-700 transition-colors">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════ FOOTER STATS ═══════════════════ */}
            <div className="bg-surface-card rounded-2xl border border-border p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-6 sm:gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary-light flex items-center justify-center">
                            <IconTrendUp className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-text-secondary opacity-60 uppercase tracking-wider">Asistencia</p>
                            <p className="text-lg font-extrabold text-text-primary">
                                {totalCitasSemana > 0 ? Math.round((totalCompletadas / totalCitasSemana) * 100) : '--'}%
                            </p>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-border hidden sm:block" />
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center">
                            <IconClock className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-text-secondary opacity-60 uppercase tracking-wider">Semana</p>
                            <p className="text-lg font-extrabold text-text-primary">{totalCitasSemana} citas</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-sm shadow-secondary/30" />
                    <span className="text-xs font-medium text-text-secondary opacity-60">Sistema operativo</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
