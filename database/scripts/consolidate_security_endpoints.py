from connect_db import get_connection

conn = get_connection()
cursor = conn.cursor()

print("="*60)
print("RE-CONSOLIDANDO ENDPOINTS DE SEGURIDAD (ROBUST MODE)")
print("="*60)

# Cada entrada es (pattern, method, plsql_source)
endpoints = [
    # 1. USUARIOS
    ('usuarios', 'GET', """
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT USUARIO_ID, NOMBRE, APELLIDO, EMAIL, ROL_ID, ACTIVO 
        FROM ODO_USUARIOS 
        ORDER BY USUARIO_ID;
        
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
EXCEPTION
    WHEN OTHERS THEN
        :status := 500;
        APEX_JSON.initialize_clob_output;
        APEX_JSON.open_object;
        APEX_JSON.write('error', SQLERRM);
        APEX_JSON.write('code', SQLCODE);
        APEX_JSON.close_object;
        htp.p(APEX_JSON.get_clob_output);
        APEX_JSON.free_output;
END;"""),
    
    # 2. ROLES
    ('roles', 'GET', """
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT ROL_ID, NOMBRE, CODIGO, DESCRIPCION, ACTIVO 
        FROM ODO_ROLES 
        WHERE ACTIVO = 'S' 
        ORDER BY NOMBRE;
        
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
EXCEPTION
    WHEN OTHERS THEN
        :status := 500;
        APEX_JSON.initialize_clob_output;
        APEX_JSON.open_object;
        APEX_JSON.write('error', SQLERRM);
        APEX_JSON.close_object;
        htp.p(APEX_JSON.get_clob_output);
        APEX_JSON.free_output;
END;"""),

    ('roles', 'POST', """
DECLARE
    v_body CLOB := :body_text;
    v_nombre VARCHAR2(100);
    v_codigo VARCHAR2(50);
    v_descr VARCHAR2(500);
    v_rol_id NUMBER;
BEGIN
    APEX_JSON.parse(v_body);
    v_nombre := APEX_JSON.get_varchar2('nombre');
    v_codigo := APEX_JSON.get_varchar2('codigo');
    v_descr := APEX_JSON.get_varchar2('descripcion');

    INSERT INTO ODO_ROLES (NOMBRE, CODIGO, DESCRIPCION, ACTIVO)
    VALUES (v_nombre, v_codigo, v_descr, 'S')
    RETURNING ROL_ID INTO v_rol_id;
    COMMIT;

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('rol_id', v_rol_id);
    APEX_JSON.write('mensaje', 'Rol creado correctamente');
    APEX_JSON.close_object;
    :status := 201;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;"""),

    # 2.1 ROLES ESPECIFICOS
    ('roles/:id', 'PUT', """
DECLARE
    v_body CLOB := :body_text;
    v_nombre VARCHAR2(100);
    v_codigo VARCHAR2(50);
    v_descr VARCHAR2(500);
BEGIN
    APEX_JSON.parse(v_body);
    v_nombre := APEX_JSON.get_varchar2('nombre');
    v_codigo := APEX_JSON.get_varchar2('codigo');
    v_descr := APEX_JSON.get_varchar2('descripcion');

    UPDATE ODO_ROLES 
    SET NOMBRE = v_nombre,
        CODIGO = v_codigo,
        DESCRIPCION = v_descr
    WHERE ROL_ID = :id;
    COMMIT;

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('mensaje', 'Rol actualizado correctamente');
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;"""),

    ('roles/:id', 'DELETE', """
BEGIN
    UPDATE ODO_ROLES SET ACTIVO = 'N' WHERE ROL_ID = :id;
    COMMIT;
    :status := 200;
END;"""),

    # 3. CATALOGOS GENERALES
    ('programas', 'GET', """
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT PROGRAMA_ID, NOMBRE, CODIGO, ICONO, MODULO_PADRE_ID 
        FROM ODO_PROGRAMAS 
        WHERE ACTIVO = 'S' 
        ORDER BY ORDEN, NOMBRE;
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;"""),

    ('permisos', 'GET', """
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT PERMISO_ID, NOMBRE, CODIGO, PROGRAMA_ID 
        FROM ODO_PERMISOS 
        WHERE ACTIVO = 'S' 
        ORDER BY NOMBRE;
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;"""),

    # 4. USUARIOS PERMISOS/PROGRAMAS
    ('usuarios/:id/programas', 'GET', """
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    PKG_SEGURIDAD.GET_PROGRAMAS_USUARIO(:id, v_cursor);
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;"""),
    ('usuarios/:id/permisos', 'GET', """
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    PKG_SEGURIDAD.GET_PERMISOS_USUARIO(:id, v_cursor);
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;"""),
    ('usuarios/:id/tiene-permiso/:codigo', 'GET', """
BEGIN
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('res', PKG_SEGURIDAD.TIENE_PERMISO(:id, :codigo));
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;"""),
    ('usuarios/:id/rol', 'PUT', """
DECLARE
    v_body CLOB := :body_text;
    v_rol_id NUMBER;
    v_res NUMBER;
    v_msj VARCHAR2(4000);
BEGIN
    APEX_JSON.parse(v_body);
    v_rol_id := APEX_JSON.get_number('rol_id');
    PKG_SEGURIDAD.ASIGNAR_ROL_USUARIO(:id, v_rol_id, 1, v_res, v_msj);
    COMMIT;
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_res);
    APEX_JSON.write('mensaje', v_msj);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;"""),

    # 5. ROLES PERMISOS/PROGRAMAS
    ('roles/:id/programas', 'GET', """
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
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;"""),
    ('roles/:id/programas', 'POST', """
DECLARE
    v_body CLOB := :body_text;
    v_programa_id NUMBER;
    v_res NUMBER;
    v_msj VARCHAR2(4000);
BEGIN
    APEX_JSON.parse(v_body);
    v_programa_id := APEX_JSON.get_number('programa_id');
    PKG_SEGURIDAD.ASIGNAR_PROGRAMA_ROL(:id, v_programa_id, 1, v_res, v_msj);
    COMMIT;
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_res);
    APEX_JSON.write('mensaje', v_msj);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;"""),
    ('roles/:id/permisos', 'GET', """
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
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;"""),
    ('roles/:id/permisos', 'POST', """
DECLARE
    v_body CLOB := :body_text;
    v_permiso_id NUMBER;
    v_res NUMBER;
    v_msj VARCHAR2(4000);
BEGIN
    APEX_JSON.parse(v_body);
    v_permiso_id := APEX_JSON.get_number('permiso_id');
    PKG_SEGURIDAD.ASIGNAR_PERMISO_ROL(:id, v_permiso_id, 1, v_res, v_msj);
    COMMIT;
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_res);
    APEX_JSON.write('mensaje', v_msj);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;"""),

    # 6. DELETE (REMOVER ASOCIACIONES)
    ('roles/:id/programas/:progId', 'DELETE', 'BEGIN DELETE FROM ODO_ROL_PROGRAMAS WHERE ROL_ID = :id AND PROGRAMA_ID = :progId; COMMIT; :status := 200; END;'),
    ('roles/:id/permisos/:permId', 'DELETE', 'BEGIN DELETE FROM ODO_ROL_PERMISOS WHERE ROL_ID = :id AND PERMISO_ID = :permId; COMMIT; :status := 200; END;'),
]

try:
    patterns = {}
    for pattern, method, source in endpoints:
        if pattern not in patterns:
            patterns[pattern] = []
        patterns[pattern].append((method, source))

    for pattern, handlers in patterns.items():
        print(f"\nDefiniendo template: {pattern}")
        cursor.execute(f"BEGIN ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => '{pattern}'); END;")
        
        for method, source in handlers:
            print(f"  - Agregando handler: {method}")
            source_sql = source.replace("'", "''")
            cursor.execute(f"""
                BEGIN
                    ORDS.DEFINE_HANDLER(
                        p_module_name => 'facturas',
                        p_pattern => '{pattern}',
                        p_method => '{method}',
                        p_source_type => 'plsql/block',
                        p_source => '{source_sql}'
                    );
                END;
            """)
    
    conn.commit()
    print("\n" + "="*60)
    print("¡Consolidación robusta completada!")
    print("="*60)
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    conn.rollback()
finally:
    cursor.close()
    conn.close()
