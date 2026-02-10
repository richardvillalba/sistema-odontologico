import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SinAcceso = () => {
    const navigate = useNavigate();
    const { usuario } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="mb-8">
                    <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-8xl">🔒</span>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-black text-slate-900 mb-4">
                    Acceso Denegado
                </h1>

                {/* Message */}
                <p className="text-lg text-slate-600 mb-2">
                    No tienes permisos para acceder a esta sección.
                </p>
                <p className="text-sm text-slate-500 mb-8">
                    {usuario?.nombre_completo && (
                        <>Usuario: <span className="font-semibold">{usuario.nombre_completo}</span></>
                    )}
                    {usuario?.rol_nombre && (
                        <> • Rol: <span className="font-semibold">{usuario.rol_nombre}</span></>
                    )}
                </p>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
                    >
                        ← Volver
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                    >
                        🏠 Ir al Inicio
                    </button>
                </div>

                {/* Additional Info */}
                <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-lg text-left">
                    <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                        <span>💡</span> ¿Necesitas acceso?
                    </h3>
                    <p className="text-sm text-amber-800">
                        Si consideras que deberías tener acceso a esta sección, contacta al administrador del sistema para que actualice tus permisos.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SinAcceso;
