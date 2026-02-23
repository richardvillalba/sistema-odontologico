import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tratamientosService } from '../services/api';
import TratamientoModal from '../components/tratamientos/TratamientoModal';
import { useAuth } from '../contexts/AuthContext';

export default function Tratamientos() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoria, setSelectedCategoria] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [editingTratamiento, setEditingTratamiento] = useState(null);

    const { usuario, empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;

    console.log('Tratamientos - Context:', { usuario, empresaActiva, empresaId });

    const { data: catalogoRes, isLoading, error: queryError } = useQuery({
        queryKey: ['tratamientos-catalogo', empresaId],
        queryFn: () => tratamientosService.getCatalogo(empresaId),
        enabled: !!empresaId,
    });

    if (queryError) console.error('Error fetching catalogo:', queryError);

    const catalogo = catalogoRes?.data?.items || [];

    // Categorías únicas para el filtro
    const categorias = [...new Set(catalogo.map(item => item.categoria))].filter(Boolean).sort();

    const filteredCatalogo = catalogo.filter(item => {
        const matchesSearch =
            item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategoria = selectedCategoria === 'ALL' || item.categoria === selectedCategoria;

        return matchesSearch && matchesCategoria;
    });

    const handleAdd = () => {
        setEditingTratamiento(null);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setEditingTratamiento(item);
        setShowModal(true);
    };

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, activo }) => tratamientosService.updateCatalogo(id, { activo, empresa_id: empresaId }),
        onSuccess: () => {
            queryClient.invalidateQueries(['tratamientos-catalogo', empresaId]);
        }
    });

    const handleToggleActivo = (item) => {
        const nuevoEstado = item.activo === 'S' ? 'N' : 'S';
        if (confirm(`¿Desea ${nuevoEstado === 'S' ? 'activar' : 'desactivar'} este tratamiento?`)) {
            toggleStatusMutation.mutate({ id: item.catalogo_id, activo: nuevoEstado });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight uppercase">Catálogo de Tratamientos</h1>
                    <p className="text-text-secondary font-medium text-sm">Gestión centralizada de servicios, categorías y precios.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30 hover:bg-primary-dark hover:-translate-y-1 transition-all flex items-center justify-center gap-3 h-fit"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    Nuevo Tratamiento
                </button>
            </div>

            {/* Filters section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-40 group-focus-within:text-primary transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, código o descripción..."
                        className="w-full pl-12 pr-4 py-4 bg-surface-card rounded-2xl border border-border shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-text-primary placeholder:text-text-secondary opacity-80"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select
                        className="w-full appearance-none pl-4 pr-10 py-4 bg-surface-card rounded-2xl border border-border shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none font-bold text-text-primary cursor-pointer"
                        value={selectedCategoria}
                        onChange={(e) => setSelectedCategoria(e.target.value)}
                    >
                        <option value="ALL">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-40 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                </div>
            </div>

            {/* List section */}
            <div className="bg-surface-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-20 text-center">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400 font-bold animate-pulse">Cargando catálogo...</p>
                    </div>
                ) : filteredCatalogo.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="text-6xl mb-4 opacity-20">🦷</div>
                        <h3 className="text-xl font-bold text-text-primary mb-1">No se encontraron tratamientos</h3>
                        <p className="text-text-secondary">Pruebe con otros términos o categorías.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-raised border-b border-border">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">Tratamiento</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">Categoría</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">Precio Base</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">Configuración</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">Estado</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60 text-right pr-6">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredCatalogo.map((item) => (
                                        <tr key={item.catalogo_id} className="group hover:bg-primary-light/10 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-text-primary leading-tight mb-0.5 uppercase tracking-tight">{item.nombre}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">{item.codigo}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 bg-primary/5 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                    {item.categoria}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-black text-secondary">
                                                    {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(item.precio_base)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${item.requiere_anestesia === 'S' ? 'text-warning-dark bg-warning-light/20 border border-warning/20' : 'text-text-secondary bg-surface-raised border border-border'}`}>
                                                        {item.requiere_anestesia === 'S' ? 'Anestesia' : 'Normal'}
                                                    </div>
                                                    {item.duracion_estimada && (
                                                        <div className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest text-primary bg-primary-light/30 border border-primary-light">
                                                            {item.duracion_estimada} min
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border ${item.activo === 'S' ? 'bg-secondary-light/20 text-secondary border-secondary/20' : 'bg-danger-light/20 text-danger border-danger/20'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${item.activo === 'S' ? 'bg-secondary animate-pulse' : 'bg-danger'}`}></span>
                                                    {item.activo === 'S' ? 'Activo' : 'Inactivo'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right pr-6">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2.5 rounded-xl bg-surface-raised text-text-secondary hover:bg-primary hover:text-white transition-all shadow-sm border border-border"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActivo(item)}
                                                        className={`p-2.5 rounded-xl transition-all shadow-sm border ${item.activo === 'S' ? 'bg-danger-light/20 text-danger hover:bg-danger hover:text-white border-danger/20' : 'bg-secondary-light/20 text-secondary hover:bg-secondary hover:text-white border-secondary/20'}`}
                                                        title={item.activo === 'S' ? 'Desactivar' : 'Activar'}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            {item.activo === 'S' ? (
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                            ) : (
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                            )}
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List (Cards) */}
                        <div className="md:hidden divide-y divide-border">
                            {filteredCatalogo.map((item) => (
                                <div key={item.catalogo_id} className="p-6 active:bg-primary-light/5 transition-colors group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-black text-text-primary uppercase tracking-tight leading-tight mb-1">{item.nombre}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary opacity-60">{item.codigo}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-primary/5 text-primary border border-primary/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            {item.categoria}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 mt-4">
                                        <span className="text-base font-black text-secondary">
                                            {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(item.precio_base)}
                                        </span>
                                        <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${item.requiere_anestesia === 'S' ? 'text-warning-dark bg-warning-light/20 border border-warning/20' : 'text-text-secondary bg-surface-raised border border-border'}`}>
                                            {item.requiere_anestesia === 'S' ? 'Anestesia' : 'Normal'}
                                        </div>
                                        {item.duracion_estimada && (
                                            <div className="px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest text-primary bg-primary-light/30 border border-primary-light">
                                                {item.duracion_estimada} min
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 mt-5">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="flex-1 bg-surface-raised text-text-secondary py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 border border-border"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleToggleActivo(item)}
                                            className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${item.activo === 'S' ? 'bg-danger-light/20 text-danger border-danger/20' : 'bg-secondary-light/20 text-secondary border-secondary/20'}`}
                                        >
                                            {item.activo === 'S' ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                    Desactivar
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                                    Activar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <TratamientoModal
                    tratamiento={editingTratamiento}
                    onClose={() => setShowModal(false)}
                    categorias={categorias}
                    empresaId={empresaId}
                />
            )}
        </div>
    );
}
