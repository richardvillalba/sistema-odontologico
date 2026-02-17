-- ============================================
-- PKG_ODONTOGRAMA - Gestión de Odontogramas
-- Sistema de Odontología
-- Adaptado a la estructura real de tablas
-- ============================================

CREATE OR REPLACE PACKAGE PKG_ODONTOGRAMA AS

    -- Tipos de cursor para retorno
    TYPE t_cursor IS REF CURSOR;

    -- Constantes de estados de diente
    c_estado_sano       CONSTANT VARCHAR2(30) := 'SANO';
    c_estado_caries     CONSTANT VARCHAR2(30) := 'CARIES';
    c_estado_obturado   CONSTANT VARCHAR2(30) := 'OBTURADO';
    c_estado_ausente    CONSTANT VARCHAR2(30) := 'AUSENTE';
    c_estado_corona     CONSTANT VARCHAR2(30) := 'CORONA';
    c_estado_endodoncia CONSTANT VARCHAR2(30) := 'ENDODONCIA';
    c_estado_implante   CONSTANT VARCHAR2(30) := 'IMPLANTE';
    c_estado_protesis   CONSTANT VARCHAR2(30) := 'PROTESIS';
    c_estado_fracturado CONSTANT VARCHAR2(30) := 'FRACTURADO';
    c_estado_extraccion CONSTANT VARCHAR2(30) := 'EXTRACCION_INDICADA';

    -- ============================================
    -- PROCEDIMIENTOS DE ODONTOGRAMA
    -- ============================================

    -- Crear nuevo odontograma para un paciente
    PROCEDURE crear_odontograma(
        p_paciente_id       IN  ODO_ODONTOGRAMAS.PACIENTE_ID%TYPE,
        p_empresa_id        IN  ODO_ODONTOGRAMAS.EMPRESA_ID%TYPE DEFAULT 1,
        p_tipo              IN  ODO_ODONTOGRAMAS.TIPO%TYPE DEFAULT 'PERMANENTE',
        p_observaciones     IN  ODO_ODONTOGRAMAS.OBSERVACIONES%TYPE DEFAULT NULL,
        p_creado_por        IN  ODO_ODONTOGRAMAS.CREADO_POR%TYPE DEFAULT NULL,
        p_odontograma_id    OUT ODO_ODONTOGRAMAS.ODONTOGRAMA_ID%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Obtener odontograma actual de un paciente
    PROCEDURE get_odontograma_actual(
        p_paciente_id       IN  ODO_PACIENTES.PACIENTE_ID%TYPE,
        p_cursor            OUT t_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Obtener historial de odontogramas de un paciente
    PROCEDURE get_historial_odontogramas(
        p_paciente_id       IN  ODO_PACIENTES.PACIENTE_ID%TYPE,
        p_cursor            OUT t_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Obtener detalle de un odontograma con todos sus dientes
    PROCEDURE get_odontograma_detalle(
        p_odontograma_id    IN  ODO_ODONTOGRAMAS.ODONTOGRAMA_ID%TYPE,
        p_cursor            OUT t_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- ============================================
    -- PROCEDIMIENTOS DE DIENTES
    -- ============================================

    -- Actualizar estado de un diente específico
    PROCEDURE actualizar_diente(
        p_odontograma_id    IN  ODO_DIENTES.ODONTOGRAMA_ID%TYPE,
        p_numero_fdi        IN  ODO_DIENTES.NUMERO_FDI%TYPE,
        p_estado            IN  ODO_DIENTES.ESTADO%TYPE,
        p_observaciones     IN  ODO_DIENTES.OBSERVACIONES%TYPE DEFAULT NULL,
        p_modificado_por    IN  ODO_DIENTES.MODIFICADO_POR%TYPE DEFAULT NULL,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Actualizar múltiples dientes a la vez
    PROCEDURE actualizar_dientes_bulk(
        p_odontograma_id    IN  ODO_ODONTOGRAMAS.ODONTOGRAMA_ID%TYPE,
        p_dientes_json      IN  CLOB,
        p_modificado_por    IN  NUMBER DEFAULT NULL,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Obtener estado de un diente específico
    PROCEDURE get_diente(
        p_odontograma_id    IN  ODO_DIENTES.ODONTOGRAMA_ID%TYPE,
        p_numero_fdi        IN  ODO_DIENTES.NUMERO_FDI%TYPE,
        p_cursor            OUT t_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- ============================================
    -- PROCEDIMIENTOS DE HALLAZGOS
    -- ============================================

    -- Registrar hallazgo en un diente
    PROCEDURE registrar_hallazgo(
        p_diente_id             IN  ODO_HALLAZGOS_DIENTE.DIENTE_ID%TYPE,
        p_cita_id               IN  ODO_HALLAZGOS_DIENTE.CITA_ID%TYPE DEFAULT NULL,
        p_tipo_hallazgo         IN  ODO_HALLAZGOS_DIENTE.TIPO_HALLAZGO%TYPE,
        p_superficies_afectadas IN  ODO_HALLAZGOS_DIENTE.SUPERFICIES_AFECTADAS%TYPE DEFAULT NULL,
        p_severidad             IN  ODO_HALLAZGOS_DIENTE.SEVERIDAD%TYPE DEFAULT NULL,
        p_descripcion           IN  ODO_HALLAZGOS_DIENTE.DESCRIPCION%TYPE DEFAULT NULL,
        p_requiere_tratamiento  IN  ODO_HALLAZGOS_DIENTE.REQUIERE_TRATAMIENTO%TYPE DEFAULT 'S',
        p_doctor_id             IN  ODO_HALLAZGOS_DIENTE.DOCTOR_ID%TYPE,
        p_hallazgo_id           OUT ODO_HALLAZGOS_DIENTE.HALLAZGO_DIENTE_ID%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );

    -- Obtener hallazgos de un diente
    PROCEDURE get_hallazgos_diente(
        p_diente_id         IN  ODO_DIENTES.DIENTE_ID%TYPE,
        p_cursor            OUT t_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- ============================================
    -- FUNCIONES DE UTILIDAD
    -- ============================================

    -- Inicializar los 32 dientes de un odontograma permanente
    PROCEDURE inicializar_dientes_permanente(
        p_odontograma_id    IN  ODO_ODONTOGRAMAS.ODONTOGRAMA_ID%TYPE,
        p_creado_por        IN  NUMBER DEFAULT NULL
    );

    -- Inicializar los 20 dientes de un odontograma temporal (niños)
    PROCEDURE inicializar_dientes_temporal(
        p_odontograma_id    IN  ODO_ODONTOGRAMAS.ODONTOGRAMA_ID%TYPE,
        p_creado_por        IN  NUMBER DEFAULT NULL
    );

    -- Obtener resumen de estados del odontograma
    PROCEDURE get_resumen_odontograma(
        p_odontograma_id    IN  ODO_ODONTOGRAMAS.ODONTOGRAMA_ID%TYPE,
        p_cursor            OUT t_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

END PKG_ODONTOGRAMA;
/

-- ============================================
-- PACKAGE BODY
-- ============================================

CREATE OR REPLACE PACKAGE BODY PKG_ODONTOGRAMA AS

    -- ============================================
    -- Crear nuevo odontograma
    -- ============================================
    PROCEDURE crear_odontograma(
        p_paciente_id       IN  ODO_ODONTOGRAMAS.PACIENTE_ID%TYPE,
        p_empresa_id        IN  ODO_ODONTOGRAMAS.EMPRESA_ID%TYPE DEFAULT 1,
        p_tipo              IN  ODO_ODONTOGRAMAS.TIPO%TYPE DEFAULT 'PERMANENTE',
        p_observaciones     IN  ODO_ODONTOGRAMAS.OBSERVACIONES%TYPE DEFAULT NULL,
        p_creado_por        IN  ODO_ODONTOGRAMAS.CREADO_POR%TYPE DEFAULT NULL,
        p_odontograma_id    OUT ODO_ODONTOGRAMAS.ODONTOGRAMA_ID%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
        v_paciente_existe NUMBER;
    BEGIN
        -- Verificar que el paciente existe
        SELECT COUNT(*) INTO v_paciente_existe
        FROM ODO_PACIENTES
        WHERE PACIENTE_ID = p_paciente_id AND ACTIVO = 'S';

        IF v_paciente_existe = 0 THEN
            p_resultado := 0;
            p_mensaje := 'Paciente no encontrado o inactivo';
            RETURN;
        END IF;

        -- Crear el odontograma
        INSERT INTO ODO_ODONTOGRAMAS (
            PACIENTE_ID,
            EMPRESA_ID,
            TIPO,
            OBSERVACIONES,
            ACTIVO,
            FECHA_CREACION,
            CREADO_POR
        ) VALUES (
            p_paciente_id,
            NVL(p_empresa_id, 1),
            NVL(p_tipo, 'PERMANENTE'),
            p_observaciones,
            'S',
            SYSTIMESTAMP,
            p_creado_por
        ) RETURNING ODONTOGRAMA_ID INTO p_odontograma_id;

        -- Inicializar los dientes según el tipo
        IF NVL(p_tipo, 'PERMANENTE') = 'PERMANENTE' THEN
            inicializar_dientes_permanente(p_odontograma_id, p_creado_por);
        ELSE
            inicializar_dientes_temporal(p_odontograma_id, p_creado_por);
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Odontograma creado con ID: ' || p_odontograma_id;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al crear odontograma: ' || SQLERRM;
    END crear_odontograma;

    -- ============================================
    -- Función auxiliar para obtener tipo de diente
    -- ============================================
    FUNCTION get_tipo_diente(p_posicion NUMBER) RETURN VARCHAR2 IS
    BEGIN
        RETURN CASE p_posicion
            WHEN 1 THEN 'INCISIVO_CENTRAL'
            WHEN 2 THEN 'INCISIVO_LATERAL'
            WHEN 3 THEN 'CANINO'
            WHEN 4 THEN 'PRIMER_PREMOLAR'
            WHEN 5 THEN 'SEGUNDO_PREMOLAR'
            WHEN 6 THEN 'PRIMER_MOLAR'
            WHEN 7 THEN 'SEGUNDO_MOLAR'
            WHEN 8 THEN 'TERCER_MOLAR'
            ELSE 'DESCONOCIDO'
        END;
    END get_tipo_diente;

    -- ============================================
    -- Inicializar dientes permanentes (32 dientes)
    -- ============================================
    PROCEDURE inicializar_dientes_permanente(
        p_odontograma_id    IN  ODO_ODONTOGRAMAS.ODONTOGRAMA_ID%TYPE,
        p_creado_por        IN  NUMBER DEFAULT NULL
    ) IS
        v_tipo VARCHAR2(30);
    BEGIN
        -- Cuadrantes: 1 (sup-der), 2 (sup-izq), 3 (inf-izq), 4 (inf-der)
        -- Posiciones: 1-8 por cuadrante
        FOR cuadrante IN 1..4 LOOP
            FOR posicion IN 1..8 LOOP
                -- Obtener tipo de diente según posición
                v_tipo := get_tipo_diente(posicion);

                INSERT INTO ODO_DIENTES (
                    ODONTOGRAMA_ID,
                    NUMERO_FDI,
                    TIPO_DIENTE,
                    ESTADO,
                    CUADRANTE,
                    POSICION,
                    ACTIVO,
                    FECHA_CREACION,
                    CREADO_POR
                ) VALUES (
                    p_odontograma_id,
                    cuadrante * 10 + posicion,  -- FDI: 11-18, 21-28, 31-38, 41-48
                    v_tipo,
                    c_estado_sano,
                    cuadrante,
                    posicion,
                    'S',
                    SYSTIMESTAMP,
                    p_creado_por
                );
            END LOOP;
        END LOOP;
    END inicializar_dientes_permanente;

    -- ============================================
    -- Inicializar dientes temporales (20 dientes)
    -- ============================================
    PROCEDURE inicializar_dientes_temporal(
        p_odontograma_id    IN  ODO_ODONTOGRAMAS.ODONTOGRAMA_ID%TYPE,
        p_creado_por        IN  NUMBER DEFAULT NULL
    ) IS
        v_tipo VARCHAR2(30);
    BEGIN
        -- Cuadrantes temporales: 5 (sup-der), 6 (sup-izq), 7 (inf-izq), 8 (inf-der)
        -- Posiciones: 1-5 por cuadrante
        FOR cuadrante IN 5..8 LOOP
            FOR posicion IN 1..5 LOOP
                v_tipo := CASE posicion
                    WHEN 1 THEN 'INCISIVO_CENTRAL'
                    WHEN 2 THEN 'INCISIVO_LATERAL'
                    WHEN 3 THEN 'CANINO'
                    WHEN 4 THEN 'PRIMER_MOLAR'
                    WHEN 5 THEN 'SEGUNDO_MOLAR'
                END;

                INSERT INTO ODO_DIENTES (
                    ODONTOGRAMA_ID,
                    NUMERO_FDI,
                    TIPO_DIENTE,
                    ESTADO,
                    CUADRANTE,
                    POSICION,
                    ACTIVO,
                    FECHA_CREACION,
                    CREADO_POR
                ) VALUES (
                    p_odontograma_id,
                    cuadrante * 10 + posicion,  -- FDI: 51-55, 61-65, 71-75, 81-85
                    v_tipo,
                    c_estado_sano,
                    cuadrante,
                    posicion,
                    'S',
                    SYSTIMESTAMP,
                    p_creado_por
                );
            END LOOP;
        END LOOP;
    END inicializar_dientes_temporal;

    -- ============================================
    -- Obtener odontograma actual de un paciente
    -- ============================================
    PROCEDURE get_odontograma_actual(
        p_empresa_id        IN  NUMBER,
        p_paciente_id       IN  ODO_PACIENTES.PACIENTE_ID%TYPE,
        p_cursor            OUT t_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
        v_odontograma_id ODO_ODONTOGRAMAS.ODONTOGRAMA_ID%TYPE;
    BEGIN
        -- Obtener el odontograma más reciente para esta empresa
        BEGIN
            SELECT ODONTOGRAMA_ID INTO v_odontograma_id
            FROM ODO_ODONTOGRAMAS
            WHERE PACIENTE_ID = p_paciente_id
              AND (EMPRESA_ID = p_empresa_id OR p_empresa_id IS NULL)
              AND ACTIVO = 'S'
            ORDER BY FECHA_CREACION DESC
            FETCH FIRST 1 ROW ONLY;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_resultado := 0;
                p_mensaje := 'No hay odontograma para este paciente';
                OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
                RETURN;
        END;

        -- Retornar el odontograma con sus dientes
        OPEN p_cursor FOR
            SELECT
                o.ODONTOGRAMA_ID,
                o.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                p.NUMERO_HISTORIA,
                o.TIPO,
                o.OBSERVACIONES AS ODONTOGRAMA_OBS,
                o.FECHA_CREACION,
                d.DIENTE_ID,
                d.NUMERO_FDI,
                d.TIPO_DIENTE,
                d.ESTADO,
                d.CUADRANTE,
                d.POSICION,
                d.OBSERVACIONES AS DIENTE_OBS,
                d.FECHA_MODIFICACION
            FROM ODO_ODONTOGRAMAS o
            JOIN ODO_PACIENTES p ON o.PACIENTE_ID = p.PACIENTE_ID
            JOIN ODO_DIENTES d ON o.ODONTOGRAMA_ID = d.ODONTOGRAMA_ID
            WHERE o.ODONTOGRAMA_ID = v_odontograma_id
              AND (o.EMPRESA_ID = p_empresa_id OR p_empresa_id IS NULL)
              AND d.ACTIVO = 'S'
            ORDER BY d.CUADRANTE, d.POSICION;

        p_resultado := 1;
        p_mensaje := 'Odontograma obtenido exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener odontograma: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_odontograma_actual;

    -- ============================================
    -- Obtener historial de odontogramas
    -- ============================================
    PROCEDURE get_historial_odontogramas(
        p_paciente_id       IN  ODO_PACIENTES.PACIENTE_ID%TYPE,
        p_cursor            OUT t_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                o.ODONTOGRAMA_ID,
                o.PACIENTE_ID,
                o.TIPO,
                o.OBSERVACIONES,
                o.ACTIVO,
                o.FECHA_CREACION,
                o.FECHA_MODIFICACION,
                u.NOMBRE || ' ' || u.APELLIDO AS CREADO_POR_NOMBRE,
                (SELECT COUNT(*) FROM ODO_DIENTES d
                 WHERE d.ODONTOGRAMA_ID = o.ODONTOGRAMA_ID
                   AND d.ESTADO != 'SANO'
                   AND d.ACTIVO = 'S') AS DIENTES_AFECTADOS,
                (SELECT COUNT(*) FROM ODO_DIENTES d
                 WHERE d.ODONTOGRAMA_ID = o.ODONTOGRAMA_ID
                   AND d.ACTIVO = 'S') AS TOTAL_DIENTES
            FROM ODO_ODONTOGRAMAS o
            LEFT JOIN ODO_USUARIOS u ON o.CREADO_POR = u.USUARIO_ID
            WHERE o.PACIENTE_ID = p_paciente_id
            ORDER BY o.FECHA_CREACION DESC;

        p_resultado := 1;
        p_mensaje := 'Historial obtenido exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener historial: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_historial_odontogramas;

    -- ============================================
    -- Obtener detalle de un odontograma
    -- ============================================
    PROCEDURE get_odontograma_detalle(
        p_odontograma_id    IN  ODO_ODONTOGRAMAS.ODONTOGRAMA_ID%TYPE,
        p_cursor            OUT t_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                o.ODONTOGRAMA_ID,
                o.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                p.NUMERO_HISTORIA,
                o.EMPRESA_ID,
                o.TIPO,
                o.OBSERVACIONES AS ODONTOGRAMA_OBS,
                o.FECHA_CREACION,
                o.FECHA_MODIFICACION,
                d.DIENTE_ID,
                d.NUMERO_FDI,
                d.TIPO_DIENTE,
                d.ESTADO,
                d.CUADRANTE,
                d.POSICION,
                d.OBSERVACIONES AS DIENTE_OBS,
                d.FECHA_CREACION AS DIENTE_FECHA_CREACION,
                d.FECHA_MODIFICACION AS DIENTE_FECHA_MODIFICACION,
                (SELECT COUNT(*) FROM ODO_HALLAZGOS_DIENTE h
                 WHERE h.DIENTE_ID = d.DIENTE_ID AND h.ACTIVO = 'S') AS CANTIDAD_HALLAZGOS
            FROM ODO_ODONTOGRAMAS o
            JOIN ODO_PACIENTES p ON o.PACIENTE_ID = p.PACIENTE_ID
            JOIN ODO_DIENTES d ON o.ODONTOGRAMA_ID = d.ODONTOGRAMA_ID
            WHERE o.ODONTOGRAMA_ID = p_odontograma_id
              AND d.ACTIVO = 'S'
            ORDER BY d.CUADRANTE, d.POSICION;

        p_resultado := 1;
        p_mensaje := 'Detalle obtenido exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener detalle: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_odontograma_detalle;

    -- ============================================
    -- Actualizar estado de un diente
    -- ============================================
    PROCEDURE actualizar_diente(
        p_odontograma_id    IN  ODO_DIENTES.ODONTOGRAMA_ID%TYPE,
        p_numero_fdi        IN  ODO_DIENTES.NUMERO_FDI%TYPE,
        p_estado            IN  ODO_DIENTES.ESTADO%TYPE,
        p_observaciones     IN  ODO_DIENTES.OBSERVACIONES%TYPE DEFAULT NULL,
        p_modificado_por    IN  ODO_DIENTES.MODIFICADO_POR%TYPE DEFAULT NULL,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
        v_diente_existe NUMBER;
    BEGIN
        -- Verificar que el diente existe
        SELECT COUNT(*) INTO v_diente_existe
        FROM ODO_DIENTES
        WHERE ODONTOGRAMA_ID = p_odontograma_id
          AND NUMERO_FDI = p_numero_fdi
          AND ACTIVO = 'S';

        IF v_diente_existe = 0 THEN
            p_resultado := 0;
            p_mensaje := 'Diente no encontrado en este odontograma';
            RETURN;
        END IF;

        -- Actualizar el diente
        UPDATE ODO_DIENTES
        SET ESTADO = p_estado,
            OBSERVACIONES = NVL(p_observaciones, OBSERVACIONES),
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_modificado_por
        WHERE ODONTOGRAMA_ID = p_odontograma_id
          AND NUMERO_FDI = p_numero_fdi;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Diente ' || p_numero_fdi || ' actualizado a ' || p_estado;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al actualizar diente: ' || SQLERRM;
    END actualizar_diente;

    -- ============================================
    -- Actualizar múltiples dientes (bulk)
    -- ============================================
    PROCEDURE actualizar_dientes_bulk(
        p_odontograma_id    IN  ODO_ODONTOGRAMAS.ODONTOGRAMA_ID%TYPE,
        p_dientes_json      IN  CLOB,
        p_modificado_por    IN  NUMBER DEFAULT NULL,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
        v_count NUMBER := 0;
    BEGIN
        -- Parsear JSON y actualizar cada diente
        FOR rec IN (
            SELECT
                jt.numero_fdi,
                jt.estado,
                jt.observaciones
            FROM JSON_TABLE(p_dientes_json, '$[*]'
                COLUMNS (
                    numero_fdi NUMBER PATH '$.numero_fdi',
                    estado VARCHAR2(30) PATH '$.estado',
                    observaciones VARCHAR2(500) PATH '$.observaciones'
                )
            ) jt
        ) LOOP
            UPDATE ODO_DIENTES
            SET ESTADO = rec.estado,
                OBSERVACIONES = rec.observaciones,
                FECHA_MODIFICACION = SYSTIMESTAMP,
                MODIFICADO_POR = p_modificado_por
            WHERE ODONTOGRAMA_ID = p_odontograma_id
              AND NUMERO_FDI = rec.numero_fdi
              AND ACTIVO = 'S';

            v_count := v_count + SQL%ROWCOUNT;
        END LOOP;

        COMMIT;

        p_resultado := 1;
        p_mensaje := v_count || ' dientes actualizados exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al actualizar dientes: ' || SQLERRM;
    END actualizar_dientes_bulk;

    -- ============================================
    -- Obtener estado de un diente específico
    -- ============================================
    PROCEDURE get_diente(
        p_odontograma_id    IN  ODO_DIENTES.ODONTOGRAMA_ID%TYPE,
        p_numero_fdi        IN  ODO_DIENTES.NUMERO_FDI%TYPE,
        p_cursor            OUT t_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                d.DIENTE_ID,
                d.ODONTOGRAMA_ID,
                d.NUMERO_FDI,
                d.TIPO_DIENTE,
                d.ESTADO,
                d.CUADRANTE,
                d.POSICION,
                d.OBSERVACIONES,
                d.FECHA_CREACION,
                d.FECHA_MODIFICACION
            FROM ODO_DIENTES d
            WHERE d.ODONTOGRAMA_ID = p_odontograma_id
              AND d.NUMERO_FDI = p_numero_fdi
              AND d.ACTIVO = 'S';

        p_resultado := 1;
        p_mensaje := 'Diente obtenido exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener diente: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_diente;

    -- ============================================
    -- Registrar hallazgo en un diente
    -- ============================================
    PROCEDURE registrar_hallazgo(
        p_diente_id             IN  ODO_HALLAZGOS_DIENTE.DIENTE_ID%TYPE,
        p_cita_id               IN  ODO_HALLAZGOS_DIENTE.CITA_ID%TYPE DEFAULT NULL,
        p_tipo_hallazgo         IN  ODO_HALLAZGOS_DIENTE.TIPO_HALLAZGO%TYPE,
        p_superficies_afectadas IN  ODO_HALLAZGOS_DIENTE.SUPERFICIES_AFECTADAS%TYPE DEFAULT NULL,
        p_severidad             IN  ODO_HALLAZGOS_DIENTE.SEVERIDAD%TYPE DEFAULT NULL,
        p_descripcion           IN  ODO_HALLAZGOS_DIENTE.DESCRIPCION%TYPE DEFAULT NULL,
        p_requiere_tratamiento  IN  ODO_HALLAZGOS_DIENTE.REQUIERE_TRATAMIENTO%TYPE DEFAULT 'S',
        p_doctor_id             IN  ODO_HALLAZGOS_DIENTE.DOCTOR_ID%TYPE,
        p_hallazgo_id           OUT ODO_HALLAZGOS_DIENTE.HALLAZGO_DIENTE_ID%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    ) IS
    BEGIN
        INSERT INTO ODO_HALLAZGOS_DIENTE (
            DIENTE_ID,
            CITA_ID,
            TIPO_HALLAZGO,
            SUPERFICIES_AFECTADAS,
            SEVERIDAD,
            DESCRIPCION,
            REQUIERE_TRATAMIENTO,
            DOCTOR_ID,
            FECHA_DETECCION,
            ACTIVO,
            FECHA_CREACION,
            CREADO_POR
        ) VALUES (
            p_diente_id,
            p_cita_id,
            p_tipo_hallazgo,
            p_superficies_afectadas,
            p_severidad,
            p_descripcion,
            NVL(p_requiere_tratamiento, 'S'),
            p_doctor_id,
            SYSTIMESTAMP,
            'S',
            SYSTIMESTAMP,
            p_doctor_id
        ) RETURNING HALLAZGO_DIENTE_ID INTO p_hallazgo_id;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Hallazgo registrado con ID: ' || p_hallazgo_id;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al registrar hallazgo: ' || SQLERRM;
    END registrar_hallazgo;

    -- ============================================
    -- Obtener hallazgos de un diente
    -- ============================================
    PROCEDURE get_hallazgos_diente(
        p_diente_id         IN  ODO_DIENTES.DIENTE_ID%TYPE,
        p_cursor            OUT t_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                h.HALLAZGO_DIENTE_ID,
                h.DIENTE_ID,
                h.CITA_ID,
                h.TIPO_HALLAZGO,
                h.SUPERFICIES_AFECTADAS,
                h.SEVERIDAD,
                h.DESCRIPCION,
                h.REQUIERE_TRATAMIENTO,
                h.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                h.FECHA_DETECCION,
                h.OBSERVACIONES
            FROM ODO_HALLAZGOS_DIENTE h
            LEFT JOIN ODO_USUARIOS u ON h.DOCTOR_ID = u.USUARIO_ID
            WHERE h.DIENTE_ID = p_diente_id
              AND h.ACTIVO = 'S'
            ORDER BY h.FECHA_DETECCION DESC;

        p_resultado := 1;
        p_mensaje := 'Hallazgos obtenidos exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener hallazgos: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_hallazgos_diente;

    -- ============================================
    -- Obtener resumen de estados del odontograma
    -- ============================================
    PROCEDURE get_resumen_odontograma(
        p_odontograma_id    IN  ODO_ODONTOGRAMAS.ODONTOGRAMA_ID%TYPE,
        p_cursor            OUT t_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                d.ESTADO,
                COUNT(*) AS CANTIDAD,
                LISTAGG(d.NUMERO_FDI, ', ') WITHIN GROUP (ORDER BY d.NUMERO_FDI) AS DIENTES
            FROM ODO_DIENTES d
            WHERE d.ODONTOGRAMA_ID = p_odontograma_id
              AND d.ACTIVO = 'S'
            GROUP BY d.ESTADO
            ORDER BY CANTIDAD DESC;

        p_resultado := 1;
        p_mensaje := 'Resumen obtenido exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener resumen: ' || SQLERRM;
            OPEN p_cursor FOR SELECT * FROM DUAL WHERE 1=0;
    END get_resumen_odontograma;

END PKG_ODONTOGRAMA;
/
