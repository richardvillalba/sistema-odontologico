import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const pacientesService = {
    // GET
    getAll: (params) => api.get('/pacientes', { params }),
    getById: (id) => api.get(`/pacientes/${id}`),
    search: (q) => api.get('/pacientes/search', { params: { q } }),
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

export const authService = {
    login: (email, password, empresaId = 1) =>
        api.post('/auth/login', { email, password, empresa_id: empresaId }),
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

export default api;
