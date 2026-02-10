import React from 'react';
import { useNavigate } from 'react-router-dom';

const Configuraciones = () => {
    const navigate = useNavigate();

    const configModules = [
        {
            id: 'timbrados',
            title: 'Timbrados y Facturación',
            description: 'Gestión de puntos de expedición, talonarios fiscales y alertas de vencimiento.',
            icon: '🧾',
            path: '/configuraciones/timbrados',
            color: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
        },
        {
            id: 'usuarios',
            title: 'Usuarios y Accesos',
            description: 'Administración de usuarios y asignación de roles.',
            icon: '👤',
            path: '/configuraciones/usuarios',
            color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
        },
        {
            id: 'roles',
            title: 'Roles y Módulos',
            description: 'Configuración de roles, módulos del sistema y permisos.',
            icon: '🎭',
            path: '/configuraciones/roles',
            color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
        },
        {
            id: 'clinica',
            title: 'Datos de la Clínica',
            description: 'Información general, logo, slogan y datos de contacto para impresión.',
            icon: '🏥',
            path: '/configuraciones/clinica',
            color: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
        },
        {
            id: 'cajas',
            title: 'Cajas',
            description: 'Configuración de cajas de la empresa y asignación de usuarios responsables.',
            icon: '💵',
            path: '/configuraciones/cajas',
            color: 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuraciones</h1>
                <p className="text-slate-500 font-medium">Administra las preferencias y módulos del sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {configModules.map((module) => (
                    <button
                        key={module.id}
                        onClick={() => !module.disabled && navigate(module.path)}
                        disabled={module.disabled}
                        className={`text-left bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all group ${module.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md hover:border-indigo-200 hover:-translate-y-1'
                            }`}
                    >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4 transition-colors ${module.color}`}>
                            {module.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                            {module.title}
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {module.description}
                        </p>
                        {module.disabled && (
                            <span className="inline-block mt-4 px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase tracking-wider">
                                Próximamente
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Configuraciones;
