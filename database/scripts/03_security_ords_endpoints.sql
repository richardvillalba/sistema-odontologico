-- ========================================
-- ORDS ENDPOINTS - MÓDULO DE SEGURIDAD
-- ========================================
-- Endpoints para gestión de roles, programas y permisos

BEGIN
    -- ========================================
    -- 1. GET /usuarios/:id/programas
    -- ========================================
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'usuarios/:id/programas');

    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern => 'usuarios/:id/programas',
        p_method => 'GET',
        p_source_type => 'plsql/block',
        p_source => 'DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    PKG_SEGURIDAD.GET_PROGRAMAS_USUARIO(:id, v_cursor);

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''items'', v_cursor);
    APEX_JSON.close_object;

    :status := 200;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
    );

    -- ========================================
    -- 2. GET /usuarios/:id/permisos
    -- ========================================
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'usuarios/:id/permisos');

    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern => 'usuarios/:id/permisos',
        p_method => 'GET',
        p_source_type => 'plsql/block',
        p_source => 'DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    PKG_SEGURIDAD.GET_PERMISOS_USUARIO(:id, v_cursor);

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''items'', v_cursor);
    APEX_JSON.close_object;

    :status := 200;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
    );

    -- ========================================
    -- 3. GET /usuarios/:id/tiene-permiso/:codigo
    -- ========================================
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'usuarios/:id/tiene-permiso/:codigo');

    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern => 'usuarios/:id/tiene-permiso/:codigo',
        p_method => 'GET',
        p_source_type => 'plsql/block',
        p_source => 'DECLARE
    v_tiene_permiso CHAR(1);
BEGIN
    v_tiene_permiso := PKG_SEGURIDAD.TIENE_PERMISO(:id, :codigo);

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''tiene_permiso'', v_tiene_permiso = ''S'');
    APEX_JSON.write(''codigo_permiso'', :codigo);
    APEX_JSON.close_object;

    :status := 200;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
    );

    -- ========================================
    -- 4. GET /roles
    -- ========================================
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'roles');

    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern => 'roles',
        p_method => 'GET',
        p_source_type => 'plsql/block',
        p_source => 'DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT
            ROL_ID,
            NOMBRE,
            CODIGO,
            DESCRIPCION,
            ACTIVO
        FROM ODO_ROLES
        WHERE ACTIVO = ''S''
        ORDER BY NOMBRE;

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''items'', v_cursor);
    APEX_JSON.close_object;

    :status := 200;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
    );

    -- ========================================
    -- 5. PUT /usuarios/:id/rol
    -- ========================================
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'usuarios/:id/rol');

    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern => 'usuarios/:id/rol',
        p_method => 'PUT',
        p_source_type => 'plsql/block',
        p_source => 'DECLARE
    v_body CLOB;
    v_rol_id NUMBER;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    v_rol_id := APEX_JSON.get_number(''rol_id'');

    PKG_SEGURIDAD.ASIGNAR_ROL_USUARIO(
        p_usuario_id => :id,
        p_rol_id => v_rol_id,
        p_asignado_por => NVL(APEX_JSON.get_number(''asignado_por''), 1),
        p_resultado => v_resultado,
        p_mensaje => v_mensaje
    );

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''resultado'', v_resultado);
    APEX_JSON.write(''mensaje'', v_mensaje);
    APEX_JSON.close_object;

    :status := CASE WHEN v_resultado = 1 THEN 200 ELSE 400 END;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
    );

    -- ========================================
    -- 6. GET /programas
    -- ========================================
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'programas');

    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern => 'programas',
        p_method => 'GET',
        p_source_type => 'plsql/block',
        p_source => 'DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT
            PROGRAMA_ID,
            NOMBRE,
            CODIGO,
            DESCRIPCION,
            RUTA_FRONTEND,
            ICONO,
            MODULO_PADRE_ID,
            ORDEN,
            ACTIVO
        FROM ODO_PROGRAMAS
        WHERE ACTIVO = ''S''
        ORDER BY ORDEN, NOMBRE;

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''items'', v_cursor);
    APEX_JSON.close_object;

    :status := 200;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
    );

    -- ========================================
    -- 7. GET /permisos
    -- ========================================
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'permisos');

    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern => 'permisos',
        p_method => 'GET',
        p_source_type => 'plsql/block',
        p_source => 'DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT
            PERMISO_ID,
            NOMBRE,
            CODIGO,
            DESCRIPCION,
            PROGRAMA_ID,
            ACTIVO
        FROM ODO_PERMISOS
        WHERE ACTIVO = ''S''
        ORDER BY NOMBRE;

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''items'', v_cursor);
    APEX_JSON.close_object;

    :status := 200;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
    );

    COMMIT;
END;
/
