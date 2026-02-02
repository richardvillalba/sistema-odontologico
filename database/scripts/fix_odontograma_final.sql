-- ============================================================================
-- Script: FIX_ODONTOGRAMA_FINAL.sql
-- Descripción: Restauración definitiva de endpoints para el Odontograma
-- ============================================================================

BEGIN
  -- 1. Limpiar definiciones previas del módulo odontologia para estos templates específicos
  -- Nota: No borramos todo el módulo para no afectar a pacientes/citas, solo redefinimos.

  -- 2. GET /odontograma/paciente/:id
  ORDS.define_template(
   p_module_name    => 'odontologia',
   p_pattern        => 'odontograma/paciente/:id'
  );

  ORDS.define_handler(
    p_module_name    => 'odontologia',
    p_pattern        => 'odontograma/paciente/:id',
    p_method         => 'GET',
    p_source_type    => ORDS.source_type_plsql_procedure,
    p_source         => 'BEGIN 
                           PKG_ODONTOGRAMA.get_odontograma_actual(
                             p_paciente_id => :id,
                             p_cursor      => :cursor,
                             p_resultado   => :status,
                             p_mensaje     => :message
                           ); 
                         END;',
    p_items_per_page => 0
  );

  -- 3. POST /odontograma/hallazgo
  ORDS.define_template(
   p_module_name    => 'odontologia',
   p_pattern        => 'odontograma/hallazgo'
  );

  ORDS.define_handler(
    p_module_name    => 'odontologia',
    p_pattern        => 'odontograma/hallazgo',
    p_method         => 'POST',
    p_source_type    => ORDS.source_type_plsql_procedure,
    p_source         => 'BEGIN 
                           PKG_ODONTOGRAMA.registrar_hallazgo(
                             p_diente_id             => :diente_id,
                             p_tipo_hallazgo         => :tipo_hallazgo,
                             p_descripcion           => :descripcion,
                             p_doctor_id             => :doctor_id,
                             p_hallazgo_id           => :hallazgo_id,
                             p_resultado             => :status,
                             p_mensaje               => :message
                           ); 
                         END;',
    p_items_per_page => 0
  );

  -- 4. PUT /odontograma/:id/diente
  ORDS.define_template(
   p_module_name    => 'odontologia',
   p_pattern        => 'odontograma/:id/diente'
  );

  ORDS.define_handler(
    p_module_name    => 'odontologia',
    p_pattern        => 'odontograma/:id/diente',
    p_method         => 'PUT',
    p_source_type    => ORDS.source_type_plsql_procedure,
    p_source         => 'BEGIN 
                           PKG_ODONTOGRAMA.actualizar_diente(
                             p_odontograma_id    => :id,
                             p_numero_fdi        => :numero_fdi,
                             p_estado            => :estado,
                             p_observaciones     => :observaciones,
                             p_modificado_por    => :modificado_por,
                             p_resultado         => :status,
                             p_mensaje           => :message
                           ); 
                         END;',
    p_items_per_page => 0
  );

  -- 5. POST /odontograma
  ORDS.define_template(
   p_module_name    => 'odontologia',
   p_pattern        => 'odontograma'
  );

  ORDS.define_handler(
    p_module_name    => 'odontologia',
    p_pattern        => 'odontograma',
    p_method         => 'POST',
    p_source_type    => ORDS.source_type_plsql_procedure,
    p_source         => 'BEGIN 
                           PKG_ODONTOGRAMA.crear_odontograma(
                             p_paciente_id       => :paciente_id,
                             p_tipo              => :tipo,
                             p_creado_por        => :creado_por,
                             p_odontograma_id    => :odontograma_id,
                             p_resultado         => :status,
                             p_mensaje           => :message
                           ); 
                         END;',
    p_items_per_page => 0
  );

  COMMIT;
END;
/
