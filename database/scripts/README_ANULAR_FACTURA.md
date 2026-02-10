# Anulación de Facturas con Pagos

## Descripción

Se modificó el procedimiento `PKG_FACTURAS.anular_factura` para permitir la anulación de facturas que tienen pagos registrados.

## Cambios Realizados

### Antes
- ❌ No permitía anular facturas con pagos registrados
- ❌ Retornaba error: "No se puede anular una factura con pagos registrados"

### Ahora
- ✅ Permite anular facturas con o sin pagos
- ✅ Elimina automáticamente los pagos asociados
- ✅ Restablece las cuotas a estado PENDIENTE
- ✅ Libera los tratamientos marcados como facturados (FACTURADO='N')
- ✅ Registra el motivo y usuario que anuló en las observaciones

## Proceso de Anulación

Cuando se anula una factura, el procedimiento realiza las siguientes acciones en orden:

1. **Eliminar pagos**: Borra todos los registros de `ODO_PAGOS` asociados a la factura
2. **Eliminar cuotas**: Borra todos los registros de `ODO_CUOTAS_FACTURA` asociados a la factura (ya no tienen razón de existir)
3. **Liberar tratamientos**: Marca como no facturados (`FACTURADO='N'`) todos los tratamientos en `ODO_TRATAMIENTOS_DIENTE` que estaban en la factura
4. **Anular factura**: Actualiza `ODO_FACTURAS`:
   - Estado → 'ANULADA'
   - Saldo pendiente → 0
   - Agrega observación con motivo, usuario y fecha

## Instalación

Para aplicar estos cambios en la base de datos:

```sql
@fix_anular_factura_con_pagos.sql
```

## Uso

```sql
DECLARE
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    PKG_FACTURAS.anular_factura(
        p_factura_id  => 123,  -- ID de la factura a anular
        p_motivo      => 'Error en el registro',  -- Motivo de anulación
        p_anulado_por => 1,    -- ID del usuario que anula
        p_resultado   => v_resultado,
        p_mensaje     => v_mensaje
    );

    DBMS_OUTPUT.PUT_LINE('Resultado: ' || v_resultado);
    DBMS_OUTPUT.PUT_LINE('Mensaje: ' || v_mensaje);
END;
/
```

## Notas Importantes

- ⚠️ La anulación es irreversible
- ⚠️ Se eliminan TODOS los pagos asociados a la factura
- ⚠️ Se eliminan TODAS las cuotas asociadas a la factura
- ⚠️ Los tratamientos vuelven a estar disponibles para facturar
- ✅ Se mantiene un registro del motivo y quién anuló en las observaciones
- ✅ Todo se ejecuta en una transacción (COMMIT al final o ROLLBACK si hay error)

## Relacionado con Pendientes

- ✅ Pendiente #7: Anulación de factura pagada
- 📝 Pendiente #12: Anulación de pagos (implementado parcialmente - los pagos se eliminan al anular la factura)
