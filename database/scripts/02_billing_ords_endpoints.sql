-- ========================================
-- ORDS ENDPOINTS - MÓDULO DE FACTURACIÓN (SINGLE BLOCK)
-- ========================================

BEGIN
    -- 1. LIMPIAR SI YA EXISTE
    BEGIN
        ORDS.DELETE_MODULE(p_module_name => 'facturas');
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;

    -- 2. CREAR MÓDULO
    ORDS.DEFINE_MODULE(
        p_module_name => 'facturas',
        p_base_path   => '/facturas/'
    );

    -- 3. TIMBRADOS
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'timbrados');
    
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'timbrados',
        p_method      => 'GET',
        p_source_type => 'plsql/block',
        p_source      => q'[
DECLARE
    v_cursor SYS_REFCURSOR;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    PKG_FACTURAS.get_timbrados_empresa(
        p_empresa_id => :empresa_id,
        p_activo     => :activo,
        p_cursor     => v_cursor,
        p_resultado  => v_resultado,
        p_mensaje    => v_mensaje
    );
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'timbrados',
        p_method      => 'POST',
        p_source_type => 'plsql/block',
        p_source      => q'[
DECLARE
    v_body CLOB;
    v_timbrado_id NUMBER;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
    PKG_FACTURAS.crear_timbrado(
        p_empresa_id        => APEX_JSON.get_number('empresa_id'),
        p_numero_timbrado   => APEX_JSON.get_varchar2('numero_timbrado'),
        p_establecimiento   => APEX_JSON.get_varchar2('establecimiento'),
        p_punto_expedicion  => APEX_JSON.get_varchar2('punto_expedicion'),
        p_tipo_documento    => APEX_JSON.get_varchar2('tipo_documento'),
        p_numero_inicio     => APEX_JSON.get_number('numero_inicio'),
        p_numero_fin        => APEX_JSON.get_number('numero_fin'),
        p_fecha_inicio      => TO_DATE(APEX_JSON.get_varchar2('fecha_inicio'), 'YYYY-MM-DD'),
        p_fecha_vencimiento => TO_DATE(APEX_JSON.get_varchar2('fecha_vencimiento'), 'YYYY-MM-DD'),
        p_creado_por        => APEX_JSON.get_number('creado_por'),
        p_timbrado_id       => v_timbrado_id,
        p_resultado         => v_resultado,
        p_mensaje           => v_mensaje
    );
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('timbrado_id', v_timbrado_id);
    APEX_JSON.close_object;
    :status := CASE WHEN v_resultado = 1 THEN 201 ELSE 400 END;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    -- 4. ALERTAS (filtra por usuario_id si se proporciona)
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'timbrados/alertas');
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'timbrados/alertas',
        p_method      => 'GET',
        p_source_type => 'plsql/block',
        p_source      => q'[
DECLARE
    v_cursor SYS_REFCURSOR;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    PKG_FACTURAS.verificar_alertas_timbrados(
        p_empresa_id     => :empresa_id,
        p_dias_alerta    => NVL(:dias_alerta, 30),
        p_margen_numeros => NVL(:margen_numeros, 100),
        p_usuario_id     => :usuario_id,
        p_cursor         => v_cursor,
        p_resultado      => v_resultado,
        p_mensaje        => v_mensaje
    );
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    -- 5. LISTA DE FACTURAS
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'lista');
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'lista',
        p_method      => 'GET',
        p_source_type => 'plsql/block',
        p_source      => q'[
DECLARE
    v_cursor SYS_REFCURSOR;
    v_total NUMBER;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    PKG_FACTURAS.get_facturas_empresa(
        p_empresa_id  => :empresa_id,
        p_estado      => :estado,
        p_fecha_desde => TO_DATE(:fecha_desde, 'YYYY-MM-DD'),
        p_fecha_hasta => TO_DATE(:fecha_hasta, 'YYYY-MM-DD'),
        p_limit       => NVL(:limit, 50),
        p_offset      => NVL(:offset, 0),
        p_cursor      => v_cursor,
        p_total       => v_total,
        p_resultado   => v_resultado,
        p_mensaje     => v_mensaje
    );
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('total', v_total);
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    -- 6. FACTURA UNITARIA Y DETALLES
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'factura/:id');
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas',
        p_pattern     => 'factura/:id',
        p_method      => 'GET',
        p_source_type => 'plsql/block',
        p_source      => q'[
DECLARE
    v_cursor SYS_REFCURSOR;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    PKG_FACTURAS.get_factura(
        p_factura_id => :id,
        p_cursor     => v_cursor,
        p_resultado  => v_resultado,
        p_mensaje    => v_mensaje
    );
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('factura', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'factura/:id/detalles');
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas', p_pattern => 'factura/:id/detalles', p_method => 'GET',
        p_source_type => 'plsql/block', p_source => q'[
DECLARE
    v_cursor SYS_REFCURSOR;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    PKG_FACTURAS.get_factura_detalles(
        p_factura_id => :id,
        p_cursor     => v_cursor,
        p_resultado  => v_resultado,
        p_mensaje    => v_mensaje
    );
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    -- POST: Agregar detalle a factura
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas', p_pattern => 'factura/:id/detalles', p_method => 'POST',
        p_source_type => 'plsql/block', p_source => q'[
DECLARE
    v_body CLOB;
    v_detalle_id NUMBER;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
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

    -- 6b. CREAR FACTURA (POST /factura)
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'factura');
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas', p_pattern => 'factura', p_method => 'POST',
        p_source_type => 'plsql/block', p_source => q'[
DECLARE
    v_body CLOB;
    v_factura_id NUMBER;
    v_numero_factura VARCHAR2(50);
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
    PKG_FACTURAS.crear_factura(
        p_paciente_id         => APEX_JSON.get_number('paciente_id'),
        p_usuario_id          => APEX_JSON.get_number('usuario_id'),
        p_empresa_id          => APEX_JSON.get_number('empresa_id'),
        p_sucursal_id         => APEX_JSON.get_number('sucursal_id'),
        p_tipo_factura        => NVL(APEX_JSON.get_varchar2('tipo_factura'), 'CONTADO'),
        p_condicion_operacion => NVL(APEX_JSON.get_varchar2('condicion_operacion'), 'CONTADO'),
        p_plazo_credito_dias  => APEX_JSON.get_number('plazo_credito_dias'),
        p_observaciones       => APEX_JSON.get_varchar2('observaciones'),
        p_factura_id          => v_factura_id,
        p_numero_factura      => v_numero_factura,
        p_resultado           => v_resultado,
        p_mensaje             => v_mensaje
    );
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('factura_id', v_factura_id);
    APEX_JSON.write('numero_factura', v_numero_factura);
    APEX_JSON.close_object;
    :status := CASE WHEN v_resultado = 1 THEN 201 ELSE 400 END;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    -- 6c. CALCULAR/CONFIRMAR FACTURA (PUT /factura/:id/calcular)
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'factura/:id/calcular');
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas', p_pattern => 'factura/:id/calcular', p_method => 'PUT',
        p_source_type => 'plsql/block', p_source => q'[
DECLARE
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    PKG_FACTURAS.calcular_totales_factura(
        p_factura_id => :id,
        p_resultado  => v_resultado,
        p_mensaje    => v_mensaje
    );
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.close_object;
    :status := CASE WHEN v_resultado = 1 THEN 200 ELSE 400 END;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    -- 6d. ANULAR FACTURA (PUT /factura/:id/anular)
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'factura/:id/anular');
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas', p_pattern => 'factura/:id/anular', p_method => 'PUT',
        p_source_type => 'plsql/block', p_source => q'[
DECLARE
    v_body CLOB;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
    PKG_FACTURAS.anular_factura(
        p_factura_id  => :id,
        p_motivo      => APEX_JSON.get_varchar2('motivo'),
        p_anulado_por => NVL(APEX_JSON.get_number('anulado_por'), 1),
        p_resultado   => v_resultado,
        p_mensaje     => v_mensaje
    );
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.close_object;
    :status := CASE WHEN v_resultado = 1 THEN 200 ELSE 400 END;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    -- 7. USUARIOS
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'usuarios');
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas', p_pattern => 'usuarios', p_method => 'GET',
        p_source_type => 'plsql/block', p_source => q'[
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT USUARIO_ID, NOMBRE, APELLIDO, EMAIL, USERNAME
        FROM ODO_USUARIOS WHERE ACTIVO = 'S' ORDER BY NOMBRE, APELLIDO;
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', 1);
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    -- 8. PUNTOS POR USUARIO (GET, POST, DELETE)
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'usuarios/:id/puntos');
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas', p_pattern => 'usuarios/:id/puntos', p_method => 'GET',
        p_source_type => 'plsql/block', p_source => q'[
DECLARE
    v_cursor SYS_REFCURSOR;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    PKG_FACTURAS.get_punto_usuario(
        p_usuario_id => :id, p_cursor => v_cursor, p_resultado => v_resultado, p_mensaje => v_mensaje
    );
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas', p_pattern => 'usuarios/:id/puntos', p_method => 'POST',
        p_source_type => 'plsql/block', p_source => q'[
DECLARE
    v_body CLOB;
    v_timbrado_id NUMBER;
    v_asignado_por NUMBER;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
    v_timbrado_id := APEX_JSON.get_number('timbrado_id');
    v_asignado_por := NVL(APEX_JSON.get_number('asignado_por'), 1);
    
    PKG_FACTURAS.asignar_punto_usuario(
        p_usuario_id   => :id,
        p_timbrado_id  => v_timbrado_id,
        p_asignado_por => v_asignado_por,
        p_resultado    => v_resultado,
        p_mensaje      => v_mensaje
    );
    
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.close_object;
    :status := CASE WHEN v_resultado = 1 THEN 201 ELSE 400 END;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas', p_pattern => 'usuarios/:id/puntos', p_method => 'DELETE',
        p_source_type => 'plsql/block', p_source => q'[
DECLARE
    v_body CLOB;
    v_timbrado_id NUMBER;
    v_resultado NUMBER;
    v_mensaje VARCHAR2(4000);
BEGIN
    v_body := :body_text;
    APEX_JSON.parse(v_body);
    v_timbrado_id := APEX_JSON.get_number('timbrado_id');
    
    PKG_FACTURAS.desactivar_punto_usuario(
        p_usuario_id     => :id,
        p_timbrado_id    => v_timbrado_id,
        p_modificado_por => 1,
        p_resultado      => v_resultado,
        p_mensaje        => v_mensaje
    );
    
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', v_resultado);
    APEX_JSON.write('mensaje', v_mensaje);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    -- 9. USUARIOS POR TIMBRADO
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'timbrados/:id/usuarios');
    ORDS.DEFINE_HANDLER(
        p_module_name => 'facturas', p_pattern => 'timbrados/:id/usuarios', p_method => 'GET',
        p_source_type => 'plsql/block', p_source => q'[
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT 
            u.USUARIO_ID,
            u.NOMBRE || ' ' || u.APELLIDO AS NOMBRE_COMPLETO,
            u.EMAIL,
            up.ACTIVO,
            up.FECHA_ASIGNACION
        FROM ODO_USUARIO_PUNTOS_EXPEDICION up
        JOIN ODO_USUARIOS u ON up.USUARIO_ID = u.USUARIO_ID
        WHERE up.TIMBRADO_ID = :id
          AND up.ACTIVO = 'S';
          
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write('resultado', 1);
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := 'application/json';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;
        ]'
    );

    COMMIT;
END;
/
