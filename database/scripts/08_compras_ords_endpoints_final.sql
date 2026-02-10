-- =============================================================================
-- ORDS ENDPOINTS - MÓDULO DE COMPRAS E INVENTARIO
-- Creación de endpoints REST usando ORDS.define_template y ORDS.define_handler
-- =============================================================================

DECLARE
  PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
  -- 1. Eliminar módulo si existe
  ORDS.delete_module(p_module_name => 'compras');
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

BEGIN
  -- 2. Enable ORDS for the schema
  ORDS.enable_schema(
    p_enabled => TRUE,
    p_schema => 'ADMIN'
  );
  
  -- 3. Definir Módulo
  ORDS.define_module(
    p_module_name    => 'compras',
    p_base_path      => 'api/v1/compras/',
    p_items_per_page => 50,
    p_status         => 'PUBLISHED',
    p_comments       => 'API para Módulo de Compras e Inventario'
  );
  
  COMMIT;
END;
/

-- =============================================================================
-- ENDPOINTS PARA PROVEEDORES
-- =============================================================================

BEGIN
  -- POST /compras/proveedores/crear
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'proveedores/crear'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'proveedores/crear',
    p_method => 'POST',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_COMPRAS.SP_CREAR_PROVEEDOR(
                    p_nombre => :p_nombre,
                    p_ruc => :p_ruc,
                    p_nombre_contacto => :p_nombre_contacto,
                    p_telefono => :p_telefono,
                    p_email => :p_email,
                    p_direccion => :p_direccion,
                    p_ciudad => :p_ciudad,
                    p_departamento => :p_departamento,
                    p_pais => NVL(:p_pais, ''Paraguay''),
                    p_condiciones_pago => :p_condiciones_pago,
                    p_moneda => NVL(:p_moneda, ''PYG''),
                    p_usuario_id => :p_usuario_id,
                    p_proveedor_id => :p_proveedor_id
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- GET /compras/proveedores
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'proveedores'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'proveedores',
    p_method => 'GET',
    p_source_type => 'plsql/function',
    p_source => 'BEGIN 
                  RETURN PKG_COMPRAS.FN_LISTAR_PROVEEDORES(NVL(:p_activos_solo, ''S''));
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- GET /compras/proveedores/:id
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'proveedores/:id'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'proveedores/:id',
    p_method => 'GET',
    p_source_type => 'plsql/function',
    p_source => 'BEGIN 
                  RETURN PKG_COMPRAS.FN_OBTENER_PROVEEDOR(:id);
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- PUT /compras/proveedores/:id/actualizar
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'proveedores/:id/actualizar'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'proveedores/:id/actualizar',
    p_method => 'PUT',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_COMPRAS.SP_ACTUALIZAR_PROVEEDOR(
                    p_proveedor_id => :id,
                    p_nombre => :p_nombre,
                    p_nombre_contacto => :p_nombre_contacto,
                    p_telefono => :p_telefono,
                    p_email => :p_email,
                    p_direccion => :p_direccion,
                    p_condiciones_pago => :p_condiciones_pago,
                    p_usuario_id => :p_usuario_id
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- DELETE /compras/proveedores/:id/desactivar
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'proveedores/:id/desactivar'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'proveedores/:id/desactivar',
    p_method => 'DELETE',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_COMPRAS.SP_DESACTIVAR_PROVEEDOR(
                    p_proveedor_id => :id,
                    p_usuario_id => :p_usuario_id
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

-- =============================================================================
-- ENDPOINTS PARA ARTÍCULOS
-- =============================================================================

BEGIN
  -- POST /compras/articulos/crear
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'articulos/crear'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'articulos/crear',
    p_method => 'POST',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_COMPRAS.SP_CREAR_ARTICULO(
                    p_codigo => :p_codigo,
                    p_nombre => :p_nombre,
                    p_descripcion => :p_descripcion,
                    p_categoria_id => :p_categoria_id,
                    p_unidad_medida => :p_unidad_medida,
                    p_costo_unitario => :p_costo_unitario,
                    p_precio_venta => :p_precio_venta,
                    p_cantidad_minima => NVL(:p_cantidad_minima, 0),
                    p_cantidad_maxima => NVL(:p_cantidad_maxima, 0),
                    p_usuario_id => :p_usuario_id,
                    p_articulo_id => :p_articulo_id
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- GET /compras/articulos
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'articulos'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'articulos',
    p_method => 'GET',
    p_source_type => 'plsql/function',
    p_source => 'BEGIN 
                  RETURN PKG_COMPRAS.FN_LISTAR_ARTICULOS();
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- GET /compras/articulos/categoria/:id
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'articulos/categoria/:id'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'articulos/categoria/:id',
    p_method => 'GET',
    p_source_type => 'plsql/function',
    p_source => 'BEGIN 
                  RETURN PKG_COMPRAS.FN_LISTAR_ARTICULOS_CATEGORIA(:id);
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- PUT /compras/articulos/:id/actualizar
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'articulos/:id/actualizar'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'articulos/:id/actualizar',
    p_method => 'PUT',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_COMPRAS.SP_ACTUALIZAR_ARTICULO(
                    p_articulo_id => :id,
                    p_nombre => :p_nombre,
                    p_descripcion => :p_descripcion,
                    p_costo_unitario => :p_costo_unitario,
                    p_precio_venta => :p_precio_venta,
                    p_cantidad_minima => :p_cantidad_minima,
                    p_cantidad_maxima => :p_cantidad_maxima,
                    p_usuario_id => :p_usuario_id
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

-- =============================================================================
-- ENDPOINTS PARA ÓRDENES DE COMPRA
-- =============================================================================

BEGIN
  -- POST /compras/ordenes-compra/crear
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'ordenes-compra/crear'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'ordenes-compra/crear',
    p_method => 'POST',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_COMPRAS.SP_CREAR_ORDEN_COMPRA(
                    p_proveedor_id => :p_proveedor_id,
                    p_empresa_id => :p_empresa_id,
                    p_sucursal_id => :p_sucursal_id,
                    p_fecha_entrega => TO_DATE(:p_fecha_entrega, ''YYYY-MM-DD''),
                    p_observaciones => :p_observaciones,
                    p_usuario_id => :p_usuario_id,
                    p_orden_compra_id => :p_orden_compra_id,
                    p_numero_orden => :p_numero_orden
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- GET /compras/ordenes-compra
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'ordenes-compra'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'ordenes-compra',
    p_method => 'GET',
    p_source_type => 'plsql/function',
    p_source => 'BEGIN 
                  RETURN PKG_COMPRAS.FN_LISTAR_ORDENES_COMPRA(:p_estado);
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- GET /compras/ordenes-compra/:id/detalles
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'ordenes-compra/:id/detalles'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'ordenes-compra/:id/detalles',
    p_method => 'GET',
    p_source_type => 'plsql/function',
    p_source => 'BEGIN 
                  RETURN PKG_COMPRAS.FN_OBTENER_DETALLES_OC(:id);
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- POST /compras/ordenes-compra/:id/detalle/agregar
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'ordenes-compra/:id/detalle/agregar'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'ordenes-compra/:id/detalle/agregar',
    p_method => 'POST',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_COMPRAS.SP_AGREGAR_DETALLE_OC(
                    p_orden_compra_id => :id,
                    p_articulo_id => :p_articulo_id,
                    p_cantidad_solicitada => :p_cantidad_solicitada,
                    p_precio_unitario => :p_precio_unitario,
                    p_observaciones => :p_observaciones
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- PUT /compras/ordenes-compra/:id/estado
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'ordenes-compra/:id/estado'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'ordenes-compra/:id/estado',
    p_method => 'PUT',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_COMPRAS.SP_ACTUALIZAR_ESTADO_OC(
                    p_orden_compra_id => :id,
                    p_estado => :p_estado,
                    p_usuario_id => :p_usuario_id
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

-- =============================================================================
-- ENDPOINTS PARA FACTURAS DE COMPRA
-- =============================================================================

BEGIN
  -- POST /compras/facturas-compra/crear
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'facturas-compra/crear'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'facturas-compra/crear',
    p_method => 'POST',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_COMPRAS.SP_CREAR_FACTURA_COMPRA(
                    p_numero_factura => :p_numero_factura,
                    p_fecha_factura => TO_DATE(:p_fecha_factura, ''YYYY-MM-DD''),
                    p_proveedor_id => :p_proveedor_id,
                    p_orden_compra_id => :p_orden_compra_id,
                    p_empresa_id => :p_empresa_id,
                    p_sucursal_id => :p_sucursal_id,
                    p_moneda => NVL(:p_moneda, ''PYG''),
                    p_condicion_pago => :p_condicion_pago,
                    p_fecha_vencimiento => TO_DATE(:p_fecha_vencimiento, ''YYYY-MM-DD''),
                    p_observaciones => :p_observaciones,
                    p_usuario_id => :p_usuario_id,
                    p_factura_compra_id => :p_factura_compra_id
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- GET /compras/facturas-compra
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'facturas-compra'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'facturas-compra',
    p_method => 'GET',
    p_source_type => 'plsql/function',
    p_source => 'BEGIN 
                  RETURN PKG_COMPRAS.FN_LISTAR_FACTURAS_COMPRA(:p_proveedor_id, :p_estado);
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- GET /compras/facturas-compra/:id/detalles
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'facturas-compra/:id/detalles'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'facturas-compra/:id/detalles',
    p_method => 'GET',
    p_source_type => 'plsql/function',
    p_source => 'BEGIN 
                  RETURN PKG_COMPRAS.FN_OBTENER_DETALLES_FACTURA_COMPRA(:id);
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- POST /compras/facturas-compra/:id/detalle/agregar
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'facturas-compra/:id/detalle/agregar'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'facturas-compra/:id/detalle/agregar',
    p_method => 'POST',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_COMPRAS.SP_AGREGAR_DETALLE_FACTURA_COMPRA(
                    p_factura_compra_id => :id,
                    p_articulo_id => :p_articulo_id,
                    p_cantidad => :p_cantidad,
                    p_precio_unitario => :p_precio_unitario,
                    p_porcentaje_iva => NVL(:p_porcentaje_iva, 0),
                    p_observaciones => :p_observaciones
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- PUT /compras/facturas-compra/:id/estado
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'facturas-compra/:id/estado'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'facturas-compra/:id/estado',
    p_method => 'PUT',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_COMPRAS.SP_ACTUALIZAR_ESTADO_FACTURA(
                    p_factura_compra_id => :id,
                    p_estado => :p_estado,
                    p_usuario_id => :p_usuario_id
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

-- =============================================================================
-- ENDPOINTS PARA INVENTARIO
-- =============================================================================

BEGIN
  -- POST /compras/inventario/inicializar
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'inventario/inicializar'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'inventario/inicializar',
    p_method => 'POST',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_INVENTARIO.SP_INICIALIZAR_INVENTARIO(
                    p_articulo_id => :p_articulo_id,
                    p_empresa_id => :p_empresa_id,
                    p_sucursal_id => :p_sucursal_id,
                    p_cantidad_inicial => NVL(:p_cantidad_inicial, 0),
                    p_ubicacion => :p_ubicacion,
                    p_usuario_id => :p_usuario_id
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- GET /compras/inventario/:empresa/:sucursal
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'inventario/:empresa/:sucursal'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'inventario/:empresa/:sucursal',
    p_method => 'GET',
    p_source_type => 'plsql/function',
    p_source => 'BEGIN 
                  RETURN PKG_INVENTARIO.FN_LISTAR_INVENTARIO_SUCURSAL(:empresa, :sucursal);
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- GET /compras/inventario/bajo-stock/:empresa/:sucursal
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'inventario/bajo-stock/:empresa/:sucursal'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'inventario/bajo-stock/:empresa/:sucursal',
    p_method => 'GET',
    p_source_type => 'plsql/function',
    p_source => 'BEGIN 
                  RETURN PKG_INVENTARIO.FN_LISTAR_BAJO_STOCK(:empresa, :sucursal);
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- POST /compras/inventario/entrada
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'inventario/entrada'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'inventario/entrada',
    p_method => 'POST',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_INVENTARIO.SP_REGISTRAR_ENTRADA(
                    p_articulo_id => :p_articulo_id,
                    p_empresa_id => :p_empresa_id,
                    p_sucursal_id => :p_sucursal_id,
                    p_cantidad => :p_cantidad,
                    p_referencia_id => :p_referencia_id,
                    p_referencia_tipo => NVL(:p_referencia_tipo, ''FACTURA_COMPRA''),
                    p_descripcion => :p_descripcion,
                    p_usuario_id => :p_usuario_id,
                    p_movimiento_id => :p_movimiento_id
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- POST /compras/inventario/salida
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'inventario/salida'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'inventario/salida',
    p_method => 'POST',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_INVENTARIO.SP_REGISTRAR_SALIDA(
                    p_articulo_id => :p_articulo_id,
                    p_empresa_id => :p_empresa_id,
                    p_sucursal_id => :p_sucursal_id,
                    p_cantidad => :p_cantidad,
                    p_referencia_id => :p_referencia_id,
                    p_referencia_tipo => NVL(:p_referencia_tipo, ''TRATAMIENTO''),
                    p_descripcion => :p_descripcion,
                    p_usuario_id => :p_usuario_id,
                    p_movimiento_id => :p_movimiento_id
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- POST /compras/inventario/ajuste
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'inventario/ajuste'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'inventario/ajuste',
    p_method => 'POST',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_INVENTARIO.SP_REGISTRAR_AJUSTE(
                    p_articulo_id => :p_articulo_id,
                    p_empresa_id => :p_empresa_id,
                    p_sucursal_id => :p_sucursal_id,
                    p_cantidad => :p_cantidad,
                    p_descripcion => :p_descripcion,
                    p_usuario_id => :p_usuario_id,
                    p_movimiento_id => :p_movimiento_id
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- POST /compras/inventario/devolucion
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'inventario/devolucion'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'inventario/devolucion',
    p_method => 'POST',
    p_source_type => 'plsql/procedure',
    p_source => 'BEGIN 
                  PKG_INVENTARIO.SP_REGISTRAR_DEVOLUCION(
                    p_articulo_id => :p_articulo_id,
                    p_empresa_id => :p_empresa_id,
                    p_sucursal_id => :p_sucursal_id,
                    p_cantidad => :p_cantidad,
                    p_referencia_id => :p_referencia_id,
                    p_referencia_tipo => NVL(:p_referencia_tipo, ''FACTURA_COMPRA''),
                    p_descripcion => :p_descripcion,
                    p_usuario_id => :p_usuario_id,
                    p_movimiento_id => :p_movimiento_id
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- GET /compras/inventario/movimientos/:articulo/:empresa
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'inventario/movimientos/:articulo/:empresa'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'inventario/movimientos/:articulo/:empresa',
    p_method => 'GET',
    p_source_type => 'plsql/function',
    p_source => 'BEGIN 
                  RETURN PKG_INVENTARIO.FN_LISTAR_MOVIMIENTOS_ARTICULO(
                    :articulo, 
                    :empresa,
                    TO_DATE(:p_fecha_desde, ''YYYY-MM-DD''),
                    TO_DATE(:p_fecha_hasta, ''YYYY-MM-DD'')
                  );
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

BEGIN
  -- GET /compras/inventario/valor/:empresa/:sucursal
  ORDS.define_template(
    p_module_name => 'compras',
    p_pattern => 'inventario/valor/:empresa/:sucursal'
  );

  ORDS.define_handler(
    p_module_name => 'compras',
    p_pattern => 'inventario/valor/:empresa/:sucursal',
    p_method => 'GET',
    p_source_type => 'plsql/function',
    p_source => 'BEGIN 
                  RETURN PKG_INVENTARIO.FN_VALOR_INVENTARIO_TOTAL(:empresa, :sucursal);
                END;',
    p_items_per_page => 0
  );
  COMMIT;
END;
/

-- =============================================================================
-- FIN - ENDPOINTS DE COMPRAS E INVENTARIO
-- Total: 25 endpoints creados
-- =============================================================================

COMMIT;
/
