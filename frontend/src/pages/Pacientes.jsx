import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pacientesService } from '../services/api';
import { calculateAge, formatDate } from '../utils/format';

const Pacientes = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['pacientes', searchTerm],
        queryFn: () => searchTerm
            ? pacientesService.search(searchTerm)
            : pacientesService.getAll({ empresa_id: 1 }),
    });

    const pacientes = data?.data?.items || [];

    const getAvatarColor = (name) => {
        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];
        const index = name?.length % colors.length;
        return colors[index];
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pacientes</h1>
                    <p className="text-slate-500 font-medium">Gestiona la base de datos de tu clínica de manera eficiente.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-2">
                        📥 Exportar
                    </button>
                    <button className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                        <span className="text-xl">+</span> Registrar Paciente
                    </button>
                </div>
            </div>

            {/* Search & Stats Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-3">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, documento o número de historia..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-none focus:ring-0 text-slate-600 font-medium placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pacientes</p>
                        <p className="text-2xl font-black">{pacientes.length}</p>
                    </div>
                    <div className="text-3xl relative z-10">👥</div>
                    <div className="absolute -right-4 -bottom-4 bg-white/5 w-24 h-24 rounded-full"></div>
                </div>
            </div>

            {/* Table Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-24 text-center">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400 font-bold animate-pulse">Sincronizando pacientes...</p>
                    </div>
                ) : isError ? (
                    <div className="p-16 text-center">
                        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl inline-block mb-4">
                            ⚠️ Error de conexión: {error.message}
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Documento / HC</th>
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Edad</th>
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest">Contacto</th>
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Estado</th>
                                    <th className="p-5 font-black text-[10px] text-slate-400 uppercase tracking-widest text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pacientes.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center">
                                            <p className="text-slate-300 italic font-medium">No se encontraron pacientes que coincidan con tu búsqueda.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    pacientes.map((p) => (
                                        <tr key={p.paciente_id} className="hover:bg-slate-50/80 transition-all group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`${getAvatarColor(p.nombre)} w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-sm group-hover:scale-110 transition-transform`}>
                                                        {p.nombre?.charAt(0)}{p.apellido?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                            {p.nombre_completo || `${p.nombre} ${p.apellido}`}
                                                        </div>
                                                        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">Registrado en el sistema</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-bold text-slate-700">{p.documento_numero}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase">{p.numero_historia}</div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-bold text-slate-700">{calculateAge(p.fecha_nacimiento)} años</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase">{formatDate(p.fecha_nacimiento)}</div>
                                            </td>
                                            <td className="p-5">
                                                <div className="text-sm font-bold text-slate-700">{p.telefono_principal || 'Sin teléfono'}</div>
                                                <div className="text-xs text-slate-500 truncate max-w-[150px]">{p.email || 'Sin correo'}</div>
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${p.activo === 'S'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {p.activo === 'S' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-white hover:bg-primary hover:border-primary hover:shadow-md rounded-xl transition-all"
                                                        onClick={() => navigate(`/pacientes/${p.paciente_id}`)}
                                                        title="Ver Expediente"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-white hover:bg-secondary hover:border-secondary hover:shadow-md rounded-xl transition-all"
                                                        title="Nueva Cita"
                                                    >
                                                        📅
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

export default Pacientes;
