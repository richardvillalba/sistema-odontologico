import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [programas, setProgramas] = useState([]);
    const [permisos, setPermisos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Verificar si hay sesión guardada
        verificarSesion();
    }, []);

    const verificarSesion = async () => {
        try {
            const usuarioGuardado = localStorage.getItem('usuario');
            if (usuarioGuardado) {
                const userData = JSON.parse(usuarioGuardado);
                // Cargar datos completos del usuario
                await cargarDatosUsuario(userData.usuario_id);
            }
        } catch (error) {
            console.error('Error verificando sesión:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const cargarDatosUsuario = async (usuarioId) => {
        try {
            const response = await authService.getMe(usuarioId);

            // El endpoint retorna { items: [...] }
            const userData = response.data.items && response.data.items.length > 0
                ? response.data.items[0]
                : null;

            if (!userData) {
                throw new Error('No se encontraron datos del usuario');
            }

            setUsuario(userData);
            // Por ahora, programas y permisos vacíos (hasta implementar las tablas)
            setProgramas([]);
            setPermisos([]);
            setIsAuthenticated(true);

            // Guardar en localStorage
            localStorage.setItem('usuario', JSON.stringify(userData));
        } catch (error) {
            console.error('Error cargando datos de usuario:', error);
            throw error;
        }
    };

    const login = async (username, password) => {
        try {
            const response = await authService.login(username, password);

            if (response.data.resultado === 1) {
                // Login exitoso, cargar datos completos
                await cargarDatosUsuario(response.data.usuario_id);
                return { success: true, mensaje: response.data.mensaje };
            } else {
                return { success: false, mensaje: response.data.mensaje };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                mensaje: error.response?.data?.mensaje || 'Error al iniciar sesión'
            };
        }
    };

    const logout = () => {
        setUsuario(null);
        setProgramas([]);
        setPermisos([]);
        setIsAuthenticated(false);
        localStorage.removeItem('usuario');

        // Redirigir al login
        window.location.href = '/login';
    };

    const tieneAccesoPrograma = (codigoPrograma) => {
        if (!isAuthenticated) return false;

        // Si es superadmin, tiene acceso a todo
        if (usuario?.es_superadmin === 'S') return true;

        return programas.some(p => p.codigo === codigoPrograma);
    };

    const tienePermiso = (codigoPermiso) => {
        if (!isAuthenticated) return false;

        // Si es superadmin, tiene todos los permisos
        if (usuario?.es_superadmin === 'S') return true;

        return permisos.some(p => p.codigo === codigoPermiso);
    };

    const esSuperAdmin = () => {
        return usuario?.es_superadmin === 'S';
    };

    const value = {
        usuario,
        programas,
        permisos,
        loading,
        isAuthenticated,
        login,
        logout,
        tieneAccesoPrograma,
        tienePermiso,
        esSuperAdmin,
        recargarPermisos: () => cargarDatosUsuario(usuario?.usuario_id)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
