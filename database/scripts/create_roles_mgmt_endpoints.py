from connect_db import get_connection

conn = get_connection()
cursor = conn.cursor()

print("="*60)
print("CREANDO ENDPOINTS PARA GESTIÓN COMPLETA DE ROLES")
print("="*60)

try:
    # 1. POST /roles (Crear Rol)
    print("\n1. Creando endpoint POST /facturas/roles (Crear)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'roles');
            
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern => 'roles',
                p_method => 'POST',
                p_source_type => 'plsql/block',
                p_source => '
DECLARE
    v_body CLOB;
    v_nombre VARCHAR2(100);
    v_codigo VARCHAR2(50);
    v_descr VARCHAR2(500);
    v_rol_id NUMBER;
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
    v_nombre := APEX_JSON.get_varchar2(''nombre'');
    v_codigo := APEX_JSON.get_varchar2(''codigo'');
    v_descr := APEX_JSON.get_varchar2(''descripcion'');

    INSERT INTO ODO_ROLES (NOMBRE, CODIGO, DESCRIPCION, ACTIVO)
    VALUES (v_nombre, v_codigo, v_descr, ''S'')
    RETURNING ROL_ID INTO v_rol_id;

    COMMIT;

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''rol_id'', v_rol_id);
    APEX_JSON.write(''mensaje'', ''Rol creado correctamente'');
    APEX_JSON.close_object;

    :status := 201;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
            );
            COMMIT;
        END;
    """)

    # 2. GET /roles/:id/programas
    print("\n2. Creando endpoint GET /facturas/roles/:id/programas...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'roles/:id/programas');
            
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern => 'roles/:id/programas',
                p_method => 'GET',
                p_source_type => 'plsql/block',
                p_source => '
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT p.PROGRAMA_ID, p.NOMBRE, p.CODIGO, p.ICONO, p.MODULO_PADRE_ID
        FROM ODO_ROL_PROGRAMAS rp
        JOIN ODO_PROGRAMAS p ON rp.PROGRAMA_ID = p.PROGRAMA_ID
        WHERE rp.ROL_ID = :id
        ORDER BY p.ORDEN, p.NOMBRE;

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

    # 3. POST /roles/:id/programas (Asignar)
    print("\n3. Creando endpoint POST /facturas/roles/:id/programas...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern => 'roles/:id/programas',
                p_method => 'POST',
                p_source_type => 'plsql/block',
                p_source => '
DECLARE
    v_body CLOB;
    v_programa_id NUMBER;
    v_res NUMBER;
    v_msj VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
    v_programa_id := APEX_JSON.get_number(''programa_id'');

    PKG_SEGURIDAD.ASIGNAR_PROGRAMA_ROL(
        p_rol_id => :id,
        p_programa_id => v_programa_id,
        p_asignado_por => 1,
        p_resultado => v_res,
        p_mensaje => v_msj
    );

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''resultado'', v_res);
    APEX_JSON.write(''mensaje'', v_msj);
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

    # 4. GET /roles/:id/permisos
    print("\n4. Creando endpoint GET /facturas/roles/:id/permisos...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'roles/:id/permisos');
            
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern => 'roles/:id/permisos',
                p_method => 'GET',
                p_source_type => 'plsql/block',
                p_source => '
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT p.PERMISO_ID, p.NOMBRE, p.CODIGO, p.PROGRAMA_ID
        FROM ODO_ROL_PERMISOS rp
        JOIN ODO_PERMISOS p ON rp.PERMISO_ID = p.PERMISO_ID
        WHERE rp.ROL_ID = :id
        ORDER BY p.NOMBRE;

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

    # 5. POST /roles/:id/permisos (Asignar)
    print("\n5. Creando endpoint POST /facturas/roles/:id/permisos...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern => 'roles/:id/permisos',
                p_method => 'POST',
                p_source_type => 'plsql/block',
                p_source => '
DECLARE
    v_body CLOB;
    v_permiso_id NUMBER;
    v_res NUMBER;
    v_msj VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
    v_permiso_id := APEX_JSON.get_number(''permiso_id'');

    PKG_SEGURIDAD.ASIGNAR_PERMISO_ROL(
        p_rol_id => :id,
        p_permiso_id => v_permiso_id,
        p_asignado_por => 1,
        p_resultado => v_res,
        p_mensaje => v_msj
    );

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''resultado'', v_res);
    APEX_JSON.write(''mensaje'', v_msj);
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

    # 6. DELETE /roles/:id/programas/:progId
    print("\n6. Creando endpoint DELETE /facturas/roles/:id/programas/:progId...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'roles/:id/programas/:progId');
            
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern => 'roles/:id/programas/:progId',
                p_method => 'DELETE',
                p_source_type => 'plsql/block',
                p_source => '
BEGIN
    DELETE FROM ODO_ROL_PROGRAMAS
    WHERE ROL_ID = :id AND PROGRAMA_ID = :progId;

    COMMIT;

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''resultado'', 1);
    APEX_JSON.write(''mensaje'', ''Programa removido del rol'');
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

    # 7. DELETE /roles/:id/permisos/:permId
    print("\n7. Creando endpoint DELETE /facturas/roles/:id/permisos/:permId...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'roles/:id/permisos/:permId');
            
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern => 'roles/:id/permisos/:permId',
                p_method => 'DELETE',
                p_source_type => 'plsql/block',
                p_source => '
BEGIN
    DELETE FROM ODO_ROL_PERMISOS
    WHERE ROL_ID = :id AND PERMISO_ID = :permId;

    COMMIT;

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''resultado'', 1);
    APEX_JSON.write(''mensaje'', ''Permiso removido del rol'');
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

    conn.commit()
    print("\n" + "="*60)
    print("¡Endpoints de gestión de roles creados exitosamente!")
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
