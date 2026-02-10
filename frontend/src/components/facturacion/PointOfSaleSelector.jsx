import React from 'react';
import { usePointOfSale } from '../../context/PointOfSaleContext';

const PointOfSaleSelector = () => {
    const { points, showSelector, setShowSelector, isMandatory, isLoading, error, selectPoint } = usePointOfSale();

    if (!showSelector || isLoading) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 relative">

                {/* Botón Cerrar (Solo si no es obligatorio) */}
                {!isMandatory && (
                    <button
                        onClick={() => setShowSelector(false)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                <div className="p-8 text-center border-b border-slate-100 bg-slate-50/50">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-inner">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        {isMandatory ? "Punto Requerido" : "Selección de Punto"}
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">
                        {error ? error : "Seleccione su punto de trabajo para esta sesión"}
                    </p>
                </div>

                <div className="p-8">
                    {error && isMandatory && points.length === 0 ? (
                        <div className="space-y-6">
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 text-red-700">
                                <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-sm font-semibold leading-relaxed">{error}</p>
                            </div>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                            >
                                Volver al Inicio
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {points.map((point) => {
                                const isPointExpired = point.fecha_vencimiento && new Date(point.fecha_vencimiento) < new Date();
                                const isPointExhausted = point.numeros_disponibles <= 0;
                                const isInvalid = isPointExpired || isPointExhausted;

                                return (
                                    <button
                                        key={point.timbrado_id}
                                        onClick={() => selectPoint(point)}
                                        disabled={isInvalid && isMandatory}
                                        className={`w-full text-left p-5 rounded-2xl border transition-all group flex items-center justify-between shadow-sm hover:shadow-md 
                                            ${isInvalid ? 'bg-slate-50 border-slate-200 opacity-60' : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${isInvalid ? 'text-slate-400' : 'text-indigo-500'}`}>
                                                {point.tipo_documento} {isPointExpired ? '(VENCIDO)' : isPointExhausted ? '(AGOTADO)' : ''}
                                            </span>
                                            <span className={`text-lg font-bold transition-colors ${isInvalid ? 'text-slate-400' : 'text-slate-800 group-hover:text-indigo-700'}`}>
                                                {point.establecimiento}-{point.punto_expedicion}
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium font-mono uppercase">
                                                Timb: {point.numero_timbrado}
                                            </span>
                                        </div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm
                                            ${isInvalid ? 'bg-slate-100 text-slate-300' : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="px-8 py-4 bg-slate-50/50 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Sistema Odontológico — Facturación Inteligente
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PointOfSaleSelector;
