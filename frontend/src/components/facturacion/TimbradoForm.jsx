import React, { useState, useEffect } from 'react';
import { billingService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TimbradoForm = ({ onClose, onSuccess, initialData = null }) => {
    const { usuario, empresaActiva } = useAuth();
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
    const [contadorRecibo, setContadorRecibo] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                fecha_inicio: initialData.fecha_inicio ? initialData.fecha_inicio.split('T')[0] : '',
                fecha_vencimiento: initialData.fecha_vencimiento ? initialData.fecha_vencimiento.split('T')[0] : ''
            });
            setContadorRecibo(initialData.numero_recibo_actual ?? 0);
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
                empresa_id: String(empresaActiva?.empresa_id),
                numero_timbrado: formData.numero_timbrado,
                establecimiento: formData.establecimiento,
                punto_expedicion: formData.punto_expedicion,
                tipo_documento: formData.tipo_documento,
                numero_inicio: String(formData.numero_inicio),
                numero_fin: String(formData.numero_fin),
                fecha_inicio: formData.fecha_inicio,
                fecha_vencimiento: formData.fecha_vencimiento,
                creado_por: String(usuario?.usuario_id)
            };

            let response;
            if (initialData) {
                response = await billingService.updateTimbrado(initialData.timbrado_id, dataToSave);
                // Si cambió el contador de recibos, actualizarlo también
                if (Number(contadorRecibo) !== Number(initialData.numero_recibo_actual ?? 0)) {
                    await billingService.actualizarContadorRecibo(initialData.timbrado_id, Number(contadorRecibo));
                }
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
        <div className="fixed inset-0 bg-primary-dark/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-500">
            <div className="bg-surface-card rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20">
                <div className="px-10 py-8 border-b border-border flex justify-between items-center bg-surface-raised/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">
                                {initialData ? 'Parametrización de Timbrado' : 'Nuevo Registro Fiscal'}
                            </h3>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Configuración de validez y rangos técnicos</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-danger hover:bg-danger/10 transition-all active:scale-95"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Número de Timbrado</label>
                            <input
                                type="text" name="numero_timbrado" required
                                placeholder="8 DÍGITOS TÉCNICOS"
                                value={formData.numero_timbrado} onChange={handleChange}
                                maxLength="8" pattern="\d{8}" title="Debe tener exactamente 8 dígitos"
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all font-mono text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Tipo de Documento</label>
                            <select
                                name="tipo_documento"
                                value={formData.tipo_documento} onChange={handleChange}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-[10px] font-black uppercase tracking-widest text-text-primary shadow-sm appearance-none"
                            >
                                <option value="FACTURA">FACTURA CLÍNICA</option>
                                <option value="NOTA_CREDITO">NOTA DE CRÉDITO</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Establecimiento</label>
                            <input
                                type="text" name="establecimiento" required maxLength="3"
                                placeholder="000"
                                value={formData.establecimiento} onChange={handleChange}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all font-mono text-center text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Punto de Expedición</label>
                            <input
                                type="text" name="punto_expedicion" required maxLength="3"
                                placeholder="000"
                                value={formData.punto_expedicion} onChange={handleChange}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all font-mono text-center text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="p-8 bg-surface-raised rounded-3xl border-2 border-border group transition-all hover:border-primary/20">
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-6 ml-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            Rango de Numeración Autorizada
                        </label>
                        <div className="flex items-center gap-6">
                            <div className="flex-1">
                                <input
                                    type="number" name="numero_inicio" required
                                    placeholder="INICIO"
                                    value={formData.numero_inicio} onChange={handleChange}
                                    className="w-full px-6 py-3.5 rounded-xl border-2 border-border bg-white focus:border-primary transition-all text-sm font-black font-mono text-text-primary text-center shadow-inner"
                                />
                            </div>
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-border/40 text-text-secondary">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <input
                                    type="number" name="numero_fin" required
                                    placeholder="FIN"
                                    value={formData.numero_fin} onChange={handleChange}
                                    className="w-full px-6 py-3.5 rounded-xl border-2 border-border bg-white focus:border-primary transition-all text-sm font-black font-mono text-text-primary text-center shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Fecha de Emisión</label>
                            <input
                                type="date" name="fecha_inicio" required
                                value={formData.fecha_inicio} onChange={handleChange}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-[11px] font-black uppercase tracking-widest text-text-primary shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Fecha de Vencimiento</label>
                            <input
                                type="date" name="fecha_vencimiento" required
                                value={formData.fecha_vencimiento} onChange={handleChange}
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-[11px] font-black uppercase tracking-widest text-text-primary shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Contador de recibos - solo en modo edición */}
                    {initialData && (
                        <div className="p-8 bg-secondary/5 rounded-3xl border-2 border-secondary/20">
                            <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                Contador de Recibos de Pago
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    min="0"
                                    value={contadorRecibo}
                                    onChange={(e) => setContadorRecibo(e.target.value)}
                                    className="w-48 px-6 py-3.5 rounded-xl border-2 border-secondary/30 bg-white focus:border-secondary transition-all text-sm font-black font-mono text-text-primary text-center shadow-inner"
                                />
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-60 leading-relaxed">
                                    El próximo recibo será:<br />
                                    <span className="text-secondary font-mono text-sm opacity-100">
                                        {initialData.establecimiento}-{initialData.punto_expedicion}-{String(Number(contadorRecibo) + 1).padStart(7, '0')}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-8 border-t-2 border-border/50">
                        <button
                            type="button" onClick={onClose}
                            className="px-8 py-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] hover:bg-surface-raised rounded-2xl transition-all active:scale-95"
                        >
                            Abortar
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className="px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Sincronizando...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Confirmar Registro</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TimbradoForm;
