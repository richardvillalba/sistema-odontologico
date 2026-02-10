-- ============================================================================
-- ENDPOINTS FALTANTES DE ORDS - MÓDULO FACTURACIÓN
-- ============================================================================
-- Este script agrega los endpoints que faltan en 03_install_ords_billing.sql
-- ============================================================================

-- ============================================================================
-- ENDPOINT: GET /usuarios/:id/puntos
-- Obtener puntos de expedición asignados a un usuario
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'usuarios/:id/puntos'
    );
    COMMIT;
END;
/

BEGIN
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
END;
/

-- ============================================================================
-- ENDPOINT: PUT /factura/:id/anular
-- Anular una factura
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/anular'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/anular',
        p_method      => 'PUT',
        p_source_type => 'plsql/block',
        p_source      => q'[
DECLARE
    v_body CLOB;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    PKG_FACTURAS.anular_factura(
        p_factura_id  => :id,
        p_motivo      => APEX_JSON.get_varchar2('motivo'),
        p_anulado_por => NVL(APEX_JSON.get_number('anulado_por'), 1),
        p_resultado   => v_resultado,
        p_mensaje     => v_mensaje
    );

    IF v_resultado = 1 THEN
        :status := 200;
        APEX_JSON.open_object;
        APEX_JSON.write('mensaje', v_mensaje);
        APEX_JSON.write('resultado', v_resultado);
        APEX_JSON.close_object;
    ELSE
        :status := 400;
        APEX_JSON.open_object;
        APEX_JSON.write('mensaje', v_mensaje);
        APEX_JSON.write('resultado', v_resultado);
        APEX_JSON.close_object;
    END IF;
END;]'
    );
    COMMIT;
END;
/

-- ============================================================================
-- ENDPOINT: PUT /factura/:id/calcular
-- Calcular totales de una factura
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/calcular'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/calcular',
        p_method      => 'PUT',
        p_source_type => 'plsql/block',
        p_source      => q'[
DECLARE
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    PKG_FACTURAS.calcular_totales_factura(
        p_factura_id => :id,
        p_resultado  => v_resultado,
        p_mensaje    => v_mensaje
    );

    IF v_resultado = 1 THEN
        :status := 200;
        APEX_JSON.open_object;
        APEX_JSON.write('mensaje', v_mensaje);
        APEX_JSON.write('resultado', v_resultado);
        APEX_JSON.close_object;
    ELSE
        :status := 400;
        APEX_JSON.open_object;
        APEX_JSON.write('mensaje', v_mensaje);
        APEX_JSON.write('resultado', v_resultado);
        APEX_JSON.close_object;
    END IF;
END;]'
    );
    COMMIT;
END;
/

-- ============================================================================
-- ENDPOINT: POST /usuarios/:id/puntos
-- Asignar punto de expedición a un usuario
-- ============================================================================
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'usuarios/:id/puntos',
        p_method      => 'POST',
        p_source_type => 'plsql/block',
        p_source      => q'[
DECLARE
    v_body CLOB;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    PKG_FACTURAS.asignar_punto_usuario(
        p_usuario_id   => :id,
        p_timbrado_id  => APEX_JSON.get_number('timbrado_id'),
        p_asignado_por => NVL(APEX_JSON.get_number('asignado_por'), 1),
        p_resultado    => v_resultado,
        p_mensaje      => v_mensaje
    );

    IF v_resultado = 1 THEN
        :status := 200;
        APEX_JSON.open_object;
        APEX_JSON.write('mensaje', v_mensaje);
        APEX_JSON.write('resultado', v_resultado);
        APEX_JSON.close_object;
    ELSE
        :status := 400;
        APEX_JSON.open_object;
        APEX_JSON.write('mensaje', v_mensaje);
        APEX_JSON.write('resultado', v_resultado);
        APEX_JSON.close_object;
    END IF;
END;]'
    );
    COMMIT;
END;
/

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================
SELECT
    uri_template AS endpoint,
    method,
    source_type
FROM user_ords_handlers
WHERE module_name = 'facturas'
ORDER BY uri_template, method;

PROMPT ============================================================================
PROMPT Endpoints faltantes agregados correctamente
PROMPT ============================================================================
PROMPT Endpoints agregados:
PROMPT   GET  /usuarios/:id/puntos
PROMPT   POST /usuarios/:id/puntos
PROMPT   PUT  /factura/:id/anular
PROMPT   PUT  /factura/:id/calcular
PROMPT ============================================================================
