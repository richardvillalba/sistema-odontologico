import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { empresaService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Componente de notificación personalizado
const Toast = ({ message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
    const icon = type === 'success' ? '✓' : '✕';

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 z-50`}>
            <span className="text-2xl font-bold">{icon}</span>
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-4 hover:opacity-80 transition-opacity">
                <span className="text-xl">×</span>
            </button>
        </div>
    );
};

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
            showToast('Error al cargar los datos de la clínica', 'error');
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
            showToast('Datos actualizados correctamente', 'success');
        } catch (error) {
            console.error('Error guardando:', error);
            showToast('Error al guardar los datos', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Cargando datos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Datos de la Clínica
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                    Información que aparecerá en las facturas y documentos impresos
                </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="p-6 space-y-6">
                    {/* Sección: Información Legal */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                            <span className="text-2xl mr-2">📋</span>
                            Información Legal
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Razón Social *
                                </label>
                                <input
                                    type="text"
                                    name="razon_social"
                                    value={empresa.razon_social}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Nombre Comercial *
                                </label>
                                <input
                                    type="text"
                                    name="nombre_comercial"
                                    value={empresa.nombre_comercial}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    RUC
                                </label>
                                <input
                                    type="text"
                                    name="ruc"
                                    value={empresa.ruc}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    El RUC no se puede modificar desde aquí
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sección: Marketing */}
                    <div className="pt-6 border-t border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                            <span className="text-2xl mr-2">✨</span>
                            Marketing
                        </h3>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Slogan / Eslogan
                            </label>
                            <input
                                type="text"
                                name="slogan"
                                value={empresa.slogan}
                                onChange={handleChange}
                                placeholder="Ej: Tu sonrisa es nuestra prioridad"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Frase que aparecerá en las facturas y documentos
                            </p>
                        </div>
                    </div>

                    {/* Sección: Contacto */}
                    <div className="pt-6 border-t border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                            <span className="text-2xl mr-2">📞</span>
                            Información de Contacto
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={empresa.direccion}
                                    onChange={handleChange}
                                    placeholder="Ej: Av. Principal 123, Ciudad"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={empresa.telefono}
                                    onChange={handleChange}
                                    placeholder="Ej: +595 21 123-4567"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={empresa.email}
                                    onChange={handleChange}
                                    placeholder="Ej: info@clinica.com"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Sitio Web
                                </label>
                                <input
                                    type="text"
                                    name="sitio_web"
                                    value={empresa.sitio_web}
                                    onChange={handleChange}
                                    placeholder="Ej: www.clinica.com"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Logo */}
                    <div className="pt-6 border-t border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                            <span className="text-2xl mr-2">🖼️</span>
                            Logo
                        </h3>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                URL del Logo
                            </label>
                            <input
                                type="text"
                                name="logo_url"
                                value={empresa.logo_url}
                                onChange={handleChange}
                                placeholder="Ej: /assets/logo.png o https://..."
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Ingresá la ruta o URL completa del logo de la clínica
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer con botones */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/configuraciones')}
                        className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Guardando...
                            </>
                        ) : (
                            <>💾 Guardar Cambios</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DatosClinica;
