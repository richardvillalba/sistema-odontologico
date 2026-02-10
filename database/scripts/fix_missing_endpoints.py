from connect_db import get_connection

conn = get_connection()
cursor = conn.cursor()

print("="*60)
print("VERIFICANDO Y CREANDO ENDPOINTS FALTANTES")
print("="*60)

try:
    # 1. Verificar endpoints existentes
    print("\n1. Verificando endpoints registrados en ORDS...")
    cursor.execute("""
        SELECT name, uri_template, handler_method
        FROM user_ords_handlers
        WHERE module_name = 'facturas'
        ORDER BY name
    """)
    
    handlers = cursor.fetchall()
    print(f"\nEndpoints encontrados: {len(handlers)}")
    for handler in handlers:
        print(f"  - {handler[2]} {handler[1]}")
    
    # 2. Crear endpoint GET /usuarios si no existe
    print("\n2. Creando endpoint GET /facturas/usuarios...")
    try:
        cursor.execute("""
            BEGIN
                -- Primero eliminar si existe
                BEGIN
                    ORDS.DELETE_TEMPLATE(
                        p_module_name => 'facturas',
                        p_pattern => 'usuarios'
                    );
                EXCEPTION
                    WHEN OTHERS THEN NULL;
                END;
                
                -- Crear template
                ORDS.DEFINE_TEMPLATE(
                    p_module_name => 'facturas',
                    p_pattern => 'usuarios'
                );
                
                -- Crear handler
                ORDS.DEFINE_HANDLER(
                    p_module_name => 'facturas',
                    p_pattern => 'usuarios',
                    p_method => 'GET',
                    p_source_type => 'plsql/block',
                    p_source => '
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT 
            USUARIO_ID,
            NOMBRE,
            APELLIDO,
            EMAIL,
            ROL_ID,
            ACTIVO
        FROM ODO_USUARIOS
        ORDER BY APELLIDO, NOMBRE;

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
        print("✓ Endpoint GET /facturas/usuarios creado")
    except Exception as e:
        print(f"✗ Error creando endpoint usuarios: {e}")
    
    # 3. Verificar/recrear endpoint GET /roles
    print("\n3. Verificando endpoint GET /facturas/roles...")
    try:
        cursor.execute("""
            BEGIN
                -- Primero eliminar si existe
                BEGIN
                    ORDS.DELETE_TEMPLATE(
                        p_module_name => 'facturas',
                        p_pattern => 'roles'
                    );
                EXCEPTION
                    WHEN OTHERS THEN NULL;
                END;
                
                -- Crear template
                ORDS.DEFINE_TEMPLATE(
                    p_module_name => 'facturas',
                    p_pattern => 'roles'
                );
                
                -- Crear handler
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
                
                COMMIT;
            END;
        """)
        print("✓ Endpoint GET /facturas/roles verificado/recreado")
    except Exception as e:
        print(f"✗ Error con endpoint roles: {e}")
    
    conn.commit()
    print("\n" + "="*60)
    print("¡Endpoints verificados y creados!")
    print("="*60)
    
    # Listar endpoints nuevamente
    print("\n4. Endpoints finales registrados:")
    cursor.execute("""
        SELECT name, uri_template, handler_method
        FROM user_ords_handlers
        WHERE module_name = 'facturas'
        AND uri_template IN ('usuarios', 'roles')
        ORDER BY name
    """)
    
    final_handlers = cursor.fetchall()
    for handler in final_handlers:
        print(f"  ✓ {handler[2]} /facturas/{handler[1]}")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"\n✗ Error fatal: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
    cursor.close()
    conn.close()
    exit(1)
