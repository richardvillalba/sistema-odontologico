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
    const [empresas, setEmpresas] = useState([]);
    const [empresaActiva, setEmpresaActivaState] = useState(null);
    const [sucursalActiva, setSucursalActivaState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        verificarSesion();
    }, []);

    const verificarSesion = async () => {
        try {
            const usuarioGuardado = sessionStorage.getItem('usuario');
            if (usuarioGuardado) {
                const userData = JSON.parse(usuarioGuardado);
                await cargarDatosUsuario(userData.usuario_id);

                // Restaurar empresa y sucursal de sessionStorage
                const empresaGuardada = sessionStorage.getItem('empresa_activa');
                const sucursalGuardada = sessionStorage.getItem('sucursal_activa');
                if (empresaGuardada) {
                    const emp = JSON.parse(empresaGuardada);
                    setEmpresaActivaState(emp);
                    // Restaurar programas de la empresa activa si existen
                    if (emp.programas && emp.programas.length > 0) {
                        setProgramas(emp.programas);
                    }
                }
                if (sucursalGuardada) setSucursalActivaState(JSON.parse(sucursalGuardada));
            }
        } catch (error) {
            console.error('Error verificando sesion:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const cargarDatosUsuario = async (usuarioId) => {
        try {
            const response = await authService.getMe(usuarioId);
            const data = response.data;

            let userData;
            if (data.items && data.items.length > 0) {
                userData = data.items[0];
            } else if (data.usuario_id) {
                userData = data;
            } else {
                throw new Error('No se encontraron datos del usuario');
            }

            // Extraer programas y empresas del response
            const userProgramas = userData.programas || [];
            const userEmpresas = userData.empresas || [];
            delete userData.programas;
            delete userData.empresas;

            setUsuario(userData);
            setProgramas(userProgramas);
            setEmpresas(userEmpresas);
            setPermisos([]);
            setIsAuthenticated(true);

            sessionStorage.setItem('usuario', JSON.stringify(userData));
            sessionStorage.setItem('programas', JSON.stringify(userProgramas));

            // Auto-seleccionar empresa si tiene solo una
            if (userEmpresas.length === 1) {
                setEmpresaActiva(userEmpresas[0]);
            }
        } catch (error) {
            console.error('Error cargando datos de usuario:', error);
            throw error;
        }
    };

    const setEmpresaActiva = (empresa) => {
        setEmpresaActivaState(empresa);
        if (empresa) {
            sessionStorage.setItem('empresa_activa', JSON.stringify(empresa));
            // Usar programas específicos de la empresa si existen
            if (empresa.programas && empresa.programas.length > 0) {
                setProgramas(empresa.programas);
                sessionStorage.setItem('programas', JSON.stringify(empresa.programas));
            }
        } else {
            sessionStorage.removeItem('empresa_activa');
        }
        // Al cambiar empresa, limpiar sucursal
        setSucursalActivaState(null);
        sessionStorage.removeItem('sucursal_activa');
    };

    const setSucursalActiva = (sucursal) => {
        setSucursalActivaState(sucursal);
        if (sucursal) {
            sessionStorage.setItem('sucursal_activa', JSON.stringify(sucursal));
        } else {
            sessionStorage.removeItem('sucursal_activa');
        }
    };

    const login = async (username, password) => {
        try {
            const response = await authService.login(username, password);

            if (response.data.resultado === 1) {
                await cargarDatosUsuario(response.data.usuario_id);
                return { success: true, mensaje: response.data.mensaje };
            } else {
                return { success: false, mensaje: response.data.mensaje };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                mensaje: error.response?.data?.mensaje || 'Error al iniciar sesion'
            };
        }
    };

    const logout = () => {
        setUsuario(null);
        setProgramas([]);
        setPermisos([]);
        setEmpresas([]);
        setEmpresaActivaState(null);
        setSucursalActivaState(null);
        setIsAuthenticated(false);
        sessionStorage.removeItem('usuario');
        sessionStorage.removeItem('programas');
        sessionStorage.removeItem('empresa_activa');
        sessionStorage.removeItem('sucursal_activa');

        window.location.href = '/login';
    };

    const tieneAccesoPrograma = (codigoPrograma) => {
        if (!isAuthenticated) return false;
        if (usuario?.es_superadmin === 'S') return true;
        return programas.some(p => p.codigo === codigoPrograma);
    };

    const tienePermiso = (codigoPermiso) => {
        if (!isAuthenticated) return false;
        if (usuario?.es_superadmin === 'S') return true;
        return permisos.some(p => p.codigo === codigoPermiso);
    };

    const esSuperAdmin = () => {
        return usuario?.es_superadmin === 'S';
    };

    const contextoListo = !!empresaActiva && !!sucursalActiva;

    const value = {
        usuario,
        programas,
        permisos,
        empresas,
        empresaActiva,
        sucursalActiva,
        setEmpresaActiva,
        setSucursalActiva,
        contextoListo,
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
