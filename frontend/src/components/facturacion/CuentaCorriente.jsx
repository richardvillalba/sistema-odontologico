import { useQuery } from '@tanstack/react-query';
import { billingService } from '../../services/api';
import { Link } from 'react-router-dom';

const CuentaCorriente = ({ pacienteId }) => {
    const { data: cuentaRes, isLoading } = useQuery({
        queryKey: ['cuenta-corriente', pacienteId],
        queryFn: () => billingService.getCuentaCorrientePaciente(pacienteId),
        enabled: !!pacienteId
    });

    const facturas = cuentaRes?.data?.items || [];

    if (isLoading) {
        return (
            <div className="py-20 text-center space-y-4 animate-pulse">
                <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto"></div>
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Cargando estado de cuenta...</p>
            </div>
        );
    }

    if (facturas.length === 0) {
        return (
            <div className="py-20 text-center space-y-6 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-3xl">🎉</div>
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Sin deudas pendientes</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm">El paciente se encuentra al día con sus compromisos financieros.</p>
                </div>
                <Link
                    to="/facturas/nueva"
                    className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all"
                >
                    <span>Emitir Nueva Factura</span>
                    <span>📄</span>
                </Link>
            </div>
        );
    }

    const totalPendiente = facturas.reduce((acc, f) => acc + (f.saldo_pendiente || 0), 0);

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header / Resumen */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Estado de Cuenta</h3>
                    <p className="text-slate-500 font-medium">Listado de facturas con saldo pendiente de cobro.</p>
                </div>
                <div className="bg-white px-8 py-5 rounded-[2rem] shadow-sm border border-slate-200 text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Deuda Total</p>
                    <p className="text-3xl font-black text-rose-600">
                        {new Intl.NumberFormat('es-PY').format(totalPendiente)} <span className="text-sm">Gs</span>
                    </p>
                </div>
            </div>

            {/* Listado de Facturas */}
            <div className="overflow-hidden bg-white rounded-3xl border border-slate-100 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Factura</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monto Original</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Saldo Pendiente</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {facturas.map((factura) => (
                            <tr key={factura.factura_id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black group-hover:scale-110 transition-transform">
                                            📄
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {factura.numero_factura_completo}
                                            </p>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${factura.estado === 'PENDIENTE' ? 'bg-rose-100 text-rose-600' :
                                                    factura.estado === 'PARCIAL' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-slate-100 text-slate-600'
                                                }`}>
                                                {factura.estado}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-sm font-bold text-slate-600">
                                        {new Date(factura.fecha_emision).toLocaleDateString('es-PY')}
                                    </p>
                                </td>
                                <td className="px-6 py-5 text-sm font-bold text-slate-500">
                                    {new Intl.NumberFormat('es-PY').format(factura.total)} Gs
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-lg font-black text-rose-600">
                                        {new Intl.NumberFormat('es-PY').format(factura.saldo_pendiente)} Gs
                                    </p>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <Link
                                        to={`/facturas/${factura.factura_id}/registrar-pago`}
                                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-200"
                                    >
                                        Registrar Pago 💰
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">ℹ️</div>
                    <p className="text-sm font-bold text-blue-800 leading-snug">
                        Solo se muestran facturas pendientes de pago. <br />
                        <span className="text-xs opacity-75">Podés ver el historial completo en el módulo de Facturación.</span>
                    </p>
                </div>
                <Link to="/facturas" className="text-blue-600 font-black uppercase text-xs tracking-widest hover:underline px-4">Ir a Facturación</Link>
            </div>
        </div>
    );
};

export default CuentaCorriente;
