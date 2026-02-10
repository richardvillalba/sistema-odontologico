-- ========================================
-- PACKAGE PKG_SEGURIDAD - SPECIFICATION
-- ========================================
CREATE OR REPLACE PACKAGE PKG_SEGURIDAD AS
    
    -- Type for cursor
    TYPE t_cursor IS REF CURSOR;
    
    -- Verificar si un usuario tiene acceso a un programa
    FUNCTION TIENE_ACCESO_PROGRAMA(
        p_usuario_id IN NUMBER,
        p_codigo_programa IN VARCHAR2
    ) RETURN CHAR;

    -- Verificar si un usuario tiene un permiso específico
    FUNCTION TIENE_PERMISO(
        p_usuario_id IN NUMBER,
        p_codigo_permiso IN VARCHAR2
    ) RETURN CHAR;

    -- Obtener programas del usuario
    PROCEDURE GET_PROGRAMAS_USUARIO(
        p_usuario_id IN NUMBER,
        p_cursor OUT SYS_REFCURSOR
    );

    -- Obtener permisos del usuario
    PROCEDURE GET_PERMISOS_USUARIO(
       p_usuario_id IN NUMBER,
        p_cursor OUT SYS_REFCURSOR
    );

    -- Asignar rol a usuario
    PROCEDURE ASIGNAR_ROL_USUARIO(
        p_usuario_id IN NUMBER,
        p_rol_id IN NUMBER,
        p_asignado_por IN NUMBER,
        p_resultado OUT NUMBER,
        p_mensaje OUT VARCHAR2
    );

    -- Asignar programa a rol
    PROCEDURE ASIGNAR_PROGRAMA_ROL(
        p_rol_id IN NUMBER,
        p_programa_id IN NUMBER,
        p_asignado_por IN NUMBER,
        p_resultado OUT NUMBER,
        p_mensaje OUT VARCHAR2
    );

    -- Asignar permiso a rol
    PROCEDURE ASIGNAR_PERMISO_ROL(
        p_rol_id IN NUMBER,
        p_permiso_id IN NUMBER,
        p_asignado_por IN NUMBER,
        p_resultado OUT NUMBER,
        p_mensaje OUT VARCHAR2
    );

END PKG_SEGURIDAD;
/
