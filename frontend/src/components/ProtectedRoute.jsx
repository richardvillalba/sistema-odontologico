import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requierePrograma, requierePermiso }) => {
    const { isAuthenticated, tieneAccesoPrograma, tienePermiso, loading } = useAuth();

    // Mostrar loading mientras verifica autenticación
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Verificar acceso a programa específico
    if (requierePrograma && !tieneAccesoPrograma(requierePrograma)) {
        return <Navigate to="/sin-acceso" replace />;
    }

    // Verificar permiso específico
    if (requierePermiso && !tienePermiso(requierePermiso)) {
        return <Navigate to="/sin-acceso" replace />;
    }

    // Usuario autenticado y con permisos adecuados
    return children;
};

export default ProtectedRoute;
