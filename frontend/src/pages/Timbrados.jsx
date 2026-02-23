import React, { useState } from 'react';
import TimbradosList from '../components/facturacion/TimbradosList';
import AlertasTimbrados from '../components/facturacion/AlertasTimbrados';
import TimbradoForm from '../components/facturacion/TimbradoForm';

const Timbrados = () => {
    const [showModal, setShowModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
        setShowModal(false);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header Section Standardized */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                        Gestión de <span className="text-primary">Timbrados Fiscales</span>
                    </h1>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Control de puntos de expedición y validación de talonarios vigentes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center justify-center gap-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nuevo Registro</span>
                </button>
            </div>

            <div className="space-y-10">
                {/* Dashboard de Alertas Standardized internally */}
                <AlertasTimbrados key={`alerts-${refreshKey}`} />

                {/* Lista de Timbrados Standardized internally */}
                <TimbradosList key={`list-${refreshKey}`} />
            </div>

            {/* Modal de Creación Standardized internally */}
            {showModal && (
                <TimbradoForm
                    onClose={() => setShowModal(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default Timbrados;
