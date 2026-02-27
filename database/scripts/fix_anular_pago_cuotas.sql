-- Fix: ANULAR_PAGO ahora restaura saldos en cuotas
-- cuando el pago fue registrado desde la factura (CUOTA_ID = NULL)
-- Fecha: 2026-02-27

CREATE OR REPLACE PROCEDURE anular_pago(
    p_pago_id       IN NUMBER,
    p_motivo        IN VARCHAR2,
    p_anulado_por   IN NUMBER,
    p_resultado     OUT NUMBER,
    p_mensaje       OUT VARCHAR2
) IS
    v_factura_id    NUMBER;
    v_monto_pago    NUMBER;
    v_cuota_id      NUMBER;
    v_estado_actual VARCHAR2(20);
    v_restante      NUMBER;
    v_revertir      NUMBER;
    v_nuevo_mp      NUMBER;
    CURSOR c_cuotas_rev IS
        SELECT CUOTA_ID, MONTO_CUOTA, MONTO_PAGADO, SALDO_CUOTA
        FROM ODO_CUOTAS_FACTURA
        WHERE FACTURA_ID = v_factura_id
          AND MONTO_PAGADO > 0
        ORDER BY NUMERO_CUOTA DESC;
BEGIN
    SELECT FACTURA_ID, MONTO, CUOTA_ID
    INTO v_factura_id, v_monto_pago, v_cuota_id
    FROM ODO_PAGOS WHERE PAGO_ID = p_pago_id;

    SELECT ESTADO INTO v_estado_actual
    FROM ODO_FACTURAS WHERE FACTURA_ID = v_factura_id;

    IF v_estado_actual = 'ANULADA' THEN
        p_resultado := 0;
        p_mensaje := 'No se puede anular un pago de una factura anulada';
        RETURN;
    END IF;

    DELETE FROM ODO_PAGOS WHERE PAGO_ID = p_pago_id;

    UPDATE ODO_FACTURAS
    SET SALDO_PENDIENTE = SALDO_PENDIENTE + v_monto_pago,
        OBSERVACIONES = OBSERVACIONES || CHR(10) ||
                       'PAGO ANULADO (' || v_monto_pago || ' Gs): ' || p_motivo
    WHERE FACTURA_ID = v_factura_id;

    IF v_cuota_id IS NOT NULL THEN
        UPDATE ODO_CUOTAS_FACTURA
        SET MONTO_PAGADO = MONTO_PAGADO - v_monto_pago,
            SALDO_CUOTA  = SALDO_CUOTA  + v_monto_pago,
            ESTADO = CASE
                WHEN MONTO_PAGADO - v_monto_pago <= 0 THEN 'PENDIENTE'
                WHEN MONTO_PAGADO - v_monto_pago < MONTO_CUOTA THEN 'PARCIAL'
                ELSE 'PAGADA'
            END,
            FECHA_PAGO = CASE WHEN MONTO_PAGADO - v_monto_pago <= 0 THEN NULL ELSE FECHA_PAGO END,
            FECHA_MODIFICACION = SYSTIMESTAMP
        WHERE CUOTA_ID = v_cuota_id;
    ELSE
        v_restante := v_monto_pago;
        FOR r IN c_cuotas_rev LOOP
            EXIT WHEN v_restante <= 0;
            v_revertir := LEAST(v_restante, r.MONTO_PAGADO);
            v_nuevo_mp := r.MONTO_PAGADO - v_revertir;
            UPDATE ODO_CUOTAS_FACTURA
            SET MONTO_PAGADO = v_nuevo_mp,
                SALDO_CUOTA  = r.SALDO_CUOTA + v_revertir,
                ESTADO = CASE
                    WHEN v_nuevo_mp <= 0 THEN 'PENDIENTE'
                    WHEN v_nuevo_mp < r.MONTO_CUOTA THEN 'PARCIAL'
                    ELSE 'PAGADA'
                END,
                FECHA_PAGO = CASE WHEN v_nuevo_mp <= 0 THEN NULL ELSE FECHA_PAGO END,
                FECHA_MODIFICACION = SYSTIMESTAMP
            WHERE CUOTA_ID = r.CUOTA_ID;
            v_restante := v_restante - v_revertir;
        END LOOP;
    END IF;

    UPDATE ODO_FACTURAS
    SET ESTADO = CASE
        WHEN SALDO_PENDIENTE >= TOTAL THEN 'PENDIENTE'
        WHEN SALDO_PENDIENTE > 0 AND SALDO_PENDIENTE < TOTAL THEN 'PARCIAL'
        WHEN SALDO_PENDIENTE = 0 THEN 'PAGADA'
        ELSE ESTADO
    END
    WHERE FACTURA_ID = v_factura_id;

    p_resultado := 1;
    p_mensaje := 'Pago anulado exitosamente';

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        ROLLBACK;
        p_resultado := 0;
        p_mensaje := 'Pago no encontrado';
    WHEN OTHERS THEN
        ROLLBACK;
        p_resultado := 0;
        p_mensaje := 'Error al anular pago: ' || SQLERRM;
END anular_pago;
/
