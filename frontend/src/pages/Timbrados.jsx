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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Timbrados y Facturación</h1>
                    <p className="text-slate-500 font-medium">Administra tus puntos de expedición y talonarios fiscales.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200/50 transition-all flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Nuevo Timbrado
                </button>
            </div>

            {/* Dashboard de Alertas */}
            <AlertasTimbrados key={`alerts-${refreshKey}`} />

            {/* Lista de Timbrados */}
            <TimbradosList key={`list-${refreshKey}`} />

            {/* Modal de Creación */}
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
