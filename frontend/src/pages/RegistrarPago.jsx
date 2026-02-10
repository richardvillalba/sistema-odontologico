import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { billingService } from '../services/api';

const RegistrarPago = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const facturaId = searchParams.get('facturaId');

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

    const factura = facturaRes?.data?.factura?.[0] || facturaRes?.data?.factura;

    // Mutation para registrar pago
    const pagoMutation = useMutation({
        mutationFn: (data) => billingService.registrarPago(facturaId, data),
        onSuccess: (res) => {
            if (res.data.resultado === 1) {
                navigate(`/facturas/${facturaId}`);
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
            registrado_por: 1 // TODO: Auth
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!facturaId) {
        return (
            <div className="p-20 text-center space-y-4">
                <div className="text-6xl">⚠️</div>
                <h2 className="text-2xl font-black text-slate-900">Factura no especificada</h2>
                <p className="text-slate-500">Debe acceder desde el detalle de una factura.</p>
                <button onClick={() => navigate('/facturas')} className="text-indigo-600 font-bold uppercase text-xs">
                    Ir a Facturas
                </button>
            </div>
        );
    }

    if (loadingFactura) {
        return (
            <div className="p-20 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest">
                Cargando factura...
            </div>
        );
    }

    if (!factura) {
        return (
            <div className="p-20 text-center space-y-4">
                <div className="text-6xl">🔍</div>
                <h2 className="text-2xl font-black text-slate-900">Factura no encontrada</h2>
                <button onClick={() => navigate('/facturas')} className="text-indigo-600 font-bold uppercase text-xs">
                    Volver al listado
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(`/facturas/${facturaId}`)}
                    className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                >
                    ⬅️
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Registrar Pago
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Factura {factura.numero_factura_completo}
                    </p>
                </div>
            </div>

            {/* Resumen de Factura */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-[2rem] shadow-xl">
                <div className="grid grid-cols-3 gap-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Cliente</p>
                        <p className="font-bold text-lg">{factura.nombre_cliente}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Factura</p>
                        <p className="font-black text-2xl">{new Intl.NumberFormat('es-PY').format(factura.total)} Gs</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Saldo Pendiente</p>
                        <p className="font-black text-3xl text-emerald-400">
                            {new Intl.NumberFormat('es-PY').format(factura.saldo_pendiente)} Gs
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-center gap-4">
                    <span className="text-2xl">⚠️</span>
                    <p className="text-rose-700 font-bold">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-rose-300 hover:text-rose-500">✕</button>
                </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Monto */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Monto a Pagar *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                name="monto"
                                value={formData.monto}
                                onChange={handleChange}
                                placeholder="0"
                                className="w-full bg-slate-50 border-slate-200 rounded-xl text-3xl font-black text-emerald-600 p-4 pr-16 text-right"
                                max={factura.saldo_pendiente}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Gs</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, monto: factura.saldo_pendiente }))}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                        >
                            Pagar total pendiente ({new Intl.NumberFormat('es-PY').format(factura.saldo_pendiente)} Gs)
                        </button>
                    </div>

                    {/* Método de Pago */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Método de Pago *
                        </label>
                        <select
                            name="metodo_pago"
                            value={formData.metodo_pago}
                            onChange={handleChange}
                            className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold p-3"
                        >
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                            <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                            <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                            <option value="CHEQUE">Cheque</option>
                        </select>
                    </div>

                    {/* Banco (condicional) */}
                    {['TRANSFERENCIA', 'CHEQUE', 'TARJETA_DEBITO', 'TARJETA_CREDITO'].includes(formData.metodo_pago) && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                Banco / Entidad
                            </label>
                            <input
                                type="text"
                                name="banco"
                                value={formData.banco}
                                onChange={handleChange}
                                placeholder="Nombre del banco..."
                                className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold p-3"
                            />
                        </div>
                    )}

                    {/* Referencia */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Referencia / Nro. Comprobante
                        </label>
                        <input
                            type="text"
                            name="referencia"
                            value={formData.referencia}
                            onChange={handleChange}
                            placeholder="Número de transacción, voucher, etc..."
                            className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold p-3"
                        />
                    </div>
                </div>

                {/* Botones */}
                <div className="pt-6 flex justify-end gap-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate(`/facturas/${facturaId}`)}
                        className="px-8 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={pagoMutation.isPending || !formData.monto}
                        className={`px-12 py-4 rounded-2xl font-black shadow-xl transition-all flex items-center gap-3 ${
                            pagoMutation.isPending || !formData.monto
                                ? 'bg-slate-200 text-slate-400'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:scale-105 active:scale-95'
                        }`}
                    >
                        {pagoMutation.isPending ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Procesando...
                            </>
                        ) : (
                            <>
                                <span>Registrar Pago</span>
                                <span className="text-xl">💰</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistrarPago;
