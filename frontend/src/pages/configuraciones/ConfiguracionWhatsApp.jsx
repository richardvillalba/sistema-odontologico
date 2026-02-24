import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { whatsappService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Toast = ({ toast }) => {
    if (!toast) return null;
    return (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-4 duration-300 ${
            toast.type === 'success'
                ? 'bg-surface-card border-accent/30 text-accent'
                : 'bg-surface-card border-danger/30 text-danger'
        }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${toast.type === 'success' ? 'bg-accent/10' : 'bg-danger/10'}`}>
                {toast.type === 'success'
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                }
            </div>
            <span className="font-black text-[11px] uppercase tracking-widest">{toast.message}</span>
        </div>
    );
};

export default function ConfiguracionWhatsApp() {
    const navigate = useNavigate();
    const { empresaActiva, esSuperAdmin } = useAuth();
    const empresaId = empresaActiva?.empresa_id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [config, setConfig] = useState({
        habilitado: 'N',
        phone_number_id: '',
        access_token: '',
        waba_id: '',
        horas_anticipacion: 24,
        plantilla_recordatorio: 'Hola {nombre}, te recordamos tu cita el {fecha} a las {hora} con Dr/a. {doctor}. Cualquier consulta comunicate con nosotros.',
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        if (empresaId) cargarConfig();
    }, [empresaId]);

    const cargarConfig = async () => {
        try {
            setLoading(true);
            const res = await whatsappService.getConfig(empresaId);
            const d = res.data;
            if (d && d.config_id) {
                setConfig(prev => ({
                    ...prev,
                    habilitado: d.habilitado || 'N',
                    phone_number_id: d.phone_number_id || '',
                    waba_id: d.waba_id || '',
                    horas_anticipacion: d.horas_anticipacion || 24,
                    plantilla_recordatorio: d.plantilla_recordatorio || prev.plantilla_recordatorio,
                    // access_token NO viene en GET por seguridad
                }));
            }
        } catch (_) {
            // Si no hay config previa, usar defaults
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = () => {
        setConfig(prev => ({ ...prev, habilitado: prev.habilitado === 'S' ? 'N' : 'S' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!empresaId) return;
        try {
            setSaving(true);
            await whatsappService.saveConfig({ ...config, empresa_id: empresaId });
            showToast('Configuración guardada correctamente');
            // Limpiar token del estado por seguridad
            setConfig(prev => ({ ...prev, access_token: '' }));
        } catch (err) {
            showToast('Error al guardar: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!esSuperAdmin?.()) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-danger font-black text-sm uppercase tracking-widest">Acceso restringido a SuperAdmin</p>
            </div>
        );
    }

    const variables = ['{nombre}', '{fecha}', '{hora}', '{doctor}'];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Toast toast={toast} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate('/configuraciones')} className="p-2.5 rounded-xl hover:bg-surface-raised transition-all text-text-secondary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                            WhatsApp <span className="text-[#25D366]">Business</span>
                        </h1>
                        <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Mensajería automática de recordatorios para pacientes</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Aviso Meta API */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 flex gap-5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-1">Requisito Meta WhatsApp API</p>
                            <p className="text-text-secondary text-xs leading-relaxed">Para enviar mensajes de recordatorio (business-initiated), Meta requiere <strong className="text-text-primary">templates aprobados (HSM)</strong>. En desarrollo/pruebas se pueden enviar mensajes de texto libre solo a números que hayan interactuado con tu número en las últimas 24h. Solicitá la aprobación de templates en tu Meta Business Manager.</p>
                        </div>
                    </div>

                    {/* Toggle habilitado */}
                    <div className="bg-surface-card rounded-3xl border border-border p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-black text-text-primary uppercase tracking-tight">Estado del módulo</p>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mt-1">
                                    {config.habilitado === 'S' ? 'WhatsApp habilitado para esta empresa' : 'WhatsApp deshabilitado para esta empresa'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggle}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${config.habilitado === 'S' ? 'bg-[#25D366]' : 'bg-surface-raised border border-border'}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${config.habilitado === 'S' ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Credenciales Meta API */}
                    <div className="bg-surface-card rounded-3xl border border-border overflow-hidden">
                        <div className="px-8 py-5 border-b border-border bg-surface-raised/50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </div>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Credenciales Meta WhatsApp Cloud API</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-2">Phone Number ID</label>
                                    <input
                                        type="text"
                                        name="phone_number_id"
                                        value={config.phone_number_id}
                                        onChange={handleChange}
                                        placeholder="123456789012345"
                                        className="w-full px-5 py-3.5 bg-surface-raised border border-border rounded-2xl text-text-primary text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                    <p className="text-[9px] text-text-secondary opacity-30 mt-1 font-black uppercase">Meta Business Manager → WhatsApp → Phone Numbers</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-2">WABA ID</label>
                                    <input
                                        type="text"
                                        name="waba_id"
                                        value={config.waba_id}
                                        onChange={handleChange}
                                        placeholder="123456789012345"
                                        className="w-full px-5 py-3.5 bg-surface-raised border border-border rounded-2xl text-text-primary text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                    <p className="text-[9px] text-text-secondary opacity-30 mt-1 font-black uppercase">WhatsApp Business Account ID</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-2">
                                    Access Token {config.phone_number_id && <span className="text-amber-500">(dejar vacío para mantener el actual)</span>}
                                </label>
                                <input
                                    type="password"
                                    name="access_token"
                                    value={config.access_token}
                                    onChange={handleChange}
                                    placeholder="EAAxxxxxxxx..."
                                    className="w-full px-5 py-3.5 bg-surface-raised border border-border rounded-2xl text-text-primary text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                                />
                                <p className="text-[9px] text-text-secondary opacity-30 mt-1 font-black uppercase">Token de larga duración del System User de Meta Business</p>
                            </div>
                            <div className="md:w-48">
                                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-2">Horas de anticipación</label>
                                <input
                                    type="number"
                                    name="horas_anticipacion"
                                    value={config.horas_anticipacion}
                                    onChange={handleChange}
                                    min="1"
                                    max="72"
                                    className="w-full px-5 py-3.5 bg-surface-raised border border-border rounded-2xl text-text-primary text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                                />
                                <p className="text-[9px] text-text-secondary opacity-30 mt-1 font-black uppercase">Horas antes de la cita para enviar recordatorio</p>
                            </div>
                        </div>
                    </div>

                    {/* Plantilla de mensaje */}
                    <div className="bg-surface-card rounded-3xl border border-border overflow-hidden">
                        <div className="px-8 py-5 border-b border-border bg-surface-raised/50">
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Plantilla de recordatorio de cita</p>
                        </div>
                        <div className="p-8 space-y-4">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {variables.map(v => (
                                    <span key={v} className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full border border-primary/20 uppercase tracking-wider">{v}</span>
                                ))}
                                <span className="text-[9px] text-text-secondary opacity-30 font-black uppercase self-center ml-1">variables disponibles</span>
                            </div>
                            <textarea
                                name="plantilla_recordatorio"
                                value={config.plantilla_recordatorio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-5 py-4 bg-surface-raised border border-border rounded-2xl text-text-primary text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                            />
                            {/* Preview */}
                            <div className="bg-[#25D366]/5 border border-[#25D366]/10 rounded-2xl p-5">
                                <p className="text-[9px] font-black text-[#25D366] uppercase tracking-widest mb-2 opacity-60">Vista previa</p>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {config.plantilla_recordatorio
                                        .replace('{nombre}', 'Juan Pérez')
                                        .replace('{fecha}', '28/02/2026')
                                        .replace('{hora}', '10:30')
                                        .replace('{doctor}', 'García')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/configuraciones')}
                            className="px-8 py-4 rounded-2xl border-2 border-border text-text-secondary font-black text-[10px] uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-10 py-4 rounded-2xl bg-[#25D366] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#25D366]/20 hover:bg-[#20b858] hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar configuración'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
