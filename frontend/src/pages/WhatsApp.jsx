import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { whatsappService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EstadoBadge = ({ estado }) => {
    const styles = {
        ENVIADO:   'bg-accent/10 text-accent',
        ERROR:     'bg-danger/10 text-danger',
        PENDIENTE: 'bg-surface-raised text-text-secondary',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[estado] || styles.PENDIENTE}`}>
            {estado}
        </span>
    );
};

// Modal para enviar mensaje manual
const ModalEnviar = ({ onClose, onSend, loading }) => {
    const { empresaActiva } = useAuth();
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-surface-card rounded-[2rem] shadow-2xl border border-border p-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-6">Enviar mensaje</h3>
                <div className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-2">Número de teléfono</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="595981234567 (con código de país)"
                            className="w-full px-5 py-3.5 bg-surface-raised border border-border rounded-2xl text-text-primary text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mb-2">Mensaje</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={4}
                            className="w-full px-5 py-4 bg-surface-raised border border-border rounded-2xl text-text-primary text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                        />
                    </div>
                </div>
                <div className="flex gap-4 mt-8">
                    <button onClick={onClose} className="flex-1 px-6 py-3.5 rounded-2xl border-2 border-border text-text-secondary font-black text-[10px] uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all">
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSend({ phone, message, empresa_id: empresaActiva?.empresa_id })}
                        disabled={loading || !phone || !message}
                        className="flex-1 px-6 py-3.5 rounded-2xl bg-[#25D366] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#25D366]/20 hover:bg-[#20b858] transition-all disabled:opacity-50"
                    >
                        {loading ? 'Enviando...' : 'Enviar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function WhatsApp() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const { data, isLoading } = useQuery({
        queryKey: ['wa-mensajes', empresaId],
        queryFn: () => whatsappService.getMensajes(empresaId),
        enabled: !!empresaId,
    });

    const enviarMutation = useMutation({
        mutationFn: (data) => whatsappService.enviarMensaje(data),
        onSuccess: (res) => {
            if (res.data?.success) {
                showToast('Mensaje enviado correctamente');
                queryClient.invalidateQueries(['wa-mensajes', empresaId]);
                setShowModal(false);
            } else {
                showToast('Error: ' + (res.data?.error || 'Error desconocido'), 'error');
            }
        },
        onError: (err) => showToast('Error: ' + err.message, 'error'),
    });

    const enviarRecordatoriosMutation = useMutation({
        mutationFn: () => whatsappService.ejecutarCron(),
        onSuccess: (res) => {
            const d = res.data;
            showToast(`Enviados: ${d?.enviados || 0}, Errores: ${d?.errores || 0}`);
            queryClient.invalidateQueries(['wa-mensajes', empresaId]);
        },
        onError: (err) => showToast('Error al ejecutar: ' + err.message, 'error'),
    });

    const mensajes = data?.data?.items || [];
    const hoy = new Date().toISOString().slice(0, 10);
    const enviadosHoy = mensajes.filter(m => m.estado === 'ENVIADO' && m.fecha_envio?.startsWith(hoy)).length;
    const errores = mensajes.filter(m => m.estado === 'ERROR').length;
    const tasaExito = mensajes.length > 0 ? Math.round((mensajes.filter(m => m.estado === 'ENVIADO').length / mensajes.length) * 100) : 0;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-4 duration-300 ${
                    toast.type === 'success' ? 'bg-surface-card border-accent/30 text-accent' : 'bg-surface-card border-danger/30 text-danger'
                }`}>
                    <span className="font-black text-[11px] uppercase tracking-widest">{toast.message}</span>
                </div>
            )}

            {showModal && (
                <ModalEnviar
                    onClose={() => setShowModal(false)}
                    onSend={(d) => enviarMutation.mutate(d)}
                    loading={enviarMutation.isPending}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center">
                        <svg className="w-7 h-7 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                            WhatsApp <span className="text-[#25D366]">Business</span>
                        </h1>
                        <p className="text-text-secondary font-black mt-1 text-[10px] uppercase tracking-widest opacity-40">Mensajería y recordatorios automáticos</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => enviarRecordatoriosMutation.mutate()}
                        disabled={enviarRecordatoriosMutation.isPending}
                        className="px-6 py-3.5 rounded-2xl border-2 border-[#25D366]/30 text-[#25D366] font-black text-[10px] uppercase tracking-widest hover:bg-[#25D366]/10 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        {enviarRecordatoriosMutation.isPending ? 'Enviando...' : 'Enviar recordatorios'}
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#25D366] text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#25D366]/20 hover:bg-[#20b858] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Nuevo mensaje
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-card rounded-3xl border border-border p-8">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mb-3">Enviados hoy</p>
                    <p className="text-4xl font-black text-[#25D366]">{enviadosHoy}</p>
                </div>
                <div className="bg-surface-card rounded-3xl border border-border p-8">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mb-3">Errores</p>
                    <p className={`text-4xl font-black ${errores > 0 ? 'text-danger' : 'text-text-primary'}`}>{errores}</p>
                </div>
                <div className="bg-surface-card rounded-3xl border border-border p-8">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mb-3">Tasa de éxito</p>
                    <p className="text-4xl font-black text-text-primary">{tasaExito}<span className="text-2xl opacity-40">%</span></p>
                </div>
            </div>

            {/* Historial */}
            <div className="bg-surface-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                <div className="px-10 py-6 border-b border-border bg-surface-raised/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center border border-[#25D366]/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </div>
                        <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Historial de mensajes</h3>
                    </div>
                    <button
                        onClick={() => navigate('/configuraciones/whatsapp')}
                        className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-primary transition-all"
                    >
                        Configurar
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-8 h-8 border-2 border-[#25D366]/20 border-t-[#25D366] rounded-full animate-spin" />
                    </div>
                ) : mensajes.length === 0 ? (
                    <div className="py-32 text-center">
                        <div className="w-20 h-20 bg-surface-raised rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-border">
                            <svg className="w-8 h-8 text-text-secondary opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </div>
                        <p className="text-text-secondary font-black uppercase text-[10px] tracking-[.2em] opacity-40">No hay mensajes enviados aún</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40 border-b border-border">
                                    <th className="px-8 py-5">Paciente</th>
                                    <th className="px-8 py-5">Teléfono</th>
                                    <th className="px-8 py-5">Mensaje</th>
                                    <th className="px-8 py-5">Fecha</th>
                                    <th className="px-8 py-5 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {mensajes.map((m) => (
                                    <tr key={m.log_id} className="hover:bg-surface-raised/30 transition-all">
                                        <td className="px-8 py-4">
                                            <span className="font-black text-sm text-text-primary">{m.paciente_nombre || '—'}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-sm text-text-secondary font-medium">{m.telefono}</span>
                                        </td>
                                        <td className="px-8 py-4 max-w-xs">
                                            <span className="text-xs text-text-secondary truncate block">{m.mensaje}</span>
                                            {m.error_detalle && <span className="text-[10px] text-danger block">{m.error_detalle}</span>}
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className="text-sm text-text-secondary">{m.fecha_envio}</span>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <EstadoBadge estado={m.estado} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
