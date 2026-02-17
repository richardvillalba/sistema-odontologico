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
        p_empresa_id    IN  ODO_CATALOGOS_TRATAMIENTOS.EMPRESA_ID%TYPE,
        p_categoria     IN  ODO_CATALOGOS_TRATAMIENTOS.CATEGORIA%TYPE DEFAULT NULL,
        p_activo        IN  ODO_CATALOGOS_TRATAMIENTOS.ACTIVO%TYPE DEFAULT 'S',
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener tratamiento del catalogo por ID
    PROCEDURE get_catalogo_item(
        p_empresa_id    IN  ODO_CATALOGOS_TRATAMIENTOS.EMPRESA_ID%TYPE,
        p_catalogo_id   IN  ODO_CATALOGOS_TRATAMIENTOS.CATALOGO_ID%TYPE,
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Buscar en catalogo
    PROCEDURE search_catalogo(
        p_empresa_id    IN  ODO_CATALOGOS_TRATAMIENTOS.EMPRESA_ID%TYPE,
        p_termino       IN  VARCHAR2,
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Insertar item en catalogo
    PROCEDURE insert_catalogo(
        p_empresa_id            IN  ODO_CATALOGOS_TRATAMIENTOS.EMPRESA_ID%TYPE,
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
        p_empresa_id            IN  ODO_CATALOGOS_TRATAMIENTOS.EMPRESA_ID%TYPE,
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
        p_empresa_id              IN ODO_TRATAMIENTOS_PACIENTE.EMPRESA_ID%TYPE,
        p_tratamiento_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.TRATAMIENTO_PACIENTE_ID%TYPE,
        p_cursor                  OUT t_tratamiento_cursor,
        p_resultado               OUT NUMBER,
        p_mensaje                 OUT VARCHAR2
    );

    -- Obtener tratamientos de un paciente
    PROCEDURE get_tratamientos_by_paciente(
        p_empresa_id    IN  ODO_TRATAMIENTOS_PACIENTE.EMPRESA_ID%TYPE,
        p_paciente_id   IN  ODO_TRATAMIENTOS_PACIENTE.PACIENTE_ID%TYPE,
        p_estado        IN  ODO_TRATAMIENTOS_PACIENTE.ESTADO%TYPE DEFAULT NULL,
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Obtener tratamientos por doctor
    PROCEDURE get_tratamientos_by_doctor(
        p_empresa_id    IN  ODO_TRATAMIENTOS_PACIENTE.EMPRESA_ID%TYPE,
        p_doctor_id     IN  ODO_TRATAMIENTOS_PACIENTE.DOCTOR_ID%TYPE,
        p_estado        IN  ODO_TRATAMIENTOS_PACIENTE.ESTADO%TYPE DEFAULT NULL,
        p_cursor        OUT t_tratamiento_cursor,
        p_resultado     OUT NUMBER,
        p_mensaje       OUT VARCHAR2
    );

    -- Asignar tratamiento a paciente
    PROCEDURE insert_tratamiento_paciente(
        p_empresa_id        IN  ODO_TRATAMIENTOS_PACIENTE.EMPRESA_ID%TYPE,
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
        p_empresa_id              IN ODO_TRATAMIENTOS_PACIENTE.EMPRESA_ID%TYPE,
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
        p_empresa_id  IN ODO_TRATAMIENTOS_PACIENTE.EMPRESA_ID%TYPE,
        p_paciente_id IN ODO_TRATAMIENTOS_PACIENTE.PACIENTE_ID%TYPE
    ) RETURN NUMBER;

END PKG_TRATAMIENTOS;
/
