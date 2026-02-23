import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { billingService, dashboardService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ReporteFinanciero = () => {
    const navigate = useNavigate();
    const { empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const [fechaDesde, setFechaDesde] = useState(firstDayOfMonth);
    const [fechaHasta, setFechaHasta] = useState(todayStr);

    const { data: statsRes } = useQuery({
        queryKey: ['dashboard-stats', empresaId],
        queryFn: () => dashboardService.getStats(empresaId),
        enabled: !!empresaId,
    });

    const { data: facturasRes, isLoading } = useQuery({
        queryKey: ['reporte-facturas', empresaId, fechaDesde, fechaHasta],
        queryFn: () => billingService.getFacturas({ empresa_id: empresaId, fecha_desde: fechaDesde, fecha_hasta: fechaHasta }),
        enabled: !!empresaId,
    });

    const facturas = facturasRes?.data?.items || [];
    const statsData = statsRes?.data?.items?.[0] || statsRes?.data || {};

    const resumen = useMemo(() => {
        const totalFacturado = facturas.reduce((sum, f) => sum + (Number(f.total_factura || f.monto_total || 0)), 0);
        const totalCobrado = facturas.reduce((sum, f) => sum + (Number(f.total_pagado || 0)), 0);
        const pendiente = totalFacturado - totalCobrado;
        const cantFacturas = facturas.length;
        const facturasAnuladas = facturas.filter(f => f.estado === 'ANULADA').length;

        return { totalFacturado, totalCobrado, pendiente, cantFacturas, facturasAnuladas };
    }, [facturas]);

    // Agrupar ingresos por día para el gráfico
    const chartData = useMemo(() => {
        const byDate = {};
        facturas.forEach(f => {
            if (f.estado === 'ANULADA') return;
            const fecha = f.fecha_emision?.split('T')[0] || f.fecha_factura?.split('T')[0] || 'Sin fecha';
            if (!byDate[fecha]) byDate[fecha] = { fecha, facturado: 0, cobrado: 0 };
            byDate[fecha].facturado += Number(f.total_factura || f.monto_total || 0);
            byDate[fecha].cobrado += Number(f.total_pagado || 0);
        });
        return Object.values(byDate).sort((a, b) => a.fecha.localeCompare(b.fecha));
    }, [facturas]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PY').format(amount) + ' Gs';
    };

    const formatShortDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        return `${parts[2]}/${parts[1]}`;
    };

    const stats = [
        { label: 'Total Facturado', value: formatCurrency(resumen.totalFacturado), icon: '🧾', color: 'from-blue-600 to-indigo-600' },
        { label: 'Total Cobrado', value: formatCurrency(resumen.totalCobrado), icon: '✅', color: 'from-emerald-500 to-teal-600' },
        { label: 'Pendiente de Cobro', value: formatCurrency(resumen.pendiente), icon: '⏳', color: 'from-amber-500 to-orange-600' },
        { label: 'Facturas Emitidas', value: resumen.cantFacturas, icon: '📄', color: 'from-rose-500 to-pink-600' },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
                    <p className="text-xs font-bold text-slate-600 mb-1">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} className="text-xs" style={{ color: p.color }}>
                            {p.name}: {formatCurrency(p.value)}
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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reporte Financiero</h1>
                    <p className="text-slate-500 font-medium">Análisis de ingresos y facturación</p>
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
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const d = new Date();
                                setFechaDesde(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]);
                                setFechaHasta(d.toISOString().split('T')[0]);
                            }}
                            className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            Este mes
                        </button>
                        <button
                            onClick={() => {
                                const d = new Date();
                                setFechaDesde(new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0]);
                                setFechaHasta(d.toISOString().split('T')[0]);
                            }}
                            className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            Este a&ntilde;o
                        </button>
                    </div>
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

            {/* Gráfico */}
            {chartData.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-black text-slate-800 mb-4">Ingresos por Día</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="fecha" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="facturado" name="Facturado" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="cobrado" name="Cobrado" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Tabla de Facturas */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-800">Detalle de Facturas</h3>
                    <p className="text-xs text-slate-400 mt-1">{facturas.length} facturas en el período</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nro. Factura</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                                <th className="text-right px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                                <th className="text-right px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagado</th>
                                <th className="text-center px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-12 text-slate-400">Cargando...</td></tr>
                            ) : facturas.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-12 text-slate-400">Sin facturas en el período seleccionado</td></tr>
                            ) : facturas.map((f, idx) => (
                                <tr key={f.factura_id || idx} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 text-sm font-bold text-slate-800">{f.numero_factura || '-'}</td>
                                    <td className="px-6 py-3 text-sm text-slate-600">{f.fecha_emision?.split('T')[0] || f.fecha_factura?.split('T')[0] || '-'}</td>
                                    <td className="px-6 py-3 text-sm text-slate-600">{f.paciente_nombre || '-'}</td>
                                    <td className="px-6 py-3 text-sm font-bold text-slate-800 text-right">{formatCurrency(f.total_factura || f.monto_total || 0)}</td>
                                    <td className="px-6 py-3 text-sm font-bold text-emerald-600 text-right">{formatCurrency(f.total_pagado || 0)}</td>
                                    <td className="px-6 py-3 text-center">
                                        <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            f.estado === 'PAGADA' ? 'bg-emerald-100 text-emerald-700' :
                                            f.estado === 'ANULADA' ? 'bg-red-100 text-red-700' :
                                            f.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {f.estado || 'N/A'}
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

export default ReporteFinanciero;
