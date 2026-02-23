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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Section Standardized */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                        Control de <span className="text-primary">Inventario</span>
                    </h1>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Monitoreo de existencias y trazabilidad de movimientos técnicos</p>
                </div>
                <div className="flex gap-4">
                    {/* Filtros rápidos o acciones */}
                </div>
            </div>

            {/* Filters and Stats Standardized */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 bg-surface-card rounded-[2rem] border border-border flex items-center px-6 shadow-sm">
                    <svg className="w-5 h-5 text-text-secondary opacity-30 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Filtrar por nombre de insumo o código maestro..."
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-text-primary placeholder:text-text-secondary/30 py-4"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-primary-dark rounded-[2.5rem] p-8 flex items-center justify-between text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[.2em] text-white/40 mb-1">SKUs en Almacén</p>
                        <p className="text-4xl font-black">{stockItems.length}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center relative z-10">
                        <svg className="w-8 h-8 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m4 4h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="absolute -right-4 -bottom-4 bg-white/5 w-32 h-32 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                </div>
            </div>

            {/* List and Tables Standardized */}
            <div className="bg-surface-card rounded-[3rem] border border-border shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-32 text-center animate-pulse flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="font-black text-text-secondary uppercase tracking-[0.2em] text-[10px] opacity-40">Consultando Base de Datos de Almacén...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table Standardized */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-raised/50 border-b border-border">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40">Especificación del Artículo</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40">Ubicación</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40 text-center">Existencia</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40 text-center">Estado Crítico</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40">Última Trazabilidad</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {stockItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-32 text-center">
                                                <div className="w-20 h-20 bg-surface-raised rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-border">📊</div>
                                                <p className="text-text-secondary font-black uppercase text-[10px] tracking-widest opacity-40">Sin registros de stock en este centro</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        stockItems.map((item) => {
                                            const status = item.cantidad_actual <= (item.cantidad_minima || 0) ? 'Bajo' :
                                                item.cantidad_actual >= (item.cantidad_maxima || 999999) ? 'Exceso' : 'Normal';

                                            return (
                                                <tr key={item.inventario_id} className="hover:bg-surface-raised/30 transition-all group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-text-primary text-sm tracking-tight leading-tight mb-1">{item.articulo_nombre}</span>
                                                            <span className="text-[10px] text-primary font-black tracking-widest uppercase opacity-60">#{item.articulo_codigo}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="bg-surface-raised px-4 py-1.5 rounded-xl text-[10px] font-black text-text-secondary uppercase tracking-widest border border-border shadow-inner">
                                                            Sucursal {item.sucursal_id}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className={`text-2xl font-black ${status === 'Bajo' ? 'text-danger' : 'text-text-primary'}`}>
                                                                {item.cantidad_actual}
                                                            </span>
                                                            <span className="text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-40">
                                                                {item.unidad_medida}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors ${status === 'Bajo'
                                                            ? 'bg-danger/10 text-danger border-danger/20'
                                                            : status === 'Exceso'
                                                                ? 'bg-warning/10 text-warning border-warning/20'
                                                                : 'bg-secondary/10 text-secondary border-secondary/20'
                                                            }`}>
                                                            {status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-black text-text-primary uppercase tracking-tight">
                                                                {new Date(item.fecha_ultimo_ingreso || item.fecha_creacion).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-[11px] text-text-secondary font-medium opacity-60 italic leading-tight">
                                                                {item.observaciones || 'Sin anotaciones técnicas'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <button
                                                            onClick={() => handleAjuste(item)}
                                                            className="p-3.5 rounded-2xl bg-surface-card text-text-primary border border-border hover:bg-primary-dark hover:text-white hover:border-primary-dark transition-all shadow-sm group-hover:scale-105"
                                                            title="Ajuste Propedéutico"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
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

                        {/* Mobile Cards Standardized */}
                        <div className="md:hidden divide-y divide-border/50">
                            {stockItems.length === 0 ? (
                                <div className="p-20 text-center">
                                    <div className="text-4xl mb-4 opacity-20">📋</div>
                                    <p className="text-text-secondary font-black text-[10px] uppercase tracking-widest opacity-40">No hay registros de inventario</p>
                                </div>
                            ) : (
                                stockItems.map((item) => {
                                    const status = item.cantidad_actual <= (item.cantidad_minima || 0) ? 'Bajo' :
                                        item.cantidad_actual >= (item.cantidad_maxima || 999999) ? 'Exceso' : 'Normal';

                                    return (
                                        <div key={item.inventario_id} className="p-8 space-y-6 hover:bg-surface-raised/30 transition-all">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="font-black text-text-primary text-sm tracking-tight leading-tight">{item.articulo_nombre}</h4>
                                                    <p className="text-[10px] text-primary font-black tracking-widest uppercase opacity-60">#{item.articulo_codigo}</p>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${status === 'Bajo'
                                                    ? 'bg-danger/10 text-danger border-danger/20'
                                                    : status === 'Exceso'
                                                        ? 'bg-warning/10 text-warning border-warning/20'
                                                        : 'bg-secondary/10 text-secondary border-secondary/20'
                                                    }`}>
                                                    {status}
                                                </span>
                                            </div>
                                            <div className="bg-surface-card border border-border rounded-2xl p-6 flex justify-between items-center shadow-inner">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Existencia Física</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className={`text-2xl font-black ${status === 'Bajo' ? 'text-danger' : 'text-text-primary'}`}>
                                                            {item.cantidad_actual}
                                                        </span>
                                                        <span className="text-[10px] text-text-secondary font-black uppercase tracking-widest opacity-40">
                                                            {item.unidad_medida}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAjuste(item)}
                                                    className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                                                >
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-40">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                SUCURSAL {item.sucursal_id}
                                                <span className="mx-2">•</span>
                                                {new Date(item.fecha_ultimo_ingreso || item.fecha_creacion).toLocaleDateString()}
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
                    isSaving={ajusteMutation.isPending}
                />
            )}
        </div>
    );
}

function AjusteForm({ item, onConfirm, onCancel, isSaving }) {
    const [formData, setFormData] = useState({
        tipo_movimiento: 'AJUSTE',
        cantidad: item.cantidad_actual,
        motivo: 'Regularización técnica de existencias'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(formData);
    };

    return (
        <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-surface-card rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20"
            >
                <div className="bg-surface-raised p-8 border-b border-border">
                    <h2 className="text-xl font-black text-text-primary uppercase tracking-tight leading-none">Ajuste de <span className="text-primary">Stock</span></h2>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40 truncate">{item.articulo_nombre}</p>
                </div>

                <div className="p-10 space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Modalidad de Intervención</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'INGRESO', color: 'secondary' },
                                { id: 'EGRESO', color: 'danger' },
                                { id: 'AJUSTE', color: 'primary' }
                            ].map(tipo => (
                                <button
                                    key={tipo.id}
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, tipo_movimiento: tipo.id }))}
                                    className={`py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all border-2 ${formData.tipo_movimiento === tipo.id
                                            ? `bg-${tipo.color} text-white border-${tipo.color} shadow-lg shadow-${tipo.color}/20`
                                            : 'bg-surface-raised text-text-secondary border-border hover:border-border-dark'
                                        }`}
                                >{tipo.id}</button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">
                            {formData.tipo_movimiento === 'AJUSTE' ? 'Existencia Certificada' : 'Magnitud del Movimiento'}
                        </label>
                        <div className="relative group">
                            <input
                                type="number"
                                className="w-full px-6 py-5 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-black text-3xl text-center text-text-primary shadow-inner"
                                value={formData.cantidad}
                                onChange={e => setFormData(prev => ({ ...prev, cantidad: parseFloat(e.target.value) || 0 }))}
                                required
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-text-secondary uppercase text-[10px] opacity-40">
                                {item.unidad_medida}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Justificación Técnica</label>
                        <textarea
                            className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all text-xs font-medium text-text-primary shadow-inner resize-none"
                            placeholder="Describa el motivo del ajuste funcional..."
                            rows="2"
                            value={formData.motivo}
                            onChange={e => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
                            required
                        ></textarea>
                    </div>
                </div>

                <div className="bg-surface-raised p-8 border-t border-border flex flex-col sm:flex-row gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-text-secondary border border-border hover:bg-white transition-all order-last sm:order-none"
                        disabled={isSaving}
                    >
                        Abortar
                    </button>
                    <button
                        type="submit"
                        className="flex-[2] bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Sincronizando...' : 'Confirmar Ajuste'}
                    </button>
                </div>
            </form>
        </div>
    );
}
