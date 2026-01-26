import api from './api';
import { Paciente, PacienteFormData, ApiResponse, PaginationParams } from '../types';

const BASE_PATH = '/odo/pacientes';

export const pacientesService = {
    // Get all patients with pagination
    getAll: async (params?: PaginationParams): Promise<ApiResponse<Paciente>> => {
        const response = await api.get<ApiResponse<Paciente>>(BASE_PATH, { params });
        return response.data;
    },

    // Get single patient by ID
    getById: async (id: number): Promise<Paciente> => {
        const response = await api.get<Paciente>(`${BASE_PATH}/${id}`);
        return response.data;
    },

    // Create new patient
    create: async (data: PacienteFormData): Promise<Paciente> => {
        const response = await api.post<Paciente>(BASE_PATH, data);
        return response.data;
    },

    // Update existing patient
    update: async (id: number, data: Partial<PacienteFormData>): Promise<Paciente> => {
        const response = await api.put<Paciente>(`${BASE_PATH}/${id}`, data);
        return response.data;
    },

    // Delete patient (Logical delete usually, depending on backend impl)
    delete: async (id: number): Promise<void> => {
        await api.delete(`${BASE_PATH}/${id}`);
    },

    // Search patients by name or document
    search: async (query: string): Promise<ApiResponse<Paciente>> => {
        const response = await api.get<ApiResponse<Paciente>>(`${BASE_PATH}/search`, {
            params: { q: query }
        });
        return response.data;
    }
};
