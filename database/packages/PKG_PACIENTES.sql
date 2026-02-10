/*
================================================================================
  Package: PKG_PACIENTES
  Descripción: Gestión completa de pacientes del sistema odontológico
  Autor: Claude (Backend IA)
  Fecha: 2026-01-12

  Operaciones:
    - get_paciente: Obtener paciente por ID
    - get_pacientes_by_empresa: Listar pacientes de una empresa
    - search_pacientes: Buscar pacientes por criterios
    - insert_paciente: Crear nuevo paciente
    - update_paciente: Actualizar datos de paciente
    - delete_paciente: Eliminación lógica de paciente
    - get_paciente_by_documento: Buscar por documento
================================================================================
*/

-- ============================================================================
-- PACKAGE SPECIFICATION
-- ============================================================================
CREATE OR REPLACE PACKAGE PKG_PACIENTES AS

    -- Tipos para retorno de datos
    TYPE t_paciente_rec IS RECORD (
        paciente_id             ODO_PACIENTES.PACIENTE_ID%TYPE,
        numero_historia         ODO_PACIENTES.NUMERO_HISTORIA%TYPE,
        nombre                  ODO_PACIENTES.NOMBRE%TYPE,
        apellido                ODO_PACIENTES.APELLIDO%TYPE,
        nombre_completo         VARCHAR2(201),
        documento_tipo          ODO_PACIENTES.DOCUMENTO_TIPO%TYPE,
        documento_numero        ODO_PACIENTES.DOCUMENTO_NUMERO%TYPE,
        fecha_nacimiento        ODO_PACIENTES.FECHA_NACIMIENTO%TYPE,
        edad                    NUMBER,
        genero                  ODO_PACIENTES.GENERO%TYPE,
        email                   ODO_PACIENTES.EMAIL%TYPE,
        telefono_principal      ODO_PACIENTES.TELEFONO_PRINCIPAL%TYPE,
        activo                  ODO_PACIENTES.ACTIVO%TYPE,
        fecha_registro          ODO_PACIENTES.FECHA_REGISTRO%TYPE
    );

    TYPE t_paciente_cursor IS REF CURSOR;

    -- ========================================================================
    -- GET_PACIENTE: Obtener un paciente por ID
    -- ========================================================================
    PROCEDURE get_paciente(
        p_paciente_id   IN  NUMBER,
        p_empresa_id    IN  NUMBER,
        p_cursor        OUT SYS_REFCURSOR,
        p_status        OUT VARCHAR2,
        p_message       OUT VARCHAR2
    );

    -- ========================================================================
    -- GET_PACIENTES_BY_EMPRESA: Listar todos los pacientes de una empresa
    -- ========================================================================
    PROCEDURE get_pacientes_by_empresa(
        p_empresa_id    IN  NUMBER,
        p_activo        IN  CHAR DEFAULT NULL,
        p_limit         IN  NUMBER DEFAULT 100,
        p_offset        IN  NUMBER DEFAULT 0,
        p_cursor        OUT SYS_REFCURSOR,
        p_total         OUT NUMBER,
        p_status        OUT VARCHAR2,
        p_message       OUT VARCHAR2
    );

    -- ========================================================================
    -- SEARCH_PACIENTES: Buscar pacientes por criterios
    -- ========================================================================
    PROCEDURE search_pacientes(
        p_empresa_id        IN  NUMBER,
        p_search_term       IN  VARCHAR2 DEFAULT NULL,
        p_documento_numero  IN  VARCHAR2 DEFAULT NULL,
        p_limit             IN  NUMBER DEFAULT 50,
        p_offset            IN  NUMBER DEFAULT 0,
        p_cursor            OUT SYS_REFCURSOR,
        p_total             OUT NUMBER,
        p_status            OUT VARCHAR2,
        p_message           OUT VARCHAR2
    );

    -- ========================================================================
    -- INSERT_PACIENTE: Crear nuevo paciente
    -- ========================================================================
    PROCEDURE insert_paciente(
        p_empresa_id                IN  NUMBER,
        p_nombre                    IN  VARCHAR2,
        p_apellido                  IN  VARCHAR2,
        p_documento_tipo            IN  VARCHAR2,
        p_documento_numero          IN  VARCHAR2,
        p_fecha_nacimiento          IN  DATE,
        p_genero                    IN  VARCHAR2 DEFAULT NULL,
        p_grupo_sanguineo           IN  VARCHAR2 DEFAULT NULL,
        p_email                     IN  VARCHAR2 DEFAULT NULL,
        p_telefono_principal        IN  VARCHAR2 DEFAULT NULL,
        p_telefono_secundario       IN  VARCHAR2 DEFAULT NULL,
        p_direccion                 IN  VARCHAR2 DEFAULT NULL,
        p_departamento_id           IN  NUMBER DEFAULT NULL,
        p_ciudad_id                 IN  NUMBER DEFAULT NULL,
        p_barrio_id                 IN  NUMBER DEFAULT NULL,
        p_contacto_emergencia_nombre    IN VARCHAR2 DEFAULT NULL,
        p_contacto_emergencia_telefono  IN VARCHAR2 DEFAULT NULL,
        p_contacto_emergencia_relacion  IN VARCHAR2 DEFAULT NULL,
        p_alergias                  IN  CLOB DEFAULT NULL,
        p_medicamentos_actuales     IN  CLOB DEFAULT NULL,
        p_enfermedades_cronicas     IN  CLOB DEFAULT NULL,
        p_observaciones             IN  CLOB DEFAULT NULL,
        p_registrado_por            IN  NUMBER,
        p_paciente_id               OUT NUMBER,
        p_numero_historia           OUT VARCHAR2,
        p_status                    OUT VARCHAR2,
        p_message                   OUT VARCHAR2
    );

    -- ========================================================================
    -- UPDATE_PACIENTE: Actualizar datos de paciente
    -- ========================================================================
    PROCEDURE update_paciente(
        p_paciente_id               IN  NUMBER,
        p_empresa_id                IN  NUMBER,
        p_nombre                    IN  VARCHAR2 DEFAULT NULL,
        p_apellido                  IN  VARCHAR2 DEFAULT NULL,
        p_documento_tipo            IN  VARCHAR2 DEFAULT NULL,
        p_documento_numero          IN  VARCHAR2 DEFAULT NULL,
        p_fecha_nacimiento          IN  DATE DEFAULT NULL,
        p_genero                    IN  VARCHAR2 DEFAULT NULL,
        p_grupo_sanguineo           IN  VARCHAR2 DEFAULT NULL,
        p_email                     IN  VARCHAR2 DEFAULT NULL,
        p_telefono_principal        IN  VARCHAR2 DEFAULT NULL,
        p_telefono_secundario       IN  VARCHAR2 DEFAULT NULL,
        p_direccion                 IN  VARCHAR2 DEFAULT NULL,
        p_departamento_id           IN  NUMBER DEFAULT NULL,
        p_ciudad_id                 IN  NUMBER DEFAULT NULL,
        p_barrio_id                 IN  NUMBER DEFAULT NULL,
        p_contacto_emergencia_nombre    IN VARCHAR2 DEFAULT NULL,
        p_contacto_emergencia_telefono  IN VARCHAR2 DEFAULT NULL,
        p_contacto_emergencia_relacion  IN VARCHAR2 DEFAULT NULL,
        p_alergias                  IN  CLOB DEFAULT NULL,
        p_medicamentos_actuales     IN  CLOB DEFAULT NULL,
        p_enfermedades_cronicas     IN  CLOB DEFAULT NULL,
        p_observaciones             IN  CLOB DEFAULT NULL,
        p_modificado_por            IN  NUMBER,
        p_status                    OUT VARCHAR2,
        p_message                   OUT VARCHAR2
    );

    -- ========================================================================
    -- DELETE_PACIENTE: Eliminación lógica
    -- ========================================================================
    PROCEDURE delete_paciente(
        p_paciente_id   IN  NUMBER,
        p_empresa_id    IN  NUMBER,
        p_modificado_por IN NUMBER,
        p_status        OUT VARCHAR2,
        p_message       OUT VARCHAR2
    );

    -- ========================================================================
    -- GET_PACIENTE_BY_DOCUMENTO: Buscar por tipo y número de documento
    -- ========================================================================
    PROCEDURE get_paciente_by_documento(
        p_empresa_id        IN  NUMBER,
        p_documento_tipo    IN  VARCHAR2,
        p_documento_numero  IN  VARCHAR2,
        p_cursor            OUT SYS_REFCURSOR,
        p_status            OUT VARCHAR2,
        p_message           OUT VARCHAR2
    );

    -- ========================================================================
    -- GENERATE_NUMERO_HISTORIA: Generar número de historia único
    -- ========================================================================
    FUNCTION generate_numero_historia(
        p_empresa_id IN NUMBER
    ) RETURN VARCHAR2;

END PKG_PACIENTES;
/

-- ============================================================================
-- PACKAGE BODY
-- ============================================================================
CREATE OR REPLACE PACKAGE BODY PKG_PACIENTES AS

    -- ========================================================================
    -- FUNCIÓN AUXILIAR: Calcular edad
    -- ========================================================================
    FUNCTION calc_edad(p_fecha_nacimiento DATE) RETURN NUMBER IS
    BEGIN
        RETURN TRUNC(MONTHS_BETWEEN(SYSDATE, p_fecha_nacimiento) / 12);
    END calc_edad;

    -- ========================================================================
    -- GENERATE_NUMERO_HISTORIA
    -- ========================================================================
    FUNCTION generate_numero_historia(p_empresa_id IN NUMBER) RETURN VARCHAR2 IS
        v_secuencia NUMBER;
        v_numero VARCHAR2(20);
    BEGIN
        SELECT NVL(MAX(TO_NUMBER(REGEXP_SUBSTR(numero_historia, '\d+'))), 0) + 1
        INTO v_secuencia
        FROM odo_pacientes
        WHERE empresa_id = p_empresa_id;

        v_numero := 'HC-' || LPAD(v_secuencia, 6, '0');
        RETURN v_numero;
    END generate_numero_historia;

    -- ========================================================================
    -- GET_PACIENTE
    -- ========================================================================
    PROCEDURE get_paciente(
        p_paciente_id   IN  NUMBER,
        p_empresa_id    IN  NUMBER,
        p_cursor        OUT SYS_REFCURSOR,
        p_status        OUT VARCHAR2,
        p_message       OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                p.paciente_id,
                p.numero_historia,
                p.nombre,
                p.apellido,
                p.nombre || ' ' || p.apellido AS nombre_completo,
                p.documento_tipo,
                p.documento_numero,
                p.fecha_nacimiento,
                calc_edad(p.fecha_nacimiento) AS edad,
                p.genero,
                p.grupo_sanguineo,
                p.email,
                p.telefono_principal,
                p.telefono_secundario,
                p.direccion,
                p.departamento_id,
                d.nombre AS departamento_nombre,
                p.ciudad_id,
                c.nombre AS ciudad_nombre,
                p.barrio_id,
                b.nombre AS barrio_nombre,
                p.contacto_emergencia_nombre,
                p.contacto_emergencia_telefono,
                p.contacto_emergencia_relacion,
                p.alergias,
                p.medicamentos_actuales,
                p.enfermedades_cronicas,
                p.observaciones,
                p.activo,
                p.fecha_registro,
                p.fecha_modificacion,
                p.registrado_por,
                p.modificado_por
            FROM odo_pacientes p
            LEFT JOIN odo_departamentos d ON p.departamento_id = d.departamento_id
            LEFT JOIN odo_ciudades c ON p.ciudad_id = c.ciudad_id
            LEFT JOIN odo_barrios b ON p.barrio_id = b.barrio_id
            WHERE p.paciente_id = p_paciente_id
              AND p.empresa_id = p_empresa_id;

        p_status := 'SUCCESS';
        p_message := 'Paciente obtenido correctamente';

    EXCEPTION
        WHEN OTHERS THEN
            p_status := 'ERROR';
            p_message := 'Error al obtener paciente: ' || SQLERRM;
    END get_paciente;

    -- ========================================================================
    -- GET_PACIENTES_BY_EMPRESA
    -- ========================================================================
    PROCEDURE get_pacientes_by_empresa(
        p_empresa_id    IN  NUMBER,
        p_activo        IN  CHAR DEFAULT NULL,
        p_limit         IN  NUMBER DEFAULT 100,
        p_offset        IN  NUMBER DEFAULT 0,
        p_cursor        OUT SYS_REFCURSOR,
        p_total         OUT NUMBER,
        p_status        OUT VARCHAR2,
        p_message       OUT VARCHAR2
    ) IS
    BEGIN
        -- Contar total
        SELECT COUNT(*)
        INTO p_total
        FROM odo_pacientes
        WHERE empresa_id = p_empresa_id
          AND (p_activo IS NULL OR activo = p_activo);

        -- Obtener datos paginados
        OPEN p_cursor FOR
            SELECT
                p.paciente_id,
                p.numero_historia,
                p.nombre,
                p.apellido,
                p.nombre || ' ' || p.apellido AS nombre_completo,
                p.documento_tipo,
                p.documento_numero,
                p.fecha_nacimiento,
                calc_edad(p.fecha_nacimiento) AS edad,
                p.genero,
                p.email,
                p.telefono_principal,
                p.activo,
                p.fecha_registro,
                NVL((SELECT SUM(f.total)
                     FROM odo_facturas f
                     WHERE f.paciente_id = p.paciente_id
                       AND f.estado != 'ANULADA'), 0) AS monto_total,
                NVL((SELECT SUM(f.saldo_pendiente)
                     FROM odo_facturas f
                     WHERE f.paciente_id = p.paciente_id
                       AND f.estado IN ('PENDIENTE', 'PARCIAL')), 0) AS saldo_pendiente
            FROM odo_pacientes p
            WHERE p.empresa_id = p_empresa_id
              AND (p_activo IS NULL OR p.activo = p_activo)
            ORDER BY p.apellido, p.nombre
            OFFSET p_offset ROWS FETCH NEXT p_limit ROWS ONLY;

        p_status := 'SUCCESS';
        p_message := 'Pacientes obtenidos correctamente. Total: ' || p_total;

    EXCEPTION
        WHEN OTHERS THEN
            p_status := 'ERROR';
            p_message := 'Error al obtener pacientes: ' || SQLERRM;
    END get_pacientes_by_empresa;

    -- ========================================================================
    -- SEARCH_PACIENTES
    -- ========================================================================
    PROCEDURE search_pacientes(
        p_empresa_id        IN  NUMBER,
        p_search_term       IN  VARCHAR2 DEFAULT NULL,
        p_documento_numero  IN  VARCHAR2 DEFAULT NULL,
        p_limit             IN  NUMBER DEFAULT 50,
        p_offset            IN  NUMBER DEFAULT 0,
        p_cursor            OUT SYS_REFCURSOR,
        p_total             OUT NUMBER,
        p_status            OUT VARCHAR2,
        p_message           OUT VARCHAR2
    ) IS
        v_search VARCHAR2(200);
    BEGIN
        v_search := '%' || UPPER(p_search_term) || '%';

        -- Contar total
        SELECT COUNT(*)
        INTO p_total
        FROM odo_pacientes
        WHERE empresa_id = p_empresa_id
          AND activo = 'S'
          AND (
              p_search_term IS NULL
              OR UPPER(nombre || ' ' || apellido) LIKE v_search
              OR UPPER(numero_historia) LIKE v_search
              OR UPPER(email) LIKE v_search
          )
          AND (p_documento_numero IS NULL OR documento_numero = p_documento_numero);

        -- Obtener datos
        OPEN p_cursor FOR
            SELECT
                paciente_id,
                numero_historia,
                nombre,
                apellido,
                nombre || ' ' || apellido AS nombre_completo,
                documento_tipo,
                documento_numero,
                fecha_nacimiento,
                calc_edad(fecha_nacimiento) AS edad,
                email,
                telefono_principal,
                activo
            FROM odo_pacientes
            WHERE empresa_id = p_empresa_id
              AND activo = 'S'
              AND (
                  p_search_term IS NULL
                  OR UPPER(nombre || ' ' || apellido) LIKE v_search
                  OR UPPER(numero_historia) LIKE v_search
                  OR UPPER(email) LIKE v_search
              )
              AND (p_documento_numero IS NULL OR documento_numero = p_documento_numero)
            ORDER BY apellido, nombre
            OFFSET p_offset ROWS FETCH NEXT p_limit ROWS ONLY;

        p_status := 'SUCCESS';
        p_message := 'Búsqueda completada. Total: ' || p_total;

    EXCEPTION
        WHEN OTHERS THEN
            p_status := 'ERROR';
            p_message := 'Error en búsqueda: ' || SQLERRM;
    END search_pacientes;

    -- ========================================================================
    -- INSERT_PACIENTE
    -- ========================================================================
    PROCEDURE insert_paciente(
        p_empresa_id                IN  NUMBER,
        p_nombre                    IN  VARCHAR2,
        p_apellido                  IN  VARCHAR2,
        p_documento_tipo            IN  VARCHAR2,
        p_documento_numero          IN  VARCHAR2,
        p_fecha_nacimiento          IN  DATE,
        p_genero                    IN  VARCHAR2 DEFAULT NULL,
        p_grupo_sanguineo           IN  VARCHAR2 DEFAULT NULL,
        p_email                     IN  VARCHAR2 DEFAULT NULL,
        p_telefono_principal        IN  VARCHAR2 DEFAULT NULL,
        p_telefono_secundario       IN  VARCHAR2 DEFAULT NULL,
        p_direccion                 IN  VARCHAR2 DEFAULT NULL,
        p_departamento_id           IN  NUMBER DEFAULT NULL,
        p_ciudad_id                 IN  NUMBER DEFAULT NULL,
        p_barrio_id                 IN  NUMBER DEFAULT NULL,
        p_contacto_emergencia_nombre    IN VARCHAR2 DEFAULT NULL,
        p_contacto_emergencia_telefono  IN VARCHAR2 DEFAULT NULL,
        p_contacto_emergencia_relacion  IN VARCHAR2 DEFAULT NULL,
        p_alergias                  IN  CLOB DEFAULT NULL,
        p_medicamentos_actuales     IN  CLOB DEFAULT NULL,
        p_enfermedades_cronicas     IN  CLOB DEFAULT NULL,
        p_observaciones             IN  CLOB DEFAULT NULL,
        p_registrado_por            IN  NUMBER,
        p_paciente_id               OUT NUMBER,
        p_numero_historia           OUT VARCHAR2,
        p_status                    OUT VARCHAR2,
        p_message                   OUT VARCHAR2
    ) IS
        v_count NUMBER;
    BEGIN
        -- Validar que no exista otro paciente con el mismo documento en la empresa
        SELECT COUNT(*)
        INTO v_count
        FROM odo_pacientes
        WHERE empresa_id = p_empresa_id
          AND documento_tipo = p_documento_tipo
          AND documento_numero = p_documento_numero;

        IF v_count > 0 THEN
            p_status := 'ERROR';
            p_message := 'Ya existe un paciente con el documento ' || p_documento_tipo || ': ' || p_documento_numero;
            RETURN;
        END IF;

        -- Generar número de historia
        p_numero_historia := generate_numero_historia(p_empresa_id);

        -- Obtener siguiente ID
        SELECT NVL(MAX(paciente_id), 0) + 1
        INTO p_paciente_id
        FROM odo_pacientes;

        -- Insertar paciente
        INSERT INTO odo_pacientes (
            paciente_id,
            numero_historia,
            nombre,
            apellido,
            documento_tipo,
            documento_numero,
            fecha_nacimiento,
            genero,
            grupo_sanguineo,
            email,
            telefono_principal,
            telefono_secundario,
            direccion,
            departamento_id,
            ciudad_id,
            barrio_id,
            contacto_emergencia_nombre,
            contacto_emergencia_telefono,
            contacto_emergencia_relacion,
            alergias,
            medicamentos_actuales,
            enfermedades_cronicas,
            observaciones,
            activo,
            fecha_registro,
            registrado_por,
            empresa_id
        ) VALUES (
            p_paciente_id,
            p_numero_historia,
            INITCAP(p_nombre),
            INITCAP(p_apellido),
            p_documento_tipo,
            p_documento_numero,
            p_fecha_nacimiento,
            p_genero,
            p_grupo_sanguineo,
            LOWER(p_email),
            p_telefono_principal,
            p_telefono_secundario,
            p_direccion,
            p_departamento_id,
            p_ciudad_id,
            p_barrio_id,
            p_contacto_emergencia_nombre,
            p_contacto_emergencia_telefono,
            p_contacto_emergencia_relacion,
            p_alergias,
            p_medicamentos_actuales,
            p_enfermedades_cronicas,
            p_observaciones,
            'S',
            SYSTIMESTAMP,
            p_registrado_por,
            p_empresa_id
        );

        COMMIT;

        p_status := 'SUCCESS';
        p_message := 'Paciente creado correctamente con número de historia: ' || p_numero_historia;

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := 'ERROR';
            p_message := 'Error al crear paciente: ' || SQLERRM;
    END insert_paciente;

    -- ========================================================================
    -- UPDATE_PACIENTE
    -- ========================================================================
    PROCEDURE update_paciente(
        p_paciente_id               IN  NUMBER,
        p_empresa_id                IN  NUMBER,
        p_nombre                    IN  VARCHAR2 DEFAULT NULL,
        p_apellido                  IN  VARCHAR2 DEFAULT NULL,
        p_documento_tipo            IN  VARCHAR2 DEFAULT NULL,
        p_documento_numero          IN  VARCHAR2 DEFAULT NULL,
        p_fecha_nacimiento          IN  DATE DEFAULT NULL,
        p_genero                    IN  VARCHAR2 DEFAULT NULL,
        p_grupo_sanguineo           IN  VARCHAR2 DEFAULT NULL,
        p_email                     IN  VARCHAR2 DEFAULT NULL,
        p_telefono_principal        IN  VARCHAR2 DEFAULT NULL,
        p_telefono_secundario       IN  VARCHAR2 DEFAULT NULL,
        p_direccion                 IN  VARCHAR2 DEFAULT NULL,
        p_departamento_id           IN  NUMBER DEFAULT NULL,
        p_ciudad_id                 IN  NUMBER DEFAULT NULL,
        p_barrio_id                 IN  NUMBER DEFAULT NULL,
        p_contacto_emergencia_nombre    IN VARCHAR2 DEFAULT NULL,
        p_contacto_emergencia_telefono  IN VARCHAR2 DEFAULT NULL,
        p_contacto_emergencia_relacion  IN VARCHAR2 DEFAULT NULL,
        p_alergias                  IN  CLOB DEFAULT NULL,
        p_medicamentos_actuales     IN  CLOB DEFAULT NULL,
        p_enfermedades_cronicas     IN  CLOB DEFAULT NULL,
        p_observaciones             IN  CLOB DEFAULT NULL,
        p_modificado_por            IN  NUMBER,
        p_status                    OUT VARCHAR2,
        p_message                   OUT VARCHAR2
    ) IS
        v_count NUMBER;
    BEGIN
        -- Verificar que el paciente existe y pertenece a la empresa
        SELECT COUNT(*)
        INTO v_count
        FROM odo_pacientes
        WHERE paciente_id = p_paciente_id
          AND empresa_id = p_empresa_id;

        IF v_count = 0 THEN
            p_status := 'ERROR';
            p_message := 'Paciente no encontrado';
            RETURN;
        END IF;

        -- Verificar duplicado de documento si se está actualizando
        IF p_documento_numero IS NOT NULL THEN
            SELECT COUNT(*)
            INTO v_count
            FROM odo_pacientes
            WHERE empresa_id = p_empresa_id
              AND documento_tipo = NVL(p_documento_tipo, documento_tipo)
              AND documento_numero = p_documento_numero
              AND paciente_id != p_paciente_id;

            IF v_count > 0 THEN
                p_status := 'ERROR';
                p_message := 'Ya existe otro paciente con ese documento';
                RETURN;
            END IF;
        END IF;

        -- Actualizar
        UPDATE odo_pacientes
        SET nombre = NVL(INITCAP(p_nombre), nombre),
            apellido = NVL(INITCAP(p_apellido), apellido),
            documento_tipo = NVL(p_documento_tipo, documento_tipo),
            documento_numero = NVL(p_documento_numero, documento_numero),
            fecha_nacimiento = NVL(p_fecha_nacimiento, fecha_nacimiento),
            genero = NVL(p_genero, genero),
            grupo_sanguineo = NVL(p_grupo_sanguineo, grupo_sanguineo),
            email = NVL(LOWER(p_email), email),
            telefono_principal = NVL(p_telefono_principal, telefono_principal),
            telefono_secundario = NVL(p_telefono_secundario, telefono_secundario),
            direccion = NVL(p_direccion, direccion),
            departamento_id = NVL(p_departamento_id, departamento_id),
            ciudad_id = NVL(p_ciudad_id, ciudad_id),
            barrio_id = NVL(p_barrio_id, barrio_id),
            contacto_emergencia_nombre = NVL(p_contacto_emergencia_nombre, contacto_emergencia_nombre),
            contacto_emergencia_telefono = NVL(p_contacto_emergencia_telefono, contacto_emergencia_telefono),
            contacto_emergencia_relacion = NVL(p_contacto_emergencia_relacion, contacto_emergencia_relacion),
            alergias = NVL(p_alergias, alergias),
            medicamentos_actuales = NVL(p_medicamentos_actuales, medicamentos_actuales),
            enfermedades_cronicas = NVL(p_enfermedades_cronicas, enfermedades_cronicas),
            observaciones = NVL(p_observaciones, observaciones),
            fecha_modificacion = SYSTIMESTAMP,
            modificado_por = p_modificado_por
        WHERE paciente_id = p_paciente_id
          AND empresa_id = p_empresa_id;

        COMMIT;

        p_status := 'SUCCESS';
        p_message := 'Paciente actualizado correctamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := 'ERROR';
            p_message := 'Error al actualizar paciente: ' || SQLERRM;
    END update_paciente;

    -- ========================================================================
    -- DELETE_PACIENTE (Eliminación lógica)
    -- ========================================================================
    PROCEDURE delete_paciente(
        p_paciente_id   IN  NUMBER,
        p_empresa_id    IN  NUMBER,
        p_modificado_por IN NUMBER,
        p_status        OUT VARCHAR2,
        p_message       OUT VARCHAR2
    ) IS
        v_count NUMBER;
    BEGIN
        -- Verificar que existe
        SELECT COUNT(*)
        INTO v_count
        FROM odo_pacientes
        WHERE paciente_id = p_paciente_id
          AND empresa_id = p_empresa_id;

        IF v_count = 0 THEN
            p_status := 'ERROR';
            p_message := 'Paciente no encontrado';
            RETURN;
        END IF;

        -- Eliminación lógica
        UPDATE odo_pacientes
        SET activo = 'N',
            fecha_modificacion = SYSTIMESTAMP,
            modificado_por = p_modificado_por
        WHERE paciente_id = p_paciente_id
          AND empresa_id = p_empresa_id;

        COMMIT;

        p_status := 'SUCCESS';
        p_message := 'Paciente eliminado correctamente';

    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_status := 'ERROR';
            p_message := 'Error al eliminar paciente: ' || SQLERRM;
    END delete_paciente;

    -- ========================================================================
    -- GET_PACIENTE_BY_DOCUMENTO
    -- ========================================================================
    PROCEDURE get_paciente_by_documento(
        p_empresa_id        IN  NUMBER,
        p_documento_tipo    IN  VARCHAR2,
        p_documento_numero  IN  VARCHAR2,
        p_cursor            OUT SYS_REFCURSOR,
        p_status            OUT VARCHAR2,
        p_message           OUT VARCHAR2
    ) IS
    BEGIN
        OPEN p_cursor FOR
            SELECT
                paciente_id,
                numero_historia,
                nombre,
                apellido,
                nombre || ' ' || apellido AS nombre_completo,
                documento_tipo,
                documento_numero,
                fecha_nacimiento,
                calc_edad(fecha_nacimiento) AS edad,
                genero,
                email,
                telefono_principal,
                activo
            FROM odo_pacientes
            WHERE empresa_id = p_empresa_id
              AND documento_tipo = p_documento_tipo
              AND documento_numero = p_documento_numero;

        p_status := 'SUCCESS';
        p_message := 'Búsqueda por documento completada';

    EXCEPTION
        WHEN OTHERS THEN
            p_status := 'ERROR';
            p_message := 'Error en búsqueda: ' || SQLERRM;
    END get_paciente_by_documento;

END PKG_PACIENTES;
/

-- ============================================================================
-- Verificar compilación
-- ============================================================================
SELECT object_name, object_type, status
FROM user_objects
WHERE object_name = 'PKG_PACIENTES';
