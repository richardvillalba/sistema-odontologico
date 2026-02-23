#!/usr/bin/env python3
"""
Deploy endpoints GET/PUT /facturas/empresa/:id
y agrega columnas SLOGAN, LOGO_URL, SITIO_WEB a ODO_EMPRESAS si no existen.
"""
from connect_db import get_connection


def add_column_if_missing(cursor, table, column, col_type):
    cursor.execute("""
        SELECT COUNT(*) FROM user_tab_columns
        WHERE table_name = :t AND column_name = :c
    """, {'t': table.upper(), 'c': column.upper()})
    exists = cursor.fetchone()[0]
    if not exists:
        cursor.execute(f"ALTER TABLE {table} ADD ({column} {col_type})")
        print(f"  [OK] Columna {column} agregada a {table}")
    else:
        print(f"  [--] Columna {column} ya existe en {table}")


def deploy(cursor, pattern, method, source_type, source, desc):
    cursor.execute("""
BEGIN
    ORDS.DEFINE_HANDLER(
        p_module_name    => 'facturas',
        p_pattern        => :pattern,
        p_method         => :method,
        p_source_type    => :source_type,
        p_source         => :source,
        p_items_per_page => 0
    );
    COMMIT;
END;
""", {
        'pattern': pattern,
        'method': method,
        'source_type': source_type,
        'source': source,
    })
    print(f"  [OK] {method} /facturas/{pattern} - {desc}")


def main():
    print("=== Deploy: Datos de Empresa (slogan, logo_url, sitio_web) ===\n")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # 1. Agregar columnas faltantes a ODO_EMPRESAS
        print("--- Verificando columnas en ODO_EMPRESAS ---")
        add_column_if_missing(cursor, 'ODO_EMPRESAS', 'SLOGAN',    'VARCHAR2(300)')
        add_column_if_missing(cursor, 'ODO_EMPRESAS', 'LOGO_URL',  'VARCHAR2(1000)')
        add_column_if_missing(cursor, 'ODO_EMPRESAS', 'SITIO_WEB', 'VARCHAR2(500)')
        conn.commit()

        # 2. GET /facturas/empresa/:id
        print("\n--- Desplegando endpoints ---")
        deploy(cursor, 'empresa/:id', 'GET', 'plsql/block', """
DECLARE
    v_id NUMBER := :id;
BEGIN
    APEX_JSON.OPEN_OBJECT;
    APEX_JSON.OPEN_ARRAY('ITEMS');

    FOR r IN (
        SELECT EMPRESA_ID, RAZON_SOCIAL, NOMBRE_COMERCIAL, RUC, DV_RUC,
               DIRECCION, TELEFONO, EMAIL, ACTIVO,
               NVL(SLOGAN, '')    AS SLOGAN,
               NVL(LOGO_URL, '')  AS LOGO_URL,
               NVL(SITIO_WEB, '') AS SITIO_WEB,
               FECHA_CREACION
        FROM ODO_EMPRESAS
        WHERE EMPRESA_ID = v_id
    ) LOOP
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('empresa_id',       r.EMPRESA_ID);
        APEX_JSON.WRITE('razon_social',     r.RAZON_SOCIAL);
        APEX_JSON.WRITE('nombre_comercial', r.NOMBRE_COMERCIAL);
        APEX_JSON.WRITE('ruc',              r.RUC);
        APEX_JSON.WRITE('dv_ruc',           r.DV_RUC);
        APEX_JSON.WRITE('direccion',        r.DIRECCION);
        APEX_JSON.WRITE('telefono',         r.TELEFONO);
        APEX_JSON.WRITE('email',            r.EMAIL);
        APEX_JSON.WRITE('activo',           r.ACTIVO);
        APEX_JSON.WRITE('slogan',           r.SLOGAN);
        APEX_JSON.WRITE('logo_url',         r.LOGO_URL);
        APEX_JSON.WRITE('sitio_web',        r.SITIO_WEB);
        APEX_JSON.CLOSE_OBJECT;
    END LOOP;

    APEX_JSON.CLOSE_ARRAY;
    APEX_JSON.CLOSE_OBJECT;
END;
""", "Obtener empresa por ID con todos los datos")

        # 3. PUT /facturas/empresa/:id
        deploy(cursor, 'empresa/:id', 'PUT', 'plsql/block', """
DECLARE
    v_id               NUMBER         := :id;
    v_razon_social     VARCHAR2(200)  := :razon_social;
    v_nombre_comercial VARCHAR2(200)  := :nombre_comercial;
    v_slogan           VARCHAR2(300)  := :slogan;
    v_direccion        VARCHAR2(500)  := :direccion;
    v_telefono         VARCHAR2(50)   := :telefono;
    v_email            VARCHAR2(200)  := :email;
    v_sitio_web        VARCHAR2(500)  := :sitio_web;
    v_logo_url         VARCHAR2(1000) := :logo_url;
    v_modificado_por   NUMBER         := :modificado_por;
BEGIN
    UPDATE ODO_EMPRESAS
    SET RAZON_SOCIAL        = NVL(v_razon_social,     RAZON_SOCIAL),
        NOMBRE_COMERCIAL    = NVL(v_nombre_comercial, NOMBRE_COMERCIAL),
        SLOGAN              = v_slogan,
        DIRECCION           = NVL(v_direccion,        DIRECCION),
        TELEFONO            = NVL(v_telefono,         TELEFONO),
        EMAIL               = NVL(v_email,            EMAIL),
        SITIO_WEB           = v_sitio_web,
        LOGO_URL            = v_logo_url,
        MODIFICADO_POR      = v_modificado_por,
        FECHA_MODIFICACION  = SYSTIMESTAMP
    WHERE EMPRESA_ID = v_id;

    IF SQL%ROWCOUNT > 0 THEN
        COMMIT;
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('resultado', 1);
        APEX_JSON.WRITE('mensaje',   'Datos de empresa actualizados correctamente');
        APEX_JSON.CLOSE_OBJECT;
    ELSE
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('resultado', 0);
        APEX_JSON.WRITE('mensaje',   'Empresa no encontrada');
        APEX_JSON.CLOSE_OBJECT;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        APEX_JSON.OPEN_OBJECT;
        APEX_JSON.WRITE('resultado', 0);
        APEX_JSON.WRITE('mensaje',   'Error: ' || SQLERRM);
        APEX_JSON.CLOSE_OBJECT;
END;
""", "Actualizar datos de empresa (incluye slogan, logo_url, sitio_web)")

        conn.commit()
        print("\n=== Deploy completado exitosamente ===")
        print("  Endpoints activos:")
        print("    GET  /facturas/empresa/:id  -> datos completos de la empresa")
        print("    PUT  /facturas/empresa/:id  -> actualizar datos (slogan, logo, sitio_web, etc.)")

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
