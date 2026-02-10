-- ========================================
-- PACKAGE PKG_SEGURIDAD - BODY
-- ========================================
CREATE OR REPLACE PACKAGE BODY PKG_SEGURIDAD AS

    -- Verificar si un usuario tiene acceso a un programa
    FUNCTION TIENE_ACCESO_PROGRAMA(
        p_usuario_id IN NUMBER,
        p_codigo_programa IN VARCHAR2
    ) RETURN CHAR IS
        v_count NUMBER;
        v_es_admin CHAR(1) := 'N';
    BEGIN
        -- Verificar si es administrador
        BEGIN
            SELECT CASE WHEN r.CODIGO = 'ADMIN' THEN 'S' ELSE 'N' END
            INTO v_es_admin
            FROM ODO_USUARIOS u
            INNER JOIN ODO_ROLES r ON u.ROL_ID = r.ROL_ID
            WHERE u.USUARIO_ID = p_usuario_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                v_es_admin := 'N';
        END;

        -- Admin tiene acceso a todo
        IF v_es_admin = 'S' THEN
            RETURN 'S';
        END IF;

        -- Verificar acceso al programa
        SELECT COUNT(*)
        INTO v_count
        FROM ODO_USUARIOS u
        INNER JOIN ODO_ROLES r ON u.ROL_ID = r.ROL_ID
        INNER JOIN ODO_ROL_PROGRAMAS rp ON r.ROL_ID = rp.ROL_ID
        INNER JOIN ODO_PROGRAMAS p ON rp.PROGRAMA_ID = p.PROGRAMA_ID
        WHERE u.USUARIO_ID = p_usuario_id
          AND p.CODIGO = p_codigo_programa
          AND p.ACTIVO = 'S'
          AND r.ACTIVO = 'S';

        RETURN CASE WHEN v_count > 0 THEN 'S' ELSE 'N' END;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN 'N';
        WHEN OTHERS THEN
            RETURN 'N';
    END TIENE_ACCESO_PROGRAMA;

    -- Verificar si un usuario tiene un permiso específico
    FUNCTION TIENE_PERMISO(
        p_usuario_id IN NUMBER,
        p_codigo_permiso IN VARCHAR2
    ) RETURN CHAR IS
        v_count NUMBER;
        v_es_admin CHAR(1) := 'N';
    BEGIN
        -- Verificar si es administrador
        BEGIN
            SELECT CASE WHEN r.CODIGO = 'ADMIN' THEN 'S' ELSE 'N' END
            INTO v_es_admin
            FROM ODO_USUARIOS u
            INNER JOIN ODO_ROLES r ON u.ROL_ID = r.ROL_ID
            WHERE u.USUARIO_ID = p_usuario_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                v_es_admin := 'N';
        END;

        -- Admin tiene todos los permisos
        IF v_es_admin = 'S' THEN
            RETURN 'S';
        END IF;

        -- Verificar permiso
        SELECT COUNT(*)
        INTO v_count
        FROM ODO_USUARIOS u
        INNER JOIN ODO_ROLES r ON u.ROL_ID = r.ROL_ID
        INNER JOIN ODO_ROL_PERMISOS rp ON r.ROL_ID = rp.ROL_ID
        INNER JOIN ODO_PERMISOS p ON rp.PERMISO_ID = p.PERMISO_ID
        WHERE u.USUARIO_ID = p_usuario_id
          AND p.CODIGO = p_codigo_permiso
          AND p.ACTIVO = 'S'
          AND r.ACTIVO = 'S';

        RETURN CASE WHEN v_count > 0 THEN 'S' ELSE 'N' END;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN 'N';
        WHEN OTHERS THEN
            RETURN 'N';
    END TIENE_PERMISO;

    -- Obtener programas del usuario
    PROCEDURE GET_PROGRAMAS_USUARIO(
       p_usuario_id IN NUMBER,
        p_cursor OUT SYS_REFCURSOR
    ) IS
        v_es_admin CHAR(1) := 'N';
    BEGIN
        -- Verificar si es administrador
        BEGIN
            SELECT CASE WHEN r.CODIGO = 'ADMIN' THEN 'S' ELSE 'N' END
            INTO v_es_admin
            FROM ODO_USUARIOS u
            INNER JOIN ODO_ROLES r ON u.ROL_ID = r.ROL_ID
            WHERE u.USUARIO_ID = p_usuario_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                v_es_admin := 'N';
        END;

        IF v_es_admin = 'S' THEN
            -- Retornar todos los programas
            OPEN p_cursor FOR
                SELECT
                    PROGRAMA_ID,
                    NOMBRE,
                    CODIGO,
                    DESCRIPCION,
                    RUTA_FRONTEND,
                    ICONO,
                    MODULO_PADRE_ID,
                    ORDEN
                FROM ODO_PROGRAMAS
                WHERE ACTIVO = 'S'
                ORDER BY ORDEN, NOMBRE;
        ELSE
            -- Retornar solo programas asignados al rol
            OPEN p_cursor FOR
                SELECT DISTINCT
                    p.PROGRAMA_ID,
                    p.NOMBRE,
                    p.CODIGO,
                    p.DESCRIPCION,
                    p.RUTA_FRONTEND,
                    p.ICONO,
                    p.MODULO_PADRE_ID,
                    p.ORDEN
                FROM ODO_USUARIOS u
                INNER JOIN ODO_ROLES r ON u.ROL_ID = r.ROL_ID
                INNER JOIN ODO_ROL_PROGRAMAS rp ON r.ROL_ID = rp.ROL_ID
                INNER JOIN ODO_PROGRAMAS p ON rp.PROGRAMA_ID = p.PROGRAMA_ID
                WHERE u.USUARIO_ID = p_usuario_id
                  AND p.ACTIVO = 'S'
                  AND r.ACTIVO = 'S'
                ORDER BY p.ORDEN, p.NOMBRE;
        END IF;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            OPEN p_cursor FOR SELECT NULL FROM DUAL WHERE 1=0;
    END GET_PROGRAMAS_USUARIO;

    -- Obtener permisos del usuario
    PROCEDURE GET_PERMISOS_USUARIO(
        p_usuario_id IN NUMBER,
        p_cursor OUT SYS_REFCURSOR
    ) IS
        v_es_admin CHAR(1) := 'N';
    BEGIN
        -- Verificar si es administrador
        BEGIN
            SELECT CASE WHEN r.CODIGO = 'ADMIN' THEN 'S' ELSE 'N' END
            INTO v_es_admin
            FROM ODO_USUARIOS u
            INNER JOIN ODO_ROLES r ON u.ROL_ID = r.ROL_ID
            WHERE u.USUARIO_ID = p_usuario_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                v_es_admin := 'N';
        END;

        IF v_es_admin = 'S' THEN
            -- Retornar todos los permisos
            OPEN p_cursor FOR
                SELECT
                    PERMISO_ID,
                    NOMBRE,
                    CODIGO,
                    DESCRIPCION,
                    PROGRAMA_ID
                FROM ODO_PERMISOS
                WHERE ACTIVO = 'S'
                ORDER BY NOMBRE;
        ELSE
            -- Retornar solo permisos asignados al rol
            OPEN p_cursor FOR
                SELECT DISTINCT
                    p.PERMISO_ID,
                    p.NOMBRE,
                    p.CODIGO,
                    p.DESCRIPCION,
                    p.PROGRAMA_ID
                FROM ODO_USUARIOS u
                INNER JOIN ODO_ROLES r ON u.ROL_ID = r.ROL_ID
                INNER JOIN ODO_ROL_PERMISOS rp ON r.ROL_ID = rp.ROL_ID
                INNER JOIN ODO_PERMISOS p ON rp.PERMISO_ID = p.PERMISO_ID
                WHERE u.USUARIO_ID = p_usuario_id
                  AND p.ACTIVO = 'S'
                  AND r.ACTIVO = 'S'
                ORDER BY p.NOMBRE;
        END IF;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            OPEN p_cursor FOR SELECT NULL FROM DUAL WHERE 1=0;
    END GET_PERMISOS_USUARIO;

    -- Asignar rol a usuario
    PROCEDURE ASIGNAR_ROL_USUARIO(
        p_usuario_id IN NUMBER,
        p_rol_id IN NUMBER,
        p_asignado_por IN NUMBER,
        p_resultado OUT NUMBER,
        p_mensaje OUT VARCHAR2
    ) IS
    BEGIN
        UPDATE ODO_USUARIOS
        SET ROL_ID = p_rol_id
        WHERE USUARIO_ID = p_usuario_id;

        IF SQL%ROWCOUNT > 0 THEN
            COMMIT;
            p_resultado := 1;
            p_mensaje := 'Rol asignado correctamente';
        ELSE
            p_resultado := 0;
            p_mensaje := 'Usuario no encontrado';
        END IF;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error: ' || SQLERRM;
    END ASIGNAR_ROL_USUARIO;

    -- Asignar programa a rol
    PROCEDURE ASIGNAR_PROGRAMA_ROL(
        p_rol_id IN NUMBER,
        p_programa_id IN NUMBER,
        p_asignado_por IN NUMBER,
        p_resultado OUT NUMBER,
        p_mensaje OUT VARCHAR2
    ) IS
    BEGIN
        INSERT INTO ODO_ROL_PROGRAMAS (ROL_ID, PROGRAMA_ID, ASIGNADO_POR)
        VALUES (p_rol_id, p_programa_id, p_asignado_por);

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Programa asignado al rol correctamente';

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            p_resultado := 0;
            p_mensaje := 'El programa ya está asignado a este rol';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error: ' || SQLERRM;
    END ASIGNAR_PROGRAMA_ROL;

    -- Asignar permiso a rol
    PROCEDURE ASIGNAR_PERMISO_ROL(
        p_rol_id IN NUMBER,
        p_permiso_id IN NUMBER,
        p_asignado_por IN NUMBER,
        p_resultado OUT NUMBER,
        p_mensaje OUT VARCHAR2
    ) IS
    BEGIN
        INSERT INTO ODO_ROL_PERMISOS (ROL_ID, PERMISO_ID, ASIGNADO_POR)
        VALUES (p_rol_id, p_permiso_id, p_asignado_por);

        COMMIT;
        p_resultado := 1;
        p_mensaje := 'Permiso asignado al rol correctamente';

    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            p_resultado := 0;
            p_mensaje := 'El permiso ya está asignado a este rol';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error: ' || SQLERRM;
    END ASIGNAR_PERMISO_ROL;

END PKG_SEGURIDAD;
/
