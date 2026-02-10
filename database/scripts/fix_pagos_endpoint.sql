-- Endpoint para registrar pagos
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern => 'factura/:id/pagos'
    );

    -- GET: Obtener pagos de una factura
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern => 'factura/:id/pagos',
        p_method => 'GET',
        p_source_type => 'plsql/block',
        p_source => q'[
DECLARE
    v_cursor SYS_REFCURSOR;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    PKG_FACTURAS.get_pagos_factura(
        p_factura_id => :id,
        p_cursor     => v_cursor,
        p_resultado  => v_resultado,
        p_mensaje    => v_mensaje
    );
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    -- POST: Registrar un pago
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern => 'factura/:id/pagos',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => q'[
DECLARE
    v_body CLOB;
    v_pago_id NUMBER;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
    PKG_FACTURAS.registrar_pago(
        p_factura_id     => :id,
        p_monto          => APEX_JSON.get_number('monto'),
        p_metodo_pago    => APEX_JSON.get_varchar2('metodo_pago'),
        p_referencia     => APEX_JSON.get_varchar2('referencia'),
        p_banco          => APEX_JSON.get_varchar2('banco'),
        p_registrado_por => NVL(APEX_JSON.get_number('registrado_por'), 1),
        p_pago_id        => v_pago_id,
        p_resultado      => v_resultado,
        p_mensaje        => v_mensaje
    );
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('pago_id', v_pago_id);
    APEX_JSON.close_object;
    :status := CASE WHEN v_resultado = 1 THEN 201 ELSE 400 END;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    COMMIT;
END;
/
