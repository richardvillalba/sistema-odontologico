CREATE OR REPLACE PACKAGE PKG_COMPRAS AS
    /*
    Módulo: Compras y Proveedores
    Descripción: Gestión de proveedores, catálogo de artículos, inventario y registro de compras.
    Versión: 1.0
    */

    -- Tipos para cursores
    TYPE t_cursor IS REF CURSOR;

    -- =============================================
    -- GESTIÓN DE PROVEEDORES
    -- =============================================
    PROCEDURE get_proveedores(
        p_empresa_id    IN  NUMBER,
        p_activo        IN  VARCHAR2 DEFAULT 'S',
        p_cursor        OUT t_cursor
    );

    PROCEDURE upsert_proveedor(
        p_proveedor_id      IN OUT NUMBER,
        p_nombre            IN  VARCHAR2,
        p_ruc               IN  VARCHAR2,
        p_nombre_contacto   IN  VARCHAR2,
        p_telefono          IN  VARCHAR2,
        p_email             IN  VARCHAR2,
        p_direccion         IN  VARCHAR2,
        p_ciudad            IN  VARCHAR2,
        p_departamento      IN  VARCHAR2,
        p_pais              IN  VARCHAR2,
        p_condiciones_pago  IN  VARCHAR2,
        p_moneda            IN  VARCHAR2,
        p_barrio            IN  VARCHAR2 DEFAULT NULL,
        p_activo            IN  VARCHAR2 DEFAULT 'S',
        p_creado_por        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- =============================================
    -- GESTIÓN DE ARTICULOS Y CATEGORIAS
    -- =============================================
    PROCEDURE get_categorias_articulos(
        p_activo        IN  VARCHAR2 DEFAULT 'S',
        p_cursor        OUT t_cursor
    );

    PROCEDURE get_articulos(
        p_categoria_id  IN  NUMBER DEFAULT NULL,
        p_activo        IN  VARCHAR2 DEFAULT 'S',
        p_cursor        OUT t_cursor
    );

    PROCEDURE upsert_articulo(
        p_articulo_id       IN OUT NUMBER,
        p_codigo            IN  VARCHAR2,
        p_nombre            IN  VARCHAR2,
        p_descripcion       IN  VARCHAR2,
        p_categoria_id      IN  NUMBER,
        p_unidad_medida     IN  VARCHAR2,
        p_costo_unitario    IN  NUMBER,
        p_precio_venta      IN  NUMBER,
        p_cantidad_minima   IN  NUMBER,
        p_cantidad_maxima   IN  NUMBER,
        p_activo            IN  VARCHAR2 DEFAULT 'S',
        p_creado_por        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- =============================================
    -- GESTIÓN DE INVENTARIO
    -- =============================================
    PROCEDURE get_stock_actual(
        p_empresa_id    IN  NUMBER,
        p_sucursal_id   IN  NUMBER DEFAULT NULL,
        p_articulo_id   IN  NUMBER DEFAULT NULL,
        p_cursor        OUT t_cursor
    );

    PROCEDURE registrar_movimiento_inventario(
        p_articulo_id   IN  NUMBER,
        p_empresa_id    IN  NUMBER,
        p_sucursal_id   IN  NUMBER,
        p_tipo_mov      IN  VARCHAR2, -- 'INGRESO', 'EGRESO', 'AJUSTE'
        p_cantidad      IN  NUMBER,
        p_motivo        IN  VARCHAR2,
        p_referencia_id IN  NUMBER DEFAULT NULL, -- ID de Factura Compra o Cita
        p_usuario_id    IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- =============================================
    -- REGISTRO DE COMPRAS
    -- =============================================
    PROCEDURE registrar_factura_compra(
        p_empresa_id        IN  NUMBER,
        p_sucursal_id       IN  NUMBER,
        p_proveedor_id      IN  NUMBER,
        p_numero_factura    IN  VARCHAR2,
        p_fecha_factura     IN  DATE,
        p_condicion_pago    IN  VARCHAR2,
        p_moneda            IN  VARCHAR2,
        p_total_general     IN  NUMBER,
        p_detalles_json     IN  CLOB, -- Contiene array de {articulo_id, cantidad, costo_unitario}
        p_usuario_id        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

END PKG_COMPRAS;
/

CREATE OR REPLACE PACKAGE BODY PKG_COMPRAS AS

    -- =============================================
    -- PROVEEDORES
    -- =============================================
    PROCEDURE get_proveedores(
        p_empresa_id    IN  NUMBER,
        p_activo        IN  VARCHAR2 DEFAULT 'S',
        p_cursor        OUT t_cursor
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT * FROM ODO_PROVEEDORES
            WHERE (p_activo IS NULL OR ACTIVO = p_activo)
            ORDER BY NOMBRE;
    END get_proveedores;

    PROCEDURE upsert_proveedor(
        p_proveedor_id      IN OUT NUMBER,
        p_nombre            IN  VARCHAR2,
        p_ruc               IN  VARCHAR2,
        p_nombre_contacto   IN  VARCHAR2,
        p_telefono          IN  VARCHAR2,
        p_email             IN  VARCHAR2,
        p_direccion         IN  VARCHAR2,
        p_ciudad            IN  VARCHAR2,
        p_departamento      IN  VARCHAR2,
        p_pais              IN  VARCHAR2,
        p_condiciones_pago  IN  VARCHAR2,
        p_moneda            IN  VARCHAR2,
        p_barrio            IN  VARCHAR2 DEFAULT NULL,
        p_activo            IN  VARCHAR2 DEFAULT 'S',
        p_creado_por        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
    BEGIN
        IF p_proveedor_id IS NULL THEN
            INSERT INTO ODO_PROVEEDORES (
                NOMBRE, RUC, NOMBRE_CONTACTO, TELEFONO, EMAIL, 
                DIRECCION, CIUDAD, DEPARTAMENTO, BARRIO, PAIS, 
                CONDICIONES_PAGO, MONEDA, ACTIVO, CREADO_POR, FECHA_CREACION
            ) VALUES (
                p_nombre, p_ruc, p_nombre_contacto, p_telefono, p_email,
                p_direccion, p_ciudad, p_departamento, p_barrio, p_pais,
                p_condiciones_pago, p_moneda, NVL(p_activo, 'S'), p_creado_por, SYSTIMESTAMP
            ) RETURNING PROVEEDOR_ID INTO p_proveedor_id;
        ELSE
            UPDATE ODO_PROVEEDORES SET
                NOMBRE = p_nombre,
                RUC = p_ruc,
                NOMBRE_CONTACTO = p_nombre_contacto,
                TELEFONO = p_telefono,
                EMAIL = p_email,
                DIRECCION = p_direccion,
                CIUDAD = p_ciudad,
                DEPARTAMENTO = p_departamento,
                BARRIO = p_barrio,
                PAIS = p_pais,
                CONDICIONES_PAGO = p_condiciones_pago,
                MONEDA = p_moneda,
                ACTIVO = p_activo,
                MODIFICADO_POR = p_creado_por,
                FECHA_MODIFICACION = SYSTIMESTAMP
            WHERE PROVEEDOR_ID = p_proveedor_id;
        END IF;

        p_resultado := 1;
        p_mensaje := 'Proveedor guardado correctamente';
    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al guardar proveedor: ' || SQLERRM;
    END upsert_proveedor;

    -- =============================================
    -- ARTICULOS
    -- =============================================
    PROCEDURE get_categorias_articulos(
        p_activo        IN  VARCHAR2 DEFAULT 'S',
        p_cursor        OUT t_cursor
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT * FROM ODO_CATEGORIAS_ARTICULOS
            WHERE (p_activo IS NULL OR ACTIVO = p_activo)
            ORDER BY NOMBRE;
    END get_categorias_articulos;

    PROCEDURE get_articulos(
        p_categoria_id  IN  NUMBER DEFAULT NULL,
        p_activo        IN  VARCHAR2 DEFAULT 'S',
        p_cursor        OUT t_cursor
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT a.*, c.NOMBRE as CATEGORIA_NOMBRE
            FROM ODO_ARTICULOS a
            JOIN ODO_CATEGORIAS_ARTICULOS c ON a.CATEGORIA_ID = c.CATEGORIA_ID
            WHERE (p_categoria_id IS NULL OR a.CATEGORIA_ID = p_categoria_id)
              AND (p_activo IS NULL OR a.ACTIVO = p_activo)
            ORDER BY a.NOMBRE;
    END get_articulos;

    PROCEDURE upsert_articulo(
        p_articulo_id       IN OUT NUMBER,
        p_codigo            IN  VARCHAR2,
        p_nombre            IN  VARCHAR2,
        p_descripcion       IN  VARCHAR2,
        p_categoria_id      IN  NUMBER,
        p_unidad_medida     IN  VARCHAR2,
        p_costo_unitario    IN  NUMBER,
        p_precio_venta      IN  NUMBER,
        p_cantidad_minima   IN  NUMBER,
        p_cantidad_maxima   IN  NUMBER,
        p_activo            IN  VARCHAR2 DEFAULT 'S',
        p_creado_por        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
    BEGIN
        IF p_articulo_id IS NULL THEN
            INSERT INTO ODO_ARTICULOS (
                CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID, UNIDAD_MEDIDA,
                COSTO_UNITARIO, PRECIO_VENTA, CANTIDAD_MINIMA, CANTIDAD_MAXIMA,
                ACTIVO, CREADO_POR, FECHA_CREACION
            ) VALUES (
                p_codigo, p_nombre, p_descripcion, p_categoria_id, p_unidad_medida,
                p_costo_unitario, p_precio_venta, p_cantidad_minima, p_cantidad_maxima,
                NVL(p_activo, 'S'), p_creado_por, SYSTIMESTAMP
            ) RETURNING ARTICULO_ID INTO p_articulo_id;
        ELSE
            UPDATE ODO_ARTICULOS SET
                CODIGO = p_codigo,
                NOMBRE = p_nombre,
                DESCRIPCION = p_descripcion,
                CATEGORIA_ID = p_categoria_id,
                UNIDAD_MEDIDA = p_unidad_medida,
                COSTO_UNITARIO = p_costo_unitario,
                PRECIO_VENTA = p_precio_venta,
                CANTIDAD_MINIMA = p_cantidad_minima,
                CANTIDAD_MAXIMA = p_cantidad_maxima,
                ACTIVO = p_activo,
                MODIFICADO_POR = p_creado_por,
                FECHA_MODIFICACION = SYSTIMESTAMP
            WHERE ARTICULO_ID = p_articulo_id;
        END IF;

        p_resultado := 1;
        p_mensaje := 'Artículo guardado correctamente';
    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al guardar artículo: ' || SQLERRM;
    END upsert_articulo;

    -- =============================================
    -- INVENTARIO
    -- =============================================
    PROCEDURE get_stock_actual(
        p_empresa_id    IN  NUMBER,
        p_sucursal_id   IN  NUMBER DEFAULT NULL,
        p_articulo_id   IN  NUMBER DEFAULT NULL,
        p_cursor        OUT t_cursor
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT 
                i.*, 
                a.NOMBRE as ARTICULO_NOMBRE, 
                a.CODIGO as ARTICULO_CODIGO,
                a.UNIDAD_MEDIDA
            FROM ODO_INVENTARIO i
            JOIN ODO_ARTICULOS a ON i.ARTICULO_ID = a.ARTICULO_ID
            WHERE i.EMPRESA_ID = p_empresa_id
              AND (p_sucursal_id IS NULL OR i.SUCURSAL_ID = p_sucursal_id)
              AND (p_articulo_id IS NULL OR i.ARTICULO_ID = p_articulo_id)
            ORDER BY a.NOMBRE;
    END get_stock_actual;

    PROCEDURE registrar_movimiento_inventario(
        p_articulo_id   IN  NUMBER,
        p_empresa_id    IN  NUMBER,
        p_sucursal_id   IN  NUMBER,
        p_tipo_mov      IN  VARCHAR2,
        p_cantidad      IN  NUMBER,
        p_motivo        IN  VARCHAR2,
        p_referencia_id IN  NUMBER DEFAULT NULL,
        p_usuario_id    IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
        v_inventario_id NUMBER;
        v_stock_actual  NUMBER := 0;
    BEGIN
        -- Verificar si existe registro en inventario para esta sucursal
        BEGIN
            SELECT INVENTARIO_ID, CANTIDAD_ACTUAL 
            INTO v_inventario_id, v_stock_actual
            FROM ODO_INVENTARIO
            WHERE ARTICULO_ID = p_articulo_id AND SUCURSAL_ID = p_sucursal_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                v_inventario_id := NULL;
        END;

        IF v_inventario_id IS NULL THEN
            -- Si no existe, crear registro inicial
            INSERT INTO ODO_INVENTARIO (
                ARTICULO_ID, EMPRESA_ID, SUCURSAL_ID, CANTIDAD_ACTUAL, CREADO_POR, FECHA_CREACION
            ) VALUES (
                p_articulo_id, p_empresa_id, p_sucursal_id, 0, p_usuario_id, SYSTIMESTAMP
            ) RETURNING INVENTARIO_ID INTO v_inventario_id;
            v_stock_actual := 0;
        END IF;

        -- Registrar el movimiento
        INSERT INTO ODO_MOVIMIENTOS_INVENTARIO (
            ARTICULO_ID, EMPRESA_ID, SUCURSAL_ID, TIPO_MOVIMIENTO,
            CANTIDAD, DESCRIPCION, REFERENCIA_ID, FECHA_MOVIMIENTO, REGISTRADO_POR
        ) VALUES (
            p_articulo_id, p_empresa_id, p_sucursal_id, p_tipo_mov,
            p_cantidad, p_motivo, p_referencia_id, SYSTIMESTAMP, p_usuario_id
        );

        -- Actualizar stock actual
        UPDATE ODO_INVENTARIO SET
            CANTIDAD_ACTUAL = CASE p_tipo_mov
                                WHEN 'ENTRADA'    THEN CANTIDAD_ACTUAL + p_cantidad
                                WHEN 'SALIDA'     THEN CANTIDAD_ACTUAL - p_cantidad
                                WHEN 'DEVOLUCION' THEN CANTIDAD_ACTUAL + p_cantidad
                                WHEN 'AJUSTE'     THEN p_cantidad
                                ELSE CANTIDAD_ACTUAL
                              END,
            FECHA_ULTIMO_INGRESO = CASE WHEN p_tipo_mov IN ('ENTRADA', 'DEVOLUCION') THEN SYSTIMESTAMP ELSE FECHA_ULTIMO_INGRESO END,
            FECHA_ULTIMO_EGRESO  = CASE WHEN p_tipo_mov = 'SALIDA' THEN SYSTIMESTAMP ELSE FECHA_ULTIMO_EGRESO END,
            MODIFICADO_POR = p_usuario_id,
            FECHA_MODIFICACION = SYSTIMESTAMP
        WHERE INVENTARIO_ID = v_inventario_id;

        p_resultado := 1;
        p_mensaje := 'Movimiento registrado correctamente';
    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error en movimiento de inventario: ' || SQLERRM;
    END registrar_movimiento_inventario;

    -- =============================================
    -- COMPRAS
    -- =============================================
    PROCEDURE registrar_factura_compra(
        p_empresa_id        IN  NUMBER,
        p_sucursal_id       IN  NUMBER,
        p_proveedor_id      IN  NUMBER,
        p_numero_factura    IN  VARCHAR2,
        p_fecha_factura     IN  DATE,
        p_condicion_pago    IN  VARCHAR2,
        p_moneda            IN  VARCHAR2,
        p_total_general     IN  NUMBER,
        p_detalles_json     IN  CLOB,
        p_usuario_id        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
        v_factura_id    NUMBER;
        v_res           NUMBER;
        v_msg           VARCHAR2(1000);
    BEGIN
        -- 1. Insertar cabecera de factura
        INSERT INTO ODO_FACTURA_COMPRA (
            NUMERO_FACTURA, FECHA_FACTURA, PROVEEDOR_ID,
            EMPRESA_ID, SUCURSAL_ID, ESTADO, MONEDA,
            TOTAL_GENERAL, CONDICION_PAGO, REGISTRADO_POR, FECHA_CREACION, CREADO_POR
        ) VALUES (
            p_numero_factura, p_fecha_factura, p_proveedor_id,
            p_empresa_id, p_sucursal_id, 'RECIBIDA', p_moneda,
            p_total_general, p_condicion_pago, p_usuario_id, SYSTIMESTAMP, p_usuario_id
        ) RETURNING FACTURA_COMPRA_ID INTO v_factura_id;

        -- 2. Procesar detalles desde JSON
        FOR r IN (
            SELECT 
                articulo_id, 
                cantidad, 
                costo_unitario
            FROM JSON_TABLE(p_detalles_json, '$[*]'
                COLUMNS (
                    articulo_id     NUMBER PATH '$.articulo_id',
                    cantidad        NUMBER PATH '$.cantidad',
                    costo_unitario  NUMBER PATH '$.costo_unitario'
                )
            )
        ) LOOP
            -- Grabar detalle
            INSERT INTO ODO_FACTURA_COMPRA_DET (
                FACTURA_COMPRA_ID, ARTICULO_ID, CANTIDAD, PRECIO_UNITARIO, SUBTOTAL, TOTAL_ITEM
            ) VALUES (
                v_factura_id, r.articulo_id, r.cantidad, r.costo_unitario,
                r.cantidad * r.costo_unitario, r.cantidad * r.costo_unitario
            );

            -- Actualizar stock e inventario
            registrar_movimiento_inventario(
                p_articulo_id => r.articulo_id,
                p_empresa_id => p_empresa_id,
                p_sucursal_id => p_sucursal_id,
                p_tipo_mov => 'ENTRADA',
                p_cantidad => r.cantidad,
                p_motivo => 'Compra Factura Nro: ' || p_numero_factura,
                p_referencia_id => v_factura_id,
                p_usuario_id => p_usuario_id,
                p_resultado => v_res,
                p_mensaje => v_msg
            );

            -- Actualizar último costo en el artículo
            UPDATE ODO_ARTICULOS SET
                COSTO_UNITARIO = r.costo_unitario,
                MODIFICADO_POR = p_usuario_id,
                FECHA_MODIFICACION = SYSTIMESTAMP
            WHERE ARTICULO_ID = r.articulo_id;
            
            -- Actualizar en inventario también
            UPDATE ODO_INVENTARIO SET
                ULTIMO_COSTO = r.costo_unitario,
                MODIFICADO_POR = p_usuario_id,
                FECHA_MODIFICACION = SYSTIMESTAMP
            WHERE ARTICULO_ID = r.articulo_id AND SUCURSAL_ID = p_sucursal_id;
        END LOOP;

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Factura de compra registrada y stock actualizado';
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al registrar factura de compra: ' || SQLERRM;
    END registrar_factura_compra;

END PKG_COMPRAS;
/
