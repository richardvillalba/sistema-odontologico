import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { billingService, cajaService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FacturasList from '../components/facturacion/FacturasList';

const Facturas = () => {
    const navigate = useNavigate();
    const { usuario, empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;
    const usuarioId = usuario?.usuario_id;
    const esSuperAdmin = usuario?.es_superadmin === 'S';

    // Verificar si el usuario tiene caja asignada
    const { data: cajasData } = useQuery({
        queryKey: ['cajas-usuario', empresaId, usuarioId],
        queryFn: () => cajaService.listar(empresaId),
    });
    const cajasUsuario = esSuperAdmin
        ? (cajasData?.data?.items || [])
        : (cajasData?.data?.items || []).filter(c => c.usuario_asignado_id === usuarioId || !c.usuario_asignado_id);
    const tieneCaja = cajasUsuario.length > 0;

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight uppercase">Facturación</h1>
                    <p className="text-text-secondary font-medium text-sm md:text-base">Gestiona los comprobantes y pagos de la clínica.</p>
                </div>
                <div className="flex items-center gap-3">
                    {!tieneCaja && !esSuperAdmin && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-warning-light/20 border border-warning/20 rounded-xl">
                            <span className="text-[10px] font-black text-warning-dark uppercase tracking-widest">⚠️ Sin caja asignada</span>
                        </div>
                    )}
                    <button
                        onClick={() => navigate('/facturas/nueva')}
                        disabled={!tieneCaja && !esSuperAdmin}
                        className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 shadow-xl ${tieneCaja || esSuperAdmin
                            ? 'bg-primary hover:bg-primary-dark text-white shadow-primary/30'
                            : 'bg-surface-raised text-text-secondary opacity-50 cursor-not-allowed border border-border shadow-none'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        <span className="hidden sm:inline">Emitir</span> Factura
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-surface-card p-6 rounded-[2rem] shadow-sm border border-border grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest px-1">Estado</label>
                    <select
                        name="estado"
                        value={filters.estado}
                        onChange={handleFilterChange}
                        className="w-full bg-surface-raised border-border rounded-xl px-4 py-3 text-sm font-black text-text-primary focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                    >
                        <option value="">Todos los estados</option>
                        <option value="BORRADOR">Borrador</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="PAGADA">Pagada</option>
                        <option value="PARCIAL">Parcial</option>
                        <option value="ANULADA">Anulada</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest px-1">Desde</label>
                    <input
                        type="date"
                        name="fecha_desde"
                        value={filters.fecha_desde}
                        onChange={handleFilterChange}
                        className="w-full bg-surface-raised border-border rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary opacity-60 uppercase tracking-widest px-1">Hasta</label>
                    <input
                        type="date"
                        name="fecha_hasta"
                        value={filters.fecha_hasta}
                        onChange={handleFilterChange}
                        className="w-full bg-surface-raised border-border rounded-xl px-4 py-2.5 text-sm font-medium text-text-primary focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilters({ estado: '', fecha_desde: '', fecha_hasta: '', limit: 50, offset: 0 })}
                        className="flex-1 bg-surface-raised hover:bg-surface text-text-secondary font-black py-3 rounded-xl text-[10px] transition-all uppercase tracking-widest border border-border"
                    >
                        Limpiar
                    </button>
                    <button
                        onClick={() => refetch()}
                        className="flex-1 bg-primary text-white font-black py-3 rounded-xl text-[10px] transition-all uppercase tracking-widest shadow-lg shadow-primary/20"
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
                    <p className="text-[10px] text-text-secondary opacity-60 italic font-black uppercase tracking-widest">Mostrando {facturas.length} de {totalRegistros} facturas</p>
                </div>
            )}
        </div>
    );
};

export default Facturas;
