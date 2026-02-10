-- ============================================================================
-- HABILITAR POST TIMBRADOS - MÓDULO FACTURACIÓN
-- ============================================================================

BEGIN
    -- Asegurar que el template existe
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'timbrados'
    );

    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'timbrados',
        p_method      => 'POST',
        p_source_type => 'plsql/block',
        p_source      => q'[
DECLARE
    v_body CLOB;
    v_timbrado_id NUMBER;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
    
    PKG_FACTURAS.crear_timbrado(
        p_empresa_id        => APEX_JSON.get_number('empresa_id'),
        p_numero_timbrado   => APEX_JSON.get_varchar2('numero_timbrado'),
        p_establecimiento   => APEX_JSON.get_varchar2('establecimiento'),
        p_punto_expedicion  => APEX_JSON.get_varchar2('punto_expedicion'),
        p_tipo_documento    => APEX_JSON.get_varchar2('tipo_documento'),
        p_numero_inicio     => APEX_JSON.get_number('numero_inicio'),
        p_numero_fin        => APEX_JSON.get_number('numero_fin'),
        p_fecha_inicio      => TO_DATE(APEX_JSON.get_varchar2('fecha_inicio'), 'YYYY-MM-DD'),
        p_fecha_vencimiento => TO_DATE(APEX_JSON.get_varchar2('fecha_vencimiento'), 'YYYY-MM-DD'),
        p_creado_por        => APEX_JSON.get_number('creado_por'),
        p_timbrado_id       => v_timbrado_id,
        p_resultado         => v_resultado,
        p_mensaje           => v_mensaje
    );
    
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('timbrado_id', v_timbrado_id);
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

-- VERIFICACIÓN (Omitida por diferencias de versión en vistas de metadatos ORDS)
-- La ejecución exitosa del bloque PL/SQL anterior confirma la creación del endpoint.

PROMPT ============================================================================
PROMPT Endpoint POST /facturas/timbrados habilitado
PROMPT ============================================================================
