import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventarioService, comprasService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Inventario() {
    const queryClient = useQueryClient();
    const { usuario, empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;
    const [sucursalId, setSucursalId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAjuste, setShowAjuste] = useState(false);
    const [selectedArticulo, setSelectedArticulo] = useState(null);

    const { data: stockRes, isLoading } = useQuery({
        queryKey: ['inventario', empresaId, sucursalId],
        queryFn: () => inventarioService.getStock(empresaId, sucursalId || null),
    });

    const { data: articulosRes } = useQuery({
        queryKey: ['articulos', 'ALL'],
        queryFn: () => comprasService.getArticulos(null, 'S'),
    });

    const stockItems = (stockRes?.data?.items || []).filter(item =>
        item.articulo_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.articulo_codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const ajusteMutation = useMutation({
        mutationFn: (data) => inventarioService.registrarMovimiento(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['inventario']);
            setShowAjuste(false);
            setSelectedArticulo(null);
        }
    });

    const handleAjuste = (item) => {
        setSelectedArticulo(item);
        setShowAjuste(true);
    };

    const onConfirmAjuste = (formData) => {
        ajusteMutation.mutate({
            ...formData,
            articulo_id: selectedArticulo.articulo_id,
            empresa_id: empresaId,
            sucursal_id: selectedArticulo.sucursal_id,
            usuario_id: usuario?.usuario_id
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Inventario de Stock</h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base">Monitoreo de existencias y movimientos de almacén.</p>
                </div>
                <div className="flex gap-3">
                    {/* Filtros rápidos o acciones */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar en stock..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-0 text-slate-600 font-medium placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items en Stock</p>
                        <p className="text-2xl font-black">{stockItems.length}</p>
                    </div>
                    <div className="text-3xl relative z-10 opacity-30">📊</div>
                    <div className="absolute -right-4 -bottom-4 bg-white/5 w-24 h-24 rounded-full"></div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-24 text-center">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400 font-bold animate-pulse">Consultando almacenes...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Artículo</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Sucursal</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider text-center">Cantidad Actual</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider text-center">Estado Stock</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Último Movimiento</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stockItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-20 text-center">
                                                <p className="text-slate-400 font-medium">No hay registros de inventario.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        stockItems.map((item) => {
                                            const status = item.cantidad_actual <= (item.cantidad_minima || 0) ? 'Bajo' :
                                                item.cantidad_actual >= (item.cantidad_maxima || 999999) ? 'Exceso' : 'Normal';

                                            return (
                                                <tr key={item.inventario_id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-900 leading-tight">{item.articulo_nombre}</span>
                                                            <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{item.articulo_codigo}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter">SUC {item.sucursal_id}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-xl font-black ${status === 'Bajo' ? 'text-rose-600' : 'text-slate-900'}`}>{item.cantidad_actual}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{item.unidad_medida}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${status === 'Bajo' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                            status === 'Exceso' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                            {status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col text-xs">
                                                            <span className="font-bold text-slate-600">{new Date(item.fecha_ultimo_ingreso || item.fecha_creacion).toLocaleDateString()}</span>
                                                            <span className="text-slate-400">{item.observaciones || 'Sin observaciones'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleAjuste(item)}
                                                            className="p-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-sm group-hover:scale-110"
                                                            title="Ajuste de Stock"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card layout */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {stockItems.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="text-4xl mb-3">📋</div>
                                    <p className="text-slate-400 font-medium">No hay registros de inventario.</p>
                                </div>
                            ) : (
                                stockItems.map((item) => {
                                    const status = item.cantidad_actual <= (item.cantidad_minima || 0) ? 'Bajo' :
                                        item.cantidad_actual >= (item.cantidad_maxima || 999999) ? 'Exceso' : 'Normal';

                                    return (
                                        <div key={item.inventario_id} className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <span className="font-bold text-slate-900 text-sm">{item.articulo_nombre}</span>
                                                    <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{item.articulo_codigo}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${status === 'Bajo' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                    status === 'Exceso' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                    {status}
                                                </span>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-slate-500 font-medium">Sucursal: <span className="font-bold">SUC {item.sucursal_id}</span></p>
                                                    <p className="text-xs text-slate-400">Último: {new Date(item.fecha_ultimo_ingreso || item.fecha_creacion).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className={`text-xl font-black ${status === 'Bajo' ? 'text-rose-600' : 'text-slate-900'}`}>{item.cantidad_actual}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{item.unidad_medida}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAjuste(item)}
                                                        className="mt-2 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl flex items-center gap-1"
                                                    >
                                                        ⚙️ Ajustar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
            </div>

            {showAjuste && (
                <AjusteForm
                    item={selectedArticulo}
                    onConfirm={onConfirmAjuste}
                    onCancel={() => setShowAjuste(false)}
                    isSaving={ajusteMutation.isLoading}
                />
            )}
        </div>
    );
}

function AjusteForm({ item, onConfirm, onCancel, isSaving }) {
    const [formData, setFormData] = useState({
        tipo_movimiento: 'AJUSTE',
        cantidad: item.cantidad_actual,
        motivo: 'Ajuste manual de inventario'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(formData);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            >
                <div className="bg-slate-50 px-6 sm:px-8 py-4 sm:py-6 border-b border-slate-100">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Ajuste de Stock</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase mt-1 tracking-widest truncate">{item.articulo_nombre}</p>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Tipo de Movimiento</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['INGRESO', 'EGRESO', 'AJUSTE'].map(tipo => (
                                <button
                                    key={tipo}
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, tipo_movimiento: tipo }))}
                                    className={`py-2 rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest transition-all border ${formData.tipo_movimiento === tipo
                                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                        : 'bg-white text-slate-400 border-slate-200 hover:border-purple-200'
                                        }`}
                                >{tipo}</button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">
                            {formData.tipo_movimiento === 'AJUSTE' ? 'Cantidad Final' : 'Cantidad a Mover'}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full px-4 py-3 sm:py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all font-black text-xl sm:text-2xl text-center text-slate-700"
                                value={formData.cantidad}
                                onChange={e => setFormData(prev => ({ ...prev, cantidad: parseFloat(e.target.value) }))}
                                required
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-300 uppercase text-[9px] sm:text-[10px]">
                                {item.unidad_medida}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Motivo / Observación</label>
                        <textarea
                            className="w-full px-4 py-2 sm:py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all text-sm"
                            placeholder="Ej: Rotura, Vencimiento, Regularización..."
                            rows="2"
                            value={formData.motivo}
                            onChange={e => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                            required
                        ></textarea>
                    </div>
                </div>

                <div className="bg-slate-50 px-6 sm:px-8 py-4 sm:py-6 border-t border-slate-100 flex gap-3 sm:gap-4">
                    <button
                        type="submit"
                        className="flex-1 bg-purple-600 text-white px-6 py-2.5 sm:py-4 rounded-2xl font-black shadow-lg shadow-purple-200 hover:bg-purple-700 hover:-translate-y-1 transition-all"
                        disabled={isSaving}
                    >
                        Confirmar
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-2.5 sm:py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}
