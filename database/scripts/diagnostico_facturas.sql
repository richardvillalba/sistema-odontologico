-- =============================================================================
-- DIAGNÓSTICO: Verificar por qué no aparecen facturas
-- =============================================================================

PROMPT ====================================
PROMPT 1. Verificar si existen facturas
PROMPT ====================================
SELECT COUNT(*) AS TOTAL_FACTURAS FROM ODO_FACTURAS;

PROMPT
PROMPT ====================================
PROMPT 2. Facturas por empresa
PROMPT ====================================
SELECT
    EMPRESA_ID,
    COUNT(*) AS CANTIDAD_FACTURAS,
    COUNT(CASE WHEN ESTADO = 'CONFIRMADA' THEN 1 END) AS CONFIRMADAS,
    COUNT(CASE WHEN ESTADO = 'ANULADA' THEN 1 END) AS ANULADAS,
    COUNT(CASE WHEN ESTADO = 'BORRADOR' THEN 1 END) AS BORRADORES
FROM ODO_FACTURAS
GROUP BY EMPRESA_ID
ORDER BY EMPRESA_ID;

PROMPT
PROMPT ====================================
PROMPT 3. Verificar empresas existentes
PROMPT ====================================
SELECT EMPRESA_ID, RAZON_SOCIAL, ACTIVO FROM ODO_EMPRESAS;

PROMPT
PROMPT ====================================
PROMPT 4. Últimas 10 facturas (cualquier empresa)
PROMPT ====================================
SELECT
    f.FACTURA_ID,
    f.EMPRESA_ID,
    f.NUMERO_FACTURA_COMPLETO,
    f.FECHA_EMISION,
    f.ESTADO,
    f.TOTAL,
    f.SALDO_PENDIENTE,
    p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE
FROM ODO_FACTURAS f
LEFT JOIN ODO_PACIENTES p ON f.PACIENTE_ID = p.PACIENTE_ID
ORDER BY f.FECHA_EMISION DESC
FETCH FIRST 10 ROWS ONLY;

PROMPT
PROMPT ====================================
PROMPT 5. Probar query del endpoint /facturas/lista para empresa_id=1
PROMPT ====================================
SELECT
    f.FACTURA_ID,
    f.NUMERO_FACTURA_COMPLETO,
    f.FECHA_EMISION,
    f.TOTAL,
    f.SALDO_PENDIENTE,
    f.ESTADO,
    p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE
FROM ODO_FACTURAS f
LEFT JOIN ODO_PACIENTES p ON f.PACIENTE_ID = p.PACIENTE_ID
WHERE f.EMPRESA_ID = 1
ORDER BY f.FECHA_EMISION DESC
FETCH FIRST 50 ROWS ONLY;

PROMPT
PROMPT ====================================
PROMPT 6. Verificar estructura del endpoint ORDS
PROMPT ====================================
SELECT
    uri_template AS endpoint,
    method,
    source_type,
    SUBSTR(source, 1, 100) || '...' AS query_inicio
FROM user_ords_handlers
WHERE module_name = 'facturas'
  AND uri_template = 'lista';

PROMPT
PROMPT ====================================
PROMPT FIN DEL DIAGNÓSTICO
PROMPT ====================================
