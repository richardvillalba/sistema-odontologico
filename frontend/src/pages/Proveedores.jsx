import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { comprasService, ubicacionesService } from '../services/api';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Proveedores() {
  const queryClient = useQueryClient();
  const { usuario } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProveedor, setEditProveedor] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => comprasService.getProveedores('ALL'), // Traer todos para filtrar localmente o por búsqueda
  });

  const proveedoresRaw = data?.data?.items || [];
  const proveedores = proveedoresRaw.filter(p =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ruc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nombre_contacto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upsertMutation = useMutation({
    mutationFn: (data) => comprasService.upsertProveedor(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['proveedores']);
      setShowForm(false);
    }
  });

  const handleAdd = () => {
    setEditProveedor(null);
    setShowForm(true);
  };

  const handleEdit = (prov) => {
    setEditProveedor(prov);
    setShowForm(true);
  };

  const handleSave = (formData) => {
    upsertMutation.mutate({
      ...formData,
      proveedor_id: editProveedor?.proveedor_id || null,
      usuario_id: usuario?.usuario_id
    });
  };

  const handleToggleActivo = (prov) => {
    upsertMutation.mutate({
      ...prov,
      activo: prov.activo === 'S' ? 'N' : 'S',
      usuario_id: usuario?.usuario_id
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Proveedores</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Gestión de proveedores, contactos y catastro técnico.</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span> <span className="hidden sm:inline">Nuevo</span> Proveedor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, RUC o contacto..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-0 text-slate-600 font-medium placeholder:text-slate-400"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Proveedores</p>
            <p className="text-2xl font-black">{proveedoresRaw.length}</p>
          </div>
          <div className="text-3xl relative z-10 opacity-50">🏢</div>
          <div className="absolute -right-4 -bottom-4 bg-white/5 w-24 h-24 rounded-full"></div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-24 text-center">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-bold animate-pulse">Cargando proveedores...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center">
            <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl inline-block mb-4">
              ⚠️ Error de conexión: {error.message}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Proveedor</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Información</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Contacto / Teléfono</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider text-center">Estado</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {proveedores.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-20 text-center">
                        <p className="text-slate-400 font-medium">No se encontraron proveedores.</p>
                      </td>
                    </tr>
                  ) : (
                    proveedores.map((prov) => (
                      <tr key={prov.proveedor_id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 leading-tight">{prov.nombre}</span>
                            <span className="text-xs text-slate-400 font-medium">{prov.ruc || 'Sin RUC'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-sm">
                            <span className="text-slate-600">{prov.direccion || 'Sin dirección'}</span>
                            <span className="text-xs text-slate-400">
                              {prov.barrio ? `${prov.barrio}, ` : ''}
                              {prov.ciudad}
                              {prov.departamento && ` - ${prov.departamento}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-sm">
                            <span className="font-semibold text-slate-700">{prov.nombre_contacto}</span>
                            <span className="text-slate-500">{prov.telefono}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${prov.activo === 'S' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                            {prov.activo === 'S' ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(prov)}
                              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleActivo(prov)}
                              className={`p-2 rounded-xl transition-all shadow-sm ${prov.activo === 'S' ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                              title={prov.activo === 'S' ? 'Desactivar' : 'Activar'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {prov.activo === 'S' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile card layout */}
            <div className="md:hidden divide-y divide-slate-100">
              {proveedores.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-3">🏢</div>
                  <p className="text-slate-400 font-medium">No se encontraron proveedores.</p>
                </div>
              ) : (
                proveedores.map((prov) => (
                  <div key={prov.proveedor_id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{prov.nombre}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${prov.activo === 'S' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {prov.activo === 'S' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{prov.ruc || 'Sin RUC'}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>👤 {prov.nombre_contacto || '-'}</span>
                      <span>📱 {prov.telefono || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(prov)}
                        className="flex-1 text-center text-xs font-bold text-blue-600 bg-blue-50 py-2 rounded-xl"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleToggleActivo(prov)}
                        className={`flex-1 text-center text-xs font-bold py-2 rounded-xl ${prov.activo === 'S' ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}
                      >
                        {prov.activo === 'S' ? '⛔ Desactivar' : '✅ Activar'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {showForm && (
        <ProveedorForm
          proveedor={editProveedor}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          isSaving={upsertMutation.isLoading}
        />
      )}
    </div>
  );
}

function ProveedorForm({ proveedor, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState({
    nombre: proveedor?.nombre || '',
    ruc: proveedor?.ruc || '',
    nombre_contacto: proveedor?.nombre_contacto || '',
    telefono: proveedor?.telefono || '',
    email: proveedor?.email || '',
    direccion: proveedor?.direccion || '',
    ciudad: proveedor?.ciudad || '',
    departamento: proveedor?.departamento || '',
    barrio: proveedor?.barrio || '',
    pais: proveedor?.pais || 'Paraguay',
    condiciones_pago: proveedor?.condiciones_pago || '',
    moneda: proveedor?.moneda || 'PYG',
    activo: proveedor?.activo || 'S'
  });

  // Queries for dynamic locations
  const { data: deptosRes } = useQuery({
    queryKey: ['departamentos'],
    queryFn: ubicacionesService.getDepartamentos,
    staleTime: Infinity
  });

  const { data: ciudadesRes } = useQuery({
    queryKey: ['ciudades', formData.departamento],
    queryFn: () => {
      const depto = deptosRes?.data?.items?.find(d => d.nombre === formData.departamento);
      return depto ? ubicacionesService.getCiudades(depto.departamento_id) : Promise.resolve({ data: { items: [] } });
    },
    enabled: !!formData.departamento && !!deptosRes?.data?.items
  });

  const { data: barriosRes } = useQuery({
    queryKey: ['barrios', formData.ciudad],
    queryFn: () => {
      const ciudad = ciudadesRes?.data?.items?.find(c => c.nombre === formData.ciudad);
      return ciudad ? ubicacionesService.getBarrios(ciudad.ciudad_id) : Promise.resolve({ data: { items: [] } });
    },
    enabled: !!formData.ciudad && !!ciudadesRes?.data?.items
  });

  const departamentos = deptosRes?.data?.items || [];
  const ciudades = ciudadesRes?.data?.items || [];
  const barrios = barriosRes?.data?.items || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // Cascading resets
      if (name === 'departamento') {
        newData.ciudad = '';
        newData.barrio = '';
      } else if (name === 'ciudad') {
        newData.barrio = '';
      }

      return newData;
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col"
      >
        <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
            <p className="text-slate-500 text-sm font-medium">Complete los datos de registro.</p>
          </div>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600">Información General</h3>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Nombre / Razón Social</label>
              <input
                name="nombre"
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700"
                placeholder="Ej. Importadora Dental S.A."
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">RUC</label>
              <input
                name="ruc"
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700"
                placeholder="80000000-0"
                value={formData.ruc}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Dirección</label>
              <input
                name="direccion"
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                placeholder="Calle principal #123"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Departamento</label>
                <select
                  name="departamento"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700"
                  value={formData.departamento}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {departamentos.map(d => (
                    <option key={d.departamento_id} value={d.nombre}>{d.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Ciudad</label>
                <select
                  name="ciudad"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                  value={formData.ciudad}
                  onChange={handleChange}
                  disabled={!formData.departamento}
                >
                  <option value="">Seleccione...</option>
                  {ciudades.map(c => (
                    <option key={c.ciudad_id} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Barrio</label>
              <select
                name="barrio"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-700 disabled:bg-slate-50 disabled:text-slate-400"
                value={formData.barrio}
                onChange={handleChange}
                disabled={!formData.ciudad}
              >
                <option value="">Seleccione...</option>
                {barrios.map(b => (
                  <option key={b.barrio_id} value={b.nombre}>{b.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600">Contacto y Crédito</h3>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Nombre de Contacto</label>
              <input
                name="nombre_contacto"
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                placeholder="Nombre de la persona"
                value={formData.nombre_contacto}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Teléfono</label>
              <input
                name="telefono"
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                placeholder="+595 ..."
                value={formData.telefono}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Email</label>
              <input
                name="email"
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                placeholder="email@proveedor.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Moneda</label>
                <select
                  name="moneda"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold"
                  value={formData.moneda}
                  onChange={handleChange}
                >
                  <option value="PYG">PYG (Guaraníes)</option>
                  <option value="USD">USD (Dólares)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Cond. Pago</label>
                <input
                  name="condiciones_pago"
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                  placeholder="Ejem: 30 días"
                  value={formData.condiciones_pago}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-6 border-t border-slate-100 flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Guardando...</span>
              </div>
            ) : 'Guardar Proveedor'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all"
            disabled={isSaving}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
