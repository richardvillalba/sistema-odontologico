-- ============================================================================
-- INSTALACIÓN MANUAL DE ENDPOINTS ORDS - MÓDULO FACTURACIÓN
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Abrir este archivo en SQL Developer o similar
-- 2. Ejecutar todo el script (Run Script / F5)
-- 3. Verificar que no haya errores
-- ============================================================================

-- Limpiar módulo anterior si existe
BEGIN
    ORDS.DELETE_MODULE(p_module_name => 'facturas');
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- Crear módulo base
BEGIN
    ORDS.DEFINE_MODULE(
        p_module_name => 'facturas',
        p_base_path   => '/facturas/'
    );
    COMMIT;
END;
/

-- ============================================================================
-- ENDPOINT: GET /timbrados
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'timbrados'
    );
    COMMIT;
END;
/

BEGIN
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

-- ============================================================================
-- ENDPOINT: GET /timbrados/alertas
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'timbrados/alertas'
    );
    COMMIT;
END;
/

BEGIN
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

-- ============================================================================
-- ENDPOINT: GET /factura/:id  
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id',
        p_method      => 'GET',
        p_source_type => 'json/query',
        p_source      => 'SELECT 
                f.*,
                p.NOMBRE || '' '' || p.APELLIDO AS PACIENTE_NOMBRE_COMPLETO,
                (SELECT COUNT(*) FROM ODO_DETALLES_FACTURA WHERE FACTURA_ID = f.FACTURA_ID) AS CANTIDAD_ITEMS,
                (SELECT COUNT(*) FROM ODO_PAGOS WHERE FACTURA_ID = f.FACTURA_ID) AS CANTIDAD_PAGOS
            FROM ODO_FACTURAS f
            LEFT JOIN ODO_PACIENTES p ON f.PACIENTE_ID = p.PACIENTE_ID
            WHERE f.FACTURA_ID = :id'
    );
    COMMIT;
END;
/

-- ============================================================================
-- ENDPOINT: GET /facturas
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'lista'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'lista',
        p_method      => 'GET',
        p_source_type => 'json/query',
        p_source      => 'SELECT 
                f.FACTURA_ID, 
                f.NUMERO_FACTURA_COMPLETO,
                f.FECHA_EMISION,
                f.TOTAL,
                f.SALDO_PENDIENTE,
                f.ESTADO,
                p.NOMBRE || '' '' || p.APELLIDO AS PACIENTE_NOMBRE
            FROM ODO_FACTURAS f
            LEFT JOIN ODO_PACIENTES p ON f.PACIENTE_ID = p.PACIENTE_ID
            WHERE f.EMPRESA_ID = :empresa_id
              AND (:estado IS NULL OR f.ESTADO = :estado)
              AND (:fecha_desde IS NULL OR TRUNC(f.FECHA_EMISION) >= TO_DATE(:fecha_desde, ''YYYY-MM-DD''))
              AND (:fecha_hasta IS NULL OR TRUNC(f.FECHA_EMISION) <= TO_DATE(:fecha_hasta, ''YYYY-MM-DD''))
            ORDER BY f.FECHA_EMISION DESC
            FETCH FIRST 50 ROWS ONLY'
    );
    COMMIT;
END;
/

-- ============================================================================
-- ENDPOINT: GET /factura/:id/detalles
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/detalles'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/detalles',
        p_method      => 'GET',
        p_source_type => 'json/query',
        p_source      => 'SELECT * FROM ODO_DETALLES_FACTURA WHERE FACTURA_ID = :id ORDER BY DETALLE_ID'
    );
    COMMIT;
END;
/

-- ============================================================================
-- ENDPOINT: GET /factura/:id/pagos
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/pagos'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/pagos',
        p_method      => 'GET',
        p_source_type => 'json/query',
        p_source      => 'SELECT 
                pg.*,
                u.NOMBRE || '' '' || u.APELLIDO AS REGISTRADO_POR_NOMBRE
            FROM ODO_PAGOS pg
            LEFT JOIN ODO_USUARIOS u ON pg.REGISTRADO_POR = u.USUARIO_ID
            WHERE pg.FACTURA_ID = :id
            ORDER BY pg.FECHA_PAGO DESC'
    );
    COMMIT;
END;
/

-- ============================================================================
-- ENDPOINT: GET /paciente/:id/facturas
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'paciente/:id/facturas'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'paciente/:id/facturas',
        p_method      => 'GET',
        p_source_type => 'json/query',
        p_source      => 'SELECT 
                f.FACTURA_ID, f.NUMERO_FACTURA_COMPLETO,
                f.FECHA_EMISION, f.TOTAL, f.SALDO_PENDIENTE, f.ESTADO
            FROM ODO_FACTURAS f
            WHERE f.PACIENTE_ID = :id
            ORDER BY f.FECHA_EMISION DESC'
    );
    COMMIT;
END;
/

-- ============================================================================
-- ENDPOINT: GET /paciente/:id/cuenta-corriente
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'paciente/:id/cuenta-corriente'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'paciente/:id/cuenta-corriente',
        p_method      => 'GET',
        p_source_type => 'json/query',
        p_source      => 'SELECT 
                f.FACTURA_ID,
                f.NUMERO_FACTURA_COMPLETO,
                f.FECHA_EMISION,
                f.TOTAL,
                f.SALDO_PENDIENTE,
                f.ESTADO,
                (SELECT COUNT(*) FROM ODO_PAGOS WHERE FACTURA_ID = f.FACTURA_ID) AS CANTIDAD_PAGOS
            FROM ODO_FACTURAS f
            WHERE f.PACIENTE_ID = :id
              AND f.ESTADO IN (''PENDIENTE'', ''PARCIAL'', ''VENCIDA'')
            ORDER BY f.FECHA_EMISION DESC'
    );
    COMMIT;
END;
/

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================
SELECT 
    name AS module_name,
    uri_prefix AS base_path,
    status
FROM user_ords_modules 
WHERE name = 'facturas';

SELECT 
    uri_template AS endpoint,
    method,
    source_type
FROM user_ords_handlers 
WHERE module_name = 'facturas'
ORDER BY uri_template, method;

PROMPT ============================================================================
PROMPT Instalación completada
PROMPT ============================================================================
PROMPT Verificá arriba que aparezcan los endpoints (debe haber 9 GET endpoints)
PROMPT Si todo está OK, los endpoints estarán disponibles en:
PROMPT https://TU_ORDS_URL/ords/facturas/...
PROMPT ============================================================================
