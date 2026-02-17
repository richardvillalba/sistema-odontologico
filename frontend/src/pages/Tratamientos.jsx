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
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Catálogo de Tratamientos</h1>
                    <p className="text-slate-500 font-medium text-sm">Gestión centralizada de servicios, categorías y precios.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 h-fit"
                >
                    <span className="text-xl">+</span> Nuevo Tratamiento
                </button>
            </div>

            {/* Filters section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, código o descripción..."
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-600 placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select
                        className="w-full appearance-none pl-4 pr-10 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-slate-600"
                        value={selectedCategoria}
                        onChange={(e) => setSelectedCategoria(e.target.value)}
                    >
                        <option value="ALL">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                </div>
            </div>

            {/* List section */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-20 text-center">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400 font-bold animate-pulse">Cargando catálogo...</p>
                    </div>
                ) : filteredCatalogo.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="text-6xl mb-4 opacity-20">🦷</div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">No se encontraron tratamientos</h3>
                        <p className="text-slate-500">Pruebe con otros términos o categorías.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Tratamiento</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Categoría</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Precio Base</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Configuración</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Estado</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-10">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredCatalogo.map((item) => (
                                        <tr key={item.catalogo_id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 leading-tight mb-0.5">{item.nombre}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{item.codigo}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black uppercase tracking-tight border border-blue-100/50">
                                                    {item.categoria}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-black text-emerald-600">
                                                    {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(item.precio_base)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${item.requiere_anestesia === 'S' ? 'text-orange-600 bg-orange-50' : 'text-slate-400 bg-slate-50'}`}>
                                                        💉 {item.requiere_anestesia === 'S' ? 'Anestesia' : 'Normal'}
                                                    </div>
                                                    {item.duracion_estimada && (
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter text-indigo-600 bg-indigo-50">
                                                            ⏱️ {item.duracion_estimada} min
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${item.activo === 'S' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${item.activo === 'S' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                    {item.activo === 'S' ? 'Activo' : 'Inactivo'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right pr-6">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all shadow-sm"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActivo(item)}
                                                        className={`p-2.5 rounded-xl transition-all shadow-sm ${item.activo === 'S' ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
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
                        <div className="md:hidden divide-y divide-slate-100">
                            {filteredCatalogo.map((item) => (
                                <div key={item.catalogo_id} className="p-5 active:bg-slate-50 transition-colors group">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="text-sm font-black text-slate-900 leading-tight mb-0.5">{item.nombre}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">{item.codigo}</p>
                                        </div>
                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-tight border border-blue-100">
                                            {item.categoria}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                        <span className="text-base font-black text-emerald-600">
                                            {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(item.precio_base)}
                                        </span>
                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${item.requiere_anestesia === 'S' ? 'text-orange-600 bg-orange-50' : 'text-slate-400 bg-slate-50'}`}>
                                            💉 {item.requiere_anestesia === 'S' ? 'Anestesia' : 'S/A'}
                                        </div>
                                        {item.duracion_estimada && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter text-indigo-600 bg-indigo-50">
                                                ⏱️ {item.duracion_estimada} min
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-4">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleToggleActivo(item)}
                                            className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${item.activo === 'S' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}
                                        >
                                            {item.activo === 'S' ? (
                                                <>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                    Desactivar
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
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
