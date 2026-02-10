-- =============================================================================
-- ORDS ENDPOINTS - MÓDULO DE COMPRAS E INVENTARIO
-- =============================================================================

-- Permitir REST enable
BEGIN
    ORDS.enable_schema(
        p_enabled => TRUE,
        p_schema => 'ADMIN',
        p_url_mapping_type => 'BASE_PATH',
        p_url_mapping_pattern => 'admin',
        p_auto_rest_auth => FALSE
    );
    COMMIT;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ya está habilitado
END;
/

-- =============================================================================
-- PROVEEDORES - 5 ENDPOINTS
-- =============================================================================

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'proveedores',
        p_method => 'GET',
        p_source_type => 'json/collection/query',
        p_source => 'SELECT * FROM TABLE(PKG_COMPRAS.FN_LISTAR_PROVEEDORES())'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'proveedores/:id',
        p_method => 'GET',
        p_source_type => 'json/collection/query',
        p_source => 'SELECT * FROM TABLE(PKG_COMPRAS.FN_OBTENER_PROVEEDOR(:id))'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'proveedores',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_COMPRAS.SP_CREAR_PROVEEDOR(:p_nombre, :p_ruc, :p_nombre_contacto, :p_telefono, :p_email, :p_direccion, :p_ciudad, :p_departamento, :p_pais, :p_condiciones_pago, :p_moneda, :p_usuario_id, :p_proveedor_id); END;'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'proveedores/:id',
        p_method => 'PUT',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_COMPRAS.SP_ACTUALIZAR_PROVEEDOR(:id, :p_nombre, :p_nombre_contacto, :p_telefono, :p_email, :p_direccion, :p_condiciones_pago, :p_usuario_id); END;'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'proveedores/:id/delete',
        p_method => 'DELETE',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_COMPRAS.SP_DESACTIVAR_PROVEEDOR(:id, :p_usuario_id); END;'
    );
    COMMIT;
END;
/

-- =============================================================================
-- ARTÍCULOS - 4 ENDPOINTS
-- =============================================================================

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'articulos',
        p_method => 'GET',
        p_source_type => 'json/collection/query',
        p_source => 'SELECT * FROM TABLE(PKG_COMPRAS.FN_LISTAR_ARTICULOS())'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'articulos/categoria/:id',
        p_method => 'GET',
        p_source_type => 'json/collection/query',
        p_source => 'SELECT * FROM TABLE(PKG_COMPRAS.FN_LISTAR_ARTICULOS_CATEGORIA(:id))'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'articulos',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_COMPRAS.SP_CREAR_ARTICULO(:p_codigo, :p_nombre, :p_descripcion, :p_categoria_id, :p_unidad_medida, :p_costo_unitario, :p_precio_venta, :p_cantidad_minima, :p_cantidad_maxima, :p_usuario_id, :p_articulo_id); END;'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'articulos/:id',
        p_method => 'PUT',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_COMPRAS.SP_ACTUALIZAR_ARTICULO(:id, :p_nombre, :p_descripcion, :p_costo_unitario, :p_precio_venta, :p_cantidad_minima, :p_cantidad_maxima, :p_usuario_id); END;'
    );
    COMMIT;
END;
/

-- =============================================================================
-- ÓRDENES DE COMPRA - 5 ENDPOINTS
-- =============================================================================

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'ordenes-compra',
        p_method => 'GET',
        p_source_type => 'json/collection/query',
        p_source => 'SELECT * FROM TABLE(PKG_COMPRAS.FN_LISTAR_ORDENES_COMPRA())'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'ordenes-compra/:id/detalles',
        p_method => 'GET',
        p_source_type => 'json/collection/query',
        p_source => 'SELECT * FROM TABLE(PKG_COMPRAS.FN_OBTENER_DETALLES_OC(:id))'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'ordenes-compra',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_COMPRAS.SP_CREAR_ORDEN_COMPRA(:p_proveedor_id, :p_empresa_id, :p_sucursal_id, :p_fecha_entrega, :p_observaciones, :p_usuario_id, :p_orden_compra_id, :p_numero_orden); END;'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'ordenes-compra/:id/detalle',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_COMPRAS.SP_AGREGAR_DETALLE_OC(:id, :p_articulo_id, :p_cantidad_solicitada, :p_precio_unitario, :p_observaciones); END;'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'ordenes-compra/:id/estado',
        p_method => 'PUT',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_COMPRAS.SP_ACTUALIZAR_ESTADO_OC(:id, :p_estado, :p_usuario_id); END;'
    );
    COMMIT;
END;
/

-- =============================================================================
-- FACTURAS DE COMPRA - 5 ENDPOINTS
-- =============================================================================

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'facturas-compra',
        p_method => 'GET',
        p_source_type => 'json/collection/query',
        p_source => 'SELECT * FROM TABLE(PKG_COMPRAS.FN_LISTAR_FACTURAS_COMPRA())'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'facturas-compra/:id/detalles',
        p_method => 'GET',
        p_source_type => 'json/collection/query',
        p_source => 'SELECT * FROM TABLE(PKG_COMPRAS.FN_OBTENER_DETALLES_FACTURA_COMPRA(:id))'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'facturas-compra',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_COMPRAS.SP_CREAR_FACTURA_COMPRA(:p_numero_factura, :p_fecha_factura, :p_proveedor_id, :p_orden_compra_id, :p_empresa_id, :p_sucursal_id, :p_moneda, :p_condicion_pago, :p_fecha_vencimiento, :p_observaciones, :p_usuario_id, :p_factura_compra_id); END;'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'facturas-compra/:id/detalle',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_COMPRAS.SP_AGREGAR_DETALLE_FACTURA_COMPRA(:id, :p_articulo_id, :p_cantidad, :p_precio_unitario, :p_porcentaje_iva, :p_observaciones); END;'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'facturas-compra/:id/estado',
        p_method => 'PUT',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_COMPRAS.SP_ACTUALIZAR_ESTADO_FACTURA(:id, :p_estado, :p_usuario_id); END;'
    );
    COMMIT;
END;
/

-- =============================================================================
-- RECEPCIONES - 2 ENDPOINTS
-- =============================================================================

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'recepciones',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_COMPRAS.SP_REGISTRAR_RECEPCION(:p_orden_compra_id, :p_usuario_id, :p_recepcion_id, :p_numero_recepcion); END;'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'recepciones/:id/estado',
        p_method => 'PUT',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_COMPRAS.SP_ACTUALIZAR_ESTADO_RECEPCION(:id, :p_estado, :p_observaciones, :p_usuario_id); END;'
    );
    COMMIT;
END;
/

-- =============================================================================
-- INVENTARIO - 11 ENDPOINTS
-- =============================================================================

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'inventario/:empresa/:sucursal',
        p_method => 'GET',
        p_source_type => 'json/collection/query',
        p_source => 'SELECT * FROM TABLE(PKG_INVENTARIO.FN_LISTAR_INVENTARIO_SUCURSAL(:empresa, :sucursal))'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'inventario/bajo-stock/:empresa/:sucursal',
        p_method => 'GET',
        p_source_type => 'json/collection/query',
        p_source => 'SELECT * FROM TABLE(PKG_INVENTARIO.FN_LISTAR_BAJO_STOCK(:empresa, :sucursal))'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'inventario/inicializar',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_INVENTARIO.SP_INICIALIZAR_INVENTARIO(:p_articulo_id, :p_empresa_id, :p_sucursal_id, :p_cantidad_inicial, :p_ubicacion, :p_usuario_id); END;'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'inventario/entrada',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_INVENTARIO.SP_REGISTRAR_ENTRADA(:p_articulo_id, :p_empresa_id, :p_sucursal_id, :p_cantidad, :p_referencia_id, :p_referencia_tipo, :p_descripcion, :p_usuario_id, :p_movimiento_id); END;'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'inventario/salida',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_INVENTARIO.SP_REGISTRAR_SALIDA(:p_articulo_id, :p_empresa_id, :p_sucursal_id, :p_cantidad, :p_referencia_id, :p_referencia_tipo, :p_descripcion, :p_usuario_id, :p_movimiento_id); END;'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'inventario/ajuste',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_INVENTARIO.SP_REGISTRAR_AJUSTE(:p_articulo_id, :p_empresa_id, :p_sucursal_id, :p_cantidad, :p_descripcion, :p_usuario_id, :p_movimiento_id); END;'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'inventario/devolucion',
        p_method => 'POST',
        p_source_type => 'plsql/block',
        p_source => 'BEGIN PKG_INVENTARIO.SP_REGISTRAR_DEVOLUCION(:p_articulo_id, :p_empresa_id, :p_sucursal_id, :p_cantidad, :p_referencia_id, :p_referencia_tipo, :p_descripcion, :p_usuario_id, :p_movimiento_id); END;'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'inventario/movimientos/:articulo/:empresa',
        p_method => 'GET',
        p_source_type => 'json/collection/query',
        p_source => 'SELECT * FROM TABLE(PKG_INVENTARIO.FN_LISTAR_MOVIMIENTOS_ARTICULO(:articulo, :empresa))'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'inventario/movimientos-tipo/:tipo/:empresa',
        p_method => 'GET',
        p_source_type => 'json/collection/query',
        p_source => 'SELECT * FROM TABLE(PKG_INVENTARIO.FN_LISTAR_MOVIMIENTOS_POR_TIPO(:tipo, :empresa))'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'inventario/valor/:empresa/:sucursal',
        p_method => 'GET',
        p_source_type => 'json/query',
        p_source => 'SELECT PKG_INVENTARIO.FN_VALOR_INVENTARIO_TOTAL(:empresa, :sucursal) as valor_total FROM dual'
    );
    COMMIT;
END;
/

BEGIN
    ORDS.define_service(
        p_module_name => 'compras',
        p_base_path => '/compras/',
        p_pattern => 'inventario/historial/:articulo/:empresa',
        p_method => 'GET',
        p_source_type => 'json/collection/query',
        p_source => 'SELECT * FROM TABLE(PKG_INVENTARIO.FN_OBTENER_HISTORIAL_MOVIMIENTOS(:articulo, :empresa))'
    );
    COMMIT;
END;
/

-- =============================================================================
-- FIN - TODOS LOS ENDPOINTS CREADOS
-- =============================================================================

COMMIT;
/
