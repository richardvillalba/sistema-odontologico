import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { inventarioService, comprasService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ReporteInventario = () => {
    const navigate = useNavigate();
    const { empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;

    const { data: stockRes, isLoading: loadingStock } = useQuery({
        queryKey: ['reporte-stock', empresaId],
        queryFn: () => inventarioService.getStock(empresaId),
        enabled: !!empresaId,
    });

    const { data: articulosRes, isLoading: loadingArticulos } = useQuery({
        queryKey: ['reporte-articulos'],
        queryFn: () => comprasService.getArticulos(null, 'ALL'),
    });

    const stock = stockRes?.data?.items || [];
    const articulos = articulosRes?.data?.items || [];
    const isLoading = loadingStock || loadingArticulos;

    // Combinar datos de stock con artículos
    const inventario = useMemo(() => {
        const stockMap = {};
        stock.forEach(s => {
            stockMap[s.articulo_id] = s;
        });

        return articulos.map(a => {
            const s = stockMap[a.articulo_id] || {};
            return {
                ...a,
                stock_actual: Number(s.cantidad_disponible || s.stock_actual || 0),
                stock_minimo: Number(a.stock_minimo || 0),
                costo_unitario: Number(a.precio_unitario || a.costo_unitario || 0),
            };
        });
    }, [stock, articulos]);

    const resumen = useMemo(() => {
        const totalArticulos = inventario.length;
        const stockBajo = inventario.filter(i => i.stock_actual > 0 && i.stock_actual <= i.stock_minimo).length;
        const sinStock = inventario.filter(i => i.stock_actual === 0).length;
        const valorTotal = inventario.reduce((sum, i) => sum + (i.stock_actual * i.costo_unitario), 0);

        return { totalArticulos, stockBajo, sinStock, valorTotal };
    }, [inventario]);

    // Top 10 artículos con más stock para el gráfico
    const chartData = useMemo(() => {
        return [...inventario]
            .filter(i => i.stock_actual > 0)
            .sort((a, b) => b.stock_actual - a.stock_actual)
            .slice(0, 10)
            .map(i => ({
                nombre: i.nombre?.length > 20 ? i.nombre.substring(0, 20) + '...' : i.nombre,
                stock: i.stock_actual,
                minimo: i.stock_minimo,
            }));
    }, [inventario]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PY').format(amount) + ' Gs';
    };

    const stats = [
        { label: 'Total Artículos', value: resumen.totalArticulos, icon: '📦', color: 'from-blue-600 to-indigo-600' },
        { label: 'Stock Bajo', value: resumen.stockBajo, icon: '⚠️', color: 'from-amber-500 to-orange-600' },
        { label: 'Sin Stock', value: resumen.sinStock, icon: '❌', color: 'from-red-500 to-rose-600' },
        { label: 'Valor Inventario', value: formatCurrency(resumen.valorTotal), icon: '💰', color: 'from-emerald-500 to-teal-600' },
    ];

    const getStockStatus = (actual, minimo) => {
        if (actual === 0) return { text: 'Sin stock', className: 'bg-red-100 text-red-700' };
        if (actual <= minimo) return { text: 'Stock bajo', className: 'bg-amber-100 text-amber-700' };
        return { text: 'Normal', className: 'bg-emerald-100 text-emerald-700' };
    };

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
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reporte de Inventario</h1>
                    <p className="text-slate-500 font-medium">Stock actual y valoración de inventario</p>
                </div>
                <button
                    onClick={() => navigate('/reportes')}
                    className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                    ← Volver a Reportes
                </button>
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

            {/* Gráfico - Top 10 artículos */}
            {chartData.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-black text-slate-800 mb-4">Top 10 Artículos por Stock</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis dataKey="nombre" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={150} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="stock" name="Stock actual" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="minimo" name="Stock mínimo" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Tabla de Inventario */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-black text-slate-800">Detalle de Inventario</h3>
                    <p className="text-xs text-slate-400 mt-1">{inventario.length} artículos registrados</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Artículo</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                                <th className="text-right px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Actual</th>
                                <th className="text-right px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Mín.</th>
                                <th className="text-right px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Costo Unit.</th>
                                <th className="text-center px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-12 text-slate-400">Cargando...</td></tr>
                            ) : inventario.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-12 text-slate-400">Sin artículos en inventario</td></tr>
                            ) : inventario.map((item, idx) => {
                                const status = getStockStatus(item.stock_actual, item.stock_minimo);
                                return (
                                    <tr key={item.articulo_id || idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 text-sm font-bold text-slate-800">{item.nombre || '-'}</td>
                                        <td className="px-6 py-3 text-sm text-slate-600">{item.categoria_nombre || '-'}</td>
                                        <td className="px-6 py-3 text-sm font-bold text-slate-800 text-right">{item.stock_actual}</td>
                                        <td className="px-6 py-3 text-sm text-slate-500 text-right">{item.stock_minimo}</td>
                                        <td className="px-6 py-3 text-sm text-slate-600 text-right">{formatCurrency(item.costo_unitario)}</td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase ${status.className}`}>
                                                {status.text}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReporteInventario;
