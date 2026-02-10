-- Fix para el endpoint POST de detalles de factura
BEGIN
    -- Recrear template (si ya existe, ORDS lo actualiza)
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern => 'factura/:id/detalles'
    );

    -- GET: Obtener detalles de factura
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern => 'factura/:id/detalles',
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
    PKG_FACTURAS.get_factura_detalles(
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

    -- POST: Agregar detalle a factura
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern => 'factura/:id/detalles',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => q'[
DECLARE
    v_body CLOB;
    v_detalle_id NUMBER;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
    PKG_FACTURAS.agregar_detalle_factura(
        p_factura_id            => :id,
        p_tratamiento_paciente_id => APEX_JSON.get_number('tratamiento_paciente_id'),
        p_descripcion           => APEX_JSON.get_varchar2('descripcion'),
        p_cantidad              => APEX_JSON.get_number('cantidad'),
        p_precio_unitario       => APEX_JSON.get_number('precio_unitario'),
        p_descuento             => NVL(APEX_JSON.get_number('descuento'), 0),
        p_detalle_id            => v_detalle_id,
        p_resultado             => v_resultado,
        p_mensaje               => v_mensaje
    );
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('detalle_id', v_detalle_id);
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
