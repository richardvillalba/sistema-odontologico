-- 1. Agregar columna FACTURADO a ODO_TRATAMIENTOS_DIENTE si no existe
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM USER_TAB_COLUMNS
    WHERE TABLE_NAME = 'ODO_TRATAMIENTOS_DIENTE'
    AND COLUMN_NAME = 'FACTURADO';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE ODO_TRATAMIENTOS_DIENTE ADD FACTURADO CHAR(1) DEFAULT ''N'' CHECK (FACTURADO IN (''S'', ''N''))';
        DBMS_OUTPUT.PUT_LINE('Columna FACTURADO agregada a ODO_TRATAMIENTOS_DIENTE');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Columna FACTURADO ya existe');
    END IF;
END;
/

-- 2. Agregar columna TRATAMIENTO_DIENTE_ID a ODO_DETALLES_FACTURA si no existe
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM USER_TAB_COLUMNS
    WHERE TABLE_NAME = 'ODO_DETALLES_FACTURA'
    AND COLUMN_NAME = 'TRATAMIENTO_DIENTE_ID';

    IF v_count = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE ODO_DETALLES_FACTURA ADD TRATAMIENTO_DIENTE_ID NUMBER REFERENCES ODO_TRATAMIENTOS_DIENTE(TRATAMIENTO_DIENTE_ID)';
        DBMS_OUTPUT.PUT_LINE('Columna TRATAMIENTO_DIENTE_ID agregada a ODO_DETALLES_FACTURA');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Columna TRATAMIENTO_DIENTE_ID ya existe');
    END IF;
END;
/

-- 3. Actualizar endpoint para traer solo tratamientos NO facturados
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name    => 'odontologia',
        p_pattern        => 'odontograma/tratamientos/paciente/:id',
        p_method         => 'GET',
        p_source_type    => 'json/query',
        p_source         => 'SELECT td.TRATAMIENTO_DIENTE_ID as ID, td.DIENTE_ID, d.NUMERO_FDI, td.TIPO_TRATAMIENTO, td.TIPO_TRATAMIENTO as NOMBRE, td.DESCRIPCION, td.COSTO, ''PENDIENTE'' as ESTADO, td.FECHA_TRATAMIENTO as FECHA_ASIGNACION, u.NOMBRE || '' '' || u.APELLIDO as DOCTOR_NOMBRE FROM ODO_TRATAMIENTOS_DIENTE td JOIN ODO_DIENTES d ON td.DIENTE_ID = d.DIENTE_ID JOIN ODO_ODONTOGRAMAS o ON d.ODONTOGRAMA_ID = o.ODONTOGRAMA_ID LEFT JOIN ODO_USUARIOS u ON td.DOCTOR_ID = u.USUARIO_ID WHERE o.PACIENTE_ID = :id AND NVL(td.FACTURADO, ''N'') = ''N'' ORDER BY td.FECHA_TRATAMIENTO DESC'
    );
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Endpoint actualizado para filtrar tratamientos facturados');
END;
/

-- 4. Actualizar endpoint de agregar detalle para recibir tratamiento_diente_id y marcarlo como facturado
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern => 'factura/:id/detalles',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => q'[
DECLARE
    v_body CLOB;
    v_detalle_id NUMBER;
    v_tratamiento_diente_id NUMBER;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    v_tratamiento_diente_id := APEX_JSON.get_number('tratamiento_diente_id');

    PKG_FACTURAS.agregar_detalle_factura(
        p_factura_id            => :id,
        p_tratamiento_paciente_id => APEX_JSON.get_number('tratamiento_paciente_id'),
        p_descripcion           => APEX_JSON.get_varchar2('descripcion'),
        p_cantidad              => APEX_JSON.get_number('cantidad'),
        p_precio_unitario       => APEX_JSON.get_number('precio_unitario'),
        p_descuento             => NVL(APEX_JSON.get_number('descuento'), 0),
        p_detalle_id            => v_detalle_id,
        p_resultado             => v_resultado,
        p_mensaje               => v_mensaje
    );

    -- Si hay tratamiento_diente_id, marcarlo como facturado y guardarlo en el detalle
    IF v_resultado = 1 AND v_tratamiento_diente_id IS NOT NULL THEN
        UPDATE ODO_TRATAMIENTOS_DIENTE
        SET FACTURADO = 'S'
        WHERE TRATAMIENTO_DIENTE_ID = v_tratamiento_diente_id;

        UPDATE ODO_DETALLES_FACTURA
        SET TRATAMIENTO_DIENTE_ID = v_tratamiento_diente_id
        WHERE DETALLE_ID = v_detalle_id;

        COMMIT;
    END IF;

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('detalle_id', v_detalle_id);
    APEX_JSON.close_object;
    :status := CASE WHEN v_resultado = 1 THEN 201 ELSE 400 END;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Endpoint de detalles actualizado para marcar tratamientos como facturados');
END;
/
