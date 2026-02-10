from connect_db import get_connection

conn = get_connection()
cursor = conn.cursor()

print("="*60)
print("CREANDO ENDPOINTS PARA USUARIOS Y ROLES")
print("="*60)

try:
    # 1. Crear endpoint GET /usuarios
    print("\n1. Creando endpoint GET /facturas/usuarios...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(
                p_module_name => 'facturas',
                p_pattern => 'usuarios'
            );
            
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
    print("✓ Endpoint GET /facturas/usuarios creado exitosamente")
    
    # 2. Crear endpoint GET /roles
    print("\n2. Creando endpoint GET /facturas/roles...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(
                p_module_name => 'facturas',
                p_pattern => 'roles'
            );
            
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
    print("✓ Endpoint GET /facturas/roles creado exitosamente")
    
    conn.commit()
    print("\n" + "="*60)
    print("¡Endpoints creados exitosamente!")
    print("="*60)
    print("\nPuedes probarlos en:")
    print("  - GET /facturas/usuarios")
    print("  - GET /facturas/roles")
    
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
