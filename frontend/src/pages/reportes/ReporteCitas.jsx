import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { citasService, dashboardService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#6b7280'];

const ReporteCitas = () => {
    const navigate = useNavigate();
    const { empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const [fechaDesde, setFechaDesde] = useState(firstDayOfMonth);
    const [fechaHasta, setFechaHasta] = useState(todayStr);
    const [filtroEstado, setFiltroEstado] = useState('');

    const { data: citasRes, isLoading } = useQuery({
        queryKey: ['reporte-citas', empresaId, fechaDesde, fechaHasta],
        queryFn: () => citasService.getAll({ empresa_id: empresaId, fecha_desde: fechaDesde, fecha_hasta: fechaHasta }),
        enabled: !!empresaId,
    });

    const { data: actividadRes } = useQuery({
        queryKey: ['dashboard-actividad', empresaId],
        queryFn: () => dashboardService.getActividadSemanal(empresaId),
        enabled: !!empresaId,
    });

    const todasCitas = citasRes?.data?.items || [];
    const citas = filtroEstado ? todasCitas.filter(c => c.estado === filtroEstado) : todasCitas;

    const weeklyData = useMemo(() => {
        const raw = actividadRes?.data?.items || [];
        return raw.map(d => ({
            dia: d.dia_nombre?.charAt(0).toUpperCase() + d.dia_nombre?.slice(1).toLowerCase().replace('.', '') || '',
            citas: d.total_citas || 0,
            completadas: d.completadas || 0,
        }));
    }, [actividadRes]);

    const resumen = useMemo(() => {
        const total = todasCitas.length;
        const completadas = todasCitas.filter(c => c.estado === 'COMPLETADA' || c.estado === 'CONFIRMADA').length;
        const canceladas = todasCitas.filter(c => c.estado === 'CANCELADA').length;
        const pendientes = todasCitas.filter(c => c.estado === 'PENDIENTE').length;
        const tasa = total > 0 ? ((completadas / total) * 100).toFixed(1) : 0;

        return { total, completadas, canceladas, pendientes, tasa };
    }, [todasCitas]);

    // Datos para gráfico de pie
    const pieData = useMemo(() => {
        const estados = {};
        todasCitas.forEach(c => {
            const estado = c.estado || 'SIN ESTADO';
            estados[estado] = (estados[estado] || 0) + 1;
        });
        return Object.entries(estados).map(([name, value]) => ({ name, value }));
    }, [todasCitas]);

    const stats = [
        { label: 'Total Citas', value: resumen.total, icon: '📅', color: 'from-blue-600 to-indigo-600' },
        { label: 'Completadas', value: resumen.completadas, icon: '✅', color: 'from-emerald-500 to-teal-600' },
        { label: 'Canceladas', value: resumen.canceladas, icon: '❌', color: 'from-red-500 to-rose-600' },
        { label: 'Tasa Asistencia', value: `${resumen.tasa}%`, icon: '📊', color: 'from-violet-500 to-purple-600' },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
                    <p className="text-xs font-bold text-slate-800">{payload[0].name}: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reporte de Citas</h1>
                    <p className="text-slate-500 font-medium">Estadísticas de citas y asistencia</p>
                </div>
                <button
                    onClick={() => navigate('/reportes')}
                    className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                    ← Volver a Reportes
                </button>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Desde</label>
                        <input
                            type="date"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hasta</label>
                        <input
                            type="date"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</label>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="">Todas</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="CONFIRMADA">Confirmada</option>
                            <option value="COMPLETADA">Completada</option>
                            <option value="CANCELADA">Cancelada</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            const d = new Date();
                            setFechaDesde(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]);
                            setFechaHasta(d.toISOString().split('T')[0]);
                            setFiltroEstado('');
                        }}
                        className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Este mes
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`bg-gradient-to-br ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-lg text-white shadow-lg`}>
                                {stat.icon}
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{isLoading ? '...' : stat.value}</h4>
                    </div>
                ))}
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie - Distribución por estado */}
                {pieData.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Distribución por Estado</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Barras - Actividad semanal */}
                {weeklyData.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Actividad Semanal</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="citas" name="Programadas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="completadas" name="Completadas" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Tabla de Citas */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-800">Detalle de Citas</h3>
                    <p className="text-xs text-slate-400 mt-1">{citas.length} citas en el período</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hora</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo</th>
                                <th className="text-center px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-12 text-slate-400">Cargando...</td></tr>
                            ) : citas.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-12 text-slate-400">Sin citas en el período seleccionado</td></tr>
                            ) : citas.map((c, idx) => (
                                <tr key={c.cita_id || idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 text-sm text-slate-600">{c.fecha?.split('T')[0] || c.fecha_cita?.split('T')[0] || '-'}</td>
                                    <td className="px-6 py-3 text-sm font-bold text-slate-800">{c.hora_inicio || '-'}</td>
                                    <td className="px-6 py-3 text-sm text-slate-600">{c.paciente_nombre || '-'}</td>
                                    <td className="px-6 py-3 text-sm text-slate-600">{c.doctor_nombre || '-'}</td>
                                    <td className="px-6 py-3 text-sm text-slate-500 max-w-[200px] truncate">{c.motivo_consulta || '-'}</td>
                                    <td className="px-6 py-3 text-center">
                                        <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            c.estado === 'COMPLETADA' || c.estado === 'CONFIRMADA' ? 'bg-emerald-100 text-emerald-700' :
                                            c.estado === 'CANCELADA' ? 'bg-red-100 text-red-700' :
                                            c.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {c.estado || 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReporteCitas;
