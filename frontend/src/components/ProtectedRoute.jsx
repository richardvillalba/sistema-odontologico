import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Mapa de rutas a codigo de programa requerido
// IMPORTANTE: Sub-rutas específicas ANTES de las genéricas (usa startsWith)
const RUTA_PROGRAMA = [
    // Sub-rutas de compras
    { path: '/compras/proveedores', codigo: 'COMPRAS_PROVEEDORES' },
    { path: '/compras/articulos', codigo: 'COMPRAS_ARTICULOS' },
    { path: '/compras/inventario', codigo: 'COMPRAS_INVENTARIO' },
    { path: '/compras/facturas/nueva', codigo: 'COMPRAS_REGISTRO' },
    // Sub-rutas de configuraciones
    { path: '/configuraciones/timbrados', codigo: 'CONFIG_TIMBRADOS' },
    { path: '/configuraciones/usuarios', codigo: 'CONFIG_USUARIOS' },
    { path: '/configuraciones/roles', codigo: 'CONFIG_ROLES' },
    { path: '/configuraciones/clinica', codigo: 'CONFIG_CLINICA' },
    { path: '/configuraciones/tratamientos', codigo: 'CONFIG_TRATAMIENTOS' },
    { path: '/configuraciones/cajas', codigo: 'CONFIG_CAJAS' },
    { path: '/configuraciones/empresas', codigo: 'CONFIG_EMPRESAS' },
    { path: '/configuraciones/sucursales', codigo: 'CONFIG_SUCURSALES' },
    // Sub-rutas de reportes
    { path: '/reportes/financiero', codigo: 'REP_FINANCIERO' },
    { path: '/reportes/citas', codigo: 'REP_CITAS' },
    { path: '/reportes/pacientes', codigo: 'REP_PACIENTES' },
    { path: '/reportes/inventario', codigo: 'REP_INVENTARIO' },
    // Rutas principales
    { path: '/pacientes', codigo: 'PACIENTES' },
    { path: '/citas', codigo: 'CITAS' },
    { path: '/agenda', codigo: 'CITAS' },
    { path: '/caja', codigo: 'CAJA' },
    { path: '/compras', codigo: 'COMPRAS' },
    { path: '/facturas', codigo: 'FACTURACION' },
    { path: '/reportes', codigo: 'REPORTES' },
    { path: '/configuraciones', codigo: 'CONFIGURACIONES' },
];

const ProtectedRoute = ({ children, requierePrograma, requierePermiso, skipContextCheck }) => {
    const { isAuthenticated, tieneAccesoPrograma, tienePermiso, loading, usuario, esSuperAdmin, contextoListo } = useAuth();
    const location = useLocation();

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

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Verificar si el usuario tiene rol asignado (superadmin no necesita rol)
    if (!esSuperAdmin() && !usuario?.rol_id) {
        return <Navigate to="/sin-acceso" state={{ sinRol: true }} replace />;
    }

    // Verificar contexto empresa/sucursal (saltar para la pagina de seleccion)
    if (!skipContextCheck && !contextoListo) {
        return <Navigate to="/seleccionar-contexto" replace />;
    }

    if (requierePrograma && !tieneAccesoPrograma(requierePrograma)) {
        return <Navigate to="/sin-acceso" replace />;
    }

    if (requierePermiso && !tienePermiso(requierePermiso)) {
        return <Navigate to="/sin-acceso" replace />;
    }

    const rutaActual = location.pathname;
    const rutaConfig = RUTA_PROGRAMA.find(r => rutaActual.startsWith(r.path));
    if (rutaConfig && !tieneAccesoPrograma(rutaConfig.codigo)) {
        return <Navigate to="/sin-acceso" replace />;
    }

    return children;
};

export default ProtectedRoute;
