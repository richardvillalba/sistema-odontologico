-- =============================================================================
-- PKG_CAJA - Package de gestión de caja
-- =============================================================================

CREATE OR REPLACE PACKAGE PKG_CAJA AS

    TYPE t_cursor IS REF CURSOR;

    -- =========================================================================
    -- CAJAS
    -- =========================================================================

    -- Listar cajas de una empresa
    PROCEDURE listar_cajas(
        p_empresa_id   IN NUMBER,
        p_estado       IN VARCHAR2 DEFAULT NULL,
        p_cursor       OUT t_cursor,
        p_resultado    OUT NUMBER,
        p_mensaje      OUT VARCHAR2
    );

    -- Obtener caja por ID
    PROCEDURE get_caja(
        p_caja_id      IN NUMBER,
        p_cursor       OUT t_cursor,
        p_resultado    OUT NUMBER,
        p_mensaje      OUT VARCHAR2
    );

    -- Obtener caja abierta de un usuario
    PROCEDURE get_caja_activa_usuario(
        p_empresa_id    IN NUMBER,
        p_usuario_id    IN NUMBER,
        p_cursor        OUT t_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Crear nueva caja (sin abrir)
    PROCEDURE crear_caja(
        p_empresa_id           IN NUMBER,
        p_nombre               IN VARCHAR2,
        p_descripcion          IN VARCHAR2 DEFAULT NULL,
        p_usuario_asignado_id  IN NUMBER DEFAULT NULL,
        p_creado_por           IN NUMBER,
        p_caja_id              OUT NUMBER,
        p_resultado            OUT NUMBER,
        p_mensaje              OUT VARCHAR2
    );

    -- Abrir caja (iniciar sesión de caja)
    PROCEDURE abrir_caja(
        p_caja_id        IN NUMBER,
        p_saldo_inicial  IN NUMBER,
        p_usuario_id     IN NUMBER,
        p_observaciones  IN VARCHAR2 DEFAULT NULL,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    );

    -- Cerrar caja (finalizar sesión con arqueo)
    PROCEDURE cerrar_caja(
        p_caja_id        IN NUMBER,
        p_usuario_id     IN NUMBER,
        p_observaciones  IN VARCHAR2 DEFAULT NULL,
        p_saldo_final    OUT NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    );

    -- Editar datos de una caja
    PROCEDURE editar_caja(
        p_caja_id              IN NUMBER,
        p_nombre               IN VARCHAR2,
        p_descripcion          IN VARCHAR2 DEFAULT NULL,
        p_usuario_asignado_id  IN NUMBER DEFAULT NULL,
        p_modificado_por       IN NUMBER,
        p_resultado            OUT NUMBER,
        p_mensaje              OUT VARCHAR2
    );

    -- =========================================================================
    -- MOVIMIENTOS
    -- =========================================================================

    -- Registrar movimiento de caja (ingreso o egreso)
    PROCEDURE registrar_movimiento(
        p_caja_id        IN NUMBER,
        p_tipo           IN VARCHAR2,  -- INGRESO / EGRESO
        p_categoria_id   IN NUMBER DEFAULT NULL,
        p_concepto       IN VARCHAR2,
        p_monto          IN NUMBER,
        p_referencia     IN VARCHAR2 DEFAULT NULL,
        p_factura_id     IN NUMBER DEFAULT NULL,
        p_registrado_por IN NUMBER,
        p_observaciones  IN VARCHAR2 DEFAULT NULL,
        p_movimiento_id  OUT NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    );

    -- Listar movimientos de una caja
    PROCEDURE listar_movimientos(
        p_caja_id      IN NUMBER,
        p_tipo         IN VARCHAR2 DEFAULT NULL,
        p_fecha_desde  IN DATE DEFAULT NULL,
        p_fecha_hasta  IN DATE DEFAULT NULL,
        p_cursor       OUT t_cursor,
        p_resultado    OUT NUMBER,
        p_mensaje      OUT VARCHAR2
    );

    -- Resumen de caja (totales por tipo y categoría)
    PROCEDURE get_resumen_caja(
        p_caja_id    IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );

    -- =========================================================================
    -- CATEGORÍAS DE MOVIMIENTO
    -- =========================================================================

    -- Listar categorías
    PROCEDURE listar_categorias(
        p_tipo       IN VARCHAR2 DEFAULT NULL,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    );

    -- Crear categoría
    PROCEDURE crear_categoria(
        p_nombre       IN VARCHAR2,
        p_tipo         IN VARCHAR2,
        p_descripcion  IN VARCHAR2 DEFAULT NULL,
        p_creado_por   IN NUMBER,
        p_categoria_id OUT NUMBER,
        p_resultado    OUT NUMBER,
        p_mensaje      OUT VARCHAR2
    );

END PKG_CAJA;
/

CREATE OR REPLACE PACKAGE BODY PKG_CAJA AS

    -- =========================================================================
    -- LISTAR_CAJAS
    -- =========================================================================
    PROCEDURE listar_cajas(
        p_empresa_id   IN NUMBER,
        p_estado       IN VARCHAR2 DEFAULT NULL,
        p_cursor       OUT t_cursor,
        p_resultado    OUT NUMBER,
        p_mensaje      OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                c.CAJA_ID,
                c.EMPRESA_ID,
                c.NOMBRE,
                c.DESCRIPCION,
                c.USUARIO_ASIGNADO_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS NOMBRE_USUARIO,
                c.SALDO_INICIAL,
                c.SALDO_FINAL,
                c.TOTAL_INGRESOS,
                c.TOTAL_EGRESOS,
                (c.SALDO_INICIAL + c.TOTAL_INGRESOS - c.TOTAL_EGRESOS) AS SALDO_ACTUAL,
                c.ESTADO,
                c.FECHA_APERTURA,
                c.FECHA_CIERRE,
                c.OBSERVACIONES,
                c.FECHA_CREACION
            FROM ODO_CAJAS c
            LEFT JOIN ODO_USUARIOS u ON u.USUARIO_ID = c.USUARIO_ASIGNADO_ID
            WHERE c.EMPRESA_ID = p_empresa_id
              AND (p_estado IS NULL OR c.ESTADO = p_estado)
            ORDER BY c.ESTADO DESC, c.FECHA_APERTURA DESC NULLS LAST, c.NOMBRE;
        p_resultado := 1;
        p_mensaje   := 'OK';
    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje   := 'Error al listar cajas: ' || SQLERRM;
    END listar_cajas;

    -- =========================================================================
    -- GET_CAJA
    -- =========================================================================
    PROCEDURE get_caja(
        p_caja_id      IN NUMBER,
        p_cursor       OUT t_cursor,
        p_resultado    OUT NUMBER,
        p_mensaje      OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                c.CAJA_ID,
                c.EMPRESA_ID,
                c.NOMBRE,
                c.DESCRIPCION,
                c.USUARIO_ASIGNADO_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS NOMBRE_USUARIO,
                c.SALDO_INICIAL,
                c.SALDO_FINAL,
                c.TOTAL_INGRESOS,
                c.TOTAL_EGRESOS,
                (c.SALDO_INICIAL + c.TOTAL_INGRESOS - c.TOTAL_EGRESOS) AS SALDO_ACTUAL,
                c.ESTADO,
                c.FECHA_APERTURA,
                c.FECHA_CIERRE,
                c.OBSERVACIONES,
                c.FECHA_CREACION
            FROM ODO_CAJAS c
            LEFT JOIN ODO_USUARIOS u ON u.USUARIO_ID = c.USUARIO_ASIGNADO_ID
            WHERE c.CAJA_ID = p_caja_id;
        p_resultado := 1;
        p_mensaje   := 'OK';
    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje   := 'Error al obtener caja: ' || SQLERRM;
    END get_caja;

    -- =========================================================================
    -- GET_CAJA_ACTIVA_USUARIO
    -- =========================================================================
    PROCEDURE get_caja_activa_usuario(
        p_empresa_id    IN NUMBER,
        p_usuario_id    IN NUMBER,
        p_cursor        OUT t_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                c.CAJA_ID,
                c.EMPRESA_ID,
                c.NOMBRE,
                c.DESCRIPCION,
                c.USUARIO_ASIGNADO_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS NOMBRE_USUARIO,
                c.SALDO_INICIAL,
                c.SALDO_FINAL,
                c.TOTAL_INGRESOS,
                c.TOTAL_EGRESOS,
                (c.SALDO_INICIAL + c.TOTAL_INGRESOS - c.TOTAL_EGRESOS) AS SALDO_ACTUAL,
                c.ESTADO,
                c.FECHA_APERTURA,
                c.FECHA_CIERRE,
                c.OBSERVACIONES
            FROM ODO_CAJAS c
            LEFT JOIN ODO_USUARIOS u ON u.USUARIO_ID = c.USUARIO_ASIGNADO_ID
            WHERE c.EMPRESA_ID = p_empresa_id
              AND c.ESTADO = 'ABIERTA'
              AND (c.USUARIO_ASIGNADO_ID = p_usuario_id OR c.USUARIO_ASIGNADO_ID IS NULL)
            ORDER BY c.FECHA_APERTURA DESC
            FETCH FIRST 1 ROW ONLY;
        p_resultado := 1;
        p_mensaje   := 'OK';
    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje   := 'Error al obtener caja activa: ' || SQLERRM;
    END get_caja_activa_usuario;

    -- =========================================================================
    -- CREAR_CAJA
    -- =========================================================================
    PROCEDURE crear_caja(
        p_empresa_id           IN NUMBER,
        p_nombre               IN VARCHAR2,
        p_descripcion          IN VARCHAR2 DEFAULT NULL,
        p_usuario_asignado_id  IN NUMBER DEFAULT NULL,
        p_creado_por           IN NUMBER,
        p_caja_id              OUT NUMBER,
        p_resultado            OUT NUMBER,
        p_mensaje              OUT VARCHAR2
    ) IS
        v_count NUMBER;
    BEGIN
        -- Validar nombre único en empresa
        SELECT COUNT(*) INTO v_count
        FROM ODO_CAJAS
        WHERE EMPRESA_ID = p_empresa_id
          AND UPPER(NOMBRE) = UPPER(p_nombre);
        IF v_count > 0 THEN
            p_resultado := 0;
            p_mensaje   := 'Ya existe una caja con ese nombre en la empresa';
            RETURN;
        END IF;

        INSERT INTO ODO_CAJAS (
            EMPRESA_ID, NOMBRE, DESCRIPCION,
            USUARIO_ASIGNADO_ID, ESTADO,
            TOTAL_INGRESOS, TOTAL_EGRESOS,
            SALDO_INICIAL, CREADO_POR
        ) VALUES (
            p_empresa_id, p_nombre, p_descripcion,
            p_usuario_asignado_id, 'CERRADA',
            0, 0, 0, p_creado_por
        ) RETURNING CAJA_ID INTO p_caja_id;

        COMMIT;
        p_resultado := 1;
        p_mensaje   := 'Caja creada exitosamente';
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje   := 'Error al crear caja: ' || SQLERRM;
    END crear_caja;

    -- =========================================================================
    -- ABRIR_CAJA
    -- =========================================================================
    PROCEDURE abrir_caja(
        p_caja_id        IN NUMBER,
        p_saldo_inicial  IN NUMBER,
        p_usuario_id     IN NUMBER,
        p_observaciones  IN VARCHAR2 DEFAULT NULL,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    ) IS
        v_estado VARCHAR2(8);
    BEGIN
        -- Verificar estado actual
        SELECT ESTADO INTO v_estado FROM ODO_CAJAS WHERE CAJA_ID = p_caja_id;
        IF v_estado = 'ABIERTA' THEN
            p_resultado := 0;
            p_mensaje   := 'La caja ya está abierta';
            RETURN;
        END IF;

        UPDATE ODO_CAJAS
        SET ESTADO           = 'ABIERTA',
            SALDO_INICIAL    = p_saldo_inicial,
            SALDO_FINAL      = NULL,
            TOTAL_INGRESOS   = 0,
            TOTAL_EGRESOS    = 0,
            FECHA_APERTURA   = SYSTIMESTAMP,
            FECHA_CIERRE     = NULL,
            OBSERVACIONES    = p_observaciones,
            MODIFICADO_POR   = p_usuario_id,
            FECHA_MODIFICACION = SYSTIMESTAMP
        WHERE CAJA_ID = p_caja_id;

        COMMIT;
        p_resultado := 1;
        p_mensaje   := 'Caja abierta exitosamente';
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_resultado := 0;
            p_mensaje   := 'Caja no encontrada';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje   := 'Error al abrir caja: ' || SQLERRM;
    END abrir_caja;

    -- =========================================================================
    -- CERRAR_CAJA
    -- =========================================================================
    PROCEDURE cerrar_caja(
        p_caja_id        IN NUMBER,
        p_usuario_id     IN NUMBER,
        p_observaciones  IN VARCHAR2 DEFAULT NULL,
        p_saldo_final    OUT NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    ) IS
        v_estado        VARCHAR2(8);
        v_saldo_inicial NUMBER(15,2);
        v_ingresos      NUMBER(15,2);
        v_egresos       NUMBER(15,2);
    BEGIN
        -- Obtener datos actuales
        SELECT ESTADO, SALDO_INICIAL, TOTAL_INGRESOS, TOTAL_EGRESOS
        INTO v_estado, v_saldo_inicial, v_ingresos, v_egresos
        FROM ODO_CAJAS WHERE CAJA_ID = p_caja_id;

        IF v_estado = 'CERRADA' THEN
            p_resultado := 0;
            p_mensaje   := 'La caja ya está cerrada';
            RETURN;
        END IF;

        p_saldo_final := v_saldo_inicial + v_ingresos - v_egresos;

        UPDATE ODO_CAJAS
        SET ESTADO             = 'CERRADA',
            SALDO_FINAL        = p_saldo_final,
            FECHA_CIERRE       = SYSTIMESTAMP,
            OBSERVACIONES      = NVL(p_observaciones, OBSERVACIONES),
            MODIFICADO_POR     = p_usuario_id,
            FECHA_MODIFICACION = SYSTIMESTAMP
        WHERE CAJA_ID = p_caja_id;

        COMMIT;
        p_resultado := 1;
        p_mensaje   := 'Caja cerrada exitosamente. Saldo final: ' || TO_CHAR(p_saldo_final, 'FM999,999,990.00');
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_resultado := 0;
            p_mensaje   := 'Caja no encontrada';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje   := 'Error al cerrar caja: ' || SQLERRM;
    END cerrar_caja;

    -- =========================================================================
    -- EDITAR_CAJA
    -- =========================================================================
    PROCEDURE editar_caja(
        p_caja_id              IN NUMBER,
        p_nombre               IN VARCHAR2,
        p_descripcion          IN VARCHAR2 DEFAULT NULL,
        p_usuario_asignado_id  IN NUMBER DEFAULT NULL,
        p_modificado_por       IN NUMBER,
        p_resultado            OUT NUMBER,
        p_mensaje              OUT VARCHAR2
    ) IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM ODO_CAJAS
        WHERE UPPER(NOMBRE) = UPPER(p_nombre)
          AND EMPRESA_ID = (SELECT EMPRESA_ID FROM ODO_CAJAS WHERE CAJA_ID = p_caja_id)
          AND CAJA_ID != p_caja_id;
        IF v_count > 0 THEN
            p_resultado := 0;
            p_mensaje   := 'Ya existe otra caja con ese nombre';
            RETURN;
        END IF;

        UPDATE ODO_CAJAS
        SET NOMBRE               = p_nombre,
            DESCRIPCION          = p_descripcion,
            USUARIO_ASIGNADO_ID  = p_usuario_asignado_id,
            MODIFICADO_POR       = p_modificado_por,
            FECHA_MODIFICACION   = SYSTIMESTAMP
        WHERE CAJA_ID = p_caja_id;

        COMMIT;
        p_resultado := 1;
        p_mensaje   := 'Caja actualizada exitosamente';
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje   := 'Error al actualizar caja: ' || SQLERRM;
    END editar_caja;

    -- =========================================================================
    -- REGISTRAR_MOVIMIENTO
    -- =========================================================================
    PROCEDURE registrar_movimiento(
        p_caja_id        IN NUMBER,
        p_tipo           IN VARCHAR2,
        p_categoria_id   IN NUMBER DEFAULT NULL,
        p_concepto       IN VARCHAR2,
        p_monto          IN NUMBER,
        p_referencia     IN VARCHAR2 DEFAULT NULL,
        p_factura_id     IN NUMBER DEFAULT NULL,
        p_registrado_por IN NUMBER,
        p_observaciones  IN VARCHAR2 DEFAULT NULL,
        p_movimiento_id  OUT NUMBER,
        p_resultado      OUT NUMBER,
        p_mensaje        OUT VARCHAR2
    ) IS
        v_estado VARCHAR2(8);
    BEGIN
        -- Validar que la caja esté abierta
        SELECT ESTADO INTO v_estado FROM ODO_CAJAS WHERE CAJA_ID = p_caja_id;
        IF v_estado != 'ABIERTA' THEN
            p_resultado := 0;
            p_mensaje   := 'La caja debe estar abierta para registrar movimientos';
            RETURN;
        END IF;

        IF p_monto <= 0 THEN
            p_resultado := 0;
            p_mensaje   := 'El monto debe ser mayor a cero';
            RETURN;
        END IF;

        INSERT INTO ODO_MOVIMIENTOS_CAJA (
            CAJA_ID, TIPO, CATEGORIA_ID, CONCEPTO,
            MONTO, REFERENCIA, FACTURA_ID,
            REGISTRADO_POR, OBSERVACIONES, FECHA_HORA
        ) VALUES (
            p_caja_id, p_tipo, p_categoria_id, p_concepto,
            p_monto, p_referencia, p_factura_id,
            p_registrado_por, p_observaciones, SYSTIMESTAMP
        ) RETURNING MOVIMIENTO_ID INTO p_movimiento_id;

        -- Actualizar totales en la caja
        IF p_tipo = 'INGRESO' THEN
            UPDATE ODO_CAJAS SET TOTAL_INGRESOS = TOTAL_INGRESOS + p_monto WHERE CAJA_ID = p_caja_id;
        ELSE
            UPDATE ODO_CAJAS SET TOTAL_EGRESOS = TOTAL_EGRESOS + p_monto WHERE CAJA_ID = p_caja_id;
        END IF;

        COMMIT;
        p_resultado := 1;
        p_mensaje   := 'Movimiento registrado exitosamente';
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_resultado := 0;
            p_mensaje   := 'Caja no encontrada';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje   := 'Error al registrar movimiento: ' || SQLERRM;
    END registrar_movimiento;

    -- =========================================================================
    -- LISTAR_MOVIMIENTOS
    -- =========================================================================
    PROCEDURE listar_movimientos(
        p_caja_id      IN NUMBER,
        p_tipo         IN VARCHAR2 DEFAULT NULL,
        p_fecha_desde  IN DATE DEFAULT NULL,
        p_fecha_hasta  IN DATE DEFAULT NULL,
        p_cursor       OUT t_cursor,
        p_resultado    OUT NUMBER,
        p_mensaje      OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                m.MOVIMIENTO_ID,
                m.CAJA_ID,
                m.TIPO,
                m.CATEGORIA_ID,
                cat.NOMBRE AS CATEGORIA_NOMBRE,
                m.CONCEPTO,
                m.MONTO,
                m.REFERENCIA,
                m.FACTURA_ID,
                m.REGISTRADO_POR,
                u.NOMBRE || ' ' || u.APELLIDO AS NOMBRE_USUARIO,
                m.FECHA_HORA,
                m.OBSERVACIONES
            FROM ODO_MOVIMIENTOS_CAJA m
            LEFT JOIN ODO_CATEGORIAS_MOVIMIENTO_CAJA cat ON cat.CATEGORIA_ID = m.CATEGORIA_ID
            LEFT JOIN ODO_USUARIOS u ON u.USUARIO_ID = m.REGISTRADO_POR
            WHERE m.CAJA_ID = p_caja_id
              AND (p_tipo IS NULL OR m.TIPO = p_tipo)
              AND (p_fecha_desde IS NULL OR TRUNC(m.FECHA_HORA) >= p_fecha_desde)
              AND (p_fecha_hasta IS NULL OR TRUNC(m.FECHA_HORA) <= p_fecha_hasta)
            ORDER BY m.FECHA_HORA DESC;
        p_resultado := 1;
        p_mensaje   := 'OK';
    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje   := 'Error al listar movimientos: ' || SQLERRM;
    END listar_movimientos;

    -- =========================================================================
    -- GET_RESUMEN_CAJA
    -- =========================================================================
    PROCEDURE get_resumen_caja(
        p_caja_id    IN NUMBER,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                m.TIPO,
                cat.NOMBRE AS CATEGORIA,
                COUNT(*) AS CANTIDAD,
                SUM(m.MONTO) AS TOTAL
            FROM ODO_MOVIMIENTOS_CAJA m
            LEFT JOIN ODO_CATEGORIAS_MOVIMIENTO_CAJA cat ON cat.CATEGORIA_ID = m.CATEGORIA_ID
            WHERE m.CAJA_ID = p_caja_id
            GROUP BY m.TIPO, cat.NOMBRE
            ORDER BY m.TIPO, cat.NOMBRE;
        p_resultado := 1;
        p_mensaje   := 'OK';
    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje   := 'Error al obtener resumen: ' || SQLERRM;
    END get_resumen_caja;

    -- =========================================================================
    -- LISTAR_CATEGORIAS
    -- =========================================================================
    PROCEDURE listar_categorias(
        p_tipo       IN VARCHAR2 DEFAULT NULL,
        p_cursor     OUT t_cursor,
        p_resultado  OUT NUMBER,
        p_mensaje    OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT CATEGORIA_ID, NOMBRE, TIPO, DESCRIPCION, ACTIVO
            FROM ODO_CATEGORIAS_MOVIMIENTO_CAJA
            WHERE (p_tipo IS NULL OR TIPO = p_tipo)
              AND ACTIVO = 'S'
            ORDER BY TIPO, NOMBRE;
        p_resultado := 1;
        p_mensaje   := 'OK';
    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje   := 'Error al listar categorías: ' || SQLERRM;
    END listar_categorias;

    -- =========================================================================
    -- CREAR_CATEGORIA
    -- =========================================================================
    PROCEDURE crear_categoria(
        p_nombre       IN VARCHAR2,
        p_tipo         IN VARCHAR2,
        p_descripcion  IN VARCHAR2 DEFAULT NULL,
        p_creado_por   IN NUMBER,
        p_categoria_id OUT NUMBER,
        p_resultado    OUT NUMBER,
        p_mensaje      OUT VARCHAR2
    ) IS
    BEGIN
        INSERT INTO ODO_CATEGORIAS_MOVIMIENTO_CAJA
            (NOMBRE, TIPO, DESCRIPCION, CREADO_POR)
        VALUES
            (p_nombre, p_tipo, p_descripcion, p_creado_por)
        RETURNING CATEGORIA_ID INTO p_categoria_id;
        COMMIT;
        p_resultado := 1;
        p_mensaje   := 'Categoría creada exitosamente';
    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            p_resultado := 0;
            p_mensaje   := 'Ya existe una categoría con ese nombre y tipo';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje   := 'Error al crear categoría: ' || SQLERRM;
    END crear_categoria;

END PKG_CAJA;
/
