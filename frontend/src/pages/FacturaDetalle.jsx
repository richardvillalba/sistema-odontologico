import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService, empresaService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FacturaPrint from '../components/facturacion/FacturaPrint';

const FacturaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { usuario } = useAuth();
    const [actionError, setActionError] = useState(null);

    // Queries
    const { data: facturaRes, isLoading: loadingFactura, isError: isErrorFactura } = useQuery({
        queryKey: ['factura', id],
        queryFn: () => billingService.getFacturaById(id),
    });

    const { data: detallesRes, isLoading: loadingDetalles } = useQuery({
        queryKey: ['factura-detalles', id],
        queryFn: () => billingService.getFacturaDetalles(id),
    });

    const { data: cuotasRes } = useQuery({
        queryKey: ['factura-cuotas', id],
        queryFn: () => billingService.getCuotasFactura(id),
    });

    const { data: pagosRes } = useQuery({
        queryKey: ['factura-pagos', id],
        queryFn: () => billingService.getFacturaPagos(id),
    });

    const { data: empresaRes } = useQuery({
        queryKey: ['empresa'],
        queryFn: () => empresaService.get(),
    });

    const factura = facturaRes?.data?.items?.[0] || facturaRes?.data?.factura?.[0] || facturaRes?.data?.factura;
    const detalles = detallesRes?.data?.items || [];
    const cuotas = cuotasRes?.data?.items || [];
    const pagos = pagosRes?.data?.items || [];
    const empresa = empresaRes?.data || {};

    // Estado para modal de pago de cuota
    const [pagoModal, setPagoModal] = useState({ open: false, cuota: null });
    const [montoPago, setMontoPago] = useState(0);
    const [metodoPago, setMetodoPago] = useState('EFECTIVO');

    // Estado para modal de anulación
    const [anularModal, setAnularModal] = useState(false);
    const [motivoAnulacion, setMotivoAnulacion] = useState('');

    // Estado para modal de anulación de pago
    const [anularPagoModal, setAnularPagoModal] = useState({ open: false, pago: null });
    const [motivoAnulacionPago, setMotivoAnulacionPago] = useState('');

    // Mutations
    const anularMutation = useMutation({
        mutationFn: (motivo) => billingService.anularFactura(id, motivo, usuario?.usuario_id),
        onSuccess: () => {
            queryClient.invalidateQueries(['factura', id]);
            setAnularModal(false);
            setMotivoAnulacion('');
            setActionError(null);
        },
        onError: (err) => setActionError(err.response?.data?.mensaje || "Error al anular la factura.")
    });

    const confirmarMutation = useMutation({
        mutationFn: () => billingService.confirmarFactura(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['factura', id]);
            setActionError(null);
        },
        onError: (err) => setActionError(err.response?.data?.mensaje || "Error al confirmar la factura.")
    });

    const pagarCuotaMutation = useMutation({
        mutationFn: ({ cuotaId, data }) => billingService.pagarCuota(cuotaId, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['factura', id]);
            queryClient.invalidateQueries(['factura-cuotas', id]);
            setPagoModal({ open: false, cuota: null });
            setMontoPago(0);
            setActionError(null);
        },
        onError: (err) => setActionError(err.response?.data?.mensaje || "Error al registrar el pago.")
    });

    const anularPagoMutation = useMutation({
        mutationFn: ({ pagoId, motivo }) => billingService.anularPago(pagoId, motivo, usuario?.usuario_id),
        onSuccess: () => {
            queryClient.invalidateQueries(['factura', id]);
            queryClient.invalidateQueries(['factura-pagos', id]);
            queryClient.invalidateQueries(['factura-cuotas', id]);
            setAnularPagoModal({ open: false, pago: null });
            setMotivoAnulacionPago('');
            setActionError(null);
        },
        onError: (err) => setActionError(err.response?.data?.mensaje || "Error al anular el pago.")
    });

    const handlePagarCuota = () => {
        if (!pagoModal.cuota || montoPago <= 0) return;
        pagarCuotaMutation.mutate({
            cuotaId: pagoModal.cuota.cuota_id,
            data: {
                monto: montoPago,
                metodo_pago: metodoPago,
                registrado_por: 1
            }
        });
    };

    const openPagoModal = (cuota) => {
        setPagoModal({ open: true, cuota });
        setMontoPago(cuota.saldo_cuota);
        setMetodoPago('EFECTIVO');
    };

    if (loadingFactura || loadingDetalles) return (
        <div className="p-20 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest">
            Consultando Comprobante...
        </div>
    );

    if (isErrorFactura || !factura) return (
        <div className="p-20 text-center space-y-4">
            <div className="text-6xl">🔍</div>
            <h2 className="text-2xl font-black text-slate-900">Factura no encontrada</h2>
            <p className="text-slate-500">El comprobante solicitado no existe o no tiene permisos para verlo.</p>
            <button onClick={() => navigate('/facturas')} className="text-indigo-600 font-bold uppercase text-xs">Volver al listado</button>
        </div>
    );

    const getStatusStyle = (estado) => {
        switch (estado) {
            case 'BORRADOR': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'PENDIENTE': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'PAGADA': return 'bg-green-100 text-green-700 border-green-200';
            case 'PARCIAL': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'ANULADA': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-1 sm:px-0">
            {/* Header / Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 sm:px-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/facturas')}
                        className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                    >
                        ⬅️
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                            Factura {factura.numero_factura_completo}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">Emitida el {new Date(factura.fecha_emision).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                    {factura.estado === 'BORRADOR' && (
                        <button
                            onClick={() => confirmarMutation.mutate()}
                            disabled={confirmarMutation.isPending}
                            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-200 transition-all text-sm"
                        >
                            {confirmarMutation.isPending ? 'Confirmando...' : 'Confirmar Factura'}
                        </button>
                    )}

                    {(factura.estado === 'PENDIENTE' || factura.estado === 'PARCIAL') && (
                        <button
                            onClick={() => navigate(`/facturas/${id}/registrar-pago`)}
                            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-emerald-200 transition-all text-sm"
                        >
                            Registrar Pago
                        </button>
                    )}

                    {factura.estado !== 'ANULADA' && factura.estado !== 'PAGADA' && (
                        <button
                            onClick={() => setAnularModal(true)}
                            className="flex-1 sm:flex-none bg-white border-2 border-slate-100 text-rose-600 hover:bg-rose-50 px-6 py-3 rounded-2xl font-black transition-all text-sm"
                        >
                            Anular
                        </button>
                    )}

                    <button
                        onClick={() => window.print()}
                        className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <span>🖨️</span> <span className="hidden xs:inline">Imprimir</span>
                    </button>
                </div>
            </div>

            {actionError && (
                <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-center gap-4 animate-shake mx-4 sm:mx-0">
                    <span className="text-2xl">⚠️</span>
                    <p className="text-rose-700 font-bold">{actionError}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Info Principal */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    {/* Items Table / Cards */}
                    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mx-2 sm:mx-0">
                        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs sm:text-sm">Detalle de Conceptos</h2>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-400">{detalles.length} ítems</span>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-4">Descripción</th>
                                        <th className="px-8 py-4 text-center">Cant.</th>
                                        <th className="px-8 py-4 text-right">Precio Unit.</th>
                                        <th className="px-8 py-4 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {detalles.map((det, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-slate-800">{det.descripcion}</p>
                                                {det.tratamiento_paciente_id && (
                                                    <span className="text-[9px] font-black text-indigo-400 uppercase">Tratamiento #{det.tratamiento_paciente_id}</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-center font-bold text-slate-600">{det.cantidad}</td>
                                            <td className="px-8 py-5 text-right font-bold text-slate-600">
                                                {new Intl.NumberFormat('es-PY').format(det.precio_unitario)}
                                            </td>
                                            <td className="px-8 py-5 text-right font-black text-slate-900">
                                                {new Intl.NumberFormat('es-PY').format(det.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="md:hidden divide-y divide-slate-50">
                            {detalles.map((det, idx) => (
                                <div key={idx} className="px-6 py-5 space-y-3">
                                    <div>
                                        <p className="font-bold text-slate-800 leading-tight">{det.descripcion}</p>
                                        {det.tratamiento_paciente_id && (
                                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1 block">Tratamiento #{det.tratamiento_paciente_id}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex flex-col">
                                            <span className="text-slate-400 font-black uppercase text-[8px] tracking-widest">Cant x Precio</span>
                                            <span className="font-bold text-slate-600">{det.cantidad} x {new Intl.NumberFormat('es-PY').format(det.precio_unitario)}</span>
                                        </div>
                                        <div className="text-right flex flex-col">
                                            <span className="text-slate-400 font-black uppercase text-[8px] tracking-widest">Subtotal</span>
                                            <span className="font-black text-slate-900">{new Intl.NumberFormat('es-PY').format(det.subtotal)} <span className="text-[10px] text-slate-400">Gs</span></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals Section */}
                        <div className="bg-slate-50 p-6 sm:p-8 flex flex-col items-end space-y-3">
                            <div className="flex justify-between w-full max-w-[280px] sm:max-w-xs text-xs sm:text-sm text-slate-500 font-bold">
                                <span>Subtotal:</span>
                                <span>{new Intl.NumberFormat('es-PY').format(factura.subtotal)} Gs</span>
                            </div>
                            <div className="flex justify-between w-full max-w-[280px] sm:max-w-xs text-xs sm:text-sm text-rose-500 font-bold border-b border-slate-200 pb-3">
                                <span>Descuento:</span>
                                <span>- {new Intl.NumberFormat('es-PY').format(factura.descuento)} Gs</span>
                            </div>
                            <div className="flex justify-between items-center w-full max-w-[280px] sm:max-w-xs pt-2">
                                <span className="text-xs sm:text-base font-black text-slate-900 uppercase tracking-widest mr-2">Total</span>
                                <span className="text-2xl sm:text-3xl font-black text-indigo-600 flex items-baseline gap-1">
                                    {new Intl.NumberFormat('es-PY').format(factura.total)} <span className="text-[10px] sm:text-sm uppercase tracking-tight">Gs</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Observaciones */}
                    {factura.observaciones && (
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mx-2 sm:mx-0">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Observaciones / Notas</h3>
                            <p className="text-slate-600 font-medium leading-relaxed italic text-sm sm:text-base">"{factura.observaciones}"</p>
                        </div>
                    )}

                    {/* Cuotas - Solo si es CREDITO y tiene cuotas */}
                    {cuotas.length > 0 && (
                        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mx-2 sm:mx-0">
                            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-amber-50/50">
                                <h2 className="font-black text-amber-800 uppercase tracking-widest text-xs sm:text-sm">Plan de Cuotas</h2>
                                <span className="text-[10px] sm:text-xs font-bold text-amber-600">{cuotas.length} cuotas</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {cuotas.map((cuota) => {
                                    const isVencida = cuota.vencida === 'S' || cuota.estado === 'VENCIDA';
                                    const isPagada = cuota.estado === 'PAGADA';
                                    const isParcial = cuota.estado === 'PARCIAL';

                                    return (
                                        <div
                                            key={cuota.cuota_id}
                                            className={`px-6 sm:px-8 py-5 flex items-center justify-between gap-3 sm:gap-4 ${isPagada ? 'bg-green-50/25' : isVencida ? 'bg-rose-50/25' : ''}`}
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black shrink-0 ${isPagada ? 'bg-green-100 text-green-600' : isVencida ? 'bg-rose-100 text-rose-600' : isParcial ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                                    {isPagada ? '✓' : cuota.numero_cuota}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 text-sm sm:text-base truncate">
                                                        Cuota {cuota.numero_cuota}
                                                        {isParcial && <span className="ml-2 text-[10px] text-blue-600">(Parcial)</span>}
                                                    </p>
                                                    <p className={`text-[10px] sm:text-xs font-bold ${isVencida ? 'text-rose-500' : 'text-slate-400'}`}>
                                                        Vence: {new Date(cuota.fecha_vencimiento).toLocaleDateString()}
                                                        {isVencida && !isPagada && ' - VENCIDA'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
                                                <div className="text-right">
                                                    <p className={`font-black text-sm sm:text-base ${isPagada ? 'text-green-600/50 line-through' : 'text-slate-900'}`}>
                                                        {new Intl.NumberFormat('es-PY').format(cuota.monto_cuota)} <span className="text-[10px]">Gs</span>
                                                    </p>
                                                    {cuota.saldo_cuota > 0 && cuota.saldo_cuota < cuota.monto_cuota && (
                                                        <p className="text-[10px] text-amber-600 font-bold">
                                                            Saldo: {new Intl.NumberFormat('es-PY').format(cuota.saldo_cuota)} Gs
                                                        </p>
                                                    )}
                                                </div>
                                                {!isPagada && factura.estado !== 'ANULADA' && (
                                                    <button
                                                        onClick={() => openPagoModal(cuota)}
                                                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg sm:rounded-xl transition-all uppercase tracking-widest"
                                                    >
                                                        Pagar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Pagos Registrados */}
                    {pagos.length > 0 && (
                        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mx-2 sm:mx-0">
                            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                                <h2 className="font-black text-emerald-800 uppercase tracking-widest text-xs sm:text-sm">Pagos Registrados</h2>
                                <span className="text-[10px] sm:text-xs font-bold text-emerald-600">{pagos.length} pago{pagos.length > 1 ? 's' : ''}</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {pagos.map((pago) => (
                                    <div
                                        key={pago.pago_id}
                                        className="px-6 sm:px-8 py-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-black shrink-0">
                                                💰
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 text-sm sm:text-base truncate">
                                                    {pago.metodo_pago}
                                                    {pago.referencia && <span className="ml-2 text-[10px] text-slate-400 font-medium">#{pago.referencia}</span>}
                                                </p>
                                                <p className="text-[10px] sm:text-xs font-bold text-slate-400">
                                                    {new Date(pago.fecha_pago).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
                                            <p className="font-black text-emerald-600 text-base sm:text-lg">
                                                {new Intl.NumberFormat('es-PY').format(pago.monto)} <span className="text-[10px]">Gs</span>
                                            </p>
                                            {factura.estado !== 'ANULADA' && (
                                                <button
                                                    onClick={() => setAnularPagoModal({ open: true, pago })}
                                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black rounded-lg transition-all"
                                                >
                                                    Anular
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
                    {/* Status Card */}
                    <div className={`p-6 sm:p-8 rounded-[2rem] border-2 shadow-sm flex items-center lg:flex-col text-left lg:text-center gap-4 ${getStatusStyle(factura.estado)}`}>
                        <div className="text-4xl sm:text-5xl shrink-0">
                            {factura.estado === 'PAGADA' ? '✅' : factura.estado === 'ANULADA' ? '🚫' : '⏳'}
                        </div>
                        <div className="flex-1 lg:w-full">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-1 lg:mb-2">Estado</p>
                            <p className="text-xl sm:text-2xl font-black tracking-tighter leading-none">{factura.estado}</p>
                            {factura.saldo_pendiente > 0 && (
                                <div className="mt-3 pt-3 border-t border-current/10 w-full text-rose-700">
                                    <p className="text-[9px] font-black uppercase tracking-widest mb-1">Saldo Pendiente</p>
                                    <p className="text-lg font-black">{new Intl.NumberFormat('es-PY').format(factura.saldo_pendiente)} Gs</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Patient Card */}
                    <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información del Cliente</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl sm:text-2xl font-black text-slate-400 shrink-0">
                                {factura.nombre_cliente?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-slate-900 leading-tight truncate">{factura.nombre_cliente}</p>
                                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tighter">
                                    {factura.tipo_documento_cliente}: {factura.numero_documento_cliente}
                                </p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Condición</span>
                            <span className="bg-slate-100 px-3 py-1 rounded-lg text-[9px] font-black text-slate-700 uppercase truncate">
                                {factura.condicion_operacion} {factura.condicion_operacion === 'CREDITO' ? `(${factura.plazo_credito_dias} días)` : ''}
                            </span>
                        </div>
                        <button
                            onClick={() => navigate(`/pacientes/${factura.paciente_id}`)}
                            className="w-full bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 py-3.5 rounded-2xl font-black text-[10px] transition-all uppercase tracking-widest"
                        >
                            Ver Expediente
                        </button>
                    </div>

                    {/* Fiscal Info */}
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200/50 space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Datos Fiscales</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timbrado</span>
                                <span className="font-mono text-xs font-bold text-slate-700">{factura.numero_timbrado}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Punto Exp.</span>
                                <span className="font-mono text-xs font-bold text-slate-700">{factura.establecimiento}-{factura.punto_expedicion}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Interno</span>
                                <span className="font-mono text-xs font-bold text-slate-700">#{factura.factura_id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Pago de Cuota */}
            {pagoModal.open && pagoModal.cuota && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95">
                        <h3 className="text-xl font-black text-slate-900 mb-6">
                            Pagar Cuota {pagoModal.cuota.numero_cuota}
                        </h3>

                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Monto cuota:</span>
                                    <span className="font-bold">{new Intl.NumberFormat('es-PY').format(pagoModal.cuota.monto_cuota)} Gs</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-slate-500">Saldo pendiente:</span>
                                    <span className="font-black text-amber-600">{new Intl.NumberFormat('es-PY').format(pagoModal.cuota.saldo_cuota)} Gs</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto a Pagar</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold p-3"
                                    value={montoPago}
                                    onChange={(e) => setMontoPago(parseFloat(e.target.value) || 0)}
                                    max={pagoModal.cuota.saldo_cuota}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Método de Pago</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold p-3"
                                    value={metodoPago}
                                    onChange={(e) => setMetodoPago(e.target.value)}
                                >
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TRANSFERENCIA">Transferencia</option>
                                    <option value="TARJETA">Tarjeta</option>
                                    <option value="CHEQUE">Cheque</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setPagoModal({ open: false, cuota: null })}
                                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handlePagarCuota}
                                disabled={pagarCuotaMutation.isPending || montoPago <= 0 || montoPago > pagoModal.cuota.saldo_cuota}
                                className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-black transition-all"
                            >
                                {pagarCuotaMutation.isPending ? 'Procesando...' : 'Confirmar Pago'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Anulación */}
            {anularModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">
                                Anular Factura
                            </h3>
                            <p className="text-slate-500 font-medium">
                                Factura {factura.numero_factura_completo}
                            </p>
                        </div>

                        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 mb-6">
                            <p className="text-sm text-rose-700 font-bold text-center">
                                Esta acción es irreversible. La factura quedará anulada permanentemente.
                            </p>
                        </div>

                        <div className="space-y-2 mb-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Motivo de Anulación
                            </label>
                            <textarea
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium p-4 focus:border-rose-400 focus:outline-none transition-colors resize-none"
                                rows="3"
                                placeholder="Ingrese el motivo de la anulación..."
                                value={motivoAnulacion}
                                onChange={(e) => setMotivoAnulacion(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setAnularModal(false);
                                    setMotivoAnulacion('');
                                }}
                                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => anularMutation.mutate(motivoAnulacion)}
                                disabled={anularMutation.isPending || !motivoAnulacion.trim()}
                                className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-black transition-all"
                            >
                                {anularMutation.isPending ? 'Anulando...' : 'Confirmar Anulación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Área de impresión - fuera de pantalla en modo normal, visible al imprimir */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none' }}>
                {factura && (
                    <FacturaPrint factura={factura} detalles={detalles} empresa={empresa} />
                )}
            </div>

            {/* Modal de Anulación de Pago */}
            {anularPagoModal.open && anularPagoModal.pago && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">
                                Anular Pago
                            </h3>
                            <p className="text-slate-500 font-medium">
                                {anularPagoModal.pago.metodo_pago} - {new Intl.NumberFormat('es-PY').format(anularPagoModal.pago.monto)} Gs
                            </p>
                        </div>

                        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 mb-6">
                            <p className="text-sm text-rose-700 font-bold text-center">
                                Al anular este pago, se actualizará el saldo de la factura y cuotas asociadas.
                            </p>
                        </div>

                        <div className="space-y-2 mb-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Motivo de Anulación *
                            </label>
                            <textarea
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium p-4 focus:border-rose-400 focus:outline-none transition-colors resize-none"
                                rows="3"
                                placeholder="Ingrese el motivo de la anulación del pago..."
                                value={motivoAnulacionPago}
                                onChange={(e) => setMotivoAnulacionPago(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setAnularPagoModal({ open: false, pago: null });
                                    setMotivoAnulacionPago('');
                                }}
                                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => anularPagoMutation.mutate({
                                    pagoId: anularPagoModal.pago.pago_id,
                                    motivo: motivoAnulacionPago
                                })}
                                disabled={anularPagoMutation.isPending || !motivoAnulacionPago.trim()}
                                className="flex-1 px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-black transition-all"
                            >
                                {anularPagoMutation.isPending ? 'Anulando...' : 'Confirmar Anulación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacturaDetalle;
