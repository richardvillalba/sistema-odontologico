import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { citasService, doctoresService } from '../services/api';

const AgendaDoctor = () => {
    const { doctorId: initialDoctorId } = useParams();
    const [selectedDoctor, setSelectedDoctor] = useState(initialDoctorId || '');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const { data: doctoresData } = useQuery({
        queryKey: ['doctores'],
        queryFn: () => doctoresService.getAll(),
    });

    const { data: agendaData, isLoading } = useQuery({
        queryKey: ['agenda', selectedDoctor, selectedDate],
        queryFn: () => selectedDoctor ? citasService.getAgenda(selectedDoctor, selectedDate) : null,
        enabled: !!selectedDoctor,
    });

    const doctores = doctoresData?.data?.items || [];
    const agenda = agendaData?.data?.items || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Agenda Médica</h1>
                <p className="text-slate-500">Vista diaria de citas por especialista.</p>
            </div>

            {/* Selectors */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Seleccionar Doctor</label>
                    <select
                        className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 transition-all py-2.5"
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                    >
                        <option value="">Seleccione un doctor...</option>
                        {doctores.map(d => (
                            <option key={d.usuario_id} value={d.usuario_id}>
                                {d.nombre_completo} ({d.especialidad})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Fecha</label>
                    <input
                        type="date"
                        className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 transition-all py-2.5"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Agenda Timeline */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden min-h-[500px]">
                <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <span className="text-primary text-xl">🕒</span> Cronograma del Día
                    </h3>
                    <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400 font-mono">
                        {selectedDate}
                    </span>
                </div>

                {!selectedDoctor ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 italic">
                        <span className="text-6xl mb-4 opacity-10">👨‍⚕️</span>
                        Por favor, seleccione un doctor para ver su agenda.
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : agenda.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                        <span className="text-5xl mb-4">✨</span>
                        <p className="font-bold">No hay citas programadas.</p>
                        <p className="text-xs text-slate-400">El doctor tiene el día libre o no hay turnos tomados.</p>
                    </div>
                ) : (
                    <div className="p-8 space-y-6">
                        {agenda.map((cita, idx) => (
                            <div key={idx} className="flex gap-6 group">
                                <div className="w-16 pt-1 text-right">
                                    <p className="text-sm font-black text-slate-900">{cita.hora_inicio}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{cita.duracion_minutos} min</p>
                                </div>
                                <div className="relative flex-1 pb-6 border-l-2 border-slate-100 pl-8 group-last:pb-0">
                                    {/* Point */}
                                    <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-white border-4 border-primary group-hover:scale-125 transition-transform"></div>

                                    {/* Card */}
                                    <div className="bg-slate-50 group-hover:bg-white group-hover:shadow-lg group-hover:border-primary/20 border border-slate-100 p-5 rounded-2xl transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-primary font-black text-xs tracking-widest mb-1">{cita.tipo_cita}</p>
                                                <h4 className="font-bold text-slate-800 text-lg leading-tight">{cita.paciente_nombre}</h4>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${cita.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                {cita.estado}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-sm italic">
                                            {cita.motivo_consulta || 'Sin observaciones'}
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4">
                                            <button className="text-xs font-bold text-slate-400 hover:text-primary transition-colors">Confirmar</button>
                                            <button className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">Cancelar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgendaDoctor;
