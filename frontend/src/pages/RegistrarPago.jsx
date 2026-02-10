import { useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { billingService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RegistrarPago = () => {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const { id: idFromParams } = useParams();
    const [searchParams] = useSearchParams();
    const facturaId = idFromParams || searchParams.get('facturaId');

    const [formData, setFormData] = useState({
        monto: '',
        metodo_pago: 'EFECTIVO',
        referencia: '',
        banco: ''
    });
    const [error, setError] = useState(null);

    // Obtener datos de la factura
    const { data: facturaRes, isLoading: loadingFactura } = useQuery({
        queryKey: ['factura', facturaId],
        queryFn: () => billingService.getFacturaById(facturaId),
        enabled: !!facturaId
    });

    const factura = facturaRes?.data?.items?.[0] || facturaRes?.data?.factura?.[0] || facturaRes?.data?.factura;

    // Mutation para registrar pago
    const pagoMutation = useMutation({
        mutationFn: (data) => billingService.registrarPago(facturaId, data),
        onSuccess: (res) => {
            if (res.data.resultado === 1) {
                navigate(`/facturas/${facturaId}?pagoExitoso=true`);
            } else {
                setError(res.data.mensaje || "Error al registrar el pago.");
            }
        },
        onError: (err) => {
            setError(err.response?.data?.mensaje || "Error al procesar el pago.");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.monto || parseFloat(formData.monto) <= 0) {
            setError("Debe ingresar un monto válido.");
            return;
        }

        if (parseFloat(formData.monto) > (factura?.saldo_pendiente || 0)) {
            setError("El monto no puede ser mayor al saldo pendiente.");
            return;
        }

        pagoMutation.mutate({
            monto: parseFloat(formData.monto),
            metodo_pago: formData.metodo_pago,
            referencia: formData.referencia || null,
            banco: formData.banco || null,
            registrado_por: usuario?.usuario_id || 1
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!facturaId) {
        return (
            <div className="p-20 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner animate-bounce">⚠️</div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Factura no especificada</h2>
                    <p className="text-slate-500 font-medium">Debe acceder desde el detalle de una factura para registrar un pago.</p>
                </div>
                <button
                    onClick={() => navigate('/facturas')}
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs hover:bg-black transition-all shadow-xl shadow-slate-200"
                >
                    Ir al listado de Facturas
                </button>
            </div>
        );
    }

    if (loadingFactura) {
        return (
            <div className="p-20 flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="font-black text-slate-400 uppercase tracking-widest animate-pulse">Consultando datos de factura...</p>
            </div>
        );
    }

    if (!factura) {
        return (
            <div className="p-20 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">🔍</div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Factura no encontrada</h2>
                    <p className="text-slate-500 font-medium">No pudimos localizar la factura solicitada.</p>
                </div>
                <button
                    onClick={() => navigate('/facturas')}
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs hover:bg-black transition-all"
                >
                    Volver al listado
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate(`/facturas/${facturaId}`)}
                        className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group"
                        title="Volver"
                    >
                        <svg className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            Registrar Pago
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-blue-200">Factura</span>
                            <p className="text-slate-500 font-bold">{factura.numero_factura_completo}</p>
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-3 bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Saldo Protegido</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lateral: Resumen */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#0a0f1d] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        {/* Decoración */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Estado Actual</p>
                                    <h3 className="text-xl font-bold">Resumen de Factura</h3>
                                </div>
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Paciente / Titular</p>
                                    <p className="text-xl font-black tracking-tight">{factura.nombre_cliente}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total</p>
                                        <p className="text-lg font-bold">{new Intl.NumberFormat('es-PY').format(factura.total)} Gs</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Pendiente</p>
                                        <p className="text-2xl font-black text-rose-400">
                                            {new Intl.NumberFormat('es-PY').format(factura.saldo_pendiente)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-600/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="font-black uppercase tracking-widest text-sm">Información de Caja</h4>
                        </div>
                        <p className="text-emerald-100 font-medium leading-relaxed">
                            Al registrar un pago en efectivo, se generará automáticamente un movimiento de ingreso en tu caja abierta actual.
                        </p>
                    </div>
                </div>

                {/* Formulario Principal */}
                <div className="lg:col-span-7">
                    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-150 fill-mode-both">

                        {error && (
                            <div className="flex items-center gap-4 bg-rose-50 border border-rose-100 p-5 rounded-3xl animate-in slide-in-from-top-4 duration-300">
                                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-black text-rose-900 leading-tight">{error}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Campo: Monto */}
                            <div className="space-y-2 group">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-emerald-600 transition-colors">
                                    Monto a Percibir
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <span className="text-2xl font-black text-slate-300 group-focus-within:text-emerald-400 transition-colors">Gs</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="monto"
                                        value={formData.monto}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full pl-20 pr-8 py-6 bg-slate-50/50 border-2 border-slate-50 rounded-[1.5rem] text-4xl font-black text-slate-900 placeholder-slate-200 focus:outline-none focus:ring-0 focus:border-emerald-500/50 focus:bg-white transition-all text-right"
                                        max={factura.saldo_pendiente}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, monto: factura.saldo_pendiente }))}
                                        className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all hover:bg-emerald-100 active:scale-95"
                                    >
                                        Pagar Total: {new Intl.NumberFormat('es-PY').format(factura.saldo_pendiente)} Gs
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                {/* Campo: Método de Pago */}
                                <div className="space-y-2 group">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">
                                        Canal de Pago
                                    </label>
                                    <select
                                        name="metodo_pago"
                                        value={formData.metodo_pago}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-0 focus:border-blue-500/50 focus:bg-white transition-all appearance-none"
                                    >
                                        <option value="EFECTIVO">💵 Efectivo</option>
                                        <option value="TARJETA_DEBITO">💳 Tarjeta de Débito</option>
                                        <option value="TARJETA_CREDITO">💳 Tarjeta de Crédito</option>
                                        <option value="TRANSFERENCIA">🏦 Transferencia Bancaria</option>
                                        <option value="CHEQUE">📝 Cheque</option>
                                    </select>
                                </div>

                                {['TRANSFERENCIA', 'CHEQUE', 'TARJETA_DEBITO', 'TARJETA_CREDITO'].includes(formData.metodo_pago) && (
                                    <div className="space-y-2 group animate-in slide-in-from-right-4 duration-300">
                                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">
                                            Entidad Bancaria
                                        </label>
                                        <input
                                            type="text"
                                            name="banco"
                                            value={formData.banco}
                                            onChange={handleChange}
                                            placeholder="Nombre del banco / financiera"
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-blue-500/50 focus:bg-white transition-all"
                                        />
                                    </div>
                                )}

                                {/* Campo: Referencia */}
                                <div className="md:col-span-2 space-y-2 group">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">
                                        Nro. Comprobante / Referencia
                                    </label>
                                    <input
                                        type="text"
                                        name="referencia"
                                        value={formData.referencia}
                                        onChange={handleChange}
                                        placeholder="Ingrese el número de transacción o voucher"
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-900 font-bold placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-blue-500/50 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botón de Acción */}
                        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <button
                                type="button"
                                onClick={() => navigate(`/facturas/${facturaId}`)}
                                className="order-2 md:order-1 px-8 py-4 text-slate-400 font-black uppercase text-[11px] tracking-widest hover:text-slate-600 transition-all hover:bg-slate-50 rounded-2xl"
                            >
                                Cancelar Registro
                            </button>

                            <button
                                type="submit"
                                disabled={pagoMutation.isPending || !formData.monto}
                                className={`order-1 md:order-2 w-full md:w-auto px-16 py-5 rounded-[1.8rem] font-black text-white shadow-2xl transition-all flex items-center justify-center gap-4 ${pagoMutation.isPending || !formData.monto
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 active:scale-[0.98]'
                                    }`}
                            >
                                {pagoMutation.isPending ? (
                                    <>
                                        <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Procesando Pago...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Confirmar Pago</span>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrarPago;
