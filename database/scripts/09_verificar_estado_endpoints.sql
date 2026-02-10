-- ============================================================================
-- VERIFICAR ESTADO ACTUAL DE ENDPOINTS ORDS
-- ============================================================================

PROMPT ====================================
PROMPT 1. Módulo facturas existe?
PROMPT ====================================
SELECT
    name AS module_name,
    uri_prefix AS base_path,
    status
FROM user_ords_modules
WHERE name = 'facturas';

PROMPT
PROMPT ====================================
PROMPT 2. TODOS los endpoints definidos
PROMPT ====================================
SELECT
    uri_template AS endpoint,
    method,
    source_type,
    CASE
        WHEN uri_template = 'lista' AND method = 'GET' THEN 'CRÍTICO - Lista facturas'
        WHEN uri_template = 'factura/:id' AND method = 'GET' THEN 'CRÍTICO - Detalle factura'
        WHEN uri_template = 'factura/:id/cuotas' AND method = 'GET' THEN 'IMPORTANTE - Cuotas'
        WHEN uri_template = 'usuarios/:id/puntos' AND method = 'GET' THEN 'CRÍTICO - Puntos usuario'
        WHEN uri_template = 'timbrados/alertas' AND method = 'GET' THEN 'NORMAL - Alertas'
        ELSE 'NORMAL'
    END AS importancia
FROM user_ords_handlers
WHERE module_name = 'facturas'
ORDER BY
    CASE
        WHEN uri_template = 'usuarios/:id/puntos' THEN 1
        WHEN uri_template = 'lista' THEN 2
        WHEN uri_template = 'factura/:id' THEN 3
        ELSE 4
    END,
    uri_template,
    method;

PROMPT
PROMPT ====================================
PROMPT 3. Verificar endpoints CRÍTICOS
PROMPT ====================================
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM user_ords_handlers
            WHERE module_name = 'facturas'
            AND uri_template = 'usuarios/:id/puntos'
            AND method = 'GET'
        ) THEN '✓ OK'
        ELSE '✗ FALTA'
    END AS "GET /usuarios/:id/puntos",

    CASE
        WHEN EXISTS (
            SELECT 1 FROM user_ords_handlers
            WHERE module_name = 'facturas'
            AND uri_template = 'lista'
            AND method = 'GET'
        ) THEN '✓ OK'
        ELSE '✗ FALTA'
    END AS "GET /lista",

    CASE
        WHEN EXISTS (
            SELECT 1 FROM user_ords_handlers
            WHERE module_name = 'facturas'
            AND uri_template = 'factura/:id'
            AND method = 'GET'
        ) THEN '✓ OK'
        ELSE '✗ FALTA'
    END AS "GET /factura/:id",

    CASE
        WHEN EXISTS (
            SELECT 1 FROM user_ords_handlers
            WHERE module_name = 'facturas'
            AND uri_template = 'factura/:id/cuotas'
            AND method = 'GET'
        ) THEN '✓ OK'
        ELSE '✗ FALTA'
    END AS "GET /factura/:id/cuotas",

    CASE
        WHEN EXISTS (
            SELECT 1 FROM user_ords_handlers
            WHERE module_name = 'facturas'
            AND uri_template = 'factura/:id/detalles'
            AND method = 'GET'
        ) THEN '✓ OK'
        ELSE '✗ FALTA'
    END AS "GET /factura/:id/detalles"
FROM DUAL;

PROMPT
PROMPT ====================================
PROMPT 4. Total de endpoints por tipo
PROMPT ====================================
SELECT
    method,
    COUNT(*) AS cantidad
FROM user_ords_handlers
WHERE module_name = 'facturas'
GROUP BY method
ORDER BY method;

PROMPT
PROMPT ====================================
PROMPT FIN DE VERIFICACIÓN
PROMPT ====================================
