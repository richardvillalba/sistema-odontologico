/*
================================================================================
  Package: PKG_HISTORIAS_CLINICAS
  Descripcion: Package para la gestion de historias clinicas y consultas
  Autor: Claude (Backend IA)
  Fecha: 2026-01-26

  Funcionalidades:
    - CRUD de historias clinicas
    - Registro de consultas medicas
    - Anamnesis y examen clinico
    - Diagnosticos y planes de tratamiento
    - Prescripciones medicas
================================================================================
*/

-- ============================================================================
-- ESPECIFICACION DEL PACKAGE
-- ============================================================================
CREATE OR REPLACE PACKAGE PKG_HISTORIAS_CLINICAS AS

    -- Tipos de datos
    TYPE t_historia_cursor IS REF CURSOR;
    TYPE t_prescripcion_cursor IS REF CURSOR;

    -- ========================================================================
    -- PROCEDIMIENTOS DE CONSULTA
    -- ========================================================================

    -- Obtener historia clinica por ID
    PROCEDURE get_historia(
        p_empresa_id    IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_historia_id   IN  ODO_HISTORIAS_CLINICAS.HISTORIA_ID%TYPE,
        p_cursor        OUT t_historia_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener historias de un paciente
    PROCEDURE get_historias_paciente(
        p_empresa_id    IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_paciente_id   IN  ODO_HISTORIAS_CLINICAS.PACIENTE_ID%TYPE,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_cursor        OUT t_historia_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener historias por doctor
    PROCEDURE get_historias_doctor(
        p_empresa_id    IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_doctor_id     IN  ODO_HISTORIAS_CLINICAS.DOCTOR_ID%TYPE,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_cursor        OUT t_historia_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener historias por empresa
    PROCEDURE get_historias_empresa(
        p_empresa_id    IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_cursor        OUT t_historia_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener ultima historia de un paciente
    PROCEDURE get_ultima_historia_paciente(
        p_empresa_id    IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_paciente_id   IN  ODO_HISTORIAS_CLINICAS.PACIENTE_ID%TYPE,
        p_cursor        OUT t_historia_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- ========================================================================
    -- PROCEDIMIENTOS DE CREACION Y MODIFICACION
    -- ========================================================================

    -- Crear nueva historia clinica (consulta)
    PROCEDURE insert_historia(
        p_paciente_id           IN  ODO_HISTORIAS_CLINICAS.PACIENTE_ID%TYPE,
        p_doctor_id             IN  ODO_HISTORIAS_CLINICAS.DOCTOR_ID%TYPE,
        p_cita_id               IN  ODO_HISTORIAS_CLINICAS.CITA_ID%TYPE DEFAULT NULL,
        p_fecha_consulta        IN  ODO_HISTORIAS_CLINICAS.FECHA_CONSULTA%TYPE DEFAULT SYSDATE,
        p_motivo_consulta       IN  ODO_HISTORIAS_CLINICAS.MOTIVO_CONSULTA%TYPE,
        p_anamnesis             IN  ODO_HISTORIAS_CLINICAS.ANAMNESIS%TYPE DEFAULT NULL,
        p_examen_clinico        IN  ODO_HISTORIAS_CLINICAS.EXAMEN_CLINICO%TYPE DEFAULT NULL,
        p_diagnostico           IN  ODO_HISTORIAS_CLINICAS.DIAGNOSTICO%TYPE DEFAULT NULL,
        p_codigo_cie10          IN  ODO_HISTORIAS_CLINICAS.CODIGO_CIE10%TYPE DEFAULT NULL,
        p_plan_tratamiento      IN  ODO_HISTORIAS_CLINICAS.PLAN_TRATAMIENTO%TYPE DEFAULT NULL,
        p_presion_arterial      IN  ODO_HISTORIAS_CLINICAS.PRESION_ARTERIAL%TYPE DEFAULT NULL,
        p_frecuencia_cardiaca   IN  ODO_HISTORIAS_CLINICAS.FRECUENCIA_CARDIACA%TYPE DEFAULT NULL,
        p_temperatura           IN  ODO_HISTORIAS_CLINICAS.TEMPERATURA%TYPE DEFAULT NULL,
        p_proxima_cita          IN  ODO_HISTORIAS_CLINICAS.PROXIMA_CITA%TYPE DEFAULT NULL,
        p_observaciones         IN  ODO_HISTORIAS_CLINICAS.OBSERVACIONES%TYPE DEFAULT NULL,
        p_empresa_id            IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_historia_id           OUT ODO_HISTORIAS_CLINICAS.HISTORIA_ID%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );

    -- Actualizar historia clinica
    PROCEDURE update_historia(
        p_empresa_id            IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_historia_id           IN  ODO_HISTORIAS_CLINICAS.HISTORIA_ID%TYPE,
        p_motivo_consulta       IN  ODO_HISTORIAS_CLINICAS.MOTIVO_CONSULTA%TYPE DEFAULT NULL,
        p_anamnesis             IN  ODO_HISTORIAS_CLINICAS.ANAMNESIS%TYPE DEFAULT NULL,
        p_examen_clinico        IN  ODO_HISTORIAS_CLINICAS.EXAMEN_CLINICO%TYPE DEFAULT NULL,
        p_diagnostico           IN  ODO_HISTORIAS_CLINICAS.DIAGNOSTICO%TYPE DEFAULT NULL,
        p_codigo_cie10          IN  ODO_HISTORIAS_CLINICAS.CODIGO_CIE10%TYPE DEFAULT NULL,
        p_plan_tratamiento      IN  ODO_HISTORIAS_CLINICAS.PLAN_TRATAMIENTO%TYPE DEFAULT NULL,
        p_presion_arterial      IN  ODO_HISTORIAS_CLINICAS.PRESION_ARTERIAL%TYPE DEFAULT NULL,
        p_frecuencia_cardiaca   IN  ODO_HISTORIAS_CLINICAS.FRECUENCIA_CARDIACA%TYPE DEFAULT NULL,
        p_temperatura           IN  ODO_HISTORIAS_CLINICAS.TEMPERATURA%TYPE DEFAULT NULL,
        p_proxima_cita          IN  ODO_HISTORIAS_CLINICAS.PROXIMA_CITA%TYPE DEFAULT NULL,
        p_observaciones         IN  ODO_HISTORIAS_CLINICAS.OBSERVACIONES%TYPE DEFAULT NULL,
        p_modificado_por        IN  ODO_HISTORIAS_CLINICAS.MODIFICADO_POR%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );

    -- Eliminar historia clinica
    PROCEDURE delete_historia(
        p_empresa_id    IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_historia_id   IN  ODO_HISTORIAS_CLINICAS.HISTORIA_ID%TYPE,
        p_usuario_id    IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- ========================================================================
    -- PROCEDIMIENTOS DE PRESCRIPCIONES
    -- ========================================================================

    -- Obtener prescripciones de una historia
    PROCEDURE get_prescripciones_historia(
        p_empresa_id    IN  ODO_PRESCRIPCIONES.EMPRESA_ID%TYPE,
        p_historia_id   IN  ODO_PRESCRIPCIONES.HISTORIA_ID%TYPE,
        p_cursor        OUT t_prescripcion_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener prescripciones de un paciente
    PROCEDURE get_prescripciones_paciente(
        p_empresa_id    IN  ODO_PRESCRIPCIONES.EMPRESA_ID%TYPE,
        p_paciente_id   IN  ODO_PRESCRIPCIONES.PACIENTE_ID%TYPE,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_cursor        OUT t_prescripcion_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Insertar prescripcion
    PROCEDURE insert_prescripcion(
        p_empresa_id            IN  ODO_PRESCRIPCIONES.EMPRESA_ID%TYPE,
        p_historia_id           IN  ODO_PRESCRIPCIONES.HISTORIA_ID%TYPE,
        p_paciente_id           IN  ODO_PRESCRIPCIONES.PACIENTE_ID%TYPE,
        p_doctor_id             IN  ODO_PRESCRIPCIONES.DOCTOR_ID%TYPE,
        p_medicamento           IN  ODO_PRESCRIPCIONES.MEDICAMENTO%TYPE,
        p_principio_activo      IN  ODO_PRESCRIPCIONES.PRINCIPIO_ACTIVO%TYPE DEFAULT NULL,
        p_presentacion          IN  ODO_PRESCRIPCIONES.PRESENTACION%TYPE DEFAULT NULL,
        p_concentracion         IN  ODO_PRESCRIPCIONES.CONCENTRACION%TYPE DEFAULT NULL,
        p_dosis                 IN  ODO_PRESCRIPCIONES.DOSIS%TYPE,
        p_via_administracion    IN  ODO_PRESCRIPCIONES.VIA_ADMINISTRACION%TYPE DEFAULT 'ORAL',
        p_duracion_dias         IN  ODO_PRESCRIPCIONES.DURACION_DIAS%TYPE DEFAULT NULL,
        p_indicaciones          IN  ODO_PRESCRIPCIONES.INDICACIONES%TYPE DEFAULT NULL,
        p_prescripcion_id       OUT ODO_PRESCRIPCIONES.PRESCRIPCION_ID%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    );

    -- Eliminar prescripcion
    PROCEDURE delete_prescripcion(
        p_empresa_id        IN  ODO_PRESCRIPCIONES.EMPRESA_ID%TYPE,
        p_prescripcion_id   IN  ODO_PRESCRIPCIONES.PRESCRIPCION_ID%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- ========================================================================
    -- FUNCIONES DE UTILIDAD
    -- ========================================================================

    -- Contar consultas del paciente
    FUNCTION count_consultas_paciente(
        p_paciente_id IN ODO_HISTORIAS_CLINICAS.PACIENTE_ID%TYPE
    ) RETURN NUMBER;

    -- Obtener ultimo diagnostico del paciente
    FUNCTION get_ultimo_diagnostico(
        p_paciente_id IN ODO_HISTORIAS_CLINICAS.PACIENTE_ID%TYPE
    ) RETURN VARCHAR2;

END PKG_HISTORIAS_CLINICAS;
/

-- ============================================================================
-- CUERPO DEL PACKAGE
-- ============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_HISTORIAS_CLINICAS AS

    -- ========================================================================
    -- PROCEDIMIENTOS DE CONSULTA
    -- ========================================================================

    PROCEDURE get_historia(
        p_empresa_id    IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_historia_id   IN  ODO_HISTORIAS_CLINICAS.HISTORIA_ID%TYPE,
        p_cursor        OUT t_historia_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                h.HISTORIA_ID,
                h.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                p.NUMERO_HISTORIA,
                fn_calc_edad(p.FECHA_NACIMIENTO) AS PACIENTE_EDAD,
                h.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                u.ESPECIALIDAD AS DOCTOR_ESPECIALIDAD,
                h.CITA_ID,
                h.FECHA_CONSULTA,
                h.MOTIVO_CONSULTA,
                h.ANAMNESIS,
                h.EXAMEN_CLINICO,
                h.DIAGNOSTICO,
                h.CODIGO_CIE10,
                h.PLAN_TRATAMIENTO,
                h.PRESION_ARTERIAL,
                h.FRECUENCIA_CARDIACA,
                h.TEMPERATURA,
                h.PROXIMA_CITA,
                h.OBSERVACIONES,
                h.EMPRESA_ID,
                h.FECHA_CREACION,
                h.CREADO_POR,
                h.FECHA_MODIFICACION,
                h.MODIFICADO_POR,
                p.ALERGIAS AS PACIENTE_ALERGIAS,
                p.MEDICAMENTOS_ACTUALES AS PACIENTE_MEDICAMENTOS,
                p.ENFERMEDADES_CRONICAS AS PACIENTE_ENFERMEDADES
            FROM ODO_HISTORIAS_CLINICAS h
            JOIN ODO_PACIENTES p ON h.PACIENTE_ID = p.PACIENTE_ID
            LEFT JOIN ODO_USUARIOS u ON h.DOCTOR_ID = u.USUARIO_ID
            WHERE h.HISTORIA_ID = p_historia_id
              AND h.EMPRESA_ID = p_empresa_id;

        p_resultado := 1;
        p_mensaje := 'Historia clinica obtenida exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener historia: ' || SQLERRM;
    END get_historia;

    -- ------------------------------------------------------------------------

    PROCEDURE get_historias_paciente(
        p_empresa_id    IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_paciente_id   IN  ODO_HISTORIAS_CLINICAS.PACIENTE_ID%TYPE,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_cursor        OUT t_historia_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                h.HISTORIA_ID,
                h.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                h.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                u.ESPECIALIDAD AS DOCTOR_ESPECIALIDAD,
                h.CITA_ID,
                h.FECHA_CONSULTA,
                h.MOTIVO_CONSULTA,
                h.DIAGNOSTICO,
                h.CODIGO_CIE10,
                h.OBSERVACIONES,
                h.EMPRESA_ID
            FROM ODO_HISTORIAS_CLINICAS h
            JOIN ODO_PACIENTES p ON h.PACIENTE_ID = p.PACIENTE_ID
            LEFT JOIN ODO_USUARIOS u ON h.DOCTOR_ID = u.USUARIO_ID
            WHERE h.PACIENTE_ID = p_paciente_id
              AND h.EMPRESA_ID = p_empresa_id
              AND (p_fecha_desde IS NULL OR TRUNC(h.FECHA_CONSULTA) >= p_fecha_desde)
              AND (p_fecha_hasta IS NULL OR TRUNC(h.FECHA_CONSULTA) <= p_fecha_hasta)
            ORDER BY h.FECHA_CONSULTA DESC;

        p_resultado := 1;
        p_mensaje := 'Historias obtenidas exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener historias: ' || SQLERRM;
    END get_historias_paciente;

    -- ------------------------------------------------------------------------

    PROCEDURE get_historias_doctor(
        p_empresa_id    IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_doctor_id     IN  ODO_HISTORIAS_CLINICAS.DOCTOR_ID%TYPE,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_cursor        OUT t_historia_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                h.HISTORIA_ID,
                h.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                p.NUMERO_HISTORIA,
                h.DOCTOR_ID,
                h.FECHA_CONSULTA,
                h.MOTIVO_CONSULTA,
                h.DIAGNOSTICO,
                h.EMPRESA_ID
            FROM ODO_HISTORIAS_CLINICAS h
            JOIN ODO_PACIENTES p ON h.PACIENTE_ID = p.PACIENTE_ID
            WHERE h.DOCTOR_ID = p_doctor_id
              AND h.EMPRESA_ID = p_empresa_id
              AND (p_fecha_desde IS NULL OR TRUNC(h.FECHA_CONSULTA) >= p_fecha_desde)
              AND (p_fecha_hasta IS NULL OR TRUNC(h.FECHA_CONSULTA) <= p_fecha_hasta)
            ORDER BY h.FECHA_CONSULTA DESC;

        p_resultado := 1;
        p_mensaje := 'Historias obtenidas exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener historias: ' || SQLERRM;
    END get_historias_doctor;

    -- ------------------------------------------------------------------------

    PROCEDURE get_historias_empresa(
        p_empresa_id    IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_cursor        OUT t_historia_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                h.HISTORIA_ID,
                h.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                p.NUMERO_HISTORIA,
                h.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                h.FECHA_CONSULTA,
                h.MOTIVO_CONSULTA,
                h.DIAGNOSTICO,
                h.EMPRESA_ID
            FROM ODO_HISTORIAS_CLINICAS h
            JOIN ODO_PACIENTES p ON h.PACIENTE_ID = p.PACIENTE_ID
            LEFT JOIN ODO_USUARIOS u ON h.DOCTOR_ID = u.USUARIO_ID
            WHERE h.EMPRESA_ID = p_empresa_id
              AND (p_fecha_desde IS NULL OR TRUNC(h.FECHA_CONSULTA) >= p_fecha_desde)
              AND (p_fecha_hasta IS NULL OR TRUNC(h.FECHA_CONSULTA) <= p_fecha_hasta)
            ORDER BY h.FECHA_CONSULTA DESC;

        p_resultado := 1;
        p_mensaje := 'Historias obtenidas exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener historias: ' || SQLERRM;
    END get_historias_empresa;

    -- ------------------------------------------------------------------------

    PROCEDURE get_ultima_historia_paciente(
        p_empresa_id    IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_paciente_id   IN  ODO_HISTORIAS_CLINICAS.PACIENTE_ID%TYPE,
        p_cursor        OUT t_historia_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                h.HISTORIA_ID,
                h.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                h.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                h.FECHA_CONSULTA,
                h.MOTIVO_CONSULTA,
                h.ANAMNESIS,
                h.EXAMEN_CLINICO,
                h.DIAGNOSTICO,
                h.CODIGO_CIE10,
                h.PLAN_TRATAMIENTO,
                h.PRESION_ARTERIAL,
                h.FRECUENCIA_CARDIACA,
                h.TEMPERATURA,
                h.PROXIMA_CITA,
                h.OBSERVACIONES
            FROM ODO_HISTORIAS_CLINICAS h
            JOIN ODO_PACIENTES p ON h.PACIENTE_ID = p.PACIENTE_ID
            LEFT JOIN ODO_USUARIOS u ON h.DOCTOR_ID = u.USUARIO_ID
            WHERE h.PACIENTE_ID = p_paciente_id
              AND h.EMPRESA_ID = p_empresa_id
              AND h.FECHA_CONSULTA = (
                  SELECT MAX(FECHA_CONSULTA)
                  FROM ODO_HISTORIAS_CLINICAS
                  WHERE PACIENTE_ID = p_paciente_id
                    AND EMPRESA_ID = p_empresa_id
              );

        p_resultado := 1;
        p_mensaje := 'Ultima historia obtenida exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener historia: ' || SQLERRM;
    END get_ultima_historia_paciente;

    -- ========================================================================
    -- PROCEDIMIENTOS DE CREACION Y MODIFICACION
    -- ========================================================================

    PROCEDURE insert_historia(
        p_paciente_id           IN  ODO_HISTORIAS_CLINICAS.PACIENTE_ID%TYPE,
        p_doctor_id             IN  ODO_HISTORIAS_CLINICAS.DOCTOR_ID%TYPE,
        p_cita_id               IN  ODO_HISTORIAS_CLINICAS.CITA_ID%TYPE DEFAULT NULL,
        p_fecha_consulta        IN  ODO_HISTORIAS_CLINICAS.FECHA_CONSULTA%TYPE DEFAULT SYSDATE,
        p_motivo_consulta       IN  ODO_HISTORIAS_CLINICAS.MOTIVO_CONSULTA%TYPE,
        p_anamnesis             IN  ODO_HISTORIAS_CLINICAS.ANAMNESIS%TYPE DEFAULT NULL,
        p_examen_clinico        IN  ODO_HISTORIAS_CLINICAS.EXAMEN_CLINICO%TYPE DEFAULT NULL,
        p_diagnostico           IN  ODO_HISTORIAS_CLINICAS.DIAGNOSTICO%TYPE DEFAULT NULL,
        p_codigo_cie10          IN  ODO_HISTORIAS_CLINICAS.CODIGO_CIE10%TYPE DEFAULT NULL,
        p_plan_tratamiento      IN  ODO_HISTORIAS_CLINICAS.PLAN_TRATAMIENTO%TYPE DEFAULT NULL,
        p_presion_arterial      IN  ODO_HISTORIAS_CLINICAS.PRESION_ARTERIAL%TYPE DEFAULT NULL,
        p_frecuencia_cardiaca   IN  ODO_HISTORIAS_CLINICAS.FRECUENCIA_CARDIACA%TYPE DEFAULT NULL,
        p_temperatura           IN  ODO_HISTORIAS_CLINICAS.TEMPERATURA%TYPE DEFAULT NULL,
        p_proxima_cita          IN  ODO_HISTORIAS_CLINICAS.PROXIMA_CITA%TYPE DEFAULT NULL,
        p_observaciones         IN  ODO_HISTORIAS_CLINICAS.OBSERVACIONES%TYPE DEFAULT NULL,
        p_empresa_id            IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_historia_id           OUT ODO_HISTORIAS_CLINICAS.HISTORIA_ID%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    ) IS
        v_paciente_existe NUMBER;
        v_doctor_existe NUMBER;
    BEGIN
        -- Validar que el paciente exista
        SELECT COUNT(*) INTO v_paciente_existe
        FROM ODO_PACIENTES
        WHERE PACIENTE_ID = p_paciente_id;

        IF v_paciente_existe = 0 THEN
            p_resultado := 0;
            p_mensaje := 'El paciente especificado no existe';
            RETURN;
        END IF;

        -- Validar que el doctor exista
        SELECT COUNT(*) INTO v_doctor_existe
        FROM ODO_USUARIOS
        WHERE USUARIO_ID = p_doctor_id;

        IF v_doctor_existe = 0 THEN
            p_resultado := 0;
            p_mensaje := 'El doctor especificado no existe';
            RETURN;
        END IF;

        -- Insertar historia clinica
        INSERT INTO ODO_HISTORIAS_CLINICAS (
            PACIENTE_ID,
            DOCTOR_ID,
            CITA_ID,
            FECHA_CONSULTA,
            MOTIVO_CONSULTA,
            ANAMNESIS,
            EXAMEN_CLINICO,
            DIAGNOSTICO,
            CODIGO_CIE10,
            PLAN_TRATAMIENTO,
            PRESION_ARTERIAL,
            FRECUENCIA_CARDIACA,
            TEMPERATURA,
            PROXIMA_CITA,
            OBSERVACIONES,
            EMPRESA_ID,
            FECHA_CREACION,
            CREADO_POR
        ) VALUES (
            p_paciente_id,
            p_doctor_id,
            p_cita_id,
            NVL(p_fecha_consulta, SYSDATE),
            p_motivo_consulta,
            p_anamnesis,
            p_examen_clinico,
            p_diagnostico,
            p_codigo_cie10,
            p_plan_tratamiento,
            p_presion_arterial,
            p_frecuencia_cardiaca,
            p_temperatura,
            p_proxima_cita,
            p_observaciones,
            p_empresa_id,
            SYSTIMESTAMP,
            p_doctor_id
        ) RETURNING HISTORIA_ID INTO p_historia_id;

        -- Si tiene cita asociada, marcarla como completada
        IF p_cita_id IS NOT NULL THEN
            UPDATE ODO_CITAS
            SET ESTADO = 'COMPLETADA',
                FECHA_MODIFICACION = SYSTIMESTAMP,
                MODIFICADO_POR = p_doctor_id
            WHERE CITA_ID = p_cita_id
              AND ESTADO NOT IN ('COMPLETADA', 'CANCELADA');
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Historia clinica creada exitosamente con ID: ' || p_historia_id;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al crear historia: ' || SQLERRM;
    END insert_historia;

    -- ------------------------------------------------------------------------

    PROCEDURE update_historia(
        p_empresa_id            IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_historia_id           IN  ODO_HISTORIAS_CLINICAS.HISTORIA_ID%TYPE,
        p_motivo_consulta       IN  ODO_HISTORIAS_CLINICAS.MOTIVO_CONSULTA%TYPE DEFAULT NULL,
        p_anamnesis             IN  ODO_HISTORIAS_CLINICAS.ANAMNESIS%TYPE DEFAULT NULL,
        p_examen_clinico        IN  ODO_HISTORIAS_CLINICAS.EXAMEN_CLINICO%TYPE DEFAULT NULL,
        p_diagnostico           IN  ODO_HISTORIAS_CLINICAS.DIAGNOSTICO%TYPE DEFAULT NULL,
        p_codigo_cie10          IN  ODO_HISTORIAS_CLINICAS.CODIGO_CIE10%TYPE DEFAULT NULL,
        p_plan_tratamiento      IN  ODO_HISTORIAS_CLINICAS.PLAN_TRATAMIENTO%TYPE DEFAULT NULL,
        p_presion_arterial      IN  ODO_HISTORIAS_CLINICAS.PRESION_ARTERIAL%TYPE DEFAULT NULL,
        p_frecuencia_cardiaca   IN  ODO_HISTORIAS_CLINICAS.FRECUENCIA_CARDIACA%TYPE DEFAULT NULL,
        p_temperatura           IN  ODO_HISTORIAS_CLINICAS.TEMPERATURA%TYPE DEFAULT NULL,
        p_proxima_cita          IN  ODO_HISTORIAS_CLINICAS.PROXIMA_CITA%TYPE DEFAULT NULL,
        p_observaciones         IN  ODO_HISTORIAS_CLINICAS.OBSERVACIONES%TYPE DEFAULT NULL,
        p_modificado_por        IN  ODO_HISTORIAS_CLINICAS.MODIFICADO_POR%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    ) IS
    BEGIN
        UPDATE ODO_HISTORIAS_CLINICAS
        SET MOTIVO_CONSULTA = NVL(p_motivo_consulta, MOTIVO_CONSULTA),
            ANAMNESIS = NVL(p_anamnesis, ANAMNESIS),
            EXAMEN_CLINICO = NVL(p_examen_clinico, EXAMEN_CLINICO),
            DIAGNOSTICO = NVL(p_diagnostico, DIAGNOSTICO),
            CODIGO_CIE10 = NVL(p_codigo_cie10, CODIGO_CIE10),
            PLAN_TRATAMIENTO = NVL(p_plan_tratamiento, PLAN_TRATAMIENTO),
            PRESION_ARTERIAL = NVL(p_presion_arterial, PRESION_ARTERIAL),
            FRECUENCIA_CARDIACA = NVL(p_frecuencia_cardiaca, FRECUENCIA_CARDIACA),
            TEMPERATURA = NVL(p_temperatura, TEMPERATURA),
            PROXIMA_CITA = NVL(p_proxima_cita, PROXIMA_CITA),
            OBSERVACIONES = NVL(p_observaciones, OBSERVACIONES),
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_modificado_por
        WHERE HISTORIA_ID = p_historia_id
          AND EMPRESA_ID = p_empresa_id;

        IF SQL%ROWCOUNT = 0 THEN
            p_resultado := 0;
            p_mensaje := 'Historia clinica no encontrada o no pertenece a la empresa';
            RETURN;
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Historia clinica actualizada exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al actualizar historia: ' || SQLERRM;
    END update_historia;

    -- ------------------------------------------------------------------------

    PROCEDURE delete_historia(
        p_empresa_id    IN  ODO_HISTORIAS_CLINICAS.EMPRESA_ID%TYPE,
        p_historia_id   IN  ODO_HISTORIAS_CLINICAS.HISTORIA_ID%TYPE,
        p_usuario_id    IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
        v_tiene_tratamientos NUMBER;
        v_tiene_prescripciones NUMBER;
    BEGIN
        -- Verificar si tiene tratamientos asociados
        SELECT COUNT(*) INTO v_tiene_tratamientos
        FROM ODO_TRATAMIENTOS_PACIENTE
        WHERE HISTORIA_ID = p_historia_id
          AND EMPRESA_ID = p_empresa_id;

        IF v_tiene_tratamientos > 0 THEN
            p_resultado := 0;
            p_mensaje := 'No se puede eliminar: tiene tratamientos asociados';
            RETURN;
        END IF;

        -- Verificar si tiene prescripciones
        SELECT COUNT(*) INTO v_tiene_prescripciones
        FROM ODO_PRESCRIPCIONES
        WHERE HISTORIA_ID = p_historia_id
          AND EMPRESA_ID = p_empresa_id;

        -- Eliminar prescripciones primero
        IF v_tiene_prescripciones > 0 THEN
            DELETE FROM ODO_PRESCRIPCIONES WHERE HISTORIA_ID = p_historia_id AND EMPRESA_ID = p_empresa_id;
        END IF;

        -- Eliminar historia
        DELETE FROM ODO_HISTORIAS_CLINICAS WHERE HISTORIA_ID = p_historia_id AND EMPRESA_ID = p_empresa_id;

        IF SQL%ROWCOUNT = 0 THEN
            p_resultado := 0;
            p_mensaje := 'Historia clinica no encontrada o no pertenece a la empresa';
            RETURN;
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Historia clinica eliminada exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al eliminar historia: ' || SQLERRM;
    END delete_historia;

    -- ========================================================================
    -- PROCEDIMIENTOS DE PRESCRIPCIONES
    -- ========================================================================

    PROCEDURE get_prescripciones_historia(
        p_empresa_id    IN  ODO_PRESCRIPCIONES.EMPRESA_ID%TYPE,
        p_historia_id   IN  ODO_PRESCRIPCIONES.HISTORIA_ID%TYPE,
        p_cursor        OUT t_prescripcion_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                pr.PRESCRIPCION_ID,
                pr.HISTORIA_ID,
                pr.PACIENTE_ID,
                pr.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                pr.FECHA_EMISION,
                pr.MEDICAMENTO,
                pr.PRINCIPIO_ACTIVO,
                pr.PRESENTACION,
                pr.CONCENTRACION,
                pr.DOSIS,
                pr.VIA_ADMINISTRACION,
                pr.DURACION_DIAS,
                pr.INDICACIONES
            FROM ODO_PRESCRIPCIONES pr
            LEFT JOIN ODO_USUARIOS u ON pr.DOCTOR_ID = u.USUARIO_ID
            WHERE pr.HISTORIA_ID = p_historia_id
              AND pr.EMPRESA_ID = p_empresa_id
            ORDER BY pr.FECHA_EMISION DESC;

        p_resultado := 1;
        p_mensaje := 'Prescripciones obtenidas exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener prescripciones: ' || SQLERRM;
    END get_prescripciones_historia;

    -- ------------------------------------------------------------------------

    PROCEDURE get_prescripciones_paciente(
        p_empresa_id    IN  ODO_PRESCRIPCIONES.EMPRESA_ID%TYPE,
        p_paciente_id   IN  ODO_PRESCRIPCIONES.PACIENTE_ID%TYPE,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_cursor        OUT t_prescripcion_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                pr.PRESCRIPCION_ID,
                pr.HISTORIA_ID,
                pr.PACIENTE_ID,
                pr.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                pr.FECHA_EMISION,
                pr.MEDICAMENTO,
                pr.PRINCIPIO_ACTIVO,
                pr.PRESENTACION,
                pr.CONCENTRACION,
                pr.DOSIS,
                pr.VIA_ADMINISTRACION,
                pr.DURACION_DIAS,
                pr.INDICACIONES
            FROM ODO_PRESCRIPCIONES pr
            LEFT JOIN ODO_USUARIOS u ON pr.DOCTOR_ID = u.USUARIO_ID
            WHERE pr.PACIENTE_ID = p_paciente_id
              AND pr.EMPRESA_ID = p_empresa_id
              AND (p_fecha_desde IS NULL OR TRUNC(pr.FECHA_EMISION) >= p_fecha_desde)
              AND (p_fecha_hasta IS NULL OR TRUNC(pr.FECHA_EMISION) <= p_fecha_hasta)
            ORDER BY pr.FECHA_EMISION DESC;

        p_resultado := 1;
        p_mensaje := 'Prescripciones obtenidas exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener prescripciones: ' || SQLERRM;
    END get_prescripciones_paciente;

    -- ------------------------------------------------------------------------

    PROCEDURE insert_prescripcion(
        p_empresa_id            IN  ODO_PRESCRIPCIONES.EMPRESA_ID%TYPE,
        p_historia_id           IN  ODO_PRESCRIPCIONES.HISTORIA_ID%TYPE,
        p_paciente_id           IN  ODO_PRESCRIPCIONES.PACIENTE_ID%TYPE,
        p_doctor_id             IN  ODO_PRESCRIPCIONES.DOCTOR_ID%TYPE,
        p_medicamento           IN  ODO_PRESCRIPCIONES.MEDICAMENTO%TYPE,
        p_principio_activo      IN  ODO_PRESCRIPCIONES.PRINCIPIO_ACTIVO%TYPE DEFAULT NULL,
        p_presentacion          IN  ODO_PRESCRIPCIONES.PRESENTACION%TYPE DEFAULT NULL,
        p_concentracion         IN  ODO_PRESCRIPCIONES.CONCENTRACION%TYPE DEFAULT NULL,
        p_dosis                 IN  ODO_PRESCRIPCIONES.DOSIS%TYPE,
        p_via_administracion    IN  ODO_PRESCRIPCIONES.VIA_ADMINISTRACION%TYPE DEFAULT 'ORAL',
        p_duracion_dias         IN  ODO_PRESCRIPCIONES.DURACION_DIAS%TYPE DEFAULT NULL,
        p_indicaciones          IN  ODO_PRESCRIPCIONES.INDICACIONES%TYPE DEFAULT NULL,
        p_prescripcion_id       OUT ODO_PRESCRIPCIONES.PRESCRIPCION_ID%TYPE,
        p_resultado             OUT NUMBER,
        p_mensaje               OUT VARCHAR2
    ) IS
    BEGIN
        INSERT INTO ODO_PRESCRIPCIONES (
            EMPRESA_ID,
            HISTORIA_ID,
            PACIENTE_ID,
            DOCTOR_ID,
            FECHA_EMISION,
            MEDICAMENTO,
            PRINCIPIO_ACTIVO,
            PRESENTACION,
            CONCENTRACION,
            DOSIS,
            VIA_ADMINISTRACION,
            DURACION_DIAS,
            INDICACIONES
        ) VALUES (
            p_empresa_id,
            p_historia_id,
            p_paciente_id,
            p_doctor_id,
            SYSDATE,
            p_medicamento,
            p_principio_activo,
            p_presentacion,
            p_concentracion,
            p_dosis,
            p_via_administracion,
            p_duracion_dias,
            p_indicaciones
        ) RETURNING PRESCRIPCION_ID INTO p_prescripcion_id;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Prescripcion creada exitosamente con ID: ' || p_prescripcion_id;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al crear prescripcion: ' || SQLERRM;
    END insert_prescripcion;

    -- ------------------------------------------------------------------------

    PROCEDURE delete_prescripcion(
        p_empresa_id        IN  ODO_PRESCRIPCIONES.EMPRESA_ID%TYPE,
        p_prescripcion_id   IN  ODO_PRESCRIPCIONES.PRESCRIPCION_ID%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
    BEGIN
        DELETE FROM ODO_PRESCRIPCIONES 
        WHERE PRESCRIPCION_ID = p_prescripcion_id
          AND EMPRESA_ID = p_empresa_id;

        IF SQL%ROWCOUNT = 0 THEN
            p_resultado := 0;
            p_mensaje := 'Prescripcion no encontrada o no pertenece a la empresa';
            RETURN;
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Prescripcion eliminada exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al eliminar prescripcion: ' || SQLERRM;
    END delete_prescripcion;

    -- ========================================================================
    -- FUNCIONES DE UTILIDAD
    -- ========================================================================

    FUNCTION count_consultas_paciente(
        p_paciente_id IN ODO_HISTORIAS_CLINICAS.PACIENTE_ID%TYPE
    ) RETURN NUMBER IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM ODO_HISTORIAS_CLINICAS
        WHERE PACIENTE_ID = p_paciente_id;

        RETURN v_count;
    END count_consultas_paciente;

    -- ------------------------------------------------------------------------

    FUNCTION get_ultimo_diagnostico(
        p_paciente_id IN ODO_HISTORIAS_CLINICAS.PACIENTE_ID%TYPE
    ) RETURN VARCHAR2 IS
        v_diagnostico ODO_HISTORIAS_CLINICAS.DIAGNOSTICO%TYPE;
    BEGIN
        SELECT DIAGNOSTICO INTO v_diagnostico
        FROM (
            SELECT DIAGNOSTICO 
            FROM ODO_HISTORIAS_CLINICAS
            WHERE PACIENTE_ID = p_paciente_id
              AND DIAGNOSTICO IS NOT NULL
            ORDER BY FECHA_CONSULTA DESC
        )
        WHERE ROWNUM = 1;

        RETURN v_diagnostico;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
        WHEN OTHERS THEN
            RETURN NULL;
    END get_ultimo_diagnostico;

END PKG_HISTORIAS_CLINICAS;
/
