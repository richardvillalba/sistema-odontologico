import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { billingService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FacturasList from '../components/facturacion/FacturasList';

const Facturas = () => {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const empresaId = usuario?.empresa_id || 1;
    const [filters, setFilters] = useState({
        estado: '',
        fecha_desde: '',
        fecha_hasta: '',
        limit: 50,
        offset: 0
    });

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['facturas', filters],
        queryFn: () => {
            // Filtrar parámetros vacíos - NO enviar limit ni offset
            const params = { empresa_id: empresaId };
            if (filters.estado) params.estado = filters.estado;
            if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde;
            if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta;

            return billingService.getFacturas(params);
        },
    });

    const facturas = data?.data?.items || [];
    const totalRegistros = data?.data?.total || 0;

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            offset: 0 // Reset pagination on filter change
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 uppercase">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Facturación</h1>
                    <p className="text-slate-500 font-medium normal-case">Gestiona los comprobantes y pagos de la clínica.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/facturas/nueva')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                    >
                        <span className="text-xl">+</span> Emitir Factura
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado</label>
                    <select
                        name="estado"
                        value={filters.estado}
                        onChange={handleFilterChange}
                        className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Todos los estados</option>
                        <option value="BORRADOR">Borrador</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="PAGADA">Pagada</option>
                        <option value="PARCIAL">Parcial</option>
                        <option value="ANULADA">Anulada</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Desde</label>
                    <input
                        type="date"
                        name="fecha_desde"
                        value={filters.fecha_desde}
                        onChange={handleFilterChange}
                        className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hasta</label>
                    <input
                        type="date"
                        name="fecha_hasta"
                        value={filters.fecha_hasta}
                        onChange={handleFilterChange}
                        className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilters({ estado: '', fecha_desde: '', fecha_hasta: '', limit: 50, offset: 0 })}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition-all uppercase"
                    >
                        Limpiar
                    </button>
                    <button
                        onClick={() => refetch()}
                        className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 font-bold py-2.5 rounded-xl text-xs transition-all uppercase"
                    >
                        Refrescar
                    </button>
                </div>
            </div>

            {/* List Table */}
            <FacturasList
                facturas={facturas}
                loading={isLoading}
                error={isError ? error.message : null}
            />

            {/* Pagination Placeholder */}
            {totalRegistros > filters.limit && (
                <div className="flex justify-center mt-6">
                    <p className="text-xs text-slate-400 italic font-medium">Mostrando {facturas.length} de {totalRegistros} facturas</p>
                </div>
            )}
        </div>
    );
};

export default Facturas;
