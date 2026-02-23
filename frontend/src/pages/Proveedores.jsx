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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Section Standardized */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
            Catastro de <span className="text-primary">Proveedores</span>
          </h1>
          <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Gestión de alianzas estratégicas y suministros técnicos</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all flex items-center gap-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Vincular</span> Proveedor
        </button>
      </div>

      {/* Search and Stats Standardized */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-surface-card rounded-[2rem] border border-border flex items-center px-6 shadow-sm">
          <svg className="w-5 h-5 text-text-secondary opacity-30 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Filtrar por razón social, identificador fiscal o contacto..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-text-primary placeholder:text-text-secondary/30 py-4"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-primary-dark rounded-[2.5rem] p-8 flex items-center justify-between text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-white/40 mb-1">Proveedores Certificados</p>
            <p className="text-4xl font-black">{proveedoresRaw.length}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center relative z-10">
            <svg className="w-8 h-8 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="absolute -right-4 -bottom-4 bg-white/5 w-32 h-32 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
        </div>
      </div>

      {/* List and Tables Standardized */}
      <div className="bg-surface-card rounded-[3rem] border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-32 text-center animate-pulse flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-black text-text-secondary uppercase tracking-[0.2em] text-[10px] opacity-40">Consultando Registro Nacional de Proveedores...</p>
          </div>
        ) : isError ? (
          <div className="p-20 text-center space-y-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-[2rem] bg-danger/10 text-danger flex items-center justify-center text-3xl border border-danger/20 shadow-inner">⚠️</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">Interrupción del Servicio</h2>
              <p className="text-text-secondary font-medium max-w-sm mx-auto">{error.message}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table Standardized */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-raised/50 border-b border-border">
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40">Identificación / Razón Social</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40">Ubicación Geográfica</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40">Enlace Operativo</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40 text-center">Estado</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {proveedores.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-32 text-center">
                        <div className="w-20 h-20 bg-surface-raised rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-border">🏢</div>
                        <p className="text-text-secondary font-black uppercase text-[10px] tracking-widest opacity-40">Sin proveedores registrados en el sistema</p>
                      </td>
                    </tr>
                  ) : (
                    proveedores.map((prov) => (
                      <tr key={prov.proveedor_id} className="hover:bg-surface-raised/30 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-text-primary text-sm tracking-tight leading-tight mb-1">{prov.nombre}</span>
                            <span className="text-[10px] text-primary font-black tracking-widest uppercase opacity-60">{prov.ruc || 'Sin Identificador Fiscal'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-text-primary">{prov.direccion || 'Sin domicilio registrado'}</span>
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-tight opacity-40 leading-tight">
                              {prov.barrio ? `${prov.barrio}, ` : ''}{prov.ciudad}{prov.departamento && ` - ${prov.departamento}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-black text-text-primary uppercase tracking-tight">{prov.nombre_contacto || 'Punto de contacto no definido'}</span>
                            <span className="text-[10px] font-black text-primary tracking-widest opacity-60 italic">{prov.telefono || 'Sin terminal telefónica'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors ${prov.activo === 'S' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                            {prov.activo === 'S' ? 'Certificado' : 'Revocado'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                            <button
                              onClick={() => handleEdit(prov)}
                              className="p-3 rounded-2xl bg-surface-card text-primary border border-primary/20 hover:bg-primary-dark hover:text-white transition-all shadow-sm"
                              title="Editar Expediente"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleActivo(prov)}
                              className={`p-3 rounded-2xl transition-all shadow-sm border ${prov.activo === 'S' ? 'bg-danger/10 text-danger border-danger/20 hover:bg-danger hover:text-white' : 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary hover:text-white'}`}
                              title={prov.activo === 'S' ? 'Revocar Certificación' : 'Restablecer Certificación'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {prov.activo === 'S' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

            {/* Mobile Cards Standardized */}
            <div className="md:hidden divide-y divide-border/50">
              {proveedores.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="text-4xl mb-4 opacity-20">🏢</div>
                  <p className="text-text-secondary font-black text-[10px] uppercase tracking-widest opacity-40">No se encontraron proveedores</p>
                </div>
              ) : (
                proveedores.map((prov) => (
                  <div key={prov.proveedor_id} className="p-8 space-y-6 hover:bg-surface-raised/30 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-black text-text-primary text-sm tracking-tight leading-tight">{prov.nombre}</h4>
                        <p className="text-[10px] text-primary font-black tracking-widest uppercase opacity-60">{prov.ruc || 'Sin RUC'}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors ${prov.activo === 'S' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                        {prov.activo === 'S' ? 'Certificado' : 'Revocado'}
                      </span>
                    </div>
                    <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-4 shadow-inner">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-surface-raised flex items-center justify-center text-text-secondary opacity-40">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="text-[10px] font-bold text-text-primary uppercase tracking-tight">{prov.nombre_contacto || '-'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-surface-raised flex items-center justify-center text-text-secondary opacity-40">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <span className="text-[10px] font-black text-primary tracking-widest">{prov.telefono || '-'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(prov)}
                        className="flex-1 bg-surface-card text-primary border-2 border-primary/20 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-dark hover:text-white hover:border-primary-dark transition-all active:scale-95 shadow-sm"
                      >
                        Gestionar Expediente
                      </button>
                      <button
                        onClick={() => handleToggleActivo(prov)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-95 border ${prov.activo === 'S' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-secondary/10 text-secondary border-secondary/20'}`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {prov.activo === 'S' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
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
          isSaving={upsertMutation.isPending}
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
    <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-surface-card rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 flex flex-col max-h-[90vh]"
      >
        {/* Header Modal Standardized */}
        <div className="bg-surface-raised p-8 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">
              {proveedor ? 'Expediente' : 'Nueva'} <span className="text-primary">Alianza</span>
            </h2>
            <p className="text-text-secondary font-black mt-1 text-[10px] uppercase tracking-widest opacity-40">Registro de Proveedor Certificado</p>
          </div>
          <button type="button" onClick={onCancel} className="w-12 h-12 rounded-2xl bg-surface-card flex items-center justify-center text-text-secondary hover:text-danger hover:bg-danger/10 transition-all border border-border">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Section Standardized */}
        <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar">
          {/* General Information */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary opacity-40">Identificación Corporativa</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Razón Social Certificada</label>
                <input
                  name="nombre"
                  type="text"
                  required
                  placeholder="Ej: Importadora Médica S.A."
                  className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Identificador Fiscal (RUC)</label>
                <input
                  name="ruc"
                  type="text"
                  placeholder="800XXXXX-X"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                  value={formData.ruc}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Domicilio Fiscal/Legal</label>
                <input
                  name="direccion"
                  type="text"
                  placeholder="Av. Principal #456"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Departamento</label>
                <select
                  name="departamento"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary appearance-none cursor-pointer"
                  value={formData.departamento}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {departamentos.map(d => (
                    <option key={d.departamento_id} value={d.nombre}>{d.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Ciudad</label>
                <select
                  name="ciudad"
                  disabled={!formData.departamento}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary appearance-none cursor-pointer disabled:opacity-40"
                  value={formData.ciudad}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {ciudades.map(c => (
                    <option key={c.ciudad_id} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Barrio</label>
                <select
                  name="barrio"
                  disabled={!formData.ciudad}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary appearance-none cursor-pointer disabled:opacity-40"
                  value={formData.barrio}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {barrios.map(b => (
                    <option key={b.barrio_id} value={b.nombre}>{b.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Contact and Commercial Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary opacity-40">Vínculo Operativo y Comercial</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Enlace Responsable</label>
                <input
                  name="nombre_contacto"
                  type="text"
                  placeholder="Nombre Apellido"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                  value={formData.nombre_contacto}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Terminal de Contacto</label>
                <input
                  name="telefono"
                  type="text"
                  placeholder="+595 XXX XXXXXX"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Correo Electrónico</label>
                <input
                  name="email"
                  type="email"
                  placeholder="contacto@empresa.com"
                  className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Divisa Operativa</label>
                  <select
                    name="moneda"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-black text-sm text-text-primary appearance-none cursor-pointer"
                    value={formData.moneda}
                    onChange={handleChange}
                  >
                    <option value="PYG">PYG</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Cond. Crédito</label>
                  <input
                    name="condiciones_pago"
                    type="text"
                    placeholder="30 Días"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                    value={formData.condiciones_pago}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions Standardized */}
        <div className="bg-surface-raised p-8 border-t border-border flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-text-secondary border border-border hover:bg-white transition-all order-last sm:order-none"
            disabled={isSaving}
          >
            Abortar Proceso
          </button>
          <button
            type="submit"
            className="flex-[2] bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Sincronizando...</span>
              </div>
            ) : 'Certificar Proveedor'}
          </button>
        </div>
      </form>
    </div>
  );
}
