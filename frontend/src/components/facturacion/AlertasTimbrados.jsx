import React from 'react';
import { useTimbradoAlerts } from '../../hooks/useTimbradoAlerts';

const AlertasTimbrados = () => {
    const { alertas, loading } = useTimbradoAlerts({ usuarioId: 1 }); // Mocked usuarioId

    if (loading || alertas.length === 0) return null;

    const getAlertConfig = (tipo) => {
        switch (tipo) {
            case 'VENCIDO':
            case 'AGOTADO':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-100',
                    text: 'text-red-700',
                    accent: 'bg-red-600',
                    icon: (
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
            case 'POR_VENCER':
            case 'POR_AGOTARSE':
                return {
                    bg: 'bg-amber-50',
                    border: 'border-amber-100',
                    text: 'text-amber-800',
                    accent: 'bg-amber-500',
                    icon: (
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-100',
                    text: 'text-blue-700',
                    accent: 'bg-blue-600',
                    icon: (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
        }
    };

    return (
        <div className="mb-8 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Alertas de Facturación</h3>
                            <p className="text-xs text-slate-500 font-medium">Acciones requeridas para tus talonarios</p>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                        {alertas.length} {alertas.length === 1 ? 'Aviso' : 'Avisos'}
                    </span>
                </div>

                <div className="p-2 space-y-1">
                    {alertas.map((alerta, index) => {
                        const config = getAlertConfig(alerta.tipo_alerta);
                        return (
                            <div
                                key={`${alerta.timbrado_id}-${index}`}
                                className={`flex items-center p-4 gap-4 rounded-xl border-l-4 transition-all hover:bg-slate-50 ${config.bg} ${config.border} border-l-current`}
                                style={{ borderLeftColor: 'rgb(var(--accent-color, current))' }}
                            >
                                <div className="p-2.5 rounded-xl bg-white shadow-sm border border-black/5">
                                    {config.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${config.bg} ${config.text} border border-current opacity-70`}>
                                            {alerta.tipo_alerta.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-slate-400">
                                            #{alerta.numero_timbrado}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-800 truncate">
                                        Punto de Expedición {alerta.establecimiento}-{alerta.punto_expedicion}
                                    </h4>
                                </div>

                                <div className="flex items-center gap-6 pr-2">
                                    {alerta.dias_para_vencer !== null && (
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter mb-1">Vencimiento</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-xl font-black font-mono ${alerta.dias_para_vencer < 7 ? 'text-red-600' : config.text}`}>
                                                    {alerta.dias_para_vencer}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400">DÍAS</span>
                                            </div>
                                        </div>
                                    )}
                                    {alerta.numeros_disponibles !== null && (
                                        <div className="text-center border-l border-slate-200/60 pl-6">
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter mb-1">Stock</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-black font-mono text-slate-700">
                                                    {alerta.numeros_disponibles}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 italic">libres</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AlertasTimbrados;
