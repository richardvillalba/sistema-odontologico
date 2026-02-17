#!/usr/bin/env python3
"""
Deploy ORDS endpoints for Citas (appointments) and Doctores modules.

Endpoints created:
  GET  /api/v1/doctores                  - List doctors (users with DOCTOR role)
  GET  /api/v1/citas                     - List citas with filters (empresa_id, fecha, estado)
  GET  /api/v1/citas/:id                 - Get cita by ID
  POST /api/v1/citas                     - Create new cita
  PUT  /api/v1/citas/:id                 - Update cita
  PUT  /api/v1/citas/:id/estado          - Change cita status
  DELETE /api/v1/citas/:id               - Cancel cita
  GET  /api/v1/citas/agenda/:doctor_id   - Get agenda for a doctor on a date
"""
from connect_db import get_connection

_deployed_templates = set()


def deploy(cursor, module, pattern, method, source_type, source, desc):
    """Helper to deploy an ORDS endpoint, creating template only once per pattern."""
    if pattern not in _deployed_templates:
        cursor.execute("""
BEGIN
    ORDS.DEFINE_TEMPLATE(
        p_module_name => :module,
        p_pattern     => :pattern
    );
    COMMIT;
END;
""", {'module': module, 'pattern': pattern})
        _deployed_templates.add(pattern)

    cursor.execute("""
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name    => :module,
        p_pattern        => :pattern,
        p_method         => :method,
        p_source_type    => :source_type,
        p_source         => :source,
        p_items_per_page => 0
    );
    COMMIT;
END;
""", {
        'module': module,
        'pattern': pattern,
        'method': method,
        'source_type': source_type,
        'source': source,
    })
    print(f"  [OK] {method} /{module}/{pattern} - {desc}")


def deploy_doctores(cursor):
    print("\n--- Endpoints de Doctores ---")

    # GET /api/v1/doctores - List doctors (optionally filtered by empresa_id)
    deploy(cursor, 'odontologia', 'doctores', 'GET', 'plsql/block', """
DECLARE
    v_empresa_id NUMBER := :empresa_id;
BEGIN
    APEX_JSON.OPEN_OBJECT;
    APEX_JSON.OPEN_ARRAY('ITEMS');

    IF v_empresa_id IS NOT NULL THEN
        -- Doctors assigned to this empresa
        FOR doc IN (
            SELECT DISTINCT u.USUARIO_ID, u.NOMBRE, u.APELLIDO, u.EMAIL,
                   r.NOMBRE AS ROL, r.CODIGO AS ROL_CODIGO
            FROM ODO_USUARIOS u
            JOIN ODO_ROLES r ON u.ROL_ID = r.ROL_ID
            JOIN ODO_USUARIO_EMPRESAS ue ON ue.USUARIO_ID = u.USUARIO_ID
            WHERE r.CODIGO = 'DOCTOR'
              AND u.ACTIVO = 'S'
              AND ue.EMPRESA_ID = v_empresa_id
              AND ue.ACTIVO = 'S'
            ORDER BY u.APELLIDO, u.NOMBRE
        ) LOOP
            APEX_JSON.OPEN_OBJECT;
            APEX_JSON.WRITE('USUARIO_ID', doc.USUARIO_ID);
            APEX_JSON.WRITE('NOMBRE', doc.NOMBRE);
            APEX_JSON.WRITE('APELLIDO', doc.APELLIDO);
            APEX_JSON.WRITE('EMAIL', doc.EMAIL);
            APEX_JSON.WRITE('ROL', doc.ROL);
            APEX_JSON.WRITE('ROL_CODIGO', doc.ROL_CODIGO);
            APEX_JSON.CLOSE_OBJECT;
        END LOOP;
    ELSE
        -- All active doctors
        FOR doc IN (
            SELECT u.USUARIO_ID, u.NOMBRE, u.APELLIDO, u.EMAIL,
                   r.NOMBRE AS ROL, r.CODIGO AS ROL_CODIGO
            FROM ODO_USUARIOS u
            JOIN ODO_ROLES r ON u.ROL_ID = r.ROL_ID
            WHERE r.CODIGO = 'DOCTOR'
              AND u.ACTIVO = 'S'
            ORDER BY u.APELLIDO, u.NOMBRE
        ) LOOP
            APEX_JSON.OPEN_OBJECT;
            APEX_JSON.WRITE('USUARIO_ID', doc.USUARIO_ID);
            APEX_JSON.WRITE('NOMBRE', doc.NOMBRE);
            APEX_JSON.WRITE('APELLIDO', doc.APELLIDO);
            APEX_JSON.WRITE('EMAIL', doc.EMAIL);
            APEX_JSON.WRITE('ROL', doc.ROL);
            APEX_JSON.WRITE('ROL_CODIGO', doc.ROL_CODIGO);
            APEX_JSON.CLOSE_OBJECT;
        END LOOP;
    END IF;

    APEX_JSON.CLOSE_ARRAY;
    APEX_JSON.CLOSE_OBJECT;
END;
""", "Listar doctores")


def deploy_citas(cursor):
    print("\n--- Endpoints de Citas ---")

    # GET /api/v1/citas - List citas with filters
    deploy(cursor, 'odontologia', 'citas', 'GET', 'plsql/block', """
DECLARE
    v_empresa_id NUMBER := :empresa_id;
    v_fecha VARCHAR2(10) := :fecha;
    v_estado VARCHAR2(50) := :estado;
BEGIN
    APEX_JSON.OPEN_OBJECT;
    APEX_JSON.OPEN_ARRAY('ITEMS');

    FOR cita IN (
        SELECT c.CITA_ID, c.PACIENTE_ID,
               p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
               c.DOCTOR_ID,
               d.NOMBRE || ' ' || d.APELLIDO AS DOCTOR_NOMBRE,
               TO_CHAR(c.FECHA_HORA_INICIO, 'YYYY-MM-DD') AS FECHA,
               TO_CHAR(c.FECHA_HORA_INICIO, 'HH24:MI') AS HORA_INICIO,
               TO_CHAR(c.FECHA_HORA_FIN, 'HH24:MI') AS HORA_FIN,
               c.DURACION_MINUTOS,
               c.MOTIVO_CONSULTA,
               c.TIPO_CITA,
               c.ESTADO,
               c.CONSULTORIO,
               c.OBSERVACIONES,
               c.EMPRESA_ID,
               c.SUCURSAL_ID,
               TO_CHAR(c.FECHA_CREACION, 'YYYY-MM-DD HH24:MI') AS FECHA_CREACION
        FROM ODO_CITAS c
        JOIN ODO_PACIENTES p ON c.PACIENTE_ID = p.PACIENTE_ID
        LEFT JOIN ODO_USUARIOS d ON c.DOCTOR_ID = d.USUARIO_ID
        WHERE c.EMPRESA_ID = v_empresa_id
          AND (v_fecha IS NULL OR TO_CHAR(c.FECHA_HORA_INICIO, 'YYYY-MM-DD') = v_fecha)
          AND (v_estado IS NULL OR c.ESTADO = v_estado)
        ORDER BY c.FECHA_HORA_INICIO
    ) LOOP
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('CITA_ID', cita.CITA_ID);
        APEX_JSON.WRITE('PACIENTE_ID', cita.PACIENTE_ID);
        APEX_JSON.WRITE('PACIENTE_NOMBRE', cita.PACIENTE_NOMBRE);
        APEX_JSON.WRITE('DOCTOR_ID', cita.DOCTOR_ID);
        APEX_JSON.WRITE('DOCTOR_NOMBRE', cita.DOCTOR_NOMBRE);
        APEX_JSON.WRITE('FECHA', cita.FECHA);
        APEX_JSON.WRITE('HORA_INICIO', cita.HORA_INICIO);
        APEX_JSON.WRITE('HORA_FIN', cita.HORA_FIN);
        APEX_JSON.WRITE('DURACION_MINUTOS', cita.DURACION_MINUTOS);
        APEX_JSON.WRITE('MOTIVO_CONSULTA', cita.MOTIVO_CONSULTA);
        APEX_JSON.WRITE('TIPO_CITA', cita.TIPO_CITA);
        APEX_JSON.WRITE('ESTADO', cita.ESTADO);
        APEX_JSON.WRITE('CONSULTORIO', cita.CONSULTORIO);
        APEX_JSON.WRITE('OBSERVACIONES', cita.OBSERVACIONES);
        APEX_JSON.WRITE('EMPRESA_ID', cita.EMPRESA_ID);
        APEX_JSON.WRITE('SUCURSAL_ID', cita.SUCURSAL_ID);
        APEX_JSON.WRITE('FECHA_CREACION', cita.FECHA_CREACION);
        APEX_JSON.CLOSE_OBJECT;
    END LOOP;

    APEX_JSON.CLOSE_ARRAY;
    APEX_JSON.CLOSE_OBJECT;
END;
""", "Listar citas con filtros")

    # POST /api/v1/citas - Create new cita
    deploy(cursor, 'odontologia', 'citas', 'POST', 'plsql/block', """
DECLARE
    v_cita_id NUMBER;
    v_paciente_id NUMBER := :paciente_id;
    v_doctor_id NUMBER := :doctor_id;
    v_fecha VARCHAR2(10) := :fecha;
    v_hora_inicio VARCHAR2(5) := :hora_inicio;
    v_duracion NUMBER := NVL(:duracion_minutos, 30);
    v_motivo VARCHAR2(500) := :motivo_consulta;
    v_tipo VARCHAR2(50) := NVL(:tipo_cita, 'CONSULTA');
    v_notas CLOB := :notas;
    v_empresa_id NUMBER := :empresa_id;
    v_sucursal_id NUMBER := :sucursal_id;
    v_creado_por NUMBER := :creado_por;
    v_fecha_inicio TIMESTAMP WITH TIME ZONE;
    v_fecha_fin TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Build timestamps from date + time
    v_fecha_inicio := TO_TIMESTAMP_TZ(v_fecha || ' ' || v_hora_inicio, 'YYYY-MM-DD HH24:MI');
    v_fecha_fin := v_fecha_inicio + NUMTODSINTERVAL(v_duracion, 'MINUTE');

    INSERT INTO ODO_CITAS (
        PACIENTE_ID, DOCTOR_ID, FECHA_HORA_INICIO, FECHA_HORA_FIN,
        DURACION_MINUTOS, MOTIVO_CONSULTA, TIPO_CITA, ESTADO,
        OBSERVACIONES, EMPRESA_ID, SUCURSAL_ID, CREADO_POR, FECHA_CREACION
    ) VALUES (
        v_paciente_id, v_doctor_id, v_fecha_inicio, v_fecha_fin,
        v_duracion, v_motivo, v_tipo, 'PENDIENTE',
        v_notas, v_empresa_id, v_sucursal_id,
        NVL(v_creado_por, v_doctor_id), SYSTIMESTAMP
    ) RETURNING CITA_ID INTO v_cita_id;

    COMMIT;

    APEX_JSON.OPEN_OBJECT;
    APEX_JSON.WRITE('RESULTADO', 1);
    APEX_JSON.WRITE('MENSAJE', 'Cita creada exitosamente');
    APEX_JSON.WRITE('CITA_ID', v_cita_id);
    APEX_JSON.CLOSE_OBJECT;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('RESULTADO', 0);
        APEX_JSON.WRITE('MENSAJE', 'Error: ' || SQLERRM);
        APEX_JSON.CLOSE_OBJECT;
END;
""", "Crear nueva cita")

    # GET /api/v1/citas/:id - Get cita by ID
    deploy(cursor, 'odontologia', 'citas/:id', 'GET', 'plsql/block', """
DECLARE
    v_cita_id NUMBER := :id;
BEGIN
    APEX_JSON.OPEN_OBJECT;

    FOR cita IN (
        SELECT c.CITA_ID, c.PACIENTE_ID,
               p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
               p.DOCUMENTO_NUMERO,
               c.DOCTOR_ID,
               d.NOMBRE || ' ' || d.APELLIDO AS DOCTOR_NOMBRE,
               TO_CHAR(c.FECHA_HORA_INICIO, 'YYYY-MM-DD') AS FECHA,
               TO_CHAR(c.FECHA_HORA_INICIO, 'HH24:MI') AS HORA_INICIO,
               TO_CHAR(c.FECHA_HORA_FIN, 'HH24:MI') AS HORA_FIN,
               c.DURACION_MINUTOS,
               c.MOTIVO_CONSULTA,
               c.TIPO_CITA,
               c.ESTADO,
               c.CONSULTORIO,
               c.OBSERVACIONES,
               c.MOTIVO_CANCELACION,
               c.EMPRESA_ID,
               c.SUCURSAL_ID,
               TO_CHAR(c.FECHA_CREACION, 'YYYY-MM-DD HH24:MI') AS FECHA_CREACION
        FROM ODO_CITAS c
        JOIN ODO_PACIENTES p ON c.PACIENTE_ID = p.PACIENTE_ID
        LEFT JOIN ODO_USUARIOS d ON c.DOCTOR_ID = d.USUARIO_ID
        WHERE c.CITA_ID = v_cita_id
    ) LOOP
        APEX_JSON.WRITE('CITA_ID', cita.CITA_ID);
        APEX_JSON.WRITE('PACIENTE_ID', cita.PACIENTE_ID);
        APEX_JSON.WRITE('PACIENTE_NOMBRE', cita.PACIENTE_NOMBRE);
        APEX_JSON.WRITE('DOCUMENTO_NUMERO', cita.DOCUMENTO_NUMERO);
        APEX_JSON.WRITE('DOCTOR_ID', cita.DOCTOR_ID);
        APEX_JSON.WRITE('DOCTOR_NOMBRE', cita.DOCTOR_NOMBRE);
        APEX_JSON.WRITE('FECHA', cita.FECHA);
        APEX_JSON.WRITE('HORA_INICIO', cita.HORA_INICIO);
        APEX_JSON.WRITE('HORA_FIN', cita.HORA_FIN);
        APEX_JSON.WRITE('DURACION_MINUTOS', cita.DURACION_MINUTOS);
        APEX_JSON.WRITE('MOTIVO_CONSULTA', cita.MOTIVO_CONSULTA);
        APEX_JSON.WRITE('TIPO_CITA', cita.TIPO_CITA);
        APEX_JSON.WRITE('ESTADO', cita.ESTADO);
        APEX_JSON.WRITE('CONSULTORIO', cita.CONSULTORIO);
        APEX_JSON.WRITE('OBSERVACIONES', cita.OBSERVACIONES);
        APEX_JSON.WRITE('MOTIVO_CANCELACION', cita.MOTIVO_CANCELACION);
        APEX_JSON.WRITE('EMPRESA_ID', cita.EMPRESA_ID);
        APEX_JSON.WRITE('SUCURSAL_ID', cita.SUCURSAL_ID);
        APEX_JSON.WRITE('FECHA_CREACION', cita.FECHA_CREACION);
    END LOOP;

    APEX_JSON.CLOSE_OBJECT;
END;
""", "Obtener cita por ID")

    # PUT /api/v1/citas/:id - Update cita details
    deploy(cursor, 'odontologia', 'citas/:id', 'PUT', 'plsql/block', """
DECLARE
    v_cita_id NUMBER := :id;
    v_doctor_id NUMBER := :doctor_id;
    v_fecha VARCHAR2(10) := :fecha;
    v_hora_inicio VARCHAR2(5) := :hora_inicio;
    v_duracion NUMBER := :duracion_minutos;
    v_motivo VARCHAR2(500) := :motivo_consulta;
    v_notas CLOB := :notas;
    v_modificado_por NUMBER := :modificado_por;
    v_fecha_inicio TIMESTAMP WITH TIME ZONE;
    v_fecha_fin TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Build timestamps if date/time provided
    IF v_fecha IS NOT NULL AND v_hora_inicio IS NOT NULL THEN
        v_fecha_inicio := TO_TIMESTAMP_TZ(v_fecha || ' ' || v_hora_inicio, 'YYYY-MM-DD HH24:MI');
        IF v_duracion IS NOT NULL THEN
            v_fecha_fin := v_fecha_inicio + NUMTODSINTERVAL(v_duracion, 'MINUTE');
        END IF;
    END IF;

    UPDATE ODO_CITAS
    SET DOCTOR_ID = NVL(v_doctor_id, DOCTOR_ID),
        FECHA_HORA_INICIO = NVL(v_fecha_inicio, FECHA_HORA_INICIO),
        FECHA_HORA_FIN = NVL(v_fecha_fin, FECHA_HORA_FIN),
        DURACION_MINUTOS = NVL(v_duracion, DURACION_MINUTOS),
        MOTIVO_CONSULTA = NVL(v_motivo, MOTIVO_CONSULTA),
        OBSERVACIONES = NVL(v_notas, OBSERVACIONES),
        MODIFICADO_POR = v_modificado_por,
        FECHA_MODIFICACION = SYSTIMESTAMP
    WHERE CITA_ID = v_cita_id;

    IF SQL%ROWCOUNT > 0 THEN
        COMMIT;
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('RESULTADO', 1);
        APEX_JSON.WRITE('MENSAJE', 'Cita actualizada exitosamente');
        APEX_JSON.CLOSE_OBJECT;
    ELSE
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('RESULTADO', 0);
        APEX_JSON.WRITE('MENSAJE', 'Cita no encontrada');
        APEX_JSON.CLOSE_OBJECT;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('RESULTADO', 0);
        APEX_JSON.WRITE('MENSAJE', 'Error: ' || SQLERRM);
        APEX_JSON.CLOSE_OBJECT;
END;
""", "Actualizar datos de cita")

    # PUT /api/v1/citas/:id/estado - Change cita status
    deploy(cursor, 'odontologia', 'citas/:id/estado', 'PUT', 'plsql/block', """
DECLARE
    v_cita_id NUMBER := :id;
    v_estado VARCHAR2(50) := :estado;
    v_motivo VARCHAR2(500) := :motivo_cancelacion;
    v_modificado_por NUMBER := :modificado_por;
BEGIN
    IF v_estado = 'CANCELADA' THEN
        UPDATE ODO_CITAS
        SET ESTADO = v_estado,
            MOTIVO_CANCELACION = v_motivo,
            CANCELADO_POR = v_modificado_por,
            MODIFICADO_POR = v_modificado_por,
            FECHA_MODIFICACION = SYSTIMESTAMP
        WHERE CITA_ID = v_cita_id;
    ELSE
        UPDATE ODO_CITAS
        SET ESTADO = v_estado,
            MODIFICADO_POR = v_modificado_por,
            FECHA_MODIFICACION = SYSTIMESTAMP
        WHERE CITA_ID = v_cita_id;
    END IF;

    IF SQL%ROWCOUNT > 0 THEN
        COMMIT;
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('RESULTADO', 1);
        APEX_JSON.WRITE('MENSAJE', 'Estado actualizado a ' || v_estado);
        APEX_JSON.CLOSE_OBJECT;
    ELSE
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('RESULTADO', 0);
        APEX_JSON.WRITE('MENSAJE', 'Cita no encontrada');
        APEX_JSON.CLOSE_OBJECT;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('RESULTADO', 0);
        APEX_JSON.WRITE('MENSAJE', 'Error: ' || SQLERRM);
        APEX_JSON.CLOSE_OBJECT;
END;
""", "Cambiar estado de cita")

    # DELETE /api/v1/citas/:id - Cancel cita (soft delete)
    deploy(cursor, 'odontologia', 'citas/:id', 'DELETE', 'plsql/block', """
DECLARE
    v_cita_id NUMBER := :id;
    v_motivo VARCHAR2(500) := :motivo;
BEGIN
    UPDATE ODO_CITAS
    SET ESTADO = 'CANCELADA',
        MOTIVO_CANCELACION = v_motivo,
        FECHA_MODIFICACION = SYSTIMESTAMP
    WHERE CITA_ID = v_cita_id
      AND ESTADO NOT IN ('CANCELADA', 'COMPLETADA');

    IF SQL%ROWCOUNT > 0 THEN
        COMMIT;
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('RESULTADO', 1);
        APEX_JSON.WRITE('MENSAJE', 'Cita cancelada exitosamente');
        APEX_JSON.CLOSE_OBJECT;
    ELSE
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('RESULTADO', 0);
        APEX_JSON.WRITE('MENSAJE', 'Cita no encontrada o ya fue completada/cancelada');
        APEX_JSON.CLOSE_OBJECT;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('RESULTADO', 0);
        APEX_JSON.WRITE('MENSAJE', 'Error: ' || SQLERRM);
        APEX_JSON.CLOSE_OBJECT;
END;
""", "Cancelar cita")

    # GET /api/v1/citas/agenda/:doctor_id - Get doctor's agenda for a date
    deploy(cursor, 'odontologia', 'citas/agenda/:doctor_id', 'GET', 'plsql/block', """
DECLARE
    v_doctor_id NUMBER := :doctor_id;
    v_fecha VARCHAR2(10) := :fecha;
BEGIN
    APEX_JSON.OPEN_OBJECT;
    APEX_JSON.OPEN_ARRAY('ITEMS');

    FOR cita IN (
        SELECT c.CITA_ID, c.PACIENTE_ID,
               p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
               TO_CHAR(c.FECHA_HORA_INICIO, 'YYYY-MM-DD') AS FECHA,
               TO_CHAR(c.FECHA_HORA_INICIO, 'HH24:MI') AS HORA_INICIO,
               TO_CHAR(c.FECHA_HORA_FIN, 'HH24:MI') AS HORA_FIN,
               c.DURACION_MINUTOS,
               c.MOTIVO_CONSULTA,
               c.TIPO_CITA,
               c.ESTADO,
               c.CONSULTORIO,
               c.OBSERVACIONES
        FROM ODO_CITAS c
        JOIN ODO_PACIENTES p ON c.PACIENTE_ID = p.PACIENTE_ID
        WHERE c.DOCTOR_ID = v_doctor_id
          AND (v_fecha IS NULL OR TO_CHAR(c.FECHA_HORA_INICIO, 'YYYY-MM-DD') = v_fecha)
          AND c.ESTADO != 'CANCELADA'
        ORDER BY c.FECHA_HORA_INICIO
    ) LOOP
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('CITA_ID', cita.CITA_ID);
        APEX_JSON.WRITE('PACIENTE_ID', cita.PACIENTE_ID);
        APEX_JSON.WRITE('PACIENTE_NOMBRE', cita.PACIENTE_NOMBRE);
        APEX_JSON.WRITE('FECHA', cita.FECHA);
        APEX_JSON.WRITE('HORA_INICIO', cita.HORA_INICIO);
        APEX_JSON.WRITE('HORA_FIN', cita.HORA_FIN);
        APEX_JSON.WRITE('DURACION_MINUTOS', cita.DURACION_MINUTOS);
        APEX_JSON.WRITE('MOTIVO_CONSULTA', cita.MOTIVO_CONSULTA);
        APEX_JSON.WRITE('TIPO_CITA', cita.TIPO_CITA);
        APEX_JSON.WRITE('ESTADO', cita.ESTADO);
        APEX_JSON.WRITE('CONSULTORIO', cita.CONSULTORIO);
        APEX_JSON.WRITE('OBSERVACIONES', cita.OBSERVACIONES);
        APEX_JSON.CLOSE_OBJECT;
    END LOOP;

    APEX_JSON.CLOSE_ARRAY;
    APEX_JSON.CLOSE_OBJECT;
END;
""", "Agenda del doctor por fecha")


def main():
    print("=== Desplegando endpoints ORDS: Citas y Doctores ===")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        deploy_doctores(cursor)
        deploy_citas(cursor)

        conn.commit()
        print("\n=== Todos los endpoints desplegados exitosamente ===")

        # Verify
        print("\n--- Verificación ---")
        cursor.execute("""
            SELECT t.uri_template, h.source_type, h.method
            FROM user_ords_templates t
            JOIN user_ords_handlers h ON t.id = h.template_id
            JOIN user_ords_modules m ON t.module_id = m.id
            WHERE m.name = 'odontologia'
            ORDER BY t.uri_template, h.method
        """)
        for row in cursor.fetchall():
            print(f"  {row[2]:6s} /api/v1/{row[0]} ({row[1]})")

    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    main()
