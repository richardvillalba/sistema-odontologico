import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper function to recursively convert object keys to lowercase
const keysToLowerCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => keysToLowerCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            result[key.toLowerCase()] = keysToLowerCase(obj[key]);
            return result;
        }, {});
    }
    return obj;
};

// Response interceptor to standardize ORDS keys (uppercase) to frontend expectations (lowercase)
api.interceptors.response.use(
    (response) => {
        if (response.data) {
            response.data = keysToLowerCase(response.data);
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const pacientesService = {
    // GET
    getAll: (params) => api.get('/pacientes', { params }),
    getById: (id) => api.get(`/pacientes/${id}`),
    search: (q) => api.get(`/pacientes/buscar/${encodeURIComponent(q)}`),
    // POST/PUT/DELETE
    create: (data) => api.post('/pacientes', data),
    update: (id, data) => api.put(`/pacientes/${id}`, data),
    delete: (id) => api.delete(`/pacientes/${id}`),
};

export const citasService = {
    // GET
    getAll: (params) => api.get('/citas', { params }),
    getById: (id) => api.get(`/citas/${id}`),
    getAgenda: (doctorId, fecha) =>
        api.get(`/citas/agenda/${doctorId}`, { params: { fecha } }),
    // POST/PUT/DELETE
    create: (data) => api.post('/citas', data),
    update: (id, data) => api.put(`/citas/${id}`, data),
    cambiarEstado: (id, estado, motivo) =>
        api.put(`/citas/${id}/estado`, { estado, motivo_cancelacion: motivo }),
    cancelar: (id, motivo) => api.delete(`/citas/${id}`, { data: { motivo } }),
};

export const tratamientosService = {
    // GET
    getCatalogo: () => api.get('/tratamientos/catalogo'),
    getByPaciente: (pacienteId) =>
        api.get(`/tratamientos/paciente/${pacienteId}`),
    // POST/PUT
    asignar: (data) => api.post('/tratamientos/asignar', data),
    update: (id, data) => api.put(`/tratamientos/paciente/${id}/update`, data),
    cambiarEstado: (id, estado) =>
        api.put(`/tratamientos/paciente/${id}/estado`, { estado }),
    registrarSesion: (id, data) =>
        api.post(`/tratamientos/paciente/${id}/sesion`, data),
};

export const historiasService = {
    // GET
    getById: (id) => api.get(`/historias/${id}`),
    getByPaciente: (pacienteId) =>
        api.get(`/historias/paciente/${pacienteId}`),
    // POST/PUT
    create: (data) => api.post('/historias', data),
    update: (id, data) => api.put(`/historias/${id}`, data),
    agregarPrescripcion: (id, data) =>
        api.post(`/historias/${id}/prescripcion`, data),
};

export const doctoresService = {
    getAll: () => api.get('/doctores'),
};

// =====================================
// ODONTOGRAMA - Módulo Principal
// =====================================
export const odontogramaService = {
    // GET - Lectura
    getActual: (pacienteId) => api.get(`/odontograma/paciente/${pacienteId}`),
    getById: (id) => api.get(`/odontograma/${id}`),
    getHistorial: (pacienteId) => api.get(`/odontograma/historial/${pacienteId}`),
    getResumen: (id) => api.get(`/odontograma/${id}/resumen`),
    getHallazgosDiente: (dienteId) => api.get(`/odontograma/diente/${dienteId}/hallazgos`),
    getTratamientosDiente: (dienteId) => api.get(`/odontograma/diente/${dienteId}/tratamientos`),
    getTratamientosPaciente: (pacienteId) => api.get(`/odontograma/tratamientos/paciente/${pacienteId}`),
    getTratamientosSugeridos: (tipoHallazgo) => api.get(`/tratamientos/sugeridos/${tipoHallazgo}`),

    // POST - Crear
    create: (data) => api.post('/odontograma', data),
    registrarHallazgo: (data) => api.post('/odontograma/hallazgo', data),
    asignarTratamiento: (dienteId, catalogoId, doctorId = 1) =>
        api.post(`/odontograma/diente/${dienteId}/tratamiento`, { catalogo_id: catalogoId, doctor_id: doctorId }),

    // PUT - Actualizar
    actualizarDiente: (odontogramaId, data) =>
        api.put(`/odontograma/${odontogramaId}/diente`, data),
    actualizarDientesBulk: (odontogramaId, data) =>
        api.put(`/odontograma/${odontogramaId}/dientes`, data),

    // DELETE
    eliminarTratamiento: (tratamientoId) =>
        api.delete(`/odontograma/tratamiento/${tratamientoId}`),
};

export const usersService = {
    getAll: () => api.get('/facturas/usuarios'),
    getById: (id) => api.get(`/facturas/usuarios/${id}`),
    create: (data) => api.post('/facturas/usuarios', data),
    update: (id, data) => api.put(`/facturas/usuarios/${id}`, data),
    setActivo: (id, activo, modificadoPor) =>
        api.put(`/facturas/usuarios/${id}/activo`, { activo, modificado_por: modificadoPor }),
    resetPassword: (id, passwordNuevo, adminId) =>
        api.post(`/facturas/usuarios/${id}/reset-password`, { password_nuevo: passwordNuevo, admin_id: adminId }),
    asignarRol: (id, rolId, asignadoPor) =>
        api.put(`/facturas/usuarios/${id}/rol`, { rol_id: rolId, asignado_por: asignadoPor }),
};

export const empresaService = {
    get: () => api.get('/facturas/empresa'),
    update: (data) => api.put('/facturas/empresa', data),
};

// ========================================
// AUTHENTICATION MODULE
// ========================================
export const authService = {
    // Login
    login: (username, password) =>
        api.post('/facturas/auth/login', { username, password }),
    // Obtener datos completos del usuario con programas y permisos
    getMe: (usuarioId) => api.get(`/facturas/auth/me/${usuarioId}`),
};

// ========================================
// SECURITY & ROLES MODULE
// ========================================
export const rolesService = {
    // GET
    getAll: () => api.get('/facturas/roles'),
    getById: (id) => api.get(`/facturas/roles/${id}`),
    getProgramas: (rolId) => api.get(`/facturas/roles/${rolId}/programas`),
    getPermisos: (rolId) => api.get(`/facturas/roles/${rolId}/permisos`),
    // POST/PUT/DELETE
    create: (data) => api.post('/facturas/roles', data),
    update: (id, data) => api.put(`/facturas/roles/${id}`, data),
    delete: (id) => api.delete(`/facturas/roles/${id}`),
    asignarPrograma: (rolId, programaId) =>
        api.post(`/facturas/roles/${rolId}/programas`, { programa_id: programaId }),
    quitarPrograma: (rolId, programaId) =>
        api.delete(`/facturas/roles/${rolId}/programas/${programaId}`),
    asignarPermiso: (rolId, permisoId) =>
        api.post(`/facturas/roles/${rolId}/permisos`, { permiso_id: permisoId }),
    quitarPermiso: (rolId, permisoId) =>
        api.delete(`/facturas/roles/${rolId}/permisos/${permisoId}`),
};

export const securityService = {
    // Programas y permisos del usuario
    getProgramasUsuario: (usuarioId) => api.get(`/facturas/usuarios/${usuarioId}/programas`),
    getPermisosUsuario: (usuarioId) => api.get(`/facturas/usuarios/${usuarioId}/permisos`),
    tienePermiso: (usuarioId, codigo) => api.get(`/facturas/usuarios/${usuarioId}/tiene-permiso/${codigo}`),
    // Asignar rol a usuario
    asignarRol: (usuarioId, rolId) => api.put(`/facturas/usuarios/${usuarioId}/rol`, { rol_id: rolId }),
    // Listas generales
    getAllProgramas: () => api.get('/facturas/programas'),
    getAllPermisos: () => api.get('/facturas/permisos'),
};

export const billingService = {
    // Timbrados
    getTimbrados: (empresaId, activo = null) =>
        api.get(`/facturas/timbrados`, { params: { empresa_id: empresaId, activo } }),
    getAlertasTimbrados: (empresaId, diasAlerta = 30, margenNumeros = 100, usuarioId = null) =>
        api.get(`/facturas/timbrados/alertas`, {
            params: {
                empresa_id: empresaId,
                dias_alerta: diasAlerta,
                margen_numeros: margenNumeros,
                usuario_id: usuarioId
            }
        }),
    createTimbrado: (data) => api.post('/facturas/timbrados', data),
    updateTimbrado: (id, data) => api.put(`/facturas/timbrados/${id}`, { ...data, modificado_por: 1 }),
    toggleTimbradoStatus: (id, activo) => api.put(`/facturas/timbrados/${id}/status`, { activo, modificado_por: 1 }),

    // Asignaciones
    getUsuariosTimbrado: (timbradoId) => api.get(`/facturas/timbrados/${timbradoId}/usuarios`),
    getPuntosUsuario: (usuarioId) => api.get(`/facturas/usuarios/${usuarioId}/puntos`),
    getPointsByUsuario: (usuarioId) => api.get(`/facturas/usuarios/${usuarioId}/puntos`),
    asignarPuntoUsuario: (usuarioId, timbradoId, asignadoPor = 1) =>
        api.post(`/facturas/usuarios/${usuarioId}/puntos`, { timbrado_id: timbradoId, asignado_por: asignadoPor }),
    quitarPuntoUsuario: (usuarioId, timbradoId) =>
        api.delete(`/facturas/usuarios/${usuarioId}/puntos`, { data: { timbrado_id: timbradoId } }),

    // Facturas
    getFacturas: (params) => api.get('/facturas/lista', { params }), // params: empresa_id, estado, fecha_desde, fecha_hasta
    getFacturaById: (id) => api.get(`/facturas/factura/${id}`),
    getFacturaDetalles: (id) => api.get(`/facturas/factura/${id}/detalles`),
    getFacturaPagos: (id) => api.get(`/facturas/factura/${id}/pagos`),
    createFactura: (data) => api.post('/facturas/factura', data),
    addFacturaDetalle: (id, data) => api.post(`/facturas/factura/${id}/detalles`, data),
    confirmarFactura: (id) => api.put(`/facturas/factura/${id}/calcular`),
    anularFactura: (id, motivo) => api.put(`/facturas/factura/${id}/anular`, { motivo, anulado_por: 1 }),

    // Pagos
    registrarPago: (facturaId, data) => api.post(`/facturas/factura/${facturaId}/pagos`, data),
    anularPago: (pagoId, motivo) => api.put(`/facturas/pago/${pagoId}/anular`, { motivo, anulado_por: 1 }),

    // Cuotas
    getCuotasFactura: (facturaId) => api.get(`/facturas/factura/${facturaId}/cuotas`),
    generarCuotas: (facturaId, data) => api.post(`/facturas/factura/${facturaId}/cuotas`, data),
    pagarCuota: (cuotaId, data) => api.post(`/facturas/cuota/${cuotaId}/registrar-pago`, data),
    getAlertasCuotas: (empresaId, diasAlerta = 7) =>
        api.get(`/facturas/cuotas/alertas`, { params: { empresa_id: empresaId, dias_alerta: diasAlerta } }),

    // Pacientes
    getFacturasPaciente: (pacienteId) => api.get(`/facturas/paciente/${pacienteId}/facturas`),
    getCuentaCorrientePaciente: (pacienteId) => api.get(`/facturas/paciente/${pacienteId}/cuenta-corriente`),
};

// ========================================
// MÓDULO DE CAJA
// ========================================
export const cajaService = {
    // Cajas
    listar: (empresaId, estado = null) => {
        const params = { empresa_id: empresaId };
        if (estado) params.estado = estado;
        return api.get('/facturas/caja', { params });
    },
    getById: (id) => api.get(`/facturas/caja/${id}`),
    crear: (data) => api.post('/facturas/caja', data),
    editar: (id, data) => api.put(`/facturas/caja/${id}`, data),
    abrir: (id, data) => api.post(`/facturas/caja/${id}/abrir`, data),
    cerrar: (id, data) => api.post(`/facturas/caja/${id}/cerrar`, data),

    // Movimientos
    getMovimientos: (cajaId, params = {}) =>
        api.get(`/facturas/caja/${cajaId}/movimientos`, { params }),
    registrarMovimiento: (cajaId, data) =>
        api.post(`/facturas/caja/${cajaId}/movimientos`, data),
    getResumen: (cajaId) => api.get(`/facturas/caja/${cajaId}/resumen`),

    // Categorías
    getCategorias: (tipo = null) => {
        const params = {};
        if (tipo) params.tipo = tipo;
        return api.get('/facturas/caja/categorias', { params });
    },
};

export default api;
