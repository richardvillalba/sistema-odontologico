import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pacientesService } from '../services/api';
import { calculateAge, formatDate } from '../utils/format';
import Odontograma3D from '../components/odontograma/Odontograma3D';
import PlanTratamiento from '../components/tratamientos/PlanTratamiento';
import HistoriaClinica from '../components/historia/HistoriaClinica';

const PacienteDetalle = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('info');

    // Queries
    const { data: patientRes, isLoading: loadingPatient } = useQuery({
        queryKey: ['paciente', id],
        queryFn: () => pacientesService.getById(id),
    });

    const paciente = patientRes?.data?.items?.[0];

    if (loadingPatient) return <div className="p-20 text-center animate-pulse font-bold text-slate-400">Cargando expediente...</div>;
    if (!paciente) return <div className="p-20 text-center text-rose-500 font-bold text-xl">Paciente no encontrado.</div>;

    const tabs = [
        { id: 'info', label: 'Información Personal', icon: '👤' },
        { id: 'odontograma', label: 'Odontograma', icon: '🦷' },
        { id: 'historia', label: 'Historia Clínica', icon: '📋' },
        { id: 'tratamientos', label: 'Tratamientos', icon: '💊' },
        { id: 'archivos', label: 'Archivos / Rayos X', icon: '📁' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Cabecera del Expediente */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center text-4xl font-black text-primary border border-white/10">
                        {paciente.nombre?.charAt(0)}{paciente.apellido?.charAt(0)}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <h1 className="text-4xl font-black tracking-tight">{paciente.nombre_completo}</h1>
                            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">ACTIVO</span>
                        </div>
                        <div className="flex flex-wrap gap-6 mt-3 text-slate-400 font-medium">
                            <span className="flex items-center gap-2">🆔 {paciente.documento_numero}</span>
                            <span className="flex items-center gap-2">📂 HC: {paciente.numero_historia}</span>
                            <span className="flex items-center gap-2">🎂 {calculateAge(paciente.fecha_nacimiento)} años</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl font-bold transition-all">Editar Perfil</button>
                        <button className="bg-primary hover:bg-blue-600 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all">Nueva Cita</button>
                    </div>
                </div>
            </div>

            {/* Navegación por Pestañas */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === tab.id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Contenido Dinámico */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm min-h-[400px]">
                        {activeTab === 'info' && (
                            <div className="space-y-8 animate-in slide-in-from-left-2 duration-300">
                                <h3 className="text-xl font-black text-slate-800">Detalles de Contacto</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fecha de Nacimiento</p>
                                        <p className="font-bold text-slate-700">{formatDate(paciente.fecha_nacimiento)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Género</p>
                                        <p className="font-bold text-slate-700">{paciente.genero === 'M' ? 'Masculino' : 'Femenino'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Teléfono Principal</p>
                                        <p className="font-bold text-slate-700">{paciente.telefono_principal}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Correo Electrónico</p>
                                        <p className="font-bold text-slate-700">{paciente.email}</p>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dirección Residencial</p>
                                        <p className="font-bold text-slate-700">{paciente.direccion_calle || 'Sin dirección registrada'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'odontograma' && <Odontograma3D />}

                        {activeTab === 'historia' && <HistoriaClinica pacienteId={id} paciente={paciente} />}

                        {activeTab === 'tratamientos' && <PlanTratamiento pacienteId={id} />}

                        {activeTab === 'archivos' && (
                            <div className="text-center py-40">
                                <div className="text-4xl mb-4">🏗️</div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest">Módulo en Desarrollo</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar del Expediente */}
                <div className="space-y-8">
                    {/* Alertas Críticas */}
                    <div className="bg-rose-600 rounded-3xl p-6 text-white shadow-xl">
                        <h4 className="font-black text-sm uppercase tracking-widest mb-4 opacity-80">Importante</h4>
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚡</span>
                            <p className="text-sm font-bold leading-relaxed">
                                {paciente.alergias || 'No se han reportado alergias críticas para este paciente.'}
                            </p>
                        </div>
                    </div>

                    {/* Resumen de Cuenta */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                        <h4 className="font-black text-sm uppercase text-slate-400 tracking-widest mb-6">Estado de Cuenta</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                                <span className="text-xs font-bold text-slate-500">Saldo Pendiente</span>
                                <span className="text-xl font-black text-rose-600">0 Gs</span>
                            </div>
                            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-slate-900/10">Ver Facturación</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PacienteDetalle;
