import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { pacientesService, citasService } from '../services/api';
import { formatDate } from '../utils/format';

const Dashboard = () => {
    const navigate = useNavigate();
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();

    const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

    // Queries
    const { data: patientsData, isLoading: loadingPatients } = useQuery({
        queryKey: ['pacientes-count'],
        queryFn: () => pacientesService.getAll({ empresa_id: 1, limit: 5 }),
    });

    const { data: citasToday, isLoading: loadingCitas } = useQuery({
        queryKey: ['citas-hoy'],
        queryFn: () => citasService.getAll({ empresa_id: 1, fecha: today }),
    });

    const stats = [
        { label: 'Pacientes Totales', value: patientsData?.data?.count || 0, icon: '👥', color: 'from-blue-600 to-indigo-600', trend: '+2 nuevos hoy' },
        { label: 'Citas para Hoy', value: citasToday?.data?.items?.length || 0, icon: '📅', color: 'from-emerald-500 to-teal-600', trend: 'Siguiente: 15:30' },
        { label: 'Tratamientos Activos', value: '12', icon: '💊', color: 'from-amber-500 to-orange-600', trend: '3 por completar' },
        { label: 'Ingresos Mensuales', value: 'Gs 4.5M', icon: '💰', color: 'from-rose-500 to-pink-600', trend: '+15% vs mes ant.' },
    ];

    const recentAppointments = citasToday?.data?.items?.slice(0, 5) || [];
    const recentPatients = patientsData?.data?.items?.slice(0, 4) || [];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header Greeting Section - Glassmorphic */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl"></div>
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl animate-bounce-slow">👋</span>
                            <h1 className="text-4xl font-black tracking-tight">{greeting}, Dr. Administrador</h1>
                        </div>
                        <p className="text-slate-400 text-lg font-medium">Tienes <span className="text-white font-bold">{citasToday?.data?.items?.length || 0} citas</span> programadas para tu jornada de hoy.</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex items-center gap-5 shadow-inner">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hoy es</p>
                            <p className="text-xl font-black">{formatDate(today)}</p>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                            🗓️
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.03] rounded-bl-full group-hover:opacity-[0.08] transition-opacity`}></div>
                        <div className="relative z-10">
                            <div className={`bg-gradient-to-br ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg shadow-current/20 mb-6 group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
                            </div>
                            <p className="mt-3 text-[10px] font-bold text-emerald-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                <span className="bg-emerald-50 w-4 h-4 rounded-full flex items-center justify-center">↑</span>
                                {stat.trend}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Agenda Timeline - The "Core" view */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <span className="w-2 h-8 bg-primary rounded-full"></span>
                                Agenda del Día
                            </h3>
                            <Link to="/citas" className="bg-white border border-slate-200 text-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">Ver Todo</Link>
                        </div>
                        <div className="p-8">
                            {loadingCitas ? (
                                <div className="py-24 text-center">
                                    <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-400 font-bold">Cargando jornada...</p>
                                </div>
                            ) : recentAppointments.length === 0 ? (
                                <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 group">
                                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-500">☕</div>
                                    <p className="text-slate-400 font-bold max-w-xs mx-auto text-lg leading-tight uppercase tracking-tight">Parece que no hay citas para hoy. ¡Disfruta un descanso!</p>
                                </div>
                            ) : (
                                <div className="space-y-0 relative before:absolute before:left-12 before:top-4 before:bottom-4 before:w-px before:bg-slate-100">
                                    {recentAppointments.map((cita, idx) => (
                                        <div key={cita.cita_id} className="group relative flex items-center gap-8 p-6 rounded-3xl hover:bg-slate-50 transition-all cursor-pointer" onClick={() => navigate(`/pacientes/${cita.paciente_id}`)}>
                                            <div className="w-24 text-right pr-4">
                                                <p className="text-lg font-black text-primary group-hover:scale-110 transition-transform">{cita.hora_inicio}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">AM</p>
                                            </div>

                                            {/* Milestone Dot */}
                                            <div className="absolute left-[3rem] -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-primary shadow-sm z-10 group-hover:scale-150 transition-all"></div>

                                            <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm group-hover:shadow-md group-hover:border-primary/20 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="font-black text-slate-800 text-lg">{cita.paciente_nombre}</p>
                                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cita.estado === 'CONFIRMADA' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                        {cita.estado}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-400 font-medium line-clamp-1 italic">🩺 {cita.motivo_consulta}</span>
                                                    <div className="flex -space-x-2">
                                                        <div className="w-5 h-5 rounded-full bg-slate-200 border border-white"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Quick Actions & Insights */}
                <div className="space-y-10">
                    {/* Recent Registrations Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative group">
                        <div className="absolute -right-10 -top-10 opacity-10 text-[12rem] rotate-12 transition-transform group-hover:rotate-45 duration-1000">👥</div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h3 className="text-xl font-black tracking-tight">Pacientes Nuevos</h3>
                            <Link to="/pacientes" className="text-slate-400 hover:text-white text-xs font-bold transition-colors">Ver Todo →</Link>
                        </div>
                        <div className="space-y-5 relative z-10">
                            {loadingPatients ? (
                                <div className="text-slate-500 text-sm italic py-10">Sincronizando...</div>
                            ) : recentPatients.map((p) => (
                                <Link key={p.paciente_id} to={`/pacientes/${p.paciente_id}`} className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all group/item shadow-inner">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-sm font-black text-white shadow-lg group-hover/item:scale-110 transition-transform">
                                        {p.nombre?.charAt(0)}{p.apellido?.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold truncate group-hover/item:text-primary transition-colors">{p.nombre_completo}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">📂 {p.numero_historia}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick Launch - Floating Buttons */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                        <h4 className="font-black text-slate-900 mb-6 text-lg">Acciones Directas</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2rem] hover:bg-primary hover:text-white transition-all duration-500 group shadow-sm hover:shadow-primary/20">
                                <span className="text-3xl block mb-3 group-hover:scale-125 transition-transform">🦷</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white">Nueva Cita</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2rem] hover:bg-secondary hover:text-white transition-all duration-500 group shadow-sm hover:shadow-secondary/20">
                                <span className="text-3xl block mb-3 group-hover:scale-125 transition-transform">🤝</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white">Alta Paciente</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2rem] hover:bg-slate-900 hover:text-white transition-all duration-500 group shadow-sm hover:shadow-slate-900/20">
                                <span className="text-3xl block mb-3 group-hover:scale-125 transition-transform">🧾</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white">Facturar</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2rem] hover:bg-emerald-600 hover:text-white transition-all duration-500 group shadow-sm hover:shadow-emerald-600/20">
                                <span className="text-3xl block mb-3 group-hover:scale-125 transition-transform">📈</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white">Reportes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
