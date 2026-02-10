import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePointOfSale } from '../context/PointOfSaleContext';
import { billingService } from '../services/api';
import PacienteSelector from '../components/facturacion/PacienteSelector';
import TratamientosPendientes from '../components/facturacion/TratamientosPendientes';
import FacturaItemsTable from '../components/facturacion/FacturaItemsTable';

const FacturaNueva = () => {
    const navigate = useNavigate();
    const { selectedPoint, isValid, refreshPoints } = usePointOfSale();

    // Form State
    const [selectedPaciente, setSelectedPaciente] = useState(null);
    const [items, setItems] = useState([]);
    const [headerData, setHeaderData] = useState({
        condicion_operacion: 'CONTADO',
        tipo_factura: 'B', // Tipo B para consumidor final
        plazo_credito_dias: 0,
        observaciones: '',
        // Configuración de cuotas (solo para CREDITO)
        cantidad_cuotas: 1,
        frecuencia_cuotas: 'MENSUAL',
        fecha_primera_cuota: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Business Rules
    const subtotal = items.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario) - (item.descuento || 0), 0);

    const handleAddItem = (item) => {
        setItems([...items, item]);
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItemQuantity = (index, qty) => {
        setItems(items.map((item, i) => i === index ? { ...item, cantidad: qty } : item));
    };

    const updateItemDiscount = (index, discount) => {
        setItems(items.map((item, i) => i === index ? { ...item, descuento: discount } : item));
    };

    const handleSubmit = async () => {
        if (!selectedPaciente || items.length === 0) {
            setError("Debe seleccionar un paciente y al menos un ítem.");
            return;
        }

        if (!isValid) {
            setError("Su punto de expedición no es válido para facturar.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // 1. Crear Cabecera
            const facturaRes = await billingService.createFactura({
                paciente_id: selectedPaciente.paciente_id,
                usuario_id: 1, // TODO: Auth
                empresa_id: 1, // TODO: Context/Auth
                sucursal_id: 1, // TODO: Context/Auth
                timbrado_id: selectedPoint?.timbrado_id, // Punto de expedición seleccionado
                tipo_factura: headerData.tipo_factura,
                condicion_operacion: headerData.condicion_operacion,
                plazo_credito_dias: headerData.plazo_credito_dias,
                observaciones: headerData.observaciones
            });

            const facturaId = facturaRes.data.factura_id;

            if (facturaRes.data.resultado !== 1) {
                throw new Error(facturaRes.data.mensaje || "Error al crear la cabecera de la factura.");
            }

            // 2. Cargar Detalles
            for (const item of items) {
                const detalleRes = await billingService.addFacturaDetalle(facturaId, {
                    tratamiento_paciente_id: item.tratamiento_paciente_id || null,
                    tratamiento_diente_id: item.tratamiento_diente_id || null,
                    descripcion: item.descripcion,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario,
                    descuento: item.descuento || 0
                });

                if (detalleRes.data.resultado !== 1) {
                    throw new Error(detalleRes.data.mensaje || "Error al agregar detalle a la factura.");
                }
            }

            // 3. Confirmar y Calcular Totales
            await billingService.confirmarFactura(facturaId);

            // 4. Si es CONTADO, registrar pago automático por el total
            if (headerData.condicion_operacion === 'CONTADO') {
                await billingService.registrarPago(facturaId, {
                    monto: subtotal,
                    metodo_pago: 'EFECTIVO',
                    registrado_por: 1 // TODO: Auth
                });
            }

            // 5. Si es CREDITO con cuotas, generarlas (no bloquea si falla)
            if (headerData.condicion_operacion === 'CREDITO' && headerData.cantidad_cuotas > 0) {
                try {
                    await billingService.generarCuotas(facturaId, {
                        cantidad_cuotas: headerData.cantidad_cuotas,
                        frecuencia: headerData.frecuencia_cuotas,
                        fecha_primera: headerData.fecha_primera_cuota || null
                    });
                } catch (cuotasErr) {
                    console.warn("No se pudieron generar las cuotas:", cuotasErr);
                    // La factura se creó correctamente, las cuotas se pueden agregar después
                }
            }

            // 5. Refrescar puntos de expedición para actualizar numeración
            await refreshPoints(selectedPoint?.timbrado_id);

            // Éxito: Navegar al detalle de la factura
            navigate(`/facturas/${facturaId}`);

        } catch (err) {
            console.error("Error creating invoice:", err);
            setError(err.response?.data?.mensaje || err.message || "Error al procesar la factura.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg">🧾</span>
                        Nueva Factura
                    </h1>
                    <p className="text-slate-500 font-medium ml-12">Emisión de facturas legales para pacientes.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timbrado</p>
                        <p className={`font-bold text-sm ${isValid ? 'text-slate-700' : 'text-rose-500'}`}>
                            {selectedPoint ? selectedPoint.numero_timbrado : "-"}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próxima Factura</p>
                        <p className={`font-black text-lg font-mono ${isValid ? 'text-indigo-600' : 'text-rose-500'}`}>
                            {selectedPoint
                                ? `${selectedPoint.establecimiento}-${selectedPoint.punto_expedicion}-${String(selectedPoint.numero_actual).padStart(7, '0')}`
                                : "No seleccionado"}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-center gap-4 animate-shake">
                    <span className="text-2xl">⚠️</span>
                    <p className="text-rose-700 font-bold">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-rose-300 hover:text-rose-500">✕</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Lateral Izquierdo: Paciente y Tratamientos */}
                <div className="lg:col-span-1 space-y-6">
                    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">1</span>
                            <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Seleccionar Paciente</h2>
                        </div>
                        <PacienteSelector
                            selectedPaciente={selectedPaciente}
                            onSelect={(p) => {
                                setSelectedPaciente(p);
                                if (!p) setItems([]); // Limpiar items si se quita el paciente
                            }}
                        />
                    </section>

                    {selectedPaciente && (
                        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in slide-in-from-left-4 duration-500">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">2</span>
                                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Tratamientos del Paciente</h2>
                            </div>
                            <TratamientosPendientes
                                pacienteId={selectedPaciente.paciente_id}
                                onAdd={handleAddItem}
                                addedItems={items}
                            />
                        </section>
                    )}
                </div>

                {/* Área Principal: Detalle de Factura */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Details */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Condición</label>
                            <div className="flex p-1 bg-slate-100 rounded-xl">
                                {['CONTADO', 'CREDITO'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setHeaderData({ ...headerData, condicion_operacion: type })}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${headerData.condicion_operacion === type
                                                ? 'bg-white text-indigo-600 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {headerData.condicion_operacion === 'CREDITO' && (
                            <>
                                <div className="space-y-1.5 animate-in zoom-in-95">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cantidad Cuotas</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="24"
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold p-2.5"
                                        value={headerData.cantidad_cuotas}
                                        onChange={(e) => setHeaderData({ ...headerData, cantidad_cuotas: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                                <div className="space-y-1.5 animate-in zoom-in-95">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frecuencia</label>
                                    <select
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold p-2.5"
                                        value={headerData.frecuencia_cuotas}
                                        onChange={(e) => setHeaderData({ ...headerData, frecuencia_cuotas: e.target.value })}
                                    >
                                        <option value="SEMANAL">Semanal</option>
                                        <option value="QUINCENAL">Quincenal</option>
                                        <option value="MENSUAL">Mensual</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5 animate-in zoom-in-95">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primera Cuota</label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold p-2.5"
                                        value={headerData.fecha_primera_cuota}
                                        onChange={(e) => setHeaderData({ ...headerData, fecha_primera_cuota: e.target.value })}
                                    />
                                </div>
                                {/* Preview de cuotas */}
                                {subtotal > 0 && headerData.cantidad_cuotas > 0 && (
                                    <div className="md:col-span-3 bg-amber-50 border border-amber-200 rounded-xl p-4 animate-in zoom-in-95">
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Plan de Cuotas</p>
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-amber-700">
                                                    {headerData.cantidad_cuotas}
                                                </p>
                                                <p className="text-[10px] text-amber-600 font-bold">CUOTAS</p>
                                            </div>
                                            <div className="text-amber-400 text-xl">×</div>
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-amber-700">
                                                    {new Intl.NumberFormat('es-PY').format(Math.ceil(subtotal / headerData.cantidad_cuotas))}
                                                </p>
                                                <p className="text-[10px] text-amber-600 font-bold">GS C/U</p>
                                            </div>
                                            <div className="text-amber-400 text-xl">=</div>
                                            <div className="text-center">
                                                <p className="text-2xl font-black text-amber-700">
                                                    {new Intl.NumberFormat('es-PY').format(subtotal)}
                                                </p>
                                                <p className="text-[10px] text-amber-600 font-bold">TOTAL</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-amber-600 mt-2">
                                            Frecuencia: {headerData.frecuencia_cuotas.toLowerCase()}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="md:col-span-3 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observaciones</label>
                            <input
                                type="text"
                                placeholder="Nota interna..."
                                className="w-full bg-slate-50 border-slate-200 rounded-xl text-sm font-bold p-2.5"
                                value={headerData.observaciones}
                                onChange={(e) => setHeaderData({ ...headerData, observaciones: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="animate-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-indigo-600">3</span>
                            <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Conceptos a Facturar</h2>
                        </div>
                        <FacturaItemsTable
                            items={items}
                            onRemove={handleRemoveItem}
                            onUpdateQuantity={updateItemQuantity}
                            onUpdateDiscount={updateItemDiscount}
                            onAddManual={handleAddItem}
                        />
                    </div>

                    {/* Submit Bar */}
                    <div className="pt-4 flex justify-end gap-4">
                        <button
                            disabled={isSubmitting}
                            onClick={() => navigate('/facturas')}
                            className="px-8 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={isSubmitting || items.length === 0 || !selectedPaciente || !isValid}
                            onClick={handleSubmit}
                            className={`px-12 py-4 rounded-2xl font-black shadow-xl transition-all flex items-center gap-3 ${isSubmitting ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:scale-105 active:scale-95'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <span>Emitir Factura Legal</span>
                                    <span className="text-xl">➔</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacturaNueva;
