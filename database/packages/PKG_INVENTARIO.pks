-- =============================================================================
-- PACKAGE SPECIFICATION: PKG_INVENTARIO
-- Gestión de inventario y movimientos de stock
-- =============================================================================

CREATE OR REPLACE PACKAGE PKG_INVENTARIO AS

    -- =========================================================================
    -- PROCEDURES PARA INVENTARIO
    -- =========================================================================
    
    -- Inicializar inventario para un artículo
    PROCEDURE SP_INICIALIZAR_INVENTARIO (
        p_articulo_id      IN NUMBER,
        p_empresa_id       IN NUMBER,
        p_sucursal_id      IN NUMBER,
        p_cantidad_inicial IN NUMBER DEFAULT 0,
        p_ubicacion        IN VARCHAR2 DEFAULT NULL,
        p_usuario_id       IN NUMBER
    );
    
    -- Actualizar stock actual
    PROCEDURE SP_ACTUALIZAR_STOCK (
        p_articulo_id IN NUMBER,
        p_empresa_id  IN NUMBER,
        p_sucursal_id IN NUMBER,
        p_cantidad    IN NUMBER,
        p_usuario_id  IN NUMBER
    );
    
    -- Obtener stock actual de un artículo
    FUNCTION FN_OBTENER_STOCK (
        p_articulo_id IN NUMBER,
        p_empresa_id  IN NUMBER,
        p_sucursal_id IN NUMBER
    ) RETURN NUMBER;
    
    -- Listar inventario por sucursal
    FUNCTION FN_LISTAR_INVENTARIO_SUCURSAL (
        p_empresa_id  IN NUMBER,
        p_sucursal_id IN NUMBER
    ) RETURN SYS_REFCURSOR;
    
    -- Listar artículos con bajo stock
    FUNCTION FN_LISTAR_BAJO_STOCK (
        p_empresa_id  IN NUMBER,
        p_sucursal_id IN NUMBER
    ) RETURN SYS_REFCURSOR;
    
    -- =========================================================================
    -- PROCEDURES PARA MOVIMIENTOS DE INVENTARIO
    -- =========================================================================
    
    -- Registrar entrada de inventario
    PROCEDURE SP_REGISTRAR_ENTRADA (
        p_articulo_id     IN NUMBER,
        p_empresa_id      IN NUMBER,
        p_sucursal_id     IN NUMBER,
        p_cantidad        IN NUMBER,
        p_referencia_id   IN NUMBER DEFAULT NULL,
        p_referencia_tipo IN VARCHAR2 DEFAULT 'FACTURA_COMPRA',
        p_descripcion     IN VARCHAR2 DEFAULT NULL,
        p_usuario_id      IN NUMBER,
        p_movimiento_id   OUT NUMBER
    );
    
    -- Registrar salida de inventario
    PROCEDURE SP_REGISTRAR_SALIDA (
        p_articulo_id     IN NUMBER,
        p_empresa_id      IN NUMBER,
        p_sucursal_id     IN NUMBER,
        p_cantidad        IN NUMBER,
        p_referencia_id   IN NUMBER DEFAULT NULL,
        p_referencia_tipo IN VARCHAR2 DEFAULT 'TRATAMIENTO',
        p_descripcion     IN VARCHAR2 DEFAULT NULL,
        p_usuario_id      IN NUMBER,
        p_movimiento_id   OUT NUMBER
    );
    
    -- Registrar ajuste de inventario
    PROCEDURE SP_REGISTRAR_AJUSTE (
        p_articulo_id     IN NUMBER,
        p_empresa_id      IN NUMBER,
        p_sucursal_id     IN NUMBER,
        p_cantidad        IN NUMBER, -- Puede ser positiva o negativa
        p_descripcion     IN VARCHAR2,
        p_usuario_id      IN NUMBER,
        p_movimiento_id   OUT NUMBER
    );
    
    -- Registrar devolución de inventario
    PROCEDURE SP_REGISTRAR_DEVOLUCION (
        p_articulo_id     IN NUMBER,
        p_empresa_id      IN NUMBER,
        p_sucursal_id     IN NUMBER,
        p_cantidad        IN NUMBER,
        p_referencia_id   IN NUMBER DEFAULT NULL,
        p_referencia_tipo IN VARCHAR2 DEFAULT 'FACTURA_COMPRA',
        p_descripcion     IN VARCHAR2 DEFAULT NULL,
        p_usuario_id      IN NUMBER,
        p_movimiento_id   OUT NUMBER
    );
    
    -- Listar movimientos de un artículo
    FUNCTION FN_LISTAR_MOVIMIENTOS_ARTICULO (
        p_articulo_id IN NUMBER,
        p_empresa_id  IN NUMBER,
        p_fecha_desde IN DATE DEFAULT NULL,
        p_fecha_hasta IN DATE DEFAULT NULL
    ) RETURN SYS_REFCURSOR;
    
    -- Obtener movimientos por tipo
    FUNCTION FN_LISTAR_MOVIMIENTOS_POR_TIPO (
        p_tipo_movimiento IN VARCHAR2,
        p_empresa_id      IN NUMBER,
        p_sucursal_id     IN NUMBER DEFAULT NULL,
        p_fecha_desde     IN DATE DEFAULT NULL,
        p_fecha_hasta     IN DATE DEFAULT NULL
    ) RETURN SYS_REFCURSOR;
    
    -- =========================================================================
    -- FUNCTIONS PARA REPORTES
    -- =========================================================================
    
    -- Obtener valor total del inventario
    FUNCTION FN_VALOR_INVENTARIO_TOTAL (
        p_empresa_id  IN NUMBER,
        p_sucursal_id IN NUMBER
    ) RETURN NUMBER;
    
    -- Obtener historial de movimientos
    FUNCTION FN_OBTENER_HISTORIAL_MOVIMIENTOS (
        p_articulo_id IN NUMBER,
        p_empresa_id  IN NUMBER,
        p_cantidad_registros IN NUMBER DEFAULT 50
    ) RETURN SYS_REFCURSOR;

END PKG_INVENTARIO;
/

-- =============================================================================
-- PACKAGE BODY: PKG_INVENTARIO
-- =============================================================================

CREATE OR REPLACE PACKAGE BODY PKG_INVENTARIO AS

    -- =========================================================================
    -- PROCEDURES PARA INVENTARIO
    -- =========================================================================
    
    PROCEDURE SP_INICIALIZAR_INVENTARIO (
        p_articulo_id      IN NUMBER,
        p_empresa_id       IN NUMBER,
        p_sucursal_id      IN NUMBER,
        p_cantidad_inicial IN NUMBER DEFAULT 0,
        p_ubicacion        IN VARCHAR2 DEFAULT NULL,
        p_usuario_id       IN NUMBER
    ) IS
        v_costo_articulo NUMBER(12,2);
    BEGIN
        -- Obtener costo del artículo
        SELECT COSTO_UNITARIO INTO v_costo_articulo
        FROM ODO_ARTICULOS
        WHERE ARTICULO_ID = p_articulo_id;
        
        -- Insertar inventario
        INSERT INTO ODO_INVENTARIO (
            ARTICULO_ID, EMPRESA_ID, SUCURSAL_ID,
            CANTIDAD_ACTUAL, UBICACION, COSTO_PROMEDIO,
            CREADO_POR, MODIFICADO_POR
        ) VALUES (
            p_articulo_id, p_empresa_id, p_sucursal_id,
            p_cantidad_inicial, p_ubicacion, v_costo_articulo,
            p_usuario_id, p_usuario_id
        );
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_INICIALIZAR_INVENTARIO;
    
    PROCEDURE SP_ACTUALIZAR_STOCK (
        p_articulo_id IN NUMBER,
        p_empresa_id  IN NUMBER,
        p_sucursal_id IN NUMBER,
        p_cantidad    IN NUMBER,
        p_usuario_id  IN NUMBER
    ) IS
    BEGIN
        UPDATE ODO_INVENTARIO SET
            CANTIDAD_ACTUAL = CANTIDAD_ACTUAL + p_cantidad,
            REQUIERE_REORDEN = CASE 
                WHEN (CANTIDAD_ACTUAL + p_cantidad) < CANTIDAD_MINIMA THEN 'S'
                ELSE 'N'
            END,
            FECHA_ULTIMA_AUDITORIA = SYSDATE,
            MODIFICADO_POR = p_usuario_id,
            FECHA_MODIFICACION = SYSTIMESTAMP
        WHERE ARTICULO_ID = p_articulo_id
          AND EMPRESA_ID = p_empresa_id
          AND SUCURSAL_ID = p_sucursal_id;
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_ACTUALIZAR_STOCK;
    
    FUNCTION FN_OBTENER_STOCK (
        p_articulo_id IN NUMBER,
        p_empresa_id  IN NUMBER,
        p_sucursal_id IN NUMBER
    ) RETURN NUMBER IS
        v_cantidad NUMBER;
    BEGIN
        SELECT CANTIDAD_ACTUAL INTO v_cantidad
        FROM ODO_INVENTARIO
        WHERE ARTICULO_ID = p_articulo_id
          AND EMPRESA_ID = p_empresa_id
          AND SUCURSAL_ID = p_sucursal_id;
        
        RETURN v_cantidad;
    EXCEPTION WHEN NO_DATA_FOUND THEN
        RETURN 0;
    END FN_OBTENER_STOCK;
    
    FUNCTION FN_LISTAR_INVENTARIO_SUCURSAL (
        p_empresa_id  IN NUMBER,
        p_sucursal_id IN NUMBER
    ) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT i.*, a.NOMBRE, a.CODIGO, a.UNIDAD_MEDIDA,
                   c.NOMBRE as CATEGORIA_NOMBRE,
                   (i.CANTIDAD_ACTUAL * i.COSTO_PROMEDIO) as VALOR_TOTAL
            FROM ODO_INVENTARIO i
            JOIN ODO_ARTICULOS a ON i.ARTICULO_ID = a.ARTICULO_ID
            JOIN ODO_CATEGORIAS_ARTICULOS c ON a.CATEGORIA_ID = c.CATEGORIA_ID
            WHERE i.EMPRESA_ID = p_empresa_id AND i.SUCURSAL_ID = p_sucursal_id
            ORDER BY a.CATEGORIA_ID, a.NOMBRE;
        RETURN v_cursor;
    END FN_LISTAR_INVENTARIO_SUCURSAL;
    
    FUNCTION FN_LISTAR_BAJO_STOCK (
        p_empresa_id  IN NUMBER,
        p_sucursal_id IN NUMBER
    ) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT i.*, a.NOMBRE, a.CODIGO, a.UNIDAD_MEDIDA,
                   (i.CANTIDAD_MINIMA - i.CANTIDAD_ACTUAL) as CANTIDAD_NECESARIA
            FROM ODO_INVENTARIO i
            JOIN ODO_ARTICULOS a ON i.ARTICULO_ID = a.ARTICULO_ID
            WHERE i.EMPRESA_ID = p_empresa_id 
              AND i.SUCURSAL_ID = p_sucursal_id
              AND i.REQUIERE_REORDEN = 'S'
            ORDER BY (i.CANTIDAD_MINIMA - i.CANTIDAD_ACTUAL) DESC;
        RETURN v_cursor;
    END FN_LISTAR_BAJO_STOCK;
    
    -- =========================================================================
    -- PROCEDURES PARA MOVIMIENTOS DE INVENTARIO
    -- =========================================================================
    
    PROCEDURE SP_REGISTRAR_ENTRADA (
        p_articulo_id     IN NUMBER,
        p_empresa_id      IN NUMBER,
        p_sucursal_id     IN NUMBER,
        p_cantidad        IN NUMBER,
        p_referencia_id   IN NUMBER DEFAULT NULL,
        p_referencia_tipo IN VARCHAR2 DEFAULT 'FACTURA_COMPRA',
        p_descripcion     IN VARCHAR2 DEFAULT NULL,
        p_usuario_id      IN NUMBER,
        p_movimiento_id   OUT NUMBER
    ) IS
        v_saldo_anterior NUMBER;
        v_saldo_posterior NUMBER;
        v_descripcion VARCHAR2(500);
    BEGIN
        -- Obtener saldo anterior
        BEGIN
            SELECT CANTIDAD_ACTUAL INTO v_saldo_anterior
            FROM ODO_INVENTARIO
            WHERE ARTICULO_ID = p_articulo_id
              AND EMPRESA_ID = p_empresa_id
              AND SUCURSAL_ID = p_sucursal_id;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            v_saldo_anterior := 0;
        END;
        
        v_saldo_posterior := v_saldo_anterior + p_cantidad;
        v_descripcion := COALESCE(p_descripcion, 'Entrada - ' || p_referencia_tipo);
        
        -- Insertar movimiento
        INSERT INTO ODO_MOVIMIENTOS_INVENTARIO (
            ARTICULO_ID, EMPRESA_ID, SUCURSAL_ID, TIPO_MOVIMIENTO,
            CANTIDAD, REFERENCIA_ID, REFERENCIA_TIPO, DESCRIPCION,
            SALDO_ANTERIOR, SALDO_POSTERIOR, REGISTRADO_POR
        ) VALUES (
            p_articulo_id, p_empresa_id, p_sucursal_id, 'ENTRADA',
            p_cantidad, p_referencia_id, p_referencia_tipo, v_descripcion,
            v_saldo_anterior, v_saldo_posterior, p_usuario_id
        ) RETURNING MOVIMIENTO_ID INTO p_movimiento_id;
        
        -- Actualizar stock
        SP_ACTUALIZAR_STOCK(p_articulo_id, p_empresa_id, p_sucursal_id, p_cantidad, p_usuario_id);
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_REGISTRAR_ENTRADA;
    
    PROCEDURE SP_REGISTRAR_SALIDA (
        p_articulo_id     IN NUMBER,
        p_empresa_id      IN NUMBER,
        p_sucursal_id     IN NUMBER,
        p_cantidad        IN NUMBER,
        p_referencia_id   IN NUMBER DEFAULT NULL,
        p_referencia_tipo IN VARCHAR2 DEFAULT 'TRATAMIENTO',
        p_descripcion     IN VARCHAR2 DEFAULT NULL,
        p_usuario_id      IN NUMBER,
        p_movimiento_id   OUT NUMBER
    ) IS
        v_saldo_anterior NUMBER;
        v_saldo_posterior NUMBER;
        v_descripcion VARCHAR2(500);
        v_cantidad_disponible NUMBER;
    BEGIN
        -- Obtener saldo anterior
        BEGIN
            SELECT CANTIDAD_ACTUAL INTO v_saldo_anterior
            FROM ODO_INVENTARIO
            WHERE ARTICULO_ID = p_articulo_id
              AND EMPRESA_ID = p_empresa_id
              AND SUCURSAL_ID = p_sucursal_id;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            v_saldo_anterior := 0;
        END;
        
        -- Validar que hay stock disponible
        IF v_saldo_anterior < p_cantidad THEN
            RAISE_APPLICATION_ERROR(-20001, 'Stock insuficiente. Disponible: ' || v_saldo_anterior);
        END IF;
        
        v_saldo_posterior := v_saldo_anterior - p_cantidad;
        v_descripcion := COALESCE(p_descripcion, 'Salida - ' || p_referencia_tipo);
        
        -- Insertar movimiento
        INSERT INTO ODO_MOVIMIENTOS_INVENTARIO (
            ARTICULO_ID, EMPRESA_ID, SUCURSAL_ID, TIPO_MOVIMIENTO,
            CANTIDAD, REFERENCIA_ID, REFERENCIA_TIPO, DESCRIPCION,
            SALDO_ANTERIOR, SALDO_POSTERIOR, REGISTRADO_POR
        ) VALUES (
            p_articulo_id, p_empresa_id, p_sucursal_id, 'SALIDA',
            p_cantidad, p_referencia_id, p_referencia_tipo, v_descripcion,
            v_saldo_anterior, v_saldo_posterior, p_usuario_id
        ) RETURNING MOVIMIENTO_ID INTO p_movimiento_id;
        
        -- Actualizar stock
        SP_ACTUALIZAR_STOCK(p_articulo_id, p_empresa_id, p_sucursal_id, -p_cantidad, p_usuario_id);
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_REGISTRAR_SALIDA;
    
    PROCEDURE SP_REGISTRAR_AJUSTE (
        p_articulo_id IN NUMBER,
        p_empresa_id  IN NUMBER,
        p_sucursal_id IN NUMBER,
        p_cantidad    IN NUMBER,
        p_descripcion IN VARCHAR2,
        p_usuario_id  IN NUMBER,
        p_movimiento_id OUT NUMBER
    ) IS
        v_saldo_anterior NUMBER;
        v_saldo_posterior NUMBER;
        v_tipo_movimiento VARCHAR2(20);
    BEGIN
        -- Obtener saldo anterior
        BEGIN
            SELECT CANTIDAD_ACTUAL INTO v_saldo_anterior
            FROM ODO_INVENTARIO
            WHERE ARTICULO_ID = p_articulo_id
              AND EMPRESA_ID = p_empresa_id
              AND SUCURSAL_ID = p_sucursal_id;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            v_saldo_anterior := 0;
        END;
        
        v_saldo_posterior := v_saldo_anterior + p_cantidad;
        v_tipo_movimiento := CASE WHEN p_cantidad > 0 THEN 'AJUSTE' ELSE 'AJUSTE' END;
        
        -- Insertar movimiento
        INSERT INTO ODO_MOVIMIENTOS_INVENTARIO (
            ARTICULO_ID, EMPRESA_ID, SUCURSAL_ID, TIPO_MOVIMIENTO,
            CANTIDAD, DESCRIPCION, SALDO_ANTERIOR, SALDO_POSTERIOR,
            REGISTRADO_POR
        ) VALUES (
            p_articulo_id, p_empresa_id, p_sucursal_id, v_tipo_movimiento,
            ABS(p_cantidad), p_descripcion, v_saldo_anterior, v_saldo_posterior,
            p_usuario_id
        ) RETURNING MOVIMIENTO_ID INTO p_movimiento_id;
        
        -- Actualizar stock
        SP_ACTUALIZAR_STOCK(p_articulo_id, p_empresa_id, p_sucursal_id, p_cantidad, p_usuario_id);
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_REGISTRAR_AJUSTE;
    
    PROCEDURE SP_REGISTRAR_DEVOLUCION (
        p_articulo_id     IN NUMBER,
        p_empresa_id      IN NUMBER,
        p_sucursal_id     IN NUMBER,
        p_cantidad        IN NUMBER,
        p_referencia_id   IN NUMBER DEFAULT NULL,
        p_referencia_tipo IN VARCHAR2 DEFAULT 'FACTURA_COMPRA',
        p_descripcion     IN VARCHAR2 DEFAULT NULL,
        p_usuario_id      IN NUMBER,
        p_movimiento_id   OUT NUMBER
    ) IS
        v_saldo_anterior NUMBER;
        v_saldo_posterior NUMBER;
        v_descripcion VARCHAR2(500);
    BEGIN
        -- Obtener saldo anterior
        BEGIN
            SELECT CANTIDAD_ACTUAL INTO v_saldo_anterior
            FROM ODO_INVENTARIO
            WHERE ARTICULO_ID = p_articulo_id
              AND EMPRESA_ID = p_empresa_id
              AND SUCURSAL_ID = p_sucursal_id;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            v_saldo_anterior := 0;
        END;
        
        v_saldo_posterior := v_saldo_anterior + p_cantidad;
        v_descripcion := COALESCE(p_descripcion, 'Devolución - ' || p_referencia_tipo);
        
        -- Insertar movimiento
        INSERT INTO ODO_MOVIMIENTOS_INVENTARIO (
            ARTICULO_ID, EMPRESA_ID, SUCURSAL_ID, TIPO_MOVIMIENTO,
            CANTIDAD, REFERENCIA_ID, REFERENCIA_TIPO, DESCRIPCION,
            SALDO_ANTERIOR, SALDO_POSTERIOR, REGISTRADO_POR
        ) VALUES (
            p_articulo_id, p_empresa_id, p_sucursal_id, 'DEVOLUCION',
            p_cantidad, p_referencia_id, p_referencia_tipo, v_descripcion,
            v_saldo_anterior, v_saldo_posterior, p_usuario_id
        ) RETURNING MOVIMIENTO_ID INTO p_movimiento_id;
        
        -- Actualizar stock
        SP_ACTUALIZAR_STOCK(p_articulo_id, p_empresa_id, p_sucursal_id, p_cantidad, p_usuario_id);
        
        COMMIT;
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END SP_REGISTRAR_DEVOLUCION;
    
    FUNCTION FN_LISTAR_MOVIMIENTOS_ARTICULO (
        p_articulo_id IN NUMBER,
        p_empresa_id  IN NUMBER,
        p_fecha_desde IN DATE DEFAULT NULL,
        p_fecha_hasta IN DATE DEFAULT NULL
    ) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT m.*, a.NOMBRE, a.CODIGO
            FROM ODO_MOVIMIENTOS_INVENTARIO m
            JOIN ODO_ARTICULOS a ON m.ARTICULO_ID = a.ARTICULO_ID
            WHERE m.ARTICULO_ID = p_articulo_id
              AND m.EMPRESA_ID = p_empresa_id
              AND (p_fecha_desde IS NULL OR TRUNC(m.FECHA_MOVIMIENTO) >= p_fecha_desde)
              AND (p_fecha_hasta IS NULL OR TRUNC(m.FECHA_MOVIMIENTO) <= p_fecha_hasta)
            ORDER BY m.FECHA_MOVIMIENTO DESC;
        RETURN v_cursor;
    END FN_LISTAR_MOVIMIENTOS_ARTICULO;
    
    FUNCTION FN_LISTAR_MOVIMIENTOS_POR_TIPO (
        p_tipo_movimiento IN VARCHAR2,
        p_empresa_id      IN NUMBER,
        p_sucursal_id     IN NUMBER DEFAULT NULL,
        p_fecha_desde     IN DATE DEFAULT NULL,
        p_fecha_hasta     IN DATE DEFAULT NULL
    ) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT m.*, a.NOMBRE, a.CODIGO
            FROM ODO_MOVIMIENTOS_INVENTARIO m
            JOIN ODO_ARTICULOS a ON m.ARTICULO_ID = a.ARTICULO_ID
            WHERE m.TIPO_MOVIMIENTO = p_tipo_movimiento
              AND m.EMPRESA_ID = p_empresa_id
              AND (p_sucursal_id IS NULL OR m.SUCURSAL_ID = p_sucursal_id)
              AND (p_fecha_desde IS NULL OR TRUNC(m.FECHA_MOVIMIENTO) >= p_fecha_desde)
              AND (p_fecha_hasta IS NULL OR TRUNC(m.FECHA_MOVIMIENTO) <= p_fecha_hasta)
            ORDER BY m.FECHA_MOVIMIENTO DESC;
        RETURN v_cursor;
    END FN_LISTAR_MOVIMIENTOS_POR_TIPO;
    
    -- =========================================================================
    -- FUNCTIONS PARA REPORTES
    -- =========================================================================
    
    FUNCTION FN_VALOR_INVENTARIO_TOTAL (
        p_empresa_id  IN NUMBER,
        p_sucursal_id IN NUMBER
    ) RETURN NUMBER IS
        v_valor_total NUMBER(15,2);
    BEGIN
        SELECT COALESCE(SUM(CANTIDAD_ACTUAL * COSTO_PROMEDIO), 0)
        INTO v_valor_total
        FROM ODO_INVENTARIO
        WHERE EMPRESA_ID = p_empresa_id AND SUCURSAL_ID = p_sucursal_id;
        
        RETURN v_valor_total;
    END FN_VALOR_INVENTARIO_TOTAL;
    
    FUNCTION FN_OBTENER_HISTORIAL_MOVIMIENTOS (
        p_articulo_id IN NUMBER,
        p_empresa_id  IN NUMBER,
        p_cantidad_registros IN NUMBER DEFAULT 50
    ) RETURN SYS_REFCURSOR IS
        v_cursor SYS_REFCURSOR;
    BEGIN
        OPEN v_cursor FOR
            SELECT m.*, a.NOMBRE, a.CODIGO
            FROM (
                SELECT * FROM ODO_MOVIMIENTOS_INVENTARIO
                WHERE ARTICULO_ID = p_articulo_id
                  AND EMPRESA_ID = p_empresa_id
                ORDER BY FECHA_MOVIMIENTO DESC
                FETCH FIRST p_cantidad_registros ROWS ONLY
            ) m
            JOIN ODO_ARTICULOS a ON m.ARTICULO_ID = a.ARTICULO_ID
            ORDER BY m.FECHA_MOVIMIENTO DESC;
        RETURN v_cursor;
    END FN_OBTENER_HISTORIAL_MOVIMIENTOS;

END PKG_INVENTARIO;
/

SHOW ERRORS;
