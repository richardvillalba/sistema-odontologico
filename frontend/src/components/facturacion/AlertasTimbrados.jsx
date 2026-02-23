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
                    bg: 'bg-danger/5',
                    border: 'border-danger/20',
                    text: 'text-danger',
                    accent: 'bg-danger',
                    icon: (
                        <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )
                };
            case 'POR_VENCER':
            case 'POR_AGOTARSE':
                return {
                    bg: 'bg-warning/5',
                    border: 'border-warning/20',
                    text: 'text-warning',
                    accent: 'bg-warning',
                    icon: (
                        <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
            default:
                return {
                    bg: 'bg-primary/5',
                    border: 'border-primary/20',
                    text: 'text-primary',
                    accent: 'bg-primary',
                    icon: (
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
        }
    };

    return (
        <div className="mb-12 animate-in fade-in duration-700">
            <div className="bg-surface-card rounded-[2.5rem] shadow-sm border border-border overflow-hidden">
                <div className="px-10 py-6 border-b border-border flex items-center justify-between bg-surface-raised/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-danger/10 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-text-primary uppercase tracking-widest leading-none">Monitor de Alertas Fiscales</h3>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1.5">Acciones técnicas requeridas para el timbrado</p>
                        </div>
                    </div>
                    <span className="px-4 py-1.5 bg-danger text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-danger/20">
                        {alertas.length} {alertas.length === 1 ? 'Aviso Crítico' : 'Avisos Críticos'}
                    </span>
                </div>

                <div className="p-4 space-y-2">
                    {alertas.map((alerta, index) => {
                        const config = getAlertConfig(alerta.tipo_alerta);
                        return (
                            <div
                                key={`${alerta.timbrado_id}-${index}`}
                                className={`flex items-center p-6 gap-6 rounded-3xl border-2 transition-all hover:translate-x-1 ${config.bg} ${config.border}`}
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center shrink-0">
                                    {config.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${config.bg} ${config.text} border border-current`}>
                                            {alerta.tipo_alerta.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">
                                            TIMBRADO #{alerta.numero_timbrado}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-black text-text-primary uppercase tracking-tight truncate">
                                        EST. {alerta.establecimiento}-{alerta.punto_expedicion} <span className="text-text-secondary opacity-30 mx-2">|</span> TERMINAL FISCAL
                                    </h4>
                                </div>

                                <div className="flex items-center gap-8 pr-4">
                                    {alerta.dias_para_vencer !== null && (
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-1">Caducidad</p>
                                            <div className="flex items-baseline justify-end gap-1.5">
                                                <span className={`text-2xl font-black tabular-nums leading-none ${alerta.dias_para_vencer < 7 ? 'text-danger' : config.text}`}>
                                                    {alerta.dias_para_vencer}
                                                </span>
                                                <span className="text-[10px] font-black text-text-secondary uppercase">Días</span>
                                            </div>
                                        </div>
                                    )}
                                    {alerta.numeros_disponibles !== null && (
                                        <div className="text-right border-l border-border/50 pl-8">
                                            <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-1">Stock Disponible</p>
                                            <div className="flex items-baseline justify-end gap-1.5">
                                                <span className="text-2xl font-black text-text-primary tabular-nums leading-none">
                                                    {alerta.numeros_disponibles}
                                                </span>
                                                <span className="text-[10px] font-black text-text-secondary uppercase">Folios</span>
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
