import axios from 'axios';
import { API_BASE_URL, IS_PRODUCTION } from '../config/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// En producción, reescribir URLs para coincidir con la estructura de ORDS:
// - /facturas/* → se sirve en la raíz de ORDS: ORDS_BASE/facturas/...
// - Todo lo demás necesita prefijo /api/v1: ORDS_BASE/api/v1/pacientes/...
if (IS_PRODUCTION) {
    api.interceptors.request.use((config) => {
        if (config.url && !config.url.startsWith('/facturas')) {
            config.url = '/api/v1' + config.url;
        }
        return config;
    });
}

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
    getAll: (params) => api.get('/pacientes', { params }),
    getById: (id) => api.get(`/pacientes/${id}`),
    search: (q, params) => api.get(`/pacientes/buscar/${encodeURIComponent(q)}`, { params }),
    create: (data) => api.post('/pacientes', data),
    update: (id, data) => api.put(`/pacientes/${id}`, data),
    delete: (id) => api.delete(`/pacientes/${id}`),
};

export const citasService = {
    getAll: (params) => api.get('/citas', { params }),
    getById: (id) => api.get(`/citas/${id}`),
    getAgenda: (doctorId, fecha) =>
        api.get(`/citas/agenda/${doctorId}`, { params: { fecha } }),
    create: (data) => api.post('/citas', data),
    update: (id, data) => api.put(`/citas/${id}`, data),
    cambiarEstado: (id, estado, motivo) =>
        api.put(`/citas/${id}/estado`, { estado, motivo_cancelacion: motivo }),
    cancelar: (id, motivo) => api.delete(`/citas/${id}`, { data: { motivo } }),
};

export const tratamientosService = {
    getCatalogo: (empresaId) => api.get('/tratamientos/catalogo', { params: { empresa_id: empresaId } }),
    createCatalogo: (data) => api.post('/tratamientos/catalogo', data), // empresa_id should be in data
    updateCatalogo: (id, data) => api.put(`/tratamientos/catalogo/${id}`, data), // empresa_id should be in data
    getByPaciente: (pacienteId, empresaId) =>
        api.get(`/tratamientos/paciente/${pacienteId}`, { params: { empresa_id: empresaId } }),
    asignar: (data) => api.post('/tratamientos/asignar', data), // empresa_id should be in data
    update: (id, data) => api.put(`/tratamientos/paciente/${id}/update`, data),
    cambiarEstado: (id, estado) =>
        api.put(`/tratamientos/paciente/${id}/estado`, { estado }),
    registrarSesion: (id, data) =>
        api.post(`/tratamientos/paciente/${id}/sesion`, data),
};

export const historiasService = {
    getById: (id, empresaId) => api.get(`/historias/${id}`, { params: { empresa_id: empresaId } }),
    getByPaciente: (pacienteId, empresaId, params = {}) =>
        api.get(`/historias/paciente/${pacienteId}`, { params: { empresa_id: empresaId, ...params } }),
    create: (data) => api.post('/historias', data),
    update: (id, data) => api.put(`/historias/${id}`, data),
    getPrescripciones: (id, empresaId) => api.get(`/historias/${id}/prescripciones`, { params: { empresa_id: empresaId } }),
    agregarPrescripcion: (id, data) =>
        api.post(`/historias/${id}/prescripciones`, data),
};

export const doctoresService = {
    getAll: () => api.get('/doctores'),
};

export const odontogramaService = {
    getActual: (pacienteId, empresaId) => api.get(`/odontograma/paciente/${pacienteId}`, { params: { empresa_id: empresaId } }),
    getById: (id) => api.get(`/odontograma/${id}`),
    getHistorial: (pacienteId, empresaId) => api.get(`/odontograma/historial/${pacienteId}`, { params: { empresa_id: empresaId } }),
    getResumen: (id) => api.get(`/odontograma/${id}/resumen`),
    getHallazgosDiente: (dienteId) => api.get(`/odontograma/diente/${dienteId}/hallazgos`),
    getHallazgosAll: (pacienteId, empresaId) => api.get(`/odontograma/paciente/${pacienteId}/hallazgos-all`, { params: { empresa_id: empresaId } }),
    getTratamientosDiente: (dienteId) => api.get(`/odontograma/diente/${dienteId}/tratamientos`),
    getTratamientosPaciente: (pacienteId, empresaId) => api.get(`/odontograma/tratamientos/paciente/${pacienteId}`, { params: { empresa_id: empresaId } }),
    getTratamientosSugeridos: (tipoHallazgo) => api.get(`/tratamientos/sugeridos/${tipoHallazgo}`),
    create: (data) => api.post('/odontograma', data),
    registrarHallazgo: (data) => api.post('/odontograma/hallazgo', data),
    asignarTratamiento: (dienteId, catalogoId, doctorId) =>
        api.post(`/odontograma/diente/${dienteId}/tratamiento`, { catalogo_id: catalogoId, doctor_id: doctorId }),
    actualizarDiente: (odontogramaId, data) =>
        api.put(`/odontograma/${odontogramaId}/diente`, data),
    actualizarDientesBulk: (odontogramaId, data) =>
        api.put(`/odontograma/${odontogramaId}/dientes`, data),
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
    getById: (id) => api.get(`/facturas/empresa/${id}`),
    update: (id, data) => api.put(`/facturas/empresa/${id}`, data),
};

export const authService = {
    login: (username, password) =>
        api.post('/facturas/auth/login', { username, password }),
    getMe: (usuarioId) => api.get(`/facturas/auth/me/${usuarioId}`),
    getSucursales: (usuarioId, empresaId) =>
        api.get(`/facturas/auth/usuario/${usuarioId}/sucursales`, { params: { empresa_id: empresaId } }),
};

export const rolesService = {
    getAll: () => api.get('/facturas/roles'),
    getById: (id) => api.get(`/facturas/roles/${id}`),
    getProgramas: (rolId) => api.get(`/facturas/roles/${rolId}/programas`),
    getPermisos: (rolId) => api.get(`/facturas/roles/${rolId}/permisos`),
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
    getProgramasUsuario: (usuarioId) => api.get(`/facturas/usuarios/${usuarioId}/programas`),
    getPermisosUsuario: (usuarioId) => api.get(`/facturas/usuarios/${usuarioId}/permisos`),
    tienePermiso: (usuarioId, codigo) => api.get(`/facturas/usuarios/${usuarioId}/tiene-permiso/${codigo}`),
    asignarRol: (usuarioId, rolId) => api.put(`/facturas/usuarios/${usuarioId}/rol`, { rol_id: rolId }),
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
    updateTimbrado: (id, data) => api.put(`/facturas/timbrados/${id}`, data),
    toggleTimbradoStatus: (id, activo, modificadoPor) => api.put(`/facturas/timbrados/${id}/status`, { activo, modificado_por: modificadoPor }),
    actualizarContadorRecibo: (id, numeroReciboActual) => api.put(`/facturas/timbrados/${id}/recibo-contador`, { numero_recibo_actual: numeroReciboActual }),

    // Asignaciones
    getUsuariosTimbrado: (timbradoId) => api.get(`/facturas/timbrados/${timbradoId}/usuarios`),
    getPointsByUsuario: (usuarioId) => api.get(`/facturas/usuarios/${usuarioId}/puntos`),
    asignarPuntoUsuario: (usuarioId, timbradoId, asignadoPor) =>
        api.post(`/facturas/usuarios/${usuarioId}/puntos`, { timbrado_id: timbradoId, asignado_por: asignadoPor }),
    quitarPuntoUsuario: (usuarioId, timbradoId) =>
        api.delete(`/facturas/usuarios/${usuarioId}/puntos/${timbradoId}`),

    // Facturas
    getFacturas: (params) => api.get('/facturas/lista', { params }),
    getFacturaById: (id) => api.get(`/facturas/factura/${id}`),
    getFacturaDetalles: (id) => api.get(`/facturas/factura/${id}/detalles`),
    getFacturaPagos: (id) => api.get(`/facturas/factura/${id}/pagos`),
    createFactura: (data) => api.post('/facturas/factura', data),
    addFacturaDetalle: (id, data) => api.post(`/facturas/factura/${id}/detalles`, data),
    confirmarFactura: (id) => api.put(`/facturas/factura/${id}/calcular`),
    anularFactura: (id, motivo, anuladoPor) => api.put(`/facturas/factura/${id}/anular`, { motivo, anulado_por: anuladoPor }),

    // Pagos
    registrarPago: (facturaId, data) => api.post(`/facturas/factura/${facturaId}/pagos`, data),
    anularPago: (pagoId, motivo, anuladoPor) => api.put(`/facturas/pago/${pagoId}/anular`, { motivo, anulado_por: anuladoPor }),

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

export const cajaService = {
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
    getMovimientos: (cajaId, params = {}) =>
        api.get(`/facturas/caja/${cajaId}/movimientos`, { params }),
    registrarMovimiento: (cajaId, data) =>
        api.post(`/facturas/caja/${cajaId}/movimientos`, data),
    getResumen: (cajaId) => api.get(`/facturas/caja/${cajaId}/resumen`),
    getCategorias: (tipo = null) => {
        const params = {};
        if (tipo) params.tipo = tipo;
        return api.get('/facturas/caja/categorias', { params });
    },
    pendientesArqueo: (empresaId, usuarioId) =>
        api.get('/facturas/caja/pendientes-arqueo', { params: { empresa_id: empresaId, usuario_id: usuarioId } }),
};

export const dashboardService = {
    getStats: (empresaId) => api.get('/facturas/dashboard/stats', { params: { empresa_id: empresaId } }),
    getActividadSemanal: (empresaId) => api.get('/facturas/dashboard/actividad-semanal', { params: { empresa_id: empresaId } }),
};

export const comprasService = {
    // Proveedores
    getProveedores: (activo = 'S') => api.get('/compras/proveedores', { params: { activo: activo === 'ALL' ? null : activo } }),
    upsertProveedor: (data) => api.post('/compras/proveedores', data),

    // Artículos y Categorías
    getArticulos: (categoriaId = null, activo = 'S') =>
        api.get('/compras/articulos', { params: { categoria_id: categoriaId, activo: activo === 'ALL' ? null : activo } }),
    upsertArticulo: (data) => api.post('/compras/articulos', data),
    getCategorias: () => api.get('/compras/categorias'),
    upsertCategoria: (data) => api.post('/compras/categorias', data),
    deleteCategoria: (id) => api.delete(`/compras/categorias/${id}`),

    getUnidadesMedida: () => api.get('/compras/unidades-medida'),

    // Facturas de Compra
    getFacturasCompra: (empresaId, sucursalId = null) =>
        api.get('/compras/facturas', { params: { empresa_id: empresaId, ...(sucursalId ? { sucursal_id: sucursalId } : {}) } }),
    registrarFactura: (data) => api.post('/compras/facturas', data),
    anularFactura: (id, usuarioId) => api.delete(`/compras/facturas/${id}`, { params: { usuario_id: usuarioId } }),
};

export const inventarioService = {
    getStock: (empresaId, sucursalId = null, articuloId = null) =>
        api.get('/compras/inventario', { params: { empresa_id: empresaId, sucursal_id: sucursalId, articulo_id: articuloId } }),
    registrarMovimiento: (data) => api.post('/compras/inventario/movimiento', data),
};

export const empresasService = {
    getAll: () => api.get('/facturas/empresas'),
    create: (data) => api.post('/facturas/empresas', data),
    toggleStatus: (id, activo, modificadoPor) =>
        api.put(`/facturas/empresas/${id}/status`, { activo, modificado_por: modificadoPor }),
    getUsuarios: (empresaId) => api.get(`/facturas/empresas/${empresaId}/usuarios`),
    getUsuariosDisponibles: (empresaId) => api.get('/facturas/usuarios-disponibles', { params: { empresa_id: empresaId } }),
    asignarUsuario: (empresaId, usuarioId, esPrincipal, asignadoPor, rolId) =>
        api.post(`/facturas/empresas/${empresaId}/usuarios`, { usuario_id: usuarioId, es_principal: esPrincipal, asignado_por: asignadoPor, rol_id: rolId }),
    quitarUsuario: (empresaId, usuarioId) =>
        api.delete(`/facturas/empresas/${empresaId}/usuarios/${usuarioId}`),
};

export const sucursalesService = {
    getAll: (empresaId) => api.get('/facturas/sucursales', { params: { empresa_id: empresaId } }),
    create: (data) => api.post('/facturas/sucursales', data),
    update: (id, data) => api.put(`/facturas/sucursales/${id}`, data),
    toggleStatus: (id, activo, modificadoPor) =>
        api.put(`/facturas/sucursales/${id}/status`, { activo, modificado_por: modificadoPor }),
    getUsuarios: (sucursalId) => api.get(`/facturas/sucursales/${sucursalId}/usuarios`),
    getUsuariosDisponibles: (sucursalId) => api.get(`/facturas/sucursales/${sucursalId}/usuarios-disponibles`),
    asignarUsuario: (sucursalId, usuarioId, esPrincipal, asignadoPor) =>
        api.post(`/facturas/sucursales/${sucursalId}/usuarios`, { usuario_id: usuarioId, es_principal: esPrincipal, asignado_por: asignadoPor }),
    quitarUsuario: (sucursalId, usuarioId) =>
        api.delete(`/facturas/sucursales/${sucursalId}/usuarios/${usuarioId}`),
};

export const reportesService = {
    getResumenFinanciero: (params) => api.get('/facturas/reportes/financiero', { params }),
    getResumenCitas: (params) => api.get('/facturas/reportes/citas', { params }),
    getResumenPacientes: (params) => api.get('/facturas/reportes/pacientes', { params }),
    getResumenInventario: (params) => api.get('/facturas/reportes/inventario', { params }),
};

export const whatsappService = {
    getConfig: (empresaId) => api.get('/whatsapp/config', { params: { empresa_id: empresaId } }),
    saveConfig: (data) => api.post('/whatsapp/config', data),
    getMensajes: (empresaId) => api.get('/whatsapp/mensajes', { params: { empresa_id: empresaId } }),
    // enviarMensaje y ejecutarCron van al serverless Vercel (misma origin), no a ORDS
    enviarMensaje: (data) => axios.post('/api/whatsapp/send', data),
    ejecutarCron: () => axios.get('/api/whatsapp/cron'),
};

export const ubicacionesService = {
    getDepartamentos: () => api.get('/ubicaciones/departamentos'),
    getCiudades: (departamentoId) => api.get('/ubicaciones/ciudades', { params: { departamento_id: departamentoId } }),
    getBarrios: (ciudadId) => api.get('/ubicaciones/barrios', { params: { ciudad_id: ciudadId } }),
};

export default api;
