-- ========================================
-- REINSTALACIÓN COMPLETA - MÓDULO DE FACTURACIÓN (COMPATIBLE)
-- ========================================

-- 1. LIMPIAR MÓDULO EXISTENTE
BEGIN
    ORDS.DELETE_MODULE(p_module_name => 'facturas');
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- 2. CREAR MÓDULO BASE
BEGIN
    ORDS.DEFINE_MODULE(
        p_module_name => 'facturas',
        p_base_path   => '/facturas/'
    );
    COMMIT;
END;
/

-- ========================================
-- TIMBRADOS
-- ========================================

-- GET /timbrados
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'timbrados'
    );
    
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'timbrados',
        p_method      => 'GET',
        p_source_type => 'json/query',
        p_source      => 'SELECT * FROM (
            SELECT 
                t.TIMBRADO_ID, t.EMPRESA_ID, t.NUMERO_TIMBRADO,
                t.ESTABLECIMIENTO, t.PUNTO_EXPEDICION, t.TIPO_DOCUMENTO,
                t.NUMERO_INICIO, t.NUMERO_FIN, t.NUMERO_ACTUAL,
                (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) AS NUMEROS_DISPONIBLES,
                t.FECHA_INICIO, t.FECHA_VENCIMIENTO,
                TRUNC(t.FECHA_VENCIMIENTO - SYSDATE) AS DIAS_PARA_VENCER,
                t.ACTIVO, t.FECHA_REGISTRO
            FROM ODO_TIMBRADOS t
            WHERE t.EMPRESA_ID = :empresa_id
              AND (:activo IS NULL OR t.ACTIVO = :activo)
            ORDER BY t.FECHA_REGISTRO DESC
        )'
    );
    COMMIT;
END;
/

-- POST /timbrados
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'timbrados',
        p_method      => 'POST',
        p_source_type => 'plsql/block',
        p_source      => '
DECLARE
    v_body CLOB;
    v_timbrado_id NUMBER;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
    
    PKG_FACTURAS.crear_timbrado(
        p_empresa_id        => APEX_JSON.get_number(''empresa_id''),
        p_numero_timbrado   => APEX_JSON.get_varchar2(''numero_timbrado''),
        p_establecimiento   => APEX_JSON.get_varchar2(''establecimiento''),
        p_punto_expedicion  => APEX_JSON.get_varchar2(''punto_expedicion''),
        p_tipo_documento    => APEX_JSON.get_varchar2(''tipo_documento''),
        p_numero_inicio     => APEX_JSON.get_number(''numero_inicio''),
        p_numero_fin        => APEX_JSON.get_number(''numero_fin''),
        p_fecha_inicio      => TO_DATE(APEX_JSON.get_varchar2(''fecha_inicio''), ''YYYY-MM-DD''),
        p_fecha_vencimiento => TO_DATE(APEX_JSON.get_varchar2(''fecha_vencimiento''), ''YYYY-MM-DD''),
        p_creado_por        => APEX_JSON.get_number(''creado_por''),
        p_timbrado_id       => v_timbrado_id,
        p_resultado         => v_resultado,
        p_mensaje           => v_mensaje
    );
    
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''resultado'', v_resultado);
    APEX_JSON.write(''mensaje'', v_mensaje);
    APEX_JSON.write(''timbrado_id'', v_timbrado_id);
    APEX_JSON.close_object;
    
    :status := CASE WHEN v_resultado = 1 THEN 201 ELSE 400 END;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        '
    );
    COMMIT;
END;
/

-- GET /timbrados/alertas
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'timbrados/alertas'
    );
    
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'timbrados/alertas',
        p_method      => 'GET',
        p_source_type => 'json/query',
        p_source      => 'SELECT 
                t.TIMBRADO_ID, t.NUMERO_TIMBRADO,
                t.ESTABLECIMIENTO, t.PUNTO_EXPEDICION,
                (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) AS NUMEROS_DISPONIBLES,
                TRUNC(t.FECHA_VENCIMIENTO - SYSDATE) AS DIAS_PARA_VENCER,
                CASE 
                    WHEN t.FECHA_VENCIMIENTO <= SYSDATE THEN ''VENCIDO''
                    WHEN (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) <= 0 THEN ''AGOTADO''
                    WHEN (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) <= :margen_numeros THEN ''POR_AGOTARSE''
                    WHEN TRUNC(t.FECHA_VENCIMIENTO - SYSDATE) <= :dias_alerta THEN ''POR_VENCER''
                    ELSE ''OK''
                END AS TIPO_ALERTA
            FROM ODO_TIMBRADOS t
            WHERE t.EMPRESA_ID = :empresa_id AND t.ACTIVO = ''S''
              AND (t.FECHA_VENCIMIENTO <= SYSDATE + :dias_alerta
                   OR (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) <= :margen_numeros)
            ORDER BY 
                CASE 
                    WHEN t.FECHA_VENCIMIENTO <= SYSDATE THEN 1
                    WHEN (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) <= 0 THEN 2
                    WHEN (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) <= :margen_numeros THEN 3
                    ELSE 4
                END'
    );
    COMMIT;
END;
/
