-- ============================================================================
-- Script: REINSTALL_ORDS_SERVICES.sql
-- Descripción: Redefinición de endpoints REST para el sistema odontológico
-- ============================================================================

DECLARE
  PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
  -- 1. Eliminar modulo si existe
  ORDS.delete_module(p_module_name => 'odontologia');
  COMMIT;
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

BEGIN
  -- 2. Definir Módulo
  ORDS.define_module(
    p_module_name    => 'odontologia',
    p_base_path      => 'api/v1/',
    p_items_per_page => 50,
    p_status         => 'PUBLISHED',
    p_comments       => 'API para Sistema Odontológico'
  );

  -- 3. Template: Listar Pacientes (GET /pacientes)
  ORDS.define_template(
   p_module_name    => 'odontologia',
   p_pattern        => 'pacientes'
  );

  ORDS.define_handler(
    p_module_name    => 'odontologia',
    p_pattern        => 'pacientes',
    p_method         => 'GET',
    p_source_type    => ORDS.source_type_plsql_procedure,
    p_source         => 'BEGIN 
                           PKG_PACIENTES.get_pacientes_by_empresa(
                             p_empresa_id => :empresa_id,
                             p_activo     => :activo,
                             p_limit      => :limit,
                             p_offset     => :offset,
                             p_cursor     => :cursor,
                             p_total      => :total,
                             p_status     => :status,
                             p_message    => :message
                           ); 
                         END;',
    p_items_per_page => 0
  );

  -- 4. Template: Detalle Paciente (GET /pacientes/:id)
  ORDS.define_template(
   p_module_name    => 'odontologia',
   p_pattern        => 'pacientes/:id'
  );

  ORDS.define_handler(
    p_module_name    => 'odontologia',
    p_pattern        => 'pacientes/:id',
    p_method         => 'GET',
    p_source_type    => ORDS.source_type_plsql_procedure,
    p_source         => 'BEGIN 
                           PKG_PACIENTES.get_paciente(
                             p_paciente_id => :id,
                             p_empresa_id  => :empresa_id,
                             p_cursor      => :cursor,
                             p_status      => :status,
                             p_message     => :message
                           ); 
                         END;',
    p_items_per_page => 0
  );

  -- 5. Template: Buscar Pacientes (GET /pacientes/search)
  ORDS.define_template(
   p_module_name    => 'odontologia',
   p_pattern        => 'pacientes/search'
  );

  ORDS.define_handler(
    p_module_name    => 'odontologia',
    p_pattern        => 'pacientes/search',
    p_method         => 'GET',
    p_source_type    => ORDS.source_type_plsql_procedure,
    p_source         => 'BEGIN 
                           PKG_PACIENTES.search_pacientes(
                             p_empresa_id  => :empresa_id,
                             p_search_term => :q,
                             p_cursor      => :cursor,
                             p_total       => :total,
                             p_status      => :status,
                             p_message     => :message
                           ); 
                         END;',
    p_items_per_page => 0
  );

  -- Parametros Implícitos de ORDS (Cargar Bind Variables)
  -- NOTA: ORDS mapea automáticamente parámetros de la URL (:empresa_id, :id, etc)
  -- Pero el cursor de salida DEBE llamarse 'cursor' para que ORDS lo convierta a JSON.

  COMMIT;
END;
/
