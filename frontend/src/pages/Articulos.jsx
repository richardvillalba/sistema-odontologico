import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { comprasService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Articulos() {
    const queryClient = useQueryClient();
    const { usuario } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showCategorias, setShowCategorias] = useState(false);
    const [editArticulo, setEditArticulo] = useState(null);
    const [selectedCategoria, setSelectedCategoria] = useState('ALL');

    const { data: articulosRes, isLoading: loadingArticulos } = useQuery({
        queryKey: ['articulos', selectedCategoria],
        queryFn: () => comprasService.getArticulos(selectedCategoria === 'ALL' ? null : selectedCategoria),
    });

    const { data: categoriasRes } = useQuery({
        queryKey: ['categorias'],
        queryFn: () => comprasService.getCategorias(),
    });

    const { data: unidadesRes } = useQuery({
        queryKey: ['unidades'],
        queryFn: () => comprasService.getUnidadesMedida(),
    });

    const articulos = (articulosRes?.data?.items || []).filter(a =>
        a.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const upsertMutation = useMutation({
        mutationFn: (data) => comprasService.upsertArticulo(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['articulos']);
            setShowForm(false);
        }
    });

    const handleAdd = () => {
        setEditArticulo(null);
        setShowForm(true);
    };

    const handleEdit = (art) => {
        setEditArticulo(art);
        setShowForm(true);
    };

    const handleSave = (formData) => {
        upsertMutation.mutate({
            ...formData,
            articulo_id: editArticulo?.articulo_id || null,
            usuario_id: usuario?.usuario_id
        });
    };

    const handleToggleActivo = (art) => {
        upsertMutation.mutate({
            ...art,
            activo: art.activo === 'S' ? 'N' : 'S',
            usuario_id: usuario?.usuario_id
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Section Standardized */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                        Catálogo de <span className="text-primary">Artículos</span>
                    </h1>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Gestión centralizada de insumos, materiales y suministros clínicos</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowCategorias(true)}
                        className="bg-surface-card text-text-primary px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-border hover:bg-surface-raised hover:-translate-y-1 transition-all flex items-center gap-3 shadow-sm shadow-primary/5"
                    >
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        Categorías
                    </button>
                    <button
                        onClick={handleAdd}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-dark hover:-translate-y-1 transition-all flex items-center gap-3 shadow-xl shadow-primary/20"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                        </svg>
                        Nuevo Artículo
                    </button>
                </div>
            </div>

            {/* Filters and Stats Standardized */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 bg-surface-card rounded-[2rem] border border-border flex items-center px-6 focus-within:border-primary/30 transition-all shadow-sm">
                        <svg className="w-5 h-5 text-text-secondary opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o código de barras..."
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-text-primary placeholder:text-text-secondary/30 py-4"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-surface-card px-6 py-4 rounded-[2rem] border border-border font-black text-[10px] uppercase tracking-widest text-text-primary outline-none focus:border-primary/30 transition-all cursor-pointer shadow-sm appearance-none min-w-[200px]"
                        value={selectedCategoria}
                        onChange={e => setSelectedCategoria(e.target.value)}
                    >
                        <option value="ALL">📦 TODAS LAS CATEGORÍAS</option>
                        {categoriasRes?.data?.items?.map(cat => (
                            <option key={cat.categoria_id} value={cat.categoria_id}>{cat.nombre.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
                <div className="bg-primary-dark rounded-[2.5rem] p-8 flex items-center justify-between text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[.2em] text-white/40 mb-1">Items en Catálogo</p>
                        <p className="text-4xl font-black">{articulos.length}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center relative z-10">
                        <svg className="w-8 h-8 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <div className="absolute -right-4 -bottom-4 bg-white/5 w-32 h-32 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                </div>
            </div>

            {/* List and Tables Standardized */}
            <div className="bg-surface-card rounded-[3rem] border border-border shadow-sm overflow-hidden">
                {loadingArticulos ? (
                    <div className="p-32 text-center animate-pulse flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <p className="font-black text-text-secondary uppercase tracking-[0.2em] text-[10px] opacity-40">Accediendo al Catálogo Maestro...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table Standardized */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-raised/50 border-b border-border">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40">Identificación / Nombre</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40">Clasificación</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40 text-center">Formato</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40">Valoración Gs</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40 text-center">Nivel Stock</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40 text-center">Gestión</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {articulos.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-32 text-center">
                                                <div className="w-20 h-20 bg-surface-raised rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-border">📦</div>
                                                <p className="text-text-secondary font-black uppercase text-[10px] tracking-widest opacity-40">Sin registros en esta categoría</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        articulos.map((art) => (
                                            <tr key={art.articulo_id} className="hover:bg-surface-raised/30 transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-text-primary text-sm tracking-tight leading-tight mb-1">{art.nombre}</span>
                                                        <span className="text-[10px] text-primary font-black tracking-widest uppercase opacity-60">#{art.codigo}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-4 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl text-[9px] font-black uppercase tracking-widest">
                                                        {art.categoria_nombre}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="text-xs font-black text-text-secondary opacity-60 uppercase tracking-widest">{art.unidad_medida}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex justify-between items-center text-[10px] font-medium text-text-secondary">
                                                            <span className="opacity-40 uppercase tracking-widest">Costo:</span>
                                                            <span className="font-black text-text-primary">{new Intl.NumberFormat('es-PY').format(art.costo_unitario)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[10px] font-black text-secondary">
                                                            <span className="opacity-40 uppercase tracking-widest">Venta:</span>
                                                            <span className="">{new Intl.NumberFormat('es-PY').format(art.precio_venta)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[8px] font-black text-danger uppercase mb-1 opacity-40">Mín</span>
                                                            <span className="text-[11px] font-black text-danger bg-danger/10 px-3 py-1 rounded-lg border border-danger/10 min-w-[32px] text-center">{art.cantidad_minima}</span>
                                                        </div>
                                                        <div className="w-4 h-[1px] bg-border mt-3"></div>
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-[8px] font-black text-primary uppercase mb-1 opacity-40">Máx</span>
                                                            <span className="text-[11px] font-black text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/10 min-w-[32px] text-center">{art.cantidad_maxima}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                        <button
                                                            onClick={() => handleEdit(art)}
                                                            className="p-3 rounded-2xl bg-surface-raised text-text-secondary border border-border hover:bg-primary-dark hover:text-white hover:border-primary-dark transition-all shadow-sm"
                                                            title="Expediente Técnico"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleActivo(art)}
                                                            className={`p-3 rounded-2xl transition-all border shadow-sm ${art.activo === 'S'
                                                                ? 'bg-danger/5 text-danger border-danger/20 hover:bg-danger hover:text-white'
                                                                : 'bg-secondary/5 text-secondary border-secondary/20 hover:bg-secondary hover:text-white'}`}
                                                            title={art.activo === 'S' ? 'Baja de Catálogo' : 'Activar Item'}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                {art.activo === 'S' ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                ) : (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
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
                            {articulos.length === 0 ? (
                                <div className="p-20 text-center">
                                    <div className="text-4xl mb-4 opacity-20">📦</div>
                                    <p className="text-text-secondary font-black text-[10px] uppercase tracking-widest opacity-40">No se encontraron artículos</p>
                                </div>
                            ) : (
                                articulos.map((art) => (
                                    <div key={art.articulo_id} className="p-8 space-y-4 hover:bg-surface-raised/30 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h4 className="font-black text-text-primary text-sm tracking-tight">{art.nombre}</h4>
                                                <p className="text-[10px] text-primary font-black tracking-widest uppercase opacity-60">#{art.codigo}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                                                {art.categoria_nombre}
                                            </span>
                                        </div>
                                        <div className="bg-surface-raised rounded-2xl p-4 grid grid-cols-2 gap-4">
                                            <div className="space-y-1 border-r border-border pr-4">
                                                <p className="text-[8px] font-black text-text-secondary uppercase opacity-40">Valoración Venta</p>
                                                <p className="text-sm font-black text-secondary">{new Intl.NumberFormat('es-PY').format(art.precio_venta)} Gs</p>
                                            </div>
                                            <div className="space-y-1 pl-4">
                                                <p className="text-[8px] font-black text-text-secondary uppercase opacity-40">Stock Mín/Máx</p>
                                                <p className="text-sm font-black text-text-primary">{art.cantidad_minima} / {art.cantidad_maxima}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleEdit(art)}
                                                className="flex-1 bg-surface-card border border-border text-text-primary py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-surface-raised transition-all"
                                            >
                                                Ver Detalles
                                            </button>
                                            <button
                                                onClick={() => handleToggleActivo(art)}
                                                className={`px-6 py-4 rounded-2xl border transition-all ${art.activo === 'S'
                                                    ? 'bg-danger/5 text-danger border-danger/20'
                                                    : 'bg-secondary/5 text-secondary border-secondary/20'}`}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {art.activo === 'S' ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
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
                <ArticuloForm
                    articulo={editArticulo}
                    categorias={categoriasRes?.data?.items || []}
                    unidades={unidadesRes?.data?.items || []}
                    onSave={handleSave}
                    onCancel={() => setShowForm(false)}
                    isSaving={upsertMutation.isPending}
                />
            )}

            {showCategorias && (
                <CategoriasModal
                    onClose={() => setShowCategorias(false)}
                />
            )}
        </div>
    );
}

function ArticuloForm({ articulo, categorias, unidades, onSave, onCancel, isSaving }) {
    const [formData, setFormData] = useState({
        codigo: articulo?.codigo || '',
        nombre: articulo?.nombre || '',
        descripcion: articulo?.descripcion || '',
        categoria_id: articulo?.categoria_id || '',
        unidad_medida: articulo?.unidad_medida || 'UNIDADES',
        costo_unitario: articulo?.costo_unitario || 0,
        precio_venta: articulo?.precio_venta || 0,
        cantidad_minima: articulo?.cantidad_minima || 1,
        cantidad_maxima: articulo?.cantidad_maxima || 10,
        activo: articulo?.activo || 'S'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (!articulo?.articulo_id && !payload.codigo.trim()) {
            payload.codigo = null;
        }
        onSave(payload);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-surface-card rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20"
            >
                <div className="bg-surface-raised p-8 sm:p-10 border-b border-border flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight leading-none">
                            {articulo ? 'Editar' : 'Registrar'} <span className="text-primary">Artículo</span>
                        </h2>
                        <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Definición de parámetros técnicos y operativos</p>
                    </div>
                    <button type="button" onClick={onCancel} className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-text-secondary hover:bg-danger hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40">Identificación Propedéutica</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Referencia Fiscal</label>
                                <input
                                    name="codigo"
                                    type="text"
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-surface-raised text-[11px] font-black uppercase tracking-widest text-text-secondary/50"
                                    placeholder="AUTOGENERADO"
                                    value={formData.codigo || ''}
                                    readOnly
                                    disabled
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Unidad Base</label>
                                <select
                                    name="unidad_medida"
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-black text-[11px] uppercase tracking-widest appearance-none cursor-pointer"
                                    value={formData.unidad_medida}
                                    onChange={handleChange}
                                    required
                                >
                                    {unidades.map(u => (
                                        <option key={u.unidad_id} value={u.abreviatura}>{u.nombre} ({u.abreviatura})</option>
                                    ))}
                                    {unidades.length === 0 && <option value="UN">Unidad</option>}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Nombre Comercial / Genérico</label>
                            <input
                                name="nombre"
                                type="text"
                                className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-bold text-sm text-text-primary"
                                placeholder="Ej. Resina Compuesta A2..."
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Clasificación Maestro</label>
                            <select
                                name="categoria_id"
                                className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-black text-[11px] uppercase tracking-widest appearance-none cursor-pointer"
                                value={formData.categoria_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">SELECCIONAR CATEGORÍA</option>
                                {categorias.map(cat => (
                                    <option key={cat.categoria_id} value={cat.categoria_id}>{cat.nombre.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-4 bg-secondary rounded-full"></div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40">Costos y Protocolos de Stock</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Costo Promedio (Gs)</label>
                                <input
                                    name="costo_unitario"
                                    type="number"
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-black text-sm text-text-primary"
                                    value={formData.costo_unitario}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Precio Sugerido (Gs)</label>
                                <input
                                    name="precio_venta"
                                    type="number"
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-secondary focus:outline-none transition-all font-black text-sm text-secondary"
                                    value={formData.precio_venta}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Límite Crítico (Min)</label>
                                <input
                                    name="cantidad_minima"
                                    type="number"
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-danger focus:outline-none transition-all font-black text-sm text-danger"
                                    value={formData.cantidad_minima}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Capacidad Máxima</label>
                                <input
                                    name="cantidad_maxima"
                                    type="number"
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all font-black text-sm text-primary"
                                    value={formData.cantidad_maxima}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Observaciones Analíticas</label>
                            <textarea
                                name="descripcion"
                                rows="3"
                                className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:outline-none transition-all text-xs font-medium text-text-primary resize-none shadow-inner"
                                placeholder="Notas internas sobre el insumo..."
                                value={formData.descripcion}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-raised p-8 sm:p-10 border-t border-border flex flex-col sm:flex-row gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-text-secondary border border-border hover:bg-white transition-all order-last sm:order-none"
                        disabled={isSaving}
                    >
                        Abortar
                    </button>
                    <button
                        type="submit"
                        className="flex-[2] bg-primary text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-3"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Sincronizando...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Certificar Artículo</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

function CategoriasModal({ onClose }) {
    const queryClient = useQueryClient();
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [editingId, setEditingId] = useState(null);

    const { data: categoriasRes, isLoading } = useQuery({
        queryKey: ['categorias'],
        queryFn: () => comprasService.getCategorias(),
    });

    const upsertMutation = useMutation({
        mutationFn: (data) => comprasService.upsertCategoria(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['categorias']);
            setEditingId(null);
            setNombre('');
            setDescripcion('');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => comprasService.deleteCategoria(id),
        onSuccess: () => queryClient.invalidateQueries(['categorias'])
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        upsertMutation.mutate({
            categoria_id: editingId,
            nombre,
            descripcion,
            activo: 'S'
        });
    };

    const handleEdit = (cat) => {
        setEditingId(cat.categoria_id);
        setNombre(cat.nombre);
        setDescripcion(cat.descripcion || '');
    };

    return (
        <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-surface-card rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 flex flex-col max-h-[90vh]">
                <div className="bg-surface-raised p-8 border-b border-border flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight leading-none">
                            Estructura de <span className="text-primary">Categorías</span>
                        </h2>
                        <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Taxonomía organizativa del inventario</p>
                    </div>
                    <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-text-secondary hover:bg-danger hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 bg-surface-raised/50 border-b border-border">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Identificador Categoría</label>
                            <input
                                type="text"
                                placeholder="NOMBRE DE LA CATEGORÍA..."
                                className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-surface-card focus:border-primary focus:outline-none transition-all font-black text-[11px] uppercase tracking-widest"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-40">Alcance Analítico (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="DESCRIPCIÓN BREVE..."
                                    className="w-full px-5 py-4 rounded-2xl border-2 border-border bg-surface-card focus:border-primary focus:outline-none transition-all text-xs font-medium"
                                    value={descripcion}
                                    onChange={e => setDescripcion(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 items-end">
                                <button
                                    type="submit"
                                    disabled={upsertMutation.isPending}
                                    className="flex-1 sm:flex-none bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all disabled:opacity-50 h-[52px]"
                                >
                                    {editingId ? 'Actualizar' : 'Integrar'}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingId(null); setNombre(''); setDescripcion(''); }}
                                        className="bg-surface-raised border border-border text-text-secondary w-[52px] h-[52px] rounded-2xl flex items-center justify-center hover:bg-white transition-all shadow-sm"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="py-20 text-center animate-pulse flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Consultando Registros...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {(categoriasRes?.data?.items || []).map(cat => (
                                <div key={cat.categoria_id} className="group flex items-center justify-between p-5 bg-surface-raised rounded-[1.5rem] border border-transparent hover:border-primary/20 hover:bg-white transition-all shadow-sm hover:shadow-md">
                                    <div className="space-y-1">
                                        <p className="font-black text-text-primary text-sm tracking-tight">{cat.nombre.toUpperCase()}</p>
                                        {cat.descripcion && <p className="text-[10px] text-text-secondary font-medium opacity-60 leading-tight">{cat.descripcion}</p>}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 translate-x-2 group-hover:translate-x-0">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="p-2.5 bg-white text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                                            title="Editar"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('¿Eliminar esta categoría permanentemente?')) deleteMutation.mutate(cat.categoria_id);
                                            }}
                                            className="p-2.5 bg-white text-danger border border-danger/20 rounded-xl hover:bg-danger hover:text-white transition-all shadow-sm"
                                            title="Eliminar"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(categoriasRes?.data?.items || []).length === 0 && (
                                <div className="py-20 text-center space-y-4">
                                    <div className="w-16 h-16 bg-surface-raised rounded-3xl flex items-center justify-center mx-auto text-2xl shadow-inner border border-border opacity-40">📂</div>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Sin taxonomía registrada</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
