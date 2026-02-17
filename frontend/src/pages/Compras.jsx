import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const comprasModules = [
    {
        id: 'proveedores',
        title: 'Proveedores',
        description: 'Gestión de proveedores, contactos y condiciones de pago.',
        icon: '🏢',
        path: '/compras/proveedores',
        codigo: 'COMPRAS_PROVEEDORES',
        color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
    },
    {
        id: 'articulos',
        title: 'Catálogo de Artículos',
        description: 'Maestro de insumos, materiales y suministros clínicos.',
        icon: '📦',
        path: '/compras/articulos',
        codigo: 'COMPRAS_ARTICULOS',
        color: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
    },
    {
        id: 'facturas',
        title: 'Registro de Compra',
        description: 'Ingreso de facturas de compra y carga de existencias.',
        icon: '🧾',
        path: '/compras/facturas/nueva',
        codigo: 'COMPRAS_REGISTRO',
        color: 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white'
    },
    {
        id: 'inventario',
        title: 'Stock e Inventario',
        description: 'Control de existencias, movimientos y auditoría.',
        icon: '📊',
        path: '/compras/inventario',
        codigo: 'COMPRAS_INVENTARIO',
        color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
    }
];

const Compras = () => {
    const navigate = useNavigate();
    const { tieneAccesoPrograma } = useAuth();
    const modulosVisibles = comprasModules.filter(m => tieneAccesoPrograma(m.codigo));
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Módulo de Compras</h1>
                    <p className="text-slate-500 font-medium">Gestión integral de abastecimiento y suministros clínicos.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/compras/facturas/nueva')}
                        className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-green-200 hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                        <span>+</span> Registrar Compra
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {modulosVisibles.map((module) => (
                    <button
                        key={module.id}
                        onClick={() => navigate(module.path)}
                        className={`text-left bg-white p-6 rounded-3xl shadow-sm border border-slate-200 transition-all group hover:shadow-xl hover:border-blue-200 hover:-translate-y-1`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-colors ${module.color}`}>
                            {module.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {module.title}
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            {module.description}
                        </p>
                    </button>
                ))}
            </div>

            {/* Widgets Rápidos (Opcional en el futuro) */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white overflow-hidden relative shadow-2xl">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-2">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Estado Crítico</p>
                        <p className="text-3xl font-black">0 Items</p>
                        <p className="text-slate-500 text-sm font-medium">Artículos por debajo del stock mínimo.</p>
                    </div>
                    <div className="space-y-2 border-l border-white/10 pl-10">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Últimos 30 días</p>
                        <p className="text-3xl font-black">0 Gs.</p>
                        <p className="text-slate-500 text-sm font-medium">Inversión total en compras registradas.</p>
                    </div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
};

export default Compras;