import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { citasService } from '../services/api';

const Citas = () => {
    const navigate = useNavigate();
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterStatus, setFilterStatus] = useState('');

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['citas', filterDate, filterStatus],
        queryFn: () => citasService.getAll({
            empresa_id: 1,
            fecha: filterDate,
            estado: filterStatus || undefined
        }),
    });

    const citas = data?.data?.items || [];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'COMPLETADA': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'CANCELADA': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'CONFIRMADA': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'PENDIENTE': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Agenda de Citas</h1>
                    <p className="text-slate-500 font-medium">Gestiona los turnos y el flujo de pacientes de hoy.</p>
                </div>
                <button className="bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 w-fit">
                    <span className="text-2xl">+</span> Nueva Cita
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap gap-6 items-end">
                <div className="flex-1 min-w-[240px] space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Consulta</label>
                    <div className="relative">
                        <input
                            type="date"
                            className="w-full pl-4 pr-10 py-3 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-bold text-slate-700"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 min-w-[240px] space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filtrar por Estado</label>
                    <select
                        className="w-full px-4 py-3 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-primary/20 transition-all font-bold text-slate-700 cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="PENDIENTE">⏳ Pendientes</option>
                        <option value="CONFIRMADA">✅ Confirmadas</option>
                        <option value="COMPLETADA">✨ Completadas</option>
                        <option value="CANCELADA">❌ Canceladas</option>
                    </select>
                </div>
                <button
                    onClick={() => { setFilterDate(new Date().toISOString().split('T')[0]); setFilterStatus(''); }}
                    className="h-[52px] px-6 text-primary font-black text-sm hover:bg-primary/5 rounded-2xl transition-all"
                >
                    Hoy
                </button>
            </div>

            {/* Citas Desktop List */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-24 text-center">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400 font-bold">Cargando agenda...</p>
                    </div>
                ) : isError ? (
                    <div className="p-16 text-center text-rose-500 font-bold bg-rose-50 border-b border-rose-100">
                        Error al sincronizar: {error.message}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Horario</th>
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Paciente</th>
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Doctor / Servicio</th>
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Estado</th>
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {citas.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-32 text-center space-y-4">
                                            <div className="text-5xl opacity-20">📅</div>
                                            <div>
                                                <p className="text-slate-900 font-black text-xl">Sin citas programadas</p>
                                                <p className="text-slate-400 font-medium">No hay registros para este filtro.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    citas.map((cita) => (
                                        <tr key={cita.cita_id} className="hover:bg-slate-50/80 transition-all group">
                                            <td className="p-5">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-black text-primary tabular-nums tracking-tighter">
                                                        {cita.hora_inicio || '00:00'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Aproximado</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                        {cita.paciente_nombre?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                            {cita.paciente_nombre}
                                                        </div>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase">Paciente ID # {cita.paciente_id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-400">👨‍⚕️</span>
                                                    <div>
                                                        <p className="font-bold text-slate-700">{cita.doctor_nombre || 'Dr. Sin Asignar'}</p>
                                                        <p className="text-xs text-slate-500 italic max-w-xs truncate">{cita.motivo_consulta || 'Consulta General'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${getStatusStyle(cita.estado)}`}>
                                                    {cita.estado}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        className="p-3 bg-white border border-slate-200 text-slate-600 hover:text-white hover:bg-primary hover:border-primary hover:shadow-md rounded-2xl transition-all"
                                                        onClick={() => navigate(`/pacientes/${cita.paciente_id}`)}
                                                        title="Ver Expediente"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        className="p-3 bg-white border border-slate-200 text-slate-600 hover:text-white hover:bg-emerald-600 hover:border-emerald-600 hover:shadow-md rounded-2xl transition-all"
                                                        title="Completar Cita"
                                                    >
                                                        ✅
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Citas;
