from connect_db import get_connection

conn = get_connection()
cursor = conn.cursor()

print("="*60)
print("CREANDO ENDPOINTS ORDS PARA MÓDULO DE SEGURIDAD")
print("="*60)

try:
    # 1. GET /roles
    print("\n1. Creando endpoint GET /roles...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'roles');
            
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern => 'roles',
                p_method => 'GET',
                p_source_type => 'plsql/block',
                p_source => '
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT ROL_ID, NOMBRE, CODIGO, DESCRIPCION, ACTIVO
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
            
            COMMIT;
        END;
    """)
    print("✓ Endpoint GET /roles creado")

    # 2. GET /programas
    print("\n2. Creando endpoint GET /programas...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'programas');
            
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern => 'programas',
                p_method => 'GET',
                p_source_type => 'plsql/block',
                p_source => '
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT PROGRAMA_ID, NOMBRE, CODIGO, DESCRIPCION, RUTA_FRONTEND, ICONO, MODULO_PADRE_ID, ORDEN, ACTIVO
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
            
            COMMIT;
        END;
    """)
    print("✓ Endpoint GET /programas creado")

    # 3. GET /permisos
    print("\n3. Creando endpoint GET /permisos...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'permisos');
            
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern => 'permisos',
                p_method => 'GET',
                p_source_type => 'plsql/block',
                p_source => '
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT PERMISO_ID, NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID, ACTIVO
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
    """)
    print("✓ Endpoint GET /permisos creado")

    # 4. GET /usuarios/:id/programas
    print("\n4. Creando endpoint GET /usuarios/:id/programas...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'usuarios/:id/programas');
            
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern => 'usuarios/:id/programas',
                p_method => 'GET',
                p_source_type => 'plsql/block',
                p_source => '
DECLARE
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
            
            COMMIT;
        END;
    """)
    print("✓ Endpoint GET /usuarios/:id/programas creado")

    # 5. GET /usuarios/:id/permisos
    print("\n5. Creando endpoint GET /usuarios/:id/permisos...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'usuarios/:id/permisos');
            
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern => 'usuarios/:id/permisos',
                p_method => 'GET',
                p_source_type => 'plsql/block',
                p_source => '
DECLARE
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
            
            COMMIT;
        END;
    """)
    print("✓ Endpoint GET /usuarios/:id/permisos creado")

    # 6. PUT /usuarios/:id/rol
    print("\n6. Creando endpoint PUT /usuarios/:id/rol...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'usuarios/:id/rol');
            
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern => 'usuarios/:id/rol',
                p_method => 'PUT',
                p_source_type => 'plsql/block',
                p_source => '
DECLARE
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
            
            COMMIT;
        END;
    """)
    print("✓ Endpoint PUT /usuarios/:id/rol creado")

    conn.commit()
    print("\n" + "="*60)
    print("¡Endpoints ORDS creados exitosamente!")
    print("="*60)
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
    cursor.close()
    conn.close()
    exit(1)
