import os
from connect_db import execute_dml

def deploy_dashboard_endpoints():
    sql = """
    BEGIN
        -- Endpoint: Estadísticas Generales (dashboard/stats)
        ORDS.DEFINE_TEMPLATE(
            p_module_name => 'facturas',
            p_pattern     => 'dashboard/stats'
        );

        ORDS.DEFINE_HANDLER(
            p_module_name => 'facturas',
            p_pattern     => 'dashboard/stats',
            p_method      => 'GET',
            p_source_type => 'plsql/block',
            p_source      => '
BEGIN
    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    
    FOR r IN (
        SELECT 
            (SELECT COUNT(*) FROM ODO_PACIENTES WHERE EMPRESA_ID = :empresa_id) as total_pacientes,
            (SELECT COUNT(*) FROM ODO_CITAS WHERE EMPRESA_ID = :empresa_id AND TRUNC(FECHA_HORA_INICIO) = TRUNC(SYSDATE) AND (ESTADO IS NULL OR ESTADO != ''CANCELADA'')) as citas_hoy,
            (SELECT COUNT(*) FROM ODO_TRATAMIENTOS_PACIENTE t JOIN ODO_PACIENTES p ON t.PACIENTE_ID = p.PACIENTE_ID WHERE p.EMPRESA_ID = :empresa_id AND t.ESTADO = ''EN_PROCESO'') as tratamientos_activos,
            (SELECT NVL(SUM(MONTO), 0) FROM ODO_PAGOS WHERE EMPRESA_ID = :empresa_id AND TRUNC(CAST(FECHA_PAGO AS DATE), ''MM'') = TRUNC(SYSDATE, ''MM'')) as ingresos_mes
        FROM DUAL
    ) LOOP
        APEX_JSON.write(''total_pacientes'', r.total_pacientes);
        APEX_JSON.write(''citas_hoy'', r.citas_hoy);
        APEX_JSON.write(''tratamientos_activos'', r.tratamientos_activos);
        APEX_JSON.write(''ingresos_mes'', r.ingresos_mes);
    END LOOP;
    
    APEX_JSON.close_object;
    :status := 200;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
        );

        -- Endpoint: Actividad Semanal (dashboard/actividad-semanal)
        ORDS.DEFINE_TEMPLATE(
            p_module_name => 'facturas',
            p_pattern     => 'dashboard/actividad-semanal'
        );

        ORDS.DEFINE_HANDLER(
            p_module_name => 'facturas',
            p_pattern     => 'dashboard/actividad-semanal',
            p_method      => 'GET',
            p_source_type => 'plsql/block',
            p_source      => '
DECLARE
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        WITH dias AS (
            SELECT TRUNC(SYSDATE, ''IW'') + LEVEL - 1 as fecha
            FROM DUAL
            CONNECT BY LEVEL <= 7
        )
        SELECT 
            TO_CHAR(d.fecha, ''DY'', ''NLS_DATE_LANGUAGE=SPANISH'') as dia_nombre,
            TO_CHAR(d.fecha, ''YYYY-MM-DD'') as fecha,
            (SELECT COUNT(*) FROM ODO_CITAS c WHERE TRUNC(c.FECHA_HORA_INICIO) = TRUNC(d.fecha) AND c.EMPRESA_ID = :empresa_id) as total_citas,
            (SELECT COUNT(*) FROM ODO_CITAS c WHERE TRUNC(c.FECHA_HORA_INICIO) = TRUNC(d.fecha) AND c.EMPRESA_ID = :empresa_id AND c.ESTADO = ''FINALIZADA'') as completadas
        FROM dias d
        ORDER BY d.fecha;

    APEX_JSON.initialize_clob_output;
    APEX_JSON.open_object;
    APEX_JSON.write(''items'', v_cursor);
    APEX_JSON.close_object;
    :status := 200;
    :content_type := ''application/json'';
    htp.p(APEX_JSON.get_clob_output);
    APEX_JSON.free_output;
END;'
        );

        COMMIT;
    END;
    """
    print("Desplegando endpoints de Dashboard en el módulo ''facturas''...")
    result = execute_dml(sql)
    print(f"Resultado: {result}")

if __name__ == "__main__":
    deploy_dashboard_endpoints()
