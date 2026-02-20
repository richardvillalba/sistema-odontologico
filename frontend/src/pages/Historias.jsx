import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { historiasService, pacientesService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/format';

const Historias = () => {
    const navigate = useNavigate();
    const { empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;
    const [search, setSearch] = useState('');

    // Podemos usar un endpoint que traiga "todas" las historias de la empresa
    // O simplemente buscar por paciente. Por ahora, asumiremos que getByPaciente 
    // sin pacienteId podría traer todas si el backend lo soporta, o necesitaremos un nuevo endpoint.
    // Dado que no tenemos un endpoint de "todas las historias", buscaremos pacientes primero.

    const { data: pacientesRes, isLoading: loadingPacientes } = useQuery({
        queryKey: ['pacientes-search', search, empresaId],
        queryFn: () => pacientesService.search(search, { empresa_id: empresaId }),
        enabled: search.length > 2
    });

    const pacientes = pacientesRes?.data?.items || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <span className="text-8xl">📋</span>
                </div>
                <div className="relative">
                    <h1 className="text-3xl font-black tracking-tight">Historias Clínicas</h1>
                    <p className="text-slate-400 mt-2 font-medium max-w-xl">
                        Gestión centralizada de expedientes y consultas odontológicas de la clínica.
                    </p>
                </div>
            </div>

            {/* Buscador y Filtros */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar paciente por nombre, apellido o documento..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all whitespace-nowrap">
                        Filtros Avanzados
                    </button>
                </div>
            </div>

            {/* Resultados / Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {search.length <= 2 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="text-5xl mb-4">🔎</div>
                        <h3 className="text-xl font-black text-slate-800">Busca un paciente</h3>
                        <p className="text-slate-400 mt-2 font-medium">Ingresa al menos 3 caracteres para ver su historial clínico</p>
                    </div>
                )}

                {search.length > 2 && loadingPacientes && (
                    <div className="col-span-full py-20 text-center animate-pulse">
                        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Buscando expedientes...</p>
                    </div>
                )}

                {search.length > 2 && !loadingPacientes && pacientes.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200">
                        <div className="text-5xl mb-4">😕</div>
                        <h3 className="text-xl font-black text-slate-800">Sin resultados</h3>
                        <p className="text-slate-400 mt-2 font-medium">No encontramos pacientes que coincidan con "{search}"</p>
                    </div>
                )}

                {pacientes.map(p => (
                    <div
                        key={p.paciente_id}
                        onClick={() => navigate(`/pacientes/${p.paciente_id}?tab=historia`)}
                        className="group bg-white rounded-[2rem] p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-500">
                            <span className="text-6xl">🦷</span>
                        </div>

                        <div className="flex items-center gap-4 mb-6 relative">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                {p.nombre?.charAt(0)}{p.apellido?.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{p.nombre_completo}</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{p.documento_numero}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Última Consulta</p>
                                    <p className="text-sm font-bold text-slate-600">{p.ultima_consulta ? formatDate(p.ultima_consulta) : 'Sin registros'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nro. Expediente</p>
                                    <p className="text-sm font-bold text-slate-600">HC-{p.paciente_id.toString().padStart(4, '0')}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-blue-600">
                                <span className="text-xs font-black uppercase tracking-widest">Abrir Expediente</span>
                                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Historias;
