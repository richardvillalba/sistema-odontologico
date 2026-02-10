-- =============================================================================
-- SISTEMA DE CUOTAS PARA FACTURAS A CRÉDITO
-- =============================================================================

-- 1. Crear secuencia para cuotas
BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE SEQ_CUOTAS_FACTURA START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -955 THEN NULL; -- Ya existe
    ELSE RAISE;
    END IF;
END;
/

-- 2. Crear tabla de cuotas
BEGIN
    EXECUTE IMMEDIATE '
    CREATE TABLE ODO_CUOTAS_FACTURA (
        CUOTA_ID            NUMBER DEFAULT SEQ_CUOTAS_FACTURA.NEXTVAL PRIMARY KEY,
        FACTURA_ID          NUMBER NOT NULL REFERENCES ODO_FACTURAS(FACTURA_ID),
        NUMERO_CUOTA        NUMBER NOT NULL,
        MONTO_CUOTA         NUMBER(15,2) NOT NULL,
        MONTO_PAGADO        NUMBER(15,2) DEFAULT 0,
        SALDO_CUOTA         NUMBER(15,2) NOT NULL,
        FECHA_VENCIMIENTO   DATE NOT NULL,
        ESTADO              VARCHAR2(20) DEFAULT ''PENDIENTE'' CHECK (ESTADO IN (''PENDIENTE'', ''PARCIAL'', ''PAGADA'', ''VENCIDA'')),
        FECHA_PAGO          TIMESTAMP,
        OBSERVACIONES       VARCHAR2(500),
        FECHA_CREACION      TIMESTAMP DEFAULT SYSTIMESTAMP,
        FECHA_MODIFICACION  TIMESTAMP
    )';
    DBMS_OUTPUT.PUT_LINE('Tabla ODO_CUOTAS_FACTURA creada');
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE = -955 THEN
            DBMS_OUTPUT.PUT_LINE('Tabla ODO_CUOTAS_FACTURA ya existe');
        ELSE
            DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        END IF;
END;
/

-- 3. Crear índices
BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_CUOTAS_FACTURA ON ODO_CUOTAS_FACTURA(FACTURA_ID)';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE INDEX IDX_CUOTAS_VENCIMIENTO ON ODO_CUOTAS_FACTURA(FECHA_VENCIMIENTO, ESTADO)';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

-- 4. Agregar columnas a ODO_FACTURAS para configuración de cuotas
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE ODO_FACTURAS ADD CANTIDAD_CUOTAS NUMBER DEFAULT 0';
    DBMS_OUTPUT.PUT_LINE('Columna CANTIDAD_CUOTAS agregada');
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1430 THEN DBMS_OUTPUT.PUT_LINE('CANTIDAD_CUOTAS ya existe');
    ELSE DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
    END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE ODO_FACTURAS ADD FRECUENCIA_CUOTAS VARCHAR2(20) DEFAULT ''MENSUAL''';
    DBMS_OUTPUT.PUT_LINE('Columna FRECUENCIA_CUOTAS agregada');
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1430 THEN DBMS_OUTPUT.PUT_LINE('FRECUENCIA_CUOTAS ya existe');
    ELSE DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
    END IF;
END;
/

-- 5. Agregar CUOTA_ID a ODO_PAGOS para vincular pagos con cuotas
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE ODO_PAGOS ADD CUOTA_ID NUMBER REFERENCES ODO_CUOTAS_FACTURA(CUOTA_ID)';
    DBMS_OUTPUT.PUT_LINE('Columna CUOTA_ID agregada a ODO_PAGOS');
EXCEPTION WHEN OTHERS THEN
    IF SQLCODE = -1430 THEN DBMS_OUTPUT.PUT_LINE('CUOTA_ID ya existe en ODO_PAGOS');
    ELSE DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
    END IF;
END;
/

COMMIT;

-- =============================================================================
-- PROCEDIMIENTOS PARA GESTIÓN DE CUOTAS
-- =============================================================================

-- 6. Procedimiento para generar cuotas de una factura
CREATE OR REPLACE PROCEDURE SP_GENERAR_CUOTAS(
    p_factura_id        IN NUMBER,
    p_cantidad_cuotas   IN NUMBER,
    p_frecuencia        IN VARCHAR2, -- SEMANAL, QUINCENAL, MENSUAL, PERSONALIZADO
    p_fecha_primera     IN DATE DEFAULT NULL, -- Si es NULL, usa fecha actual
    p_resultado         OUT NUMBER,
    p_mensaje           OUT VARCHAR2
) IS
    v_total_factura NUMBER;
    v_monto_cuota NUMBER;
    v_fecha_venc DATE;
    v_dias_intervalo NUMBER;
    v_condicion VARCHAR2(20);
BEGIN
    -- Validar factura existe y es a crédito
    SELECT TOTAL, CONDICION_OPERACION
    INTO v_total_factura, v_condicion
    FROM ODO_FACTURAS
    WHERE FACTURA_ID = p_factura_id;

    IF v_condicion != 'CREDITO' THEN
        p_resultado := 0;
        p_mensaje := 'Solo se pueden generar cuotas para facturas a crédito';
        RETURN;
    END IF;

    IF v_total_factura <= 0 THEN
        p_resultado := 0;
        p_mensaje := 'La factura no tiene monto para generar cuotas';
        RETURN;
    END IF;

    IF p_cantidad_cuotas < 1 OR p_cantidad_cuotas > 24 THEN
        p_resultado := 0;
        p_mensaje := 'La cantidad de cuotas debe estar entre 1 y 24';
        RETURN;
    END IF;

    -- Eliminar cuotas existentes si las hay (solo si no tienen pagos)
    DELETE FROM ODO_CUOTAS_FACTURA
    WHERE FACTURA_ID = p_factura_id
    AND MONTO_PAGADO = 0;

    -- Calcular monto por cuota (redondear hacia arriba para evitar centavos perdidos)
    v_monto_cuota := CEIL(v_total_factura / p_cantidad_cuotas);

    -- Determinar intervalo según frecuencia
    CASE p_frecuencia
        WHEN 'SEMANAL' THEN v_dias_intervalo := 7;
        WHEN 'QUINCENAL' THEN v_dias_intervalo := 15;
        WHEN 'MENSUAL' THEN v_dias_intervalo := 30;
        ELSE v_dias_intervalo := 30; -- Default mensual
    END CASE;

    -- Fecha de primera cuota
    v_fecha_venc := NVL(p_fecha_primera, TRUNC(SYSDATE));

    -- Generar cuotas
    FOR i IN 1..p_cantidad_cuotas LOOP
        -- Última cuota ajusta el monto para que cuadre exactamente
        IF i = p_cantidad_cuotas THEN
            v_monto_cuota := v_total_factura - (v_monto_cuota * (p_cantidad_cuotas - 1));
        END IF;

        INSERT INTO ODO_CUOTAS_FACTURA (
            FACTURA_ID, NUMERO_CUOTA, MONTO_CUOTA, MONTO_PAGADO,
            SALDO_CUOTA, FECHA_VENCIMIENTO, ESTADO
        ) VALUES (
            p_factura_id, i, v_monto_cuota, 0,
            v_monto_cuota, v_fecha_venc, 'PENDIENTE'
        );

        -- Calcular siguiente fecha de vencimiento
        IF p_frecuencia = 'MENSUAL' THEN
            v_fecha_venc := ADD_MONTHS(NVL(p_fecha_primera, TRUNC(SYSDATE)), i);
        ELSE
            v_fecha_venc := v_fecha_venc + v_dias_intervalo;
        END IF;
    END LOOP;

    -- Actualizar factura con configuración de cuotas
    UPDATE ODO_FACTURAS
    SET CANTIDAD_CUOTAS = p_cantidad_cuotas,
        FRECUENCIA_CUOTAS = p_frecuencia
    WHERE FACTURA_ID = p_factura_id;

    COMMIT;
    p_resultado := 1;
    p_mensaje := 'Se generaron ' || p_cantidad_cuotas || ' cuotas exitosamente';

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_resultado := 0;
        p_mensaje := 'Factura no encontrada';
    WHEN OTHERS THEN
        ROLLBACK;
        p_resultado := 0;
        p_mensaje := 'Error al generar cuotas: ' || SQLERRM;
END SP_GENERAR_CUOTAS;
/

-- 7. Procedimiento para registrar pago a una cuota específica
CREATE OR REPLACE PROCEDURE SP_PAGAR_CUOTA(
    p_cuota_id          IN NUMBER,
    p_monto             IN NUMBER,
    p_metodo_pago       IN VARCHAR2,
    p_referencia        IN VARCHAR2 DEFAULT NULL,
    p_banco             IN VARCHAR2 DEFAULT NULL,
    p_registrado_por    IN NUMBER,
    p_pago_id           OUT NUMBER,
    p_resultado         OUT NUMBER,
    p_mensaje           OUT VARCHAR2
) IS
    v_factura_id NUMBER;
    v_saldo_cuota NUMBER;
    v_paciente_id NUMBER;
    v_empresa_id NUMBER;
    v_nuevo_saldo_cuota NUMBER;
    v_nuevo_estado_cuota VARCHAR2(20);
    v_total_pagado_factura NUMBER;
    v_total_factura NUMBER;
    v_nuevo_estado_factura VARCHAR2(20);
BEGIN
    -- Obtener datos de la cuota
    SELECT c.FACTURA_ID, c.SALDO_CUOTA, f.PACIENTE_ID, f.EMPRESA_ID, f.TOTAL
    INTO v_factura_id, v_saldo_cuota, v_paciente_id, v_empresa_id, v_total_factura
    FROM ODO_CUOTAS_FACTURA c
    JOIN ODO_FACTURAS f ON c.FACTURA_ID = f.FACTURA_ID
    WHERE c.CUOTA_ID = p_cuota_id;

    IF p_monto <= 0 THEN
        p_resultado := 0;
        p_mensaje := 'El monto debe ser mayor a cero';
        RETURN;
    END IF;

    IF p_monto > v_saldo_cuota THEN
        p_resultado := 0;
        p_mensaje := 'El monto excede el saldo de la cuota (' || v_saldo_cuota || ')';
        RETURN;
    END IF;

    -- Registrar el pago
    INSERT INTO ODO_PAGOS (
        FACTURA_ID, CUOTA_ID, PACIENTE_ID, EMPRESA_ID,
        FECHA_PAGO, MONTO, METODO_PAGO,
        REFERENCIA, BANCO, REGISTRADO_POR, FECHA_REGISTRO
    ) VALUES (
        v_factura_id, p_cuota_id, v_paciente_id, v_empresa_id,
        SYSTIMESTAMP, p_monto, p_metodo_pago,
        p_referencia, p_banco, p_registrado_por, SYSTIMESTAMP
    ) RETURNING PAGO_ID INTO p_pago_id;

    -- Actualizar cuota
    v_nuevo_saldo_cuota := v_saldo_cuota - p_monto;

    IF v_nuevo_saldo_cuota = 0 THEN
        v_nuevo_estado_cuota := 'PAGADA';
    ELSE
        v_nuevo_estado_cuota := 'PARCIAL';
    END IF;

    UPDATE ODO_CUOTAS_FACTURA
    SET MONTO_PAGADO = MONTO_PAGADO + p_monto,
        SALDO_CUOTA = v_nuevo_saldo_cuota,
        ESTADO = v_nuevo_estado_cuota,
        FECHA_PAGO = CASE WHEN v_nuevo_saldo_cuota = 0 THEN SYSTIMESTAMP ELSE FECHA_PAGO END,
        FECHA_MODIFICACION = SYSTIMESTAMP
    WHERE CUOTA_ID = p_cuota_id;

    -- Actualizar saldo de la factura
    SELECT NVL(SUM(MONTO), 0) INTO v_total_pagado_factura
    FROM ODO_PAGOS WHERE FACTURA_ID = v_factura_id;

    IF v_total_pagado_factura >= v_total_factura THEN
        v_nuevo_estado_factura := 'PAGADA';
    ELSIF v_total_pagado_factura > 0 THEN
        v_nuevo_estado_factura := 'PARCIAL';
    ELSE
        v_nuevo_estado_factura := 'PENDIENTE';
    END IF;

    UPDATE ODO_FACTURAS
    SET SALDO_PENDIENTE = v_total_factura - v_total_pagado_factura,
        ESTADO = v_nuevo_estado_factura
    WHERE FACTURA_ID = v_factura_id;

    COMMIT;
    p_resultado := 1;
    p_mensaje := 'Pago registrado. Saldo cuota: ' || v_nuevo_saldo_cuota;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_resultado := 0;
        p_mensaje := 'Cuota no encontrada';
    WHEN OTHERS THEN
        ROLLBACK;
        p_resultado := 0;
        p_mensaje := 'Error al registrar pago: ' || SQLERRM;
END SP_PAGAR_CUOTA;
/

-- 8. Procedimiento para obtener cuotas de una factura
CREATE OR REPLACE PROCEDURE SP_GET_CUOTAS_FACTURA(
    p_factura_id    IN NUMBER,
    p_cursor        OUT SYS_REFCURSOR,
    p_resultado     OUT NUMBER,
    p_mensaje       OUT VARCHAR2
) IS
BEGIN
    OPEN p_cursor FOR
        SELECT
            c.CUOTA_ID,
            c.FACTURA_ID,
            c.NUMERO_CUOTA,
            c.MONTO_CUOTA,
            c.MONTO_PAGADO,
            c.SALDO_CUOTA,
            c.FECHA_VENCIMIENTO,
            c.ESTADO,
            c.FECHA_PAGO,
            c.OBSERVACIONES,
            CASE
                WHEN c.ESTADO != 'PAGADA' AND c.FECHA_VENCIMIENTO < TRUNC(SYSDATE) THEN 'S'
                ELSE 'N'
            END AS VENCIDA,
            TRUNC(c.FECHA_VENCIMIENTO - SYSDATE) AS DIAS_PARA_VENCER
        FROM ODO_CUOTAS_FACTURA c
        WHERE c.FACTURA_ID = p_factura_id
        ORDER BY c.NUMERO_CUOTA;

    p_resultado := 1;
    p_mensaje := 'Cuotas obtenidas';

EXCEPTION
    WHEN OTHERS THEN
        p_resultado := 0;
        p_mensaje := 'Error: ' || SQLERRM;
        OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
END SP_GET_CUOTAS_FACTURA;
/

-- 9. Procedimiento para actualizar estados de cuotas vencidas (ejecutar diariamente)
CREATE OR REPLACE PROCEDURE SP_ACTUALIZAR_CUOTAS_VENCIDAS IS
    v_count NUMBER := 0;
BEGIN
    UPDATE ODO_CUOTAS_FACTURA
    SET ESTADO = 'VENCIDA',
        FECHA_MODIFICACION = SYSTIMESTAMP
    WHERE ESTADO IN ('PENDIENTE', 'PARCIAL')
    AND FECHA_VENCIMIENTO < TRUNC(SYSDATE);

    v_count := SQL%ROWCOUNT;
    COMMIT;

    DBMS_OUTPUT.PUT_LINE('Cuotas marcadas como vencidas: ' || v_count);
END SP_ACTUALIZAR_CUOTAS_VENCIDAS;
/

-- =============================================================================
-- ENDPOINTS ORDS PARA CUOTAS
-- =============================================================================

-- 9.1 Asegurar que existen los templates necesarios
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id/cuotas'
    );
    COMMIT;
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'cuota/:cuota_id/pago'
    );
    COMMIT;
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'facturas',
        p_pattern     => 'cuotas/alertas'
    );
    COMMIT;
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

-- 10. Endpoint GET - Obtener cuotas de una factura
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name    => 'facturas',
        p_pattern        => 'factura/:id/cuotas',
        p_method         => 'GET',
        p_source_type    => 'plsql/block',
        p_source         => q'[
DECLARE
    v_cursor SYS_REFCURSOR;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    SP_GET_CUOTAS_FACTURA(
        p_factura_id => :id,
        p_cursor => v_cursor,
        p_resultado => v_resultado,
        p_mensaje => v_mensaje
    );

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;

    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
EXCEPTION
    WHEN OTHERS THEN
        APEX_JSON.initialize_clob_output;
        APEX_JSON.open_object;
        APEX_JSON.write('resultado', 0);
        APEX_JSON.write('mensaje', 'Error: ' || SQLERRM);
        APEX_JSON.open_array('items');
        APEX_JSON.close_array;
        APEX_JSON.close_object;
        :status := 200;
        :content_type := 'application/json';
        htp.p(APEX_JSON.get_clob_output);
        APEX_JSON.free_output;
END;
        ]'
    );
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Endpoint GET cuotas creado');
END;
/

-- 11. Endpoint POST - Generar cuotas para una factura
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name    => 'facturas',
        p_pattern        => 'factura/:id/cuotas',
        p_method         => 'POST',
        p_source_type    => 'plsql/block',
        p_source         => q'[
DECLARE
    v_body CLOB;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
    v_fecha_primera DATE;
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    -- Convertir fecha si viene
    BEGIN
        v_fecha_primera := TO_DATE(APEX_JSON.get_varchar2('fecha_primera'), 'YYYY-MM-DD');
    EXCEPTION WHEN OTHERS THEN
        v_fecha_primera := NULL;
    END;

    SP_GENERAR_CUOTAS(
        p_factura_id => :id,
        p_cantidad_cuotas => APEX_JSON.get_number('cantidad_cuotas'),
        p_frecuencia => NVL(APEX_JSON.get_varchar2('frecuencia'), 'MENSUAL'),
        p_fecha_primera => v_fecha_primera,
        p_resultado => v_resultado,
        p_mensaje => v_mensaje
    );

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.close_object;

    :status := CASE WHEN v_resultado = 1 THEN 201 ELSE 400 END;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Endpoint POST generar cuotas creado');
END;
/

-- 12. Endpoint POST - Pagar una cuota específica
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name    => 'facturas',
        p_pattern        => 'cuota/:cuota_id/pago',
        p_method         => 'POST',
        p_source_type    => 'plsql/block',
        p_source         => q'[
DECLARE
    v_body CLOB;
    v_pago_id NUMBER;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    SP_PAGAR_CUOTA(
        p_cuota_id => :cuota_id,
        p_monto => APEX_JSON.get_number('monto'),
        p_metodo_pago => APEX_JSON.get_varchar2('metodo_pago'),
        p_referencia => APEX_JSON.get_varchar2('referencia'),
        p_banco => APEX_JSON.get_varchar2('banco'),
        p_registrado_por => NVL(APEX_JSON.get_number('registrado_por'), 1),
        p_pago_id => v_pago_id,
        p_resultado => v_resultado,
        p_mensaje => v_mensaje
    );

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('pago_id', v_pago_id);
    APEX_JSON.close_object;

    :status := CASE WHEN v_resultado = 1 THEN 201 ELSE 400 END;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Endpoint POST pagar cuota creado');
END;
/

-- 13. Endpoint GET - Obtener cuotas vencidas/próximas a vencer (para alertas)
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name    => 'facturas',
        p_pattern        => 'cuotas/alertas',
        p_method         => 'GET',
        p_source_type    => 'plsql/block',
        p_source         => q'[
DECLARE
    v_cursor SYS_REFCURSOR;
    v_dias_alerta NUMBER := NVL(:dias_alerta, 7);
    v_empresa_id NUMBER := :empresa_id;
BEGIN
    OPEN v_cursor FOR
        SELECT
            c.CUOTA_ID,
            c.FACTURA_ID,
            f.NUMERO_FACTURA_COMPLETO,
            f.NOMBRE_CLIENTE,
            c.NUMERO_CUOTA,
            c.MONTO_CUOTA,
            c.SALDO_CUOTA,
            c.FECHA_VENCIMIENTO,
            c.ESTADO,
            TRUNC(c.FECHA_VENCIMIENTO - SYSDATE) AS DIAS_PARA_VENCER,
            CASE
                WHEN c.FECHA_VENCIMIENTO < TRUNC(SYSDATE) THEN 'VENCIDA'
                WHEN c.FECHA_VENCIMIENTO <= TRUNC(SYSDATE) + 7 THEN 'PROXIMA'
                ELSE 'OK'
            END AS TIPO_ALERTA
        FROM ODO_CUOTAS_FACTURA c
        JOIN ODO_FACTURAS f ON c.FACTURA_ID = f.FACTURA_ID
        WHERE c.ESTADO IN ('PENDIENTE', 'PARCIAL', 'VENCIDA')
        AND c.FECHA_VENCIMIENTO <= TRUNC(SYSDATE) + v_dias_alerta
        AND (v_empresa_id IS NULL OR f.EMPRESA_ID = v_empresa_id)
        ORDER BY c.FECHA_VENCIMIENTO ASC;

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', 1);
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;

    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
EXCEPTION
    WHEN OTHERS THEN
        APEX_JSON.initialize_clob_output;
        APEX_JSON.open_object;
        APEX_JSON.write('resultado', 0);
        APEX_JSON.write('mensaje', SQLERRM);
        APEX_JSON.write('items', CAST(NULL AS SYS_REFCURSOR));
        APEX_JSON.close_object;
        :status := 500;
        :content_type := 'application/json';
        htp.p(APEX_JSON.get_clob_output);
        APEX_JSON.free_output;
END;
        ]'
    );
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Endpoint GET alertas cuotas creado');
END;
/

COMMIT;

-- =============================================================================
-- FIN - SISTEMA DE CUOTAS
-- =============================================================================
