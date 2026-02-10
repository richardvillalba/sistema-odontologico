CREATE OR REPLACE PACKAGE BODY PKG_FACTURAS AS

    -- ========================================
    -- SECCIÓN: TIMBRADOS
    -- ========================================
    
    -- Crear nuevo timbrado
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
        -- Validaciones
        IF p_numero_fin <= p_numero_inicio THEN
            p_resultado := 0;
            p_mensaje := 'El número final debe ser mayor al número inicial';
            RETURN;
        END IF;
        
        IF p_fecha_vencimiento <= p_fecha_inicio THEN
            p_resultado := 0;
            p_mensaje := 'La fecha de vencimiento debe ser posterior a la fecha de inicio';
            RETURN;
        END IF;
        
        -- Verificar que no exista otro timbrado activo con mismo establecimiento y punto
        SELECT COUNT(*) INTO v_existe
        FROM ODO_TIMBRADOS
        WHERE EMPRESA_ID = p_empresa_id
          AND ESTABLECIMIENTO = p_establecimiento
          AND PUNTO_EXPEDICION = p_punto_expedicion
          AND TIPO_DOCUMENTO = p_tipo_documento
          AND ACTIVO = 'S';
          
        IF v_existe > 0 THEN
            p_resultado := 0;
            p_mensaje := 'Ya existe un timbrado activo para este establecimiento y punto de expedición';
            RETURN;
        END IF;
        
        -- Insertar timbrado
        INSERT INTO ODO_TIMBRADOS (
            EMPRESA_ID,
            NUMERO_TIMBRADO,
            ESTABLECIMIENTO,
            PUNTO_EXPEDICION,
            TIPO_DOCUMENTO,
            NUMERO_INICIO,
            NUMERO_FIN,
            NUMERO_ACTUAL,
            FECHA_INICIO,
            FECHA_VENCIMIENTO,
            ACTIVO,
            FECHA_CREACION,
            CREADO_POR
        ) VALUES (
            p_empresa_id,
            p_numero_timbrado,
            p_establecimiento,
            p_punto_expedicion,
            NVL(p_tipo_documento, 'FACTURA'),
            p_numero_inicio,
            p_numero_fin,
            p_numero_inicio, -- Empieza en el primer número
            p_fecha_inicio,
            p_fecha_vencimiento,
            'S',
            SYSTIMESTAMP,
            p_creado_por
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
    
    -- Actualizar timbrado
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
        -- Verificar que existe
        SELECT COUNT(*) INTO v_existe
        FROM ODO_TIMBRADOS
        WHERE TIMBRADO_ID = p_timbrado_id;
        
        IF v_existe = 0 THEN
            p_resultado := 0;
            p_mensaje := 'Timbrado no encontrado';
            RETURN;
        END IF;
        
        -- Actualizar solo campos permitidos
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
    
    -- Activar/Desactivar timbrado
    PROCEDURE cambiar_estado_timbrado(
        p_timbrado_id    IN NUMBER,
        p_activo         IN CHAR,
        p_modificado_por IN NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    ) IS
        v_existe NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_existe
        FROM ODO_TIMBRADOS
        WHERE TIMBRADO_ID = p_timbrado_id;
        
        IF v_existe = 0 THEN
            p_resultado := 0;
            p_mensaje := 'Timbrado no encontrado';
            RETURN;
        END IF;
        
        UPDATE ODO_TIMBRADOS
        SET 
            ACTIVO = p_activo,
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_modificado_por
        WHERE TIMBRADO_ID = p_timbrado_id;
        
        COMMIT;
        
        p_resultado := 1;
        p_mensaje := 'Estado del timbrado actualizado';
        
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al cambiar estado: ' || SQLERRM;
    END cambiar_estado_timbrado;
    
    -- Obtener timbrados por empresa
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
                t.TIMBRADO_ID,
                t.EMPRESA_ID,
                t.NUMERO_TIMBRADO,
                t.ESTABLECIMIENTO,
                t.PUNTO_EXPEDICION,
                t.TIPO_DOCUMENTO,
                t.NUMERO_INICIO,
                t.NUMERO_FIN,
                t.NUMERO_ACTUAL,
                (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) AS NUMEROS_DISPONIBLES,
                t.FECHA_INICIO,
                t.FECHA_VENCIMIENTO,
                TRUNC(t.FECHA_VENCIMIENTO - SYSDATE) AS DIAS_PARA_VENCER,
                t.ACTIVO,
                t.FECHA_CREACION,
                u.NOMBRE || ' ' || u.APELLIDO AS CREADO_POR_NOMBRE
            FROM ODO_TIMBRADOS t
            LEFT JOIN ODO_USUARIOS u ON t.CREADO_POR = u.USUARIO_ID
            WHERE t.EMPRESA_ID = p_empresa_id
              AND (p_activo IS NULL OR t.ACTIVO = p_activo)
            ORDER BY t.FECHA_CREACION DESC;
            
        p_resultado := 1;
        p_mensaje := 'Timbrados obtenidos exitosamente';
        
    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener timbrados: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_timbrados_empresa;
    
    -- Obtener timbrado específico
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
    
    -- Verificar alertas de timbrados
    PROCEDURE verificar_alertas_timbrados(
        p_empresa_id     IN NUMBER,
        p_dias_alerta    IN NUMBER DEFAULT 30,
        p_margen_numeros IN NUMBER DEFAULT 100,
        p_cursor         OUT t_cursor,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT 
                t.TIMBRADO_ID,
                t.NUMERO_TIMBRADO,
                t.ESTABLECIMIENTO,
                t.PUNTO_EXPEDICION,
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
            WHERE t.EMPRESA_ID = p_empresa_id
              AND t.ACTIVO = 'S'
              AND (
                  t.FECHA_VENCIMIENTO <= SYSDATE + p_dias_alerta
                  OR (t.NUMERO_FIN - t.NUMERO_ACTUAL + 1) <= p_margen_numeros
              )
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

END PKG_FACTURAS;
/
