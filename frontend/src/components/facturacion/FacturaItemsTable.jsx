import React, { useState } from 'react';

const FacturaItemsTable = ({ items, onRemove, onUpdateQuantity, onUpdateDiscount, onAddManual }) => {
    const [manualItem, setManualItem] = useState({
        descripcion: '',
        cantidad: 1,
        precio_unitario: 0,
        descuento: 0
    });

    const handleAddManual = () => {
        if (!manualItem.descripcion || manualItem.precio_unitario <= 0) return;
        onAddManual(manualItem);
        setManualItem({
            descripcion: '',
            cantidad: 1,
            precio_unitario: 0,
            descuento: 0
        });
    };

    const calculateSubtotal = (item) => {
        return (item.cantidad * item.precio_unitario) - (item.descuento || 0);
    };

    const totalInvoiced = items.reduce((acc, item) => acc + calculateSubtotal(item), 0);

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Descripción</th>
                                <th className="px-6 py-4 text-center">Cant.</th>
                                <th className="px-6 py-4 text-right">Precio Unit.</th>
                                <th className="px-6 py-4 text-right">Dcto.</th>
                                <th className="px-6 py-4 text-right">Subtotal</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {items.length > 0 ? (
                                items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{item.descripcion}</p>
                                            {item.tratamiento_diente_id && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase tracking-tighter">
                                                    Tratamiento #{item.tratamiento_diente_id}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-16 bg-slate-100 border-none rounded-lg text-center font-bold text-slate-700 py-1"
                                                value={item.cantidad}
                                                onChange={(e) => onUpdateQuantity(idx, parseInt(e.target.value) || 1)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-700">
                                            {new Intl.NumberFormat('es-PY').format(item.precio_unitario)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-24 bg-slate-100 border-none rounded-lg text-right font-bold text-rose-600 py-1"
                                                value={item.descuento}
                                                onChange={(e) => onUpdateDiscount(idx, parseInt(e.target.value) || 0)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-slate-900">
                                            {new Intl.NumberFormat('es-PY').format(calculateSubtotal(item))}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onRemove(idx)}
                                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-black text-slate-600">Sin ítems en la factura</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List View */}
                <div className="md:hidden divide-y divide-slate-100">
                    {items.length > 0 ? (
                        items.map((item, idx) => (
                            <div key={idx} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-bold text-slate-800 leading-tight">{item.descripcion}</p>
                                        {item.tratamiento_diente_id && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase">
                                                Diente #{item.tratamiento_diente_id}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onRemove(idx)}
                                        className="p-1.5 text-rose-300 hover:text-rose-500 bg-rose-50 rounded-lg"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 items-end">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cant y Precio</span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-12 bg-slate-100 border-none rounded-lg text-center font-bold text-slate-700 py-1 text-xs"
                                                value={item.cantidad}
                                                onChange={(e) => onUpdateQuantity(idx, parseInt(e.target.value) || 1)}
                                            />
                                            <span className="text-xs font-medium text-slate-500">× {new Intl.NumberFormat('es-PY').format(item.precio_unitario)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Subtotal</span>
                                        <span className="text-sm font-black text-slate-900">{new Intl.NumberFormat('es-PY').format(calculateSubtotal(item))} Gs</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-xs font-bold text-slate-400">Sin ítems en la factura</p>
                        </div>
                    )}
                </div>

                {/* Manual Entry Form (Responsive) */}
                <div className="bg-indigo-50/40 border-t-2 border-indigo-100 p-4 sm:p-6">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3 ml-1">Concepto Manual</p>
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="w-full lg:flex-1">
                            <input
                                type="text"
                                placeholder="Descripción del concepto..."
                                className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-2.5 text-sm font-bold text-indigo-900 placeholder:text-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                value={manualItem.descripcion}
                                onChange={(e) => setManualItem({ ...manualItem, descripcion: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-indigo-300 uppercase tracking-widest ml-1 lg:hidden">Cant</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full lg:w-16 bg-white border border-indigo-100 rounded-xl px-2 py-2.5 text-center font-bold text-indigo-600 text-sm outline-none"
                                    value={manualItem.cantidad}
                                    onChange={(e) => setManualItem({ ...manualItem, cantidad: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-indigo-300 uppercase tracking-widest ml-1 lg:hidden">Precio</label>
                                <input
                                    type="number"
                                    placeholder="Precio"
                                    className="w-full lg:w-28 bg-white border border-indigo-100 rounded-xl px-3 py-2.5 text-right font-bold text-emerald-600 text-sm outline-none"
                                    value={manualItem.precio_unitario}
                                    onChange={(e) => setManualItem({ ...manualItem, precio_unitario: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-indigo-300 uppercase tracking-widest ml-1 lg:hidden">Dcto</label>
                                <input
                                    type="number"
                                    placeholder="Dcto"
                                    className="w-full lg:w-24 bg-white border border-indigo-100 rounded-xl px-3 py-2.5 text-right font-bold text-rose-600 text-sm outline-none"
                                    value={manualItem.descuento}
                                    onChange={(e) => setManualItem({ ...manualItem, descuento: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleAddManual}
                            disabled={!manualItem.descripcion || manualItem.precio_unitario <= 0}
                            className="w-full lg:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                        >
                            <span>+</span> Añadir Item
                        </button>
                    </div>
                </div>
            </div>

            {/* Totals Summary Card */}
            <div className="bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="text-center md:text-left relative z-10 w-full sm:w-auto">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total a Facturar</p>
                    <p className="text-3xl sm:text-5xl font-black tabular-nums tracking-tighter">
                        {new Intl.NumberFormat('es-PY').format(totalInvoiced)} <span className="text-lg sm:text-2xl text-slate-500 tracking-normal">Gs</span>
                    </p>
                </div>
                <div className="h-full hidden md:block w-px bg-white/10"></div>
                <div className="grid grid-cols-2 gap-4 sm:gap-8 w-full md:w-auto relative z-10">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Items</p>
                        <p className="text-lg sm:text-xl font-black">{items.length}</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">IVA (Incl.)</p>
                        <p className="text-lg sm:text-xl font-black truncate">{new Intl.NumberFormat('es-PY').format(Math.round(totalInvoiced / 11))}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacturaItemsTable;
