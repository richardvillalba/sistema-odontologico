import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService, empresaService, cajaService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FacturaPrint from '../components/facturacion/FacturaPrint';

const FacturaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { usuario, empresaActiva } = useAuth();
    const empresaId = empresaActiva?.empresa_id;
    const usuarioId = usuario?.usuario_id;
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
        queryKey: ['empresa', empresaId],
        queryFn: () => empresaService.getById(empresaId),
        enabled: !!empresaId,
    });

    // Caja abierta del usuario (para registrar egresos en anulaciones)
    const { data: cajasData, isLoading: loadingCajas } = useQuery({
        queryKey: ['cajas-detalle', empresaId],
        queryFn: () => cajaService.listar(empresaId),
        enabled: !!empresaId,
    });
    const cajasUsuario = cajasData?.data?.items || [];
    // Priorizar la caja asignada al usuario, luego cualquier abierta
    const cajaAbierta = cajasUsuario.find(c => c.estado === 'ABIERTA' && c.usuario_asignado_id === usuarioId)
        || cajasUsuario.find(c => c.estado === 'ABIERTA')
        || null;

    const factura = facturaRes?.data?.items?.[0] || facturaRes?.data?.factura?.[0] || facturaRes?.data?.factura;
    const detalles = detallesRes?.data?.items || [];
    const cuotas = cuotasRes?.data?.items || [];
    const pagos = pagosRes?.data?.items || [];
    const empresa = empresaRes?.data?.items?.[0] || {};

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
        onSuccess: async () => {
            // Registrar EGRESO en caja para revertir los pagos de la factura
            if (cajaAbierta?.caja_id && factura) {
                const montoPagado = Number(factura.total_pagado || factura.TOTAL_PAGADO || 0);
                if (montoPagado > 0) {
                    try {
                        const nroFactura = factura.nro_factura || factura.NRO_FACTURA || id;
                        await cajaService.registrarMovimiento(cajaAbierta.caja_id, {
                            tipo: 'EGRESO',
                            categoria_id: null,
                            concepto: `Anulación factura #${nroFactura}`,
                            monto: montoPagado,
                            factura_id: Number(id),
                            referencia: String(nroFactura),
                            registrado_por: usuarioId,
                        });
                    } catch (cajaErr) {
                        console.warn('No se pudo registrar egreso en caja:', cajaErr);
                    }
                }
            }
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
        onSuccess: async () => {
            // Registrar EGRESO en caja para revertir el pago anulado
            if (cajaAbierta?.caja_id && anularPagoModal.pago) {
                try {
                    const montoPago = Number(anularPagoModal.pago.monto || anularPagoModal.pago.MONTO || 0);
                    const nroFactura = factura?.nro_factura || factura?.NRO_FACTURA || id;
                    if (montoPago > 0) {
                        await cajaService.registrarMovimiento(cajaAbierta.caja_id, {
                            tipo: 'EGRESO',
                            categoria_id: null,
                            concepto: `Anulación pago - Factura #${nroFactura}`,
                            monto: montoPago,
                            factura_id: Number(id),
                            referencia: String(nroFactura),
                            registrado_por: usuarioId,
                        });
                    }
                } catch (cajaErr) {
                    console.warn('No se pudo registrar egreso en caja:', cajaErr);
                }
            }
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

    const imprimirRecibo = (pago) => {
        const fmt = (n) => new Intl.NumberFormat('es-PY').format(n || 0);
        const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

        const empresaNombre = empresa?.nombre_comercial || empresa?.razon_social || 'Clínica Odontológica';
        const nroFactura = factura.numero_factura_completo || `#${id}`;

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Recibo de Pago N°${pago.pago_id}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #000; margin: 0; padding: 20px; }
  .recibo { max-width: 480px; margin: 0 auto; border: 2px solid #000; padding: 24px; position: relative; }
  .empresa { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 12px; margin-bottom: 12px; }
  .empresa h2 { margin: 0 0 3px; font-size: 15px; }
  .empresa p { margin: 2px 0; font-size: 10px; color: #555; }
  .titulo { text-align: center; font-size: 18px; font-weight: bold; letter-spacing: 2px; margin-bottom: 2px; }
  .subtitulo { text-align: center; font-size: 11px; color: #555; margin-bottom: 14px; }
  .section { border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px; }
  .row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px; }
  .label { color: #666; }
  .value { font-weight: bold; text-align: right; }
  .monto-box { border: 2px solid #000; padding: 14px; text-align: center; margin: 16px 0; }
  .monto-label { font-size: 10px; color: #555; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
  .monto-value { font-size: 30px; font-weight: bold; font-family: monospace; }
  .monto-gs { font-size: 14px; font-weight: normal; }
  .sello { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 14px; border-top: 2px solid #000; }
  .sello-box { text-align: center; }
  .sello-line { border-top: 1px solid #000; width: 160px; margin: 0 auto 4px; }
  .sello-label { font-size: 10px; color: #555; }
  .pie { text-align: center; font-size: 9px; color: #aaa; margin-top: 14px; }
  @media print { body { margin: 0; padding: 10px; } }
</style>
</head>
<body>
<div class="recibo">
  <div class="empresa">
    <h2>${empresaNombre}</h2>
    ${empresa?.ruc ? `<p><strong>RUC:</strong> ${empresa.ruc}</p>` : ''}
    ${empresa?.direccion ? `<p>${empresa.direccion}</p>` : ''}
    ${empresa?.telefono ? `<p>Tel: ${empresa.telefono}</p>` : ''}
  </div>

  <div class="titulo">RECIBO DE PAGO</div>
  <div class="subtitulo">N° ${pago.pago_id}</div>

  <div class="section">
    <div class="row"><span class="label">Factura:</span><span class="value">${nroFactura}</span></div>
    <div class="row"><span class="label">Fecha de Pago:</span><span class="value">${fmtFecha(pago.fecha_pago)}</span></div>
    <div class="row"><span class="label">Cliente:</span><span class="value">${factura.nombre_cliente || '-'}</span></div>
    ${factura.numero_documento_cliente ? `<div class="row"><span class="label">${factura.tipo_documento_cliente || 'Doc'}:</span><span class="value">${factura.numero_documento_cliente}</span></div>` : ''}
    <div class="row"><span class="label">Método de Pago:</span><span class="value">${pago.metodo_pago}</span></div>
    ${pago.referencia ? `<div class="row"><span class="label">Referencia:</span><span class="value">${pago.referencia}</span></div>` : ''}
    ${pago.banco ? `<div class="row"><span class="label">Banco:</span><span class="value">${pago.banco}</span></div>` : ''}
  </div>

  <div class="monto-box">
    <div class="monto-label">Monto Recibido</div>
    <div class="monto-value">${fmt(pago.monto)} <span class="monto-gs">Gs</span></div>
  </div>

  <div class="section">
    <div class="row"><span class="label">Total Factura:</span><span class="value">${fmt(factura.total)} Gs</span></div>
    <div class="row"><span class="label">Total Pagado:</span><span class="value">${fmt(factura.total_pagado)} Gs</span></div>
    <div class="row"><span class="label">Saldo Pendiente:</span><span class="value">${fmt(factura.saldo_pendiente)} Gs</span></div>
  </div>

  <div class="sello">
    <div class="sello-box">
      <div class="sello-line"></div>
      <div class="sello-label">Firma del Cliente</div>
    </div>
    <div class="sello-box">
      <div class="sello-line"></div>
      <div class="sello-label">Firma y Sello de la Empresa</div>
    </div>
  </div>

  <div class="pie">Emitido el ${new Date().toLocaleDateString('es-PY')} — ${empresaNombre}</div>
</div>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

        const ventana = window.open('', '_blank', 'width=580,height=720');
        ventana.document.write(html);
        ventana.document.close();
    };

    if (loadingFactura || loadingDetalles) return (
        <div className="p-20 text-center animate-pulse flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-black text-text-secondary uppercase tracking-[0.2em] text-[10px] opacity-60">
                Consultando Comprobante...
            </p>
        </div>
    );

    if (isErrorFactura || !factura) return (
        <div className="p-20 text-center space-y-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-[2rem] bg-surface-raised flex items-center justify-center text-3xl border border-border shadow-inner">🔍</div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">Factura no encontrada</h2>
                <p className="text-text-secondary font-medium max-w-sm mx-auto">El comprobante solicitado no existe, fue eliminado o no tienes los permisos necesarios para visualizarlo.</p>
            </div>
            <button onClick={() => navigate('/facturas')} className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">Volver al listado</button>
        </div>
    );

    const getStatusStyle = (estado) => {
        switch (estado) {
            case 'BORRADOR': return 'bg-surface-raised text-text-secondary border-border';
            case 'PENDIENTE': return 'bg-warning-light/20 text-warning-dark border-warning/20';
            case 'PAGADA': return 'bg-secondary-light/20 text-secondary border-secondary/20';
            case 'PARCIAL': return 'bg-primary-light/20 text-primary border-primary/20';
            case 'ANULADA': return 'bg-danger-light/20 text-danger border-danger/20';
            default: return 'bg-surface-raised text-text-secondary border-border';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-4 sm:px-0">
            {/* Header / Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/facturas')}
                        className="p-4 bg-surface-card border border-border rounded-2xl text-text-secondary hover:text-primary shadow-sm group transition-all"
                    >
                        <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                            Factura <span className="text-primary">{factura.numero_factura_completo}</span>
                        </h1>
                        <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Emitida el <span className="text-text-primary opacity-100">{new Date(factura.fecha_emision).toLocaleDateString()}</span></p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {factura.estado === 'BORRADOR' && (
                        <button
                            onClick={() => confirmarMutation.mutate()}
                            disabled={confirmarMutation.isPending}
                            className="flex-1 sm:flex-none bg-primary hover:bg-primary-dark text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {confirmarMutation.isPending ? 'Procesando...' : 'Confirmar Factura'}
                        </button>
                    )}

                    {(factura.estado === 'PENDIENTE' || factura.estado === 'PARCIAL') && (
                        <button
                            onClick={() => cajaAbierta ? navigate(`/facturas/${id}/registrar-pago`) : null}
                            disabled={!cajaAbierta}
                            title={!cajaAbierta ? 'Debes abrir tu caja para registrar pagos' : ''}
                            className={`flex-1 sm:flex-none px-6 py-4 rounded-2xl font-black shadow-xl transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${cajaAbierta ? 'bg-secondary hover:bg-secondary-dark text-white shadow-secondary/20' : 'bg-surface-raised text-text-secondary opacity-50 cursor-not-allowed border border-border shadow-none'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1M12 17c-1.12 0-2.09-.411-2.67-1M12 8V7m0 11v-1m0-11a5 5 0 015 5v3m-5-8a5 5 0 00-5 5v3m5-8V7m0 11v-1" />
                            </svg>
                            Registrar Pago
                        </button>
                    )}

                    {factura.estado !== 'ANULADA' && factura.estado !== 'PAGADA' && (
                        <button
                            onClick={() => cajaAbierta ? setAnularModal(true) : null}
                            disabled={!cajaAbierta}
                            title={!cajaAbierta ? 'Debes abrir tu caja para anular esta factura' : ''}
                            className={`flex-1 sm:flex-none px-6 py-4 rounded-2xl font-black transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border-2 ${cajaAbierta ? 'bg-white border-danger/10 text-danger hover:bg-danger/5 shadow-xl shadow-danger/5' : 'bg-surface-raised border-border text-text-secondary opacity-50 cursor-not-allowed'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Anular
                        </button>
                    )}

                    <button
                        onClick={() => window.print()}
                        className="flex-1 sm:flex-none bg-primary-dark hover:bg-black text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-primary-dark/20 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest border border-white/10"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Imprimir
                    </button>
                </div>
            </div>

            {actionError && (
                <div className="bg-danger-light/20 border-2 border-danger/20 p-5 rounded-3xl flex items-center gap-5 animate-shake mx-2 sm:mx-0">
                    <div className="w-12 h-12 rounded-2xl bg-danger text-white flex items-center justify-center shadow-lg shadow-danger/20 shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-danger font-black text-sm uppercase tracking-tight">{actionError}</p>
                </div>
            )}

            {/* Banner: caja cerrada */}
            {!loadingCajas && !cajaAbierta && factura.estado !== 'ANULADA' && factura.estado !== 'PAGADA' && (
                <div className="bg-warning-light/10 border-2 border-warning/20 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 mx-2 sm:mx-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-warning-light/20 to-transparent">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-warning text-white flex items-center justify-center shadow-xl shadow-warning/20 shrink-0">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <p className="text-warning-dark font-black text-sm uppercase tracking-tight">Caja Restringida</p>
                            <p className="text-text-secondary font-medium text-xs">Debes aperturar tu caja para habilitar pagos o anular este comprobante.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/caja')}
                        className="w-full sm:w-auto bg-warning-dark hover:bg-black text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-warning-dark/20"
                    >
                        Gestionar Caja
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Info Principal */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Items Table / Cards */}
                    <div className="bg-surface-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden mx-2 sm:mx-0">
                        <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-surface-raised/50">
                            <h2 className="font-black text-text-primary uppercase tracking-tight text-sm">Detalle de Conceptos</h2>
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">{detalles.length} ítems</span>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-40 border-b border-border">
                                    <tr>
                                        <th className="px-8 py-5">Descripción del Concepto</th>
                                        <th className="px-8 py-5 text-center">Cantidad</th>
                                        <th className="px-8 py-5 text-right">Precio Unit. (Gs)</th>
                                        <th className="px-8 py-5 text-right">Monto Línea (Gs)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {detalles.map((det, idx) => (
                                        <tr key={idx} className="hover:bg-primary-light/5 transition-all">
                                            <td className="px-8 py-6">
                                                <p className="font-black text-text-primary uppercase tracking-tight leading-tight">{det.descripcion}</p>
                                                {det.tratamiento_paciente_id && (
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        <span className="w-1 h-1 rounded-full bg-primary/40"></span>
                                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">Tratamiento #{det.tratamiento_paciente_id}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-center font-black text-text-secondary opacity-80">{det.cantidad}</td>
                                            <td className="px-8 py-6 text-right font-black text-text-secondary opacity-80">
                                                {new Intl.NumberFormat('es-PY').format(det.precio_unitario)}
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-text-primary text-base tracking-tighter">
                                                {new Intl.NumberFormat('es-PY').format(det.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="md:hidden divide-y divide-border">
                            {detalles.map((det, idx) => (
                                <div key={idx} className="px-6 py-6 space-y-4">
                                    <div>
                                        <p className="font-black text-text-primary uppercase tracking-tight leading-tight">{det.descripcion}</p>
                                        {det.tratamiento_paciente_id && (
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest mt-1.5 block opacity-60">Tratamiento #{det.tratamiento_paciente_id}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <span className="text-text-secondary font-black uppercase text-[8px] tracking-[0.2em] opacity-40">Métricas</span>
                                            <p className="font-black text-text-secondary text-xs opacity-80">{det.cantidad} x {new Intl.NumberFormat('es-PY').format(det.precio_unitario)} <span className="text-[9px]">Gs</span></p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <span className="text-text-secondary font-black uppercase text-[8px] tracking-[0.2em] opacity-40">Subtotal</span>
                                            <p className="font-black text-text-primary text-lg tracking-tighter">{new Intl.NumberFormat('es-PY').format(det.subtotal)} <span className="text-[10px] text-text-secondary opacity-40">Gs</span></p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals Section */}
                        <div className="bg-surface-raised/50 p-8 flex flex-col items-end space-y-4 border-t border-border">
                            <div className="flex justify-between w-full max-w-[280px] sm:max-w-xs text-xs font-bold uppercase tracking-widest">
                                <span className="text-text-secondary opacity-40">Subtotal Operación</span>
                                <span className="text-text-primary">{new Intl.NumberFormat('es-PY').format(factura.subtotal)} Gs</span>
                            </div>
                            <div className="flex justify-between w-full max-w-[280px] sm:max-w-xs text-xs font-black uppercase tracking-widest text-danger border-b border-border pb-4">
                                <span className="opacity-60">Bonificación Aplicada</span>
                                <span>- {new Intl.NumberFormat('es-PY').format(factura.descuento)} Gs</span>
                            </div>
                            <div className="flex justify-between items-center w-full max-w-[280px] sm:max-w-xs pt-2">
                                <span className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mr-4 opacity-40">Total Final</span>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-primary tracking-tighter">
                                        {new Intl.NumberFormat('es-PY').format(factura.total)}
                                    </span>
                                    <span className="text-[10px] font-black text-primary uppercase ml-1 opacity-60">Gs</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Observaciones */}
                    {factura.observaciones && (
                        <div className="bg-surface-card p-8 rounded-[2rem] border border-border shadow-sm mx-2 sm:mx-0 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L14.017 3H21.017V21H14.017ZM3.017 21V18C3.017 16.8954 3.91238 16 5.017 16H8.017C8.56928 16 9.017 15.5523 9.017 15V9C9.017 8.44772 8.56928 8 8.017 8H5.017C3.91238 8 3.017 7.10457 3.017 6V3L3.017 3H10.017V21H3.017Z" />
                                </svg>
                            </div>
                            <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-4 opacity-40">Anotaciones del Comprobante</h3>
                            <p className="text-text-primary font-bold leading-relaxed italic text-sm sm:text-base pr-8">"{factura.observaciones}"</p>
                        </div>
                    )}

                    {/* Cuotas - Solo si es CREDITO y tiene cuotas */}
                    {cuotas.length > 0 && (
                        <div className="bg-surface-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden mx-2 sm:mx-0">
                            <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-warning-light/5">
                                <h2 className="font-black text-warning-dark uppercase tracking-tight text-sm">Calendario de Vencimientos</h2>
                                <span className="text-[10px] font-black text-warning-dark uppercase tracking-widest opacity-60">{cuotas.length} cuotas programadas</span>
                            </div>
                            <div className="divide-y divide-border">
                                {cuotas.map((cuota) => {
                                    const isVencida = cuota.vencida === 'S' || cuota.estado === 'VENCIDA';
                                    const isPagada = cuota.estado === 'PAGADA';
                                    const isParcial = cuota.estado === 'PARCIAL';

                                    return (
                                        <div
                                            key={cuota.cuota_id}
                                            className={`px-8 py-6 flex items-center justify-between gap-6 transition-all ${isPagada ? 'bg-secondary-light/5 opacity-60' : isVencida ? 'bg-danger-light/5' : 'hover:bg-primary-light/5'}`}
                                        >
                                            <div className="flex items-center gap-5 min-w-0">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 border shadow-sm ${isPagada ? 'bg-secondary text-white border-secondary/20 shadow-secondary/10' : isVencida ? 'bg-danger text-white border-danger/20 shadow-danger/10 animate-pulse' : isParcial ? 'bg-primary text-white border-primary/20 shadow-primary/10' : 'bg-surface-raised text-text-secondary border-border'}`}>
                                                    {isPagada ? (
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    ) : cuota.numero_cuota}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`font-black uppercase tracking-tight text-sm sm:text-base truncate ${isPagada ? 'text-text-secondary' : 'text-text-primary'}`}>
                                                        Cuota <span className="text-primary">#{cuota.numero_cuota}</span>
                                                        {isParcial && <span className="ml-2 text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded-full tracking-widest uppercase">Parcial</span>}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <svg className={`w-3.5 h-3.5 ${isVencida ? 'text-danger' : 'text-text-secondary opacity-40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isVencida ? 'text-danger' : 'text-text-secondary opacity-40'}`}>
                                                            {new Date(cuota.fecha_vencimiento).toLocaleDateString()}
                                                            {isVencida && !isPagada && ' • VENCIDA'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 shrink-0">
                                                <div className="text-right">
                                                    <p className={`font-black text-base sm:text-lg tracking-tighter ${isPagada ? 'text-text-secondary opacity-40 line-through' : isVencida ? 'text-danger' : 'text-text-primary'}`}>
                                                        {new Intl.NumberFormat('es-PY').format(cuota.monto_cuota)} <span className="text-[10px]">Gs</span>
                                                    </p>
                                                    {cuota.saldo_cuota > 0 && cuota.saldo_cuota < cuota.monto_cuota && (
                                                        <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">
                                                            Saldo: {new Intl.NumberFormat('es-PY').format(cuota.saldo_cuota)} Gs
                                                        </p>
                                                    )}
                                                </div>
                                                {!isPagada && factura.estado !== 'ANULADA' && (
                                                    <button
                                                        onClick={() => cajaAbierta ? openPagoModal(cuota) : null}
                                                        disabled={!cajaAbierta}
                                                        title={!cajaAbierta ? 'Debes abrir tu caja para pagar cuotas' : ''}
                                                        className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 ${cajaAbierta ? 'bg-secondary hover:bg-secondary-dark text-white shadow-secondary/20' : 'bg-surface-raised text-text-secondary opacity-50 cursor-not-allowed border border-border shadow-none'}`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
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
                        <div className="bg-surface-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden mx-2 sm:mx-0">
                            <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-secondary-light/5">
                                <h2 className="font-black text-secondary uppercase tracking-tight text-sm">Registro de Cobros</h2>
                                <span className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">{pagos.length} cobro{pagos.length > 1 ? 's' : ''} efectuado{pagos.length > 1 ? 's' : ''}</span>
                            </div>
                            <div className="divide-y divide-border">
                                {pagos.map((pago) => (
                                    <div
                                        key={pago.pago_id}
                                        className="px-8 py-6 flex items-center justify-between gap-6 hover:bg-primary-light/5 transition-all"
                                    >
                                        <div className="flex items-center gap-5 min-w-0">
                                            <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center text-sm font-black shrink-0 border border-secondary/20 shadow-lg shadow-secondary/10">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-text-primary text-sm sm:text-base uppercase tracking-tight truncate">
                                                    {pago.metodo_pago}
                                                    {pago.referencia && <span className="ml-2 text-[10px] text-text-secondary font-black opacity-40">REF: #{pago.referencia}</span>}
                                                </p>
                                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 mt-1">
                                                    Operación: <span className="text-text-primary opacity-100">{new Date(pago.fecha_pago).toLocaleDateString()}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 shrink-0">
                                            <p className="font-black text-secondary text-lg sm:text-xl tracking-tighter">
                                                {new Intl.NumberFormat('es-PY').format(pago.monto)} <span className="text-[10px] opacity-60">Gs</span>
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => imprimirRecibo(pago)}
                                                    title="Imprimir recibo de este pago"
                                                    className="p-3 bg-surface-raised border border-border text-text-secondary hover:text-primary rounded-xl transition-all shadow-sm group"
                                                >
                                                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                                    </svg>
                                                </button>
                                                {factura.estado !== 'ANULADA' && (
                                                    <button
                                                        onClick={() => cajaAbierta ? setAnularPagoModal({ open: true, pago }) : null}
                                                        disabled={!cajaAbierta}
                                                        title={!cajaAbierta ? 'Debes abrir tu caja para anular pagos' : ''}
                                                        className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${cajaAbierta ? 'bg-danger text-white hover:bg-danger-dark shadow-xl shadow-danger/20' : 'bg-surface-raised text-text-secondary opacity-50 cursor-not-allowed border border-border shadow-none'}`}
                                                    >
                                                        Anular
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Status Card */}
                    <div className={`p-8 rounded-[2.5rem] border-2 shadow-sm flex items-center lg:flex-col text-left lg:text-center gap-6 relative overflow-hidden group ${getStatusStyle(factura.estado)}`}>
                        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-current opacity-5 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/40 backdrop-blur-md flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-current/5 shrink-0 border border-white/40">
                            {factura.estado === 'PAGADA' ? '✅' : factura.estado === 'ANULADA' ? '🚫' : '⏳'}
                        </div>
                        <div className="flex-1 lg:w-full">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">Dictamen de Cobro</p>
                            <p className="text-2xl sm:text-3xl font-black tracking-tighter leading-none">{factura.estado}</p>
                            {factura.saldo_pendiente > 0 && (
                                <div className="mt-5 pt-5 border-t border-current/10 w-full">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Saldo Pendiente</p>
                                    <p className="text-xl font-black tracking-tighter">{new Intl.NumberFormat('es-PY').format(factura.saldo_pendiente)} <span className="text-xs">Gs</span></p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Patient Card */}
                    <div className="bg-surface-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20"></div>
                        <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Identidad del Beneficiario</h3>
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-primary/20 shrink-0 border-4 border-white">
                                {factura.nombre_cliente?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="font-black text-text-primary uppercase tracking-tight leading-none truncate">{factura.nombre_cliente}</p>
                                <div className="flex items-center gap-1.5 mt-2 bg-surface-raised px-2.5 py-1 rounded-lg w-fit border border-border">
                                    <span className="text-[9px] font-black text-text-secondary opacity-40 uppercase">{factura.tipo_documento_cliente}:</span>
                                    <span className="text-[10px] font-black text-text-primary">{factura.numero_documento_cliente}</span>
                                </div>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-border flex justify-between items-center gap-4">
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40 shrink-0">Condición Fiscal</span>
                            <span className="bg-primary/5 border border-primary/20 px-4 py-1.5 rounded-xl text-[9px] font-black text-primary uppercase tracking-widest truncate">
                                {factura.condicion_operacion} {factura.condicion_operacion === 'CREDITO' ? `(${factura.plazo_credito_dias}D)` : ''}
                            </span>
                        </div>
                        <button
                            onClick={() => navigate(`/pacientes/${factura.paciente_id}`)}
                            className="w-full bg-primary-dark hover:bg-black text-white py-4 rounded-2xl font-black text-[10px] transition-all uppercase tracking-widest shadow-xl shadow-primary-dark/20 border border-white/10"
                        >
                            Ver Legajo Clínico
                        </button>
                    </div>

                    {/* Fiscal Info */}
                    <div className="bg-surface-raised p-8 rounded-[2.5rem] border border-border space-y-6">
                        <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Especificaciones SET</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Timbrado Nro</span>
                                <span className="font-mono text-xs font-black text-text-primary bg-white px-3 py-1 rounded-lg border border-border">{factura.numero_timbrado}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">PV-Boca-Nro</span>
                                <span className="font-mono text-xs font-black text-text-primary bg-white px-3 py-1 rounded-lg border border-border">{factura.establecimiento}-{factura.punto_expedicion}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-40">Folio Interno</span>
                                <span className="font-mono text-xs font-black text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">#{factura.factura_id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Pago de Cuota */}
            {pagoModal.open && pagoModal.cuota && (
                <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-in zoom-in-95 border border-white/20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight leading-none">
                                Liquidar Cuota <span className="text-primary">#{pagoModal.cuota.numero_cuota}</span>
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-surface-raised border border-border p-6 rounded-2xl space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-text-secondary opacity-40">Monto Nominal:</span>
                                    <span className="text-text-primary">{new Intl.NumberFormat('es-PY').format(pagoModal.cuota.monto_cuota)} Gs</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-3 border-t border-border/50">
                                    <span className="text-text-secondary opacity-40">Saldo Exigible:</span>
                                    <span className="text-primary text-sm">{new Intl.NumberFormat('es-PY').format(pagoModal.cuota.saldo_cuota)} Gs</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Monto a Percibir</label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        className="w-full bg-surface-raised border-2 border-border rounded-xl text-xl font-black p-4 focus:border-primary focus:outline-none transition-all pr-12"
                                        value={montoPago}
                                        onChange={(e) => setMontoPago(parseFloat(e.target.value) || 0)}
                                        max={pagoModal.cuota.saldo_cuota}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-text-secondary opacity-40 uppercase">Gs</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Modalidad de Cobro</label>
                                <select
                                    className="w-full bg-surface-raised border-2 border-border rounded-xl text-xs font-black uppercase tracking-widest p-4 focus:border-primary focus:outline-none transition-all appearance-none cursor-pointer"
                                    value={metodoPago}
                                    onChange={(e) => setMetodoPago(e.target.value)}
                                >
                                    <option value="EFECTIVO">💵 EFECTIVO</option>
                                    <option value="TRANSFERENCIA">🏦 TRANSFERENCIA</option>
                                    <option value="TARJETA">💳 TARJETA</option>
                                    <option value="CHEQUE">📝 CHEQUE</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-10">
                            <button
                                onClick={() => setPagoModal({ open: false, cuota: null })}
                                className="px-6 py-4 bg-surface-raised hover:bg-border text-text-secondary rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-border"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handlePagarCuota}
                                disabled={pagarCuotaMutation.isPending || montoPago <= 0 || montoPago > pagoModal.cuota.saldo_cuota}
                                className="px-6 py-4 bg-secondary hover:bg-secondary-dark disabled:bg-surface-raised disabled:text-text-secondary/40 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-secondary/20 flex items-center justify-center gap-2"
                            >
                                {pagarCuotaMutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Anulación */}
            {anularModal && (
                <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-in zoom-in-95 border border-white/20">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 rounded-[2rem] bg-danger/10 text-danger flex items-center justify-center mx-auto mb-6 shadow-inner border border-danger/10">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-2">
                                Anular Comprobante
                            </h3>
                            <p className="text-text-secondary font-black text-[10px] uppercase tracking-widest opacity-40">
                                {factura.numero_factura_completo}
                            </p>
                        </div>

                        <div className="bg-danger/5 border border-danger/20 rounded-2xl p-6 mb-8">
                            <p className="text-xs text-danger font-black uppercase tracking-tight text-center leading-relaxed">
                                Esta operación es irreversible. El comprobante pasará a estado ANULADO permanentemente.
                            </p>
                        </div>

                        <div className="space-y-2 mb-8 text-left">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">
                                Justificación de la Anulación
                            </label>
                            <textarea
                                className="w-full bg-surface-raised border-2 border-border rounded-2xl text-sm font-bold p-5 focus:border-danger/30 focus:outline-none transition-all resize-none shadow-inner"
                                rows="4"
                                placeholder="Describa el motivo detallado..."
                                value={motivoAnulacion}
                                onChange={(e) => setMotivoAnulacion(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setAnularModal(false);
                                    setMotivoAnulacion('');
                                }}
                                className="px-6 py-4 bg-surface-raised hover:bg-border text-text-secondary rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-border"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => anularMutation.mutate(motivoAnulacion)}
                                disabled={anularMutation.isPending || !motivoAnulacion.trim()}
                                className="px-6 py-4 bg-danger hover:bg-danger-dark disabled:bg-surface-raised disabled:text-text-secondary/40 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-danger/20 flex items-center justify-center gap-2"
                            >
                                {anularMutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                )}
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ÁREA DE IMPRESIÓN (OCULTA) */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none' }}>
                {factura && (
                    <FacturaPrint factura={factura} detalles={detalles} empresa={empresa} />
                )}
            </div>

            {/* Modal de Anulación de Pago */}
            {anularPagoModal.open && anularPagoModal.pago && (
                <div className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-card rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 animate-in zoom-in-95 border border-white/20">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 rounded-[2rem] bg-danger/10 text-danger flex items-center justify-center mx-auto mb-6 shadow-inner border border-danger/10">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-2">
                                Anular Transacción
                            </h3>
                            <p className="text-text-secondary font-black text-[10px] uppercase tracking-widest opacity-40">
                                {anularPagoModal.pago.metodo_pago} • {new Intl.NumberFormat('es-PY').format(anularPagoModal.pago.monto)} Gs
                            </p>
                        </div>

                        <div className="bg-danger/5 border border-danger/20 rounded-2xl p-6 mb-8 text-center">
                            <p className="text-xs text-danger font-black uppercase tracking-tight">
                                Al anular el ingreso, se revertirá el saldo de la factura y cuotas asociadas.
                            </p>
                        </div>

                        <div className="space-y-2 mb-8 text-left">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">
                                Motivo de Reversión *
                            </label>
                            <textarea
                                className="w-full bg-surface-raised border-2 border-border rounded-2xl text-sm font-bold p-5 focus:border-danger/30 focus:outline-none transition-all resize-none shadow-inner"
                                rows="4"
                                placeholder="Especifique el motivo de anulación del cobro..."
                                value={motivoAnulacionPago}
                                onChange={(e) => setMotivoAnulacionPago(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setAnularPagoModal({ open: false, pago: null });
                                    setMotivoAnulacionPago('');
                                }}
                                className="px-6 py-4 bg-surface-raised hover:bg-border text-text-secondary rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-border"
                            >
                                Volver
                            </button>
                            <button
                                onClick={() => anularPagoMutation.mutate({
                                    pagoId: anularPagoModal.pago.pago_id,
                                    motivo: motivoAnulacionPago
                                })}
                                disabled={anularPagoMutation.isPending || !motivoAnulacionPago.trim()}
                                className="px-6 py-4 bg-danger hover:bg-danger-dark disabled:bg-surface-raised disabled:text-text-secondary/40 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-danger/20 flex items-center justify-center gap-2"
                            >
                                {anularPagoMutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                )}
                                Anular Pago
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacturaDetalle;
