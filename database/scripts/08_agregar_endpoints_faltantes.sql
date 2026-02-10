-- ============================================================================
-- AGREGAR ENDPOINTS FALTANTES SIN BORRAR NADA
-- ============================================================================
-- Este script SOLO agrega endpoints que faltan
-- NO borra el módulo ni los endpoints existentes
-- ============================================================================

-- Endpoint: GET /factura/:id/cuotas (si no existe)
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/cuotas'
    );
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
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Endpoint cuotas ya existe o error: ' || SQLERRM);
END;
/

-- Endpoint: GET /usuarios/:id/puntos (CRÍTICO)
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'usuarios/:id/puntos'
    );
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'usuarios/:id/puntos',
        p_method      => 'GET',
        p_source_type => 'json/query',
        p_source      => 'SELECT
                up.USUARIO_PUNTO_ID, up.USUARIO_ID, up.TIMBRADO_ID,
                t.NUMERO_TIMBRADO, t.ESTABLECIMIENTO, t.PUNTO_EXPEDICION,
                t.NUMERO_ACTUAL, t.NUMERO_FIN,
                (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) AS NUMEROS_DISPONIBLES,
                t.FECHA_VENCIMIENTO,
                up.ACTIVO, up.FECHA_ASIGNACION
            FROM ODO_USUARIO_PUNTOS_EXPEDICION up
            JOIN ODO_TIMBRADOS t ON up.TIMBRADO_ID = t.TIMBRADO_ID
            WHERE up.USUARIO_ID = :id AND up.ACTIVO = ''S'' AND t.ACTIVO = ''S'''
    );
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Endpoint puntos ya existe o error: ' || SQLERRM);
END;
/

-- Verificación
PROMPT
PROMPT ============================================================================
PROMPT Verificando endpoints...
PROMPT ============================================================================

SELECT
    uri_template AS endpoint,
    method,
    source_type
FROM user_ords_handlers
WHERE module_name = 'facturas'
  AND (uri_template LIKE '%cuotas%' OR uri_template LIKE '%puntos%')
ORDER BY uri_template, method;

PROMPT
PROMPT ============================================================================
PROMPT Endpoints agregados (si faltaban)
PROMPT ============================================================================
