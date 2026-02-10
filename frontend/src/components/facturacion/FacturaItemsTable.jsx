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
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic font-medium">
                                    No hay ítems cargados en esta factura.
                                </td>
                            </tr>
                        )}

                        {/* Fila para agregar item manual */}
                        <tr className="bg-indigo-50/30 border-t-2 border-indigo-50">
                            <td className="px-6 py-4">
                                <input
                                    type="text"
                                    placeholder="Agregar concepto manual..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-indigo-900 placeholder:text-indigo-300"
                                    value={manualItem.descripcion}
                                    onChange={(e) => setManualItem({ ...manualItem, descripcion: e.target.value })}
                                />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <input
                                    type="number"
                                    min="1"
                                    className="w-16 bg-white border border-indigo-100 rounded-lg text-center font-bold text-indigo-700 py-1"
                                    value={manualItem.cantidad}
                                    onChange={(e) => setManualItem({ ...manualItem, cantidad: parseInt(e.target.value) || 1 })}
                                />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <input
                                    type="number"
                                    placeholder="Precio"
                                    className="w-24 bg-white border border-indigo-100 rounded-lg text-right font-bold text-emerald-600 py-1"
                                    value={manualItem.precio_unitario}
                                    onChange={(e) => setManualItem({ ...manualItem, precio_unitario: parseInt(e.target.value) || 0 })}
                                />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <input
                                    type="number"
                                    placeholder="Dcto"
                                    className="w-24 bg-white border border-indigo-100 rounded-lg text-right font-bold text-rose-600 py-1"
                                    value={manualItem.descuento}
                                    onChange={(e) => setManualItem({ ...manualItem, descuento: parseInt(e.target.value) || 0 })}
                                />
                            </td>
                            <td className="px-6 py-4 text-right pt-6">
                                <button
                                    onClick={handleAddManual}
                                    disabled={!manualItem.descripcion || manualItem.precio_unitario <= 0}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-30 flex items-center gap-1.5"
                                >
                                    <span>+</span> Añadir
                                </button>
                            </td>
                            <td className="px-6 py-4"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Totals Summary Card */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
                <div className="text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total a Facturar</p>
                    <p className="text-5xl font-black tabular-nums tracking-tighter">
                        {new Intl.NumberFormat('es-PY').format(totalInvoiced)} <span className="text-2xl text-slate-500 tracking-normal">Gs</span>
                    </p>
                </div>
                <div className="h-full hidden md:block w-px bg-white/10"></div>
                <div className="grid grid-cols-2 gap-8 flex-1 md:flex-none">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Items</p>
                        <p className="text-xl font-black">{items.length}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">IVA (Incluido)</p>
                        <p className="text-xl font-black">{new Intl.NumberFormat('es-PY').format(Math.round(totalInvoiced / 11))} Gs</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacturaItemsTable;
