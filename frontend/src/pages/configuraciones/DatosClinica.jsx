import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { empresaService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Componente de notificación personalizado
const DatosClinica = () => {
    const navigate = useNavigate();
    const { empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [empresa, setEmpresa] = useState({
        razon_social: '',
        nombre_comercial: '',
        ruc: '',
        slogan: '',
        direccion: '',
        telefono: '',
        email: '',
        sitio_web: '',
        logo_url: ''
    });

    useEffect(() => {
        if (empresaId) cargarDatos();
    }, [empresaId]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const response = await empresaService.getById(empresaId);
            if (response.data.items && response.data.items.length > 0) {
                const datos = response.data.items[0];
                setEmpresa({
                    razon_social: datos.razon_social || '',
                    nombre_comercial: datos.nombre_comercial || '',
                    ruc: datos.ruc || '',
                    slogan: datos.slogan || '',
                    direccion: datos.direccion || '',
                    telefono: datos.telefono || '',
                    email: datos.email || '',
                    sitio_web: datos.sitio_web || '',
                    logo_url: datos.logo_url || ''
                });
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            showToast('Error al sincronizar con el registro central', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmpresa(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await empresaService.update(empresaId, empresa);
            showToast('Información parametrizada exitosamente', 'success');
        } catch (error) {
            console.error('Error guardando:', error);
            showToast('Error crítico al persistir los cambios', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-secondary">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <span className="mt-4 font-black text-[10px] uppercase tracking-widest opacity-40">Accediendo a Bóveda de Datos...</span>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Toast Clinical Style */}
            {toast && (
                <div className={`fixed bottom-10 right-10 z-[110] px-8 py-5 rounded-[2rem] shadow-2xl border-2 flex items-center gap-5 animate-in slide-in-from-right-20 duration-500 ${toast.type === 'success'
                    ? 'bg-surface-card border-success/30 text-success'
                    : 'bg-surface-card border-danger/30 text-danger'
                    }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-success/10' : 'bg-danger/10'}`}>
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest">{toast.type === 'success' ? 'Operación Exitosa' : 'Sistema en Contingencia'}</p>
                        <p className="text-[10px] font-bold opacity-70 mt-0.5">{toast.message}</p>
                    </div>
                </div>
            )}

            {/* Header Section Standardized */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                        Perfil del <span className="text-primary">Ecosistema Clínico</span>
                    </h1>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Parametrización global de identidad y datos de contacto institucional</p>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="bg-surface-card rounded-[3rem] shadow-sm border border-border overflow-hidden">
                <div className="p-12 space-y-12">
                    {/* Sección: Información Legal */}
                    <div className="animate-in fade-in duration-700">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-text-primary uppercase tracking-tight">Registro de Identidad Legal</h3>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Datos fiscales y tributarios mandatorios</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Razón Social</label>
                                <input
                                    type="text" name="razon_social" required
                                    value={empresa.razon_social} onChange={handleChange}
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Nombre de Fantasía</label>
                                <input
                                    type="text" name="nombre_comercial" required
                                    value={empresa.nombre_comercial} onChange={handleChange}
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1 opacity-40">Identificación Tributaria (RUC)</label>
                                <input
                                    type="text" name="ruc" disabled
                                    value={empresa.ruc}
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised/50 text-sm font-mono font-black text-text-primary opacity-50 cursor-not-allowed"
                                />
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mt-3 ml-1 opacity-30 italic">Bloqueado por seguridad administrativa</p>
                            </div>
                        </div>
                    </div>

                    {/* Sección: Slogan */}
                    <div className="pt-12 border-t border-border animate-in fade-in duration-1000">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-text-primary uppercase tracking-tight">Comunicación de Marca</h3>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Lema institucional para documentos externos</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Eslogan Corporativo</label>
                            <input
                                type="text" name="slogan"
                                value={empresa.slogan} onChange={handleChange}
                                placeholder="EJ: ODONTOLOGÍA DE PRECISIÓN PARA TU FAMILIA"
                                className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Sección: Contacto */}
                    <div className="pt-12 border-t border-border animate-in fade-in duration-700">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-text-primary uppercase tracking-tight">Puntos de Contacto</h3>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Localización y canales digitales de atención</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Dirección Física Base</label>
                                <input
                                    type="text" name="direccion"
                                    value={empresa.direccion} onChange={handleChange}
                                    placeholder="EJ: AV. ESPAÑA 1234, ASUNCIÓN"
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Central Telefónica</label>
                                <input
                                    type="text" name="telefono"
                                    value={empresa.telefono} onChange={handleChange}
                                    placeholder="EJ: +595 21 123 456"
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Correo Electrónico Oficial</label>
                                <input
                                    type="email" name="email"
                                    value={empresa.email} onChange={handleChange}
                                    placeholder="EJ: CONTACTO@CLINICA.COM.PY"
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm text-lowercase"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Portal Web</label>
                                <input
                                    type="text" name="sitio_web"
                                    value={empresa.sitio_web} onChange={handleChange}
                                    placeholder="EJ: WWW.CLINICA.COM.PY"
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-sm font-black text-text-primary placeholder:opacity-20 shadow-sm text-lowercase"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Logo */}
                    <div className="pt-12 border-t border-border animate-in fade-in duration-700">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-black text-text-primary uppercase tracking-tight">Simbología Institucional</h3>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mt-1">Recursos visuales para interfaces y reportes</p>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-10">
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">Recurso URL del Logo</label>
                                <input
                                    type="text" name="logo_url"
                                    value={empresa.logo_url} onChange={handleChange}
                                    placeholder="EJ: /ASSETS/LOGO-MAIN.PNG"
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-border bg-surface-raised focus:border-primary focus:bg-white transition-all text-xs font-black text-text-primary placeholder:opacity-20 shadow-sm"
                                />
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mt-4 ml-1 opacity-30 leading-relaxed">
                                    Formatos recomendados: SVG o PNG con transparencia (mínimo 400px ancho).
                                </p>
                            </div>
                            <div className="w-full md:w-64 aspect-square bg-surface-raised rounded-3xl border-2 border-border flex items-center justify-center overflow-hidden group shadow-inner">
                                {empresa.logo_url ? (
                                    <img
                                        src={empresa.logo_url}
                                        alt="Previsualización Logo"
                                        className="max-w-[80%] max-h-[80%] object-contain transition-transform group-hover:scale-110 duration-500"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=LOGO+ERROR'; }}
                                    />
                                ) : (
                                    <div className="text-center p-8 opacity-10">
                                        <svg className="w-20 h-20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-[9px] font-black uppercase tracking-widest leading-none">Sin Identidad Visual</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section Standardized */}
                <div className="px-12 py-8 bg-surface-raised border-t border-border flex flex-col md:flex-row justify-end gap-6 shadow-2xl">
                    <button
                        type="button"
                        onClick={() => navigate('/configuraciones')}
                        className="px-10 py-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] hover:bg-white rounded-2xl transition-all active:scale-95"
                    >
                        Abortar Cambios
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-12 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Sincronizando...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Confirmar Parámetros</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DatosClinica;
