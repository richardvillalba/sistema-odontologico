import React, { useState, useEffect } from 'react';
import { billingService } from '../../services/api';

const TimbradoForm = ({ onClose, onSuccess, initialData = null }) => {
    const [formData, setFormData] = useState({
        numero_timbrado: '',
        establecimiento: '',
        punto_expedicion: '',
        numero_inicio: '',
        numero_fin: '',
        fecha_inicio: '',
        fecha_vencimiento: '',
        tipo_documento: 'FACTURA'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                fecha_inicio: initialData.fecha_inicio ? initialData.fecha_inicio.split('T')[0] : '',
                fecha_vencimiento: initialData.fecha_vencimiento ? initialData.fecha_vencimiento.split('T')[0] : ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación Frontend
        if (!/^\d{8}$/.test(formData.numero_timbrado)) {
            alert("⚠️ El Número de Timbrado debe tener exactamente 8 dígitos numéricos.");
            return;
        }

        setLoading(true);
        try {
            const dataToSave = {
                empresa_id: 1, // TODO: Obtener contexto
                numero_timbrado: formData.numero_timbrado,
                establecimiento: formData.establecimiento,
                punto_expedicion: formData.punto_expedicion,
                tipo_documento: formData.tipo_documento,
                numero_inicio: parseInt(formData.numero_inicio),
                numero_fin: parseInt(formData.numero_fin),
                fecha_inicio: formData.fecha_inicio,
                fecha_vencimiento: formData.fecha_vencimiento,
                creado_por: 1 // TODO: Obtener usuario actual
            };

            let response;
            if (initialData) {
                response = await billingService.updateTimbrado(initialData.timbrado_id, dataToSave);
            } else {
                response = await billingService.createTimbrado(dataToSave);
            }

            // Verificación Lógica del Backend
            if (response.data && response.data.resultado === 1) {
                onSuccess(); // Cierra el modal y refresca la lista
            } else {
                // Si el backend responde 200 pero resultado != 1 (capturado por exception interna)
                throw new Error(response.data?.mensaje || "Error lógico al guardar");
            }

        } catch (error) {
            console.error("Error saving timbrado:", error);
            const errorMessage = error.response?.data?.mensaje || error.message || "Error desconocido";
            alert(`❌ Error al guardar: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">
                        {initialData ? 'Editar Timbrado' : 'Nuevo Timbrado'}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nro. Timbrado</label>
                            <input
                                type="text" name="numero_timbrado" required
                                placeholder="Ej: 12345678"
                                value={formData.numero_timbrado} onChange={handleChange}
                                maxLength="8" pattern="\d{8}" title="Debe tener exactamente 8 dígitos"
                                className="w-full px-4 py-2.5 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all font-mono text-sm"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo Documento</label>
                            <select
                                name="tipo_documento"
                                value={formData.tipo_documento} onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all text-sm font-medium"
                            >
                                <option value="FACTURA">FACTURA</option>
                                <option value="NOTA_CREDITO">NOTA CRÉDITO</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Establecimiento</label>
                            <input
                                type="text" name="establecimiento" required maxLength="3"
                                placeholder="001"
                                value={formData.establecimiento} onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all font-mono text-center text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Punto Exp.</label>
                            <input
                                type="text" name="punto_expedicion" required maxLength="3"
                                placeholder="001"
                                value={formData.punto_expedicion} onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all font-mono text-center text-sm"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Rango de Numeración</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number" name="numero_inicio" required
                                placeholder="Inicio"
                                value={formData.numero_inicio} onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                            <span className="text-slate-400">→</span>
                            <input
                                type="number" name="numero_fin" required
                                placeholder="Fin"
                                value={formData.numero_fin} onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha Inicio</label>
                            <input
                                type="date" name="fecha_inicio" required
                                value={formData.fecha_inicio} onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vencimiento</label>
                            <input
                                type="date" name="fecha_vencimiento" required
                                value={formData.fecha_vencimiento} onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                        <button
                            type="button" onClick={onClose}
                            className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200/50 transition-all disabled:opacity-50 disabled:shadow-none text-sm flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Guardando...
                                </>
                            ) : 'Guardar Timbrado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TimbradoForm;
