-- =============================================================================
-- MÓDULO DE CAJA - ENDPOINTS ORDS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- GET /facturas/caja?empresa_id=&estado=
-- Listar cajas de una empresa
-- ---------------------------------------------------------------------------
BEGIN
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja');
    ORDS.DEFINE_HANDLER(
        p_module_name   => 'facturas',
        p_pattern       => 'caja',
        p_method        => 'GET',
        p_source_type   => ORDS.source_type_plsql,
        p_source        => '
DECLARE
    v_cursor  PKG_CAJA.t_cursor;
    v_resultado NUMBER;
    v_mensaje   VARCHAR2(4000);
BEGIN
    PKG_CAJA.listar_cajas(
        p_empresa_id => :empresa_id,
        p_estado     => :estado,
        p_cursor     => v_cursor,
        p_resultado  => v_resultado,
        p_mensaje    => v_mensaje
    );
    :resultado := v_resultado;
    :mensaje   := v_mensaje;
    :items     := v_cursor;
END;'
    );
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja', p_method => 'GET', p_name => 'empresa_id', p_bind_variable_name => 'empresa_id', p_source_type => 'HEADER', p_param_type => 'INT', p_access_method => 'IN');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja', p_method => 'GET', p_name => 'estado', p_bind_variable_name => 'estado', p_source_type => 'HEADER', p_param_type => 'STRING', p_access_method => 'IN');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja', p_method => 'GET', p_name => 'resultado', p_bind_variable_name => 'resultado', p_source_type => 'RESPONSE', p_param_type => 'INT', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja', p_method => 'GET', p_name => 'mensaje', p_bind_variable_name => 'mensaje', p_source_type => 'RESPONSE', p_param_type => 'STRING', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja', p_method => 'GET', p_name => 'items', p_bind_variable_name => 'items', p_source_type => 'RESPONSE', p_param_type => 'RESULTSET', p_access_method => 'OUT');
    COMMIT;
END;
/

-- ---------------------------------------------------------------------------
-- POST /facturas/caja
-- Crear nueva caja
-- ---------------------------------------------------------------------------
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name   => 'facturas',
        p_pattern       => 'caja',
        p_method        => 'POST',
        p_source_type   => ORDS.source_type_plsql,
        p_source        => '
DECLARE
    v_caja_id   NUMBER;
    v_resultado NUMBER;
    v_mensaje   VARCHAR2(4000);
BEGIN
    PKG_CAJA.crear_caja(
        p_empresa_id          => :empresa_id,
        p_nombre              => :nombre,
        p_descripcion         => :descripcion,
        p_usuario_asignado_id => :usuario_asignado_id,
        p_creado_por          => :creado_por,
        p_caja_id             => v_caja_id,
        p_resultado           => v_resultado,
        p_mensaje             => v_mensaje
    );
    :caja_id   := v_caja_id;
    :resultado := v_resultado;
    :mensaje   := v_mensaje;
END;'
    );
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja', p_method => 'POST', p_name => 'caja_id', p_bind_variable_name => 'caja_id', p_source_type => 'RESPONSE', p_param_type => 'INT', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja', p_method => 'POST', p_name => 'resultado', p_bind_variable_name => 'resultado', p_source_type => 'RESPONSE', p_param_type => 'INT', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja', p_method => 'POST', p_name => 'mensaje', p_bind_variable_name => 'mensaje', p_source_type => 'RESPONSE', p_param_type => 'STRING', p_access_method => 'OUT');
    COMMIT;
END;
/

-- ---------------------------------------------------------------------------
-- GET /facturas/caja/:id
-- Obtener caja por ID
-- ---------------------------------------------------------------------------
BEGIN
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja/:id');
    ORDS.DEFINE_HANDLER(
        p_module_name   => 'facturas',
        p_pattern       => 'caja/:id',
        p_method        => 'GET',
        p_source_type   => ORDS.source_type_plsql,
        p_source        => '
DECLARE
    v_cursor    PKG_CAJA.t_cursor;
    v_resultado NUMBER;
    v_mensaje   VARCHAR2(4000);
BEGIN
    PKG_CAJA.get_caja(
        p_caja_id   => :id,
        p_cursor    => v_cursor,
        p_resultado => v_resultado,
        p_mensaje   => v_mensaje
    );
    :resultado := v_resultado;
    :mensaje   := v_mensaje;
    :items     := v_cursor;
END;'
    );
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id', p_method => 'GET', p_name => 'resultado', p_bind_variable_name => 'resultado', p_source_type => 'RESPONSE', p_param_type => 'INT', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id', p_method => 'GET', p_name => 'mensaje', p_bind_variable_name => 'mensaje', p_source_type => 'RESPONSE', p_param_type => 'STRING', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id', p_method => 'GET', p_name => 'items', p_bind_variable_name => 'items', p_source_type => 'RESPONSE', p_param_type => 'RESULTSET', p_access_method => 'OUT');
    COMMIT;
END;
/

-- ---------------------------------------------------------------------------
-- PUT /facturas/caja/:id
-- Editar datos de una caja
-- ---------------------------------------------------------------------------
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name   => 'facturas',
        p_pattern       => 'caja/:id',
        p_method        => 'PUT',
        p_source_type   => ORDS.source_type_plsql,
        p_source        => '
DECLARE
    v_resultado NUMBER;
    v_mensaje   VARCHAR2(4000);
BEGIN
    PKG_CAJA.editar_caja(
        p_caja_id             => :id,
        p_nombre              => :nombre,
        p_descripcion         => :descripcion,
        p_usuario_asignado_id => :usuario_asignado_id,
        p_modificado_por      => :modificado_por,
        p_resultado           => v_resultado,
        p_mensaje             => v_mensaje
    );
    :resultado := v_resultado;
    :mensaje   := v_mensaje;
END;'
    );
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id', p_method => 'PUT', p_name => 'resultado', p_bind_variable_name => 'resultado', p_source_type => 'RESPONSE', p_param_type => 'INT', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id', p_method => 'PUT', p_name => 'mensaje', p_bind_variable_name => 'mensaje', p_source_type => 'RESPONSE', p_param_type => 'STRING', p_access_method => 'OUT');
    COMMIT;
END;
/

-- ---------------------------------------------------------------------------
-- POST /facturas/caja/:id/abrir
-- Abrir una caja (iniciar sesión)
-- ---------------------------------------------------------------------------
BEGIN
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja/:id/abrir');
    ORDS.DEFINE_HANDLER(
        p_module_name   => 'facturas',
        p_pattern       => 'caja/:id/abrir',
        p_method        => 'POST',
        p_source_type   => ORDS.source_type_plsql,
        p_source        => '
DECLARE
    v_resultado NUMBER;
    v_mensaje   VARCHAR2(4000);
BEGIN
    PKG_CAJA.abrir_caja(
        p_caja_id        => :id,
        p_saldo_inicial  => :saldo_inicial,
        p_usuario_id     => :usuario_id,
        p_observaciones  => :observaciones,
        p_resultado      => v_resultado,
        p_mensaje        => v_mensaje
    );
    :resultado := v_resultado;
    :mensaje   := v_mensaje;
END;'
    );
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/abrir', p_method => 'POST', p_name => 'resultado', p_bind_variable_name => 'resultado', p_source_type => 'RESPONSE', p_param_type => 'INT', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/abrir', p_method => 'POST', p_name => 'mensaje', p_bind_variable_name => 'mensaje', p_source_type => 'RESPONSE', p_param_type => 'STRING', p_access_method => 'OUT');
    COMMIT;
END;
/

-- ---------------------------------------------------------------------------
-- POST /facturas/caja/:id/cerrar
-- Cerrar una caja (arqueo)
-- ---------------------------------------------------------------------------
BEGIN
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja/:id/cerrar');
    ORDS.DEFINE_HANDLER(
        p_module_name   => 'facturas',
        p_pattern       => 'caja/:id/cerrar',
        p_method        => 'POST',
        p_source_type   => ORDS.source_type_plsql,
        p_source        => '
DECLARE
    v_saldo_final NUMBER;
    v_resultado   NUMBER;
    v_mensaje     VARCHAR2(4000);
BEGIN
    PKG_CAJA.cerrar_caja(
        p_caja_id        => :id,
        p_usuario_id     => :usuario_id,
        p_observaciones  => :observaciones,
        p_saldo_final    => v_saldo_final,
        p_resultado      => v_resultado,
        p_mensaje        => v_mensaje
    );
    :saldo_final := v_saldo_final;
    :resultado   := v_resultado;
    :mensaje     := v_mensaje;
END;'
    );
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/cerrar', p_method => 'POST', p_name => 'saldo_final', p_bind_variable_name => 'saldo_final', p_source_type => 'RESPONSE', p_param_type => 'DECIMAL', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/cerrar', p_method => 'POST', p_name => 'resultado', p_bind_variable_name => 'resultado', p_source_type => 'RESPONSE', p_param_type => 'INT', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/cerrar', p_method => 'POST', p_name => 'mensaje', p_bind_variable_name => 'mensaje', p_source_type => 'RESPONSE', p_param_type => 'STRING', p_access_method => 'OUT');
    COMMIT;
END;
/

-- ---------------------------------------------------------------------------
-- GET /facturas/caja/:id/movimientos?tipo=&fecha_desde=&fecha_hasta=
-- Listar movimientos de una caja
-- ---------------------------------------------------------------------------
BEGIN
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja/:id/movimientos');
    ORDS.DEFINE_HANDLER(
        p_module_name   => 'facturas',
        p_pattern       => 'caja/:id/movimientos',
        p_method        => 'GET',
        p_source_type   => ORDS.source_type_plsql,
        p_source        => '
DECLARE
    v_cursor    PKG_CAJA.t_cursor;
    v_resultado NUMBER;
    v_mensaje   VARCHAR2(4000);
BEGIN
    PKG_CAJA.listar_movimientos(
        p_caja_id      => :id,
        p_tipo         => :tipo,
        p_fecha_desde  => TO_DATE(:fecha_desde, ''YYYY-MM-DD''),
        p_fecha_hasta  => TO_DATE(:fecha_hasta, ''YYYY-MM-DD''),
        p_cursor       => v_cursor,
        p_resultado    => v_resultado,
        p_mensaje      => v_mensaje
    );
    :resultado := v_resultado;
    :mensaje   := v_mensaje;
    :items     := v_cursor;
END;'
    );
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/movimientos', p_method => 'GET', p_name => 'tipo', p_bind_variable_name => 'tipo', p_source_type => 'HEADER', p_param_type => 'STRING', p_access_method => 'IN');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/movimientos', p_method => 'GET', p_name => 'fecha_desde', p_bind_variable_name => 'fecha_desde', p_source_type => 'HEADER', p_param_type => 'STRING', p_access_method => 'IN');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/movimientos', p_method => 'GET', p_name => 'fecha_hasta', p_bind_variable_name => 'fecha_hasta', p_source_type => 'HEADER', p_param_type => 'STRING', p_access_method => 'IN');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/movimientos', p_method => 'GET', p_name => 'resultado', p_bind_variable_name => 'resultado', p_source_type => 'RESPONSE', p_param_type => 'INT', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/movimientos', p_method => 'GET', p_name => 'mensaje', p_bind_variable_name => 'mensaje', p_source_type => 'RESPONSE', p_param_type => 'STRING', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/movimientos', p_method => 'GET', p_name => 'items', p_bind_variable_name => 'items', p_source_type => 'RESPONSE', p_param_type => 'RESULTSET', p_access_method => 'OUT');
    COMMIT;
END;
/

-- ---------------------------------------------------------------------------
-- POST /facturas/caja/:id/movimientos
-- Registrar movimiento (ingreso o egreso)
-- ---------------------------------------------------------------------------
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name   => 'facturas',
        p_pattern       => 'caja/:id/movimientos',
        p_method        => 'POST',
        p_source_type   => ORDS.source_type_plsql,
        p_source        => '
DECLARE
    v_movimiento_id NUMBER;
    v_resultado     NUMBER;
    v_mensaje       VARCHAR2(4000);
BEGIN
    PKG_CAJA.registrar_movimiento(
        p_caja_id        => :id,
        p_tipo           => :tipo,
        p_categoria_id   => :categoria_id,
        p_concepto       => :concepto,
        p_monto          => :monto,
        p_referencia     => :referencia,
        p_factura_id     => :factura_id,
        p_registrado_por => :registrado_por,
        p_observaciones  => :observaciones,
        p_movimiento_id  => v_movimiento_id,
        p_resultado      => v_resultado,
        p_mensaje        => v_mensaje
    );
    :movimiento_id := v_movimiento_id;
    :resultado     := v_resultado;
    :mensaje       := v_mensaje;
END;'
    );
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/movimientos', p_method => 'POST', p_name => 'movimiento_id', p_bind_variable_name => 'movimiento_id', p_source_type => 'RESPONSE', p_param_type => 'INT', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/movimientos', p_method => 'POST', p_name => 'resultado', p_bind_variable_name => 'resultado', p_source_type => 'RESPONSE', p_param_type => 'INT', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/movimientos', p_method => 'POST', p_name => 'mensaje', p_bind_variable_name => 'mensaje', p_source_type => 'RESPONSE', p_param_type => 'STRING', p_access_method => 'OUT');
    COMMIT;
END;
/

-- ---------------------------------------------------------------------------
-- GET /facturas/caja/:id/resumen
-- Resumen de caja (totales por categoría)
-- ---------------------------------------------------------------------------
BEGIN
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja/:id/resumen');
    ORDS.DEFINE_HANDLER(
        p_module_name   => 'facturas',
        p_pattern       => 'caja/:id/resumen',
        p_method        => 'GET',
        p_source_type   => ORDS.source_type_plsql,
        p_source        => '
DECLARE
    v_cursor    PKG_CAJA.t_cursor;
    v_resultado NUMBER;
    v_mensaje   VARCHAR2(4000);
BEGIN
    PKG_CAJA.get_resumen_caja(
        p_caja_id   => :id,
        p_cursor    => v_cursor,
        p_resultado => v_resultado,
        p_mensaje   => v_mensaje
    );
    :resultado := v_resultado;
    :mensaje   := v_mensaje;
    :items     := v_cursor;
END;'
    );
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/resumen', p_method => 'GET', p_name => 'resultado', p_bind_variable_name => 'resultado', p_source_type => 'RESPONSE', p_param_type => 'INT', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/resumen', p_method => 'GET', p_name => 'mensaje', p_bind_variable_name => 'mensaje', p_source_type => 'RESPONSE', p_param_type => 'STRING', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/:id/resumen', p_method => 'GET', p_name => 'items', p_bind_variable_name => 'items', p_source_type => 'RESPONSE', p_param_type => 'RESULTSET', p_access_method => 'OUT');
    COMMIT;
END;
/

-- ---------------------------------------------------------------------------
-- GET /facturas/caja/categorias?tipo=
-- Listar categorías de movimiento
-- ---------------------------------------------------------------------------
BEGIN
    ORDS.DEFINE_TEMPLATE(p_module_name => 'facturas', p_pattern => 'caja/categorias');
    ORDS.DEFINE_HANDLER(
        p_module_name   => 'facturas',
        p_pattern       => 'caja/categorias',
        p_method        => 'GET',
        p_source_type   => ORDS.source_type_plsql,
        p_source        => '
DECLARE
    v_cursor    PKG_CAJA.t_cursor;
    v_resultado NUMBER;
    v_mensaje   VARCHAR2(4000);
BEGIN
    PKG_CAJA.listar_categorias(
        p_tipo      => :tipo,
        p_cursor    => v_cursor,
        p_resultado => v_resultado,
        p_mensaje   => v_mensaje
    );
    :resultado := v_resultado;
    :mensaje   := v_mensaje;
    :items     := v_cursor;
END;'
    );
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/categorias', p_method => 'GET', p_name => 'tipo', p_bind_variable_name => 'tipo', p_source_type => 'HEADER', p_param_type => 'STRING', p_access_method => 'IN');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/categorias', p_method => 'GET', p_name => 'resultado', p_bind_variable_name => 'resultado', p_source_type => 'RESPONSE', p_param_type => 'INT', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/categorias', p_method => 'GET', p_name => 'mensaje', p_bind_variable_name => 'mensaje', p_source_type => 'RESPONSE', p_param_type => 'STRING', p_access_method => 'OUT');
    ORDS.DEFINE_PARAMETER(p_module_name => 'facturas', p_pattern => 'caja/categorias', p_method => 'GET', p_name => 'items', p_bind_variable_name => 'items', p_source_type => 'RESPONSE', p_param_type => 'RESULTSET', p_access_method => 'OUT');
    COMMIT;
END;
/
