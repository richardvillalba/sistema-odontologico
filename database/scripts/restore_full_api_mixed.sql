DECLARE
  PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
    ORDS.delete_module(p_module_name => 'odontologia');
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN NULL;
END;
;;;
BEGIN
    ORDS.define_module(
      p_module_name    => 'odontologia',
      p_base_path      => 'api/v1/',
      p_items_per_page => 0,
      p_status         => 'PUBLISHED',
      p_comments       => 'API Restaurada Hibrida V2'
    );

    -- =======================================================================
    -- 1. PACIENTES (PL/SQL Legacy - Assuming this worked in reinstall_ords.sql?)
    -- Actually, reinstall_ords.sql failed with Invalid source_type too implicitly?
    -- No, I never ran reinstall_ords.sql successfully with the agent.
    -- So I should switch everything to json/query or plsql/block + APEX_JSON to be safe.
    -- I will use json/query where possible (GET) and plsql/block for others.
    -- =======================================================================
    
    -- GET Pacientes
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'pacientes');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'pacientes',
      p_method         => 'GET',
      p_source_type    => 'json/query',
      p_source         => 'SELECT * FROM odo_pacientes WHERE (empresa_id = :empresa_id OR :empresa_id IS NULL) ORDER BY apellido'
    );

    -- GET Paciente Detail
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'pacientes/:id');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'pacientes/:id',
      p_method         => 'GET',
      p_source_type    => 'json/query',
      p_source         => 'SELECT p.*, (p.nombre || '' '' || p.apellido) as nombre_completo FROM odo_pacientes p WHERE p.paciente_id = :id'
    );

    -- GET Paciente Search
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'pacientes/search');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'pacientes/search',
      p_method         => 'GET',
      p_source_type    => 'json/query',
      p_source         => 'SELECT * FROM odo_pacientes WHERE (UPPER(nombre || '' '' || apellido) LIKE ''%'' || UPPER(:q) || ''%'')'
    );

    -- =======================================================================
    -- 2. ODONTOGRAMA (FIXED)
    -- =======================================================================
    
    -- GET Odontograma Actual (JSON/QUERY - Robust)
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'odontograma/paciente/:id');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'odontograma/paciente/:id',
      p_method         => 'GET',
      p_source_type    => 'json/query',
      p_source         => 'SELECT o.ODONTOGRAMA_ID, o.PACIENTE_ID, p.NOMBRE || '' '' || p.APELLIDO AS PACIENTE_NOMBRE, p.NUMERO_HISTORIA, o.TIPO, o.OBSERVACIONES AS ODONTOGRAMA_OBS, o.FECHA_CREACION, o.FECHA_MODIFICACION, d.DIENTE_ID, d.NUMERO_FDI, d.TIPO_DIENTE, d.ESTADO, d.CUADRANTE, d.POSICION, d.OBSERVACIONES AS DIENTE_OBS, d.FECHA_CREACION AS DIENTE_FECHA_CREACION, d.FECHA_MODIFICACION AS DIENTE_FECHA_MODIFICACION FROM ODO_ODONTOGRAMAS o JOIN ODO_PACIENTES p ON o.PACIENTE_ID = p.PACIENTE_ID JOIN ODO_DIENTES d ON o.ODONTOGRAMA_ID = d.ODONTOGRAMA_ID WHERE o.ODONTOGRAMA_ID = (SELECT ODONTOGRAMA_ID FROM ODO_ODONTOGRAMAS WHERE PACIENTE_ID = :id AND ACTIVO = ''S'' ORDER BY FECHA_CREACION DESC FETCH FIRST 1 ROW ONLY) AND d.ACTIVO = ''S'' ORDER BY d.CUADRANTE, d.POSICION'
    );

    -- POST Hallazgo (PL/SQL Block + APEX_JSON)
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'odontograma/hallazgo');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'odontograma/hallazgo',
      p_method         => 'POST',
      p_source_type    => 'plsql/block',
      p_source         => 'DECLARE
                             v_status NUMBER;
                             v_msg VARCHAR2(4000);
                           BEGIN 
                             PKG_ODONTOGRAMA.registrar_hallazgo(
                               p_diente_id => :diente_id, 
                               p_tipo_hallazgo => :tipo_hallazgo, 
                               p_descripcion => :descripcion, 
                               p_doctor_id => :doctor_id, -- Nota: :doctor_id viene del body o header
                               p_hallazgo_id => :hallazgo_id,
                               p_resultado => v_status, 
                               p_mensaje => v_msg
                             );
                             APEX_JSON.open_object;
                             APEX_JSON.write(''success'', v_status = 1);
                             APEX_JSON.write(''message'', v_msg);
                             APEX_JSON.close_object;
                           END;'
    );

    -- PUT Actualizar Diente (PL/SQL Block + APEX_JSON)
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'odontograma/:id/diente');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'odontograma/:id/diente',
      p_method         => 'PUT',
      p_source_type    => 'plsql/block',
      p_source         => 'DECLARE
                             v_status NUMBER;
                             v_msg VARCHAR2(4000);
                           BEGIN 
                             PKG_ODONTOGRAMA.actualizar_diente(
                               p_odontograma_id => :id,
                               p_numero_fdi => :numero_fdi,
                               p_estado => :estado,
                               p_observaciones => :observaciones,
                               p_modificado_por => :modificado_por,
                               p_resultado => v_status,
                               p_mensaje => v_msg
                             ); 
                             APEX_JSON.open_object;
                             APEX_JSON.write(''success'', v_status = 1);
                             APEX_JSON.write(''message'', v_msg);
                             APEX_JSON.close_object;
                           END;'
    );

    -- POST Crear Odontograma (PL/SQL Block + APEX_JSON)
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'odontograma');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'odontograma',
      p_method         => 'POST',
      p_source_type    => 'plsql/block',
      p_source         => 'DECLARE
                             v_status NUMBER;
                             v_msg VARCHAR2(4000);
                             v_id NUMBER;
                           BEGIN 
                             PKG_ODONTOGRAMA.crear_odontograma(
                               p_paciente_id => :paciente_id,
                               p_tipo => :tipo,
                               p_creado_por => :creado_por,
                               p_odontograma_id => v_id,
                               p_resultado => v_status,
                               p_mensaje => v_msg
                             ); 
                             APEX_JSON.open_object;
                             APEX_JSON.write(''success'', v_status = 1);
                             APEX_JSON.write(''message'', v_msg);
                             APEX_JSON.write(''odontograma_id'', v_id);
                             APEX_JSON.close_object;
                           END;'
    );

    -- GET Historial Hallazgos Diente
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'odontograma/diente/:id/hallazgos');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'odontograma/diente/:id/hallazgos',
      p_method         => 'GET',
      p_source_type    => 'plsql/block',
      p_source         => 'BEGIN PKG_ODONTOGRAMA.get_hallazgos_diente(:id, :cursor, :status, :message); END;'
    );

    -- =======================================================================
    -- 3. RESTO DEL SISTEMA (SQL Directo)
    -- =======================================================================
    
    -- CITAS - GET con filtros mejorados
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'citas');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'citas',
      p_method         => 'GET',
      p_source_type    => 'json/query',
      p_source         => 'SELECT
                            c.CITA_ID,
                            c.PACIENTE_ID,
                            p.NOMBRE || '' '' || p.APELLIDO as PACIENTE_NOMBRE,
                            p.TELEFONO_PRINCIPAL as PACIENTE_TELEFONO,
                            c.DOCTOR_ID,
                            u.NOMBRE || '' '' || u.APELLIDO as DOCTOR_NOMBRE,
                            TO_CHAR(c.FECHA_HORA_INICIO, ''YYYY-MM-DD'') as FECHA,
                            TO_CHAR(c.FECHA_HORA_INICIO, ''HH24:MI'') as HORA_INICIO,
                            TO_CHAR(c.FECHA_HORA_FIN, ''HH24:MI'') as HORA_FIN,
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
                          WHERE (c.EMPRESA_ID = :empresa_id OR :empresa_id IS NULL)
                            AND (:fecha IS NULL OR TRUNC(c.FECHA_HORA_INICIO) = TO_DATE(:fecha, ''YYYY-MM-DD''))
                            AND (:estado IS NULL OR c.ESTADO = :estado)
                          ORDER BY c.FECHA_HORA_INICIO'
    );

    -- CITAS - POST crear nueva cita
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'citas',
      p_method         => 'POST',
      p_source_type    => 'plsql/block',
      p_source         => 'DECLARE
                             v_id NUMBER;
                             v_fecha_hora TIMESTAMP;
                           BEGIN
                             -- Construir timestamp desde fecha y hora
                             v_fecha_hora := TO_TIMESTAMP(:fecha || '' '' || :hora_inicio, ''YYYY-MM-DD HH24:MI'');

                             INSERT INTO ODO_CITAS (
                               PACIENTE_ID, DOCTOR_ID, FECHA_HORA_INICIO, FECHA_HORA_FIN,
                               DURACION_MINUTOS, MOTIVO_CONSULTA, TIPO_CITA, ESTADO,
                               CONSULTORIO, OBSERVACIONES, EMPRESA_ID, SUCURSAL_ID,
                               FECHA_CREACION, CREADO_POR
                             ) VALUES (
                               :paciente_id,
                               NVL(:doctor_id, 1),
                               v_fecha_hora,
                               v_fecha_hora + NUMTODSINTERVAL(NVL(:duracion_minutos, 30), ''MINUTE''),
                               NVL(:duracion_minutos, 30),
                               :motivo_consulta,
                               NVL(:tipo_cita, ''CONSULTA''),
                               ''PENDIENTE'',
                               :consultorio,
                               :notas,
                               NVL(:empresa_id, 1),
                               NVL(:sucursal_id, 1),
                               SYSTIMESTAMP,
                               NVL(:creado_por, 1)
                             ) RETURNING CITA_ID INTO v_id;

                             APEX_JSON.open_object;
                             APEX_JSON.write(''success'', TRUE);
                             APEX_JSON.write(''cita_id'', v_id);
                             APEX_JSON.write(''message'', ''Cita creada correctamente'');
                             APEX_JSON.close_object;
                           EXCEPTION
                             WHEN OTHERS THEN
                               APEX_JSON.open_object;
                               APEX_JSON.write(''success'', FALSE);
                               APEX_JSON.write(''message'', SQLERRM);
                               APEX_JSON.close_object;
                           END;'
    );

    -- CITAS - PUT cambiar estado
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'citas/:id/estado');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'citas/:id/estado',
      p_method         => 'PUT',
      p_source_type    => 'plsql/block',
      p_source         => 'BEGIN
                             UPDATE ODO_CITAS
                             SET ESTADO = :estado,
                                 MOTIVO_CANCELACION = CASE WHEN :estado = ''CANCELADA'' THEN :motivo_cancelacion ELSE MOTIVO_CANCELACION END,
                                 FECHA_MODIFICACION = SYSTIMESTAMP,
                                 MODIFICADO_POR = NVL(:usuario_id, 1)
                             WHERE CITA_ID = :id;

                             IF SQL%ROWCOUNT > 0 THEN
                               APEX_JSON.open_object;
                               APEX_JSON.write(''success'', TRUE);
                               APEX_JSON.write(''message'', ''Estado actualizado correctamente'');
                               APEX_JSON.close_object;
                             ELSE
                               APEX_JSON.open_object;
                               APEX_JSON.write(''success'', FALSE);
                               APEX_JSON.write(''message'', ''Cita no encontrada'');
                               APEX_JSON.close_object;
                             END IF;
                           EXCEPTION
                             WHEN OTHERS THEN
                               APEX_JSON.open_object;
                               APEX_JSON.write(''success'', FALSE);
                               APEX_JSON.write(''message'', SQLERRM);
                               APEX_JSON.close_object;
                           END;'
    );

    -- DOCTORES
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'doctores');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'doctores',
      p_method         => 'GET',
      p_source_type    => 'json/query',
      p_source         => 'SELECT * FROM odo_usuarios WHERE rol_id = 2'
    );

    -- HISTORIAS
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'historias/paciente/:id');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'historias/paciente/:id',
      p_method         => 'GET',
      p_source_type    => 'json/query',
      p_source         => 'SELECT h.*, u.NOMBRE || '' '' || u.APELLIDO as DOCTOR_NOMBRE FROM odo_historias_clinicas h LEFT JOIN odo_usuarios u ON h.doctor_id = u.usuario_id WHERE h.paciente_id = :id ORDER BY h.fecha_consulta DESC'
    );

    -- POST Crear Historia Clínica
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'historias');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'historias',
      p_method         => 'POST',
      p_source_type    => 'plsql/block',
      p_source         => 'DECLARE
                             v_id NUMBER;
                           BEGIN
                             INSERT INTO ODO_HISTORIAS_CLINICAS (
                               PACIENTE_ID, DOCTOR_ID, FECHA_CONSULTA, MOTIVO_CONSULTA,
                               ANAMNESIS, EXAMEN_CLINICO, DIAGNOSTICO, CODIGO_CIE10,
                               PLAN_TRATAMIENTO, PRESION_ARTERIAL, FRECUENCIA_CARDIACA,
                               TEMPERATURA, PROXIMA_CITA, OBSERVACIONES, EMPRESA_ID
                             ) VALUES (
                               :paciente_id, NVL(:doctor_id, 1), NVL(TO_TIMESTAMP(:fecha_consulta, ''YYYY-MM-DD"T"HH24:MI:SS''), SYSTIMESTAMP),
                               :motivo_consulta, :anamnesis, :examen_clinico, :diagnostico,
                               :codigo_cie10, :plan_tratamiento, :presion_arterial,
                               :frecuencia_cardiaca, :temperatura,
                               TO_DATE(:proxima_cita, ''YYYY-MM-DD''), :observaciones, NVL(:empresa_id, 1)
                             ) RETURNING HISTORIA_ID INTO v_id;

                             APEX_JSON.open_object;
                             APEX_JSON.write(''success'', TRUE);
                             APEX_JSON.write(''historia_id'', v_id);
                             APEX_JSON.write(''message'', ''Historia clínica creada correctamente'');
                             APEX_JSON.close_object;
                           EXCEPTION
                             WHEN OTHERS THEN
                               APEX_JSON.open_object;
                               APEX_JSON.write(''success'', FALSE);
                               APEX_JSON.write(''message'', SQLERRM);
                               APEX_JSON.close_object;
                           END;'
    );

    -- TRATAMIENTOS (Tabla general)
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'tratamientos/paciente/:id');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'tratamientos/paciente/:id',
      p_method         => 'GET',
      p_source_type    => 'json/query',
      p_source         => 'SELECT * FROM odo_tratamientos_paciente WHERE paciente_id = :id'
    );

    -- TRATAMIENTOS ODONTOGRAMA (Desde ODO_TRATAMIENTOS_DIENTE)
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'odontograma/tratamientos/paciente/:id');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'odontograma/tratamientos/paciente/:id',
      p_method         => 'GET',
      p_source_type    => 'json/query',
      p_source         => 'SELECT td.TRATAMIENTO_DIENTE_ID as ID, td.DIENTE_ID, d.NUMERO_FDI, td.TIPO_TRATAMIENTO, td.TIPO_TRATAMIENTO as NOMBRE, td.DESCRIPCION, td.COSTO, ''PENDIENTE'' as ESTADO, td.FECHA_TRATAMIENTO as FECHA_ASIGNACION, u.NOMBRE || '' '' || u.APELLIDO as DOCTOR_NOMBRE FROM ODO_TRATAMIENTOS_DIENTE td JOIN ODO_DIENTES d ON td.DIENTE_ID = d.DIENTE_ID JOIN ODO_ODONTOGRAMAS o ON d.ODONTOGRAMA_ID = o.ODONTOGRAMA_ID LEFT JOIN ODO_USUARIOS u ON td.DOCTOR_ID = u.USUARIO_ID WHERE o.PACIENTE_ID = :id ORDER BY td.FECHA_TRATAMIENTO DESC'
    );

    -- GET Tratamientos de un Diente específico
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'odontograma/diente/:id/tratamientos');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'odontograma/diente/:id/tratamientos',
      p_method         => 'GET',
      p_source_type    => 'json/query',
      p_source         => 'SELECT td.TRATAMIENTO_DIENTE_ID as ID, td.TIPO_TRATAMIENTO, td.TIPO_TRATAMIENTO as NOMBRE, td.DESCRIPCION, td.COSTO, ''PENDIENTE'' as ESTADO, td.FECHA_TRATAMIENTO as FECHA_ASIGNACION, u.NOMBRE || '' '' || u.APELLIDO as DOCTOR_NOMBRE FROM ODO_TRATAMIENTOS_DIENTE td LEFT JOIN ODO_USUARIOS u ON td.DOCTOR_ID = u.USUARIO_ID WHERE td.DIENTE_ID = :id ORDER BY td.FECHA_TRATAMIENTO DESC'
    );

    -- POST Asignar Tratamiento a Diente
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'odontograma/diente/:id/tratamiento');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'odontograma/diente/:id/tratamiento',
      p_method         => 'POST',
      p_source_type    => 'plsql/block',
      p_source         => 'DECLARE
                             v_id NUMBER;
                             v_nombre VARCHAR2(200);
                             v_costo NUMBER;
                           BEGIN
                             SELECT NOMBRE, PRECIO_BASE INTO v_nombre, v_costo
                             FROM ODO_CATALOGOS_TRATAMIENTOS WHERE CATALOGO_ID = :catalogo_id;

                             INSERT INTO ODO_TRATAMIENTOS_DIENTE (
                               DIENTE_ID, TIPO_TRATAMIENTO, DESCRIPCION, COSTO, DOCTOR_ID, FECHA_TRATAMIENTO
                             ) VALUES (
                               :id, v_nombre, ''Tratamiento asignado desde odontograma - Cat:'' || :catalogo_id, v_costo, NVL(:doctor_id, 1), SYSTIMESTAMP
                             ) RETURNING TRATAMIENTO_DIENTE_ID INTO v_id;

                             APEX_JSON.open_object;
                             APEX_JSON.write(''success'', TRUE);
                             APEX_JSON.write(''tratamiento_id'', v_id);
                             APEX_JSON.write(''message'', ''Tratamiento asignado correctamente'');
                             APEX_JSON.close_object;
                           EXCEPTION
                             WHEN OTHERS THEN
                               APEX_JSON.open_object;
                               APEX_JSON.write(''success'', FALSE);
                               APEX_JSON.write(''message'', SQLERRM);
                               APEX_JSON.close_object;
                           END;'
    );

    -- GET Tratamientos Sugeridos por Tipo de Hallazgo
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'tratamientos/sugeridos/:tipo');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'tratamientos/sugeridos/:tipo',
      p_method         => 'GET',
      p_source_type    => 'json/query',
      p_source         => 'SELECT CATALOGO_ID as ID, CODIGO, NOMBRE, DESCRIPCION, CATEGORIA, PRECIO_BASE as COSTO_BASE, DURACION_ESTIMADA FROM ODO_CATALOGOS_TRATAMIENTOS WHERE ACTIVO = ''S'' AND CATEGORIA = CASE :tipo WHEN ''CARIES'' THEN ''OPERATORIA'' WHEN ''FRACTURA'' THEN ''OPERATORIA'' WHEN ''FRACTURADO'' THEN ''OPERATORIA'' WHEN ''ENDODONCIA'' THEN ''ENDODONCIA'' WHEN ''PERIODONTITIS'' THEN ''PERIODONCIA'' WHEN ''GINGIVITIS'' THEN ''PERIODONCIA'' WHEN ''EXTRACCION_INDICADA'' THEN ''CIRUGIA'' WHEN ''AUSENTE'' THEN ''PROTESIS'' WHEN ''IMPLANTE'' THEN ''PROTESIS'' WHEN ''CORONA'' THEN ''PROTESIS'' WHEN ''PROTESIS'' THEN ''PROTESIS'' ELSE CATEGORIA END ORDER BY NOMBRE'
    );

    -- DELETE Eliminar Tratamiento de Diente
    ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'odontograma/tratamiento/:id');
    ORDS.define_handler(
      p_module_name    => 'odontologia',
      p_pattern        => 'odontograma/tratamiento/:id',
      p_method         => 'DELETE',
      p_source_type    => 'plsql/block',
      p_source         => 'BEGIN
                             DELETE FROM ODO_TRATAMIENTOS_DIENTE
                             WHERE TRATAMIENTO_DIENTE_ID = :id;

                             APEX_JSON.open_object;
                             APEX_JSON.write(''success'', SQL%ROWCOUNT > 0);
                             APEX_JSON.write(''message'', CASE WHEN SQL%ROWCOUNT > 0 THEN ''Tratamiento eliminado'' ELSE ''Tratamiento no encontrado'' END);
                             APEX_JSON.close_object;
                           END;'
    );

    COMMIT;
END;
;;;
