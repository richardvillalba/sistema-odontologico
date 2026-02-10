-- ============================================================================
-- SCRIPT COMPLETO: Todos los endpoints necesarios para Facturación
-- ============================================================================
-- Este script recrea TODOS los endpoints necesarios desde cero
-- ============================================================================

-- 1. Limpiar módulo anterior
BEGIN
    ORDS.DELETE_MODULE(p_module_name => 'facturas');
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
/

-- 2. Crear módulo base
BEGIN
    ORDS.DEFINE_MODULE(
        p_module_name => 'facturas',
        p_base_path   => '/facturas/'
    );
    COMMIT;
END;
/

-- ============================================================================
-- ENDPOINT: GET /lista (Lista de facturas)
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'lista'
    );
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
-- ENDPOINT: GET /factura/:id (Obtener una factura específica)
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id'
    );
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
-- ENDPOINT: GET /factura/:id/detalles (Detalles de la factura)
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/detalles'
    );
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
-- ENDPOINT: GET /factura/:id/pagos (Pagos de la factura)
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/pagos'
    );
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
-- ENDPOINT: GET /factura/:id/cuotas (Cuotas de la factura)
-- ============================================================================
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
END;
/

-- ============================================================================
-- ENDPOINT: PUT /factura/:id/anular (Anular factura)
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/anular'
    );
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/anular',
        p_method      => 'PUT',
        p_source_type => 'plsql/block',
        p_source      => 'DECLARE
                v_resultado NUMBER;
                v_mensaje VARCHAR2(500);
            BEGIN
                PKG_FACTURAS.anular_factura(
                    p_factura_id => :id,
                    p_motivo => :motivo,
                    p_anulado_por => :anulado_por,
                    p_resultado => v_resultado,
                    p_mensaje => v_mensaje
                );

                IF v_resultado = 1 THEN
                    :status := 200;
                    :message := v_mensaje;
                ELSE
                    :status := 400;
                    :message := v_mensaje;
                END IF;
            END;'
    );
    COMMIT;
END;
/

-- ============================================================================
-- ENDPOINT: PUT /factura/:id/calcular (Calcular/Confirmar factura)
-- ============================================================================
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/calcular'
    );
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/calcular',
        p_method      => 'PUT',
        p_source_type => 'plsql/block',
        p_source      => 'DECLARE
                v_resultado NUMBER;
                v_mensaje VARCHAR2(500);
            BEGIN
                PKG_FACTURAS.calcular_totales_factura(
                    p_factura_id => :id,
                    p_resultado => v_resultado,
                    p_mensaje => v_mensaje
                );

                IF v_resultado = 1 THEN
                    :status := 200;
                    :message := v_mensaje;
                ELSE
                    :status := 400;
                    :message := v_mensaje;
                END IF;
            END;'
    );
    COMMIT;
END;
/

-- ============================================================================
-- ENDPOINTS: Timbrados
-- ============================================================================
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
        p_source      => 'SELECT
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
            ORDER BY t.FECHA_REGISTRO DESC'
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
-- ENDPOINTS: Usuarios y Puntos de Expedición
-- ============================================================================
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
END;
/

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================
PROMPT
PROMPT ============================================================================
PROMPT Verificando endpoints creados...
PROMPT ============================================================================

SELECT
    uri_template AS endpoint,
    method,
    source_type
FROM user_ords_handlers
WHERE module_name = 'facturas'
ORDER BY uri_template, method;

PROMPT
PROMPT ============================================================================
PROMPT ¡Instalación completada!
PROMPT ============================================================================
PROMPT Endpoints disponibles:
PROMPT   GET  /facturas/lista
PROMPT   GET  /facturas/factura/:id
PROMPT   GET  /facturas/factura/:id/detalles
PROMPT   GET  /facturas/factura/:id/pagos
PROMPT   GET  /facturas/factura/:id/cuotas
PROMPT   PUT  /facturas/factura/:id/anular
PROMPT   PUT  /facturas/factura/:id/calcular
PROMPT   GET  /facturas/timbrados
PROMPT   GET  /facturas/timbrados/alertas
PROMPT   GET  /facturas/usuarios/:id/puntos
PROMPT ============================================================================
