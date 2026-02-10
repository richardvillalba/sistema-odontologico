-- =============================================================================
-- PACKAGE SPECIFICATION: PKG_COMPRAS
-- Gestión de compras, órdenes, facturas y proveedores
-- =============================================================================

CREATE OR REPLACE PACKAGE PKG_COMPRAS AS

    -- =========================================================================
    -- PROCEDURES Y FUNCTIONS PARA PROVEEDORES
    -- =========================================================================
    
    -- Insertar nuevo proveedor
    PROCEDURE SP_CREAR_PROVEEDOR (
        p_nombre          IN VARCHAR2,
        p_ruc             IN VARCHAR2,
        p_nombre_contacto IN VARCHAR2,
        p_telefono        IN VARCHAR2,
        p_email           IN VARCHAR2,
        p_direccion       IN VARCHAR2,
        p_ciudad          IN VARCHAR2,
        p_departamento    IN VARCHAR2,
        p_pais            IN VARCHAR2 DEFAULT 'Paraguay',
        p_condiciones_pago IN VARCHAR2,
        p_moneda          IN VARCHAR2 DEFAULT 'PYG',
        p_usuario_id      IN NUMBER,
        p_proveedor_id    OUT NUMBER
    );
    
    -- Actualizar datos de proveedor
    PROCEDURE SP_ACTUALIZAR_PROVEEDOR (
        p_proveedor_id    IN NUMBER,
        p_nombre          IN VARCHAR2 DEFAULT NULL,
        p_nombre_contacto IN VARCHAR2 DEFAULT NULL,
        p_telefono        IN VARCHAR2 DEFAULT NULL,
        p_email           IN VARCHAR2 DEFAULT NULL,
        p_direccion       IN VARCHAR2 DEFAULT NULL,
        p_condiciones_pago IN VARCHAR2 DEFAULT NULL,
        p_usuario_id      IN NUMBER
    );
    
    -- Desactivar proveedor
    PROCEDURE SP_DESACTIVAR_PROVEEDOR (
        p_proveedor_id IN NUMBER,
        p_usuario_id   IN NUMBER
    );
    
    -- Obtener datos de proveedor
    FUNCTION FN_OBTENER_PROVEEDOR (
        p_proveedor_id IN NUMBER
    ) RETURN SYS_REFCURSOR;
    
    -- Listar todos los proveedores activos
    FUNCTION FN_LISTAR_PROVEEDORES (
        p_activos_solo IN CHAR DEFAULT 'S'
    ) RETURN SYS_REFCURSOR;
    
    -- =========================================================================
    -- PROCEDURES Y FUNCTIONS PARA ARTICULOS
    -- =========================================================================
    
    -- Crear nuevo artículo
    PROCEDURE SP_CREAR_ARTICULO (
        p_codigo          IN VARCHAR2,
        p_nombre          IN VARCHAR2,
        p_descripcion     IN VARCHAR2,
        p_categoria_id    IN NUMBER,
        p_unidad_medida   IN VARCHAR2,
        p_costo_unitario  IN NUMBER,
        p_precio_venta    IN NUMBER,
        p_cantidad_minima IN NUMBER DEFAULT 0,
        p_cantidad_maxima IN NUMBER DEFAULT 0,
        p_usuario_id      IN NUMBER,
        p_articulo_id     OUT NUMBER
    );
    
    -- Actualizar datos de artículo
    PROCEDURE SP_ACTUALIZAR_ARTICULO (
        p_articulo_id     IN NUMBER,
        p_nombre          IN VARCHAR2 DEFAULT NULL,
        p_descripcion     IN VARCHAR2 DEFAULT NULL,
        p_costo_unitario  IN NUMBER DEFAULT NULL,
        p_precio_venta    IN NUMBER DEFAULT NULL,
        p_cantidad_minima IN NUMBER DEFAULT NULL,
        p_cantidad_maxima IN NUMBER DEFAULT NULL,
        p_usuario_id      IN NUMBER
    );
    
    -- Listar artículos por categoría
    FUNCTION FN_LISTAR_ARTICULOS_CATEGORIA (
        p_categoria_id IN NUMBER
    ) RETURN SYS_REFCURSOR;
    
    -- Listar todos los artículos
    FUNCTION FN_LISTAR_ARTICULOS RETURN SYS_REFCURSOR;
    
    -- =========================================================================
    -- PROCEDURES Y FUNCTIONS PARA ORDENES DE COMPRA
    -- =========================================================================
    
    -- Crear orden de compra
    PROCEDURE SP_CREAR_ORDEN_COMPRA (
        p_proveedor_id    IN NUMBER,
        p_empresa_id      IN NUMBER,
        p_sucursal_id     IN NUMBER,
        p_fecha_entrega   IN DATE DEFAULT NULL,
        p_observaciones   IN VARCHAR2 DEFAULT NULL,
        p_usuario_id      IN NUMBER,
        p_orden_compra_id OUT NUMBER,
        p_numero_orden    OUT VARCHAR2
    );
    
    -- Agregar detalle a orden de compra
    PROCEDURE SP_AGREGAR_DETALLE_OC (
        p_orden_compra_id      IN NUMBER,
        p_articulo_id          IN NUMBER,
        p_cantidad_solicitada  IN NUMBER,
        p_precio_unitario      IN NUMBER,
        p_observaciones        IN VARCHAR2 DEFAULT NULL
    );
    
    -- Actualizar estado de orden de compra
    PROCEDURE SP_ACTUALIZAR_ESTADO_OC (
        p_orden_compra_id IN NUMBER,
        p_estado          IN VARCHAR2,
        p_usuario_id      IN NUMBER
    );
    
    -- Obtener detalle de orden de compra
    FUNCTION FN_OBTENER_DETALLES_OC (
        p_orden_compra_id IN NUMBER
    ) RETURN SYS_REFCURSOR;
    
    -- Listar órdenes de compra por estado
    FUNCTION FN_LISTAR_ORDENES_COMPRA (
        p_estado IN VARCHAR2 DEFAULT NULL
    ) RETURN SYS_REFCURSOR;
    
    -- =========================================================================
    -- PROCEDURES Y FUNCTIONS PARA FACTURAS DE COMPRA
    -- =========================================================================
    
    -- Crear factura de compra
    PROCEDURE SP_CREAR_FACTURA_COMPRA (
        p_numero_factura      IN VARCHAR2,
        p_fecha_factura       IN DATE,
        p_proveedor_id        IN NUMBER,
        p_orden_compra_id     IN NUMBER DEFAULT NULL,
        p_empresa_id          IN NUMBER,
        p_sucursal_id         IN NUMBER,
        p_moneda              IN VARCHAR2 DEFAULT 'PYG',
        p_condicion_pago      IN VARCHAR2 DEFAULT NULL,
        p_fecha_vencimiento   IN DATE DEFAULT NULL,
        p_observaciones       IN VARCHAR2 DEFAULT NULL,
        p_usuario_id          IN NUMBER,
        p_factura_compra_id   OUT NUMBER
    );
    
    -- Agregar detalle a factura de compra
    PROCEDURE SP_AGREGAR_DETALLE_FACTURA_COMPRA (
        p_factura_compra_id IN NUMBER,
        p_articulo_id       IN NUMBER,
        p_cantidad          IN NUMBER,
        p_precio_unitario   IN NUMBER,
        p_porcentaje_iva    IN NUMBER DEFAULT 0,
        p_observaciones     IN VARCHAR2 DEFAULT NULL
    );
    
    -- Actualizar estado de factura
    PROCEDURE SP_ACTUALIZAR_ESTADO_FACTURA (
        p_factura_compra_id IN NUMBER,
        p_estado            IN VARCHAR2,
        p_usuario_id        IN NUMBER
    );
    
    -- Obtener detalles de factura de compra
    FUNCTION FN_OBTENER_DETALLES_FACTURA_COMPRA (
        p_factura_compra_id IN NUMBER
    ) RETURN SYS_REFCURSOR;
    
    -- Listar facturas de compra
    FUNCTION FN_LISTAR_FACTURAS_COMPRA (
        p_proveedor_id IN NUMBER DEFAULT NULL,
        p_estado       IN VARCHAR2 DEFAULT NULL
    ) RETURN SYS_REFCURSOR;
    
    -- =========================================================================
    -- PROCEDURES PARA RECEPCION DE COMPRAS
    -- =========================================================================
    
    -- Registrar recepción de compra
    PROCEDURE SP_REGISTRAR_RECEPCION (
        p_orden_compra_id IN NUMBER,
        p_usuario_id      IN NUMBER,
        p_recepcion_id    OUT NUMBER,
        p_numero_recepcion OUT VARCHAR2
    );
    
    -- Actualizar estado de recepción
    PROCEDURE SP_ACTUALIZAR_ESTADO_RECEPCION (
        p_recepcion_id IN NUMBER,
        p_estado       IN VARCHAR2,
        p_observaciones IN VARCHAR2 DEFAULT NULL,
        p_usuario_id   IN NUMBER
    );

END PKG_COMPRAS;
/

-- =============================================================================
-- PACKAGE BODY: PKG_COMPRAS
-- =============================================================================

CREATE OR REPLACE PACKAGE BODY PKG_COMPRAS AS

    -- =========================================================================
    -- PROCEDURES PARA PROVEEDORES
    -- =========================================================================
    
    PROCEDURE SP_CREAR_PROVEEDOR (
        p_nombre          IN VARCHAR2,
        p_ruc             IN VARCHAR2,
        p_nombre_contacto IN VARCHAR2,
        p_telefono        IN VARCHAR2,
        p_email           IN VARCHAR2,
        p_direccion       IN VARCHAR2,
        p_ciudad          IN VARCHAR2,
        p_departamento    IN VARCHAR2,
        p_pais            IN VARCHAR2 DEFAULT 'Paraguay',
        p_condiciones_pago IN VARCHAR2,
        p_moneda          IN VARCHAR2 DEFAULT 'PYG',
        p_usuario_id      IN NUMBER,
        p_proveedor_id    OUT NUMBER
    ) IS
    BEGIN
        INSERT INTO ODO_PROVEEDORES (
            NOMBRE, RUC, NOMBRE_CONTACTO, TELEFONO, EMAIL,
            DIRECCION, CIUDAD, DEPARTAMENTO, PAIS, CONDICIONES_PAGO,
            MONEDA, CREADO_POR, MODIFICADO_POR
        ) VALUES (
            p_nombre, p_ruc, p_nombre_contacto, p_telefono, p_email,
            p_direccion, p_ciudad, p_departamento, p_pais, p_condiciones_pago,
            p_moneda, p_usuario_id, p_usuario_id
        ) RETURNING PROVEEDOR_ID INTO p_proveedor_id;
        
        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Proveedor creado exitosamente: ' || p_proveedor_id);
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_CREAR_PROVEEDOR;
    
    PROCEDURE SP_ACTUALIZAR_PROVEEDOR (
        p_proveedor_id    IN NUMBER,
        p_nombre          IN VARCHAR2 DEFAULT NULL,
        p_nombre_contacto IN VARCHAR2 DEFAULT NULL,
        p_telefono        IN VARCHAR2 DEFAULT NULL,
        p_email           IN VARCHAR2 DEFAULT NULL,
        p_direccion       IN VARCHAR2 DEFAULT NULL,
        p_condiciones_pago IN VARCHAR2 DEFAULT NULL,
        p_usuario_id      IN NUMBER
    ) IS
    BEGIN
        UPDATE ODO_PROVEEDORES SET
            NOMBRE = NVL(p_nombre, NOMBRE),
            NOMBRE_CONTACTO = NVL(p_nombre_contacto, NOMBRE_CONTACTO),
            TELEFONO = NVL(p_telefono, TELEFONO),
            EMAIL = NVL(p_email, EMAIL),
            DIRECCION = NVL(p_direccion, DIRECCION),
            CONDICIONES_PAGO = NVL(p_condiciones_pago, CONDICIONES_PAGO),
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_usuario_id
        WHERE PROVEEDOR_ID = p_proveedor_id;
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_ACTUALIZAR_PROVEEDOR;
    
    PROCEDURE SP_DESACTIVAR_PROVEEDOR (
        p_proveedor_id IN NUMBER,
        p_usuario_id   IN NUMBER
    ) IS
    BEGIN
        UPDATE ODO_PROVEEDORES SET
            ACTIVO = 'N',
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_usuario_id
        WHERE PROVEEDOR_ID = p_proveedor_id;
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_DESACTIVAR_PROVEEDOR;
    
    FUNCTION FN_OBTENER_PROVEEDOR (
        p_proveedor_id IN NUMBER
    ) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT * FROM ODO_PROVEEDORES
            WHERE PROVEEDOR_ID = p_proveedor_id;
        RETURN v_cursor;
    END FN_OBTENER_PROVEEDOR;
    
    FUNCTION FN_LISTAR_PROVEEDORES (
        p_activos_solo IN CHAR DEFAULT 'S'
    ) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT * FROM ODO_PROVEEDORES
            WHERE (p_activos_solo = 'N' OR ACTIVO = 'S')
            ORDER BY NOMBRE;
        RETURN v_cursor;
    END FN_LISTAR_PROVEEDORES;
    
    -- =========================================================================
    -- PROCEDURES PARA ARTICULOS
    -- =========================================================================
    
    PROCEDURE SP_CREAR_ARTICULO (
        p_codigo          IN VARCHAR2,
        p_nombre          IN VARCHAR2,
        p_descripcion     IN VARCHAR2,
        p_categoria_id    IN NUMBER,
        p_unidad_medida   IN VARCHAR2,
        p_costo_unitario  IN NUMBER,
        p_precio_venta    IN NUMBER,
        p_cantidad_minima IN NUMBER DEFAULT 0,
        p_cantidad_maxima IN NUMBER DEFAULT 0,
        p_usuario_id      IN NUMBER,
        p_articulo_id     OUT NUMBER
    ) IS
    BEGIN
        INSERT INTO ODO_ARTICULOS (
            CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID,
            UNIDAD_MEDIDA, COSTO_UNITARIO, PRECIO_VENTA,
            CANTIDAD_MINIMA, CANTIDAD_MAXIMA, CREADO_POR, MODIFICADO_POR
        ) VALUES (
            p_codigo, p_nombre, p_descripcion, p_categoria_id,
            p_unidad_medida, p_costo_unitario, p_precio_venta,
            p_cantidad_minima, p_cantidad_maxima, p_usuario_id, p_usuario_id
        ) RETURNING ARTICULO_ID INTO p_articulo_id;
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_CREAR_ARTICULO;
    
    PROCEDURE SP_ACTUALIZAR_ARTICULO (
        p_articulo_id     IN NUMBER,
        p_nombre          IN VARCHAR2 DEFAULT NULL,
        p_descripcion     IN VARCHAR2 DEFAULT NULL,
        p_costo_unitario  IN NUMBER DEFAULT NULL,
        p_precio_venta    IN NUMBER DEFAULT NULL,
        p_cantidad_minima IN NUMBER DEFAULT NULL,
        p_cantidad_maxima IN NUMBER DEFAULT NULL,
        p_usuario_id      IN NUMBER
    ) IS
    BEGIN
        UPDATE ODO_ARTICULOS SET
            NOMBRE = NVL(p_nombre, NOMBRE),
            DESCRIPCION = NVL(p_descripcion, DESCRIPCION),
            COSTO_UNITARIO = NVL(p_costo_unitario, COSTO_UNITARIO),
            PRECIO_VENTA = NVL(p_precio_venta, PRECIO_VENTA),
            CANTIDAD_MINIMA = NVL(p_cantidad_minima, CANTIDAD_MINIMA),
            CANTIDAD_MAXIMA = NVL(p_cantidad_maxima, CANTIDAD_MAXIMA),
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_usuario_id
        WHERE ARTICULO_ID = p_articulo_id;
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_ACTUALIZAR_ARTICULO;
    
    FUNCTION FN_LISTAR_ARTICULOS_CATEGORIA (
        p_categoria_id IN NUMBER
    ) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT * FROM ODO_ARTICULOS
            WHERE CATEGORIA_ID = p_categoria_id AND ACTIVO = 'S'
            ORDER BY NOMBRE;
        RETURN v_cursor;
    END FN_LISTAR_ARTICULOS_CATEGORIA;
    
    FUNCTION FN_LISTAR_ARTICULOS RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT * FROM ODO_ARTICULOS
            WHERE ACTIVO = 'S'
            ORDER BY CATEGORIA_ID, NOMBRE;
        RETURN v_cursor;
    END FN_LISTAR_ARTICULOS;
    
    -- =========================================================================
    -- PROCEDURES PARA ORDENES DE COMPRA
    -- =========================================================================
    
    PROCEDURE SP_CREAR_ORDEN_COMPRA (
        p_proveedor_id    IN NUMBER,
        p_empresa_id      IN NUMBER,
        p_sucursal_id     IN NUMBER,
        p_fecha_entrega   IN DATE DEFAULT NULL,
        p_observaciones   IN VARCHAR2 DEFAULT NULL,
        p_usuario_id      IN NUMBER,
        p_orden_compra_id OUT NUMBER,
        p_numero_orden    OUT VARCHAR2
    ) IS
        v_numero_seq NUMBER;
    BEGIN
        SELECT SEQ_NUMERO_ORDEN_COMPRA.NEXTVAL INTO v_numero_seq FROM DUAL;
        p_numero_orden := 'OC-' || TO_CHAR(SYSDATE, 'YYYY') || '-' || LPAD(v_numero_seq, 6, '0');
        
        INSERT INTO ODO_ORDENES_COMPRA (
            NUMERO_ORDEN, PROVEEDOR_ID, EMPRESA_ID, SUCURSAL_ID,
            FECHA_ENTREGA_ESPERADA, OBSERVACIONES, SOLICITADO_POR,
            CREADO_POR, MODIFICADO_POR
        ) VALUES (
            p_numero_orden, p_proveedor_id, p_empresa_id, p_sucursal_id,
            p_fecha_entrega, p_observaciones, p_usuario_id,
            p_usuario_id, p_usuario_id
        ) RETURNING ORDEN_COMPRA_ID INTO p_orden_compra_id;
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_CREAR_ORDEN_COMPRA;
    
    PROCEDURE SP_AGREGAR_DETALLE_OC (
        p_orden_compra_id      IN NUMBER,
        p_articulo_id          IN NUMBER,
        p_cantidad_solicitada  IN NUMBER,
        p_precio_unitario      IN NUMBER,
        p_observaciones        IN VARCHAR2 DEFAULT NULL
    ) IS
        v_subtotal NUMBER(12,2);
    BEGIN
        v_subtotal := p_cantidad_solicitada * p_precio_unitario;
        
        INSERT INTO ODO_DETALLES_OC (
            ORDEN_COMPRA_ID, ARTICULO_ID, CANTIDAD_SOLICITADA,
            PRECIO_UNITARIO, SUBTOTAL, OBSERVACIONES
        ) VALUES (
            p_orden_compra_id, p_articulo_id, p_cantidad_solicitada,
            p_precio_unitario, v_subtotal, p_observaciones
        );
        
        -- Actualizar total de la orden
        UPDATE ODO_ORDENES_COMPRA SET
            TOTAL_BASE = (SELECT SUM(SUBTOTAL) FROM ODO_DETALLES_OC WHERE ORDEN_COMPRA_ID = p_orden_compra_id),
            TOTAL = (SELECT SUM(SUBTOTAL) FROM ODO_DETALLES_OC WHERE ORDEN_COMPRA_ID = p_orden_compra_id)
        WHERE ORDEN_COMPRA_ID = p_orden_compra_id;
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_AGREGAR_DETALLE_OC;
    
    PROCEDURE SP_ACTUALIZAR_ESTADO_OC (
        p_orden_compra_id IN NUMBER,
        p_estado          IN VARCHAR2,
        p_usuario_id      IN NUMBER
    ) IS
    BEGIN
        UPDATE ODO_ORDENES_COMPRA SET
            ESTADO = p_estado,
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_usuario_id
        WHERE ORDEN_COMPRA_ID = p_orden_compra_id;
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_ACTUALIZAR_ESTADO_OC;
    
    FUNCTION FN_OBTENER_DETALLES_OC (
        p_orden_compra_id IN NUMBER
    ) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT d.*, a.NOMBRE, a.UNIDAD_MEDIDA
            FROM ODO_DETALLES_OC d
            JOIN ODO_ARTICULOS a ON d.ARTICULO_ID = a.ARTICULO_ID
            WHERE d.ORDEN_COMPRA_ID = p_orden_compra_id;
        RETURN v_cursor;
    END FN_OBTENER_DETALLES_OC;
    
    FUNCTION FN_LISTAR_ORDENES_COMPRA (
        p_estado IN VARCHAR2 DEFAULT NULL
    ) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT o.*, p.NOMBRE as PROVEEDOR_NOMBRE
            FROM ODO_ORDENES_COMPRA o
            JOIN ODO_PROVEEDORES p ON o.PROVEEDOR_ID = p.PROVEEDOR_ID
            WHERE (p_estado IS NULL OR o.ESTADO = p_estado)
            ORDER BY o.FECHA_ORDEN DESC;
        RETURN v_cursor;
    END FN_LISTAR_ORDENES_COMPRA;
    
    -- =========================================================================
    -- PROCEDURES PARA FACTURAS DE COMPRA
    -- =========================================================================
    
    PROCEDURE SP_CREAR_FACTURA_COMPRA (
        p_numero_factura      IN VARCHAR2,
        p_fecha_factura       IN DATE,
        p_proveedor_id        IN NUMBER,
        p_orden_compra_id     IN NUMBER DEFAULT NULL,
        p_empresa_id          IN NUMBER,
        p_sucursal_id         IN NUMBER,
        p_moneda              IN VARCHAR2 DEFAULT 'PYG',
        p_condicion_pago      IN VARCHAR2 DEFAULT NULL,
        p_fecha_vencimiento   IN DATE DEFAULT NULL,
        p_observaciones       IN VARCHAR2 DEFAULT NULL,
        p_usuario_id          IN NUMBER,
        p_factura_compra_id   OUT NUMBER
    ) IS
    BEGIN
        INSERT INTO ODO_FACTURA_COMPRA (
            NUMERO_FACTURA, FECHA_FACTURA, PROVEEDOR_ID, ORDEN_COMPRA_ID,
            EMPRESA_ID, SUCURSAL_ID, MONEDA, CONDICION_PAGO,
            FECHA_VENCIMIENTO, OBSERVACIONES, REGISTRADO_POR,
            CREADO_POR, MODIFICADO_POR
        ) VALUES (
            p_numero_factura, p_fecha_factura, p_proveedor_id, p_orden_compra_id,
            p_empresa_id, p_sucursal_id, p_moneda, p_condicion_pago,
            p_fecha_vencimiento, p_observaciones, p_usuario_id,
            p_usuario_id, p_usuario_id
        ) RETURNING FACTURA_COMPRA_ID INTO p_factura_compra_id;
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_CREAR_FACTURA_COMPRA;
    
    PROCEDURE SP_AGREGAR_DETALLE_FACTURA_COMPRA (
        p_factura_compra_id IN NUMBER,
        p_articulo_id       IN NUMBER,
        p_cantidad          IN NUMBER,
        p_precio_unitario   IN NUMBER,
        p_porcentaje_iva    IN NUMBER DEFAULT 0,
        p_observaciones     IN VARCHAR2 DEFAULT NULL
    ) IS
        v_subtotal     NUMBER(12,2);
        v_monto_iva    NUMBER(12,2);
        v_total_item   NUMBER(12,2);
    BEGIN
        v_subtotal := p_cantidad * p_precio_unitario;
        v_monto_iva := v_subtotal * (p_porcentaje_iva / 100);
        v_total_item := v_subtotal + v_monto_iva;
        
        INSERT INTO ODO_FACTURA_COMPRA_DET (
            FACTURA_COMPRA_ID, ARTICULO_ID, CANTIDAD, PRECIO_UNITARIO,
            SUBTOTAL, PORCENTAJE_IVA, MONTO_IVA, TOTAL_ITEM, OBSERVACIONES
        ) VALUES (
            p_factura_compra_id, p_articulo_id, p_cantidad, p_precio_unitario,
            v_subtotal, p_porcentaje_iva, v_monto_iva, v_total_item, p_observaciones
        );
        
        -- Actualizar totales de la factura
        UPDATE ODO_FACTURA_COMPRA SET
            TOTAL_BASE = (SELECT COALESCE(SUM(SUBTOTAL), 0) FROM ODO_FACTURA_COMPRA_DET WHERE FACTURA_COMPRA_ID = p_factura_compra_id),
            IMPUESTO_IVA = (SELECT COALESCE(SUM(MONTO_IVA), 0) FROM ODO_FACTURA_COMPRA_DET WHERE FACTURA_COMPRA_ID = p_factura_compra_id),
            TOTAL_GENERAL = (SELECT COALESCE(SUM(TOTAL_ITEM), 0) FROM ODO_FACTURA_COMPRA_DET WHERE FACTURA_COMPRA_ID = p_factura_compra_id)
        WHERE FACTURA_COMPRA_ID = p_factura_compra_id;
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_AGREGAR_DETALLE_FACTURA_COMPRA;
    
    PROCEDURE SP_ACTUALIZAR_ESTADO_FACTURA (
        p_factura_compra_id IN NUMBER,
        p_estado            IN VARCHAR2,
        p_usuario_id        IN NUMBER
    ) IS
    BEGIN
        UPDATE ODO_FACTURA_COMPRA SET
            ESTADO = p_estado,
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_usuario_id
        WHERE FACTURA_COMPRA_ID = p_factura_compra_id;
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_ACTUALIZAR_ESTADO_FACTURA;
    
    FUNCTION FN_OBTENER_DETALLES_FACTURA_COMPRA (
        p_factura_compra_id IN NUMBER
    ) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT d.*, a.NOMBRE, a.CODIGO, a.UNIDAD_MEDIDA
            FROM ODO_FACTURA_COMPRA_DET d
            JOIN ODO_ARTICULOS a ON d.ARTICULO_ID = a.ARTICULO_ID
            WHERE d.FACTURA_COMPRA_ID = p_factura_compra_id;
        RETURN v_cursor;
    END FN_OBTENER_DETALLES_FACTURA_COMPRA;
    
    FUNCTION FN_LISTAR_FACTURAS_COMPRA (
        p_proveedor_id IN NUMBER DEFAULT NULL,
        p_estado       IN VARCHAR2 DEFAULT NULL
    ) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT f.*, p.NOMBRE as PROVEEDOR_NOMBRE
            FROM ODO_FACTURA_COMPRA f
            JOIN ODO_PROVEEDORES p ON f.PROVEEDOR_ID = p.PROVEEDOR_ID
            WHERE (p_proveedor_id IS NULL OR f.PROVEEDOR_ID = p_proveedor_id)
              AND (p_estado IS NULL OR f.ESTADO = p_estado)
            ORDER BY f.FECHA_FACTURA DESC;
        RETURN v_cursor;
    END FN_LISTAR_FACTURAS_COMPRA;
    
    -- =========================================================================
    -- PROCEDURES PARA RECEPCION DE COMPRAS
    -- =========================================================================
    
    PROCEDURE SP_REGISTRAR_RECEPCION (
        p_orden_compra_id IN NUMBER,
        p_usuario_id      IN NUMBER,
        p_recepcion_id    OUT NUMBER,
        p_numero_recepcion OUT VARCHAR2
    ) IS
        v_numero_seq NUMBER;
    BEGIN
        SELECT SEQ_NUMERO_RECEPCION.NEXTVAL INTO v_numero_seq FROM DUAL;
        p_numero_recepcion := 'REC-' || TO_CHAR(SYSDATE, 'YYYY') || '-' || LPAD(v_numero_seq, 6, '0');
        
        INSERT INTO ODO_RECEPCION_COMPRAS (
            ORDEN_COMPRA_ID, NUMERO_RECEPCION, RECIBIDO_POR,
            CREADO_POR, MODIFICADO_POR
        ) VALUES (
            p_orden_compra_id, p_numero_recepcion, p_usuario_id,
            p_usuario_id, p_usuario_id
        ) RETURNING RECEPCION_ID INTO p_recepcion_id;
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_REGISTRAR_RECEPCION;
    
    PROCEDURE SP_ACTUALIZAR_ESTADO_RECEPCION (
        p_recepcion_id  IN NUMBER,
        p_estado        IN VARCHAR2,
        p_observaciones IN VARCHAR2 DEFAULT NULL,
        p_usuario_id    IN NUMBER
    ) IS
    BEGIN
        UPDATE ODO_RECEPCION_COMPRAS SET
            ESTADO = p_estado,
            OBSERVACIONES = NVL(p_observaciones, OBSERVACIONES),
            VERIFICADO_POR = p_usuario_id,
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_usuario_id
        WHERE RECEPCION_ID = p_recepcion_id;
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_ACTUALIZAR_ESTADO_RECEPCION;

END PKG_COMPRAS;
/

SHOW ERRORS;
