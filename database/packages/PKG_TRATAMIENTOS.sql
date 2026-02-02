/*
================================================================================
  Package: PKG_TRATAMIENTOS
  Descripcion: Package para la gestion de tratamientos y catalogo
  Autor: Claude (Backend IA)
  Fecha: 2026-01-26

  Funcionalidades:
    - CRUD de catalogo de tratamientos
    - Gestion de tratamientos asignados a pacientes
    - Sesiones de tratamiento
    - Seguimiento de progreso
================================================================================
*/

-- ============================================================================
-- ESPECIFICACION DEL PACKAGE
-- ============================================================================
CREATE OR REPLACE PACKAGE PKG_TRATAMIENTOS AS

    -- Tipos de datos
    TYPE t_tratamiento_cursor IS REF CURSOR;
    TYPE t_sesion_cursor IS REF CURSOR;

    -- Constantes de estado
    c_estado_pendiente      CONSTANT VARCHAR2(20) := 'PENDIENTE';
    c_estado_en_progreso    CONSTANT VARCHAR2(20) := 'EN_PROGRESO';
    c_estado_completado     CONSTANT VARCHAR2(20) := 'COMPLETADO';
    c_estado_cancelado      CONSTANT VARCHAR2(20) := 'CANCELADO';

    -- ========================================================================
    -- PROCEDIMIENTOS DE CATALOGO
    -- ========================================================================

    -- Obtener catalogo completo
    PROCEDURE get_catalogo(
        p_categoria     IN  ODO_CATALOGOS_TRATAMIENTOS.CATEGORIA%TYPE DEFAULT NULL,
        p_activo        IN  ODO_CATALOGOS_TRATAMIENTOS.ACTIVO%TYPE DEFAULT 'S',
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener tratamiento del catalogo por ID
    PROCEDURE get_catalogo_item(
        p_catalogo_id   IN  ODO_CATALOGOS_TRATAMIENTOS.CATALOGO_ID%TYPE,
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Buscar en catalogo
    PROCEDURE search_catalogo(
        p_termino       IN  VARCHAR2,
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Insertar item en catalogo
    PROCEDURE insert_catalogo(
        p_codigo                IN  ODO_CATALOGOS_TRATAMIENTOS.CODIGO%TYPE,
        p_nombre                IN  ODO_CATALOGOS_TRATAMIENTOS.NOMBRE%TYPE,
        p_descripcion           IN  ODO_CATALOGOS_TRATAMIENTOS.DESCRIPCION%TYPE DEFAULT NULL,
        p_categoria             IN  ODO_CATALOGOS_TRATAMIENTOS.CATEGORIA%TYPE,
        p_precio_base           IN  ODO_CATALOGOS_TRATAMIENTOS.PRECIO_BASE%TYPE,
        p_duracion_estimada     IN  ODO_CATALOGOS_TRATAMIENTOS.DURACION_ESTIMADA%TYPE DEFAULT NULL,
        p_requiere_anestesia    IN  ODO_CATALOGOS_TRATAMIENTOS.REQUIERE_ANESTESIA%TYPE DEFAULT 'N',
        p_catalogo_id           OUT ODO_CATALOGOS_TRATAMIENTOS.CATALOGO_ID%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );

    -- Actualizar item del catalogo
    PROCEDURE update_catalogo(
        p_catalogo_id           IN  ODO_CATALOGOS_TRATAMIENTOS.CATALOGO_ID%TYPE,
        p_codigo                IN  ODO_CATALOGOS_TRATAMIENTOS.CODIGO%TYPE DEFAULT NULL,
        p_nombre                IN  ODO_CATALOGOS_TRATAMIENTOS.NOMBRE%TYPE DEFAULT NULL,
        p_descripcion           IN  ODO_CATALOGOS_TRATAMIENTOS.DESCRIPCION%TYPE DEFAULT NULL,
        p_categoria             IN  ODO_CATALOGOS_TRATAMIENTOS.CATEGORIA%TYPE DEFAULT NULL,
        p_precio_base           IN  ODO_CATALOGOS_TRATAMIENTOS.PRECIO_BASE%TYPE DEFAULT NULL,
        p_duracion_estimada     IN  ODO_CATALOGOS_TRATAMIENTOS.DURACION_ESTIMADA%TYPE DEFAULT NULL,
        p_requiere_anestesia    IN  ODO_CATALOGOS_TRATAMIENTOS.REQUIERE_ANESTESIA%TYPE DEFAULT NULL,
        p_activo                IN  ODO_CATALOGOS_TRATAMIENTOS.ACTIVO%TYPE DEFAULT NULL,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );

    -- ========================================================================
    -- PROCEDIMIENTOS DE TRATAMIENTOS DE PACIENTE
    -- ========================================================================

    -- Obtener tratamiento de paciente por ID
    PROCEDURE get_tratamiento_paciente(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_cursor                  OUT t_tratamiento_cursor,
        p_resultado               OUT NUMBER,
        p_mensaje                 OUT VARCHAR2
    );

    -- Obtener tratamientos de un paciente
    PROCEDURE get_tratamientos_by_paciente(
        p_paciente_id   IN  ODO_TRATAMIENTOS_PACIENTE.PACIENTE_ID%TYPE,
        p_estado        IN  ODO_TRATAMIENTOS_PACIENTE.ESTADO%TYPE DEFAULT NULL,
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener tratamientos por doctor
    PROCEDURE get_tratamientos_by_doctor(
        p_doctor_id     IN  ODO_TRATAMIENTOS_PACIENTE.DOCTOR_ID%TYPE,
        p_estado        IN  ODO_TRATAMIENTOS_PACIENTE.ESTADO%TYPE DEFAULT NULL,
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Asignar tratamiento a paciente
    PROCEDURE insert_tratamiento_paciente(
        p_paciente_id       IN  ODO_TRATAMIENTOS_PACIENTE.PACIENTE_ID%TYPE,
        p_historia_id       IN  ODO_TRATAMIENTOS_PACIENTE.HISTORIA_ID%TYPE DEFAULT NULL,
        p_catalogo_id       IN  ODO_TRATAMIENTOS_PACIENTE.CATALOGO_ID%TYPE,
        p_doctor_id         IN  ODO_TRATAMIENTOS_PACIENTE.DOCTOR_ID%TYPE,
        p_numero_diente     IN  ODO_TRATAMIENTOS_PACIENTE.NUMERO_DIENTE%TYPE DEFAULT NULL,
        p_fecha_propuesta   IN  ODO_TRATAMIENTOS_PACIENTE.FECHA_PROPUESTA%TYPE DEFAULT NULL,
        p_precio_acordado   IN  ODO_TRATAMIENTOS_PACIENTE.PRECIO_ACORDADO%TYPE DEFAULT NULL,
        p_descuento         IN  ODO_TRATAMIENTOS_PACIENTE.DESCUENTO%TYPE DEFAULT 0,
        p_sesiones_totales  IN  ODO_TRATAMIENTOS_PACIENTE.SESIONES_TOTALES%TYPE DEFAULT 1,
        p_tratamiento_paciente_id OUT ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Actualizar tratamiento de paciente
    PROCEDURE update_tratamiento_paciente(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_numero_diente     IN  ODO_TRATAMIENTOS_PACIENTE.NUMERO_DIENTE%TYPE DEFAULT NULL,
        p_fecha_propuesta   IN  ODO_TRATAMIENTOS_PACIENTE.FECHA_PROPUESTA%TYPE DEFAULT NULL,
        p_precio_acordado   IN  ODO_TRATAMIENTOS_PACIENTE.PRECIO_ACORDADO%TYPE DEFAULT NULL,
        p_descuento         IN  ODO_TRATAMIENTOS_PACIENTE.DESCUENTO%TYPE DEFAULT NULL,
        p_sesiones_totales  IN  ODO_TRATAMIENTOS_PACIENTE.SESIONES_TOTALES%TYPE DEFAULT NULL,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Cambiar estado de tratamiento
    PROCEDURE cambiar_estado_tratamiento(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_nuevo_estado      IN  ODO_TRATAMIENTOS_PACIENTE.ESTADO%TYPE,
        p_usuario_id        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Iniciar tratamiento
    PROCEDURE iniciar_tratamiento(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_usuario_id        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Completar tratamiento
    PROCEDURE completar_tratamiento(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_usuario_id        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Cancelar tratamiento
    PROCEDURE cancelar_tratamiento(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_usuario_id        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- ========================================================================
    -- PROCEDIMIENTOS DE SESIONES
    -- ========================================================================

    -- Obtener sesiones de un tratamiento
    PROCEDURE get_sesiones_tratamiento(
        p_tratamiento_paciente_id IN ODO_SESIONES_TRATAMIENTO.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_cursor                  OUT t_sesion_cursor,
        p_resultado               OUT NUMBER,
        p_mensaje                 OUT VARCHAR2
    );

    -- Registrar sesion
    PROCEDURE insert_sesion(
        p_tratamiento_paciente_id IN ODO_SESIONES_TRATAMIENTO.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_cita_id               IN  ODO_SESIONES_TRATAMIENTO.CITA_ID%TYPE DEFAULT NULL,
        p_doctor_id             IN  ODO_SESIONES_TRATAMIENTO.DOCTOR_ID%TYPE,
        p_fecha_sesion          IN  ODO_SESIONES_TRATAMIENTO.FECHA_SESION%TYPE DEFAULT SYSDATE,
        p_descripcion           IN  ODO_SESIONES_TRATAMIENTO.DESCRIPCION%TYPE DEFAULT NULL,
        p_materiales_usados     IN  ODO_SESIONES_TRATAMIENTO.MATERIALES_USADOS%TYPE DEFAULT NULL,
        p_observaciones         IN  ODO_SESIONES_TRATAMIENTO.OBSERVACIONES%TYPE DEFAULT NULL,
        p_completada            IN  ODO_SESIONES_TRATAMIENTO.COMPLETADA%TYPE DEFAULT 'S',
        p_sesion_id             OUT ODO_SESIONES_TRATAMIENTO.SESION_ID%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );

    -- Actualizar sesion
    PROCEDURE update_sesion(
        p_sesion_id             IN  ODO_SESIONES_TRATAMIENTO.SESION_ID%TYPE,
        p_descripcion           IN  ODO_SESIONES_TRATAMIENTO.DESCRIPCION%TYPE DEFAULT NULL,
        p_materiales_usados     IN  ODO_SESIONES_TRATAMIENTO.MATERIALES_USADOS%TYPE DEFAULT NULL,
        p_observaciones         IN  ODO_SESIONES_TRATAMIENTO.OBSERVACIONES%TYPE DEFAULT NULL,
        p_completada            IN  ODO_SESIONES_TRATAMIENTO.COMPLETADA%TYPE DEFAULT NULL,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );

    -- Eliminar sesion
    PROCEDURE delete_sesion(
        p_sesion_id     IN  ODO_SESIONES_TRATAMIENTO.SESION_ID%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- ========================================================================
    -- FUNCIONES DE UTILIDAD
    -- ========================================================================

    -- Calcular precio final con descuento
    FUNCTION calcular_precio_final(
        p_precio_base   IN NUMBER,
        p_descuento     IN NUMBER
    ) RETURN NUMBER;

    -- Obtener progreso del tratamiento (porcentaje)
    FUNCTION get_progreso_tratamiento(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE
    ) RETURN NUMBER;

    -- Contar tratamientos pendientes de paciente
    FUNCTION count_tratamientos_pendientes(
        p_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.PACIENTE_ID%TYPE
    ) RETURN NUMBER;

END PKG_TRATAMIENTOS;
/

-- ============================================================================
-- CUERPO DEL PACKAGE
-- ============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_TRATAMIENTOS AS

    -- ========================================================================
    -- PROCEDIMIENTOS DE CATALOGO
    -- ========================================================================

    PROCEDURE get_catalogo(
        p_categoria     IN  ODO_CATALOGOS_TRATAMIENTOS.CATEGORIA%TYPE DEFAULT NULL,
        p_activo        IN  ODO_CATALOGOS_TRATAMIENTOS.ACTIVO%TYPE DEFAULT 'S',
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                CATALOGO_ID,
                CODIGO,
                NOMBRE,
                DESCRIPCION,
                CATEGORIA,
                PRECIO_BASE,
                DURACION_ESTIMADA,
                REQUIERE_ANESTESIA,
                ACTIVO
            FROM ODO_CATALOGOS_TRATAMIENTOS
            WHERE (p_categoria IS NULL OR CATEGORIA = p_categoria)
              AND (p_activo IS NULL OR ACTIVO = p_activo)
            ORDER BY CATEGORIA, NOMBRE;

        p_resultado := 1;
        p_mensaje := 'Catalogo obtenido exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener catalogo: ' || SQLERRM;
    END get_catalogo;

    -- ------------------------------------------------------------------------

    PROCEDURE get_catalogo_item(
        p_catalogo_id   IN  ODO_CATALOGOS_TRATAMIENTOS.CATALOGO_ID%TYPE,
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                CATALOGO_ID,
                CODIGO,
                NOMBRE,
                DESCRIPCION,
                CATEGORIA,
                PRECIO_BASE,
                DURACION_ESTIMADA,
                REQUIERE_ANESTESIA,
                ACTIVO
            FROM ODO_CATALOGOS_TRATAMIENTOS
            WHERE CATALOGO_ID = p_catalogo_id;

        p_resultado := 1;
        p_mensaje := 'Item obtenido exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener item: ' || SQLERRM;
    END get_catalogo_item;

    -- ------------------------------------------------------------------------

    PROCEDURE search_catalogo(
        p_termino       IN  VARCHAR2,
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
        v_termino VARCHAR2(200);
    BEGIN
        v_termino := '%' || UPPER(p_termino) || '%';

        OPEN p_cursor FOR
            SELECT
                CATALOGO_ID,
                CODIGO,
                NOMBRE,
                DESCRIPCION,
                CATEGORIA,
                PRECIO_BASE,
                DURACION_ESTIMADA,
                REQUIERE_ANESTESIA,
                ACTIVO
            FROM ODO_CATALOGOS_TRATAMIENTOS
            WHERE (UPPER(NOMBRE) LIKE v_termino
                   OR UPPER(CODIGO) LIKE v_termino
                   OR UPPER(DESCRIPCION) LIKE v_termino)
              AND ACTIVO = 'S'
            ORDER BY NOMBRE;

        p_resultado := 1;
        p_mensaje := 'Busqueda completada';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error en busqueda: ' || SQLERRM;
    END search_catalogo;

    -- ------------------------------------------------------------------------

    PROCEDURE insert_catalogo(
        p_codigo                IN  ODO_CATALOGOS_TRATAMIENTOS.CODIGO%TYPE,
        p_nombre                IN  ODO_CATALOGOS_TRATAMIENTOS.NOMBRE%TYPE,
        p_descripcion           IN  ODO_CATALOGOS_TRATAMIENTOS.DESCRIPCION%TYPE DEFAULT NULL,
        p_categoria             IN  ODO_CATALOGOS_TRATAMIENTOS.CATEGORIA%TYPE,
        p_precio_base           IN  ODO_CATALOGOS_TRATAMIENTOS.PRECIO_BASE%TYPE,
        p_duracion_estimada     IN  ODO_CATALOGOS_TRATAMIENTOS.DURACION_ESTIMADA%TYPE DEFAULT NULL,
        p_requiere_anestesia    IN  ODO_CATALOGOS_TRATAMIENTOS.REQUIERE_ANESTESIA%TYPE DEFAULT 'N',
        p_catalogo_id           OUT ODO_CATALOGOS_TRATAMIENTOS.CATALOGO_ID%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    ) IS
        v_codigo_existe NUMBER;
    BEGIN
        -- Verificar codigo unico
        SELECT COUNT(*) INTO v_codigo_existe
        FROM ODO_CATALOGOS_TRATAMIENTOS
        WHERE UPPER(CODIGO) = UPPER(p_codigo);

        IF v_codigo_existe > 0 THEN
            p_resultado := 0;
            p_mensaje := 'El codigo ya existe en el catalogo';
            RETURN;
        END IF;

        INSERT INTO ODO_CATALOGOS_TRATAMIENTOS (
            CODIGO,
            NOMBRE,
            DESCRIPCION,
            CATEGORIA,
            PRECIO_BASE,
            DURACION_ESTIMADA,
            REQUIERE_ANESTESIA,
            ACTIVO
        ) VALUES (
            p_codigo,
            p_nombre,
            p_descripcion,
            p_categoria,
            p_precio_base,
            p_duracion_estimada,
            p_requiere_anestesia,
            'S'
        ) RETURNING CATALOGO_ID INTO p_catalogo_id;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Tratamiento agregado al catalogo con ID: ' || p_catalogo_id;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al insertar en catalogo: ' || SQLERRM;
    END insert_catalogo;

    -- ------------------------------------------------------------------------

    PROCEDURE update_catalogo(
        p_catalogo_id           IN  ODO_CATALOGOS_TRATAMIENTOS.CATALOGO_ID%TYPE,
        p_codigo                IN  ODO_CATALOGOS_TRATAMIENTOS.CODIGO%TYPE DEFAULT NULL,
        p_nombre                IN  ODO_CATALOGOS_TRATAMIENTOS.NOMBRE%TYPE DEFAULT NULL,
        p_descripcion           IN  ODO_CATALOGOS_TRATAMIENTOS.DESCRIPCION%TYPE DEFAULT NULL,
        p_categoria             IN  ODO_CATALOGOS_TRATAMIENTOS.CATEGORIA%TYPE DEFAULT NULL,
        p_precio_base           IN  ODO_CATALOGOS_TRATAMIENTOS.PRECIO_BASE%TYPE DEFAULT NULL,
        p_duracion_estimada     IN  ODO_CATALOGOS_TRATAMIENTOS.DURACION_ESTIMADA%TYPE DEFAULT NULL,
        p_requiere_anestesia    IN  ODO_CATALOGOS_TRATAMIENTOS.REQUIERE_ANESTESIA%TYPE DEFAULT NULL,
        p_activo                IN  ODO_CATALOGOS_TRATAMIENTOS.ACTIVO%TYPE DEFAULT NULL,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    ) IS
    BEGIN
        UPDATE ODO_CATALOGOS_TRATAMIENTOS
        SET CODIGO = NVL(p_codigo, CODIGO),
            NOMBRE = NVL(p_nombre, NOMBRE),
            DESCRIPCION = NVL(p_descripcion, DESCRIPCION),
            CATEGORIA = NVL(p_categoria, CATEGORIA),
            PRECIO_BASE = NVL(p_precio_base, PRECIO_BASE),
            DURACION_ESTIMADA = NVL(p_duracion_estimada, DURACION_ESTIMADA),
            REQUIERE_ANESTESIA = NVL(p_requiere_anestesia, REQUIERE_ANESTESIA),
            ACTIVO = NVL(p_activo, ACTIVO)
        WHERE CATALOGO_ID = p_catalogo_id;

        IF SQL%ROWCOUNT = 0 THEN
            p_resultado := 0;
            p_mensaje := 'Item de catalogo no encontrado';
            RETURN;
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Catalogo actualizado exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al actualizar catalogo: ' || SQLERRM;
    END update_catalogo;

    -- ========================================================================
    -- PROCEDIMIENTOS DE TRATAMIENTOS DE PACIENTE
    -- ========================================================================

    PROCEDURE get_tratamiento_paciente(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_cursor                  OUT t_tratamiento_cursor,
        p_resultado               OUT NUMBER,
        p_mensaje                 OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                tp.TRATAMIENTO_PACIENTE_ID,
                tp.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                tp.HISTORIA_ID,
                tp.CATALOGO_ID,
                ct.CODIGO AS TRATAMIENTO_CODIGO,
                ct.NOMBRE AS TRATAMIENTO_NOMBRE,
                ct.CATEGORIA AS TRATAMIENTO_CATEGORIA,
                tp.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                tp.NUMERO_DIENTE,
                tp.ESTADO,
                tp.FECHA_PROPUESTA,
                tp.FECHA_INICIO,
                tp.FECHA_FINALIZACION,
                tp.PRECIO_ACORDADO,
                tp.DESCUENTO,
                tp.PRECIO_FINAL,
                tp.SESIONES_TOTALES,
                tp.SESIONES_COMPLETADAS,
                tp.FECHA_CREACION
            FROM ODO_TRATAMIENTOS_PACIENTE tp
            JOIN ODO_PACIENTES p ON tp.PACIENTE_ID = p.PACIENTE_ID
            JOIN ODO_CATALOGOS_TRATAMIENTOS ct ON tp.CATALOGO_ID = ct.CATALOGO_ID
            LEFT JOIN ODO_USUARIOS u ON tp.DOCTOR_ID = u.USUARIO_ID
            WHERE tp.TRATAMIENTO_PACIENTE_ID = p_tratamiento_paciente_id;

        p_resultado := 1;
        p_mensaje := 'Tratamiento obtenido exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener tratamiento: ' || SQLERRM;
    END get_tratamiento_paciente;

    -- ------------------------------------------------------------------------

    PROCEDURE get_tratamientos_by_paciente(
        p_paciente_id   IN  ODO_TRATAMIENTOS_PACIENTE.PACIENTE_ID%TYPE,
        p_estado        IN  ODO_TRATAMIENTOS_PACIENTE.ESTADO%TYPE DEFAULT NULL,
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                tp.TRATAMIENTO_PACIENTE_ID,
                tp.PACIENTE_ID,
                tp.CATALOGO_ID,
                ct.CODIGO AS TRATAMIENTO_CODIGO,
                ct.NOMBRE AS TRATAMIENTO_NOMBRE,
                ct.CATEGORIA AS TRATAMIENTO_CATEGORIA,
                tp.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                tp.NUMERO_DIENTE,
                tp.ESTADO,
                tp.FECHA_PROPUESTA,
                tp.FECHA_INICIO,
                tp.FECHA_FINALIZACION,
                tp.PRECIO_ACORDADO,
                tp.DESCUENTO,
                tp.PRECIO_FINAL,
                tp.SESIONES_TOTALES,
                tp.SESIONES_COMPLETADAS,
                ROUND((tp.SESIONES_COMPLETADAS / NULLIF(tp.SESIONES_TOTALES, 0)) * 100, 0) AS PROGRESO_PCT
            FROM ODO_TRATAMIENTOS_PACIENTE tp
            JOIN ODO_CATALOGOS_TRATAMIENTOS ct ON tp.CATALOGO_ID = ct.CATALOGO_ID
            LEFT JOIN ODO_USUARIOS u ON tp.DOCTOR_ID = u.USUARIO_ID
            WHERE tp.PACIENTE_ID = p_paciente_id
              AND (p_estado IS NULL OR tp.ESTADO = p_estado)
            ORDER BY
                CASE tp.ESTADO
                    WHEN 'EN_PROGRESO' THEN 1
                    WHEN 'PENDIENTE' THEN 2
                    WHEN 'COMPLETADO' THEN 3
                    ELSE 4
                END,
                tp.FECHA_CREACION DESC;

        p_resultado := 1;
        p_mensaje := 'Tratamientos obtenidos exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener tratamientos: ' || SQLERRM;
    END get_tratamientos_by_paciente;

    -- ------------------------------------------------------------------------

    PROCEDURE get_tratamientos_by_doctor(
        p_doctor_id     IN  ODO_TRATAMIENTOS_PACIENTE.DOCTOR_ID%TYPE,
        p_estado        IN  ODO_TRATAMIENTOS_PACIENTE.ESTADO%TYPE DEFAULT NULL,
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                tp.TRATAMIENTO_PACIENTE_ID,
                tp.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                p.NUMERO_HISTORIA,
                tp.CATALOGO_ID,
                ct.NOMBRE AS TRATAMIENTO_NOMBRE,
                tp.NUMERO_DIENTE,
                tp.ESTADO,
                tp.FECHA_PROPUESTA,
                tp.SESIONES_TOTALES,
                tp.SESIONES_COMPLETADAS
            FROM ODO_TRATAMIENTOS_PACIENTE tp
            JOIN ODO_PACIENTES p ON tp.PACIENTE_ID = p.PACIENTE_ID
            JOIN ODO_CATALOGOS_TRATAMIENTOS ct ON tp.CATALOGO_ID = ct.CATALOGO_ID
            WHERE tp.DOCTOR_ID = p_doctor_id
              AND (p_estado IS NULL OR tp.ESTADO = p_estado)
            ORDER BY tp.FECHA_CREACION DESC;

        p_resultado := 1;
        p_mensaje := 'Tratamientos obtenidos exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener tratamientos: ' || SQLERRM;
    END get_tratamientos_by_doctor;

    -- ------------------------------------------------------------------------

    PROCEDURE insert_tratamiento_paciente(
        p_paciente_id       IN  ODO_TRATAMIENTOS_PACIENTE.PACIENTE_ID%TYPE,
        p_historia_id       IN  ODO_TRATAMIENTOS_PACIENTE.HISTORIA_ID%TYPE DEFAULT NULL,
        p_catalogo_id       IN  ODO_TRATAMIENTOS_PACIENTE.CATALOGO_ID%TYPE,
        p_doctor_id         IN  ODO_TRATAMIENTOS_PACIENTE.DOCTOR_ID%TYPE,
        p_numero_diente     IN  ODO_TRATAMIENTOS_PACIENTE.NUMERO_DIENTE%TYPE DEFAULT NULL,
        p_fecha_propuesta   IN  ODO_TRATAMIENTOS_PACIENTE.FECHA_PROPUESTA%TYPE DEFAULT NULL,
        p_precio_acordado   IN  ODO_TRATAMIENTOS_PACIENTE.PRECIO_ACORDADO%TYPE DEFAULT NULL,
        p_descuento         IN  ODO_TRATAMIENTOS_PACIENTE.DESCUENTO%TYPE DEFAULT 0,
        p_sesiones_totales  IN  ODO_TRATAMIENTOS_PACIENTE.SESIONES_TOTALES%TYPE DEFAULT 1,
        p_tratamiento_paciente_id OUT ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
        v_precio_base ODO_CATALOGOS_TRATAMIENTOS.PRECIO_BASE%TYPE;
        v_precio_acordado ODO_TRATAMIENTOS_PACIENTE.PRECIO_ACORDADO%TYPE;
        v_precio_final ODO_TRATAMIENTOS_PACIENTE.PRECIO_FINAL%TYPE;
    BEGIN
        -- Obtener precio base del catalogo
        SELECT PRECIO_BASE INTO v_precio_base
        FROM ODO_CATALOGOS_TRATAMIENTOS
        WHERE CATALOGO_ID = p_catalogo_id;

        -- Usar precio acordado o precio base
        v_precio_acordado := NVL(p_precio_acordado, v_precio_base);

        -- Calcular precio final
        v_precio_final := calcular_precio_final(v_precio_acordado, NVL(p_descuento, 0));

        -- Insertar tratamiento
        INSERT INTO ODO_TRATAMIENTOS_PACIENTE (
            PACIENTE_ID,
            HISTORIA_ID,
            CATALOGO_ID,
            DOCTOR_ID,
            NUMERO_DIENTE,
            ESTADO,
            FECHA_PROPUESTA,
            PRECIO_ACORDADO,
            DESCUENTO,
            PRECIO_FINAL,
            SESIONES_TOTALES,
            SESIONES_COMPLETADAS,
            FECHA_CREACION,
            CREADO_POR
        ) VALUES (
            p_paciente_id,
            p_historia_id,
            p_catalogo_id,
            p_doctor_id,
            p_numero_diente,
            c_estado_pendiente,
            p_fecha_propuesta,
            v_precio_acordado,
            NVL(p_descuento, 0),
            v_precio_final,
            p_sesiones_totales,
            0,
            SYSTIMESTAMP,
            p_doctor_id
        ) RETURNING TRATAMIENTO_PACIENTE_ID INTO p_tratamiento_paciente_id;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Tratamiento asignado con ID: ' || p_tratamiento_paciente_id;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_resultado := 0;
            p_mensaje := 'El tratamiento del catalogo no existe';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al asignar tratamiento: ' || SQLERRM;
    END insert_tratamiento_paciente;

    -- ------------------------------------------------------------------------

    PROCEDURE update_tratamiento_paciente(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_numero_diente     IN  ODO_TRATAMIENTOS_PACIENTE.NUMERO_DIENTE%TYPE DEFAULT NULL,
        p_fecha_propuesta   IN  ODO_TRATAMIENTOS_PACIENTE.FECHA_PROPUESTA%TYPE DEFAULT NULL,
        p_precio_acordado   IN  ODO_TRATAMIENTOS_PACIENTE.PRECIO_ACORDADO%TYPE DEFAULT NULL,
        p_descuento         IN  ODO_TRATAMIENTOS_PACIENTE.DESCUENTO%TYPE DEFAULT NULL,
        p_sesiones_totales  IN  ODO_TRATAMIENTOS_PACIENTE.SESIONES_TOTALES%TYPE DEFAULT NULL,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
        v_estado_actual ODO_TRATAMIENTOS_PACIENTE.ESTADO%TYPE;
        v_precio_acordado ODO_TRATAMIENTOS_PACIENTE.PRECIO_ACORDADO%TYPE;
        v_descuento ODO_TRATAMIENTOS_PACIENTE.DESCUENTO%TYPE;
    BEGIN
        -- Obtener estado y valores actuales
        SELECT ESTADO, PRECIO_ACORDADO, DESCUENTO
        INTO v_estado_actual, v_precio_acordado, v_descuento
        FROM ODO_TRATAMIENTOS_PACIENTE
        WHERE TRATAMIENTO_PACIENTE_ID = p_tratamiento_paciente_id;

        -- No permitir modificar si esta completado o cancelado
        IF v_estado_actual IN (c_estado_completado, c_estado_cancelado) THEN
            p_resultado := 0;
            p_mensaje := 'No se puede modificar un tratamiento ' || v_estado_actual;
            RETURN;
        END IF;

        -- Usar nuevos valores o mantener los actuales
        v_precio_acordado := NVL(p_precio_acordado, v_precio_acordado);
        v_descuento := NVL(p_descuento, v_descuento);

        UPDATE ODO_TRATAMIENTOS_PACIENTE
        SET NUMERO_DIENTE = NVL(p_numero_diente, NUMERO_DIENTE),
            FECHA_PROPUESTA = NVL(p_fecha_propuesta, FECHA_PROPUESTA),
            PRECIO_ACORDADO = v_precio_acordado,
            DESCUENTO = v_descuento,
            PRECIO_FINAL = calcular_precio_final(v_precio_acordado, v_descuento),
            SESIONES_TOTALES = NVL(p_sesiones_totales, SESIONES_TOTALES)
        WHERE TRATAMIENTO_PACIENTE_ID = p_tratamiento_paciente_id;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Tratamiento actualizado exitosamente';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_resultado := 0;
            p_mensaje := 'Tratamiento no encontrado';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al actualizar: ' || SQLERRM;
    END update_tratamiento_paciente;

    -- ------------------------------------------------------------------------

    PROCEDURE cambiar_estado_tratamiento(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_nuevo_estado      IN  ODO_TRATAMIENTOS_PACIENTE.ESTADO%TYPE,
        p_usuario_id        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
        v_estado_actual ODO_TRATAMIENTOS_PACIENTE.ESTADO%TYPE;
    BEGIN
        SELECT ESTADO INTO v_estado_actual
        FROM ODO_TRATAMIENTOS_PACIENTE
        WHERE TRATAMIENTO_PACIENTE_ID = p_tratamiento_paciente_id;

        -- Validar transiciones
        IF v_estado_actual = c_estado_completado THEN
            p_resultado := 0;
            p_mensaje := 'No se puede cambiar el estado de un tratamiento completado';
            RETURN;
        END IF;

        IF v_estado_actual = c_estado_cancelado THEN
            p_resultado := 0;
            p_mensaje := 'No se puede cambiar el estado de un tratamiento cancelado';
            RETURN;
        END IF;

        UPDATE ODO_TRATAMIENTOS_PACIENTE
        SET ESTADO = p_nuevo_estado,
            FECHA_INICIO = CASE
                WHEN p_nuevo_estado = c_estado_en_progreso AND FECHA_INICIO IS NULL
                THEN SYSDATE ELSE FECHA_INICIO END,
            FECHA_FINALIZACION = CASE
                WHEN p_nuevo_estado IN (c_estado_completado, c_estado_cancelado)
                THEN SYSDATE ELSE FECHA_FINALIZACION END
        WHERE TRATAMIENTO_PACIENTE_ID = p_tratamiento_paciente_id;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Estado actualizado a ' || p_nuevo_estado;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_resultado := 0;
            p_mensaje := 'Tratamiento no encontrado';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al cambiar estado: ' || SQLERRM;
    END cambiar_estado_tratamiento;

    -- ------------------------------------------------------------------------

    PROCEDURE iniciar_tratamiento(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_usuario_id        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
    BEGIN
        cambiar_estado_tratamiento(p_tratamiento_paciente_id, c_estado_en_progreso,
                                   p_usuario_id, p_resultado, p_mensaje);
    END iniciar_tratamiento;

    -- ------------------------------------------------------------------------

    PROCEDURE completar_tratamiento(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_usuario_id        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
    BEGIN
        cambiar_estado_tratamiento(p_tratamiento_paciente_id, c_estado_completado,
                                   p_usuario_id, p_resultado, p_mensaje);
    END completar_tratamiento;

    -- ------------------------------------------------------------------------

    PROCEDURE cancelar_tratamiento(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_usuario_id        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
    BEGIN
        cambiar_estado_tratamiento(p_tratamiento_paciente_id, c_estado_cancelado,
                                   p_usuario_id, p_resultado, p_mensaje);
    END cancelar_tratamiento;

    -- ========================================================================
    -- PROCEDIMIENTOS DE SESIONES
    -- ========================================================================

    PROCEDURE get_sesiones_tratamiento(
        p_tratamiento_paciente_id IN ODO_SESIONES_TRATAMIENTO.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_cursor                  OUT t_sesion_cursor,
        p_resultado               OUT NUMBER,
        p_mensaje                 OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                s.SESION_ID,
                s.TRATAMIENTO_PACIENTE_ID,
                s.CITA_ID,
                s.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                s.NUMERO_SESION,
                s.FECHA_SESION,
                s.DESCRIPCION,
                s.MATERIALES_USADOS,
                s.OBSERVACIONES,
                s.COMPLETADA
            FROM ODO_SESIONES_TRATAMIENTO s
            LEFT JOIN ODO_USUARIOS u ON s.DOCTOR_ID = u.USUARIO_ID
            WHERE s.TRATAMIENTO_PACIENTE_ID = p_tratamiento_paciente_id
            ORDER BY s.NUMERO_SESION;

        p_resultado := 1;
        p_mensaje := 'Sesiones obtenidas exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener sesiones: ' || SQLERRM;
    END get_sesiones_tratamiento;

    -- ------------------------------------------------------------------------

    PROCEDURE insert_sesion(
        p_tratamiento_paciente_id IN ODO_SESIONES_TRATAMIENTO.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_cita_id               IN  ODO_SESIONES_TRATAMIENTO.CITA_ID%TYPE DEFAULT NULL,
        p_doctor_id             IN  ODO_SESIONES_TRATAMIENTO.DOCTOR_ID%TYPE,
        p_fecha_sesion          IN  ODO_SESIONES_TRATAMIENTO.FECHA_SESION%TYPE DEFAULT SYSDATE,
        p_descripcion           IN  ODO_SESIONES_TRATAMIENTO.DESCRIPCION%TYPE DEFAULT NULL,
        p_materiales_usados     IN  ODO_SESIONES_TRATAMIENTO.MATERIALES_USADOS%TYPE DEFAULT NULL,
        p_observaciones         IN  ODO_SESIONES_TRATAMIENTO.OBSERVACIONES%TYPE DEFAULT NULL,
        p_completada            IN  ODO_SESIONES_TRATAMIENTO.COMPLETADA%TYPE DEFAULT 'S',
        p_sesion_id             OUT ODO_SESIONES_TRATAMIENTO.SESION_ID%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    ) IS
        v_numero_sesion NUMBER;
        v_sesiones_totales NUMBER;
        v_sesiones_completadas NUMBER;
        v_estado_actual ODO_TRATAMIENTOS_PACIENTE.ESTADO%TYPE;
    BEGIN
        -- Obtener informacion del tratamiento
        SELECT SESIONES_TOTALES, SESIONES_COMPLETADAS, ESTADO
        INTO v_sesiones_totales, v_sesiones_completadas, v_estado_actual
        FROM ODO_TRATAMIENTOS_PACIENTE
        WHERE TRATAMIENTO_PACIENTE_ID = p_tratamiento_paciente_id;

        -- Validar estado
        IF v_estado_actual IN (c_estado_completado, c_estado_cancelado) THEN
            p_resultado := 0;
            p_mensaje := 'No se pueden agregar sesiones a un tratamiento ' || v_estado_actual;
            RETURN;
        END IF;

        -- Calcular numero de sesion
        v_numero_sesion := v_sesiones_completadas + 1;

        -- Insertar sesion
        INSERT INTO ODO_SESIONES_TRATAMIENTO (
            TRATAMIENTO_PACIENTE_ID,
            CITA_ID,
            DOCTOR_ID,
            NUMERO_SESION,
            FECHA_SESION,
            DESCRIPCION,
            MATERIALES_USADOS,
            OBSERVACIONES,
            COMPLETADA
        ) VALUES (
            p_tratamiento_paciente_id,
            p_cita_id,
            p_doctor_id,
            v_numero_sesion,
            NVL(p_fecha_sesion, SYSDATE),
            p_descripcion,
            p_materiales_usados,
            p_observaciones,
            p_completada
        ) RETURNING SESION_ID INTO p_sesion_id;

        -- Si la sesion esta completada, actualizar contador
        IF p_completada = 'S' THEN
            UPDATE ODO_TRATAMIENTOS_PACIENTE
            SET SESIONES_COMPLETADAS = v_sesiones_completadas + 1,
                -- Si es la primera sesion, cambiar a EN_PROGRESO
                ESTADO = CASE
                    WHEN ESTADO = c_estado_pendiente THEN c_estado_en_progreso
                    ELSE ESTADO
                END,
                FECHA_INICIO = CASE
                    WHEN FECHA_INICIO IS NULL THEN SYSDATE
                    ELSE FECHA_INICIO
                END
            WHERE TRATAMIENTO_PACIENTE_ID = p_tratamiento_paciente_id;

            -- Verificar si se completaron todas las sesiones
            IF v_sesiones_completadas + 1 >= v_sesiones_totales THEN
                UPDATE ODO_TRATAMIENTOS_PACIENTE
                SET ESTADO = c_estado_completado,
                    FECHA_FINALIZACION = SYSDATE
                WHERE TRATAMIENTO_PACIENTE_ID = p_tratamiento_paciente_id;
            END IF;
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Sesion ' || v_numero_sesion || ' registrada exitosamente';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_resultado := 0;
            p_mensaje := 'Tratamiento no encontrado';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al registrar sesion: ' || SQLERRM;
    END insert_sesion;

    -- ------------------------------------------------------------------------

    PROCEDURE update_sesion(
        p_sesion_id             IN  ODO_SESIONES_TRATAMIENTO.SESION_ID%TYPE,
        p_descripcion           IN  ODO_SESIONES_TRATAMIENTO.DESCRIPCION%TYPE DEFAULT NULL,
        p_materiales_usados     IN  ODO_SESIONES_TRATAMIENTO.MATERIALES_USADOS%TYPE DEFAULT NULL,
        p_observaciones         IN  ODO_SESIONES_TRATAMIENTO.OBSERVACIONES%TYPE DEFAULT NULL,
        p_completada            IN  ODO_SESIONES_TRATAMIENTO.COMPLETADA%TYPE DEFAULT NULL,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    ) IS
    BEGIN
        UPDATE ODO_SESIONES_TRATAMIENTO
        SET DESCRIPCION = NVL(p_descripcion, DESCRIPCION),
            MATERIALES_USADOS = NVL(p_materiales_usados, MATERIALES_USADOS),
            OBSERVACIONES = NVL(p_observaciones, OBSERVACIONES),
            COMPLETADA = NVL(p_completada, COMPLETADA)
        WHERE SESION_ID = p_sesion_id;

        IF SQL%ROWCOUNT = 0 THEN
            p_resultado := 0;
            p_mensaje := 'Sesion no encontrada';
            RETURN;
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Sesion actualizada exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al actualizar sesion: ' || SQLERRM;
    END update_sesion;

    -- ------------------------------------------------------------------------

    PROCEDURE delete_sesion(
        p_sesion_id     IN  ODO_SESIONES_TRATAMIENTO.SESION_ID%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
        v_tratamiento_id ODO_SESIONES_TRATAMIENTO.TRATAMIENTO_PACIENTE_ID%TYPE;
        v_completada ODO_SESIONES_TRATAMIENTO.COMPLETADA%TYPE;
    BEGIN
        -- Obtener datos de la sesion
        SELECT TRATAMIENTO_PACIENTE_ID, COMPLETADA
        INTO v_tratamiento_id, v_completada
        FROM ODO_SESIONES_TRATAMIENTO
        WHERE SESION_ID = p_sesion_id;

        -- Eliminar sesion
        DELETE FROM ODO_SESIONES_TRATAMIENTO WHERE SESION_ID = p_sesion_id;

        -- Si estaba completada, decrementar contador
        IF v_completada = 'S' THEN
            UPDATE ODO_TRATAMIENTOS_PACIENTE
            SET SESIONES_COMPLETADAS = GREATEST(0, SESIONES_COMPLETADAS - 1)
            WHERE TRATAMIENTO_PACIENTE_ID = v_tratamiento_id;
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Sesion eliminada exitosamente';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_resultado := 0;
            p_mensaje := 'Sesion no encontrada';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al eliminar sesion: ' || SQLERRM;
    END delete_sesion;

    -- ========================================================================
    -- FUNCIONES DE UTILIDAD
    -- ========================================================================

    FUNCTION calcular_precio_final(
        p_precio_base   IN NUMBER,
        p_descuento     IN NUMBER
    ) RETURN NUMBER IS
    BEGIN
        RETURN ROUND(p_precio_base * (1 - NVL(p_descuento, 0) / 100), 2);
    END calcular_precio_final;

    -- ------------------------------------------------------------------------

    FUNCTION get_progreso_tratamiento(
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE
    ) RETURN NUMBER IS
        v_sesiones_totales NUMBER;
        v_sesiones_completadas NUMBER;
    BEGIN
        SELECT SESIONES_TOTALES, SESIONES_COMPLETADAS
        INTO v_sesiones_totales, v_sesiones_completadas
        FROM ODO_TRATAMIENTOS_PACIENTE
        WHERE TRATAMIENTO_PACIENTE_ID = p_tratamiento_paciente_id;

        IF v_sesiones_totales = 0 THEN
            RETURN 0;
        END IF;

        RETURN ROUND((v_sesiones_completadas / v_sesiones_totales) * 100, 0);
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN 0;
    END get_progreso_tratamiento;

    -- ------------------------------------------------------------------------

    FUNCTION count_tratamientos_pendientes(
        p_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.PACIENTE_ID%TYPE
    ) RETURN NUMBER IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM ODO_TRATAMIENTOS_PACIENTE
        WHERE PACIENTE_ID = p_paciente_id
          AND ESTADO IN (c_estado_pendiente, c_estado_en_progreso);

        RETURN v_count;
    END count_tratamientos_pendientes;

END PKG_TRATAMIENTOS;
/
