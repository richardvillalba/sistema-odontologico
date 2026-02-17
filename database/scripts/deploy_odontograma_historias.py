#!/usr/bin/env python3
"""
Deploy/fix ORDS endpoints for Odontograma and Historias modules.

Fixes:
  - Odontograma endpoints missing from v1 module (404)
  - PKG_HISTORIAS_CLINICAS invalid (555)

Endpoints deployed:
  GET  /api/v1/odontograma/paciente/:id             - Get odontograma actual
  POST /api/v1/odontograma                          - Create odontograma
  POST /api/v1/odontograma/hallazgo                 - Register hallazgo
  PUT  /api/v1/odontograma/:id/diente               - Update diente
  GET  /api/v1/odontograma/diente/:id/hallazgos     - Get hallazgos de diente
  GET  /api/v1/odontograma/tratamientos/paciente/:id - Get tratamientos paciente
  GET  /api/v1/odontograma/diente/:id/tratamientos  - Get tratamientos de diente
  POST /api/v1/odontograma/diente/:id/tratamiento   - Assign tratamiento a diente
  DELETE /api/v1/odontograma/tratamiento/:id         - Delete tratamiento
  GET  /api/v1/odontograma/paciente/:id/hallazgos-all - Get all hallazgos
  GET  /api/v1/tratamientos/sugeridos/:tipo          - Get tratamientos sugeridos
  GET  /api/v1/historias/paciente/:id                - Get historias de paciente
  POST /api/v1/historias                             - Create historia clinica
  GET  /api/v1/historias/:id                         - Get historia by ID
  PUT  /api/v1/historias/:id                         - Update historia
  GET  /api/v1/historias/:id/prescripciones          - Get prescripciones
  POST /api/v1/historias/:id/prescripciones          - Add prescripcion
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


def fix_packages(cursor):
    """Recompile invalid packages."""
    print("\n--- Recompiling packages ---")

    # Check which packages are invalid
    cursor.execute("""
        SELECT object_name, object_type, status
        FROM user_objects
        WHERE object_type IN ('PACKAGE', 'PACKAGE BODY')
          AND object_name IN ('PKG_HISTORIAS_CLINICAS', 'PKG_ODONTOGRAMA')
        ORDER BY object_name, object_type
    """)
    rows = cursor.fetchall()
    for name, otype, status in rows:
        print(f"  {name} ({otype}): {status}")

    # Recompile
    for pkg in ['PKG_HISTORIAS_CLINICAS', 'PKG_ODONTOGRAMA']:
        try:
            cursor.execute(f"ALTER PACKAGE {pkg} COMPILE")
            print(f"  [OK] {pkg} spec compiled")
        except Exception as e:
            print(f"  [WARN] {pkg} spec: {e}")
        try:
            cursor.execute(f"ALTER PACKAGE {pkg} COMPILE BODY")
            print(f"  [OK] {pkg} body compiled")
        except Exception as e:
            print(f"  [WARN] {pkg} body: {e}")

    # Check status after recompile
    cursor.execute("""
        SELECT object_name, object_type, status
        FROM user_objects
        WHERE object_type IN ('PACKAGE', 'PACKAGE BODY')
          AND object_name IN ('PKG_HISTORIAS_CLINICAS', 'PKG_ODONTOGRAMA')
        ORDER BY object_name, object_type
    """)
    rows = cursor.fetchall()
    print("\n  After recompile:")
    all_valid = True
    for name, otype, status in rows:
        flag = "OK" if status == 'VALID' else "FAIL"
        print(f"  [{flag}] {name} ({otype}): {status}")
        if status != 'VALID':
            all_valid = False

    return all_valid


def deploy_odontograma(cursor):
    """Deploy all odontograma ORDS endpoints."""
    print("\n--- Endpoints de Odontograma ---")

    # GET odontograma/paciente/:id - Get current odontograma for patient
    deploy(cursor, 'odontologia', 'odontograma/paciente/:id', 'GET', 'json/query', """
SELECT o.ODONTOGRAMA_ID, o.PACIENTE_ID,
       p.NOMBRE || ' ' || p.APELLIDO AS PACIENTE_NOMBRE,
       p.NUMERO_HISTORIA, o.TIPO, o.OBSERVACIONES AS ODONTOGRAMA_OBS,
       o.FECHA_CREACION, o.FECHA_MODIFICACION,
       d.DIENTE_ID, d.NUMERO_FDI, d.TIPO_DIENTE, d.ESTADO,
       d.CUADRANTE, d.POSICION,
       d.OBSERVACIONES AS DIENTE_OBS,
       d.FECHA_CREACION AS DIENTE_FECHA_CREACION,
       d.FECHA_MODIFICACION AS DIENTE_FECHA_MODIFICACION
FROM ODO_ODONTOGRAMAS o
JOIN ODO_PACIENTES p ON o.PACIENTE_ID = p.PACIENTE_ID
JOIN ODO_DIENTES d ON o.ODONTOGRAMA_ID = d.ODONTOGRAMA_ID
WHERE o.ODONTOGRAMA_ID = (
    SELECT ODONTOGRAMA_ID FROM ODO_ODONTOGRAMAS
    WHERE PACIENTE_ID = :id AND ACTIVO = 'S'
    ORDER BY FECHA_CREACION DESC FETCH FIRST 1 ROW ONLY
)
AND d.ACTIVO = 'S'
ORDER BY d.CUADRANTE, d.POSICION
""", "Get odontograma actual del paciente")

    # POST odontograma - Create new odontograma
    deploy(cursor, 'odontologia', 'odontograma', 'POST', 'plsql/block', """
DECLARE
    v_status NUMBER;
    v_msg VARCHAR2(4000);
    v_id NUMBER;
BEGIN
    PKG_ODONTOGRAMA.crear_odontograma(
        p_paciente_id    => :paciente_id,
        p_empresa_id     => :empresa_id,
        p_tipo           => :tipo,
        p_creado_por     => :creado_por,
        p_odontograma_id => v_id,
        p_resultado      => v_status,
        p_mensaje        => v_msg
    );
    APEX_JSON.open_object;
    APEX_JSON.write('success', v_status = 1);
    APEX_JSON.write('message', v_msg);
    APEX_JSON.write('odontograma_id', v_id);
    APEX_JSON.close_object;
EXCEPTION
    WHEN OTHERS THEN
        APEX_JSON.open_object;
        APEX_JSON.write('success', FALSE);
        APEX_JSON.write('message', SQLERRM);
        APEX_JSON.close_object;
END;
""", "Crear odontograma")

    # POST odontograma/hallazgo - Register hallazgo
    deploy(cursor, 'odontologia', 'odontograma/hallazgo', 'POST', 'plsql/block', """
DECLARE
    v_status NUMBER;
    v_msg VARCHAR2(4000);
BEGIN
    PKG_ODONTOGRAMA.registrar_hallazgo(
        p_diente_id     => :diente_id,
        p_tipo_hallazgo => :tipo_hallazgo,
        p_descripcion   => :descripcion,
        p_doctor_id     => :doctor_id,
        p_hallazgo_id   => :hallazgo_id,
        p_resultado     => v_status,
        p_mensaje       => v_msg
    );
    APEX_JSON.open_object;
    APEX_JSON.write('success', v_status = 1);
    APEX_JSON.write('message', v_msg);
    APEX_JSON.close_object;
EXCEPTION
    WHEN OTHERS THEN
        APEX_JSON.open_object;
        APEX_JSON.write('success', FALSE);
        APEX_JSON.write('message', SQLERRM);
        APEX_JSON.close_object;
END;
""", "Registrar hallazgo")

    # PUT odontograma/:id/diente - Update tooth
    deploy(cursor, 'odontologia', 'odontograma/:id/diente', 'PUT', 'plsql/block', """
DECLARE
    v_status NUMBER;
    v_msg VARCHAR2(4000);
BEGIN
    PKG_ODONTOGRAMA.actualizar_diente(
        p_odontograma_id => :id,
        p_numero_fdi     => :numero_fdi,
        p_estado         => :estado,
        p_observaciones  => :observaciones,
        p_modificado_por => :modificado_por,
        p_resultado      => v_status,
        p_mensaje        => v_msg
    );
    APEX_JSON.open_object;
    APEX_JSON.write('success', v_status = 1);
    APEX_JSON.write('message', v_msg);
    APEX_JSON.close_object;
EXCEPTION
    WHEN OTHERS THEN
        APEX_JSON.open_object;
        APEX_JSON.write('success', FALSE);
        APEX_JSON.write('message', SQLERRM);
        APEX_JSON.close_object;
END;
""", "Actualizar diente")

    # PUT odontograma/:id/dientes - Bulk update teeth
    deploy(cursor, 'odontologia', 'odontograma/:id/dientes', 'PUT', 'plsql/block', """
DECLARE
    v_status NUMBER;
    v_msg VARCHAR2(4000);
BEGIN
    -- Update single tooth by numero_fdi within the odontograma
    UPDATE ODO_DIENTES
    SET ESTADO = :estado,
        OBSERVACIONES = NVL(:observaciones, OBSERVACIONES),
        FECHA_MODIFICACION = SYSTIMESTAMP
    WHERE ODONTOGRAMA_ID = :id
      AND NUMERO_FDI = :numero_fdi
      AND ACTIVO = 'S';

    IF SQL%ROWCOUNT > 0 THEN
        APEX_JSON.open_object;
        APEX_JSON.write('success', TRUE);
        APEX_JSON.write('message', 'Diente actualizado');
        APEX_JSON.close_object;
    ELSE
        APEX_JSON.open_object;
        APEX_JSON.write('success', FALSE);
        APEX_JSON.write('message', 'Diente no encontrado');
        APEX_JSON.close_object;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        APEX_JSON.open_object;
        APEX_JSON.write('success', FALSE);
        APEX_JSON.write('message', SQLERRM);
        APEX_JSON.close_object;
END;
""", "Actualizar dientes (bulk)")

    # GET odontograma/diente/:id/hallazgos - Get hallazgos for a tooth
    deploy(cursor, 'odontologia', 'odontograma/diente/:id/hallazgos', 'GET', 'json/query', """
SELECT h.HALLAZGO_ID, h.DIENTE_ID, h.TIPO_HALLAZGO, h.DESCRIPCION,
       h.FECHA_DETECCION, h.ACTIVO,
       u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE
FROM ODO_HALLAZGOS h
LEFT JOIN ODO_USUARIOS u ON h.DOCTOR_ID = u.USUARIO_ID
WHERE h.DIENTE_ID = :id
ORDER BY h.FECHA_DETECCION DESC
""", "Get hallazgos de un diente")

    # GET odontograma/paciente/:id/hallazgos-all - Get all hallazgos for patient
    deploy(cursor, 'odontologia', 'odontograma/paciente/:id/hallazgos-all', 'GET', 'json/query', """
SELECT h.HALLAZGO_ID, h.DIENTE_ID, d.NUMERO_FDI, h.TIPO_HALLAZGO,
       h.DESCRIPCION, h.FECHA_DETECCION, h.ACTIVO,
       u.NOMBRE || ' ' || u.APELLIDO AS DOCTOR_NOMBRE
FROM ODO_HALLAZGOS h
JOIN ODO_DIENTES d ON h.DIENTE_ID = d.DIENTE_ID
JOIN ODO_ODONTOGRAMAS o ON d.ODONTOGRAMA_ID = o.ODONTOGRAMA_ID
LEFT JOIN ODO_USUARIOS u ON h.DOCTOR_ID = u.USUARIO_ID
WHERE o.PACIENTE_ID = :id
ORDER BY h.FECHA_DETECCION DESC
""", "Get todos los hallazgos del paciente")

    # GET odontograma/tratamientos/paciente/:id - Get tratamientos for patient
    deploy(cursor, 'odontologia', 'odontograma/tratamientos/paciente/:id', 'GET', 'json/query', """
SELECT td.TRATAMIENTO_DIENTE_ID as ID,
       td.DIENTE_ID, d.NUMERO_FDI,
       td.TIPO_TRATAMIENTO, td.TIPO_TRATAMIENTO as NOMBRE,
       td.DESCRIPCION, td.COSTO,
       'PENDIENTE' as ESTADO,
       td.FECHA_TRATAMIENTO as FECHA_ASIGNACION,
       u.NOMBRE || ' ' || u.APELLIDO as DOCTOR_NOMBRE
FROM ODO_TRATAMIENTOS_DIENTE td
JOIN ODO_DIENTES d ON td.DIENTE_ID = d.DIENTE_ID
JOIN ODO_ODONTOGRAMAS o ON d.ODONTOGRAMA_ID = o.ODONTOGRAMA_ID
LEFT JOIN ODO_USUARIOS u ON td.DOCTOR_ID = u.USUARIO_ID
WHERE o.PACIENTE_ID = :id
ORDER BY td.FECHA_TRATAMIENTO DESC
""", "Get tratamientos del paciente")

    # GET odontograma/diente/:id/tratamientos - Get tratamientos for a tooth
    deploy(cursor, 'odontologia', 'odontograma/diente/:id/tratamientos', 'GET', 'json/query', """
SELECT td.TRATAMIENTO_DIENTE_ID as ID,
       td.TIPO_TRATAMIENTO, td.TIPO_TRATAMIENTO as NOMBRE,
       td.DESCRIPCION, td.COSTO,
       'PENDIENTE' as ESTADO,
       td.FECHA_TRATAMIENTO as FECHA_ASIGNACION,
       u.NOMBRE || ' ' || u.APELLIDO as DOCTOR_NOMBRE
FROM ODO_TRATAMIENTOS_DIENTE td
LEFT JOIN ODO_USUARIOS u ON td.DOCTOR_ID = u.USUARIO_ID
WHERE td.DIENTE_ID = :id
ORDER BY td.FECHA_TRATAMIENTO DESC
""", "Get tratamientos de un diente")

    # POST odontograma/diente/:id/tratamiento - Assign treatment to tooth
    deploy(cursor, 'odontologia', 'odontograma/diente/:id/tratamiento', 'POST', 'plsql/block', """
DECLARE
    v_id NUMBER;
    v_nombre VARCHAR2(200);
    v_costo NUMBER;
BEGIN
    SELECT NOMBRE, PRECIO_BASE INTO v_nombre, v_costo
    FROM ODO_CATALOGOS_TRATAMIENTOS WHERE CATALOGO_ID = :catalogo_id;

    INSERT INTO ODO_TRATAMIENTOS_DIENTE (
        DIENTE_ID, TIPO_TRATAMIENTO, DESCRIPCION, COSTO, DOCTOR_ID, FECHA_TRATAMIENTO
    ) VALUES (
        :id, v_nombre, 'Tratamiento asignado desde odontograma - Cat:' || :catalogo_id,
        v_costo, NVL(:doctor_id, 1), SYSTIMESTAMP
    ) RETURNING TRATAMIENTO_DIENTE_ID INTO v_id;

    APEX_JSON.open_object;
    APEX_JSON.write('success', TRUE);
    APEX_JSON.write('tratamiento_id', v_id);
    APEX_JSON.write('message', 'Tratamiento asignado correctamente');
    APEX_JSON.close_object;
EXCEPTION
    WHEN OTHERS THEN
        APEX_JSON.open_object;
        APEX_JSON.write('success', FALSE);
        APEX_JSON.write('message', SQLERRM);
        APEX_JSON.close_object;
END;
""", "Asignar tratamiento a diente")

    # DELETE odontograma/tratamiento/:id - Delete treatment
    deploy(cursor, 'odontologia', 'odontograma/tratamiento/:id', 'DELETE', 'plsql/block', """
BEGIN
    DELETE FROM ODO_TRATAMIENTOS_DIENTE
    WHERE TRATAMIENTO_DIENTE_ID = :id;

    APEX_JSON.open_object;
    APEX_JSON.write('success', SQL%ROWCOUNT > 0);
    APEX_JSON.write('message', CASE WHEN SQL%ROWCOUNT > 0
        THEN 'Tratamiento eliminado' ELSE 'Tratamiento no encontrado' END);
    APEX_JSON.close_object;
END;
""", "Eliminar tratamiento de diente")

    # GET tratamientos/sugeridos/:tipo - Suggested treatments by hallazgo type
    deploy(cursor, 'odontologia', 'tratamientos/sugeridos/:tipo', 'GET', 'json/query', """
SELECT CATALOGO_ID as ID, CODIGO, NOMBRE, DESCRIPCION, CATEGORIA,
       PRECIO_BASE as COSTO_BASE, DURACION_ESTIMADA
FROM ODO_CATALOGOS_TRATAMIENTOS
WHERE ACTIVO = 'S'
  AND CATEGORIA = CASE :tipo
      WHEN 'CARIES' THEN 'OPERATORIA'
      WHEN 'FRACTURA' THEN 'OPERATORIA'
      WHEN 'FRACTURADO' THEN 'OPERATORIA'
      WHEN 'ENDODONCIA' THEN 'ENDODONCIA'
      WHEN 'PERIODONTITIS' THEN 'PERIODONCIA'
      WHEN 'GINGIVITIS' THEN 'PERIODONCIA'
      WHEN 'EXTRACCION_INDICADA' THEN 'CIRUGIA'
      WHEN 'AUSENTE' THEN 'PROTESIS'
      WHEN 'IMPLANTE' THEN 'PROTESIS'
      WHEN 'CORONA' THEN 'PROTESIS'
      WHEN 'PROTESIS' THEN 'PROTESIS'
      ELSE CATEGORIA END
ORDER BY NOMBRE
""", "Tratamientos sugeridos por tipo hallazgo")


def deploy_historias(cursor, packages_valid):
    """Deploy historias ORDS endpoints."""
    print("\n--- Endpoints de Historias ---")

    if packages_valid:
        # Use PKG_HISTORIAS_CLINICAS (more robust)
        print("  Using PKG_HISTORIAS_CLINICAS (packages valid)")

        deploy(cursor, 'odontologia', 'historias/paciente/:id', 'GET', 'plsql/block', """
DECLARE
    v_cursor SYS_REFCURSOR;
    v_res    NUMBER;
    v_msg    VARCHAR2(4000);
BEGIN
    PKG_HISTORIAS_CLINICAS.get_historias_paciente(
        p_empresa_id    => :empresa_id,
        p_paciente_id   => :id,
        p_fecha_desde   => NULL,
        p_fecha_hasta   => NULL,
        p_cursor        => v_cursor,
        p_resultado     => v_res,
        p_mensaje       => v_msg
    );

    APEX_JSON.open_object;
    APEX_JSON.write('success', v_res = 1);
    APEX_JSON.write('message', v_msg);
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
END;
""", "Get historias del paciente (PKG)")

        deploy(cursor, 'odontologia', 'historias/:id', 'GET', 'plsql/block', """
DECLARE
    v_cursor SYS_REFCURSOR;
    v_res    NUMBER;
    v_msg    VARCHAR2(4000);
BEGIN
    PKG_HISTORIAS_CLINICAS.get_historia(
        p_empresa_id  => :empresa_id,
        p_historia_id => :id,
        p_cursor      => v_cursor,
        p_resultado   => v_res,
        p_mensaje     => v_msg
    );

    APEX_JSON.open_object;
    APEX_JSON.write('success', v_res = 1);
    APEX_JSON.write('message', v_msg);
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
END;
""", "Get historia por ID (PKG)")

        deploy(cursor, 'odontologia', 'historias/:id/prescripciones', 'GET', 'plsql/block', """
DECLARE
    v_cursor SYS_REFCURSOR;
    v_res    NUMBER;
    v_msg    VARCHAR2(4000);
BEGIN
    PKG_HISTORIAS_CLINICAS.get_prescripciones_historia(
        p_empresa_id  => :empresa_id,
        p_historia_id => :id,
        p_cursor      => v_cursor,
        p_resultado   => v_res,
        p_mensaje     => v_msg
    );

    APEX_JSON.open_object;
    APEX_JSON.write('success', v_res = 1);
    APEX_JSON.write('message', v_msg);
    APEX_JSON.write('items', v_cursor);
    APEX_JSON.close_object;
END;
""", "Get prescripciones de historia (PKG)")

        deploy(cursor, 'odontologia', 'historias/:id/prescripciones', 'POST', 'plsql/block', """
DECLARE
    v_prescripcion_id NUMBER;
    v_res             NUMBER;
    v_msg             VARCHAR2(4000);
BEGIN
    PKG_HISTORIAS_CLINICAS.insert_prescripcion(
        p_empresa_id         => :empresa_id,
        p_historia_id        => :id,
        p_paciente_id        => :paciente_id,
        p_doctor_id          => :doctor_id,
        p_medicamento        => :medicamento,
        p_principio_activo   => :principio_activo,
        p_presentacion       => :presentacion,
        p_concentracion      => :concentracion,
        p_dosis              => :dosis,
        p_via_administracion => :via_administracion,
        p_duracion_dias      => :duracion_dias,
        p_indicaciones       => :indicaciones,
        p_prescripcion_id    => v_prescripcion_id,
        p_resultado          => v_res,
        p_mensaje            => v_msg
    );

    APEX_JSON.open_object;
    APEX_JSON.write('success', v_res = 1);
    APEX_JSON.write('message', v_msg);
    APEX_JSON.write('prescripcion_id', v_prescripcion_id);
    APEX_JSON.close_object;
END;
""", "Agregar prescripcion (PKG)")

    else:
        # Fallback: use direct SQL queries
        print("  WARNING: PKG invalid, using direct SQL fallback")

        deploy(cursor, 'odontologia', 'historias/paciente/:id', 'GET', 'json/query', """
SELECT h.HISTORIA_ID, h.PACIENTE_ID, h.DOCTOR_ID,
       u.NOMBRE || ' ' || u.APELLIDO as DOCTOR_NOMBRE,
       h.FECHA_CONSULTA, h.MOTIVO_CONSULTA, h.ANAMNESIS,
       h.EXAMEN_CLINICO, h.DIAGNOSTICO, h.CODIGO_CIE10,
       h.PLAN_TRATAMIENTO, h.PRESION_ARTERIAL, h.FRECUENCIA_CARDIACA,
       h.TEMPERATURA, h.PROXIMA_CITA, h.OBSERVACIONES, h.EMPRESA_ID
FROM ODO_HISTORIAS_CLINICAS h
LEFT JOIN ODO_USUARIOS u ON h.DOCTOR_ID = u.USUARIO_ID
WHERE h.PACIENTE_ID = :id
  AND (h.EMPRESA_ID = :empresa_id OR :empresa_id IS NULL)
ORDER BY h.FECHA_CONSULTA DESC
""", "Get historias del paciente (SQL fallback)")

        deploy(cursor, 'odontologia', 'historias/:id', 'GET', 'json/query', """
SELECT h.HISTORIA_ID, h.PACIENTE_ID, h.DOCTOR_ID,
       u.NOMBRE || ' ' || u.APELLIDO as DOCTOR_NOMBRE,
       h.FECHA_CONSULTA, h.MOTIVO_CONSULTA, h.ANAMNESIS,
       h.EXAMEN_CLINICO, h.DIAGNOSTICO, h.CODIGO_CIE10,
       h.PLAN_TRATAMIENTO, h.PRESION_ARTERIAL, h.FRECUENCIA_CARDIACA,
       h.TEMPERATURA, h.PROXIMA_CITA, h.OBSERVACIONES, h.EMPRESA_ID
FROM ODO_HISTORIAS_CLINICAS h
LEFT JOIN ODO_USUARIOS u ON h.DOCTOR_ID = u.USUARIO_ID
WHERE h.HISTORIA_ID = :id
""", "Get historia por ID (SQL fallback)")

        deploy(cursor, 'odontologia', 'historias/:id/prescripciones', 'GET', 'json/query', """
SELECT p.PRESCRIPCION_ID, p.HISTORIA_ID, p.PACIENTE_ID, p.DOCTOR_ID,
       p.MEDICAMENTO, p.PRINCIPIO_ACTIVO, p.PRESENTACION, p.CONCENTRACION,
       p.DOSIS, p.VIA_ADMINISTRACION, p.DURACION_DIAS, p.INDICACIONES,
       p.FECHA_PRESCRIPCION
FROM ODO_PRESCRIPCIONES p
WHERE p.HISTORIA_ID = :id
ORDER BY p.FECHA_PRESCRIPCION DESC
""", "Get prescripciones (SQL fallback)")

        deploy(cursor, 'odontologia', 'historias/:id/prescripciones', 'POST', 'plsql/block', """
DECLARE
    v_id NUMBER;
BEGIN
    INSERT INTO ODO_PRESCRIPCIONES (
        HISTORIA_ID, PACIENTE_ID, DOCTOR_ID,
        MEDICAMENTO, PRINCIPIO_ACTIVO, PRESENTACION, CONCENTRACION,
        DOSIS, VIA_ADMINISTRACION, DURACION_DIAS, INDICACIONES,
        EMPRESA_ID, FECHA_PRESCRIPCION
    ) VALUES (
        :id, :paciente_id, :doctor_id,
        :medicamento, :principio_activo, :presentacion, :concentracion,
        :dosis, :via_administracion, :duracion_dias, :indicaciones,
        :empresa_id, SYSTIMESTAMP
    ) RETURNING PRESCRIPCION_ID INTO v_id;

    APEX_JSON.open_object;
    APEX_JSON.write('success', TRUE);
    APEX_JSON.write('prescripcion_id', v_id);
    APEX_JSON.write('message', 'Prescripcion agregada');
    APEX_JSON.close_object;
EXCEPTION
    WHEN OTHERS THEN
        APEX_JSON.open_object;
        APEX_JSON.write('success', FALSE);
        APEX_JSON.write('message', SQLERRM);
        APEX_JSON.close_object;
END;
""", "Agregar prescripcion (SQL fallback)")

    # POST historias - Always use direct SQL (simpler, more reliable)
    deploy(cursor, 'odontologia', 'historias', 'POST', 'plsql/block', """
DECLARE
    v_id NUMBER;
BEGIN
    INSERT INTO ODO_HISTORIAS_CLINICAS (
        PACIENTE_ID, DOCTOR_ID, FECHA_CONSULTA, MOTIVO_CONSULTA,
        ANAMNESIS, EXAMEN_CLINICO, DIAGNOSTICO, CODIGO_CIE10,
        PLAN_TRATAMIENTO, PRESION_ARTERIAL, FRECUENCIA_CARDIACA,
        TEMPERATURA, PROXIMA_CITA, OBSERVACIONES, EMPRESA_ID
    ) VALUES (
        :paciente_id, NVL(:doctor_id, 1),
        NVL(TO_TIMESTAMP(:fecha_consulta, 'YYYY-MM-DD"T"HH24:MI:SS'), SYSTIMESTAMP),
        :motivo_consulta, :anamnesis, :examen_clinico, :diagnostico,
        :codigo_cie10, :plan_tratamiento, :presion_arterial,
        :frecuencia_cardiaca, :temperatura,
        TO_DATE(:proxima_cita, 'YYYY-MM-DD'), :observaciones, NVL(:empresa_id, 1)
    ) RETURNING HISTORIA_ID INTO v_id;

    APEX_JSON.open_object;
    APEX_JSON.write('success', TRUE);
    APEX_JSON.write('historia_id', v_id);
    APEX_JSON.write('message', 'Historia clinica creada correctamente');
    APEX_JSON.close_object;
EXCEPTION
    WHEN OTHERS THEN
        APEX_JSON.open_object;
        APEX_JSON.write('success', FALSE);
        APEX_JSON.write('message', SQLERRM);
        APEX_JSON.close_object;
END;
""", "Crear historia clinica")

    # PUT historias/:id - Update historia
    deploy(cursor, 'odontologia', 'historias/:id', 'PUT', 'plsql/block', """
BEGIN
    UPDATE ODO_HISTORIAS_CLINICAS
    SET MOTIVO_CONSULTA     = NVL(:motivo_consulta, MOTIVO_CONSULTA),
        ANAMNESIS           = NVL(:anamnesis, ANAMNESIS),
        EXAMEN_CLINICO      = NVL(:examen_clinico, EXAMEN_CLINICO),
        DIAGNOSTICO         = NVL(:diagnostico, DIAGNOSTICO),
        CODIGO_CIE10        = NVL(:codigo_cie10, CODIGO_CIE10),
        PLAN_TRATAMIENTO    = NVL(:plan_tratamiento, PLAN_TRATAMIENTO),
        PRESION_ARTERIAL    = NVL(:presion_arterial, PRESION_ARTERIAL),
        FRECUENCIA_CARDIACA = NVL(:frecuencia_cardiaca, FRECUENCIA_CARDIACA),
        TEMPERATURA         = NVL(:temperatura, TEMPERATURA),
        OBSERVACIONES       = NVL(:observaciones, OBSERVACIONES),
        FECHA_MODIFICACION  = SYSTIMESTAMP
    WHERE HISTORIA_ID = :id;

    IF SQL%ROWCOUNT > 0 THEN
        APEX_JSON.open_object;
        APEX_JSON.write('success', TRUE);
        APEX_JSON.write('message', 'Historia actualizada');
        APEX_JSON.close_object;
    ELSE
        APEX_JSON.open_object;
        APEX_JSON.write('success', FALSE);
        APEX_JSON.write('message', 'Historia no encontrada');
        APEX_JSON.close_object;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        APEX_JSON.open_object;
        APEX_JSON.write('success', FALSE);
        APEX_JSON.write('message', SQLERRM);
        APEX_JSON.close_object;
END;
""", "Actualizar historia clinica")


def main():
    print("=" * 60)
    print("Deploy Odontograma + Historias ORDS Endpoints")
    print("=" * 60)

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Step 1: Fix packages
        packages_valid = fix_packages(cursor)

        # Step 2: Deploy odontograma endpoints
        deploy_odontograma(cursor)

        # Step 3: Deploy historias endpoints
        deploy_historias(cursor, packages_valid)

        conn.commit()
        print("\n" + "=" * 60)
        print("Deploy completed successfully!")
        print("=" * 60)

    except Exception as e:
        print(f"\nERROR: {e}")
        conn.rollback()
        import traceback
        traceback.print_exc()
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    main()
