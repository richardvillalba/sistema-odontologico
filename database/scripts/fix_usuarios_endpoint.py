from connect_db import get_connection

conn = get_connection()
cursor = conn.cursor()

print("Actualizando endpoint GET /facturas/usuarios...")

try:
    cursor.execute("""
        BEGIN
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
            u.USUARIO_ID,
            u.USERNAME,
            u.NOMBRE,
            u.APELLIDO,
            u.EMAIL,
            u.TELEFONO,
            u.ESPECIALIDAD,
            u.DOCUMENTO_TIPO,
            u.DOCUMENTO_NUMERO,
            u.ACTIVO,
            u.EMPRESA_ID,
            u.ULTIMO_LOGIN,
            u.ROL_ID,
            r.NOMBRE AS ROL_NOMBRE,
            r.CODIGO AS ROL_CODIGO
        FROM ODO_USUARIOS u
        LEFT JOIN ODO_ROLES r ON u.ROL_ID = r.ROL_ID
        ORDER BY u.APELLIDO, u.NOMBRE;

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
    conn.commit()
    print("✓ Endpoint actualizado correctamente")
    print("  Campos retornados: USERNAME, NOMBRE, APELLIDO, EMAIL, TELEFONO,")
    print("  ESPECIALIDAD, DOCUMENTO_TIPO, DOCUMENTO_NUMERO, ACTIVO, EMPRESA_ID,")
    print("  ULTIMO_LOGIN, ROL_ID, ROL_NOMBRE, ROL_CODIGO")

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
    conn.rollback()
finally:
    cursor.close()
    conn.close()
