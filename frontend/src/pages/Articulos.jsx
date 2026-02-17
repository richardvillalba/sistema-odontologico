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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Catálogo de Artículos</h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base">Gestión de insumos, materiales y suministros clínicos.</p>
                </div>
                <div className="flex gap-2 sm:gap-4">
                    <button
                        onClick={() => setShowCategorias(true)}
                        className="bg-white text-indigo-600 px-3 sm:px-6 py-3 rounded-2xl font-bold shadow-sm border border-indigo-100 hover:bg-indigo-50 hover:-translate-y-1 transition-all flex items-center gap-2 text-sm sm:text-base"
                    >
                        <span>📂</span> <span className="hidden sm:inline">Gestionar</span> Categorías
                    </button>
                    <button
                        onClick={handleAdd}
                        className="bg-indigo-600 text-white px-3 sm:px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-2 text-sm sm:text-base"
                    >
                        <span className="text-xl">+</span> <span className="hidden sm:inline">Nuevo</span> Artículo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar por nombre o código..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-0 text-slate-600 font-medium placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <select
                        className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-200 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={selectedCategoria}
                        onChange={e => setSelectedCategoria(e.target.value)}
                    >
                        <option value="ALL">Todas las Categorías</option>
                        {categoriasRes?.data?.items?.map(cat => (
                            <option key={cat.categoria_id} value={cat.categoria_id}>{cat.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="bg-indigo-900 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Artículos</p>
                        <p className="text-2xl font-black">{articulos.length}</p>
                    </div>
                    <div className="text-3xl relative z-10 opacity-50">📦</div>
                    <div className="absolute -right-4 -bottom-4 bg-white/5 w-24 h-24 rounded-full"></div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {loadingArticulos ? (
                    <div className="p-24 text-center">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400 font-bold animate-pulse">Cargando catálogo...</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Código / Nombre</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Categoría</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">U. Medida</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider">Costo / Venta</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider text-center">Stock Mín/Máx</th>
                                        <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 tracking-wider text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {articulos.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-20 text-center">
                                                <p className="text-slate-400 font-medium">No se encontraron artículos.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        articulos.map((art) => (
                                            <tr key={art.articulo_id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 leading-tight">{art.nombre}</span>
                                                        <span className="text-xs text-slate-400 font-black tracking-wider uppercase">{art.codigo}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-tight">
                                                        {art.categoria_nombre}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-slate-500">
                                                    {art.unidad_medida}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col text-xs font-bold">
                                                        <span className="text-slate-400 whitespace-nowrap">C: {new Intl.NumberFormat('es-PY').format(art.costo_unitario)} Gs</span>
                                                        <span className="text-indigo-600 whitespace-nowrap">V: {new Intl.NumberFormat('es-PY').format(art.precio_venta)} Gs</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="text-xs font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">{art.cantidad_minima}</span>
                                                        <span className="text-slate-300">/</span>
                                                        <span className="text-xs font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{art.cantidad_maxima}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(art)}
                                                            className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                            title="Editar"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleActivo(art)}
                                                            className={`p-2 rounded-xl transition-all shadow-sm ${art.activo === 'S' ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                                                            title={art.activo === 'S' ? 'Desactivar' : 'Activar'}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                {art.activo === 'S' ? (
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
                            {articulos.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="text-4xl mb-3">📦</div>
                                    <p className="text-slate-400 font-medium">No se encontraron artículos.</p>
                                </div>
                            ) : (
                                articulos.map((art) => (
                                    <div key={art.articulo_id} className="p-4">
                                        <div className="flex items-start justify-between mb-1">
                                            <div>
                                                <span className="font-bold text-slate-900 text-sm">{art.nombre}</span>
                                                <p className="text-[10px] text-slate-400 font-black tracking-wider uppercase">{art.codigo}</p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase shrink-0 ml-2">
                                                {art.categoria_nombre}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 text-xs">
                                            <span className="text-slate-400">C: {new Intl.NumberFormat('es-PY').format(art.costo_unitario)} Gs</span>
                                            <span className="text-indigo-600 font-bold">V: {new Intl.NumberFormat('es-PY').format(art.precio_venta)} Gs</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                            <span>📏 {art.unidad_medida}</span>
                                            <span>Stock: <span className="text-rose-500 font-bold">{art.cantidad_minima}</span> / <span className="text-blue-500 font-bold">{art.cantidad_maxima}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button
                                                onClick={() => handleEdit(art)}
                                                className="flex-1 text-center text-xs font-bold text-indigo-600 bg-indigo-50 py-2 rounded-xl"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleToggleActivo(art)}
                                                className={`flex-1 text-center text-xs font-bold py-2 rounded-xl ${art.activo === 'S' ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}
                                            >
                                                {art.activo === 'S' ? '⛔ Desactivar' : '✅ Activar'}
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
                    isSaving={upsertMutation.isLoading}
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
        // Send null for codigo if it's new/empty to trigger auto-generation
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            >
                <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">{articulo ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium">Defina los parámetros del catálogo.</p>
                    </div>
                    <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600">Identificación</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Código (Auto)</label>
                                <input
                                    name="codigo"
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-black uppercase"
                                    placeholder="Autogenerado"
                                    value={formData.codigo || ''}
                                    readOnly
                                    disabled
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">U. Medida</label>
                                <select
                                    name="unidad_medida"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold"
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
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Nombre</label>
                            <input
                                name="nombre"
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-slate-700"
                                placeholder="Ej. Anestesia 2%"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Categoría</label>
                            <select
                                name="categoria_id"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold"
                                value={formData.categoria_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione Categoría</option>
                                {categorias.map(cat => (
                                    <option key={cat.categoria_id} value={cat.categoria_id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600">Precios y Stock</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Costo Estimado</label>
                                <input
                                    name="costo_unitario"
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-indigo-600"
                                    value={formData.costo_unitario}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Precio Venta</label>
                                <input
                                    name="precio_venta"
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-emerald-600"
                                    value={formData.precio_venta}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Stock Mínimo</label>
                                <input
                                    name="cantidad_minima"
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-rose-500"
                                    value={formData.cantidad_minima}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Stock Máximo</label>
                                <input
                                    name="cantidad_maxima"
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-blue-500"
                                    value={formData.cantidad_maxima}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Descripción</label>
                            <textarea
                                name="descripcion"
                                rows="3"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm"
                                placeholder="Detalles adicionales..."
                                value={formData.descripcion}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                        type="submit"
                        className="w-full sm:flex-1 bg-indigo-600 text-white px-8 py-3 sm:py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Guardando...</span>
                            </div>
                        ) : 'Guardar Artículo'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:px-8 py-3 sm:py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all order-last sm:order-none"
                        disabled={isSaving}
                    >
                        Cancelar
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
            if (editingId) {
                setEditingId(null);
                setNombre('');
                setDescripcion('');
            } else {
                setNombre('');
                setDescripcion('');
            }
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="bg-slate-50 px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Gestionar Categorías</h2>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium">Categorías de artículos.</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-100">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Nombre de Categoría"
                            className="w-full px-4 py-2 sm:py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            required
                        />
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="Descripción (opcional)"
                                className="flex-1 px-4 py-2 sm:py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm"
                                value={descripcion}
                                onChange={e => setDescripcion(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={upsertMutation.isLoading}
                                    className="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-2 sm:py-0 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                                >
                                    {editingId ? 'Actualizar' : 'Agregar'}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingId(null); setNombre(''); setDescripcion(''); }}
                                        className="bg-slate-200 text-slate-600 px-4 rounded-xl font-bold hover:bg-slate-300 transition-all"
                                    >
                                        X
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <p className="text-center p-4 text-slate-400">Cargando...</p>
                    ) : (
                        <div className="space-y-1">
                            {(categoriasRes?.data?.items || []).map(cat => (
                                <div key={cat.categoria_id} className="group flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                                    <div>
                                        <p className="font-bold text-slate-800">{cat.nombre}</p>
                                        {cat.descripcion && <p className="text-xs text-slate-400">{cat.descripcion}</p>}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('¿Eliminar esta categoría?')) deleteMutation.mutate(cat.categoria_id);
                                            }}
                                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                            title="Eliminar"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {(categoriasRes?.data?.items || []).length === 0 && (
                                <p className="text-center text-slate-400 py-8">No hay categorías registradas.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
