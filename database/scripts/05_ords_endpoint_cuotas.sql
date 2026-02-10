-- ============================================================================
-- AGREGAR ENDPOINT FALTANTE: GET /factura/:id/cuotas
-- ============================================================================

-- Crear template para cuotas
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/cuotas'
    );
    COMMIT;
END;
/

-- Definir handler GET para obtener cuotas de una factura
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/cuotas',
        p_method      => 'GET',
        p_source_type => 'json/query',
        p_source      => 'SELECT
                c.CUOTA_ID,
                c.FACTURA_ID,
                c.NUMERO_CUOTA,
                c.MONTO_CUOTA,
                c.FECHA_VENCIMIENTO,
                c.FECHA_PAGO,
                c.MONTO_PAGADO,
                c.ESTADO,
                c.OBSERVACIONES,
                c.FECHA_REGISTRO,
                c.REGISTRADO_POR
            FROM ODO_CUOTAS_FACTURA c
            WHERE c.FACTURA_ID = :id
            ORDER BY c.NUMERO_CUOTA'
    );
    COMMIT;
END;
/

-- Verificación
SELECT
    uri_template AS endpoint,
    method,
    source_type
FROM user_ords_handlers
WHERE module_name = 'facturas'
  AND uri_template LIKE '%cuota%'
ORDER BY uri_template, method;

PROMPT ============================================================================
PROMPT Endpoint agregado exitosamente
PROMPT GET /facturas/factura/:id/cuotas
PROMPT ============================================================================
