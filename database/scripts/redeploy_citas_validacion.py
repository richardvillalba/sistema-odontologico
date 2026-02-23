#!/usr/bin/env python3
"""
Redeploy solo los endpoints POST /citas y PUT /citas/:id
con validacion de solapamiento de horario.
"""
from connect_db import get_connection


def deploy(cursor, module, pattern, method, source_type, source, desc):
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


def main():
    print("=== Redeploy: POST y PUT /citas con validacion de solapamiento ===")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # POST /citas - Con validacion de solapamiento
        deploy(cursor, 'odontologia', 'citas', 'POST', 'plsql/block', """
DECLARE
    v_cita_id NUMBER;
    v_paciente_id NUMBER := :paciente_id;
    v_doctor_id NUMBER := :doctor_id;
    v_fecha VARCHAR2(10) := :fecha;
    v_hora_inicio VARCHAR2(5) := :hora_inicio;
    v_duracion NUMBER := NVL(:duracion_minutos, 30);
    v_motivo VARCHAR2(500) := :motivo_consulta;
    v_tipo VARCHAR2(50) := NVL(:tipo_cita, 'CONSULTA_GENERAL');
    v_notas CLOB := :notas;
    v_empresa_id NUMBER := :empresa_id;
    v_sucursal_id NUMBER := :sucursal_id;
    v_creado_por NUMBER := :creado_por;
    v_fecha_inicio TIMESTAMP WITH TIME ZONE;
    v_fecha_fin TIMESTAMP WITH TIME ZONE;
    v_conflictos NUMBER;
    v_cita_info VARCHAR2(200);
BEGIN
    -- Build timestamps from date + time
    v_fecha_inicio := TO_TIMESTAMP_TZ(v_fecha || ' ' || v_hora_inicio, 'YYYY-MM-DD HH24:MI');
    v_fecha_fin := v_fecha_inicio + NUMTODSINTERVAL(v_duracion, 'MINUTE');

    -- Validar solapamiento de horario para el doctor
    IF v_doctor_id IS NOT NULL THEN
        SELECT COUNT(*),
               MIN(TO_CHAR(FECHA_HORA_INICIO, 'HH24:MI') || ' - ' || TO_CHAR(FECHA_HORA_FIN, 'HH24:MI'))
        INTO v_conflictos, v_cita_info
        FROM ODO_CITAS
        WHERE DOCTOR_ID = v_doctor_id
          AND ESTADO NOT IN ('CANCELADA', 'NO_ASISTIO')
          AND (
              -- Nueva cita empieza durante una existente
              (v_fecha_inicio >= FECHA_HORA_INICIO AND v_fecha_inicio < FECHA_HORA_FIN)
              OR
              -- Nueva cita termina durante una existente
              (v_fecha_fin > FECHA_HORA_INICIO AND v_fecha_fin <= FECHA_HORA_FIN)
              OR
              -- Nueva cita engloba completamente una existente
              (v_fecha_inicio <= FECHA_HORA_INICIO AND v_fecha_fin >= FECHA_HORA_FIN)
          );

        IF v_conflictos > 0 THEN
            APEX_JSON.OPEN_OBJECT;
            APEX_JSON.WRITE('RESULTADO', 0);
            APEX_JSON.WRITE('MENSAJE', 'El doctor ya tiene una cita en ese horario (' || v_cita_info || '). Por favor elija otro horario.');
            APEX_JSON.CLOSE_OBJECT;
            RETURN;
        END IF;
    END IF;

    INSERT INTO ODO_CITAS (
        PACIENTE_ID, DOCTOR_ID, FECHA_HORA_INICIO, FECHA_HORA_FIN,
        DURACION_MINUTOS, MOTIVO_CONSULTA, TIPO_CITA, ESTADO,
        OBSERVACIONES, EMPRESA_ID, SUCURSAL_ID, CREADO_POR, FECHA_CREACION
    ) VALUES (
        v_paciente_id, v_doctor_id, v_fecha_inicio, v_fecha_fin,
        v_duracion, v_motivo, v_tipo, 'PROGRAMADA',
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
""", "Crear cita con validacion solapamiento")

        # PUT /citas/:id - Con validacion de solapamiento (excluyendo la cita actual)
        deploy(cursor, 'odontologia', 'citas/:id', 'PUT', 'plsql/block', """
DECLARE
    v_cita_id NUMBER := :id;
    v_doctor_id NUMBER := :doctor_id;
    v_fecha VARCHAR2(10) := :fecha;
    v_hora_inicio VARCHAR2(5) := :hora_inicio;
    v_duracion NUMBER := :duracion_minutos;
    v_motivo VARCHAR2(500) := :motivo_consulta;
    v_tipo VARCHAR2(50) := :tipo_cita;
    v_notas CLOB := :notas;
    v_modificado_por NUMBER := :modificado_por;
    v_fecha_inicio TIMESTAMP WITH TIME ZONE;
    v_fecha_fin TIMESTAMP WITH TIME ZONE;
    v_doctor_final NUMBER;
    v_duracion_final NUMBER;
    v_conflictos NUMBER;
    v_cita_info VARCHAR2(200);
BEGIN
    -- Build timestamps if date/time provided
    IF v_fecha IS NOT NULL AND v_hora_inicio IS NOT NULL THEN
        v_fecha_inicio := TO_TIMESTAMP_TZ(v_fecha || ' ' || v_hora_inicio, 'YYYY-MM-DD HH24:MI');
        IF v_duracion IS NOT NULL THEN
            v_fecha_fin := v_fecha_inicio + NUMTODSINTERVAL(v_duracion, 'MINUTE');
        ELSE
            -- Usar duracion existente de la cita
            SELECT DURACION_MINUTOS INTO v_duracion_final
            FROM ODO_CITAS WHERE CITA_ID = v_cita_id;
            v_fecha_fin := v_fecha_inicio + NUMTODSINTERVAL(v_duracion_final, 'MINUTE');
        END IF;
    END IF;

    -- Validar solapamiento si se esta cambiando horario o doctor
    IF v_fecha_inicio IS NOT NULL THEN
        -- Usar doctor nuevo si se proporciona, sino el actual
        SELECT NVL(v_doctor_id, DOCTOR_ID) INTO v_doctor_final
        FROM ODO_CITAS WHERE CITA_ID = v_cita_id;

        IF v_doctor_final IS NOT NULL THEN
            SELECT COUNT(*),
                   MIN(TO_CHAR(FECHA_HORA_INICIO, 'HH24:MI') || ' - ' || TO_CHAR(FECHA_HORA_FIN, 'HH24:MI'))
            INTO v_conflictos, v_cita_info
            FROM ODO_CITAS
            WHERE DOCTOR_ID = v_doctor_final
              AND CITA_ID != v_cita_id
              AND ESTADO NOT IN ('CANCELADA', 'NO_ASISTIO')
              AND (
                  (v_fecha_inicio >= FECHA_HORA_INICIO AND v_fecha_inicio < FECHA_HORA_FIN)
                  OR (v_fecha_fin > FECHA_HORA_INICIO AND v_fecha_fin <= FECHA_HORA_FIN)
                  OR (v_fecha_inicio <= FECHA_HORA_INICIO AND v_fecha_fin >= FECHA_HORA_FIN)
              );

            IF v_conflictos > 0 THEN
                APEX_JSON.OPEN_OBJECT;
                APEX_JSON.WRITE('RESULTADO', 0);
                APEX_JSON.WRITE('MENSAJE', 'El doctor ya tiene una cita en ese horario (' || v_cita_info || '). Por favor elija otro horario.');
                APEX_JSON.CLOSE_OBJECT;
                RETURN;
            END IF;
        END IF;
    END IF;

    UPDATE ODO_CITAS
    SET DOCTOR_ID = NVL(v_doctor_id, DOCTOR_ID),
        FECHA_HORA_INICIO = NVL(v_fecha_inicio, FECHA_HORA_INICIO),
        FECHA_HORA_FIN = NVL(v_fecha_fin, FECHA_HORA_FIN),
        DURACION_MINUTOS = NVL(v_duracion, DURACION_MINUTOS),
        TIPO_CITA = NVL(v_tipo, TIPO_CITA),
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
""", "Actualizar cita con validacion solapamiento")

        conn.commit()
        print("\n=== Redeploy completado exitosamente ===")
        print("\nValidaciones activas:")
        print("  - POST /citas: bloquea solapamiento de horario por doctor")
        print("  - PUT  /citas/:id: bloquea solapamiento al editar (excluye la cita actual)")
        print("  - Estado inicial: PROGRAMADA (no PENDIENTE)")
        print("  - Tipo default: CONSULTA_GENERAL (no CONSULTA)")

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
