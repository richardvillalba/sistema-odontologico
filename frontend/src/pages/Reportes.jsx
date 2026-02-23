import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Reportes = () => {
    const navigate = useNavigate();
    const { tieneAccesoPrograma } = useAuth();

    const reportModules = [
        {
            id: 'financiero',
            title: 'Análisis Financiero',
            description: 'Ingresos, facturación, cobros y flujos de caja proyectados por período.',
            iconPath: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
            path: '/reportes/financiero',
            codigo: 'REP_FINANCIERO',
            color: 'bg-secondary/10 text-secondary border-secondary/20 group-hover:bg-secondary group-hover:text-white'
        },
        {
            id: 'citas',
            title: 'Gestión de Citas',
            description: 'Métricas de ausentismo, distribución de agenda y efectividad operativa.',
            iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
            path: '/reportes/citas',
            codigo: 'REP_CITAS',
            color: 'bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-white'
        },
        {
            id: 'pacientes',
            title: 'Legajo de Auditoría',
            description: 'Trazabilidad de historias clínicas, demografía y crecimiento de pacientes.',
            iconPath: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
            path: '/reportes/pacientes',
            codigo: 'REP_PACIENTES',
            color: 'bg-accent/10 text-accent border-accent/20 group-hover:bg-accent group-hover:text-white'
        },
        {
            id: 'inventario',
            title: 'Control de Insumos',
            description: 'Stock crítico, valoración de activos y ciclos de reposición de materiales.',
            iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
            path: '/reportes/inventario',
            codigo: 'REP_INVENTARIO',
            color: 'bg-warning/10 text-warning border-warning/20 group-hover:bg-warning group-hover:text-white'
        },
    ];

    const modulosVisibles = reportModules.filter(m => tieneAccesoPrograma(m.codigo));

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="border-b border-border pb-8">
                <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                    Centro de <span className="text-primary">Inteligencia</span>
                </h1>
                <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Módulo de analítica avanzada y extracción de datos operativos</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {modulosVisibles.map((module) => (
                    <button
                        key={module.id}
                        onClick={() => navigate(module.path)}
                        className="text-left bg-surface-card p-10 rounded-[2.5rem] border border-border transition-all group hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors"></div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all border shadow-inner ${module.color}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d={module.iconPath} />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-3 group-hover:text-primary transition-colors">
                            {module.title}
                        </h3>
                        <p className="text-[11px] text-text-secondary font-medium leading-relaxed opacity-60">
                            {module.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Reportes;
