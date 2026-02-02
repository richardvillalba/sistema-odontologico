/*
================================================================================
  Package: PKG_USUARIOS
  Descripcion: Package para la gestion de usuarios, autenticacion y roles
  Autor: Claude (Backend IA)
  Fecha: 2026-01-26

  Funcionalidades:
    - CRUD de usuarios
    - Autenticacion (login/logout)
    - Gestion de roles
    - Asignacion de sucursales
    - Cambio de contrasena
================================================================================
*/

-- ============================================================================
-- ESPECIFICACION DEL PACKAGE
-- ============================================================================
CREATE OR REPLACE PACKAGE PKG_USUARIOS AS

    -- Tipos de datos
    TYPE t_usuario_cursor IS REF CURSOR;
    TYPE t_rol_cursor IS REF CURSOR;

    -- ========================================================================
    -- PROCEDIMIENTOS DE AUTENTICACION
    -- ========================================================================

    -- Autenticar usuario (login)
    PROCEDURE autenticar(
        p_username      IN  ODO_USUARIOS.USERNAME%TYPE,
        p_password      IN  VARCHAR2,
        p_ip_address    IN  VARCHAR2 DEFAULT NULL,
        p_user_agent    IN  VARCHAR2 DEFAULT NULL,
        p_usuario_id    OUT ODO_USUARIOS.USUARIO_ID%TYPE,
        p_nombre        OUT VARCHAR2,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Cambiar contrasena
    PROCEDURE cambiar_password(
        p_usuario_id        IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_password_actual   IN  VARCHAR2,
        p_password_nuevo    IN  VARCHAR2,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Reset de contrasena (por admin)
    PROCEDURE reset_password(
        p_usuario_id        IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_password_nuevo    IN  VARCHAR2,
        p_admin_id          IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- ========================================================================
    -- PROCEDIMIENTOS DE CONSULTA DE USUARIOS
    -- ========================================================================

    -- Obtener usuario por ID
    PROCEDURE get_usuario(
        p_usuario_id    IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_cursor        OUT t_usuario_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener usuarios por empresa
    PROCEDURE get_usuarios_by_empresa(
        p_empresa_id    IN  ODO_USUARIOS.EMPRESA_ID%TYPE,
        p_activo        IN  ODO_USUARIOS.ACTIVO%TYPE DEFAULT NULL,
        p_cursor        OUT t_usuario_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener doctores (usuarios con rol doctor)
    PROCEDURE get_doctores(
        p_empresa_id    IN  ODO_USUARIOS.EMPRESA_ID%TYPE,
        p_sucursal_id   IN  NUMBER DEFAULT NULL,
        p_cursor        OUT t_usuario_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Buscar usuarios
    PROCEDURE search_usuarios(
        p_empresa_id    IN  ODO_USUARIOS.EMPRESA_ID%TYPE,
        p_termino       IN  VARCHAR2,
        p_cursor        OUT t_usuario_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- ========================================================================
    -- PROCEDIMIENTOS DE MODIFICACION DE USUARIOS
    -- ========================================================================

    -- Crear nuevo usuario
    PROCEDURE insert_usuario(
        p_username              IN  ODO_USUARIOS.USERNAME%TYPE,
        p_email                 IN  ODO_USUARIOS.EMAIL%TYPE,
        p_password              IN  VARCHAR2,
        p_nombre                IN  ODO_USUARIOS.NOMBRE%TYPE,
        p_apellido              IN  ODO_USUARIOS.APELLIDO%TYPE,
        p_documento_tipo        IN  ODO_USUARIOS.DOCUMENTO_TIPO%TYPE DEFAULT NULL,
        p_documento_numero      IN  ODO_USUARIOS.DOCUMENTO_NUMERO%TYPE DEFAULT NULL,
        p_telefono              IN  ODO_USUARIOS.TELEFONO%TYPE DEFAULT NULL,
        p_especialidad          IN  ODO_USUARIOS.ESPECIALIDAD%TYPE DEFAULT NULL,
        p_registro_profesional  IN  ODO_USUARIOS.REGISTRO_PROFESIONAL%TYPE DEFAULT NULL,
        p_empresa_id            IN  ODO_USUARIOS.EMPRESA_ID%TYPE,
        p_creado_por            IN  ODO_USUARIOS.CREADO_POR%TYPE,
        p_usuario_id            OUT ODO_USUARIOS.USUARIO_ID%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );

    -- Actualizar usuario
    PROCEDURE update_usuario(
        p_usuario_id            IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_email                 IN  ODO_USUARIOS.EMAIL%TYPE DEFAULT NULL,
        p_nombre                IN  ODO_USUARIOS.NOMBRE%TYPE DEFAULT NULL,
        p_apellido              IN  ODO_USUARIOS.APELLIDO%TYPE DEFAULT NULL,
        p_documento_tipo        IN  ODO_USUARIOS.DOCUMENTO_TIPO%TYPE DEFAULT NULL,
        p_documento_numero      IN  ODO_USUARIOS.DOCUMENTO_NUMERO%TYPE DEFAULT NULL,
        p_telefono              IN  ODO_USUARIOS.TELEFONO%TYPE DEFAULT NULL,
        p_especialidad          IN  ODO_USUARIOS.ESPECIALIDAD%TYPE DEFAULT NULL,
        p_registro_profesional  IN  ODO_USUARIOS.REGISTRO_PROFESIONAL%TYPE DEFAULT NULL,
        p_modificado_por        IN  ODO_USUARIOS.MODIFICADO_POR%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );

    -- Activar/Desactivar usuario
    PROCEDURE set_activo(
        p_usuario_id    IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_activo        IN  ODO_USUARIOS.ACTIVO%TYPE,
        p_modificado_por IN ODO_USUARIOS.MODIFICADO_POR%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Eliminar usuario (soft delete)
    PROCEDURE delete_usuario(
        p_usuario_id    IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_eliminado_por IN  ODO_USUARIOS.MODIFICADO_POR%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- ========================================================================
    -- PROCEDIMIENTOS DE ROLES
    -- ========================================================================

    -- Obtener todos los roles
    PROCEDURE get_roles(
        p_cursor        OUT t_rol_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener roles de un usuario
    PROCEDURE get_roles_usuario(
        p_usuario_id    IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_cursor        OUT t_rol_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Asignar rol a usuario
    PROCEDURE asignar_rol(
        p_usuario_id    IN  ODO_USUARIO_ROLES.USUARIO_ID%TYPE,
        p_rol_id        IN  ODO_USUARIO_ROLES.ROL_ID%TYPE,
        p_asignado_por  IN  ODO_USUARIO_ROLES.ASIGNADO_POR%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Quitar rol a usuario
    PROCEDURE quitar_rol(
        p_usuario_id    IN  ODO_USUARIO_ROLES.USUARIO_ID%TYPE,
        p_rol_id        IN  ODO_USUARIO_ROLES.ROL_ID%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- ========================================================================
    -- PROCEDIMIENTOS DE SUCURSALES
    -- ========================================================================

    -- Obtener sucursales de un usuario
    PROCEDURE get_sucursales_usuario(
        p_usuario_id    IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_cursor        OUT t_usuario_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Asignar sucursal a usuario
    PROCEDURE asignar_sucursal(
        p_usuario_id    IN  ODO_USUARIO_SUCURSALES.USUARIO_ID%TYPE,
        p_sucursal_id   IN  ODO_USUARIO_SUCURSALES.SUCURSAL_ID%TYPE,
        p_es_principal  IN  ODO_USUARIO_SUCURSALES.ES_PRINCIPAL%TYPE DEFAULT 'N',
        p_asignado_por  IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Quitar sucursal a usuario
    PROCEDURE quitar_sucursal(
        p_usuario_id    IN  ODO_USUARIO_SUCURSALES.USUARIO_ID%TYPE,
        p_sucursal_id   IN  ODO_USUARIO_SUCURSALES.SUCURSAL_ID%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- ========================================================================
    -- FUNCIONES DE UTILIDAD
    -- ========================================================================

    -- Verificar si usuario tiene rol
    FUNCTION tiene_rol(
        p_usuario_id    IN ODO_USUARIOS.USUARIO_ID%TYPE,
        p_codigo_rol    IN ODO_ROLES.CODIGO%TYPE
    ) RETURN BOOLEAN;

    -- Verificar si usuario esta activo
    FUNCTION esta_activo(
        p_usuario_id    IN ODO_USUARIOS.USUARIO_ID%TYPE
    ) RETURN BOOLEAN;

    -- Hash de password (funcion interna expuesta para testing)
    FUNCTION hash_password(
        p_password      IN VARCHAR2,
        p_salt          IN VARCHAR2 DEFAULT NULL
    ) RETURN VARCHAR2;

END PKG_USUARIOS;
/

-- ============================================================================
-- CUERPO DEL PACKAGE
-- ============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_USUARIOS AS

    -- Constantes internas
    c_salt_length CONSTANT NUMBER := 16;

    -- ========================================================================
    -- FUNCIONES PRIVADAS
    -- ========================================================================

    -- Generar salt aleatorio
    FUNCTION generate_salt RETURN VARCHAR2 IS
    BEGIN
        RETURN DBMS_RANDOM.STRING('X', c_salt_length);
    END generate_salt;

    -- Registrar evento de auditoria
    PROCEDURE registrar_auditoria(
        p_usuario_id    IN NUMBER,
        p_accion        IN VARCHAR2,
        p_entidad_tipo  IN VARCHAR2,
        p_entidad_id    IN NUMBER,
        p_descripcion   IN VARCHAR2,
        p_ip_address    IN VARCHAR2 DEFAULT NULL,
        p_user_agent    IN VARCHAR2 DEFAULT NULL
    ) IS
        PRAGMA AUTONOMOUS_TRANSACTION;
    BEGIN
        INSERT INTO ODO_AUDITORIA (
            USUARIO_ID,
            FECHA_HORA,
            ACCION,
            ENTIDAD_TIPO,
            ENTIDAD_ID,
            DESCRIPCION,
            IP_ADDRESS,
            USER_AGENT
        ) VALUES (
            p_usuario_id,
            SYSTIMESTAMP,
            p_accion,
            p_entidad_tipo,
            p_entidad_id,
            p_descripcion,
            p_ip_address,
            p_user_agent
        );
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
    END registrar_auditoria;

    -- ========================================================================
    -- FUNCIONES PUBLICAS
    -- ========================================================================

    FUNCTION hash_password(
        p_password      IN VARCHAR2,
        p_salt          IN VARCHAR2 DEFAULT NULL
    ) RETURN VARCHAR2 IS
        v_salt VARCHAR2(100);
        v_hash RAW(64);
    BEGIN
        v_salt := NVL(p_salt, generate_salt);
        -- Usar SHA-256 para hash
        v_hash := DBMS_CRYPTO.HASH(
            UTL_RAW.CAST_TO_RAW(v_salt || p_password),
            DBMS_CRYPTO.HASH_SH256
        );
        -- Retornar salt + hash codificado
        RETURN v_salt || ':' || RAWTOHEX(v_hash);
    END hash_password;

    -- ------------------------------------------------------------------------

    FUNCTION tiene_rol(
        p_usuario_id    IN ODO_USUARIOS.USUARIO_ID%TYPE,
        p_codigo_rol    IN ODO_ROLES.CODIGO%TYPE
    ) RETURN BOOLEAN IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM ODO_USUARIO_ROLES ur
        JOIN ODO_ROLES r ON ur.ROL_ID = r.ROL_ID
        WHERE ur.USUARIO_ID = p_usuario_id
          AND r.CODIGO = p_codigo_rol
          AND r.ACTIVO = 'S';

        RETURN v_count > 0;
    END tiene_rol;

    -- ------------------------------------------------------------------------

    FUNCTION esta_activo(
        p_usuario_id    IN ODO_USUARIOS.USUARIO_ID%TYPE
    ) RETURN BOOLEAN IS
        v_activo ODO_USUARIOS.ACTIVO%TYPE;
    BEGIN
        SELECT ACTIVO INTO v_activo
        FROM ODO_USUARIOS
        WHERE USUARIO_ID = p_usuario_id;

        RETURN v_activo = 'S';
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN FALSE;
    END esta_activo;

    -- ========================================================================
    -- PROCEDIMIENTOS DE AUTENTICACION
    -- ========================================================================

    PROCEDURE autenticar(
        p_username      IN  ODO_USUARIOS.USERNAME%TYPE,
        p_password      IN  VARCHAR2,
        p_ip_address    IN  VARCHAR2 DEFAULT NULL,
        p_user_agent    IN  VARCHAR2 DEFAULT NULL,
        p_usuario_id    OUT ODO_USUARIOS.USUARIO_ID%TYPE,
        p_nombre        OUT VARCHAR2,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
        v_usuario_id ODO_USUARIOS.USUARIO_ID%TYPE;
        v_password_hash ODO_USUARIOS.PASSWORD_HASH%TYPE;
        v_activo ODO_USUARIOS.ACTIVO%TYPE;
        v_nombre ODO_USUARIOS.NOMBRE%TYPE;
        v_apellido ODO_USUARIOS.APELLIDO%TYPE;
        v_salt VARCHAR2(100);
        v_hash_verificar VARCHAR2(200);
    BEGIN
        -- Buscar usuario
        BEGIN
            SELECT USUARIO_ID, PASSWORD_HASH, ACTIVO, NOMBRE, APELLIDO
            INTO v_usuario_id, v_password_hash, v_activo, v_nombre, v_apellido
            FROM ODO_USUARIOS
            WHERE UPPER(USERNAME) = UPPER(p_username);
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_resultado := 0;
                p_mensaje := 'Usuario o contrasena incorrectos';
                registrar_auditoria(NULL, 'LOGIN_FAILED', 'USUARIO', NULL,
                    'Intento de login fallido para usuario: ' || p_username, p_ip_address, p_user_agent);
                RETURN;
        END;

        -- Verificar si esta activo
        IF v_activo != 'S' THEN
            p_resultado := 0;
            p_mensaje := 'Usuario inactivo';
            registrar_auditoria(v_usuario_id, 'LOGIN_FAILED', 'USUARIO', v_usuario_id,
                'Intento de login con usuario inactivo', p_ip_address, p_user_agent);
            RETURN;
        END IF;

        -- Verificar password
        -- El hash almacenado tiene formato: SALT:HASH
        v_salt := SUBSTR(v_password_hash, 1, INSTR(v_password_hash, ':') - 1);
        v_hash_verificar := hash_password(p_password, v_salt);

        IF v_password_hash != v_hash_verificar THEN
            p_resultado := 0;
            p_mensaje := 'Usuario o contrasena incorrectos';
            registrar_auditoria(v_usuario_id, 'LOGIN_FAILED', 'USUARIO', v_usuario_id,
                'Contrasena incorrecta', p_ip_address, p_user_agent);
            RETURN;
        END IF;

        -- Login exitoso
        UPDATE ODO_USUARIOS
        SET ULTIMO_LOGIN = SYSTIMESTAMP
        WHERE USUARIO_ID = v_usuario_id;

        COMMIT;

        p_usuario_id := v_usuario_id;
        p_nombre := v_nombre || ' ' || v_apellido;
        p_resultado := 1;
        p_mensaje := 'Autenticacion exitosa';

        registrar_auditoria(v_usuario_id, 'LOGIN', 'USUARIO', v_usuario_id,
            'Login exitoso', p_ip_address, p_user_agent);

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error en autenticacion: ' || SQLERRM;
    END autenticar;

    -- ------------------------------------------------------------------------

    PROCEDURE cambiar_password(
        p_usuario_id        IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_password_actual   IN  VARCHAR2,
        p_password_nuevo    IN  VARCHAR2,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
        v_password_hash ODO_USUARIOS.PASSWORD_HASH%TYPE;
        v_salt VARCHAR2(100);
        v_hash_verificar VARCHAR2(200);
        v_nuevo_hash VARCHAR2(200);
    BEGIN
        -- Validar longitud de nueva password
        IF LENGTH(p_password_nuevo) < 8 THEN
            p_resultado := 0;
            p_mensaje := 'La nueva contrasena debe tener al menos 8 caracteres';
            RETURN;
        END IF;

        -- Obtener password actual
        SELECT PASSWORD_HASH INTO v_password_hash
        FROM ODO_USUARIOS
        WHERE USUARIO_ID = p_usuario_id;

        -- Verificar password actual
        v_salt := SUBSTR(v_password_hash, 1, INSTR(v_password_hash, ':') - 1);
        v_hash_verificar := hash_password(p_password_actual, v_salt);

        IF v_password_hash != v_hash_verificar THEN
            p_resultado := 0;
            p_mensaje := 'Contrasena actual incorrecta';
            RETURN;
        END IF;

        -- Generar nuevo hash
        v_nuevo_hash := hash_password(p_password_nuevo);

        -- Actualizar password
        UPDATE ODO_USUARIOS
        SET PASSWORD_HASH = v_nuevo_hash,
            FECHA_MODIFICACION = SYSTIMESTAMP
        WHERE USUARIO_ID = p_usuario_id;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Contrasena actualizada exitosamente';

        registrar_auditoria(p_usuario_id, 'PASSWORD_CHANGE', 'USUARIO', p_usuario_id,
            'Usuario cambio su contrasena', NULL, NULL);

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_resultado := 0;
            p_mensaje := 'Usuario no encontrado';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al cambiar contrasena: ' || SQLERRM;
    END cambiar_password;

    -- ------------------------------------------------------------------------

    PROCEDURE reset_password(
        p_usuario_id        IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_password_nuevo    IN  VARCHAR2,
        p_admin_id          IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
        v_nuevo_hash VARCHAR2(200);
    BEGIN
        -- Validar longitud
        IF LENGTH(p_password_nuevo) < 8 THEN
            p_resultado := 0;
            p_mensaje := 'La nueva contrasena debe tener al menos 8 caracteres';
            RETURN;
        END IF;

        -- Generar nuevo hash
        v_nuevo_hash := hash_password(p_password_nuevo);

        -- Actualizar password
        UPDATE ODO_USUARIOS
        SET PASSWORD_HASH = v_nuevo_hash,
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_admin_id
        WHERE USUARIO_ID = p_usuario_id;

        IF SQL%ROWCOUNT = 0 THEN
            p_resultado := 0;
            p_mensaje := 'Usuario no encontrado';
            RETURN;
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Contrasena reseteada exitosamente';

        registrar_auditoria(p_admin_id, 'PASSWORD_RESET', 'USUARIO', p_usuario_id,
            'Admin reseteo contrasena de usuario', NULL, NULL);

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al resetear contrasena: ' || SQLERRM;
    END reset_password;

    -- ========================================================================
    -- PROCEDIMIENTOS DE CONSULTA DE USUARIOS
    -- ========================================================================

    PROCEDURE get_usuario(
        p_usuario_id    IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_cursor        OUT t_usuario_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                u.USUARIO_ID,
                u.USERNAME,
                u.EMAIL,
                u.NOMBRE,
                u.APELLIDO,
                u.NOMBRE || ' ' || u.APELLIDO AS NOMBRE_COMPLETO,
                u.DOCUMENTO_TIPO,
                u.DOCUMENTO_NUMERO,
                u.TELEFONO,
                u.ESPECIALIDAD,
                u.REGISTRO_PROFESIONAL,
                u.ACTIVO,
                u.ULTIMO_LOGIN,
                u.EMPRESA_ID,
                u.FECHA_CREACION,
                u.FECHA_MODIFICACION,
                (SELECT LISTAGG(r.NOMBRE, ', ') WITHIN GROUP (ORDER BY r.NOMBRE)
                 FROM ODO_USUARIO_ROLES ur
                 JOIN ODO_ROLES r ON ur.ROL_ID = r.ROL_ID
                 WHERE ur.USUARIO_ID = u.USUARIO_ID) AS ROLES
            FROM ODO_USUARIOS u
            WHERE u.USUARIO_ID = p_usuario_id;

        p_resultado := 1;
        p_mensaje := 'Usuario obtenido exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener usuario: ' || SQLERRM;
    END get_usuario;

    -- ------------------------------------------------------------------------

    PROCEDURE get_usuarios_by_empresa(
        p_empresa_id    IN  ODO_USUARIOS.EMPRESA_ID%TYPE,
        p_activo        IN  ODO_USUARIOS.ACTIVO%TYPE DEFAULT NULL,
        p_cursor        OUT t_usuario_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                u.USUARIO_ID,
                u.USERNAME,
                u.EMAIL,
                u.NOMBRE,
                u.APELLIDO,
                u.NOMBRE || ' ' || u.APELLIDO AS NOMBRE_COMPLETO,
                u.DOCUMENTO_TIPO,
                u.DOCUMENTO_NUMERO,
                u.TELEFONO,
                u.ESPECIALIDAD,
                u.REGISTRO_PROFESIONAL,
                u.ACTIVO,
                u.ULTIMO_LOGIN,
                u.EMPRESA_ID,
                (SELECT LISTAGG(r.NOMBRE, ', ') WITHIN GROUP (ORDER BY r.NOMBRE)
                 FROM ODO_USUARIO_ROLES ur
                 JOIN ODO_ROLES r ON ur.ROL_ID = r.ROL_ID
                 WHERE ur.USUARIO_ID = u.USUARIO_ID) AS ROLES
            FROM ODO_USUARIOS u
            WHERE u.EMPRESA_ID = p_empresa_id
              AND (p_activo IS NULL OR u.ACTIVO = p_activo)
            ORDER BY u.APELLIDO, u.NOMBRE;

        p_resultado := 1;
        p_mensaje := 'Usuarios obtenidos exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener usuarios: ' || SQLERRM;
    END get_usuarios_by_empresa;

    -- ------------------------------------------------------------------------

    PROCEDURE get_doctores(
        p_empresa_id    IN  ODO_USUARIOS.EMPRESA_ID%TYPE,
        p_sucursal_id   IN  NUMBER DEFAULT NULL,
        p_cursor        OUT t_usuario_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT DISTINCT
                u.USUARIO_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS NOMBRE_COMPLETO,
                u.ESPECIALIDAD,
                u.REGISTRO_PROFESIONAL,
                u.EMAIL,
                u.TELEFONO,
                u.ACTIVO
            FROM ODO_USUARIOS u
            JOIN ODO_USUARIO_ROLES ur ON u.USUARIO_ID = ur.USUARIO_ID
            JOIN ODO_ROLES r ON ur.ROL_ID = r.ROL_ID
            LEFT JOIN ODO_USUARIO_SUCURSALES us ON u.USUARIO_ID = us.USUARIO_ID
            WHERE u.EMPRESA_ID = p_empresa_id
              AND r.CODIGO IN ('DOCTOR', 'ADMIN')
              AND u.ACTIVO = 'S'
              AND (p_sucursal_id IS NULL OR us.SUCURSAL_ID = p_sucursal_id)
            ORDER BY u.APELLIDO, u.NOMBRE;

        p_resultado := 1;
        p_mensaje := 'Doctores obtenidos exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener doctores: ' || SQLERRM;
    END get_doctores;

    -- ------------------------------------------------------------------------

    PROCEDURE search_usuarios(
        p_empresa_id    IN  ODO_USUARIOS.EMPRESA_ID%TYPE,
        p_termino       IN  VARCHAR2,
        p_cursor        OUT t_usuario_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
        v_termino VARCHAR2(200);
    BEGIN
        v_termino := '%' || UPPER(p_termino) || '%';

        OPEN p_cursor FOR
            SELECT
                u.USUARIO_ID,
                u.USERNAME,
                u.EMAIL,
                u.NOMBRE,
                u.APELLIDO,
                u.NOMBRE || ' ' || u.APELLIDO AS NOMBRE_COMPLETO,
                u.DOCUMENTO_NUMERO,
                u.TELEFONO,
                u.ESPECIALIDAD,
                u.ACTIVO,
                (SELECT LISTAGG(r.NOMBRE, ', ') WITHIN GROUP (ORDER BY r.NOMBRE)
                 FROM ODO_USUARIO_ROLES ur
                 JOIN ODO_ROLES r ON ur.ROL_ID = r.ROL_ID
                 WHERE ur.USUARIO_ID = u.USUARIO_ID) AS ROLES
            FROM ODO_USUARIOS u
            WHERE u.EMPRESA_ID = p_empresa_id
              AND (
                  UPPER(u.NOMBRE) LIKE v_termino
                  OR UPPER(u.APELLIDO) LIKE v_termino
                  OR UPPER(u.USERNAME) LIKE v_termino
                  OR UPPER(u.EMAIL) LIKE v_termino
                  OR u.DOCUMENTO_NUMERO LIKE v_termino
              )
            ORDER BY u.APELLIDO, u.NOMBRE;

        p_resultado := 1;
        p_mensaje := 'Busqueda completada exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error en busqueda: ' || SQLERRM;
    END search_usuarios;

    -- ========================================================================
    -- PROCEDIMIENTOS DE MODIFICACION DE USUARIOS
    -- ========================================================================

    PROCEDURE insert_usuario(
        p_username              IN  ODO_USUARIOS.USERNAME%TYPE,
        p_email                 IN  ODO_USUARIOS.EMAIL%TYPE,
        p_password              IN  VARCHAR2,
        p_nombre                IN  ODO_USUARIOS.NOMBRE%TYPE,
        p_apellido              IN  ODO_USUARIOS.APELLIDO%TYPE,
        p_documento_tipo        IN  ODO_USUARIOS.DOCUMENTO_TIPO%TYPE DEFAULT NULL,
        p_documento_numero      IN  ODO_USUARIOS.DOCUMENTO_NUMERO%TYPE DEFAULT NULL,
        p_telefono              IN  ODO_USUARIOS.TELEFONO%TYPE DEFAULT NULL,
        p_especialidad          IN  ODO_USUARIOS.ESPECIALIDAD%TYPE DEFAULT NULL,
        p_registro_profesional  IN  ODO_USUARIOS.REGISTRO_PROFESIONAL%TYPE DEFAULT NULL,
        p_empresa_id            IN  ODO_USUARIOS.EMPRESA_ID%TYPE,
        p_creado_por            IN  ODO_USUARIOS.CREADO_POR%TYPE,
        p_usuario_id            OUT ODO_USUARIOS.USUARIO_ID%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    ) IS
        v_username_existe NUMBER;
        v_email_existe NUMBER;
        v_password_hash VARCHAR2(200);
    BEGIN
        -- Validar username unico
        SELECT COUNT(*) INTO v_username_existe
        FROM ODO_USUARIOS
        WHERE UPPER(USERNAME) = UPPER(p_username);

        IF v_username_existe > 0 THEN
            p_resultado := 0;
            p_mensaje := 'El nombre de usuario ya existe';
            RETURN;
        END IF;

        -- Validar email unico
        SELECT COUNT(*) INTO v_email_existe
        FROM ODO_USUARIOS
        WHERE UPPER(EMAIL) = UPPER(p_email);

        IF v_email_existe > 0 THEN
            p_resultado := 0;
            p_mensaje := 'El email ya esta registrado';
            RETURN;
        END IF;

        -- Validar password
        IF LENGTH(p_password) < 8 THEN
            p_resultado := 0;
            p_mensaje := 'La contrasena debe tener al menos 8 caracteres';
            RETURN;
        END IF;

        -- Generar hash de password
        v_password_hash := hash_password(p_password);

        -- Insertar usuario
        INSERT INTO ODO_USUARIOS (
            USERNAME,
            EMAIL,
            PASSWORD_HASH,
            NOMBRE,
            APELLIDO,
            DOCUMENTO_TIPO,
            DOCUMENTO_NUMERO,
            TELEFONO,
            ESPECIALIDAD,
            REGISTRO_PROFESIONAL,
            ACTIVO,
            EMPRESA_ID,
            FECHA_CREACION,
            CREADO_POR
        ) VALUES (
            p_username,
            p_email,
            v_password_hash,
            p_nombre,
            p_apellido,
            p_documento_tipo,
            p_documento_numero,
            p_telefono,
            p_especialidad,
            p_registro_profesional,
            'S',
            p_empresa_id,
            SYSTIMESTAMP,
            p_creado_por
        ) RETURNING USUARIO_ID INTO p_usuario_id;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Usuario creado exitosamente con ID: ' || p_usuario_id;

        registrar_auditoria(p_creado_por, 'CREATE', 'USUARIO', p_usuario_id,
            'Usuario creado: ' || p_username, NULL, NULL);

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al crear usuario: ' || SQLERRM;
    END insert_usuario;

    -- ------------------------------------------------------------------------

    PROCEDURE update_usuario(
        p_usuario_id            IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_email                 IN  ODO_USUARIOS.EMAIL%TYPE DEFAULT NULL,
        p_nombre                IN  ODO_USUARIOS.NOMBRE%TYPE DEFAULT NULL,
        p_apellido              IN  ODO_USUARIOS.APELLIDO%TYPE DEFAULT NULL,
        p_documento_tipo        IN  ODO_USUARIOS.DOCUMENTO_TIPO%TYPE DEFAULT NULL,
        p_documento_numero      IN  ODO_USUARIOS.DOCUMENTO_NUMERO%TYPE DEFAULT NULL,
        p_telefono              IN  ODO_USUARIOS.TELEFONO%TYPE DEFAULT NULL,
        p_especialidad          IN  ODO_USUARIOS.ESPECIALIDAD%TYPE DEFAULT NULL,
        p_registro_profesional  IN  ODO_USUARIOS.REGISTRO_PROFESIONAL%TYPE DEFAULT NULL,
        p_modificado_por        IN  ODO_USUARIOS.MODIFICADO_POR%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    ) IS
        v_email_existe NUMBER;
    BEGIN
        -- Validar email unico si se proporciona
        IF p_email IS NOT NULL THEN
            SELECT COUNT(*) INTO v_email_existe
            FROM ODO_USUARIOS
            WHERE UPPER(EMAIL) = UPPER(p_email)
              AND USUARIO_ID != p_usuario_id;

            IF v_email_existe > 0 THEN
                p_resultado := 0;
                p_mensaje := 'El email ya esta registrado por otro usuario';
                RETURN;
            END IF;
        END IF;

        -- Actualizar usuario
        UPDATE ODO_USUARIOS
        SET EMAIL = NVL(p_email, EMAIL),
            NOMBRE = NVL(p_nombre, NOMBRE),
            APELLIDO = NVL(p_apellido, APELLIDO),
            DOCUMENTO_TIPO = NVL(p_documento_tipo, DOCUMENTO_TIPO),
            DOCUMENTO_NUMERO = NVL(p_documento_numero, DOCUMENTO_NUMERO),
            TELEFONO = NVL(p_telefono, TELEFONO),
            ESPECIALIDAD = NVL(p_especialidad, ESPECIALIDAD),
            REGISTRO_PROFESIONAL = NVL(p_registro_profesional, REGISTRO_PROFESIONAL),
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_modificado_por
        WHERE USUARIO_ID = p_usuario_id;

        IF SQL%ROWCOUNT = 0 THEN
            p_resultado := 0;
            p_mensaje := 'Usuario no encontrado';
            RETURN;
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Usuario actualizado exitosamente';

        registrar_auditoria(p_modificado_por, 'UPDATE', 'USUARIO', p_usuario_id,
            'Usuario actualizado', NULL, NULL);

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al actualizar usuario: ' || SQLERRM;
    END update_usuario;

    -- ------------------------------------------------------------------------

    PROCEDURE set_activo(
        p_usuario_id    IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_activo        IN  ODO_USUARIOS.ACTIVO%TYPE,
        p_modificado_por IN ODO_USUARIOS.MODIFICADO_POR%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
        v_accion VARCHAR2(20);
    BEGIN
        UPDATE ODO_USUARIOS
        SET ACTIVO = p_activo,
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_modificado_por
        WHERE USUARIO_ID = p_usuario_id;

        IF SQL%ROWCOUNT = 0 THEN
            p_resultado := 0;
            p_mensaje := 'Usuario no encontrado';
            RETURN;
        END IF;

        COMMIT;

        v_accion := CASE WHEN p_activo = 'S' THEN 'ACTIVATE' ELSE 'DEACTIVATE' END;
        p_resultado := 1;
        p_mensaje := CASE WHEN p_activo = 'S' THEN 'Usuario activado' ELSE 'Usuario desactivado' END;

        registrar_auditoria(p_modificado_por, v_accion, 'USUARIO', p_usuario_id,
            p_mensaje, NULL, NULL);

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al cambiar estado: ' || SQLERRM;
    END set_activo;

    -- ------------------------------------------------------------------------

    PROCEDURE delete_usuario(
        p_usuario_id    IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_eliminado_por IN  ODO_USUARIOS.MODIFICADO_POR%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
        v_tiene_citas NUMBER;
        v_tiene_historias NUMBER;
    BEGIN
        -- Verificar si tiene citas asociadas
        SELECT COUNT(*) INTO v_tiene_citas
        FROM ODO_CITAS
        WHERE DOCTOR_ID = p_usuario_id;

        -- Verificar si tiene historias clinicas
        SELECT COUNT(*) INTO v_tiene_historias
        FROM ODO_HISTORIAS_CLINICAS
        WHERE DOCTOR_ID = p_usuario_id;

        IF v_tiene_citas > 0 OR v_tiene_historias > 0 THEN
            -- Soft delete
            UPDATE ODO_USUARIOS
            SET ACTIVO = 'N',
                FECHA_MODIFICACION = SYSTIMESTAMP,
                MODIFICADO_POR = p_eliminado_por
            WHERE USUARIO_ID = p_usuario_id;

            p_resultado := 1;
            p_mensaje := 'Usuario desactivado (tiene registros asociados)';
        ELSE
            -- Hard delete de roles y sucursales primero
            DELETE FROM ODO_USUARIO_ROLES WHERE USUARIO_ID = p_usuario_id;
            DELETE FROM ODO_USUARIO_SUCURSALES WHERE USUARIO_ID = p_usuario_id;
            DELETE FROM ODO_USUARIOS WHERE USUARIO_ID = p_usuario_id;

            p_resultado := 1;
            p_mensaje := 'Usuario eliminado exitosamente';
        END IF;

        COMMIT;

        registrar_auditoria(p_eliminado_por, 'DELETE', 'USUARIO', p_usuario_id,
            p_mensaje, NULL, NULL);

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al eliminar usuario: ' || SQLERRM;
    END delete_usuario;

    -- ========================================================================
    -- PROCEDIMIENTOS DE ROLES
    -- ========================================================================

    PROCEDURE get_roles(
        p_cursor        OUT t_rol_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT ROL_ID, CODIGO, NOMBRE, DESCRIPCION, ACTIVO
            FROM ODO_ROLES
            WHERE ACTIVO = 'S'
            ORDER BY NOMBRE;

        p_resultado := 1;
        p_mensaje := 'Roles obtenidos exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener roles: ' || SQLERRM;
    END get_roles;

    -- ------------------------------------------------------------------------

    PROCEDURE get_roles_usuario(
        p_usuario_id    IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_cursor        OUT t_rol_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT r.ROL_ID, r.CODIGO, r.NOMBRE, r.DESCRIPCION,
                   ur.FECHA_ASIGNACION, ur.ASIGNADO_POR
            FROM ODO_USUARIO_ROLES ur
            JOIN ODO_ROLES r ON ur.ROL_ID = r.ROL_ID
            WHERE ur.USUARIO_ID = p_usuario_id
            ORDER BY r.NOMBRE;

        p_resultado := 1;
        p_mensaje := 'Roles del usuario obtenidos exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener roles: ' || SQLERRM;
    END get_roles_usuario;

    -- ------------------------------------------------------------------------

    PROCEDURE asignar_rol(
        p_usuario_id    IN  ODO_USUARIO_ROLES.USUARIO_ID%TYPE,
        p_rol_id        IN  ODO_USUARIO_ROLES.ROL_ID%TYPE,
        p_asignado_por  IN  ODO_USUARIO_ROLES.ASIGNADO_POR%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
        v_existe NUMBER;
    BEGIN
        -- Verificar si ya tiene el rol
        SELECT COUNT(*) INTO v_existe
        FROM ODO_USUARIO_ROLES
        WHERE USUARIO_ID = p_usuario_id AND ROL_ID = p_rol_id;

        IF v_existe > 0 THEN
            p_resultado := 0;
            p_mensaje := 'El usuario ya tiene este rol asignado';
            RETURN;
        END IF;

        INSERT INTO ODO_USUARIO_ROLES (
            USUARIO_ID, ROL_ID, FECHA_ASIGNACION, ASIGNADO_POR
        ) VALUES (
            p_usuario_id, p_rol_id, SYSTIMESTAMP, p_asignado_por
        );

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Rol asignado exitosamente';

        registrar_auditoria(p_asignado_por, 'ASSIGN_ROLE', 'USUARIO_ROL', p_usuario_id,
            'Rol ' || p_rol_id || ' asignado a usuario', NULL, NULL);

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al asignar rol: ' || SQLERRM;
    END asignar_rol;

    -- ------------------------------------------------------------------------

    PROCEDURE quitar_rol(
        p_usuario_id    IN  ODO_USUARIO_ROLES.USUARIO_ID%TYPE,
        p_rol_id        IN  ODO_USUARIO_ROLES.ROL_ID%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        DELETE FROM ODO_USUARIO_ROLES
        WHERE USUARIO_ID = p_usuario_id AND ROL_ID = p_rol_id;

        IF SQL%ROWCOUNT = 0 THEN
            p_resultado := 0;
            p_mensaje := 'El usuario no tiene este rol asignado';
            RETURN;
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Rol removido exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al quitar rol: ' || SQLERRM;
    END quitar_rol;

    -- ========================================================================
    -- PROCEDIMIENTOS DE SUCURSALES
    -- ========================================================================

    PROCEDURE get_sucursales_usuario(
        p_usuario_id    IN  ODO_USUARIOS.USUARIO_ID%TYPE,
        p_cursor        OUT t_usuario_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT s.SUCURSAL_ID, s.CODIGO, s.NOMBRE, s.DIRECCION,
                   s.TELEFONO, s.CIUDAD, us.ES_PRINCIPAL, us.ACTIVO
            FROM ODO_USUARIO_SUCURSALES us
            JOIN ODO_SUCURSALES s ON us.SUCURSAL_ID = s.SUCURSAL_ID
            WHERE us.USUARIO_ID = p_usuario_id
              AND us.ACTIVO = 'S'
            ORDER BY us.ES_PRINCIPAL DESC, s.NOMBRE;

        p_resultado := 1;
        p_mensaje := 'Sucursales obtenidas exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener sucursales: ' || SQLERRM;
    END get_sucursales_usuario;

    -- ------------------------------------------------------------------------

    PROCEDURE asignar_sucursal(
        p_usuario_id    IN  ODO_USUARIO_SUCURSALES.USUARIO_ID%TYPE,
        p_sucursal_id   IN  ODO_USUARIO_SUCURSALES.SUCURSAL_ID%TYPE,
        p_es_principal  IN  ODO_USUARIO_SUCURSALES.ES_PRINCIPAL%TYPE DEFAULT 'N',
        p_asignado_por  IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
        v_existe NUMBER;
    BEGIN
        -- Verificar si ya tiene la sucursal
        SELECT COUNT(*) INTO v_existe
        FROM ODO_USUARIO_SUCURSALES
        WHERE USUARIO_ID = p_usuario_id AND SUCURSAL_ID = p_sucursal_id;

        IF v_existe > 0 THEN
            -- Actualizar en lugar de insertar
            UPDATE ODO_USUARIO_SUCURSALES
            SET ES_PRINCIPAL = p_es_principal,
                ACTIVO = 'S'
            WHERE USUARIO_ID = p_usuario_id AND SUCURSAL_ID = p_sucursal_id;
        ELSE
            INSERT INTO ODO_USUARIO_SUCURSALES (
                USUARIO_ID, SUCURSAL_ID, ES_PRINCIPAL, ACTIVO,
                FECHA_ASIGNACION, ASIGNADO_POR
            ) VALUES (
                p_usuario_id, p_sucursal_id, p_es_principal, 'S',
                SYSTIMESTAMP, p_asignado_por
            );
        END IF;

        -- Si es principal, quitar principal de otras
        IF p_es_principal = 'S' THEN
            UPDATE ODO_USUARIO_SUCURSALES
            SET ES_PRINCIPAL = 'N'
            WHERE USUARIO_ID = p_usuario_id
              AND SUCURSAL_ID != p_sucursal_id;
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Sucursal asignada exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al asignar sucursal: ' || SQLERRM;
    END asignar_sucursal;

    -- ------------------------------------------------------------------------

    PROCEDURE quitar_sucursal(
        p_usuario_id    IN  ODO_USUARIO_SUCURSALES.USUARIO_ID%TYPE,
        p_sucursal_id   IN  ODO_USUARIO_SUCURSALES.SUCURSAL_ID%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        UPDATE ODO_USUARIO_SUCURSALES
        SET ACTIVO = 'N'
        WHERE USUARIO_ID = p_usuario_id AND SUCURSAL_ID = p_sucursal_id;

        IF SQL%ROWCOUNT = 0 THEN
            p_resultado := 0;
            p_mensaje := 'El usuario no tiene esta sucursal asignada';
            RETURN;
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Sucursal removida exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al quitar sucursal: ' || SQLERRM;
    END quitar_sucursal;

END PKG_USUARIOS;
/
