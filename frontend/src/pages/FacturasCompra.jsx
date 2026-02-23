import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { comprasService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EstadoBadge = ({ estado }) => {
    const styles = {
        REGISTRADA: 'bg-secondary/10 text-secondary',
        ANULADA:    'bg-danger/10 text-danger',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[estado] || 'bg-surface text-text-secondary'}`}>
            {estado}
        </span>
    );
};

export default function FacturasCompra() {
    const navigate = useNavigate();
    const { empresaActiva, sucursalActiva } = useAuth();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['facturas-compra', empresaActiva?.empresa_id],
        queryFn: () => comprasService.getFacturasCompra(empresaActiva?.empresa_id, sucursalActiva?.sucursal_id),
        enabled: !!empresaActiva?.empresa_id,
    });

    const facturas = data?.data?.items || [];

    const totalMes = facturas
        .filter(f => f.estado !== 'ANULADA')
        .reduce((acc, f) => acc + (f.total_general || 0), 0);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                        Facturas de <span className="text-primary">Compra</span>
                    </h1>
                    <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Historial de adquisiciones registradas</p>
                </div>
                <button
                    onClick={() => navigate('/compras/facturas/nueva')}
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark hover:-translate-y-1 transition-all flex items-center gap-3"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Compra
                </button>
            </div>

            {/* Stat */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-card rounded-3xl border border-border p-8">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mb-3">Total compras</p>
                    <p className="text-4xl font-black text-text-primary">{facturas.filter(f => f.estado !== 'ANULADA').length}</p>
                </div>
                <div className="bg-surface-card rounded-3xl border border-border p-8">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mb-3">Inversión total</p>
                    <p className="text-4xl font-black text-primary">{new Intl.NumberFormat('es-PY').format(totalMes)}</p>
                    <p className="text-[10px] font-black text-text-secondary uppercase opacity-30 mt-1">Guaraníes</p>
                </div>
                <div className="bg-surface-card rounded-3xl border border-border p-8">
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mb-3">Proveedores activos</p>
                    <p className="text-4xl font-black text-text-primary">
                        {new Set(facturas.filter(f => f.estado !== 'ANULADA').map(f => f.proveedor_id)).size}
                    </p>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-surface-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                <div className="px-10 py-6 border-b border-border bg-surface-raised/50 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Registro de compras</h3>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : isError ? (
                    <div className="py-32 text-center">
                        <p className="text-danger font-black text-sm">Error al cargar las compras</p>
                        <p className="text-text-secondary text-[10px] uppercase tracking-widest opacity-40 mt-2 font-black">Verifique que el endpoint ORDS esté desplegado</p>
                    </div>
                ) : facturas.length === 0 ? (
                    <div className="py-40 text-center">
                        <div className="w-20 h-20 bg-surface-raised rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-border shadow-inner">
                            <svg className="w-8 h-8 text-text-secondary opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-text-secondary font-black uppercase text-[10px] tracking-[.2em] opacity-40">No hay compras registradas aún</p>
                        <button
                            onClick={() => navigate('/compras/facturas/nueva')}
                            className="mt-8 bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                        >
                            Registrar primera compra
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="text-left text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] opacity-40 border-b border-border">
                                        <th className="px-10 py-5">Nro. Factura</th>
                                        <th className="px-10 py-5">Fecha</th>
                                        <th className="px-10 py-5">Proveedor</th>
                                        <th className="px-10 py-5">Condición</th>
                                        <th className="px-10 py-5 text-right">Total</th>
                                        <th className="px-10 py-5 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {facturas.map((f) => (
                                        <tr key={f.factura_compra_id} className="hover:bg-surface-raised/30 transition-all">
                                            <td className="px-10 py-5">
                                                <span className="font-black text-sm text-text-primary">{f.numero_factura}</span>
                                            </td>
                                            <td className="px-10 py-5">
                                                <span className="text-sm text-text-secondary font-medium">{f.fecha_factura}</span>
                                            </td>
                                            <td className="px-10 py-5">
                                                <span className="text-sm font-semibold text-text-primary">{f.proveedor_nombre}</span>
                                            </td>
                                            <td className="px-10 py-5">
                                                <span className="text-[11px] text-text-secondary font-medium">{f.condicion_pago}</span>
                                            </td>
                                            <td className="px-10 py-5 text-right">
                                                <div>
                                                    <span className="font-black text-text-primary text-sm">{new Intl.NumberFormat('es-PY').format(f.total_general)}</span>
                                                    <span className="text-[9px] font-black text-text-secondary ml-2 opacity-40">{f.moneda}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-5 text-center">
                                                <EstadoBadge estado={f.estado} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="md:hidden divide-y divide-border/50">
                            {facturas.map((f) => (
                                <div key={f.factura_compra_id} className="p-8 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-black text-text-primary text-sm">{f.numero_factura}</p>
                                            <p className="text-[11px] text-text-secondary font-medium mt-1">{f.proveedor_nombre}</p>
                                        </div>
                                        <EstadoBadge estado={f.estado} />
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-border">
                                        <span className="text-[10px] font-black text-text-secondary opacity-40 uppercase">{f.fecha_factura}</span>
                                        <div>
                                            <span className="font-black text-primary">{new Intl.NumberFormat('es-PY').format(f.total_general)}</span>
                                            <span className="text-[9px] text-text-secondary ml-1 opacity-40">{f.moneda}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
