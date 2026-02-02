-- ============================================================================
-- Script: FIX_ODONTOGRAMA_ORDS.sql
-- Descripción: Corrección de endpoints para el Odontograma usando :cursor
-- ============================================================================

BEGIN
  -- 1. Odontograma Actual
  ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'odontograma/paciente/:id');
  ORDS.define_handler(
    p_module_name    => 'odontologia',
    p_pattern        => 'odontograma/paciente/:id',
    p_method         => 'GET',
    p_source_type    => 'plsql/procedure',
    p_source         => 'BEGIN PKG_ODONTOGRAMA.get_odontograma_actual(:id, :cursor, :status, :message); END;',
    p_items_per_page => 0
  );

  -- 2. Registrar Hallazgo
  ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'odontograma/hallazgo');
  ORDS.define_handler(
    p_module_name    => 'odontologia',
    p_pattern        => 'odontograma/hallazgo',
    p_method         => 'POST',
    p_source_type    => 'plsql/procedure',
    p_source         => 'BEGIN PKG_ODONTOGRAMA.registrar_hallazgo(:diente_id, NULL, :tipo_hallazgo, NULL, NULL, :descripcion, ''S'', :doctor_id, :hallazgo_id, :status, :message); END;',
    p_items_per_page => 0
  );

  -- 3. Actualizar Diente
  ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'odontograma/:id/diente');
  ORDS.define_handler(
    p_module_name    => 'odontologia',
    p_pattern        => 'odontograma/:id/diente',
    p_method         => 'PUT',
    p_source_type    => 'plsql/procedure',
    p_source         => 'BEGIN PKG_ODONTOGRAMA.actualizar_diente(:id, :numero_fdi, :estado, :observaciones, :modificado_por, :status, :message); END;',
    p_items_per_page => 0
  );

  -- 4. Crear Odontograma
  ORDS.define_template(p_module_name => 'odontologia', p_pattern => 'odontograma');
  ORDS.define_handler(
    p_module_name    => 'odontologia',
    p_pattern        => 'odontograma',
    p_method         => 'POST',
    p_source_type    => 'plsql/procedure',
    p_source         => 'BEGIN PKG_ODONTOGRAMA.crear_odontograma(:paciente_id, 1, :tipo, NULL, :creado_por, :odontograma_id, :status, :message); END;',
    p_items_per_page => 0
  );

  COMMIT;
END;
/
