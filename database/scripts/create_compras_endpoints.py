from connect_db import execute_dml

def deploy_compras_endpoints():
    sql = """
    BEGIN
        -- Eliminar módulo si existe para recrearlo
        BEGIN
            ORDS.DELETE_MODULE(p_module_name => 'compras');
            COMMIT;
        EXCEPTION WHEN OTHERS THEN NULL;
        END;

        ORDS.DEFINE_MODULE(
            p_module_name    => 'compras',
            p_base_path      => 'api/v1/compras/',
            p_items_per_page => 50,
            p_status         => 'PUBLISHED',
            p_comments       => 'Módulo de Compras y Proveedores'
        );

        -- =============================================
        -- PROVEEDORES
        -- =============================================
        ORDS.DEFINE_TEMPLATE(p_module_name => 'compras', p_pattern => 'proveedores');
        
        -- GET Proveedores
        ORDS.DEFINE_HANDLER(
            p_module_name => 'compras',
            p_pattern     => 'proveedores',
            p_method      => 'GET',
            p_source_type => 'plsql/block',
            p_source      => '
BEGIN
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''success'', true);
    APEX_JSON.open_array(''items'');
    
    FOR r IN (SELECT * FROM ODO_PROVEEDORES WHERE (:activo IS NULL OR ACTIVO = :activo) ORDER BY NOMBRE) LOOP
        APEX_JSON.open_object;
        APEX_JSON.write(''proveedor_id'', r.PROVEEDOR_ID);
        APEX_JSON.write(''nombre'', r.NOMBRE);
        APEX_JSON.write(''ruc'', r.RUC);
        APEX_JSON.write(''nombre_contacto'', r.NOMBRE_CONTACTO);
        APEX_JSON.write(''telefono'', r.TELEFONO);
        APEX_JSON.write(''email'', r.EMAIL);
        APEX_JSON.write(''direccion'', r.DIRECCION);
        APEX_JSON.write(''ciudad'', r.CIUDAD);
        APEX_JSON.write(''departamento'', r.DEPARTAMENTO);
        APEX_JSON.write(''pais'', r.PAIS);
        APEX_JSON.write(''condiciones_pago'', r.CONDICIONES_PAGO);
        APEX_JSON.write(''moneda'', r.MONEDA);
        APEX_JSON.write(''activo'', r.ACTIVO);
        APEX_JSON.close_object;
    END LOOP;
    
    APEX_JSON.close_array;
    APEX_JSON.close_object;
    :status := 200;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
        );

        -- POST/PUT Proveedor (Upsert)
        ORDS.DEFINE_HANDLER(
            p_module_name => 'compras',
            p_pattern     => 'proveedores',
            p_method      => 'POST',
            p_source_type => 'plsql/block',
            p_source      => '
DECLARE
    v_id NUMBER := :proveedor_id;
    v_res NUMBER;
    v_msg VARCHAR2(1000);
BEGIN
    PKG_COMPRAS.upsert_proveedor(
        p_proveedor_id     => v_id,
        p_nombre           => :nombre,
        p_ruc              => :ruc,
        p_nombre_contacto  => :nombre_contacto,
        p_telefono         => :telefono,
        p_email            => :email,
        p_direccion        => :direccion,
        p_ciudad           => :ciudad,
        p_departamento     => :departamento,
        p_pais             => :pais,
        p_condiciones_pago => :condiciones_pago,
        p_moneda           => :moneda,
        p_barrio           => :barrio,
        p_activo           => :activo,
        p_creado_por       => NVL(:usuario_id, 1),
        p_resultado        => v_res,
        p_mensaje          => v_msg
    );
    
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''success'', v_res = 1);
    APEX_JSON.write(''message'', v_msg);
    APEX_JSON.write(''proveedor_id'', v_id);
    APEX_JSON.close_object;
    
    :status := CASE WHEN v_res = 1 THEN 200 ELSE 400 END;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
        );

        -- =============================================
        -- CATEGORIAS Y ARTICULOS
        -- =============================================
        -- =============================================
        -- CATEGORIAS Y ARTICULOS
        -- =============================================
        ORDS.DEFINE_TEMPLATE(p_module_name => 'compras', p_pattern => 'categorias');
        
        -- GET Categorias
        ORDS.DEFINE_HANDLER(
            p_module_name => 'compras',
            p_pattern     => 'categorias',
            p_method      => 'GET',
            p_source_type => 'json/query',
            p_source      => 'SELECT * FROM ODO_CATEGORIAS_ARTICULOS WHERE ACTIVO = ''S'' ORDER BY NOMBRE'
        );

        -- POST Categorias (Upsert)
        ORDS.DEFINE_HANDLER(
            p_module_name => 'compras',
            p_pattern     => 'categorias',
            p_method      => 'POST',
            p_source_type => 'plsql/block',
            p_source      => '
BEGIN
    DECLARE
        v_id NUMBER := :categoria_id;
        v_res NUMBER;
        v_msg VARCHAR2(1000);
    BEGIN
        PKG_COMPRAS.upsert_categoria_articulo(
            p_categoria_id => v_id,
            p_nombre       => :nombre,
            p_descripcion  => :descripcion,
            p_activo       => :activo,
            p_resultado    => v_res,
            p_mensaje      => v_msg
        );
        
        APEX_JSON.initialize_clob_output;
        APEX_JSON.open_object;
        APEX_JSON.write(''success'', v_res = 1);
        APEX_JSON.write(''message'', v_msg);
        APEX_JSON.write(''categoria_id'', v_id);
        APEX_JSON.close_object;
        
        :status := CASE WHEN v_res = 1 THEN 200 ELSE 400 END;
        :content_type := ''application/json'';
        htp.p(APEX_JSON.get_clob_output);
        APEX_JSON.free_output;
    END;
END;'
        );

        -- DELETE Categoria
        ORDS.DEFINE_TEMPLATE(p_module_name => 'compras', p_pattern => 'categorias/:id');
        ORDS.DEFINE_HANDLER(
            p_module_name => 'compras',
            p_pattern     => 'categorias/:id',
            p_method      => 'DELETE',
            p_source_type => 'plsql/block',
            p_source      => '
BEGIN
    DECLARE
        v_res NUMBER;
        v_msg VARCHAR2(1000);
    BEGIN
        PKG_COMPRAS.delete_categoria_articulo(
            p_categoria_id => :id,
            p_resultado    => v_res,
            p_mensaje      => v_msg
        );
        
        APEX_JSON.initialize_clob_output;
        APEX_JSON.open_object;
        APEX_JSON.write(''success'', v_res = 1);
        APEX_JSON.write(''message'', v_msg);
        APEX_JSON.close_object;
        
        :status := CASE WHEN v_res = 1 THEN 200 ELSE 400 END;
        :content_type := ''application/json'';
        htp.p(APEX_JSON.get_clob_output);
        APEX_JSON.free_output;
    END;
END;'
        );

        -- UNIDADES DE MEDIDA
        ORDS.DEFINE_TEMPLATE(p_module_name => 'compras', p_pattern => 'unidades-medida');
        ORDS.DEFINE_HANDLER(
            p_module_name => 'compras',
            p_pattern     => 'unidades-medida',
            p_method      => 'GET',
            p_source_type => 'json/query',
            p_source      => 'SELECT * FROM ODO_UNIDADES_MEDIDA WHERE ACTIVO = ''S'' ORDER BY NOMBRE'
        );

        ORDS.DEFINE_TEMPLATE(p_module_name => 'compras', p_pattern => 'articulos');
        ORDS.DEFINE_HANDLER(
            p_module_name => 'compras',
            p_pattern     => 'articulos',
            p_method      => 'GET',
            p_source_type => 'json/query',
            p_source      => 'SELECT a.*, c.NOMBRE as CATEGORIA_NOMBRE 
                              FROM ODO_ARTICULOS a 
                              JOIN ODO_CATEGORIAS_ARTICULOS c ON a.CATEGORIA_ID = c.CATEGORIA_ID 
                              WHERE (:categoria_id IS NULL OR a.CATEGORIA_ID = :categoria_id) 
                                AND (:activo IS NULL OR a.ACTIVO = :activo) 
                              ORDER BY a.NOMBRE'
        );

        ORDS.DEFINE_HANDLER(
            p_module_name => 'compras',
            p_pattern     => 'articulos',
            p_method      => 'POST',
            p_source_type => 'plsql/block',
            p_source      => '
DECLARE
    v_id NUMBER := :articulo_id;
    v_res NUMBER;
    v_msg VARCHAR2(1000);
BEGIN
    PKG_COMPRAS.upsert_articulo(
        p_articulo_id    => v_id,
        p_codigo         => :codigo,
        p_nombre         => :nombre,
        p_descripcion    => :descripcion,
        p_categoria_id   => :categoria_id,
        p_unidad_medida  => :unidad_medida,
        p_costo_unitario => :costo_unitario,
        p_precio_venta   => :precio_venta,
        p_cantidad_minima=> :cantidad_minima,
        p_cantidad_maxima=> :cantidad_maxima,
        p_activo         => :activo,
        p_creado_por     => NVL(:usuario_id, 1),
        p_resultado      => v_res,
        p_mensaje        => v_msg
    );
    
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''success'', v_res = 1);
    APEX_JSON.write(''message'', v_msg);
    APEX_JSON.write(''articulo_id'', v_id);
    APEX_JSON.close_object;
    
    :status := CASE WHEN v_res = 1 THEN 200 ELSE 400 END;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
        );

        -- =============================================
        -- INVENTARIO
        -- =============================================
        ORDS.DEFINE_TEMPLATE(p_module_name => 'compras', p_pattern => 'inventario');
        ORDS.DEFINE_HANDLER(
            p_module_name => 'compras',
            p_pattern     => 'inventario',
            p_method      => 'GET',
            p_source_type => 'json/query',
            p_source      => 'SELECT i.*, a.NOMBRE as ARTICULO_NOMBRE, a.CODIGO as ARTICULO_CODIGO, a.UNIDAD_MEDIDA, a.CATEGORIA_ID
                              FROM ODO_INVENTARIO i
                              JOIN ODO_ARTICULOS a ON i.ARTICULO_ID = a.ARTICULO_ID
                              WHERE i.EMPRESA_ID = :empresa_id
                                AND (:sucursal_id IS NULL OR i.SUCURSAL_ID = :sucursal_id)
                                AND (:articulo_id IS NULL OR i.ARTICULO_ID = :articulo_id)
                              ORDER BY a.NOMBRE'
        );

        -- Movimiento Manual
        ORDS.DEFINE_TEMPLATE(p_module_name => 'compras', p_pattern => 'inventario/movimiento');
        ORDS.DEFINE_HANDLER(
            p_module_name => 'compras',
            p_pattern     => 'inventario/movimiento',
            p_method      => 'POST',
            p_source_type => 'plsql/block',
            p_source      => '
DECLARE
    v_res NUMBER;
    v_msg VARCHAR2(1000);
BEGIN
    PKG_COMPRAS.registrar_movimiento_inventario(
        p_articulo_id   => :articulo_id,
        p_empresa_id    => :empresa_id,
        p_sucursal_id   => :sucursal_id,
        p_tipo_mov      => :tipo_movimiento,
        p_cantidad      => :cantidad,
        p_motivo        => :motivo,
        p_usuario_id    => NVL(:usuario_id, 1),
        p_resultado     => v_res,
        p_mensaje       => v_msg
    );
    
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''success'', v_res = 1);
    APEX_JSON.write(''message'', v_msg);
    APEX_JSON.close_object;
    
    :status := CASE WHEN v_res = 1 THEN 200 ELSE 400 END;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
        );

        -- =============================================
        -- FACTURAS DE COMPRA
        -- =============================================
        ORDS.DEFINE_TEMPLATE(p_module_name => 'compras', p_pattern => 'facturas');

        -- GET Facturas de Compra
        ORDS.DEFINE_HANDLER(
            p_module_name => 'compras',
            p_pattern     => 'facturas',
            p_method      => 'GET',
            p_source_type => 'plsql/block',
            p_source      => '
BEGIN
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''success'', true);
    APEX_JSON.open_array(''items'');

    FOR r IN (
        SELECT fc.FACTURA_COMPRA_ID,
               fc.NUMERO_FACTURA,
               TO_CHAR(fc.FECHA_FACTURA, ''YYYY-MM-DD'') as FECHA_FACTURA,
               fc.PROVEEDOR_ID,
               p.NOMBRE as PROVEEDOR_NOMBRE,
               fc.ESTADO,
               fc.MONEDA,
               fc.TOTAL_GENERAL,
               fc.CONDICION_PAGO,
               TO_CHAR(fc.FECHA_CREACION, ''YYYY-MM-DD HH24:MI'') as FECHA_CREACION
        FROM ODO_FACTURA_COMPRA fc
        JOIN ODO_PROVEEDORES p ON fc.PROVEEDOR_ID = p.PROVEEDOR_ID
        WHERE fc.EMPRESA_ID = :empresa_id
          AND (:sucursal_id IS NULL OR fc.SUCURSAL_ID = :sucursal_id)
        ORDER BY fc.FECHA_CREACION DESC
        FETCH FIRST 200 ROWS ONLY
    ) LOOP
        APEX_JSON.open_object;
        APEX_JSON.write(''factura_compra_id'', r.FACTURA_COMPRA_ID);
        APEX_JSON.write(''numero_factura'', r.NUMERO_FACTURA);
        APEX_JSON.write(''fecha_factura'', r.FECHA_FACTURA);
        APEX_JSON.write(''proveedor_id'', r.PROVEEDOR_ID);
        APEX_JSON.write(''proveedor_nombre'', r.PROVEEDOR_NOMBRE);
        APEX_JSON.write(''estado'', r.ESTADO);
        APEX_JSON.write(''moneda'', r.MONEDA);
        APEX_JSON.write(''total_general'', r.TOTAL_GENERAL);
        APEX_JSON.write(''condicion_pago'', r.CONDICION_PAGO);
        APEX_JSON.write(''fecha_creacion'', r.FECHA_CREACION);
        APEX_JSON.close_object;
    END LOOP;

    APEX_JSON.close_array;
    APEX_JSON.close_object;
    :status := 200;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
        );

        -- POST Factura de Compra
        ORDS.DEFINE_HANDLER(
            p_module_name => 'compras',
            p_pattern     => 'facturas',
            p_method      => 'POST',
            p_source_type => 'plsql/block',
            p_source      => '
DECLARE
    v_res NUMBER;
    v_msg VARCHAR2(1000);
BEGIN
    PKG_COMPRAS.registrar_factura_compra(
        p_empresa_id     => :empresa_id,
        p_sucursal_id    => :sucursal_id,
        p_proveedor_id   => :proveedor_id,
        p_numero_factura => :numero_factura,
        p_fecha_factura  => TO_DATE(:fecha_factura, ''YYYY-MM-DD''),
        p_condicion_pago => :condicion_pago,
        p_moneda         => :moneda,
        p_total_general  => :total_general,
        p_detalles_json  => :detalles, -- CLOB JSON
        p_usuario_id     => NVL(:usuario_id, 1),
        p_resultado      => v_res,
        p_mensaje        => v_msg
    );
    
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''success'', v_res = 1);
    APEX_JSON.write(''message'', v_msg);
    APEX_JSON.close_object;
    
    :status := CASE WHEN v_res = 1 THEN 200 ELSE 400 END;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
        );

        COMMIT;
    END;
    """
    print("Desplegando endpoints de Compras...")
    result = execute_dml(sql)
    print(f"Resultado: {result}")

if __name__ == "__main__":
    deploy_compras_endpoints()
