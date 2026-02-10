-- =============================================================================
-- FIX: Permitir anulación de facturas con pagos
-- =============================================================================
-- Este script modifica el procedimiento anular_factura del PKG_FACTURAS
-- para permitir anular facturas que tienen pagos registrados.
--
-- Cambios:
-- 1. Elimina la validación que impedía anular facturas con pagos
-- 2. Elimina los pagos asociados a la factura
-- 3. Restablece las cuotas a estado PENDIENTE
-- 4. Libera los tratamientos marcados como facturados (FACTURADO='N')
-- =============================================================================

-- Recompilar el package body completo
@@PKG_FACTURAS_BODY.sql

-- Verificar que no haya errores
SELECT object_name, object_type, status
FROM user_objects
WHERE object_name = 'PKG_FACTURAS'
AND object_type = 'PACKAGE BODY';

-- Si hay errores, mostrarlos
SHOW ERRORS PACKAGE BODY PKG_FACTURAS;

PROMPT '========================================';
PROMPT 'Procedimiento anular_factura actualizado';
PROMPT 'Ahora permite anular facturas con pagos';
PROMPT '========================================';
