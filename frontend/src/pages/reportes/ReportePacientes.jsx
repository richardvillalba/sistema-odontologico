import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { pacientesService, dashboardService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ReportePacientes = () => {
    const navigate = useNavigate();
    const { empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;

    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const [fechaDesde, setFechaDesde] = useState(firstDayOfYear);
    const [fechaHasta, setFechaHasta] = useState(todayStr);

    const { data: statsRes } = useQuery({
        queryKey: ['dashboard-stats', empresaId],
        queryFn: () => dashboardService.getStats(empresaId),
        enabled: !!empresaId,
    });

    const { data: pacientesRes, isLoading } = useQuery({
        queryKey: ['reporte-pacientes', empresaId],
        queryFn: () => pacientesService.getAll({ empresa_id: empresaId }),
        enabled: !!empresaId,
    });

    const pacientes = pacientesRes?.data?.items || [];
    const statsData = statsRes?.data?.items?.[0] || statsRes?.data || {};

    // Filtrar pacientes por fecha de registro
    const pacientesFiltrados = useMemo(() => {
        return pacientes.filter(p => {
            const fechaReg = p.fecha_registro?.split('T')[0] || p.created_at?.split('T')[0];
            if (!fechaReg) return true;
            if (fechaDesde && fechaReg < fechaDesde) return false;
            if (fechaHasta && fechaReg > fechaHasta) return false;
            return true;
        });
    }, [pacientes, fechaDesde, fechaHasta]);

    const resumen = useMemo(() => {
        const total = statsData.total_pacientes || pacientes.length;
        const thisMonth = new Date();
        const firstOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1).toISOString().split('T')[0];
        const nuevosEsteMes = pacientes.filter(p => {
            const fechaReg = p.fecha_registro?.split('T')[0] || p.created_at?.split('T')[0];
            return fechaReg && fechaReg >= firstOfMonth;
        }).length;
        const conTratamiento = statsData.tratamientos_activos || 0;

        return { total, nuevosEsteMes, conTratamiento };
    }, [pacientes, statsData]);

    // Datos para el gráfico de crecimiento
    const chartData = useMemo(() => {
        const byMonth = {};
        pacientes.forEach(p => {
            const fechaReg = p.fecha_registro?.split('T')[0] || p.created_at?.split('T')[0];
            if (!fechaReg) return;
            const month = fechaReg.substring(0, 7); // YYYY-MM
            byMonth[month] = (byMonth[month] || 0) + 1;
        });

        const sorted = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]));
        let acumulado = 0;
        return sorted.map(([mes, count]) => {
            acumulado += count;
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const [y, m] = mes.split('-');
            return {
                mes: `${monthNames[parseInt(m) - 1]} ${y.slice(2)}`,
                nuevos: count,
                acumulado,
            };
        });
    }, [pacientes]);

    const stats = [
        { label: 'Total Pacientes', value: resumen.total, icon: '👥', color: 'from-blue-600 to-indigo-600' },
        { label: 'Nuevos este Mes', value: resumen.nuevosEsteMes, icon: '🆕', color: 'from-emerald-500 to-teal-600' },
        { label: 'Tratamientos Activos', value: resumen.conTratamiento, icon: '💊', color: 'from-violet-500 to-purple-600' },
        { label: 'En Período', value: pacientesFiltrados.length, icon: '📋', color: 'from-amber-500 to-orange-600' },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
                    <p className="text-xs font-bold text-slate-600 mb-1">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} className="text-xs" style={{ color: p.color }}>
                            {p.name}: {p.value}
                        </p>
                    ))}
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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reporte de Pacientes</h1>
                    <p className="text-slate-500 font-medium">Crecimiento y registro de pacientes</p>
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
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registrados desde</label>
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
                    <button
                        onClick={() => {
                            setFechaDesde(new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]);
                            setFechaHasta(todayStr);
                        }}
                        className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Este a&ntilde;o
                    </button>
                    <button
                        onClick={() => {
                            setFechaDesde('');
                            setFechaHasta('');
                        }}
                        className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Todos
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

            {/* Gráfico de crecimiento */}
            {chartData.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-black text-slate-800 mb-4">Crecimiento de Pacientes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="acumulado"
                                name="Total acumulado"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#colorAcumulado)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Tabla de Pacientes */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-800">Pacientes Registrados</h3>
                    <p className="text-xs text-slate-400 mt-1">{pacientesFiltrados.length} pacientes en el período</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Historia</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Registro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-12 text-slate-400">Cargando...</td></tr>
                            ) : pacientesFiltrados.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-12 text-slate-400">Sin pacientes en el período seleccionado</td></tr>
                            ) : pacientesFiltrados.map((p, idx) => (
                                <tr key={p.paciente_id || idx} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/pacientes/${p.paciente_id}`)}>
                                    <td className="px-6 py-3 text-sm font-bold text-blue-600">{p.numero_historia || '-'}</td>
                                    <td className="px-6 py-3 text-sm font-bold text-slate-800">{p.nombre_completo || `${p.nombre || ''} ${p.apellido || ''}`}</td>
                                    <td className="px-6 py-3 text-sm text-slate-600">{p.cedula || p.documento || '-'}</td>
                                    <td className="px-6 py-3 text-sm text-slate-600">{p.telefono || '-'}</td>
                                    <td className="px-6 py-3 text-sm text-slate-500">{p.fecha_registro?.split('T')[0] || p.created_at?.split('T')[0] || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportePacientes;
