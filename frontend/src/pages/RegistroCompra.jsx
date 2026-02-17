import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { comprasService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function RegistroCompra() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { usuario, empresaActiva, sucursalActiva } = useAuth();

    const [head, setHead] = useState({
        proveedor_id: '',
        nro_factura: '',
        fecha_emision: new Date().toISOString().split('T')[0],
        condicion_pago: 'CONTADO',
        moneda: 'PYG',
        usuario_id: usuario?.usuario_id
    });

    const [lines, setLines] = useState([]);

    const { data: proveedoresRes } = useQuery({
        queryKey: ['proveedores'],
        queryFn: () => comprasService.getProveedores('S'),
    });

    const { data: articulosRes } = useQuery({
        queryKey: ['articulos', 'ALL'],
        queryFn: () => comprasService.getArticulos(null, 'S'),
    });

    const proveedores = proveedoresRes?.data?.items || [];
    const articulos = articulosRes?.data?.items || [];

    const total = useMemo(() => {
        return lines.reduce((acc, curr) => acc + (curr.cantidad * curr.costo_unitario), 0);
    }, [lines]);

    const addLine = () => {
        setLines([...lines, { id: Date.now(), articulo_id: '', cantidad: 1, costo_unitario: 0 }]);
    };

    const removeLine = (id) => {
        setLines(lines.filter(l => l.id !== id));
    };

    const updateLine = (id, field, value) => {
        setLines(lines.map(l => {
            if (l.id === id) {
                const updated = { ...l, [field]: value };
                if (field === 'articulo_id') {
                    const art = articulos.find(a => a.articulo_id === parseInt(value));
                    if (art) updated.costo_unitario = art.costo_unitario;
                }
                return updated;
            }
            return l;
        }));
    };

    const registrarMutation = useMutation({
        mutationFn: (data) => comprasService.registrarFactura(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['inventario']);
            queryClient.invalidateQueries(['articulos']);
            alert('Compra registrada exitosamente');
            navigate('/compras');
        },
        onError: (err) => {
            alert('Error al registrar compra: ' + (err.response?.data?.message || err.message));
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (lines.length === 0) return alert('Debe agregar al menos un ítem');
        if (!head.proveedor_id) return alert('Debe seleccionar un proveedor');

        registrarMutation.mutate({
            ...head,
            empresa_id: empresaActiva?.empresa_id,
            sucursal_id: sucursalActiva?.sucursal_id,
            detalles: lines.map(({ articulo_id, cantidad, costo_unitario }) => ({
                articulo_id,
                cantidad,
                costo_unitario
            }))
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Registro de Compra</h1>
                    <p className="text-slate-500 font-medium text-sm sm:text-base">Nueva entrada de facturas y stock.</p>
                </div>
                <button
                    onClick={() => navigate('/compras')}
                    className="text-slate-400 hover:text-slate-600 font-bold flex items-center gap-2 text-sm sm:text-base order-first sm:order-none"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Volver
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Cabecera */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Proveedor</label>
                        <select
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all font-bold text-slate-700 text-sm sm:text-base"
                            value={head.proveedor_id}
                            onChange={(e) => setHead({ ...head, proveedor_id: e.target.value })}
                            required
                        >
                            <option value="">Seleccione Proveedor</option>
                            {proveedores.map(p => (
                                <option key={p.proveedor_id} value={p.proveedor_id}>{p.nombre} ({p.ruc})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Nro. Factura</label>
                        <input
                            type="text"
                            placeholder="000-000-000000"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all font-black text-slate-700 text-sm sm:text-base"
                            value={head.nro_factura}
                            onChange={(e) => setHead({ ...head, nro_factura: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Fecha Emisión</label>
                        <input
                            type="date"
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all font-bold text-slate-700 text-sm sm:text-base"
                            value={head.fecha_emision}
                            onChange={(e) => setHead({ ...head, fecha_emision: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Condición</label>
                        <select
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all font-bold text-slate-700 text-sm sm:text-base"
                            value={head.condicion_pago}
                            onChange={(e) => setHead({ ...head, condicion_pago: e.target.value })}
                        >
                            <option value="CONTADO">Contado</option>
                            <option value="CREDITO 15d">Crédito 15 días</option>
                            <option value="CREDITO 30d">Crédito 30 días</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Moneda</label>
                        <select
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 transition-all font-bold text-slate-700 text-sm sm:text-base"
                            value={head.moneda}
                            onChange={(e) => setHead({ ...head, moneda: e.target.value })}
                        >
                            <option value="PYG">PYG (Gs)</option>
                            <option value="USD">USD ($)</option>
                        </select>
                    </div>
                </div>

                {/* Detalles */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ítems de la Factura</h3>
                        <button
                            type="button"
                            onClick={addLine}
                            className="w-full sm:w-auto bg-green-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <span>+</span> Agregar Artículo
                        </button>
                    </div>

                    {/* Desktop View Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                                    <th className="px-8 py-4">Artículo</th>
                                    <th className="px-8 py-4 text-center">Cantidad</th>
                                    <th className="px-8 py-4 text-right">Costo Unitario</th>
                                    <th className="px-8 py-4 text-right">Subtotal</th>
                                    <th className="px-8 py-4 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lines.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-10 text-center">
                                            <p className="text-slate-300 font-medium italic">Cargue los productos comprados para continuar.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    lines.map((line) => (
                                        <tr key={line.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-4">
                                                <select
                                                    className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700 outline-none"
                                                    value={line.articulo_id}
                                                    onChange={(e) => updateLine(line.id, 'articulo_id', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Seleccione...</option>
                                                    {articulos.map(a => (
                                                        <option key={a.articulo_id} value={a.articulo_id}>{a.nombre} [{a.codigo}]</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                <input
                                                    type="number"
                                                    className="w-20 mx-auto text-center bg-slate-100 border-none rounded-lg py-1.5 font-bold text-slate-700 focus:ring-2 focus:ring-green-500/20"
                                                    value={line.cantidad}
                                                    onChange={(e) => updateLine(line.id, 'cantidad', parseFloat(e.target.value))}
                                                    min="0.1"
                                                    step="0.1"
                                                    required
                                                />
                                            </td>
                                            <td className="px-8 py-4">
                                                <input
                                                    type="number"
                                                    className="w-32 ml-auto text-right bg-transparent border-none focus:ring-0 font-bold text-green-600 outline-none"
                                                    value={line.costo_unitario}
                                                    onChange={(e) => updateLine(line.id, 'costo_unitario', parseFloat(e.target.value))}
                                                    required
                                                />
                                            </td>
                                            <td className="px-8 py-4 text-right font-black text-slate-900">
                                                {new Intl.NumberFormat('es-PY').format(line.cantidad * line.costo_unitario)}
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeLine(line.id)}
                                                    className="p-2 text-rose-300 hover:text-rose-600 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View Cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {lines.length === 0 ? (
                            <div className="px-6 py-10 text-center">
                                <p className="text-slate-300 font-medium italic text-sm">Cargue productos para continuar.</p>
                            </div>
                        ) : (
                            lines.map((line) => (
                                <div key={line.id} className="p-5 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Artículo</label>
                                            <select
                                                className="w-full bg-slate-50 border-none rounded-xl px-0 py-2 font-bold text-slate-700 outline-none text-sm"
                                                value={line.articulo_id}
                                                onChange={(e) => updateLine(line.id, 'articulo_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccione artículo...</option>
                                                {articulos.map(a => (
                                                    <option key={a.articulo_id} value={a.articulo_id}>{a.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeLine(line.id)}
                                            className="p-2 text-rose-300 hover:text-rose-600 bg-rose-50 rounded-lg mt-4"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Cantidad</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-100 border-none rounded-xl py-2 px-3 font-bold text-slate-700 text-sm focus:ring-2 focus:ring-green-500/20"
                                                value={line.cantidad}
                                                onChange={(e) => updateLine(line.id, 'cantidad', parseFloat(e.target.value))}
                                                min="0.1"
                                                step="0.1"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Costo Unit.</label>
                                            <input
                                                type="number"
                                                className="w-full text-right bg-slate-100 border-none rounded-xl py-2 px-3 font-bold text-green-600 text-sm focus:ring-2 focus:ring-green-500/20"
                                                value={line.costo_unitario}
                                                onChange={(e) => updateLine(line.id, 'costo_unitario', parseFloat(e.target.value))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Subtotal</span>
                                        <span className="font-black text-slate-900">
                                            {new Intl.NumberFormat('es-PY').format(line.cantidad * line.costo_unitario)} <span className="text-xs text-slate-400">Gs</span>
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer / Totals */}
                    <div className="bg-slate-50 px-6 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="hidden sm:block text-slate-400 text-xs font-black uppercase tracking-widest">Resumen de Registro</div>
                        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8">
                            <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest sm:hidden">Total General</span>
                            <div className="text-right">
                                <span className="text-xs text-slate-400 font-bold mr-2">{head.moneda}</span>
                                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                                    {new Intl.NumberFormat('es-PY').format(total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-4 sm:pt-4">
                    <button
                        type="submit"
                        disabled={registrarMutation.isLoading || lines.length === 0}
                        className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none order-first sm:order-none"
                    >
                        {registrarMutation.isLoading ? 'Procesando...' : 'Registrar Factura de Compra'}
                    </button>
                </div>
            </form>
        </div>
    );
}
