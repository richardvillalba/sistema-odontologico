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
        onSuccess: (response) => {
            const result = response?.data;
            if (result && result.success === false) {
                alert('Error al registrar compra: ' + (result.message || 'Error desconocido en la base de datos'));
                return;
            }
            queryClient.invalidateQueries(['inventario']);
            queryClient.invalidateQueries(['facturas-compra']);
            alert('Compra registrada exitosamente');
            navigate('/compras/facturas');
        },
        onError: (err) => {
            const msg = err.response?.data?.message || err.response?.data?.error || err.message;
            alert('Error al registrar compra: ' + msg);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (lines.length === 0) return alert('Debe agregar al menos un ítem');
        if (!head.proveedor_id) return alert('Debe seleccionar un proveedor');

        const detallesJson = JSON.stringify(
            lines.map(({ articulo_id, cantidad, costo_unitario }) => ({
                articulo_id: parseInt(articulo_id),
                cantidad: parseFloat(cantidad),
                costo_unitario: parseFloat(costo_unitario)
            }))
        );

        registrarMutation.mutate({
            empresa_id: empresaActiva?.empresa_id,
            sucursal_id: sucursalActiva?.sucursal_id,
            proveedor_id: parseInt(head.proveedor_id),
            numero_factura: head.nro_factura,
            fecha_factura: head.fecha_emision,
            condicion_pago: head.condicion_pago,
            moneda: head.moneda,
            total_general: total,
            detalles: detallesJson,
            usuario_id: usuario?.usuario_id
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header Section Standardized */}
            <div className="flex flex-col sm:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                        Registro Técnico de <span className="text-primary">Adquisiciones</span>
                    </h1>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Procesamiento de facturas y actualización de activos clínicos</p>
                </div>
                <button
                    onClick={() => navigate('/compras')}
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-surface-card flex items-center justify-center border border-border group-hover:border-primary/20 shadow-sm transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </div>
                    <span>Volver al Módulo</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Cabecera Standardized */}
                <div className="bg-surface-card rounded-[3rem] shadow-sm border border-border p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Proveedor Certificado</label>
                        <div className="relative group">
                            <select
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary appearance-none cursor-pointer"
                                value={head.proveedor_id}
                                onChange={(e) => setHead({ ...head, proveedor_id: e.target.value })}
                                required
                            >
                                <option value="">Seleccione Proveedor...</option>
                                {proveedores.map(p => (
                                    <option key={p.proveedor_id} value={p.proveedor_id}>{p.nombre} [{p.ruc}]</option>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary opacity-30">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Identificador Factura</label>
                        <input
                            type="text"
                            placeholder="000-000-000000"
                            className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-black text-sm text-text-primary"
                            value={head.nro_factura}
                            onChange={(e) => setHead({ ...head, nro_factura: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Fecha de Certificación</label>
                        <input
                            type="date"
                            className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary cursor-pointer"
                            value={head.fecha_emision}
                            onChange={(e) => setHead({ ...head, fecha_emision: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Modalidad de Pago</label>
                        <select
                            className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary appearance-none cursor-pointer"
                            value={head.condicion_pago}
                            onChange={(e) => setHead({ ...head, condicion_pago: e.target.value })}
                        >
                            <option value="CONTADO">CONTADO</option>
                            <option value="CREDITO 15d">CRÉDITO 15 DÍAS</option>
                            <option value="CREDITO 30d">CRÉDITO 30 DÍAS</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Moneda Operativa</label>
                        <select
                            className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary appearance-none cursor-pointer"
                            value={head.moneda}
                            onChange={(e) => setHead({ ...head, moneda: e.target.value })}
                        >
                            <option value="PYG">PYG (GUARANÍES)</option>
                            <option value="USD">USD (DÓLARES)</option>
                        </select>
                    </div>
                </div>

                {/* Detalles Standardized */}
                <div className="bg-surface-card rounded-[3.5rem] shadow-sm border border-border overflow-hidden">
                    <div className="px-10 py-8 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-6 bg-surface-raised/50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-inner">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Desglose de Ítems Adquiridos</h3>
                        </div>
                        <button
                            type="button"
                            onClick={addLine}
                            className="w-full sm:w-auto bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                            </svg>
                            Incorporar Artículo
                        </button>
                    </div>

                    {/* Desktop View Table Standardized */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40 border-b border-border">
                                    <th className="px-10 py-6">Especificación del Artículo</th>
                                    <th className="px-10 py-6 text-center">Magnitud</th>
                                    <th className="px-10 py-6 text-right">Inversión Unit.</th>
                                    <th className="px-10 py-6 text-right">Monto Línea</th>
                                    <th className="px-10 py-6 text-center">Intervención</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {lines.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-10 py-40 text-center">
                                            <div className="w-24 h-24 bg-surface-raised rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-border">
                                                <svg className="w-10 h-10 text-text-secondary opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <p className="text-text-secondary font-black uppercase text-[10px] tracking-[.2em] opacity-40 max-w-xs mx-auto">Pendiente de ingreso de activos para registro técnico</p>
                                        </td>
                                    </tr>
                                ) : (
                                    lines.map((line) => (
                                        <tr key={line.id} className="hover:bg-surface-raised/30 transition-all group">
                                            <td className="px-10 py-6">
                                                <div className="relative group/select">
                                                    <select
                                                        className="w-full bg-transparent border-none focus:ring-0 font-black text-text-primary text-sm outline-none cursor-pointer pr-8 appearance-none"
                                                        value={line.articulo_id}
                                                        onChange={(e) => updateLine(line.id, 'articulo_id', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Vincular Artículo...</option>
                                                        {articulos.map(a => (
                                                            <option key={a.articulo_id} value={a.articulo_id}>{a.nombre} [{a.codigo}]</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover/select:opacity-30 transition-opacity">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <input
                                                        type="number"
                                                        className="w-24 text-center bg-surface-raised border-2 border-border rounded-xl py-2 font-black text-sm text-text-primary focus:border-primary focus:outline-none transition-all shadow-inner"
                                                        value={line.cantidad}
                                                        onChange={(e) => updateLine(line.id, 'cantidad', parseFloat(e.target.value) || 0)}
                                                        min="0.1"
                                                        step="0.1"
                                                        required
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <input
                                                    type="number"
                                                    className="w-36 ml-auto text-right bg-transparent border-none focus:ring-0 font-black text-sm text-primary outline-none"
                                                    value={line.costo_unitario}
                                                    onChange={(e) => updateLine(line.id, 'costo_unitario', parseFloat(e.target.value) || 0)}
                                                    required
                                                />
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-black text-text-primary text-sm">{new Intl.NumberFormat('es-PY').format(line.cantidad * line.costo_unitario)}</span>
                                                    <span className="text-[9px] font-black text-text-secondary uppercase opacity-30 italic">{head.moneda}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeLine(line.id)}
                                                    className="p-3 rounded-2xl text-danger hover:bg-danger/10 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                                    title="Eliminar Línea"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View Cards Standardized */}
                    <div className="md:hidden divide-y divide-border/50">
                        {lines.length === 0 ? (
                            <div className="p-20 text-center">
                                <p className="text-text-secondary font-black text-[10px] uppercase tracking-widest opacity-40">Cargue productos para continuar</p>
                            </div>
                        ) : (
                            lines.map((line) => (
                                <div key={line.id} className="p-8 space-y-6 hover:bg-surface-raised/30 transition-all">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">Artículo Clínico</label>
                                            <select
                                                className="w-full bg-surface-raised border-2 border-border rounded-xl px-4 py-3 font-black text-text-primary outline-none text-xs focus:border-primary transition-all"
                                                value={line.articulo_id}
                                                onChange={(e) => updateLine(line.id, 'articulo_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Seleccionar...</option>
                                                {articulos.map(a => (
                                                    <option key={a.articulo_id} value={a.articulo_id}>{a.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeLine(line.id)}
                                            className="p-4 text-danger bg-danger/10 rounded-2xl"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 ml-1">Magnitud</label>
                                            <input
                                                type="number"
                                                className="w-full bg-surface-raised border-2 border-border rounded-xl py-3 px-4 font-black text-text-primary text-sm focus:border-primary transition-all"
                                                value={line.cantidad}
                                                onChange={(e) => updateLine(line.id, 'cantidad', parseFloat(e.target.value) || 0)}
                                                min="0.1"
                                                step="0.1"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 text-right mr-1">Costo Unitario</label>
                                            <input
                                                type="number"
                                                className="w-full text-right bg-surface-raised border-2 border-border rounded-xl py-3 px-4 font-black text-primary text-sm focus:border-primary transition-all"
                                                value={line.costo_unitario}
                                                onChange={(e) => updateLine(line.id, 'costo_unitario', parseFloat(e.target.value) || 0)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t border-border">
                                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Subtotal de Línea</span>
                                        <div className="text-right">
                                            <span className="font-black text-text-primary text-lg">
                                                {new Intl.NumberFormat('es-PY').format(line.cantidad * line.costo_unitario)}
                                            </span>
                                            <span className="text-[10px] font-black text-text-secondary uppercase ml-2 opacity-30 italic">{head.moneda}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Standardized */}
                    <div className="bg-surface-raised/80 px-10 py-10 flex flex-col sm:flex-row justify-between items-center gap-8 border-t border-border">
                        <div className="hidden sm:flex items-center gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                            <span className="text-text-secondary text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Certificación de Importe Total</span>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto gap-12">
                            <span className="text-text-secondary font-black uppercase text-[10px] tracking-widest sm:hidden opacity-40">Total Certificado</span>
                            <div className="flex items-baseline gap-4">
                                <span className="text-[10px] text-primary font-black uppercase tracking-widest italic">{head.moneda}</span>
                                <span className="text-4xl sm:text-5xl font-black text-text-primary tracking-tighter">
                                    {new Intl.NumberFormat('es-PY').format(total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Section Standardized */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                    <button
                        type="submit"
                        disabled={registrarMutation.isPending || lines.length === 0}
                        className="w-full sm:w-auto bg-primary text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-primary-dark hover:-translate-y-2 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-4"
                    >
                        {registrarMutation.isPending ? (
                            <>
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Sincronizando...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Certificar Registro de Compra</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
