from connect_db import get_connection

conn = get_connection()
cursor = conn.cursor()

print("=" * 60)
print("CREANDO ENDPOINTS ORDS PARA MÓDULO DE CAJA")
print("=" * 60)

try:
    # ─── 1. GET /caja ─────────────────────────────────────────────────────────
    print("\n1. GET /caja (listar cajas)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja');
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'caja',
                p_method      => 'GET',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT
            c.CAJA_ID, c.EMPRESA_ID, c.NOMBRE, c.DESCRIPCION,
            c.USUARIO_ASIGNADO_ID,
            u.NOMBRE || '' '' || u.APELLIDO AS NOMBRE_USUARIO,
            c.SALDO_INICIAL, c.SALDO_FINAL,
            c.TOTAL_INGRESOS, c.TOTAL_EGRESOS,
            (c.SALDO_INICIAL + c.TOTAL_INGRESOS - c.TOTAL_EGRESOS) AS SALDO_ACTUAL,
            c.ESTADO, c.FECHA_APERTURA, c.FECHA_CIERRE, c.OBSERVACIONES, c.FECHA_CREACION
        FROM ODO_CAJAS c
        LEFT JOIN ODO_USUARIOS u ON u.USUARIO_ID = c.USUARIO_ASIGNADO_ID
        WHERE c.EMPRESA_ID = :empresa_id
          AND (:estado IS NULL OR c.ESTADO = :estado)
        ORDER BY c.ESTADO DESC, c.FECHA_APERTURA DESC NULLS LAST, c.NOMBRE;

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
    print("   OK")

    # ─── 2. POST /caja ────────────────────────────────────────────────────────
    print("\n2. POST /caja (crear caja)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'caja',
                p_method      => 'POST',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_body         CLOB;
    v_caja_id      NUMBER;
    v_resultado    NUMBER;
    v_mensaje      VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    PKG_CAJA.crear_caja(
        p_empresa_id          => APEX_JSON.get_number(''empresa_id''),
        p_nombre              => APEX_JSON.get_varchar2(''nombre''),
        p_descripcion         => APEX_JSON.get_varchar2(''descripcion''),
        p_usuario_asignado_id => APEX_JSON.get_number(''usuario_asignado_id''),
        p_creado_por          => APEX_JSON.get_number(''creado_por''),
        p_caja_id             => v_caja_id,
        p_resultado           => v_resultado,
        p_mensaje             => v_mensaje
    );

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''caja_id'', v_caja_id);
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

    # ─── 3. GET /caja/categorias ──────────────────────────────────────────────
    print("\n3. GET /caja/categorias (listar categorías)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja/categorias');
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'caja/categorias',
                p_method      => 'GET',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT CATEGORIA_ID, NOMBRE, TIPO, DESCRIPCION, ACTIVO
        FROM ODO_CATEGORIAS_MOVIMIENTO_CAJA
        WHERE (:tipo IS NULL OR TIPO = :tipo)
          AND ACTIVO = ''S''
        ORDER BY TIPO, NOMBRE;

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
    print("   OK")

    # ─── 4. GET /caja/:id ─────────────────────────────────────────────────────
    print("\n4. GET /caja/:id (obtener caja)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja/:id');
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'caja/:id',
                p_method      => 'GET',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT
            c.CAJA_ID, c.EMPRESA_ID, c.NOMBRE, c.DESCRIPCION,
            c.USUARIO_ASIGNADO_ID,
            u.NOMBRE || '' '' || u.APELLIDO AS NOMBRE_USUARIO,
            c.SALDO_INICIAL, c.SALDO_FINAL,
            c.TOTAL_INGRESOS, c.TOTAL_EGRESOS,
            (c.SALDO_INICIAL + c.TOTAL_INGRESOS - c.TOTAL_EGRESOS) AS SALDO_ACTUAL,
            c.ESTADO, c.FECHA_APERTURA, c.FECHA_CIERRE, c.OBSERVACIONES
        FROM ODO_CAJAS c
        LEFT JOIN ODO_USUARIOS u ON u.USUARIO_ID = c.USUARIO_ASIGNADO_ID
        WHERE c.CAJA_ID = :id;

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
    print("   OK")

    # ─── 5. PUT /caja/:id ─────────────────────────────────────────────────────
    print("\n5. PUT /caja/:id (editar caja)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'caja/:id',
                p_method      => 'PUT',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_body         CLOB;
    v_resultado    NUMBER;
    v_mensaje      VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    PKG_CAJA.editar_caja(
        p_caja_id             => :id,
        p_nombre              => APEX_JSON.get_varchar2(''nombre''),
        p_descripcion         => APEX_JSON.get_varchar2(''descripcion''),
        p_usuario_asignado_id => APEX_JSON.get_number(''usuario_asignado_id''),
        p_modificado_por      => APEX_JSON.get_number(''modificado_por''),
        p_resultado           => v_resultado,
        p_mensaje             => v_mensaje
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

    # ─── 6. POST /caja/:id/abrir ──────────────────────────────────────────────
    print("\n6. POST /caja/:id/abrir (abrir caja)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja/:id/abrir');
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'caja/:id/abrir',
                p_method      => 'POST',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_body         CLOB;
    v_resultado    NUMBER;
    v_mensaje      VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    PKG_CAJA.abrir_caja(
        p_caja_id        => :id,
        p_saldo_inicial  => NVL(APEX_JSON.get_number(''saldo_inicial''), 0),
        p_usuario_id     => APEX_JSON.get_number(''usuario_id''),
        p_observaciones  => APEX_JSON.get_varchar2(''observaciones''),
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

    # ─── 7. POST /caja/:id/cerrar ─────────────────────────────────────────────
    print("\n7. POST /caja/:id/cerrar (cerrar caja)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja/:id/cerrar');
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'caja/:id/cerrar',
                p_method      => 'POST',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_body         CLOB;
    v_saldo_final  NUMBER;
    v_resultado    NUMBER;
    v_mensaje      VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    PKG_CAJA.cerrar_caja(
        p_caja_id        => :id,
        p_usuario_id     => APEX_JSON.get_number(''usuario_id''),
        p_observaciones  => APEX_JSON.get_varchar2(''observaciones''),
        p_saldo_final    => v_saldo_final,
        p_resultado      => v_resultado,
        p_mensaje        => v_mensaje
    );

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''saldo_final'', v_saldo_final);
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

    # ─── 8. GET /caja/:id/movimientos ─────────────────────────────────────────
    print("\n8. GET /caja/:id/movimientos (listar movimientos)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja/:id/movimientos');
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'caja/:id/movimientos',
                p_method      => 'GET',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT
            m.MOVIMIENTO_ID, m.CAJA_ID, m.TIPO,
            m.CATEGORIA_ID,
            cat.NOMBRE AS CATEGORIA_NOMBRE,
            m.CONCEPTO, m.MONTO, m.REFERENCIA, m.FACTURA_ID,
            m.REGISTRADO_POR,
            u.NOMBRE || '' '' || u.APELLIDO AS NOMBRE_USUARIO,
            m.FECHA_HORA, m.OBSERVACIONES
        FROM ODO_MOVIMIENTOS_CAJA m
        LEFT JOIN ODO_CATEGORIAS_MOVIMIENTO_CAJA cat ON cat.CATEGORIA_ID = m.CATEGORIA_ID
        LEFT JOIN ODO_USUARIOS u ON u.USUARIO_ID = m.REGISTRADO_POR
        WHERE m.CAJA_ID = :id
          AND (:tipo IS NULL OR m.TIPO = :tipo)
        ORDER BY m.FECHA_HORA DESC;

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
    print("   OK")

    # ─── 9. POST /caja/:id/movimientos ────────────────────────────────────────
    print("\n9. POST /caja/:id/movimientos (registrar movimiento)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'caja/:id/movimientos',
                p_method      => 'POST',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_body           CLOB;
    v_movimiento_id  NUMBER;
    v_resultado      NUMBER;
    v_mensaje        VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);

    PKG_CAJA.registrar_movimiento(
        p_caja_id        => :id,
        p_tipo           => APEX_JSON.get_varchar2(''tipo''),
        p_categoria_id   => APEX_JSON.get_number(''categoria_id''),
        p_concepto       => APEX_JSON.get_varchar2(''concepto''),
        p_monto          => APEX_JSON.get_number(''monto''),
        p_referencia     => APEX_JSON.get_varchar2(''referencia''),
        p_factura_id     => APEX_JSON.get_number(''factura_id''),
        p_registrado_por => APEX_JSON.get_number(''registrado_por''),
        p_observaciones  => APEX_JSON.get_varchar2(''observaciones''),
        p_movimiento_id  => v_movimiento_id,
        p_resultado      => v_resultado,
        p_mensaje        => v_mensaje
    );

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''movimiento_id'', v_movimiento_id);
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

    # ─── 10. GET /caja/:id/resumen ────────────────────────────────────────────
    print("\n10. GET /caja/:id/resumen (resumen de caja)...")
    cursor.execute("""
        BEGIN
            ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja/:id/resumen');
            ORDS.DEFINE_HANDLER(
                p_module_name => 'facturas',
                p_pattern     => 'caja/:id/resumen',
                p_method      => 'GET',
                p_source_type => 'plsql/block',
                p_source      => '
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT
            m.TIPO,
            NVL(cat.NOMBRE, ''Sin categoría'') AS CATEGORIA,
            COUNT(*) AS CANTIDAD,
            SUM(m.MONTO) AS TOTAL
        FROM ODO_MOVIMIENTOS_CAJA m
        LEFT JOIN ODO_CATEGORIAS_MOVIMIENTO_CAJA cat ON cat.CATEGORIA_ID = m.CATEGORIA_ID
        WHERE m.CAJA_ID = :id
        GROUP BY m.TIPO, cat.NOMBRE
        ORDER BY m.TIPO, cat.NOMBRE;

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
    print("   OK")

    conn.commit()
    print("\n" + "=" * 60)
    print("¡Endpoints ORDS de Caja creados exitosamente!")
    print("=" * 60)
    print("\nEndpoints disponibles:")
    print("  GET    /facturas/caja                  - Listar cajas")
    print("  POST   /facturas/caja                  - Crear caja")
    print("  GET    /facturas/caja/categorias        - Listar categorías")
    print("  GET    /facturas/caja/:id               - Obtener caja")
    print("  PUT    /facturas/caja/:id               - Editar caja")
    print("  POST   /facturas/caja/:id/abrir         - Abrir caja")
    print("  POST   /facturas/caja/:id/cerrar        - Cerrar caja")
    print("  GET    /facturas/caja/:id/movimientos   - Listar movimientos")
    print("  POST   /facturas/caja/:id/movimientos   - Registrar movimiento")
    print("  GET    /facturas/caja/:id/resumen       - Resumen por categoría")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"\nERROR: {e}")
    conn.rollback()
    cursor.close()
    conn.close()
    raise
