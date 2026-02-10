import React from 'react';

const FacturaPrint = ({ factura, detalles, empresa }) => {
    const fmtNum = (n) => new Intl.NumberFormat('es-PY').format(n || 0);
    const fmtFecha = (f) => f ? new Date(f).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

    const iva5 = Math.round((factura.total || 0) / 21);
    const iva10 = Math.round((factura.total || 0) / 11);
    const exenta = 0; // Por ahora no se maneja exenta

    return (
        <div id="print-area" className="print-area bg-white" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#000', width: '100%', maxWidth: '800px', margin: '0 auto' }}>

            {/* ===== ENCABEZADO ===== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '12px', marginBottom: '12px' }}>
                {/* Logo e info de la empresa */}
                <div style={{ flex: 1 }}>
                    {empresa?.logo_url && (
                        <img src={empresa.logo_url} alt="Logo" style={{ maxHeight: '60px', maxWidth: '200px', objectFit: 'contain', marginBottom: '6px' }} />
                    )}
                    <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 2px 0' }}>
                        {empresa?.nombre_comercial || empresa?.razon_social || 'Clínica Odontológica'}
                    </p>
                    {empresa?.slogan && (
                        <p style={{ fontSize: '10px', fontStyle: 'italic', margin: '0 0 4px 0', color: '#555' }}>
                            {empresa.slogan}
                        </p>
                    )}
                    {empresa?.razon_social && empresa?.nombre_comercial && (
                        <p style={{ fontSize: '10px', margin: '0 0 2px 0' }}>{empresa.razon_social}</p>
                    )}
                    {empresa?.ruc && (
                        <p style={{ fontSize: '10px', margin: '0 0 2px 0' }}><strong>RUC:</strong> {empresa.ruc}</p>
                    )}
                    {empresa?.direccion && (
                        <p style={{ fontSize: '10px', margin: '0 0 2px 0' }}>{empresa.direccion}</p>
                    )}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {empresa?.telefono && (
                            <p style={{ fontSize: '10px', margin: '0' }}>Tel: {empresa.telefono}</p>
                        )}
                        {empresa?.email && (
                            <p style={{ fontSize: '10px', margin: '0' }}>{empresa.email}</p>
                        )}
                    </div>
                </div>

                {/* Datos del comprobante */}
                <div style={{ textAlign: 'right', minWidth: '200px' }}>
                    <div style={{ border: '2px solid #000', padding: '8px', display: 'inline-block', minWidth: '190px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 4px 0', textAlign: 'center' }}>FACTURA</p>
                        <p style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace', margin: '0 0 6px 0', textAlign: 'center' }}>
                            {factura.numero_factura_completo || '-'}
                        </p>
                        <div style={{ borderTop: '1px solid #ccc', paddingTop: '4px', fontSize: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Timbrado Nº:</span>
                                <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{factura.numero_timbrado || '-'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Punto de Exp.:</span>
                                <span style={{ fontWeight: 'bold' }}>{factura.establecimiento}-{factura.punto_expedicion}</span>
                            </div>
                        </div>
                    </div>
                    <p style={{ fontSize: '10px', margin: '6px 0 2px 0' }}>
                        <strong>Fecha de emisión:</strong> {fmtFecha(factura.fecha_emision)}
                    </p>
                    <p style={{ fontSize: '10px', margin: '0' }}>
                        <strong>Condición:</strong>{' '}
                        <span style={{ border: '1px solid #000', padding: '1px 6px', fontWeight: 'bold' }}>
                            {factura.condicion_operacion || '-'}
                        </span>
                    </p>
                    {factura.condicion_operacion === 'CREDITO' && factura.plazo_credito_dias > 0 && (
                        <p style={{ fontSize: '10px', margin: '2px 0 0 0' }}>
                            Plazo: {factura.plazo_credito_dias} días
                        </p>
                    )}
                </div>
            </div>

            {/* ===== DATOS DEL CLIENTE ===== */}
            <div style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '12px', backgroundColor: '#f9f9f9' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div>
                        <span style={{ fontSize: '10px', color: '#666' }}>Señor(a):</span>
                        <p style={{ fontWeight: 'bold', margin: '0', fontSize: '12px' }}>{factura.nombre_cliente || '-'}</p>
                    </div>
                    <div>
                        <span style={{ fontSize: '10px', color: '#666' }}>RUC / C.I.:</span>
                        <p style={{ fontWeight: 'bold', margin: '0', fontSize: '12px' }}>
                            {factura.tipo_documento_cliente && factura.numero_documento_cliente
                                ? `${factura.tipo_documento_cliente}: ${factura.numero_documento_cliente}`
                                : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== TABLA DE ÍTEMS ===== */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '11px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #000' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left', borderRight: '1px solid #ccc' }}>Descripción</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center', borderRight: '1px solid #ccc', width: '60px' }}>Cant.</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right', borderRight: '1px solid #ccc', width: '100px' }}>Precio Unit.</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right', borderRight: '1px solid #ccc', width: '80px' }}>Dcto.</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right', width: '100px' }}>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {(detalles || []).map((det, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #eee' }}>{det.descripcion}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'center', borderRight: '1px solid #eee' }}>{det.cantidad}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', borderRight: '1px solid #eee', fontFamily: 'monospace' }}>{fmtNum(det.precio_unitario)}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', borderRight: '1px solid #eee', fontFamily: 'monospace' }}>{det.descuento > 0 ? fmtNum(det.descuento) : '-'}</td>
                            <td style={{ padding: '5px 8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>{fmtNum(det.subtotal)}</td>
                        </tr>
                    ))}
                    {/* Filas vacías para rellenar hasta mínimo 5 */}
                    {Array.from({ length: Math.max(0, 5 - (detalles?.length || 0)) }).map((_, i) => (
                        <tr key={`empty-${i}`} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #eee' }}>&nbsp;</td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #eee' }}></td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #eee' }}></td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #eee' }}></td>
                            <td style={{ padding: '5px 8px' }}></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ===== TOTALES E IVA ===== */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                {/* Liquidación IVA */}
                <div style={{ border: '1px solid #ccc', padding: '8px', fontSize: '10px', minWidth: '220px' }}>
                    <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', textDecoration: 'underline' }}>Liquidación del IVA</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span>Exenta:</span>
                        <span style={{ fontFamily: 'monospace' }}>{fmtNum(exenta)} Gs</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span>Gravada 5%:</span>
                        <span style={{ fontFamily: 'monospace' }}>0 Gs</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span>IVA 5%:</span>
                        <span style={{ fontFamily: 'monospace' }}>0 Gs</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span>Gravada 10%:</span>
                        <span style={{ fontFamily: 'monospace' }}>{fmtNum(factura.total)} Gs</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ccc', paddingTop: '3px' }}>
                        <span>IVA 10%:</span>
                        <span style={{ fontFamily: 'monospace' }}>{fmtNum(iva10)} Gs</span>
                    </div>
                </div>

                {/* Total */}
                <div style={{ textAlign: 'right' }}>
                    {(factura.descuento || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '4px', color: '#d00' }}>
                            <span style={{ fontSize: '11px' }}>Descuento:</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>- {fmtNum(factura.descuento)} Gs</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center', border: '2px solid #000', padding: '8px 12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>TOTAL:</span>
                        <span style={{ fontSize: '22px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {fmtNum(factura.total)} <span style={{ fontSize: '12px' }}>Gs</span>
                        </span>
                    </div>
                    {factura.saldo_pendiente > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '4px', color: '#d00' }}>
                            <span style={{ fontSize: '10px' }}>Saldo pendiente:</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{fmtNum(factura.saldo_pendiente)} Gs</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== OBSERVACIONES ===== */}
            {factura.observaciones && (
                <div style={{ borderTop: '1px solid #ccc', paddingTop: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', color: '#666' }}>Observaciones: </span>
                    <span style={{ fontSize: '10px' }}>{factura.observaciones}</span>
                </div>
            )}

            {/* ===== ESTADO ===== */}
            {factura.estado === 'ANULADA' && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '80px', fontWeight: 'bold', color: 'rgba(200,0,0,0.15)', pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>
                    ANULADA
                </div>
            )}

            {/* ===== PIE DE PÁGINA ===== */}
            <div style={{ borderTop: '2px solid #000', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '10px', color: '#666' }}>
                    <p style={{ margin: '0' }}>Documento emitido por sistema de gestión odontológica.</p>
                    {empresa?.sitio_web && (
                        <p style={{ margin: '2px 0 0 0' }}>{empresa.sitio_web}</p>
                    )}
                </div>
                <div style={{ textAlign: 'center', fontSize: '10px' }}>
                    <div style={{ borderTop: '1px solid #000', width: '180px', marginBottom: '3px' }}></div>
                    <span>Firma y Sello del Receptor</span>
                </div>
            </div>
        </div>
    );
};

export default FacturaPrint;
