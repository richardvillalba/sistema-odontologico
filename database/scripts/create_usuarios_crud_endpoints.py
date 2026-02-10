from connect_db import get_connection

conn = get_connection()
cursor = conn.cursor()

print("=" * 60)
print("CREANDO ENDPOINTS CRUD DE USUARIOS")
print("=" * 60)

try:
    # ─── 1. POST /usuarios (crear usuario) ───────────────────────────────────
    print("\n1. POST /usuarios (crear usuario)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'usuarios',
                p_method      => 'POST',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_body       CLOB;
    v_usuario_id NUMBER;
    v_resultado  NUMBER;
    v_mensaje    VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    PKG_USUARIOS.insert_usuario(
        p_username             => APEX_JSON.get_varchar2(''username''),
        p_email                => APEX_JSON.get_varchar2(''email''),
        p_password             => APEX_JSON.get_varchar2(''password''),
        p_nombre               => APEX_JSON.get_varchar2(''nombre''),
        p_apellido             => APEX_JSON.get_varchar2(''apellido''),
        p_documento_tipo       => APEX_JSON.get_varchar2(''documento_tipo''),
        p_documento_numero     => APEX_JSON.get_varchar2(''documento_numero''),
        p_telefono             => APEX_JSON.get_varchar2(''telefono''),
        p_especialidad         => APEX_JSON.get_varchar2(''especialidad''),
        p_registro_profesional => APEX_JSON.get_varchar2(''registro_profesional''),
        p_empresa_id           => APEX_JSON.get_number(''empresa_id''),
        p_creado_por           => APEX_JSON.get_number(''creado_por''),
        p_usuario_id           => v_usuario_id,
        p_resultado            => v_resultado,
        p_mensaje              => v_mensaje
    );

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''usuario_id'', v_usuario_id);
    APEX_JSON.write(''resultado'', v_resultado);
    APEX_JSON.write(''mensaje'', v_mensaje);
    APEX_JSON.close_object;
    :status := CASE WHEN v_resultado = 1 THEN 201 ELSE 400 END;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
            );
            COMMIT;
        END;
    """)
    print("   OK")

    # ─── 2. GET /usuarios/:id (obtener usuario por ID) ────────────────────────
    print("\n2. GET /usuarios/:id (obtener usuario)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'usuarios/:id');
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'usuarios/:id',
                p_method      => 'GET',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_cursor    SYS_REFCURSOR;
    v_resultado NUMBER;
    v_mensaje   VARCHAR2(4000);
BEGIN
    PKG_USUARIOS.get_usuario(
        p_usuario_id => :id,
        p_cursor     => v_cursor,
        p_resultado  => v_resultado,
        p_mensaje    => v_mensaje
    );

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''items'', v_cursor);
    APEX_JSON.write(''resultado'', v_resultado);
    APEX_JSON.write(''mensaje'', v_mensaje);
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
    print("   OK")

    # ─── 3. PUT /usuarios/:id (actualizar usuario) ────────────────────────────
    print("\n3. PUT /usuarios/:id (actualizar usuario)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'usuarios/:id',
                p_method      => 'PUT',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_body      CLOB;
    v_resultado NUMBER;
    v_mensaje   VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    PKG_USUARIOS.update_usuario(
        p_usuario_id           => :id,
        p_email                => APEX_JSON.get_varchar2(''email''),
        p_nombre               => APEX_JSON.get_varchar2(''nombre''),
        p_apellido             => APEX_JSON.get_varchar2(''apellido''),
        p_documento_tipo       => APEX_JSON.get_varchar2(''documento_tipo''),
        p_documento_numero     => APEX_JSON.get_varchar2(''documento_numero''),
        p_telefono             => APEX_JSON.get_varchar2(''telefono''),
        p_especialidad         => APEX_JSON.get_varchar2(''especialidad''),
        p_registro_profesional => APEX_JSON.get_varchar2(''registro_profesional''),
        p_modificado_por       => APEX_JSON.get_number(''modificado_por''),
        p_resultado            => v_resultado,
        p_mensaje              => v_mensaje
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
    print("   OK")

    # ─── 4. PUT /usuarios/:id/activo (activar/desactivar) ─────────────────────
    print("\n4. PUT /usuarios/:id/activo (activar/desactivar)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'usuarios/:id/activo');
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'usuarios/:id/activo',
                p_method      => 'PUT',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_body      CLOB;
    v_resultado NUMBER;
    v_mensaje   VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    PKG_USUARIOS.set_activo(
        p_usuario_id     => :id,
        p_activo         => APEX_JSON.get_varchar2(''activo''),
        p_modificado_por => APEX_JSON.get_number(''modificado_por''),
        p_resultado      => v_resultado,
        p_mensaje        => v_mensaje
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
    print("   OK")

    # ─── 5. POST /usuarios/:id/reset-password ─────────────────────────────────
    print("\n5. POST /usuarios/:id/reset-password (resetear contraseña)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'usuarios/:id/reset-password');
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'usuarios/:id/reset-password',
                p_method      => 'POST',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_body      CLOB;
    v_resultado NUMBER;
    v_mensaje   VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    PKG_USUARIOS.reset_password(
        p_usuario_id     => :id,
        p_password_nuevo => APEX_JSON.get_varchar2(''password_nuevo''),
        p_admin_id       => APEX_JSON.get_number(''admin_id''),
        p_resultado      => v_resultado,
        p_mensaje        => v_mensaje
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
    print("   OK")

    conn.commit()
    print("\n" + "=" * 60)
    print("¡Endpoints CRUD de Usuarios creados!")
    print("=" * 60)
    print("  POST   /facturas/usuarios              - Crear usuario")
    print("  GET    /facturas/usuarios/:id           - Obtener usuario")
    print("  PUT    /facturas/usuarios/:id           - Actualizar usuario")
    print("  PUT    /facturas/usuarios/:id/activo    - Activar/desactivar")
    print("  POST   /facturas/usuarios/:id/reset-password - Resetear pass")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"\nERROR: {e}")
    conn.rollback()
    cursor.close()
    conn.close()
    raise
