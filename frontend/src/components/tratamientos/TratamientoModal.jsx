import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tratamientosService } from '../../services/api';

const CATEGORIAS_DEFAULT = [
    'CONSULTA',
    'OPERATORIA',
    'CIRUGIA',
    'ENDODONCIA',
    'PERIODONCIA',
    'PROTESIS',
    'ESTETICA',
    'IMPLANTOLOGIA',
    'ORTODONCIA',
    'PREVENCION'
];

export default function TratamientoModal({ tratamiento, onClose, categorias, empresaId }) {
    const queryClient = useQueryClient();
    const isEdit = !!tratamiento;

    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria: 'GENERAL',
        precio_base: 0,
        duracion_estimada: '',
        requiere_anestesia: 'N',
        activo: 'S'
    });

    useEffect(() => {
        if (tratamiento) {
            setFormData({
                ...tratamiento,
                precio_base: itemToNumber(tratamiento.precio_base),
                duracion_estimada: tratamiento.duracion_estimada || ''
            });
        }
    }, [tratamiento]);

    const itemToNumber = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return parseFloat(val);
    };

    const mutation = useMutation({
        mutationFn: (data) => {
            if (isEdit) {
                return tratamientosService.updateCatalogo(tratamiento.catalogo_id, data);
            }
            return tratamientosService.createCatalogo(data);
        },
        onSuccess: (res) => {
            if (res.data?.success) {
                queryClient.invalidateQueries(['tratamientos-catalogo', empresaId]);
                onClose();
            } else {
                alert(res.data?.message || 'Error al guardar el tratamiento');
            }
        },
        onError: (err) => {
            console.error('Error saving treatment:', err);
            alert('Error de conexión al servidor');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            empresa_id: empresaId,
            codigo: isEdit ? formData.codigo : 'AUTO'
        };
        mutation.mutate(dataToSubmit);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 'S' : 'N') : value
        }));
    };

    const allCategorias = Array.from(new Set([...CATEGORIAS_DEFAULT, ...categorias])).sort();

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-50/80 px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {isEdit ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
                        </h2>
                        <p className="text-slate-500 text-sm font-medium italic">Configure los detalles del servicio en el catálogo.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all flex items-center justify-center text-xl font-light"
                    >
                        ✕
                    </button>
                </div>

                {/* Form Body */}
                <form id="tratamiento-form" onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-2">
                            <span className="text-xl">🛠️</span>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Información Básica</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="sm:col-span-1 space-y-2 group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Código</label>
                                <input
                                    name="codigo"
                                    type="text"
                                    readOnly
                                    className="w-full px-5 py-4 bg-slate-100 border-2 border-slate-100 rounded-2xl text-slate-500 font-bold focus:outline-none cursor-not-allowed uppercase"
                                    value={isEdit ? formData.codigo : 'AUTO'}
                                />
                                {!isEdit && <p className="text-[10px] text-blue-500/80 font-black italic ml-1 tracking-tight">✨ Asignación Automática</p>}
                            </div>
                            <div className="sm:col-span-2 space-y-2 group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Nombre del Tratamiento</label>
                                <input
                                    name="nombre"
                                    type="text"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-0 focus:border-primary/50 focus:bg-white transition-all placeholder:italic placeholder:font-normal placeholder:text-slate-300"
                                    placeholder="Ej: Restauración con Resina Fotocurable"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Descripción Detallada</label>
                            <textarea
                                name="descripcion"
                                rows="3"
                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-0 focus:border-primary/50 focus:bg-white transition-all resize-none placeholder:italic placeholder:font-normal placeholder:text-slate-300"
                                placeholder="Describa el procedimiento técnico..."
                                value={formData.descripcion}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>

                    {/* Configuration */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-2">
                            <span className="text-xl">⚙️</span>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Configuración y Costos</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Categoría</label>
                                <div className="relative">
                                    <select
                                        name="categoria"
                                        className="w-full appearance-none px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-0 focus:border-primary/50 focus:bg-white transition-all"
                                        value={formData.categoria}
                                        onChange={handleChange}
                                    >
                                        {allCategorias.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
                                </div>
                            </div>
                            <div className="space-y-2 group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Precio Base (Gs)</label>
                                <input
                                    name="precio_base"
                                    type="number"
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-emerald-600 font-black focus:outline-none focus:ring-0 focus:border-emerald-400/50 focus:bg-white transition-all"
                                    value={formData.precio_base}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                            <div className="space-y-2 group">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-primary transition-colors">Duración Estimada (min)</label>
                                <input
                                    name="duracion_estimada"
                                    type="number"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-indigo-600 font-bold focus:outline-none focus:ring-0 focus:border-indigo-400/50 focus:bg-white transition-all"
                                    placeholder="Ej: 45"
                                    value={formData.duracion_estimada}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-orange-50/50 border-2 border-orange-100/50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">💉</span>
                                    <div>
                                        <p className="text-xs font-black text-orange-800 uppercase leading-none">Anestesia</p>
                                        <p className="text-[10px] text-orange-400 font-bold font-italic mt-1 uppercase tracking-tighter">¿Requiere anestesia?</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="requiere_anestesia"
                                        className="sr-only peer"
                                        checked={formData.requiere_anestesia === 'S'}
                                        onChange={handleChange}
                                    />
                                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[20px] after:w-[22px] after:transition-all peer-checked:bg-orange-500 shadow-inner"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 shrink-0">
                    <button
                        type="submit"
                        form="tratamiento-form"
                        disabled={mutation.isLoading}
                        className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                    >
                        {mutation.isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Procesando...</span>
                            </div>
                        ) : (
                            isEdit ? 'Guardar Cambios' : 'Crear Tratamiento'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={mutation.isLoading}
                        className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
