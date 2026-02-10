CREATE OR REPLACE PACKAGE BODY PKG_FACTURAS AS

    -- ========================================
    -- SECCI�N: TIMBRADOS
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
            p_mensaje := 'El n�mero final debe ser mayor al n�mero inicial';
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
            p_mensaje := 'Ya existe un timbrado activo para este establecimiento y punto de expedici�n';
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
        -- Obtener datos del timbrado actual
        SELECT EMPRESA_ID, ESTABLECIMIENTO, PUNTO_EXPEDICION, TIPO_DOCUMENTO, FECHA_INICIO, FECHA_VENCIMIENTO
        INTO v_empresa_id, v_establecimiento, v_punto_expedicion, v_tipo_documento, v_fecha_inicio, v_fecha_vencimiento
        FROM ODO_TIMBRADOS WHERE TIMBRADO_ID = p_timbrado_id;
        
        -- Si se intenta activar ('S')
        IF p_activo = 'S' THEN
            -- 1. Validar que no haya otro activo para el mismo punto (Misma lgica que el trigger borrado)
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
                p_mensaje := 'Ya existe un timbrado activo para este punto de expedicin. Desactive el anterior primero.';
                RETURN;
            END IF;

            -- 2. Validar vigencia (Misma lgica que el trigger borrado)
            IF v_fecha_inicio > SYSDATE OR v_fecha_vencimiento < SYSDATE THEN
                p_resultado := 0;
                p_mensaje := 'No se puede activar un timbrado que no est vigente actualmente.';
                RETURN;
            END IF;
        END IF;
        
        -- Actualizar estado y auditora
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
              -- Filtrar por usuario si se especifica
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
    -- SECCI�N: PUNTOS DE EXPEDICI�N
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
        -- Verificar que el timbrado existe y est� activo
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
            p_mensaje := 'El timbrado no est� activo';
            RETURN;
        END IF;
        
        -- Verificar si el punto ya est asignado a OTRO usuario activo
        SELECT COUNT(*) INTO v_existe
        FROM ODO_USUARIO_PUNTOS_EXPEDICION
        WHERE TIMBRADO_ID = p_timbrado_id 
          AND ACTIVO = 'S'
          AND USUARIO_ID <> p_usuario_id;
          
        IF v_existe > 0 THEN
            p_resultado := 0;
            p_mensaje := 'Este punto de expedicin ya est asignado a otro usuario activo. Desasgnelo primero.';
            RETURN;
        END IF;
        
        -- Verificar si ya existe la relacin (inactiva) para ESTE usuario
        SELECT COUNT(*) INTO v_existe
        FROM ODO_USUARIO_PUNTOS_EXPEDICION
        WHERE USUARIO_ID = p_usuario_id AND TIMBRADO_ID = p_timbrado_id;
        
        IF v_existe > 0 THEN
            -- Reactivar
            UPDATE ODO_USUARIO_PUNTOS_EXPEDICION
            SET ACTIVO = 'S', FECHA_MODIFICACION = SYSTIMESTAMP, MODIFICADO_POR = p_asignado_por
            WHERE USUARIO_ID = p_usuario_id AND TIMBRADO_ID = p_timbrado_id;
        ELSE
            -- Crear nueva asignacin
            INSERT INTO ODO_USUARIO_PUNTOS_EXPEDICION (
                USUARIO_ID, TIMBRADO_ID, ACTIVO, FECHA_ASIGNACION, ASIGNADO_POR
            ) VALUES (
                p_usuario_id, p_timbrado_id, 'S', SYSTIMESTAMP, p_asignado_por
            );
        END IF;
        
        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Punto de expedici�n asignado exitosamente';
        
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
        p_mensaje := 'Punto de expedición desactivado correctamente';
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
        p_mensaje := 'Puntos de expedición obtenidos exitosamente';
    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener puntos: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_punto_usuario;

    -- ========================================
    -- SECCI�N: FACTURAS
    -- ========================================
    
    PROCEDURE crear_factura(
        p_paciente_id           IN NUMBER,
        p_usuario_id            IN NUMBER,
        p_empresa_id            IN NUMBER,
        p_sucursal_id           IN NUMBER,
        p_tipo_factura          IN VARCHAR2 DEFAULT 'CONTADO',
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
        -- Obtener punto de expedici�n activo del usuario
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
                p_mensaje := 'El usuario no tiene un punto de expedici�n activo asignado';
                RETURN;
        END;
        
        -- Obtener datos del timbrado para validaci�n
        SELECT NUMERO_ACTUAL, NUMERO_FIN, FECHA_VENCIMIENTO
        INTO v_numero_actual, v_numero_fin, v_fecha_venc
        FROM ODO_TIMBRADOS
        WHERE TIMBRADO_ID = v_timbrado_id FOR UPDATE;
        
        -- Verificar que hay n�meros disponibles
        IF v_numero_actual > v_numero_fin THEN
            p_resultado := 0;
            p_mensaje := 'El timbrado no tiene n�meros disponibles';
            ROLLBACK;
            RETURN;
        END IF;
        
        -- Verificar vencimiento
        IF v_fecha_venc < SYSDATE THEN
            p_resultado := 0;
            p_mensaje := 'El timbrado est� vencido';
            ROLLBACK;
            RETURN;
        END IF;
        
        -- Obtener datos del paciente
        SELECT NOMBRE || ' ' || APELLIDO, DOCUMENTO_NUMERO, DOCUMENTO_TIPO
        INTO v_paciente_nombre, v_paciente_doc, v_paciente_doc_tipo
        FROM ODO_PACIENTES
        WHERE PACIENTE_ID = p_paciente_id;
        
        -- Formatear n�mero de factura
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
        
        -- Incrementar n�mero actual del timbrado
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
        -- Verificar estado de la factura
        SELECT ESTADO INTO v_estado 
        FROM ODO_FACTURAS 
        WHERE FACTURA_ID = p_factura_id;
        
        IF v_estado NOT IN ('BORRADOR', 'PENDIENTE') THEN
            p_resultado := 0;
            p_mensaje := 'No se puede modificar una factura con estado: ' || v_estado;
            RETURN;
        END IF;
        
        -- Calcular subtotal
        v_subtotal := (p_cantidad * p_precio_unitario) - p_descuento;
        
        -- Insertar detalle
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
        -- Calcular totales desde los detalles
        SELECT 
            NVL(SUM(CANTIDAD * PRECIO_UNITARIO), 0),
            NVL(SUM(DESCUENTO), 0)
        INTO v_subtotal, v_descuento
        FROM ODO_DETALLES_FACTURA
        WHERE FACTURA_ID = p_factura_id;
        
        v_total := v_subtotal - v_descuento;
        
        -- Actualizar factura
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
        v_tiene_cuotas NUMBER;
        v_tratamiento_diente_id NUMBER;
    BEGIN
        -- 1. Eliminar pagos asociados (si los hay)
        DELETE FROM ODO_PAGOS WHERE FACTURA_ID = p_factura_id;

        -- 2. Eliminar cuotas (si las hay) - ya no tienen razón de existir
        DELETE FROM ODO_CUOTAS_FACTURA WHERE FACTURA_ID = p_factura_id;

        -- 3. Liberar tratamientos facturados (marcar como no facturados)
        -- Los tratamientos se guardan en ODO_DETALLES_FACTURA con el campo TRATAMIENTO_DIENTE_ID
        UPDATE ODO_TRATAMIENTOS_DIENTE
        SET FACTURADO = 'N'
        WHERE TRATAMIENTO_DIENTE_ID IN (
            SELECT d.TRATAMIENTO_DIENTE_ID
            FROM ODO_DETALLES_FACTURA d
            WHERE d.FACTURA_ID = p_factura_id
            AND d.TRATAMIENTO_DIENTE_ID IS NOT NULL
        );

        -- 4. Anular factura
        UPDATE ODO_FACTURAS
        SET
            ESTADO = 'ANULADA',
            SALDO_PENDIENTE = 0,
            OBSERVACIONES = OBSERVACIONES || CHR(10) || 'ANULADA: ' || p_motivo || ' (Por: usuario #' || p_anulado_por || ' el ' || TO_CHAR(SYSTIMESTAMP, 'DD/MM/YYYY HH24:MI') || ')',
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_anulado_por
        WHERE FACTURA_ID = p_factura_id;

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Factura anulada exitosamente. Se eliminaron los pagos asociados y se liberaron los tratamientos facturados.';

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
        -- Contar total
        SELECT COUNT(*) INTO p_total
        FROM ODO_FACTURAS f
        WHERE f.EMPRESA_ID = p_empresa_id
          AND (p_estado IS NULL OR f.ESTADO = p_estado)
          AND (p_fecha_desde IS NULL OR TRUNC(f.FECHA_EMISION) >= p_fecha_desde)
          AND (p_fecha_hasta IS NULL OR TRUNC(f.FECHA_EMISION) <= p_fecha_hasta);
        
        -- Obtener p�gina
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
    -- SECCI�N: PAGOS
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
        v_numero_factura VARCHAR2(100);
        -- Variables para caja
        v_caja_cursor PKG_CAJA.t_cursor;
        v_caja_id NUMBER;
        v_caja_res NUMBER;
        v_caja_msg VARCHAR2(4000);
        v_mov_id NUMBER;
    BEGIN
        -- Obtener datos de la factura
        SELECT SALDO_PENDIENTE, TOTAL, PACIENTE_ID, EMPRESA_ID, ESTADO, NUMERO_FACTURA_COMPLETO
        INTO v_saldo_pendiente, v_total, v_paciente_id, v_empresa_id, v_nuevo_estado, v_numero_factura
        FROM ODO_FACTURAS
        WHERE FACTURA_ID = p_factura_id;
        
        -- Validar que no est anulada
        IF v_nuevo_estado = 'ANULADA' THEN
            p_resultado := 0;
            p_mensaje := 'No se puede registrar pago en factura anulada';
            RETURN;
        END IF;
        
        -- Validar monto
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
        
        -- Registrar pago
        INSERT INTO ODO_PAGOS (
            FACTURA_ID, PACIENTE_ID, EMPRESA_ID,
            FECHA_PAGO, MONTO, METODO_PAGO,
            REFERENCIA, BANCO, REGISTRADO_POR, FECHA_REGISTRO
        ) VALUES (
            p_factura_id, v_paciente_id, v_empresa_id,
            SYSTIMESTAMP, p_monto, p_metodo_pago,
            p_referencia, p_banco, p_registrado_por, SYSTIMESTAMP
        ) RETURNING PAGO_ID INTO p_pago_id;
        
        -- INTEGRACIÓN CON CAJA: Intentar registrar movimiento si el usuario tiene caja abierta
        BEGIN
            PKG_CAJA.get_caja_activa_usuario(v_empresa_id, p_registrado_por, v_caja_cursor, v_caja_res, v_caja_msg);
            
            IF v_caja_res = 1 THEN
                LOOP
                    FETCH v_caja_cursor INTO v_caja_id, v_empresa_id, v_caja_msg, v_caja_msg, v_caja_id, v_caja_msg, v_saldo_pendiente, v_saldo_pendiente, v_saldo_pendiente, v_saldo_pendiente, v_saldo_pendiente, v_nuevo_estado, v_caja_msg, v_caja_msg, v_caja_msg;
                    EXIT WHEN v_caja_cursor%NOTFOUND;
                    
                    PKG_CAJA.registrar_movimiento(
                        p_caja_id        => v_caja_id,
                        p_tipo           => 'INGRESO',
                        p_categoria_id   => NULL, -- Podríamos definir una categoría fija para cobros
                        p_concepto       => 'Cobro Factura ' || v_numero_factura,
                        p_monto          => p_monto,
                        p_referencia     => NVL(p_referencia, 'PAGO-' || p_pago_id),
                        p_factura_id     => p_factura_id,
                        p_registrado_por => p_registrado_por,
                        p_movimiento_id  => v_mov_id,
                        p_resultado      => v_caja_res,
                        p_mensaje        => v_caja_msg
                    );
                END LOOP;
                CLOSE v_caja_cursor;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                -- No bloqueamos el pago si falla el registro en caja, pero sería ideal loguearlo
                NULL;
        END;
        
        -- Calcular nuevo saldo
        v_nuevo_saldo := v_saldo_pendiente - p_monto;
        
        -- Determinar nuevo estado
        IF v_nuevo_saldo = 0 THEN
            v_nuevo_estado := 'PAGADA';
        ELSIF v_nuevo_saldo < v_total THEN
            v_nuevo_estado := 'PARCIAL';
        ELSE
            v_nuevo_estado := 'PENDIENTE';
        END IF;
        
        -- Actualizar factura
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
