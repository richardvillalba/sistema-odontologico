import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usePointOfSale } from '../context/PointOfSaleContext';
import { useAuth } from '../contexts/AuthContext';
import { billingService, cajaService } from '../services/api';
import PacienteSelector from '../components/facturacion/PacienteSelector';
import TratamientosPendientes from '../components/facturacion/TratamientosPendientes';
import FacturaItemsTable from '../components/facturacion/FacturaItemsTable';

const FacturaNueva = () => {
    const navigate = useNavigate();
    const { usuario, empresaActiva, sucursalActiva } = useAuth();
    const { selectedPoint, isValid, refreshPoints } = usePointOfSale();
    const empresaId = empresaActiva?.empresa_id;
    const usuarioId = usuario?.usuario_id;
    const esSuperAdmin = usuario?.es_superadmin === 'S';

    // Verificar si el usuario tiene caja asignada
    const { data: cajasData, isLoading: loadingCajas } = useQuery({
        queryKey: ['cajas-usuario', empresaId, usuarioId],
        queryFn: () => cajaService.listar(empresaId),
    });
    const cajasUsuario = esSuperAdmin
        ? (cajasData?.data?.items || [])
        : (cajasData?.data?.items || []).filter(c => c.usuario_asignado_id === usuarioId || !c.usuario_asignado_id);
    const tieneCaja = cajasUsuario.length > 0;
    // Priorizar la caja asignada al usuario, luego cualquier abierta
    const cajaAbierta = cajasUsuario.find(c => c.estado === 'ABIERTA' && c.usuario_asignado_id === usuarioId)
        || cajasUsuario.find(c => c.estado === 'ABIERTA')
        || null;

    // Categorías de movimiento de caja
    const { data: categoriasRes } = useQuery({
        queryKey: ['caja-categorias-ingreso'],
        queryFn: () => cajaService.getCategorias('INGRESO'),
        enabled: !!cajaAbierta,
    });
    const categoriasCaja = categoriasRes?.data?.items || categoriasRes?.data || [];
    const catCobroFactura = categoriasCaja.find(c =>
        (c.nombre || c.NOMBRE || '').toLowerCase().includes('factura')
    );
    const catIdCobroFactura = catCobroFactura?.categoria_id || catCobroFactura?.CATEGORIA_ID || null;

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
                usuario_id: usuario?.usuario_id,
                empresa_id: empresaActiva?.empresa_id,
                sucursal_id: sucursalActiva?.sucursal_id,
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
                    registrado_por: usuario?.usuario_id
                });

                // 4b. Registrar movimiento en caja abierta (no bloquea si falla)
                if (cajaAbierta?.caja_id) {
                    try {
                        await cajaService.registrarMovimiento(cajaAbierta.caja_id, {
                            tipo: 'INGRESO',
                            categoria_id: catIdCobroFactura,
                            concepto: `Cobro factura #${facturaId}`,
                            monto: subtotal,
                            factura_id: facturaId,
                            referencia: String(facturaId),
                            registrado_por: usuarioId,
                        });
                    } catch (cajaErr) {
                        console.warn('No se pudo registrar movimiento en caja:', cajaErr);
                    }
                }
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

    // Bloquear si no tiene caja asignada
    if (!loadingCajas && !tieneCaja && !esSuperAdmin) {
        return (
            <div className="max-w-lg mx-auto mt-20 text-center animate-in zoom-in-95 duration-500 px-4">
                <div className="bg-surface-card rounded-[2.5rem] border border-border p-12 shadow-xl shadow-primary/5">
                    <div className="w-24 h-24 bg-warning/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-warning/10">
                        <svg className="w-12 h-12 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-4">Módulo Bloqueado</h2>
                    <p className="text-text-secondary font-medium mb-10 leading-relaxed">No se ha detectado una caja asignada a su usuario. Es imperativo contar con un arqueo activo para la emisión de comprobantes fiscales.</p>
                    <button
                        onClick={() => navigate('/facturas')}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20"
                    >
                        Volver al Repositorio
                    </button>
                </div>
            </div>
        );
    }

    // Bloquear si tiene caja pero está cerrada
    if (!loadingCajas && tieneCaja && !cajaAbierta) {
        return (
            <div className="max-w-lg mx-auto mt-20 text-center animate-in zoom-in-95 duration-500 px-4">
                <div className="bg-surface-card rounded-[2.5rem] border border-border p-12 shadow-xl shadow-primary/5">
                    <div className="w-24 h-24 bg-danger/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-danger/10">
                        <svg className="w-12 h-12 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-4">Caja Inactiva</h2>
                    <p className="text-text-secondary font-medium mb-10 leading-relaxed">El arqueo asignado se encuentra en estado <span className="text-danger font-black">CERRADO</span>. Debe iniciar sesión en el módulo de Tesorería para habilitar la facturación.</p>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/caja')}
                            className="bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20"
                        >
                            Apertura Caja
                        </button>
                        <button
                            onClick={() => navigate('/facturas')}
                            className="bg-surface-raised hover:bg-border text-text-secondary font-black py-4 rounded-2xl transition-all uppercase tracking-[0.2em] text-[10px] border border-border"
                        >
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header section standardized */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-primary/20 border-4 border-white shrink-0">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-black text-text-primary uppercase tracking-tight leading-none">
                            Nueva <span className="text-primary">Factura Legal</span>
                        </h1>
                        <p className="text-text-secondary font-black mt-2 text-[10px] uppercase tracking-widest opacity-40">Emisión de comprobantes tributarios para legajo clínico</p>
                    </div>
                </div>

                <div className="flex items-stretch gap-3">
                    <div className="bg-surface-card p-4 rounded-2xl border border-border shadow-sm flex flex-col justify-center min-w-[140px]">
                        <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 mb-1">Punto de Exp.</p>
                        <p className={`font-black text-xs uppercase tracking-tight ${isValid ? 'text-text-primary' : 'text-danger'}`}>
                            {selectedPoint ? `${selectedPoint.establecimiento}-${selectedPoint.punto_expedicion}` : "No asig."}
                        </p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 shadow-sm flex flex-col justify-center min-w-[180px]">
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-60 mb-1">Siguiente Folio</p>
                        <p className={`font-black text-lg font-mono tracking-tighter ${isValid ? 'text-primary' : 'text-danger'}`}>
                            {selectedPoint
                                ? String(selectedPoint.numero_actual).padStart(7, '0')
                                : "XXXXXXXX"}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-danger/5 border-2 border-danger/10 p-5 rounded-2xl flex items-center gap-4 animate-shake">
                    <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-danger font-black text-xs uppercase tracking-tight">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-danger/40 hover:text-danger p-2 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Lateral Izquierdo: Paciente y Tratamientos */}
                <div className="lg:col-span-1 space-y-8">
                    <section className="bg-surface-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-10"></div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0 border border-primary/10 tracking-tighter">
                                01
                            </div>
                            <h2 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Identificación de Sujeto</h2>
                        </div>
                        <div className="space-y-4">
                            <PacienteSelector
                                selectedPaciente={selectedPaciente}
                                onSelect={(p) => {
                                    setSelectedPaciente(p);
                                    if (!p) setItems([]);
                                }}
                            />
                        </div>
                    </section>

                    {selectedPaciente && (
                        <section className="bg-surface-card p-8 rounded-[2.5rem] border border-border shadow-sm space-y-6 relative overflow-hidden animate-in slide-in-from-left-6 duration-500">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary opacity-10"></div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-xs font-black shrink-0 border border-secondary/10 tracking-tighter">
                                    02
                                </div>
                                <h2 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Prestaciones Disponibles</h2>
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
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Details */}
                    <div className="bg-surface-card p-10 rounded-[2.5rem] border border-border shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-5"></div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Modalidad</label>
                            <div className="flex p-1.5 bg-surface-raised rounded-2xl border border-border">
                                {['CONTADO', 'CREDITO'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setHeaderData({ ...headerData, condicion_operacion: type })}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${headerData.condicion_operacion === type
                                            ? 'bg-white text-primary shadow-lg shadow-primary/5'
                                            : 'text-text-secondary opacity-50 hover:opacity-100 hover:bg-white/50'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {headerData.condicion_operacion === 'CREDITO' && (
                            <>
                                <div className="space-y-3 animate-in zoom-in-95">
                                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Amortizaciones</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="24"
                                        className="w-full bg-surface-raised border-2 border-border rounded-2xl text-sm font-black p-4 focus:border-primary focus:outline-none transition-all"
                                        value={headerData.cantidad_cuotas}
                                        onChange={(e) => setHeaderData({ ...headerData, cantidad_cuotas: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                                <div className="space-y-3 animate-in zoom-in-95">
                                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Periodicidad</label>
                                    <select
                                        className="w-full bg-surface-raised border-2 border-border rounded-2xl text-[10px] font-black uppercase tracking-widest p-4 appearance-none cursor-pointer focus:border-primary focus:outline-none transition-all"
                                        value={headerData.frecuencia_cuotas}
                                        onChange={(e) => setHeaderData({ ...headerData, frecuencia_cuotas: e.target.value })}
                                    >
                                        <option value="SEMANAL">Semanal</option>
                                        <option value="QUINCENAL">Quincenal</option>
                                        <option value="MENSUAL">Mensual</option>
                                    </select>
                                </div>
                                <div className="space-y-3 animate-in zoom-in-95">
                                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Venc. Inicial</label>
                                    <input
                                        type="date"
                                        className="w-full bg-surface-raised border-2 border-border rounded-2xl text-xs font-black p-4 focus:border-primary focus:outline-none transition-all"
                                        value={headerData.fecha_primera_cuota}
                                        onChange={(e) => setHeaderData({ ...headerData, fecha_primera_cuota: e.target.value })}
                                    />
                                </div>

                                {subtotal > 0 && headerData.cantidad_cuotas > 0 && (
                                    <div className="md:col-span-2 lg:col-span-3 bg-secondary/5 border border-secondary/20 rounded-3xl p-8 animate-in slide-in-from-top-4 duration-500">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Estructura de Financiamiento</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-8">
                                            <div className="space-y-1">
                                                <p className="text-2xl font-black text-text-primary tracking-tighter">
                                                    {headerData.cantidad_cuotas}
                                                </p>
                                                <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest opacity-40">Diferimientos</p>
                                            </div>
                                            <div className="text-secondary/20 text-xl font-black">×</div>
                                            <div className="space-y-1">
                                                <p className="text-2xl font-black text-text-primary tracking-tighter">
                                                    {new Intl.NumberFormat('es-PY').format(Math.ceil(subtotal / headerData.cantidad_cuotas))} <span className="text-[10px] uppercase opacity-40">Gs</span>
                                                </p>
                                                <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest opacity-40">Monto Periódico</p>
                                            </div>
                                            <div className="h-10 w-px bg-border hidden sm:block"></div>
                                            <div className="space-y-1 ml-auto text-right">
                                                <p className="text-2xl font-black text-secondary tracking-tighter">
                                                    {new Intl.NumberFormat('es-PY').format(subtotal)} <span className="text-[10px] uppercase opacity-60">Gs</span>
                                                </p>
                                                <p className="text-[8px] font-black text-secondary uppercase tracking-widest opacity-60">Compromiso Total</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="md:col-span-2 lg:col-span-3 space-y-3">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40 ml-1">Glosas y Notas</label>
                            <input
                                type="text"
                                placeholder="Referencia interna del comprobante..."
                                className="w-full bg-surface-raised border-2 border-border rounded-2xl text-sm font-bold p-4 focus:border-primary/30 focus:outline-none transition-all shadow-inner"
                                value={headerData.observaciones}
                                onChange={(e) => setHeaderData({ ...headerData, observaciones: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="animate-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0 border border-primary/10 tracking-tighter font-mono">
                                    03
                                </div>
                                <h2 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-40">Base Imponible y Conceptos</h2>
                            </div>
                        </div>
                        <div className="bg-surface-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                            <FacturaItemsTable
                                items={items}
                                onRemove={handleRemoveItem}
                                onUpdateQuantity={updateItemQuantity}
                                onUpdateDiscount={updateItemDiscount}
                                onAddManual={handleAddItem}
                            />
                        </div>
                    </div>

                    {/* Aviso de validación */}
                    {selectedPaciente && items.length === 0 && (
                        <div className="flex items-center gap-4 bg-warning/5 border border-warning/20 rounded-2xl p-6 animate-pulse">
                            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-[10px] font-black text-warning uppercase tracking-[0.15em] leading-relaxed">
                                El comprobante requiere al menos un ítem registrado para su validación fiscal.
                            </p>
                        </div>
                    )}

                    {/* Submit Bar Standardized */}
                    <div className="pt-8 flex flex-col sm:flex-row justify-end items-center gap-6">
                        <button
                            disabled={isSubmitting}
                            onClick={() => navigate('/facturas')}
                            className="text-text-secondary font-black text-[10px] uppercase tracking-[0.2em] hover:text-danger hover:opacity-100 transition-all opacity-40 py-4 px-8"
                        >
                            Abortar Proceso
                        </button>
                        <button
                            disabled={isSubmitting || items.length === 0 || !selectedPaciente || !isValid}
                            onClick={handleSubmit}
                            className={`w-full sm:w-auto px-16 py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.2em] relative group ${isSubmitting
                                ? 'bg-surface-raised text-text-secondary/40 cursor-wait'
                                : (items.length === 0 || !selectedPaciente || !isValid)
                                    ? 'bg-surface-raised text-text-secondary/20 cursor-not-allowed border border-border'
                                    : 'bg-primary text-white shadow-2xl shadow-primary/30 hover:bg-primary-dark hover:-translate-y-1 active:translate-y-0'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    Protocolizando...
                                </>
                            ) : (
                                <>
                                    <span>Certificar Emisión</span>
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
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
