import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const comprasModules = [
    {
        id: 'proveedores',
        title: 'Proveedores',
        description: 'Gestión de alianzas estratégicas y suministros técnicos.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        path: '/compras/proveedores',
        codigo: 'COMPRAS_PROVEEDORES',
        color: 'text-primary'
    },
    {
        id: 'articulos',
        title: 'Catálogo Artículos',
        description: 'Maestro de insumos y materiales clínicos certificados.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
        path: '/compras/articulos',
        codigo: 'COMPRAS_ARTICULOS',
        color: 'text-secondary'
    },
    {
        id: 'facturas',
        title: 'Registro Compra',
        description: 'Procesamiento de adquisiciones e ingreso de stock.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        path: '/compras/facturas/nueva',
        codigo: 'COMPRAS_REGISTRO',
        color: 'text-emerald-500'
    },
    {
        id: 'inventario',
        title: 'Stock e Inventario',
        description: 'Auditoría de existencias y trazabilidad de materiales.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        path: '/compras/inventario',
        codigo: 'COMPRAS_INVENTARIO',
        color: 'text-primary-dark'
    }
];

const Compras = () => {
    const navigate = useNavigate();
    const { tieneAccesoPrograma } = useAuth();
    const modulosVisibles = comprasModules.filter(m => tieneAccesoPrograma(m.codigo));
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Section Standardized */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                        Gestión de <span className="text-primary">Abastecimiento</span>
                    </h1>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Administración técnica de suministros e insumos clínicos</p>
                </div>
                <button
                    onClick={() => navigate('/compras/facturas/nueva')}
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all flex items-center gap-3"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Registro
                </button>
            </div>

            {/* Modules Grid Standardized */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {modulosVisibles.map((module) => (
                    <button
                        key={module.id}
                        onClick={() => navigate(module.path)}
                        className="text-left bg-surface-card p-10 rounded-[3rem] border border-border shadow-sm transition-all group hover:shadow-2xl hover:border-primary/20 hover:-translate-y-2 flex flex-col items-start gap-6"
                    >
                        <div className={`w-16 h-16 rounded-[1.5rem] bg-surface-raised flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-white ${module.color}`}>
                            {module.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
                                {module.title}
                            </h3>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 leading-relaxed">
                                {module.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Global Stats Widget Standardized */}
            <div className="bg-primary-dark rounded-[3.5rem] p-12 text-white overflow-hidden relative shadow-2xl border border-white/10 group">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-3">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Alertas de Stock</p>
                        <div className="flex items-baseline gap-3">
                            <p className="text-5xl font-black">0</p>
                            <span className="text-xs font-black uppercase tracking-widest opacity-40">Items críticos</span>
                        </div>
                        <p className="text-white/60 text-xs font-medium">Materiales por debajo del umbral técnico de reserva.</p>
                    </div>
                    <div className="space-y-3 border-l-2 border-white/5 pl-12">
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Inversión Mensual</p>
                        <div className="flex items-baseline gap-3">
                            <p className="text-5xl font-black">0</p>
                            <span className="text-xs font-black uppercase tracking-widest opacity-40">Gs.</span>
                        </div>
                        <p className="text-white/60 text-xs font-medium">Flujo de capital destinado a reposición de suministros.</p>
                    </div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-white/5 to-transparent pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity"></div>
                <div className="absolute -right-20 -top-20 bg-white/5 w-80 h-80 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            </div>
        </div>
    );
};

export default Compras;