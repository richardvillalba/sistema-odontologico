import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { billingService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FacturasDebug = () => {
    const { empresaActiva } = useAuth();
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['facturas-debug', empresaActiva?.empresa_id],
        queryFn: () => {
            const params = {
                empresa_id: empresaActiva?.empresa_id
            };
            return billingService.getFacturas(params);
        },
        enabled: !!empresaActiva?.empresa_id,
    });

    console.log('=== FACTURAS DEBUG ===');
    console.log('isLoading:', isLoading);
    console.log('isError:', isError);
    console.log('error:', error);
    console.log('data:', data);
    console.log('data?.data:', data?.data);
    console.log('data?.data?.items:', data?.data?.items);
    console.log('======================');

    if (isLoading) return (
        <div className="p-20 text-center animate-pulse flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-black text-text-secondary uppercase tracking-[0.2em] text-[10px] opacity-60">Analizando Datos de Facturación...</p>
        </div>
    );

    if (isError) return (
        <div className="p-20 text-center space-y-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-[2rem] bg-danger/10 text-danger flex items-center justify-center text-3xl border border-danger/20 shadow-inner">⚠️</div>
            <p className="text-danger font-black uppercase text-xs tracking-widest">{error?.message || 'Error en la consulta'}</p>
        </div>
    );

    const facturas = data?.data?.items || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="border-b border-border pb-8">
                <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                    Inspección <span className="text-primary">Técnica</span>
                </h1>
                <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Depuración de estructuras JSON y metadatos de facturación</p>
            </div>

            <div className="bg-surface-card rounded-[2.5rem] border border-border shadow-sm p-10 space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Métricas de Respuesta</span>
                    <span className="bg-primary/5 px-4 py-1.5 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest">
                        Total Items: {facturas.length}
                    </span>
                </div>

                <div className="relative group">
                    <div className="absolute top-4 right-4 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">JSON Output</div>
                    <pre className="bg-surface-raised border border-border rounded-2xl p-8 overflow-auto max-h-[600px] text-xs font-mono text-text-primary shadow-inner custom-scrollbar leading-relaxed">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default FacturasDebug;
