import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const configModules = [
    {
        id: 'timbrados',
        title: 'Timbrados y Facturación',
        description: 'Gestión de puntos de expedición, talonarios fiscales y alertas de vencimiento.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
            </svg>
        ),
        path: '/configuraciones/timbrados',
        codigo: 'CONFIG_TIMBRADOS',
        color: 'text-primary'
    },
    {
        id: 'usuarios',
        title: 'Usuarios y Accesos',
        description: 'Administración de usuarios y asignación de roles técnicos.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        path: '/configuraciones/usuarios',
        codigo: 'CONFIG_USUARIOS',
        color: 'text-accent'
    },
    {
        id: 'roles',
        title: 'Roles y Módulos',
        description: 'Configuración de roles, módulos del sistema y permisos quirúrgicos.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        path: '/configuraciones/roles',
        codigo: 'CONFIG_ROLES',
        color: 'text-secondary'
    },
    {
        id: 'clinica',
        title: 'Datos de la Clínica',
        description: 'Identidad corporativa, logotipos y parámetros de contacto médico.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        path: '/configuraciones/clinica',
        codigo: 'CONFIG_CLINICA',
        color: 'text-danger'
    },
    {
        id: 'tratamientos',
        title: 'Catálogo Maestro',
        description: 'Vademécum de tratamientos odontológicos, aranceles y categorías.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        ),
        path: '/configuraciones/tratamientos',
        codigo: 'CONFIG_TRATAMIENTOS',
        color: 'text-primary'
    },
    {
        id: 'cajas',
        title: 'Tesorería y Cajas',
        description: 'Puntos de cobro, asignaciones y conciliación de flujos de efectivo.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        path: '/configuraciones/cajas',
        codigo: 'CONFIG_CAJAS',
        color: 'text-secondary'
    },
    {
        id: 'empresas',
        title: 'Estructura Corporativa',
        description: 'Administración de entidades legales, holdings y centros de costos.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        path: '/configuraciones/empresas',
        codigo: 'CONFIG_EMPRESAS',
        color: 'text-accent'
    },
    {
        id: 'sucursales',
        title: 'Centros de Atención',
        description: 'Geolocalización, infraestructuras y logística de sucursales.',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        path: '/configuraciones/sucursales',
        codigo: 'CONFIG_SUCURSALES',
        color: 'text-warning'
    }
];

const Configuraciones = () => {
    const navigate = useNavigate();
    const { tieneAccesoPrograma } = useAuth();
    const modulosVisibles = configModules.filter(m => tieneAccesoPrograma(m.codigo));

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Section Standardized */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                        Parámetros del <span className="text-primary">Ecosistema</span>
                    </h1>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Configuración técnica y operativa de la plataforma clínica</p>
                </div>
            </div>

            {/* Modules Grid Standardized */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-relaxed">
                                {module.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Global Stats/Info Widget (Optional for this page) */}
            <div className="bg-primary-dark rounded-[3.5rem] p-12 text-white overflow-hidden relative shadow-2xl border border-white/10 group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/30 transition-all duration-700"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
                            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Sincronización Clínica Master</span>
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tight leading-none">Control Maestro de <span className="text-primary-light">Infraestructura</span></h2>
                        <p className="text-white/60 font-medium text-sm max-w-xl">Todos los cambios realizados en este panel impactan directamente en la operabilidad y seguridad de todas las sucursales y terminales del sistema.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Configuraciones;
