/*
================================================================================
  Package: PKG_CITAS
  Descripcion: Package para la gestion de citas medicas
  Autor: Claude (Backend IA)
  Fecha: 2026-01-26

  Funcionalidades:
    - CRUD completo de citas
    - Busqueda por paciente, doctor, fecha
    - Gestion de estados (pendiente, confirmada, completada, cancelada)
    - Verificacion de disponibilidad
    - Recordatorios
================================================================================
*/

-- ============================================================================
-- ESPECIFICACION DEL PACKAGE
-- ============================================================================
CREATE OR REPLACE PACKAGE PKG_CITAS AS

    -- Tipos de datos
    TYPE t_cita_rec IS RECORD (
        cita_id             ODO_CITAS.CITA_ID%TYPE,
        paciente_id         ODO_CITAS.PACIENTE_ID%TYPE,
        paciente_nombre     VARCHAR2(200),
        doctor_id           ODO_CITAS.DOCTOR_ID%TYPE,
        doctor_nombre       VARCHAR2(200),
        fecha_hora_inicio   ODO_CITAS.FECHA_HORA_INICIO%TYPE,
        fecha_hora_fin      ODO_CITAS.FECHA_HORA_FIN%TYPE,
        duracion_minutos    ODO_CITAS.DURACION_MINUTOS%TYPE,
        motivo_consulta     ODO_CITAS.MOTIVO_CONSULTA%TYPE,
        tipo_cita           ODO_CITAS.TIPO_CITA%TYPE,
        estado              ODO_CITAS.ESTADO%TYPE,
        consultorio         ODO_CITAS.CONSULTORIO%TYPE,
        observaciones       ODO_CITAS.OBSERVACIONES%TYPE,
        empresa_id          ODO_CITAS.EMPRESA_ID%TYPE,
        sucursal_id         ODO_CITAS.SUCURSAL_ID%TYPE
    );

    TYPE t_cita_cursor IS REF CURSOR;

    -- Constantes de estado
    c_estado_pendiente   CONSTANT VARCHAR2(20) := 'PENDIENTE';
    c_estado_confirmada  CONSTANT VARCHAR2(20) := 'CONFIRMADA';
    c_estado_completada  CONSTANT VARCHAR2(20) := 'COMPLETADA';
    c_estado_cancelada   CONSTANT VARCHAR2(20) := 'CANCELADA';
    c_estado_no_asistio  CONSTANT VARCHAR2(20) := 'NO_ASISTIO';

    -- ========================================================================
    -- PROCEDIMIENTOS DE CONSULTA
    -- ========================================================================

    -- Obtener una cita por ID
    PROCEDURE get_cita(
        p_cita_id       IN  ODO_CITAS.CITA_ID%TYPE,
        p_cursor        OUT t_cita_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener citas por empresa
    PROCEDURE get_citas_by_empresa(
        p_empresa_id    IN  ODO_CITAS.EMPRESA_ID%TYPE,
        p_sucursal_id   IN  ODO_CITAS.SUCURSAL_ID%TYPE DEFAULT NULL,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_estado        IN  ODO_CITAS.ESTADO%TYPE DEFAULT NULL,
        p_cursor        OUT t_cita_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener citas por paciente
    PROCEDURE get_citas_by_paciente(
        p_paciente_id   IN  ODO_CITAS.PACIENTE_ID%TYPE,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_estado        IN  ODO_CITAS.ESTADO%TYPE DEFAULT NULL,
        p_cursor        OUT t_cita_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener citas por doctor
    PROCEDURE get_citas_by_doctor(
        p_doctor_id     IN  ODO_CITAS.DOCTOR_ID%TYPE,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_estado        IN  ODO_CITAS.ESTADO%TYPE DEFAULT NULL,
        p_cursor        OUT t_cita_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener agenda del dia
    PROCEDURE get_agenda_dia(
        p_doctor_id     IN  ODO_CITAS.DOCTOR_ID%TYPE,
        p_fecha         IN  DATE DEFAULT SYSDATE,
        p_empresa_id    IN  ODO_CITAS.EMPRESA_ID%TYPE DEFAULT NULL,
        p_cursor        OUT t_cita_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- ========================================================================
    -- PROCEDIMIENTOS DE MODIFICACION
    -- ========================================================================

    -- Crear nueva cita
    PROCEDURE insert_cita(
        p_paciente_id       IN  ODO_CITAS.PACIENTE_ID%TYPE,
        p_doctor_id         IN  ODO_CITAS.DOCTOR_ID%TYPE,
        p_fecha_hora_inicio IN  ODO_CITAS.FECHA_HORA_INICIO%TYPE,
        p_duracion_minutos  IN  ODO_CITAS.DURACION_MINUTOS%TYPE DEFAULT 30,
        p_motivo_consulta   IN  ODO_CITAS.MOTIVO_CONSULTA%TYPE,
        p_tipo_cita         IN  ODO_CITAS.TIPO_CITA%TYPE DEFAULT 'CONSULTA',
        p_consultorio       IN  ODO_CITAS.CONSULTORIO%TYPE DEFAULT NULL,
        p_observaciones     IN  ODO_CITAS.OBSERVACIONES%TYPE DEFAULT NULL,
        p_empresa_id        IN  ODO_CITAS.EMPRESA_ID%TYPE,
        p_sucursal_id       IN  ODO_CITAS.SUCURSAL_ID%TYPE,
        p_creado_por        IN  ODO_CITAS.CREADO_POR%TYPE,
        p_cita_id           OUT ODO_CITAS.CITA_ID%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Actualizar cita existente
    PROCEDURE update_cita(
        p_cita_id           IN  ODO_CITAS.CITA_ID%TYPE,
        p_paciente_id       IN  ODO_CITAS.PACIENTE_ID%TYPE DEFAULT NULL,
        p_doctor_id         IN  ODO_CITAS.DOCTOR_ID%TYPE DEFAULT NULL,
        p_fecha_hora_inicio IN  ODO_CITAS.FECHA_HORA_INICIO%TYPE DEFAULT NULL,
        p_duracion_minutos  IN  ODO_CITAS.DURACION_MINUTOS%TYPE DEFAULT NULL,
        p_motivo_consulta   IN  ODO_CITAS.MOTIVO_CONSULTA%TYPE DEFAULT NULL,
        p_tipo_cita         IN  ODO_CITAS.TIPO_CITA%TYPE DEFAULT NULL,
        p_consultorio       IN  ODO_CITAS.CONSULTORIO%TYPE DEFAULT NULL,
        p_observaciones     IN  ODO_CITAS.OBSERVACIONES%TYPE DEFAULT NULL,
        p_modificado_por    IN  ODO_CITAS.MODIFICADO_POR%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Cambiar estado de cita
    PROCEDURE cambiar_estado(
        p_cita_id           IN  ODO_CITAS.CITA_ID%TYPE,
        p_nuevo_estado      IN  ODO_CITAS.ESTADO%TYPE,
        p_motivo_cancelacion IN ODO_CITAS.MOTIVO_CANCELACION%TYPE DEFAULT NULL,
        p_usuario_id        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Confirmar cita
    PROCEDURE confirmar_cita(
        p_cita_id       IN  ODO_CITAS.CITA_ID%TYPE,
        p_usuario_id    IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Cancelar cita
    PROCEDURE cancelar_cita(
        p_cita_id           IN  ODO_CITAS.CITA_ID%TYPE,
        p_motivo            IN  ODO_CITAS.MOTIVO_CANCELACION%TYPE,
        p_cancelado_por     IN  ODO_CITAS.CANCELADO_POR%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

    -- Completar cita
    PROCEDURE completar_cita(
        p_cita_id       IN  ODO_CITAS.CITA_ID%TYPE,
        p_usuario_id    IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Marcar como no asistio
    PROCEDURE marcar_no_asistio(
        p_cita_id       IN  ODO_CITAS.CITA_ID%TYPE,
        p_usuario_id    IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Eliminar cita (soft delete o hard delete segun politica)
    PROCEDURE delete_cita(
        p_cita_id       IN  ODO_CITAS.CITA_ID%TYPE,
        p_usuario_id    IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- ========================================================================
    -- FUNCIONES DE VALIDACION Y UTILIDAD
    -- ========================================================================

    -- Verificar disponibilidad del doctor
    FUNCTION check_disponibilidad(
        p_doctor_id         IN ODO_CITAS.DOCTOR_ID%TYPE,
        p_fecha_hora_inicio IN ODO_CITAS.FECHA_HORA_INICIO%TYPE,
        p_duracion_minutos  IN NUMBER,
        p_excluir_cita_id   IN ODO_CITAS.CITA_ID%TYPE DEFAULT NULL
    ) RETURN BOOLEAN;

    -- Obtener proxima cita del paciente
    FUNCTION get_proxima_cita_paciente(
        p_paciente_id IN ODO_CITAS.PACIENTE_ID%TYPE
    ) RETURN DATE;

    -- Contar citas del dia por doctor
    FUNCTION count_citas_dia(
        p_doctor_id IN ODO_CITAS.DOCTOR_ID%TYPE,
        p_fecha     IN DATE DEFAULT SYSDATE
    ) RETURN NUMBER;

    -- ========================================================================
    -- PROCEDIMIENTOS DE RECORDATORIO
    -- ========================================================================

    -- Marcar recordatorio enviado
    PROCEDURE marcar_recordatorio_enviado(
        p_cita_id       IN  ODO_CITAS.CITA_ID%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener citas pendientes de recordatorio
    PROCEDURE get_citas_para_recordatorio(
        p_dias_anticipacion IN NUMBER DEFAULT 1,
        p_cursor            OUT t_cita_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    );

END PKG_CITAS;
/

-- ============================================================================
-- CUERPO DEL PACKAGE
-- ============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_CITAS AS

    -- ========================================================================
    -- PROCEDIMIENTOS DE CONSULTA
    -- ========================================================================

    PROCEDURE get_cita(
        p_cita_id       IN  ODO_CITAS.CITA_ID%TYPE,
        p_cursor        OUT t_cita_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                c.CITA_ID,
                c.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                c.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                c.FECHA_HORA_INICIO,
                c.FECHA_HORA_FIN,
                c.DURACION_MINUTOS,
                c.MOTIVO_CONSULTA,
                c.TIPO_CITA,
                c.ESTADO,
                c.CONSULTORIO,
                c.OBSERVACIONES,
                c.RECORDATORIO_ENVIADO,
                c.FECHA_RECORDATORIO,
                c.MOTIVO_CANCELACION,
                c.CANCELADO_POR,
                c.EMPRESA_ID,
                c.SUCURSAL_ID,
                c.FECHA_CREACION,
                c.CREADO_POR,
                c.FECHA_MODIFICACION,
                c.MODIFICADO_POR
            FROM ODO_CITAS c
            LEFT JOIN ODO_PACIENTES p ON c.PACIENTE_ID = p.PACIENTE_ID
            LEFT JOIN ODO_USUARIOS u ON c.DOCTOR_ID = u.USUARIO_ID
            WHERE c.CITA_ID = p_cita_id;

        p_resultado := 1;
        p_mensaje := 'Cita obtenida exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener cita: ' || SQLERRM;
    END get_cita;

    -- ------------------------------------------------------------------------

    PROCEDURE get_citas_by_empresa(
        p_empresa_id    IN  ODO_CITAS.EMPRESA_ID%TYPE,
        p_sucursal_id   IN  ODO_CITAS.SUCURSAL_ID%TYPE DEFAULT NULL,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_estado        IN  ODO_CITAS.ESTADO%TYPE DEFAULT NULL,
        p_cursor        OUT t_cita_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                c.CITA_ID,
                c.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                p.TELEFONO_PRINCIPAL AS PACIENTE_TELEFONO,
                c.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                c.FECHA_HORA_INICIO,
                c.FECHA_HORA_FIN,
                c.DURACION_MINUTOS,
                c.MOTIVO_CONSULTA,
                c.TIPO_CITA,
                c.ESTADO,
                c.CONSULTORIO,
                c.OBSERVACIONES,
                c.EMPRESA_ID,
                c.SUCURSAL_ID
            FROM ODO_CITAS c
            LEFT JOIN ODO_PACIENTES p ON c.PACIENTE_ID = p.PACIENTE_ID
            LEFT JOIN ODO_USUARIOS u ON c.DOCTOR_ID = u.USUARIO_ID
            WHERE c.EMPRESA_ID = p_empresa_id
              AND (p_sucursal_id IS NULL OR c.SUCURSAL_ID = p_sucursal_id)
              AND (p_fecha_desde IS NULL OR TRUNC(c.FECHA_HORA_INICIO) >= p_fecha_desde)
              AND (p_fecha_hasta IS NULL OR TRUNC(c.FECHA_HORA_INICIO) <= p_fecha_hasta)
              AND (p_estado IS NULL OR c.ESTADO = p_estado)
            ORDER BY c.FECHA_HORA_INICIO;

        p_resultado := 1;
        p_mensaje := 'Citas obtenidas exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener citas: ' || SQLERRM;
    END get_citas_by_empresa;

    -- ------------------------------------------------------------------------

    PROCEDURE get_citas_by_paciente(
        p_paciente_id   IN  ODO_CITAS.PACIENTE_ID%TYPE,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_estado        IN  ODO_CITAS.ESTADO%TYPE DEFAULT NULL,
        p_cursor        OUT t_cita_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                c.CITA_ID,
                c.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                c.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                u.ESPECIALIDAD AS DOCTOR_ESPECIALIDAD,
                c.FECHA_HORA_INICIO,
                c.FECHA_HORA_FIN,
                c.DURACION_MINUTOS,
                c.MOTIVO_CONSULTA,
                c.TIPO_CITA,
                c.ESTADO,
                c.CONSULTORIO,
                c.OBSERVACIONES,
                c.EMPRESA_ID,
                c.SUCURSAL_ID
            FROM ODO_CITAS c
            LEFT JOIN ODO_PACIENTES p ON c.PACIENTE_ID = p.PACIENTE_ID
            LEFT JOIN ODO_USUARIOS u ON c.DOCTOR_ID = u.USUARIO_ID
            WHERE c.PACIENTE_ID = p_paciente_id
              AND (p_fecha_desde IS NULL OR TRUNC(c.FECHA_HORA_INICIO) >= p_fecha_desde)
              AND (p_fecha_hasta IS NULL OR TRUNC(c.FECHA_HORA_INICIO) <= p_fecha_hasta)
              AND (p_estado IS NULL OR c.ESTADO = p_estado)
            ORDER BY c.FECHA_HORA_INICIO DESC;

        p_resultado := 1;
        p_mensaje := 'Citas del paciente obtenidas exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener citas del paciente: ' || SQLERRM;
    END get_citas_by_paciente;

    -- ------------------------------------------------------------------------

    PROCEDURE get_citas_by_doctor(
        p_doctor_id     IN  ODO_CITAS.DOCTOR_ID%TYPE,
        p_fecha_desde   IN  DATE DEFAULT NULL,
        p_fecha_hasta   IN  DATE DEFAULT NULL,
        p_estado        IN  ODO_CITAS.ESTADO%TYPE DEFAULT NULL,
        p_cursor        OUT t_cita_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                c.CITA_ID,
                c.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                p.TELEFONO_PRINCIPAL AS PACIENTE_TELEFONO,
                c.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                c.FECHA_HORA_INICIO,
                c.FECHA_HORA_FIN,
                c.DURACION_MINUTOS,
                c.MOTIVO_CONSULTA,
                c.TIPO_CITA,
                c.ESTADO,
                c.CONSULTORIO,
                c.OBSERVACIONES,
                c.EMPRESA_ID,
                c.SUCURSAL_ID
            FROM ODO_CITAS c
            LEFT JOIN ODO_PACIENTES p ON c.PACIENTE_ID = p.PACIENTE_ID
            LEFT JOIN ODO_USUARIOS u ON c.DOCTOR_ID = u.USUARIO_ID
            WHERE c.DOCTOR_ID = p_doctor_id
              AND (p_fecha_desde IS NULL OR TRUNC(c.FECHA_HORA_INICIO) >= p_fecha_desde)
              AND (p_fecha_hasta IS NULL OR TRUNC(c.FECHA_HORA_INICIO) <= p_fecha_hasta)
              AND (p_estado IS NULL OR c.ESTADO = p_estado)
            ORDER BY c.FECHA_HORA_INICIO;

        p_resultado := 1;
        p_mensaje := 'Citas del doctor obtenidas exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener citas del doctor: ' || SQLERRM;
    END get_citas_by_doctor;

    -- ------------------------------------------------------------------------

    PROCEDURE get_agenda_dia(
        p_doctor_id     IN  ODO_CITAS.DOCTOR_ID%TYPE,
        p_fecha         IN  DATE DEFAULT SYSDATE,
        p_empresa_id    IN  ODO_CITAS.EMPRESA_ID%TYPE DEFAULT NULL,
        p_cursor        OUT t_cita_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                c.CITA_ID,
                c.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                p.TELEFONO_PRINCIPAL AS PACIENTE_TELEFONO,
                p.EMAIL AS PACIENTE_EMAIL,
                c.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                c.FECHA_HORA_INICIO,
                c.FECHA_HORA_FIN,
                c.DURACION_MINUTOS,
                c.MOTIVO_CONSULTA,
                c.TIPO_CITA,
                c.ESTADO,
                c.CONSULTORIO,
                c.OBSERVACIONES,
                c.EMPRESA_ID,
                c.SUCURSAL_ID,
                -- Informacion adicional del paciente
                fn_calc_edad(p.FECHA_NACIMIENTO) AS PACIENTE_EDAD,
                p.ALERGIAS AS PACIENTE_ALERGIAS
            FROM ODO_CITAS c
            LEFT JOIN ODO_PACIENTES p ON c.PACIENTE_ID = p.PACIENTE_ID
            LEFT JOIN ODO_USUARIOS u ON c.DOCTOR_ID = u.USUARIO_ID
            WHERE c.DOCTOR_ID = p_doctor_id
              AND TRUNC(c.FECHA_HORA_INICIO) = TRUNC(p_fecha)
              AND (p_empresa_id IS NULL OR c.EMPRESA_ID = p_empresa_id)
              AND c.ESTADO NOT IN ('CANCELADA')
            ORDER BY c.FECHA_HORA_INICIO;

        p_resultado := 1;
        p_mensaje := 'Agenda del dia obtenida exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener agenda: ' || SQLERRM;
    END get_agenda_dia;

    -- ========================================================================
    -- PROCEDIMIENTOS DE MODIFICACION
    -- ========================================================================

    PROCEDURE insert_cita(
        p_paciente_id       IN  ODO_CITAS.PACIENTE_ID%TYPE,
        p_doctor_id         IN  ODO_CITAS.DOCTOR_ID%TYPE,
        p_fecha_hora_inicio IN  ODO_CITAS.FECHA_HORA_INICIO%TYPE,
        p_duracion_minutos  IN  ODO_CITAS.DURACION_MINUTOS%TYPE DEFAULT 30,
        p_motivo_consulta   IN  ODO_CITAS.MOTIVO_CONSULTA%TYPE,
        p_tipo_cita         IN  ODO_CITAS.TIPO_CITA%TYPE DEFAULT 'CONSULTA',
        p_consultorio       IN  ODO_CITAS.CONSULTORIO%TYPE DEFAULT NULL,
        p_observaciones     IN  ODO_CITAS.OBSERVACIONES%TYPE DEFAULT NULL,
        p_empresa_id        IN  ODO_CITAS.EMPRESA_ID%TYPE,
        p_sucursal_id       IN  ODO_CITAS.SUCURSAL_ID%TYPE,
        p_creado_por        IN  ODO_CITAS.CREADO_POR%TYPE,
        p_cita_id           OUT ODO_CITAS.CITA_ID%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
        v_paciente_existe NUMBER;
        v_doctor_existe NUMBER;
        v_fecha_hora_fin TIMESTAMP;
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

        -- Validar disponibilidad del doctor
        IF NOT check_disponibilidad(p_doctor_id, p_fecha_hora_inicio, p_duracion_minutos) THEN
            p_resultado := 0;
            p_mensaje := 'El doctor no tiene disponibilidad en el horario especificado';
            RETURN;
        END IF;

        -- Calcular hora de fin
        v_fecha_hora_fin := p_fecha_hora_inicio + NUMTODSINTERVAL(p_duracion_minutos, 'MINUTE');

        -- Insertar la cita
        INSERT INTO ODO_CITAS (
            PACIENTE_ID,
            DOCTOR_ID,
            FECHA_HORA_INICIO,
            FECHA_HORA_FIN,
            DURACION_MINUTOS,
            MOTIVO_CONSULTA,
            TIPO_CITA,
            ESTADO,
            CONSULTORIO,
            OBSERVACIONES,
            RECORDATORIO_ENVIADO,
            EMPRESA_ID,
            SUCURSAL_ID,
            FECHA_CREACION,
            CREADO_POR
        ) VALUES (
            p_paciente_id,
            p_doctor_id,
            p_fecha_hora_inicio,
            v_fecha_hora_fin,
            p_duracion_minutos,
            p_motivo_consulta,
            p_tipo_cita,
            c_estado_pendiente,
            p_consultorio,
            p_observaciones,
            'N',
            p_empresa_id,
            p_sucursal_id,
            SYSTIMESTAMP,
            p_creado_por
        ) RETURNING CITA_ID INTO p_cita_id;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Cita creada exitosamente con ID: ' || p_cita_id;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al crear cita: ' || SQLERRM;
    END insert_cita;

    -- ------------------------------------------------------------------------

    PROCEDURE update_cita(
        p_cita_id           IN  ODO_CITAS.CITA_ID%TYPE,
        p_paciente_id       IN  ODO_CITAS.PACIENTE_ID%TYPE DEFAULT NULL,
        p_doctor_id         IN  ODO_CITAS.DOCTOR_ID%TYPE DEFAULT NULL,
        p_fecha_hora_inicio IN  ODO_CITAS.FECHA_HORA_INICIO%TYPE DEFAULT NULL,
        p_duracion_minutos  IN  ODO_CITAS.DURACION_MINUTOS%TYPE DEFAULT NULL,
        p_motivo_consulta   IN  ODO_CITAS.MOTIVO_CONSULTA%TYPE DEFAULT NULL,
        p_tipo_cita         IN  ODO_CITAS.TIPO_CITA%TYPE DEFAULT NULL,
        p_consultorio       IN  ODO_CITAS.CONSULTORIO%TYPE DEFAULT NULL,
        p_observaciones     IN  ODO_CITAS.OBSERVACIONES%TYPE DEFAULT NULL,
        p_modificado_por    IN  ODO_CITAS.MODIFICADO_POR%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
        v_cita_existe NUMBER;
        v_estado_actual ODO_CITAS.ESTADO%TYPE;
        v_doctor_id ODO_CITAS.DOCTOR_ID%TYPE;
        v_duracion NUMBER;
    BEGIN
        -- Verificar que la cita exista
        SELECT COUNT(*), MAX(ESTADO), MAX(DOCTOR_ID), MAX(DURACION_MINUTOS)
        INTO v_cita_existe, v_estado_actual, v_doctor_id, v_duracion
        FROM ODO_CITAS
        WHERE CITA_ID = p_cita_id;

        IF v_cita_existe = 0 THEN
            p_resultado := 0;
            p_mensaje := 'La cita especificada no existe';
            RETURN;
        END IF;

        -- No permitir modificar citas completadas o canceladas
        IF v_estado_actual IN (c_estado_completada, c_estado_cancelada) THEN
            p_resultado := 0;
            p_mensaje := 'No se puede modificar una cita ' || v_estado_actual;
            RETURN;
        END IF;

        -- Si se cambia fecha/hora, verificar disponibilidad
        IF p_fecha_hora_inicio IS NOT NULL THEN
            IF NOT check_disponibilidad(
                NVL(p_doctor_id, v_doctor_id),
                p_fecha_hora_inicio,
                NVL(p_duracion_minutos, v_duracion),
                p_cita_id
            ) THEN
                p_resultado := 0;
                p_mensaje := 'El doctor no tiene disponibilidad en el nuevo horario';
                RETURN;
            END IF;
        END IF;

        -- Actualizar la cita
        UPDATE ODO_CITAS
        SET PACIENTE_ID = NVL(p_paciente_id, PACIENTE_ID),
            DOCTOR_ID = NVL(p_doctor_id, DOCTOR_ID),
            FECHA_HORA_INICIO = NVL(p_fecha_hora_inicio, FECHA_HORA_INICIO),
            FECHA_HORA_FIN = CASE
                WHEN p_fecha_hora_inicio IS NOT NULL OR p_duracion_minutos IS NOT NULL
                THEN NVL(p_fecha_hora_inicio, FECHA_HORA_INICIO) +
                     NUMTODSINTERVAL(NVL(p_duracion_minutos, DURACION_MINUTOS), 'MINUTE')
                ELSE FECHA_HORA_FIN
            END,
            DURACION_MINUTOS = NVL(p_duracion_minutos, DURACION_MINUTOS),
            MOTIVO_CONSULTA = NVL(p_motivo_consulta, MOTIVO_CONSULTA),
            TIPO_CITA = NVL(p_tipo_cita, TIPO_CITA),
            CONSULTORIO = NVL(p_consultorio, CONSULTORIO),
            OBSERVACIONES = NVL(p_observaciones, OBSERVACIONES),
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_modificado_por
        WHERE CITA_ID = p_cita_id;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Cita actualizada exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al actualizar cita: ' || SQLERRM;
    END update_cita;

    -- ------------------------------------------------------------------------

    PROCEDURE cambiar_estado(
        p_cita_id           IN  ODO_CITAS.CITA_ID%TYPE,
        p_nuevo_estado      IN  ODO_CITAS.ESTADO%TYPE,
        p_motivo_cancelacion IN ODO_CITAS.MOTIVO_CANCELACION%TYPE DEFAULT NULL,
        p_usuario_id        IN  NUMBER,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
        v_estado_actual ODO_CITAS.ESTADO%TYPE;
    BEGIN
        -- Obtener estado actual
        SELECT ESTADO INTO v_estado_actual
        FROM ODO_CITAS
        WHERE CITA_ID = p_cita_id;

        -- Validar transicion de estado
        IF v_estado_actual = c_estado_completada THEN
            p_resultado := 0;
            p_mensaje := 'No se puede cambiar el estado de una cita completada';
            RETURN;
        END IF;

        IF v_estado_actual = c_estado_cancelada THEN
            p_resultado := 0;
            p_mensaje := 'No se puede cambiar el estado de una cita cancelada';
            RETURN;
        END IF;

        -- Actualizar estado
        UPDATE ODO_CITAS
        SET ESTADO = p_nuevo_estado,
            MOTIVO_CANCELACION = CASE
                WHEN p_nuevo_estado = c_estado_cancelada THEN p_motivo_cancelacion
                ELSE MOTIVO_CANCELACION
            END,
            CANCELADO_POR = CASE
                WHEN p_nuevo_estado = c_estado_cancelada THEN p_usuario_id
                ELSE CANCELADO_POR
            END,
            FECHA_MODIFICACION = SYSTIMESTAMP,
            MODIFICADO_POR = p_usuario_id
        WHERE CITA_ID = p_cita_id;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Estado de cita actualizado a ' || p_nuevo_estado;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_resultado := 0;
            p_mensaje := 'La cita especificada no existe';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al cambiar estado: ' || SQLERRM;
    END cambiar_estado;

    -- ------------------------------------------------------------------------

    PROCEDURE confirmar_cita(
        p_cita_id       IN  ODO_CITAS.CITA_ID%TYPE,
        p_usuario_id    IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        cambiar_estado(p_cita_id, c_estado_confirmada, NULL, p_usuario_id, p_resultado, p_mensaje);
    END confirmar_cita;

    -- ------------------------------------------------------------------------

    PROCEDURE cancelar_cita(
        p_cita_id           IN  ODO_CITAS.CITA_ID%TYPE,
        p_motivo            IN  ODO_CITAS.MOTIVO_CANCELACION%TYPE,
        p_cancelado_por     IN  ODO_CITAS.CANCELADO_POR%TYPE,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
    BEGIN
        IF p_motivo IS NULL OR TRIM(p_motivo) = '' THEN
            p_resultado := 0;
            p_mensaje := 'Debe especificar un motivo de cancelacion';
            RETURN;
        END IF;

        cambiar_estado(p_cita_id, c_estado_cancelada, p_motivo, p_cancelado_por, p_resultado, p_mensaje);
    END cancelar_cita;

    -- ------------------------------------------------------------------------

    PROCEDURE completar_cita(
        p_cita_id       IN  ODO_CITAS.CITA_ID%TYPE,
        p_usuario_id    IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        cambiar_estado(p_cita_id, c_estado_completada, NULL, p_usuario_id, p_resultado, p_mensaje);
    END completar_cita;

    -- ------------------------------------------------------------------------

    PROCEDURE marcar_no_asistio(
        p_cita_id       IN  ODO_CITAS.CITA_ID%TYPE,
        p_usuario_id    IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        cambiar_estado(p_cita_id, c_estado_no_asistio, 'Paciente no asistio', p_usuario_id, p_resultado, p_mensaje);
    END marcar_no_asistio;

    -- ------------------------------------------------------------------------

    PROCEDURE delete_cita(
        p_cita_id       IN  ODO_CITAS.CITA_ID%TYPE,
        p_usuario_id    IN  NUMBER,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
        v_estado_actual ODO_CITAS.ESTADO%TYPE;
        v_tiene_historia NUMBER;
    BEGIN
        -- Verificar estado de la cita
        SELECT ESTADO INTO v_estado_actual
        FROM ODO_CITAS
        WHERE CITA_ID = p_cita_id;

        -- Verificar si tiene historia clinica asociada
        SELECT COUNT(*) INTO v_tiene_historia
        FROM ODO_HISTORIAS_CLINICAS
        WHERE CITA_ID = p_cita_id;

        IF v_tiene_historia > 0 THEN
            p_resultado := 0;
            p_mensaje := 'No se puede eliminar la cita porque tiene historia clinica asociada';
            RETURN;
        END IF;

        -- Solo eliminar si esta pendiente o cancelada
        IF v_estado_actual NOT IN (c_estado_pendiente, c_estado_cancelada) THEN
            p_resultado := 0;
            p_mensaje := 'Solo se pueden eliminar citas pendientes o canceladas';
            RETURN;
        END IF;

        -- Eliminar la cita
        DELETE FROM ODO_CITAS WHERE CITA_ID = p_cita_id;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Cita eliminada exitosamente';

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            p_resultado := 0;
            p_mensaje := 'La cita especificada no existe';
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al eliminar cita: ' || SQLERRM;
    END delete_cita;

    -- ========================================================================
    -- FUNCIONES DE VALIDACION Y UTILIDAD
    -- ========================================================================

    FUNCTION check_disponibilidad(
        p_doctor_id         IN ODO_CITAS.DOCTOR_ID%TYPE,
        p_fecha_hora_inicio IN ODO_CITAS.FECHA_HORA_INICIO%TYPE,
        p_duracion_minutos  IN NUMBER,
        p_excluir_cita_id   IN ODO_CITAS.CITA_ID%TYPE DEFAULT NULL
    ) RETURN BOOLEAN IS
        v_conflictos NUMBER;
        v_fecha_hora_fin TIMESTAMP;
    BEGIN
        v_fecha_hora_fin := p_fecha_hora_inicio + NUMTODSINTERVAL(p_duracion_minutos, 'MINUTE');

        SELECT COUNT(*) INTO v_conflictos
        FROM ODO_CITAS
        WHERE DOCTOR_ID = p_doctor_id
          AND ESTADO NOT IN (c_estado_cancelada, c_estado_no_asistio)
          AND (p_excluir_cita_id IS NULL OR CITA_ID != p_excluir_cita_id)
          AND (
              -- Nueva cita empieza durante una existente
              (p_fecha_hora_inicio >= FECHA_HORA_INICIO AND p_fecha_hora_inicio < FECHA_HORA_FIN)
              OR
              -- Nueva cita termina durante una existente
              (v_fecha_hora_fin > FECHA_HORA_INICIO AND v_fecha_hora_fin <= FECHA_HORA_FIN)
              OR
              -- Nueva cita engloba una existente
              (p_fecha_hora_inicio <= FECHA_HORA_INICIO AND v_fecha_hora_fin >= FECHA_HORA_FIN)
          );

        RETURN v_conflictos = 0;
    END check_disponibilidad;

    -- ------------------------------------------------------------------------

    FUNCTION get_proxima_cita_paciente(
        p_paciente_id IN ODO_CITAS.PACIENTE_ID%TYPE
    ) RETURN DATE IS
        v_proxima_cita DATE;
    BEGIN
        SELECT MIN(TRUNC(FECHA_HORA_INICIO)) INTO v_proxima_cita
        FROM ODO_CITAS
        WHERE PACIENTE_ID = p_paciente_id
          AND FECHA_HORA_INICIO > SYSDATE
          AND ESTADO IN (c_estado_pendiente, c_estado_confirmada);

        RETURN v_proxima_cita;
    END get_proxima_cita_paciente;

    -- ------------------------------------------------------------------------

    FUNCTION count_citas_dia(
        p_doctor_id IN ODO_CITAS.DOCTOR_ID%TYPE,
        p_fecha     IN DATE DEFAULT SYSDATE
    ) RETURN NUMBER IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM ODO_CITAS
        WHERE DOCTOR_ID = p_doctor_id
          AND TRUNC(FECHA_HORA_INICIO) = TRUNC(p_fecha)
          AND ESTADO NOT IN (c_estado_cancelada);

        RETURN v_count;
    END count_citas_dia;

    -- ========================================================================
    -- PROCEDIMIENTOS DE RECORDATORIO
    -- ========================================================================

    PROCEDURE marcar_recordatorio_enviado(
        p_cita_id       IN  ODO_CITAS.CITA_ID%TYPE,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    ) IS
    BEGIN
        UPDATE ODO_CITAS
        SET RECORDATORIO_ENVIADO = 'S',
            FECHA_RECORDATORIO = SYSTIMESTAMP
        WHERE CITA_ID = p_cita_id;

        IF SQL%ROWCOUNT = 0 THEN
            p_resultado := 0;
            p_mensaje := 'La cita especificada no existe';
            RETURN;
        END IF;

        COMMIT;

        p_resultado := 1;
        p_mensaje := 'Recordatorio marcado como enviado';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_resultado := 0;
            p_mensaje := 'Error al marcar recordatorio: ' || SQLERRM;
    END marcar_recordatorio_enviado;

    -- ------------------------------------------------------------------------

    PROCEDURE get_citas_para_recordatorio(
        p_dias_anticipacion IN NUMBER DEFAULT 1,
        p_cursor            OUT t_cita_cursor,
        p_resultado         OUT NUMBER,
        p_mensaje           OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                c.CITA_ID,
                c.PACIENTE_ID,
                p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
                p.TELEFONO_PRINCIPAL AS PACIENTE_TELEFONO,
                p.EMAIL AS PACIENTE_EMAIL,
                c.DOCTOR_ID,
                u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE,
                c.FECHA_HORA_INICIO,
                c.MOTIVO_CONSULTA,
                c.CONSULTORIO,
                c.EMPRESA_ID,
                c.SUCURSAL_ID
            FROM ODO_CITAS c
            JOIN ODO_PACIENTES p ON c.PACIENTE_ID = p.PACIENTE_ID
            LEFT JOIN ODO_USUARIOS u ON c.DOCTOR_ID = u.USUARIO_ID
            WHERE c.ESTADO IN (c_estado_pendiente, c_estado_confirmada)
              AND NVL(c.RECORDATORIO_ENVIADO, 'N') = 'N'
              AND TRUNC(c.FECHA_HORA_INICIO) = TRUNC(SYSDATE + p_dias_anticipacion)
            ORDER BY c.FECHA_HORA_INICIO;

        p_resultado := 1;
        p_mensaje := 'Citas para recordatorio obtenidas exitosamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_resultado := 0;
            p_mensaje := 'Error al obtener citas para recordatorio: ' || SQLERRM;
    END get_citas_para_recordatorio;

END PKG_CITAS;
/
