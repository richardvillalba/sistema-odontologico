import { useState, useEffect, useRef } from 'react';
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

const EstadoBadge = ({ state }) => {
    const map = {
        connected:    { label: 'Conectado',    cls: 'bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20' },
        qr:           { label: 'Esperando QR', cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
        connecting:   { label: 'Conectando…',  cls: 'bg-primary/10 text-primary border-primary/20' },
        disconnected: { label: 'Desconectado', cls: 'bg-danger/10 text-danger border-danger/20' },
    };
    const { label, cls } = map[state] || map.disconnected;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${state === 'connected' ? 'bg-[#25D366] animate-pulse' : 'bg-current opacity-60'}`} />
            {label}
        </span>
    );
};

export default function ConfiguracionWhatsApp() {
    const navigate    = useNavigate();
    const { empresaActiva, esSuperAdmin } = useAuth();
    const empresaId   = empresaActiva?.empresa_id;
    const pollRef     = useRef(null);

    const [loading,   setLoading]  = useState(true);
    const [saving,    setSaving]   = useState(false);
    const [toast,     setToast]    = useState(null);
    const [waState,   setWaState]  = useState('disconnected');
    const [qrImage,   setQrImage]  = useState(null);
    const [horaEnvio, setHoraEnvio]   = useState(8);
    const [minutoEnvio, setMinutoEnvio] = useState(0);

    const [config, setConfig] = useState({
        habilitado:             'N',
        horas_anticipacion:     24,
        plantilla_recordatorio: 'Hola {nombre}, te recordamos tu cita el {fecha} a las {hora} con Dr/a. {doctor}. Cualquier consulta comunicate con nosotros.',
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Cargar config de ORDS ──────────────────────────────────────────────────
    useEffect(() => {
        if (empresaId) cargarConfig();
    }, [empresaId]);

    const cargarConfig = async () => {
        try {
            setLoading(true);
            const [ordsRes, srvRes] = await Promise.allSettled([
                whatsappService.getConfig(empresaId),
                whatsappService.getServerConfig(empresaId),
            ]);
            if (ordsRes.status === 'fulfilled') {
                const d = ordsRes.value.data;
                if (d?.config_id) {
                    setConfig(prev => ({
                        ...prev,
                        habilitado:             d.habilitado             || 'N',
                        horas_anticipacion:     d.horas_anticipacion     || 24,
                        plantilla_recordatorio: d.plantilla_recordatorio || prev.plantilla_recordatorio,
                    }));
                }
            }
            if (srvRes.status === 'fulfilled') {
                const s = srvRes.value.data;
                setHoraEnvio(s.hora_envio   ?? 8);
                setMinutoEnvio(s.minuto_envio ?? 0);
            }
        } catch (_) {
            // Sin config previa → usar defaults
        } finally {
            setLoading(false);
        }
    };

    // ── Polling de estado Baileys ──────────────────────────────────────────────
    const fetchStatus = async () => {
        if (!empresaId) return;
        try {
            const res = await whatsappService.getStatus(empresaId);
            const d   = res.data;
            setWaState(d.state || 'disconnected');
            setQrImage(d.qr   || null);
        } catch (_) {
            setWaState('disconnected');
            setQrImage(null);
        }
    };

    useEffect(() => {
        if (!empresaId) return;
        fetchStatus();
        pollRef.current = setInterval(fetchStatus, 4000);
        return () => clearInterval(pollRef.current);
    }, [empresaId]);

    useEffect(() => {
        if (waState === 'connected') clearInterval(pollRef.current);
    }, [waState]);

    const handleConectar = async () => {
        try {
            await whatsappService.conectar(empresaId);
            // reanudar polling para capturar el QR
            clearInterval(pollRef.current);
            pollRef.current = setInterval(fetchStatus, 4000);
            fetchStatus();
        } catch (err) {
            showToast('Error al conectar: ' + err.message, 'error');
        }
    };

    const handleDesconectar = async () => {
        try {
            await whatsappService.desconectar(empresaId);
            setWaState('disconnected');
            setQrImage(null);
            showToast('WhatsApp desconectado');
        } catch (err) {
            showToast('Error al desconectar: ' + err.message, 'error');
        }
    };

    const handleCambiarNumero = async () => {
        try {
            await whatsappService.resetSesion(empresaId);
            setWaState('connecting');
            setQrImage(null);
            clearInterval(pollRef.current);
            pollRef.current = setInterval(fetchStatus, 4000);
            showToast('Sesión reiniciada — escaneá el nuevo QR');
        } catch (err) {
            showToast('Error al reiniciar sesión: ' + err.message, 'error');
        }
    };

    // ── Guardar config ─────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!empresaId) return;
        try {
            setSaving(true);
            await Promise.all([
                whatsappService.saveConfig({ ...config, empresa_id: empresaId }),
                whatsappService.saveServerConfig({ empresa_id: empresaId, hora_envio: horaEnvio, minuto_envio: minutoEnvio }),
            ]);
            showToast('Configuración guardada correctamente');
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
                <EstadoBadge state={waState} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-32">
                    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-8">

                    {/* Panel de conexión Baileys */}
                    <div className="bg-surface-card rounded-3xl border border-border overflow-hidden">
                        <div className="px-8 py-5 border-b border-border bg-surface-raised/50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                                <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </div>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Conexión WhatsApp Web (Baileys)</p>
                        </div>

                        <div className="p-8">
                            {waState === 'connected' && (
                                <div className="flex items-center justify-between gap-5">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-black text-text-primary text-lg">WhatsApp conectado</p>
                                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mt-1">
                                                Listo para enviar mensajes en esta empresa
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={handleCambiarNumero}
                                            className="px-5 py-2.5 rounded-2xl border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/10 transition-all"
                                        >
                                            Cambiar número
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDesconectar}
                                            className="px-5 py-2.5 rounded-2xl border border-danger/30 text-danger text-[10px] font-black uppercase tracking-widest hover:bg-danger/10 transition-all"
                                        >
                                            Desconectar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {waState === 'qr' && qrImage && (
                                <div className="flex flex-col md:flex-row items-center gap-10">
                                    <div className="bg-white p-4 rounded-3xl shadow-lg border border-border flex-shrink-0">
                                        <img src={qrImage} alt="QR WhatsApp" className="w-52 h-52" />
                                    </div>
                                    <div className="space-y-4">
                                        <p className="font-black text-text-primary text-xl">Escaneá este código QR</p>
                                        <ol className="space-y-2 text-sm text-text-secondary">
                                            <li className="flex gap-2"><span className="font-black text-primary">1.</span> Abrí WhatsApp en tu celular</li>
                                            <li className="flex gap-2"><span className="font-black text-primary">2.</span> Tocá los 3 puntos → <strong className="text-text-primary">Dispositivos vinculados</strong></li>
                                            <li className="flex gap-2"><span className="font-black text-primary">3.</span> Tocá <strong className="text-text-primary">Vincular un dispositivo</strong></li>
                                            <li className="flex gap-2"><span className="font-black text-primary">4.</span> Apuntá la cámara al código QR</li>
                                        </ol>
                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">El QR se actualiza automáticamente cada 4 segundos</p>
                                    </div>
                                </div>
                            )}

                            {waState === 'connecting' && (
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <p className="text-text-secondary font-black text-sm uppercase tracking-widest">Iniciando conexión con WhatsApp…</p>
                                </div>
                            )}

                            {waState === 'disconnected' && (
                                <div className="flex items-start justify-between gap-5">
                                    <div className="flex items-start gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-black text-text-primary mb-1">No conectado para esta empresa</p>
                                            <p className="text-sm text-text-secondary">Hacé clic en "Conectar" para vincular un número de WhatsApp.</p>
                                            <code className="block mt-3 px-4 py-3 bg-surface-raised rounded-xl text-xs text-primary font-mono border border-border">
                                                Asegurate que el servidor esté corriendo: npm start
                                            </code>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleConectar}
                                        className="flex-shrink-0 px-5 py-2.5 rounded-2xl bg-[#25D366] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#25D366]/20 hover:bg-[#20b858] transition-all"
                                    >
                                        Conectar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Toggle habilitado */}
                        <div className="bg-surface-card rounded-3xl border border-border p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-black text-text-primary uppercase tracking-tight">Estado del módulo</p>
                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mt-1">
                                        {config.habilitado === 'S' ? 'Recordatorios automáticos habilitados' : 'Recordatorios automáticos deshabilitados'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setConfig(prev => ({ ...prev, habilitado: prev.habilitado === 'S' ? 'N' : 'S' }))}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${config.habilitado === 'S' ? 'bg-[#25D366]' : 'bg-surface-raised border border-border'}`}
                                >
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${config.habilitado === 'S' ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Configuración de recordatorio */}
                        <div className="bg-surface-card rounded-3xl border border-border overflow-hidden">
                            <div className="px-8 py-5 border-b border-border bg-surface-raised/50">
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Configuración de recordatorios</p>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-2">Horas de anticipación</label>
                                        <input
                                            type="number"
                                            name="horas_anticipacion"
                                            value={config.horas_anticipacion}
                                            onChange={e => setConfig(prev => ({ ...prev, horas_anticipacion: e.target.value }))}
                                            min="1"
                                            max="72"
                                            className="w-full px-5 py-3.5 bg-surface-raised border border-border rounded-2xl text-text-primary text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                                        />
                                        <p className="text-[9px] text-text-secondary opacity-30 mt-1 font-black uppercase">Horas antes de la cita para enviar recordatorio</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-2">Hora de envío automático</label>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={horaEnvio}
                                                onChange={e => setHoraEnvio(Number(e.target.value))}
                                                className="flex-1 px-5 py-3.5 bg-surface-raised border border-border rounded-2xl text-text-primary text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                                            >
                                                {Array.from({ length: 24 }, (_, i) => (
                                                    <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                                                ))}
                                            </select>
                                            <span className="text-text-secondary font-black text-lg">:</span>
                                            <select
                                                value={minutoEnvio}
                                                onChange={e => setMinutoEnvio(Number(e.target.value))}
                                                className="flex-1 px-5 py-3.5 bg-surface-raised border border-border rounded-2xl text-text-primary text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                                            >
                                                {[0, 15, 30, 45].map(m => (
                                                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <p className="text-[9px] text-text-secondary opacity-30 mt-1 font-black uppercase">Hora del día para enviar recordatorios automáticos</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-2">Plantilla de recordatorio</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {variables.map(v => (
                                            <span key={v} className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full border border-primary/20 uppercase tracking-wider">{v}</span>
                                        ))}
                                        <span className="text-[9px] text-text-secondary opacity-30 font-black uppercase self-center ml-1">variables disponibles</span>
                                    </div>
                                    <textarea
                                        name="plantilla_recordatorio"
                                        value={config.plantilla_recordatorio}
                                        onChange={e => setConfig(prev => ({ ...prev, plantilla_recordatorio: e.target.value }))}
                                        rows={4}
                                        className="w-full px-5 py-4 bg-surface-raised border border-border rounded-2xl text-text-primary text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                                    />
                                    <div className="bg-[#25D366]/5 border border-[#25D366]/10 rounded-2xl p-5 mt-3">
                                        <p className="text-[9px] font-black text-[#25D366] uppercase tracking-widest mb-2 opacity-60">Vista previa</p>
                                        <p className="text-text-secondary text-sm leading-relaxed">
                                            {config.plantilla_recordatorio
                                                .replace('{nombre}', 'Juan Pérez')
                                                .replace('{fecha}',  '28/02/2026')
                                                .replace('{hora}',   '10:30')
                                                .replace('{doctor}', 'García')}
                                        </p>
                                    </div>
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
                                {saving ? 'Guardando…' : 'Guardar configuración'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
