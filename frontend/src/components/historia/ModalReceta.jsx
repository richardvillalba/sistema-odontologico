import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historiasService } from '../../services/api';

const ModalReceta = ({ historiaId, pacienteId, doctorId, empresaId, pacienteNombre, doctorNombre, clinicaNombre, onClose }) => {
    const queryClient = useQueryClient();
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        medicamento: '',
        principio_activo: '',
        presentacion: '',
        concentracion: '',
        dosis: '',
        via_administracion: 'ORAL',
        duracion_dias: '',
        indicaciones: ''
    });

    const { data: recetasRes, isLoading: loadingRecetas } = useQuery({
        queryKey: ['prescripciones', historiaId, empresaId],
        queryFn: () => historiasService.getPrescripciones(historiaId, empresaId),
        enabled: !!historiaId && !!empresaId
    });

    const mutation = useMutation({
        mutationFn: (data) => historiasService.agregarPrescripcion(historiaId, data),
        onSuccess: (res) => {
            if (res.data?.success) {
                queryClient.invalidateQueries(['prescripciones', historiaId, empresaId]);
                setForm({
                    medicamento: '',
                    principio_activo: '',
                    presentacion: '',
                    concentracion: '',
                    dosis: '',
                    via_administracion: 'ORAL',
                    duracion_dias: '',
                    indicaciones: ''
                });
            } else {
                setError(res.data?.message || 'Error al guardar la receta');
            }
        },
        onError: (err) => setError(err.message)
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        if (!form.medicamento || !form.dosis) {
            setError('Medicamento y Dosis son obligatorios.');
            return;
        }
        mutation.mutate({
            ...form,
            paciente_id: pacienteId,
            doctor_id: doctorId,
            empresa_id: empresaId
        });
    };

    const handlePrint = () => {
        if (recetas.length === 0) return;

        const fecha = new Date().toLocaleDateString('es-PY', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const medicamentosHTML = recetas.map((r, i) => `
            <tr>
                <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-weight:700;font-size:13px;color:#1e293b;vertical-align:top;">
                    ${i + 1}.
                </td>
                <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;">
                    <div style="font-weight:800;font-size:14px;color:#1e293b;text-transform:uppercase;">${r.medicamento || ''}</div>
                    <div style="font-size:11px;color:#64748b;margin-top:2px;">
                        ${r.principio_activo || ''}${r.concentracion ? ' - ' + r.concentracion : ''}${r.presentacion ? ' (' + r.presentacion + ')' : ''}
                    </div>
                </td>
                <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;font-weight:600;">
                    ${r.dosis || ''}
                </td>
                <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;text-align:center;">
                    ${r.via_administracion || ''}
                </td>
                <td style="padding:10px 8px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;text-align:center;font-weight:600;">
                    ${r.duracion_dias ? r.duracion_dias + ' días' : ''}
                </td>
            </tr>
            ${r.indicaciones ? `
            <tr>
                <td></td>
                <td colspan="4" style="padding:4px 8px 12px;border-bottom:1px solid #e2e8f0;">
                    <div style="background:#fffbeb;border:1px solid #fef3c7;border-radius:6px;padding:6px 10px;font-size:11px;color:#92400e;font-style:italic;">
                        <strong>Indicaciones:</strong> ${r.indicaciones}
                    </div>
                </td>
            </tr>` : ''}
        `).join('');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
    <title>Receta - ${pacienteNombre || 'Paciente'}</title>
    <style>
        @page { size: A5 portrait; margin: 15mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; padding: 20px; max-width: 600px; margin: 0 auto; }
        @media print { body { padding: 0; } }
    </style>
</head>
<body>
    <div style="text-align:center;border-bottom:3px solid #1e293b;padding-bottom:16px;margin-bottom:20px;">
        <div style="font-size:22px;font-weight:900;letter-spacing:-0.5px;color:#1e293b;">${clinicaNombre || 'Clínica Odontológica'}</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Receta Médica</div>
    </div>

    <div style="display:flex;justify-content:space-between;margin-bottom:20px;gap:20px;">
        <div style="flex:1;">
            <div style="font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Paciente</div>
            <div style="font-size:15px;font-weight:800;color:#0f172a;">${pacienteNombre || '—'}</div>
        </div>
        <div style="text-align:right;">
            <div style="font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;">Fecha</div>
            <div style="font-size:13px;font-weight:700;color:#334155;">${fecha}</div>
        </div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
            <tr style="background:#f8fafc;">
                <th style="padding:8px;text-align:left;font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e2e8f0;width:30px;">#</th>
                <th style="padding:8px;text-align:left;font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e2e8f0;">Medicamento</th>
                <th style="padding:8px;text-align:left;font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e2e8f0;">Dosis</th>
                <th style="padding:8px;text-align:center;font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e2e8f0;">Vía</th>
                <th style="padding:8px;text-align:center;font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e2e8f0;">Duración</th>
            </tr>
        </thead>
        <tbody>
            ${medicamentosHTML}
        </tbody>
    </table>

    <div style="margin-top:50px;text-align:center;">
        <div style="border-top:2px solid #1e293b;width:250px;margin:0 auto;padding-top:8px;">
            <div style="font-size:13px;font-weight:800;color:#0f172a;">${doctorNombre || 'Doctor'}</div>
            <div style="font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Odontólogo/a</div>
        </div>
    </div>

    <script>window.onload = function() { window.print(); }</script>
</body>
</html>`);
        printWindow.document.close();
    };

    const recetas = recetasRes?.data?.items || [];

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Recetario Médico</h2>
                        <p className="text-slate-400 text-sm font-medium mt-1">Gestión de prescripciones para la consulta</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Formulario */}
                    <div className="w-full md:w-5/12 p-8 border-b md:border-b-0 md:border-r border-slate-100 overflow-y-auto">
                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                            <span className="text-xl">✍️</span> Nueva Prescripción
                        </h3>

                        {error && (
                            <div className="mb-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <span className="text-xl">⚠️</span>
                                <p className="text-xs text-rose-700 font-bold">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Medicamento *</label>
                                <input
                                    type="text" name="medicamento" value={form.medicamento} onChange={handleChange}
                                    placeholder="Nombre comercial"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Principio Activo</label>
                                <input
                                    type="text" name="principio_activo" value={form.principio_activo} onChange={handleChange}
                                    placeholder="Ej: Amoxicilina"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:bg-white focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Presentación</label>
                                    <input
                                        type="text" name="presentacion" value={form.presentacion} onChange={handleChange}
                                        placeholder="Cápsulas, Jarabe..."
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:bg-white focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Concentración</label>
                                    <input
                                        type="text" name="concentracion" value={form.concentracion} onChange={handleChange}
                                        placeholder="500mg, 1g..."
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:bg-white focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Dosis e Intervalo *</label>
                                <input
                                    type="text" name="dosis" value={form.dosis} onChange={handleChange}
                                    placeholder="1 cada 8 horas"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Vía</label>
                                    <select
                                        name="via_administracion" value={form.via_administracion} onChange={handleChange}
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all"
                                    >
                                        <option value="ORAL">Oral</option>
                                        <option value="TOPICA">Tópica</option>
                                        <option value="SUB-LINGUAL">Sub-lingual</option>
                                        <option value="INTRA-MUSCULAR">Intra-muscular</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Días</label>
                                    <input
                                        type="number" name="duracion_dias" value={form.duracion_dias} onChange={handleChange}
                                        placeholder="7"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Indicaciones Adicionales</label>
                                <textarea
                                    name="indicaciones" value={form.indicaciones} onChange={handleChange}
                                    rows="2"
                                    placeholder="Tomar después de las comidas..."
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:bg-white focus:border-primary outline-none transition-all resize-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                {mutation.isPending ? 'Agregando...' : '+ Agregar a Receta'}
                            </button>
                        </form>
                    </div>

                    {/* Lista de Prescripciones */}
                    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
                        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                            <span className="text-xl">📋</span> Medicamentos Prescritos
                        </h3>

                        {loadingRecetas ? (
                            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin mb-4"></div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando recetario...</p>
                            </div>
                        ) : recetas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="text-4xl mb-4 opacity-20">💊</div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No hay medicamentos prescritos</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recetas.map((r, idx) => (
                                    <div key={r.prescripcion_id || idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm group hover:border-primary/30 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-black text-slate-900 text-lg uppercase leading-tight">{r.medicamento}</h4>
                                                <p className="text-primary text-xs font-bold uppercase tracking-wider">{r.principio_activo} {r.concentracion}</p>
                                            </div>
                                            <div className="bg-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                                                {r.presentacion || 'Gral'}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-50">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dosis</p>
                                                <p className="text-sm font-bold text-slate-700">{r.dosis}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Duración</p>
                                                <p className="text-sm font-bold text-slate-700">{r.duracion_dias} días ({r.via_administracion})</p>
                                            </div>
                                        </div>
                                        {r.indicaciones && (
                                            <div className="mt-3 bg-amber-50 p-3 rounded-xl">
                                                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Indicaciones</p>
                                                <p className="text-xs font-medium text-amber-800 italic">{r.indicaciones}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Imprimir */}
                <div className="shrink-0 p-6 bg-white border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={handlePrint}
                        disabled={recetas.length === 0}
                        className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <span>🖨️</span> Imprimir Receta
                    </button>
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
                    >
                        Finalizar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalReceta;
