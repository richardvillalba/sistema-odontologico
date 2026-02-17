import axios from 'axios';

const API_URL = '/api/v1/compras/proveedores';

export const proveedoresService = {
  getAll: async (params = {}) => {
    const res = await axios.get(API_URL, { params });
    return res.data;
  },
  search: async (term) => {
    const res = await axios.get(API_URL, { params: { q: term } });
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post(`${API_URL}/crear`, data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await axios.put(`${API_URL}/${id}/actualizar`, data);
    return res.data;
  },
  toggleActivo: async (id, activo, usuario_id) => {
    if (activo) {
      // Inactivar
      const res = await axios.delete(`${API_URL}/${id}/desactivar`, { data: { usuario_id } });
      return res.data;
    } else {
      // Activar (puede requerir endpoint específico)
      const res = await axios.put(`${API_URL}/${id}/actualizar`, { activo: 'S', usuario_id });
      return res.data;
    }
  }
};
