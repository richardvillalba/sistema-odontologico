-- Fix para usar el timbrado_id seleccionado por el usuario al crear factura

-- 1. Actualizar especificación del paquete
CREATE OR REPLACE PACKAGE PKG_FACTURAS AS
    TYPE t_cursor IS REF CURSOR;

    -- ========================================
    -- TIMBRADOS
    -- ========================================

    PROCEDURE crear_timbrado(
        p_empresa_id         IN NUMBER,
        p_numero_timbrado    IN VARCHAR2,
        p_establecimiento    IN VARCHAR2,
        p_punto_expedicion   IN VARCHAR2,
        p_tipo_documento     IN VARCHAR2,
        p_numero_inicio      IN NUMBER,
        p_numero_fin         IN NUMBER,
        p_fecha_inicio       IN DATE,
        p_fecha_vencimiento  IN DATE,
        p_creado_por         IN NUMBER,
        p_timbrado_id        OUT NUMBER,
        p_resultado          OUT NUMBER,
        p_mensaje            OUT VARCHAR2
    );

    PROCEDURE actualizar_timbrado(
        p_timbrado_id        IN NUMBER,
        p_numero_timbrado    IN VARCHAR2 DEFAULT NULL,
        p_fecha_vencimiento  IN DATE DEFAULT NULL,
        p_modificado_por     IN NUMBER,
        p_resultado          OUT NUMBER,
        p_mensaje            OUT VARCHAR2
    );

    PROCEDURE cambiar_estado_timbrado(
        p_timbrado_id    IN NUMBER,
        p_activo         IN CHAR,
        p_modificado_por IN NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    );

    PROCEDURE get_timbrados_empresa(
        p_empresa_id IN NUMBER,
        p_activo     IN CHAR DEFAULT NULL,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );

    PROCEDURE get_timbrado(
        p_timbrado_id IN NUMBER,
        p_cursor      OUT t_cursor,
        p_resultado   OUT NUMBER,
        p_mensaje     OUT VARCHAR2
    );

    PROCEDURE verificar_alertas_timbrados(
        p_empresa_id     IN NUMBER,
        p_dias_alerta    IN NUMBER DEFAULT 30,
        p_margen_numeros IN NUMBER DEFAULT 100,
        p_usuario_id     IN NUMBER DEFAULT NULL,
        p_cursor         OUT t_cursor,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    );

    -- ========================================
    -- PUNTOS DE EXPEDICIÓN POR USUARIO
    -- ========================================

    PROCEDURE asignar_punto_usuario(
        p_usuario_id    IN NUMBER,
        p_timbrado_id   IN NUMBER,
        p_asignado_por  IN NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    PROCEDURE desactivar_punto_usuario(
        p_usuario_id     IN NUMBER,
        p_timbrado_id    IN NUMBER DEFAULT NULL,
        p_modificado_por IN NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    );

    PROCEDURE get_punto_usuario(
        p_usuario_id IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );

    -- ========================================
    -- FACTURAS
    -- ========================================

    -- Crear factura (solo header, sin detalles)
    -- p_timbrado_id es opcional: si no se envía, busca el punto activo del usuario
    PROCEDURE crear_factura(
        p_paciente_id           IN NUMBER,
        p_usuario_id            IN NUMBER,
        p_empresa_id            IN NUMBER,
        p_sucursal_id           IN NUMBER,
        p_timbrado_id           IN NUMBER DEFAULT NULL,
        p_tipo_factura          IN VARCHAR2 DEFAULT 'B',
        p_condicion_operacion   IN VARCHAR2 DEFAULT 'CONTADO',
        p_plazo_credito_dias    IN NUMBER DEFAULT NULL,
        p_observaciones         IN VARCHAR2 DEFAULT NULL,
        p_factura_id            OUT NUMBER,
        p_numero_factura        OUT VARCHAR2,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );

    -- Agregar detalle a factura
    PROCEDURE agregar_detalle_factura(
        p_factura_id            IN NUMBER,
        p_tratamiento_paciente_id IN NUMBER DEFAULT NULL,
        p_descripcion           IN VARCHAR2,
        p_cantidad              IN NUMBER,
        p_precio_unitario       IN NUMBER,
        p_descuento             IN NUMBER DEFAULT 0,
        p_detalle_id            OUT NUMBER,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );

    -- Calcular totales de factura
    PROCEDURE calcular_totales_factura(
        p_factura_id IN NUMBER,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );

    -- Anular factura
    PROCEDURE anular_factura(
        p_factura_id     IN NUMBER,
        p_motivo         IN VARCHAR2,
        p_anulado_por    IN NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    );

    -- Obtener factura por ID
    PROCEDURE get_factura(
        p_factura_id IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );

    -- Obtener detalles de factura
    PROCEDURE get_factura_detalles(
        p_factura_id IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );

    -- Obtener facturas de un paciente
    PROCEDURE get_facturas_paciente(
        p_paciente_id IN NUMBER,
        p_cursor      OUT t_cursor,
        p_resultado   OUT NUMBER,
        p_mensaje     OUT VARCHAR2
    );

    -- Obtener facturas de empresa con filtros
    PROCEDURE get_facturas_empresa(
        p_empresa_id    IN NUMBER,
        p_estado        IN VARCHAR2 DEFAULT NULL,
        p_fecha_desde   IN DATE DEFAULT NULL,
        p_fecha_hasta   IN DATE DEFAULT NULL,
        p_limit         IN NUMBER DEFAULT 50,
        p_offset        IN NUMBER DEFAULT 0,
        p_cursor        OUT t_cursor,
        p_total         OUT NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- ========================================
    -- PAGOS
    -- ========================================

    PROCEDURE registrar_pago(
        p_factura_id     IN NUMBER,
        p_monto          IN NUMBER,
        p_metodo_pago    IN VARCHAR2,
        p_referencia     IN VARCHAR2 DEFAULT NULL,
        p_banco          IN VARCHAR2 DEFAULT NULL,
        p_registrado_por IN NUMBER,
        p_pago_id        OUT NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    );

    PROCEDURE get_pagos_factura(
        p_factura_id IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );

    PROCEDURE get_cuenta_corriente_paciente(
        p_paciente_id IN NUMBER,
        p_cursor      OUT t_cursor,
        p_resultado   OUT NUMBER,
        p_mensaje     OUT VARCHAR2
    );

END PKG_FACTURAS;
/

-- 2. Actualizar el cuerpo del paquete - procedimiento crear_factura
-- Este bloque reemplaza SOLO el procedimiento crear_factura para aceptar p_timbrado_id

CREATE OR REPLACE PACKAGE BODY PKG_FACTURAS AS

    -- ========================================
    -- SECCION: TIMBRADOS
    -- ========================================

    PROCEDURE crear_timbrado(
        p_empresa_id         IN NUMBER,
        p_numero_timbrado    IN VARCHAR2,
        p_establecimiento    IN VARCHAR2,
        p_punto_expedicion   IN VARCHAR2,
        p_tipo_documento     IN VARCHAR2,
        p_numero_inicio      IN NUMBER,
        p_numero_fin         IN NUMBER,
        p_fecha_inicio       IN DATE,
        p_fecha_vencimiento  IN DATE,
        p_creado_por         IN NUMBER,
        p_timbrado_id        OUT NUMBER,
        p_resultado          OUT NUMBER,
        p_mensaje            OUT VARCHAR2
    ) IS
        v_existe NUMBER;
    BEGIN
        IF p_numero_fin <= p_numero_inicio THEN
            p_resultado := 0;
            p_mensaje := 'El numero final debe ser mayor al numero inicial';
            RETURN;
        END IF;

        IF p_fecha_vencimiento <= p_fecha_inicio THEN
            p_resultado := 0;
            p_mensaje := 'La fecha de vencimiento debe ser posterior a la fecha de inicio';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_existe
        FROM ODO_TIMBRADOS
        WHERE EMPRESA_ID = p_empresa_id
          AND ESTABLECIMIENTO = p_establecimiento
          AND PUNTO_EXPEDICION = p_punto_expedicion
          AND TIPO_DOCUMENTO = p_tipo_documento
          AND ACTIVO = 'S';

        IF v_existe > 0 THEN
            p_resultado := 0;
            p_mensaje := 'Ya existe un timbrado activo para este establecimiento y punto de expedicion';
            RETURN;
        END IF;

        INSERT INTO ODO_TIMBRADOS (
            EMPRESA_ID, NUMERO_TIMBRADO, ESTABLECIMIENTO, PUNTO_EXPEDICION,
            TIPO_DOCUMENTO, NUMERO_INICIO, NUMERO_FIN, NUMERO_ACTUAL,
            FECHA_INICIO, FECHA_VENCIMIENTO, ACTIVO, FECHA_REGISTRO
        ) VALUES (
            p_empresa_id, p_numero_timbrado, p_establecimiento, p_punto_expedicion,
            NVL(p_tipo_documento, 'FACTURA'), p_numero_inicio, p_numero_fin, p_numero_inicio,
            p_fecha_inicio, p_fecha_vencimiento, 'S', SYSTIMESTAMP
        ) RETURNING TIMBRADO_ID INTO p_timbrado_id;

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Timbrado creado exitosamente con ID: ' || p_timbrado_id;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al crear timbrado: ' || SQLERRM;
    END crear_timbrado;

    PROCEDURE actualizar_timbrado(
        p_timbrado_id        IN NUMBER,
        p_numero_timbrado    IN VARCHAR2 DEFAULT NULL,
        p_fecha_vencimiento  IN DATE DEFAULT NULL,
        p_modificado_por     IN NUMBER,
        p_resultado          OUT NUMBER,
        p_mensaje            OUT VARCHAR2
    ) IS
        v_existe NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_existe
        FROM ODO_TIMBRADOS WHERE TIMBRADO_ID = p_timbrado_id;

        IF v_existe = 0 THEN
            p_resultado := 0;
            p_mensaje := 'Timbrado no encontrado';
            RETURN;
        END IF;

        UPDATE ODO_TIMBRADOS
        SET
            NUMERO_TIMBRADO = NVL(p_numero_timbrado, NUMERO_TIMBRADO),
            FECHA_VENCIMIENTO = NVL(p_fecha_vencimiento, FECHA_VENCIMIENTO),
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_modificado_por
        WHERE TIMBRADO_ID = p_timbrado_id;

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Timbrado actualizado exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al actualizar timbrado: ' || SQLERRM;
    END actualizar_timbrado;

    PROCEDURE cambiar_estado_timbrado(
        p_timbrado_id    IN NUMBER,
        p_activo         IN CHAR,
        p_modificado_por IN NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    ) IS
        v_empresa_id NUMBER;
        v_establecimiento VARCHAR2(10);
        v_punto_expedicion VARCHAR2(10);
        v_tipo_documento VARCHAR2(50);
        v_fecha_inicio DATE;
        v_fecha_vencimiento DATE;
        v_existe NUMBER;
    BEGIN
        SELECT EMPRESA_ID, ESTABLECIMIENTO, PUNTO_EXPEDICION, TIPO_DOCUMENTO, FECHA_INICIO, FECHA_VENCIMIENTO
        INTO v_empresa_id, v_establecimiento, v_punto_expedicion, v_tipo_documento, v_fecha_inicio, v_fecha_vencimiento
        FROM ODO_TIMBRADOS WHERE TIMBRADO_ID = p_timbrado_id;

        IF p_activo = 'S' THEN
            SELECT COUNT(*) INTO v_existe
            FROM ODO_TIMBRADOS
            WHERE EMPRESA_ID = v_empresa_id
              AND ESTABLECIMIENTO = v_establecimiento
              AND PUNTO_EXPEDICION = v_punto_expedicion
              AND TIPO_DOCUMENTO = v_tipo_documento
              AND ACTIVO = 'S'
              AND TIMBRADO_ID <> p_timbrado_id;

            IF v_existe > 0 THEN
                p_resultado := 0;
                p_mensaje := 'Ya existe un timbrado activo para este punto de expedicion. Desactive el anterior primero.';
                RETURN;
            END IF;

            IF v_fecha_inicio > SYSDATE OR v_fecha_vencimiento < SYSDATE THEN
                p_resultado := 0;
                p_mensaje := 'No se puede activar un timbrado que no esta vigente actualmente.';
                RETURN;
            END IF;
        END IF;

        UPDATE ODO_TIMBRADOS
        SET ACTIVO = p_activo,
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_modificado_por
        WHERE TIMBRADO_ID = p_timbrado_id;

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Estado del timbrado actualizado correctamente';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_resultado := 0;
            p_mensaje := 'Timbrado no encontrado';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al cambiar estado: ' || SQLERRM;
    END cambiar_estado_timbrado;

    PROCEDURE get_timbrados_empresa(
        p_empresa_id IN NUMBER,
        p_activo     IN CHAR DEFAULT NULL,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                t.TIMBRADO_ID, t.EMPRESA_ID, t.NUMERO_TIMBRADO,
                t.ESTABLECIMIENTO, t.PUNTO_EXPEDICION, t.TIPO_DOCUMENTO,
                t.NUMERO_INICIO, t.NUMERO_FIN, t.NUMERO_ACTUAL,
                (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) AS NUMEROS_DISPONIBLES,
                t.FECHA_INICIO, t.FECHA_VENCIMIENTO,
                TRUNC(t.FECHA_VENCIMIENTO - SYSDATE) AS DIAS_PARA_VENCER,
                t.ACTIVO, t.FECHA_REGISTRO
            FROM ODO_TIMBRADOS t
            WHERE t.EMPRESA_ID = p_empresa_id
              AND (p_activo IS NULL OR t.ACTIVO = p_activo)
            ORDER BY t.FECHA_REGISTRO DESC;

        p_resultado := 1;
        p_mensaje := 'Timbrados obtenidos exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener timbrados: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_timbrados_empresa;

    PROCEDURE get_timbrado(
        p_timbrado_id IN NUMBER,
        p_cursor      OUT t_cursor,
        p_resultado   OUT NUMBER,
        p_mensaje     OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                t.*,
                (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) AS NUMEROS_DISPONIBLES,
                TRUNC(t.FECHA_VENCIMIENTO - SYSDATE) AS DIAS_PARA_VENCER
            FROM ODO_TIMBRADOS t
            WHERE t.TIMBRADO_ID = p_timbrado_id;

        p_resultado := 1;
        p_mensaje := 'Timbrado obtenido exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener timbrado: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_timbrado;

    PROCEDURE verificar_alertas_timbrados(
        p_empresa_id     IN NUMBER,
        p_dias_alerta    IN NUMBER DEFAULT 30,
        p_margen_numeros IN NUMBER DEFAULT 100,
        p_usuario_id     IN NUMBER DEFAULT NULL,
        p_cursor         OUT t_cursor,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                t.TIMBRADO_ID, t.NUMERO_TIMBRADO,
                t.ESTABLECIMIENTO, t.PUNTO_EXPEDICION,
                (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) AS NUMEROS_DISPONIBLES,
                TRUNC(t.FECHA_VENCIMIENTO - SYSDATE) AS DIAS_PARA_VENCER,
                CASE
                    WHEN t.FECHA_VENCIMIENTO <= SYSDATE THEN 'VENCIDO'
                    WHEN (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) <= 0 THEN 'AGOTADO'
                    WHEN (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) <= p_margen_numeros THEN 'POR_AGOTARSE'
                    WHEN TRUNC(t.FECHA_VENCIMIENTO - SYSDATE) <= p_dias_alerta THEN 'POR_VENCER'
                    ELSE 'OK'
                END AS TIPO_ALERTA
            FROM ODO_TIMBRADOS t
            WHERE t.EMPRESA_ID = p_empresa_id AND t.ACTIVO = 'S'
              AND (t.FECHA_VENCIMIENTO <= SYSDATE + p_dias_alerta
                   OR (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) <= p_margen_numeros)
              AND (p_usuario_id IS NULL OR EXISTS (
                  SELECT 1 FROM ODO_USUARIO_PUNTOS_EXPEDICION up
                  WHERE up.TIMBRADO_ID = t.TIMBRADO_ID
                    AND up.USUARIO_ID = p_usuario_id
                    AND up.ACTIVO = 'S'
              ))
            ORDER BY
                CASE
                    WHEN t.FECHA_VENCIMIENTO <= SYSDATE THEN 1
                    WHEN (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) <= 0 THEN 2
                    WHEN (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) <= p_margen_numeros THEN 3
                    ELSE 4
                END;

        p_resultado := 1;
        p_mensaje := 'Alertas verificadas exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al verificar alertas: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END verificar_alertas_timbrados;

    -- ========================================
    -- SECCION: PUNTOS DE EXPEDICION
    -- ========================================

    PROCEDURE asignar_punto_usuario(
        p_usuario_id    IN NUMBER,
        p_timbrado_id   IN NUMBER,
        p_asignado_por  IN NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
        v_existe NUMBER;
        v_timbrado_activo CHAR(1);
    BEGIN
        BEGIN
            SELECT ACTIVO INTO v_timbrado_activo
            FROM ODO_TIMBRADOS
            WHERE TIMBRADO_ID = p_timbrado_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_resultado := 0;
                p_mensaje := 'Timbrado no encontrado';
                RETURN;
        END;

        IF v_timbrado_activo = 'N' THEN
            p_resultado := 0;
            p_mensaje := 'El timbrado no esta activo';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_existe
        FROM ODO_USUARIO_PUNTOS_EXPEDICION
        WHERE TIMBRADO_ID = p_timbrado_id
          AND ACTIVO = 'S'
          AND USUARIO_ID <> p_usuario_id;

        IF v_existe > 0 THEN
            p_resultado := 0;
            p_mensaje := 'Este punto de expedicion ya esta asignado a otro usuario activo. Desasignelo primero.';
            RETURN;
        END IF;

        SELECT COUNT(*) INTO v_existe
        FROM ODO_USUARIO_PUNTOS_EXPEDICION
        WHERE USUARIO_ID = p_usuario_id AND TIMBRADO_ID = p_timbrado_id;

        IF v_existe > 0 THEN
            UPDATE ODO_USUARIO_PUNTOS_EXPEDICION
            SET ACTIVO = 'S', FECHA_MODIFICACION = SYSTIMESTAMP, MODIFICADO_POR = p_asignado_por
            WHERE USUARIO_ID = p_usuario_id AND TIMBRADO_ID = p_timbrado_id;
        ELSE
            INSERT INTO ODO_USUARIO_PUNTOS_EXPEDICION (
                USUARIO_ID, TIMBRADO_ID, ACTIVO, FECHA_ASIGNACION, ASIGNADO_POR
            ) VALUES (
                p_usuario_id, p_timbrado_id, 'S', SYSTIMESTAMP, p_asignado_por
            );
        END IF;

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Punto de expedicion asignado exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al asignar punto: ' || SQLERRM;
    END asignar_punto_usuario;

    PROCEDURE desactivar_punto_usuario(
        p_usuario_id     IN NUMBER,
        p_timbrado_id    IN NUMBER DEFAULT NULL,
        p_modificado_por IN NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    ) IS
    BEGIN
        UPDATE ODO_USUARIO_PUNTOS_EXPEDICION
        SET ACTIVO = 'N',
            MODIFICADO_POR = p_modificado_por,
            FECHA_MODIFICACION = SYSTIMESTAMP
        WHERE USUARIO_ID = p_usuario_id
          AND (p_timbrado_id IS NULL OR TIMBRADO_ID = p_timbrado_id)
          AND ACTIVO = 'S';

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Punto de expedicion desactivado correctamente';
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al desactivar punto: ' || SQLERRM;
    END desactivar_punto_usuario;

    PROCEDURE get_punto_usuario(
        p_usuario_id IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                up.USUARIO_PUNTO_ID, up.USUARIO_ID, up.TIMBRADO_ID,
                t.NUMERO_TIMBRADO, t.ESTABLECIMIENTO, t.PUNTO_EXPEDICION,
                t.NUMERO_ACTUAL, t.NUMERO_FIN,
                (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) AS NUMEROS_DISPONIBLES,
                t.FECHA_VENCIMIENTO,
                up.ACTIVO, up.FECHA_ASIGNACION
            FROM ODO_USUARIO_PUNTOS_EXPEDICION up
            JOIN ODO_TIMBRADOS t ON up.TIMBRADO_ID = t.TIMBRADO_ID
            WHERE up.USUARIO_ID = p_usuario_id AND up.ACTIVO = 'S' AND t.ACTIVO = 'S';

        p_resultado := 1;
        p_mensaje := 'Puntos de expedicion obtenidos exitosamente';
    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener puntos: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_punto_usuario;

    -- ========================================
    -- SECCION: FACTURAS
    -- ========================================

    -- PROCEDIMIENTO ACTUALIZADO: Ahora acepta p_timbrado_id opcional
    -- Si se proporciona, usa ese timbrado específico
    -- Si no se proporciona, busca el punto activo del usuario (comportamiento anterior)
    PROCEDURE crear_factura(
        p_paciente_id           IN NUMBER,
        p_usuario_id            IN NUMBER,
        p_empresa_id            IN NUMBER,
        p_sucursal_id           IN NUMBER,
        p_timbrado_id           IN NUMBER DEFAULT NULL,
        p_tipo_factura          IN VARCHAR2 DEFAULT 'B',
        p_condicion_operacion   IN VARCHAR2 DEFAULT 'CONTADO',
        p_plazo_credito_dias    IN NUMBER DEFAULT NULL,
        p_observaciones         IN VARCHAR2 DEFAULT NULL,
        p_factura_id            OUT NUMBER,
        p_numero_factura        OUT VARCHAR2,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    ) IS
        v_timbrado_id NUMBER;
        v_establecimiento VARCHAR2(3);
        v_punto_expedicion VARCHAR2(3);
        v_numero_actual NUMBER;
        v_numero_fin NUMBER;
        v_fecha_venc TIMESTAMP;
        v_numero_timbrado VARCHAR2(8);
        v_paciente_nombre VARCHAR2(200);
        v_paciente_doc VARCHAR2(50);
        v_paciente_doc_tipo VARCHAR2(20);
    BEGIN
        -- Si se proporciona timbrado_id, usarlo directamente
        -- Si no, buscar el punto activo del usuario
        IF p_timbrado_id IS NOT NULL THEN
            BEGIN
                SELECT t.TIMBRADO_ID, t.ESTABLECIMIENTO, t.PUNTO_EXPEDICION,
                       t.NUMERO_ACTUAL, t.NUMERO_TIMBRADO
                INTO v_timbrado_id, v_establecimiento, v_punto_expedicion,
                     v_numero_actual, v_numero_timbrado
                FROM ODO_TIMBRADOS t
                WHERE t.TIMBRADO_ID = p_timbrado_id
                  AND t.ACTIVO = 'S';
            EXCEPTION
                WHEN NO_DATA_FOUND THEN
                    p_resultado := 0;
                    p_mensaje := 'El timbrado especificado no existe o no esta activo';
                    RETURN;
            END;
        ELSE
            -- Comportamiento anterior: buscar punto activo del usuario
            BEGIN
                SELECT up.TIMBRADO_ID, t.ESTABLECIMIENTO, t.PUNTO_EXPEDICION,
                       t.NUMERO_ACTUAL, t.NUMERO_TIMBRADO
                INTO v_timbrado_id, v_establecimiento, v_punto_expedicion,
                     v_numero_actual, v_numero_timbrado
                FROM ODO_USUARIO_PUNTOS_EXPEDICION up
                JOIN ODO_TIMBRADOS t ON up.TIMBRADO_ID = t.TIMBRADO_ID
                WHERE up.USUARIO_ID = p_usuario_id
                  AND up.ACTIVO = 'S'
                  AND t.ACTIVO = 'S'
                  AND ROWNUM = 1;
            EXCEPTION
                WHEN NO_DATA_FOUND THEN
                    p_resultado := 0;
                    p_mensaje := 'El usuario no tiene un punto de expedicion activo asignado';
                    RETURN;
            END;
        END IF;

        -- Obtener datos del timbrado para validacion (con bloqueo)
        SELECT NUMERO_ACTUAL, NUMERO_FIN, FECHA_VENCIMIENTO
        INTO v_numero_actual, v_numero_fin, v_fecha_venc
        FROM ODO_TIMBRADOS
        WHERE TIMBRADO_ID = v_timbrado_id FOR UPDATE;

        -- Verificar que hay numeros disponibles
        IF v_numero_actual > v_numero_fin THEN
            p_resultado := 0;
            p_mensaje := 'El timbrado no tiene numeros disponibles';
            ROLLBACK;
            RETURN;
        END IF;

        -- Verificar vencimiento
        IF v_fecha_venc < SYSDATE THEN
            p_resultado := 0;
            p_mensaje := 'El timbrado esta vencido';
            ROLLBACK;
            RETURN;
        END IF;

        -- Obtener datos del paciente
        SELECT NOMBRE || ' ' || APELLIDO, DOCUMENTO_NUMERO, DOCUMENTO_TIPO
        INTO v_paciente_nombre, v_paciente_doc, v_paciente_doc_tipo
        FROM ODO_PACIENTES
        WHERE PACIENTE_ID = p_paciente_id;

        -- Formatear numero de factura
        p_numero_factura := v_establecimiento || '-' || v_punto_expedicion || '-' ||
                           LPAD(v_numero_actual, 7, '0');

        -- Crear factura
        INSERT INTO ODO_FACTURAS (
            PACIENTE_ID, EMPRESA_ID, SUCURSAL_ID, TIMBRADO_ID,
            NUMERO_FACTURA, NUMERO_FACTURA_COMPLETO,
            NUMERO_TIMBRADO, ESTABLECIMIENTO, PUNTO_EXPEDICION,
            TIPO_FACTURA, FECHA_EMISION,
            NOMBRE_CLIENTE, NUMERO_DOCUMENTO_CLIENTE, TIPO_DOCUMENTO_CLIENTE,
            CONDICION_OPERACION, PLAZO_CREDITO_DIAS,
            SUBTOTAL, DESCUENTO, IMPUESTOS, TOTAL, SALDO_PENDIENTE,
            ESTADO, OBSERVACIONES,
            FECHA_CREACION, CREADO_POR
        ) VALUES (
            p_paciente_id, p_empresa_id, p_sucursal_id, v_timbrado_id,
            LPAD(v_numero_actual, 7, '0'), p_numero_factura,
            v_numero_timbrado, v_establecimiento, v_punto_expedicion,
            NVL(p_tipo_factura, 'B'), SYSTIMESTAMP,
            v_paciente_nombre, v_paciente_doc, v_paciente_doc_tipo,
            NVL(p_condicion_operacion, 'CONTADO'), p_plazo_credito_dias,
            0, 0, 0, 0, 0,
            'PENDIENTE', p_observaciones,
            SYSTIMESTAMP, p_usuario_id
        ) RETURNING FACTURA_ID INTO p_factura_id;

        -- Incrementar numero actual del timbrado
        UPDATE ODO_TIMBRADOS
        SET NUMERO_ACTUAL = NUMERO_ACTUAL + 1,
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_usuario_id
        WHERE TIMBRADO_ID = v_timbrado_id;

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Factura creada: ' || p_numero_factura;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al crear factura: ' || SQLERRM;
    END crear_factura;

    PROCEDURE agregar_detalle_factura(
        p_factura_id            IN NUMBER,
        p_tratamiento_paciente_id IN NUMBER DEFAULT NULL,
        p_descripcion           IN VARCHAR2,
        p_cantidad              IN NUMBER,
        p_precio_unitario       IN NUMBER,
        p_descuento             IN NUMBER DEFAULT 0,
        p_detalle_id            OUT NUMBER,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    ) IS
        v_estado VARCHAR2(50);
        v_subtotal NUMBER;
    BEGIN
        SELECT ESTADO INTO v_estado
        FROM ODO_FACTURAS
        WHERE FACTURA_ID = p_factura_id;

        IF v_estado NOT IN ('BORRADOR', 'PENDIENTE') THEN
            p_resultado := 0;
            p_mensaje := 'No se puede modificar una factura con estado: ' || v_estado;
            RETURN;
        END IF;

        v_subtotal := (p_cantidad * p_precio_unitario) - p_descuento;

        INSERT INTO ODO_DETALLES_FACTURA (
            FACTURA_ID, TRATAMIENTO_PACIENTE_ID,
            DESCRIPCION, CANTIDAD, PRECIO_UNITARIO, DESCUENTO, SUBTOTAL
        ) VALUES (
            p_factura_id, p_tratamiento_paciente_id,
            p_descripcion, p_cantidad, p_precio_unitario, p_descuento, v_subtotal
        ) RETURNING DETALLE_ID INTO p_detalle_id;

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Detalle agregado exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al agregar detalle: ' || SQLERRM;
    END agregar_detalle_factura;

    PROCEDURE calcular_totales_factura(
        p_factura_id IN NUMBER,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    ) IS
        v_subtotal NUMBER := 0;
        v_descuento NUMBER := 0;
        v_total NUMBER := 0;
    BEGIN
        SELECT
            NVL(SUM(CANTIDAD * PRECIO_UNITARIO), 0),
            NVL(SUM(DESCUENTO), 0)
        INTO v_subtotal, v_descuento
        FROM ODO_DETALLES_FACTURA
        WHERE FACTURA_ID = p_factura_id;

        v_total := v_subtotal - v_descuento;

        UPDATE ODO_FACTURAS
        SET
            SUBTOTAL = v_subtotal,
            DESCUENTO = v_descuento,
            TOTAL = v_total,
            SALDO_PENDIENTE = v_total - NVL((SELECT SUM(MONTO) FROM ODO_PAGOS WHERE FACTURA_ID = p_factura_id), 0),
            ESTADO = CASE
                WHEN ESTADO = 'BORRADOR' THEN 'PENDIENTE'
                ELSE ESTADO
            END
        WHERE FACTURA_ID = p_factura_id;

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Totales calculados: ' || v_total;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al calcular totales: ' || SQLERRM;
    END calcular_totales_factura;

    PROCEDURE anular_factura(
        p_factura_id     IN NUMBER,
        p_motivo         IN VARCHAR2,
        p_anulado_por    IN NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    ) IS
        v_tiene_pagos NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_tiene_pagos
        FROM ODO_PAGOS
        WHERE FACTURA_ID = p_factura_id;

        IF v_tiene_pagos > 0 THEN
            p_resultado := 0;
            p_mensaje := 'No se puede anular una factura con pagos registrados';
            RETURN;
        END IF;

        UPDATE ODO_FACTURAS
        SET
            ESTADO = 'ANULADA',
            OBSERVACIONES = OBSERVACIONES || CHR(10) || 'ANULADA: ' || p_motivo
        WHERE FACTURA_ID = p_factura_id;

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Factura anulada exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al anular factura: ' || SQLERRM;
    END anular_factura;

    PROCEDURE get_factura(
        p_factura_id IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                f.*,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE_COMPLETO,
                (SELECT COUNT(*) FROM ODO_DETALLES_FACTURA WHERE FACTURA_ID = f.FACTURA_ID) AS CANTIDAD_ITEMS,
                (SELECT COUNT(*) FROM ODO_PAGOS WHERE FACTURA_ID = f.FACTURA_ID) AS CANTIDAD_PAGOS
            FROM ODO_FACTURAS f
            LEFT JOIN ODO_PACIENTES p ON f.PACIENTE_ID = p.PACIENTE_ID
            WHERE f.FACTURA_ID = p_factura_id;

        p_resultado := 1;
        p_mensaje := 'Factura obtenida';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener factura: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_factura;

    PROCEDURE get_factura_detalles(
        p_factura_id IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                d.*,
                t.DESCRIPCION AS TRATAMIENTO_NOMBRE
            FROM ODO_DETALLES_FACTURA d
            LEFT JOIN ODO_TRATAMIENTOS_PACIENTE tp ON d.TRATAMIENTO_PACIENTE_ID = tp.TRATAMIENTO_PACIENTE_ID
            LEFT JOIN ODO_CATALOGOS_TRATAMIENTOS t ON tp.CATALOGO_ID = t.CATALOGO_ID
            WHERE d.FACTURA_ID = p_factura_id
            ORDER BY d.DETALLE_ID ASC;

        p_resultado := 1;
        p_mensaje := 'Detalles obtenidos';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener detalles: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_factura_detalles;

    PROCEDURE get_facturas_paciente(
        p_paciente_id IN NUMBER,
        p_cursor      OUT t_cursor,
        p_resultado   OUT NUMBER,
        p_mensaje     OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                f.FACTURA_ID, f.NUMERO_FACTURA_COMPLETO,
                f.FECHA_EMISION, f.TOTAL, f.SALDO_PENDIENTE, f.ESTADO
            FROM ODO_FACTURAS f
            WHERE f.PACIENTE_ID = p_paciente_id
            ORDER BY f.FECHA_EMISION DESC;

        p_resultado := 1;
        p_mensaje := 'Facturas obtenidas';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener facturas: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_facturas_paciente;

    PROCEDURE get_facturas_empresa(
        p_empresa_id    IN NUMBER,
        p_estado        IN VARCHAR2 DEFAULT NULL,
        p_fecha_desde   IN DATE DEFAULT NULL,
        p_fecha_hasta   IN DATE DEFAULT NULL,
        p_limit         IN NUMBER DEFAULT 50,
        p_offset        IN NUMBER DEFAULT 0,
        p_cursor        OUT t_cursor,
        p_total         OUT NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        SELECT COUNT(*) INTO p_total
        FROM ODO_FACTURAS f
        WHERE f.EMPRESA_ID = p_empresa_id
          AND (p_estado IS NULL OR f.ESTADO = p_estado)
          AND (p_fecha_desde IS NULL OR TRUNC(f.FECHA_EMISION) >= p_fecha_desde)
          AND (p_fecha_hasta IS NULL OR TRUNC(f.FECHA_EMISION) <= p_fecha_hasta);

        OPEN p_cursor FOR
            SELECT * FROM (
                SELECT
                    f.*,
                    p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                    ROWNUM AS rn
                FROM ODO_FACTURAS f
                LEFT JOIN ODO_PACIENTES p ON f.PACIENTE_ID = p.PACIENTE_ID
                WHERE f.EMPRESA_ID = p_empresa_id
                  AND (p_estado IS NULL OR f.ESTADO = p_estado)
                  AND (p_fecha_desde IS NULL OR TRUNC(f.FECHA_EMISION) >= p_fecha_desde)
                  AND (p_fecha_hasta IS NULL OR TRUNC(f.FECHA_EMISION) <= p_fecha_hasta)
                ORDER BY f.FECHA_EMISION DESC
            )
            WHERE rn > p_offset AND rn <= (p_offset + p_limit);

        p_resultado := 1;
        p_mensaje := 'Facturas obtenidas';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener facturas: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_facturas_empresa;

    -- ========================================
    -- SECCION: PAGOS
    -- ========================================

    PROCEDURE registrar_pago(
        p_factura_id     IN NUMBER,
        p_monto          IN NUMBER,
        p_metodo_pago    IN VARCHAR2,
        p_referencia     IN VARCHAR2 DEFAULT NULL,
        p_banco          IN VARCHAR2 DEFAULT NULL,
        p_registrado_por IN NUMBER,
        p_pago_id        OUT NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    ) IS
        v_saldo_pendiente NUMBER;
        v_total NUMBER;
        v_paciente_id NUMBER;
        v_empresa_id NUMBER;
        v_nuevo_saldo NUMBER;
        v_nuevo_estado VARCHAR2(50);
    BEGIN
        SELECT SALDO_PENDIENTE, TOTAL, PACIENTE_ID, EMPRESA_ID, ESTADO
        INTO v_saldo_pendiente, v_total, v_paciente_id, v_empresa_id, v_nuevo_estado
        FROM ODO_FACTURAS
        WHERE FACTURA_ID = p_factura_id;

        IF v_nuevo_estado = 'ANULADA' THEN
            p_resultado := 0;
            p_mensaje := 'No se puede registrar pago en factura anulada';
            RETURN;
        END IF;

        IF p_monto > v_saldo_pendiente THEN
            p_resultado := 0;
            p_mensaje := 'El monto excede el saldo pendiente';
            RETURN;
        END IF;

        IF p_monto <= 0 THEN
            p_resultado := 0;
            p_mensaje := 'El monto debe ser mayor a cero';
            RETURN;
        END IF;

        INSERT INTO ODO_PAGOS (
            FACTURA_ID, PACIENTE_ID, EMPRESA_ID,
            FECHA_PAGO, MONTO, METODO_PAGO,
            REFERENCIA, BANCO, REGISTRADO_POR, FECHA_REGISTRO
        ) VALUES (
            p_factura_id, v_paciente_id, v_empresa_id,
            SYSTIMESTAMP, p_monto, p_metodo_pago,
            p_referencia, p_banco, p_registrado_por, SYSTIMESTAMP
        ) RETURNING PAGO_ID INTO p_pago_id;

        v_nuevo_saldo := v_saldo_pendiente - p_monto;

        IF v_nuevo_saldo = 0 THEN
            v_nuevo_estado := 'PAGADA';
        ELSIF v_nuevo_saldo < v_total THEN
            v_nuevo_estado := 'PARCIAL';
        ELSE
            v_nuevo_estado := 'PENDIENTE';
        END IF;

        UPDATE ODO_FACTURAS
        SET
            SALDO_PENDIENTE = v_nuevo_saldo,
            ESTADO = v_nuevo_estado
        WHERE FACTURA_ID = p_factura_id;

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Pago registrado. Nuevo saldo: ' || v_nuevo_saldo;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al registrar pago: ' || SQLERRM;
    END registrar_pago;

    PROCEDURE get_pagos_factura(
        p_factura_id IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                pg.*,
                u.NOMBRE || ' ' || u.APELLIDO AS REGISTRADO_POR_NOMBRE
            FROM ODO_PAGOS pg
            LEFT JOIN ODO_USUARIOS u ON pg.REGISTRADO_POR = u.USUARIO_ID
            WHERE pg.FACTURA_ID = p_factura_id
            ORDER BY pg.FECHA_PAGO DESC;

        p_resultado := 1;
        p_mensaje := 'Pagos obtenidos';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener pagos: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_pagos_factura;

    PROCEDURE get_cuenta_corriente_paciente(
        p_paciente_id IN NUMBER,
        p_cursor      OUT t_cursor,
        p_resultado   OUT NUMBER,
        p_mensaje     OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                f.FACTURA_ID,
                f.NUMERO_FACTURA_COMPLETO,
                f.FECHA_EMISION,
                f.TOTAL,
                f.SALDO_PENDIENTE,
                f.ESTADO,
                (SELECT COUNT(*) FROM ODO_PAGOS WHERE FACTURA_ID = f.FACTURA_ID) AS CANTIDAD_PAGOS
            FROM ODO_FACTURAS f
            WHERE f.PACIENTE_ID = p_paciente_id
              AND f.ESTADO IN ('PENDIENTE', 'PARCIAL', 'VENCIDA')
            ORDER BY f.FECHA_EMISION DESC;

        p_resultado := 1;
        p_mensaje := 'Cuenta corriente obtenida';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener cuenta corriente: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_cuenta_corriente_paciente;
END PKG_FACTURAS;
/

-- 3. Actualizar el endpoint para enviar timbrado_id
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern => 'factura',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => q'[
DECLARE
    v_body CLOB;
    v_factura_id NUMBER;
    v_numero_factura VARCHAR2(50);
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
    PKG_FACTURAS.crear_factura(
        p_paciente_id         => APEX_JSON.get_number('paciente_id'),
        p_usuario_id          => APEX_JSON.get_number('usuario_id'),
        p_empresa_id          => APEX_JSON.get_number('empresa_id'),
        p_sucursal_id         => APEX_JSON.get_number('sucursal_id'),
        p_timbrado_id         => APEX_JSON.get_number('timbrado_id'),
        p_tipo_factura        => NVL(APEX_JSON.get_varchar2('tipo_factura'), 'B'),
        p_condicion_operacion => NVL(APEX_JSON.get_varchar2('condicion_operacion'), 'CONTADO'),
        p_plazo_credito_dias  => APEX_JSON.get_number('plazo_credito_dias'),
        p_observaciones       => APEX_JSON.get_varchar2('observaciones'),
        p_factura_id          => v_factura_id,
        p_numero_factura      => v_numero_factura,
        p_resultado           => v_resultado,
        p_mensaje             => v_mensaje
    );
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('factura_id', v_factura_id);
    APEX_JSON.write('numero_factura', v_numero_factura);
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
