from connect_db import get_connection
import sys

def execute_dml(cursor, sql, description):
    """Execute a DML statement and handle errors"""
    try:
        cursor.execute(sql)
        rows = cursor.rowcount
        if rows > 0:
            print(f"  ✓ {description} ({rows} filas)")
        else:
            print(f"  ⊙ {description} (sin cambios)")
        return True
    except Exception as e:
        error_str = str(e)
        if "ORA-00001" in error_str:  # Unique constraint violated
            print(f"  ⊙ {description} (ya existe)")
            return True
        else:
            print(f"  ✗ Error en {description}: {e}")
            return False

def main():
    print("="*60)
    print("DEPLOY: SUB-PROGRAMAS GRANULARES POR MÓDULO")
    print("="*60)

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # ============================================================
        # 0. Asegurar que existe el programa COMPRAS (puede faltar)
        # ============================================================
        print("\n0. Verificando programa COMPRAS...")
        print("-"*60)

        execute_dml(cursor, """
            INSERT INTO ODO_PROGRAMAS (NOMBRE, CODIGO, DESCRIPCION, RUTA_FRONTEND, ICONO, ORDEN, CREADO_POR)
            VALUES ('Compras', 'COMPRAS', 'Módulo de compras e inventario', '/compras', '🛒', 8, 1)
        """, "Programa COMPRAS")

        # ============================================================
        # 1. SUB-MÓDULOS DE COMPRAS
        # ============================================================
        print("\n1. Insertando sub-módulos de Compras...")
        print("-"*60)

        compras_submodules = [
            ("Proveedores", "COMPRAS_PROVEEDORES", "Gestión de proveedores", "/compras/proveedores", "🏢", 1),
            ("Artículos", "COMPRAS_ARTICULOS", "Gestión de artículos e insumos", "/compras/articulos", "📦", 2),
            ("Inventario", "COMPRAS_INVENTARIO", "Control de inventario y stock", "/compras/inventario", "📊", 3),
            ("Registro de Compra", "COMPRAS_REGISTRO", "Registro de facturas de compra", "/compras/facturas/nueva", "🧾", 4),
        ]

        for nombre, codigo, desc, ruta, icono, orden in compras_submodules:
            execute_dml(cursor, f"""
                INSERT INTO ODO_PROGRAMAS (NOMBRE, CODIGO, DESCRIPCION, RUTA_FRONTEND, ICONO, MODULO_PADRE_ID, ORDEN, CREADO_POR)
                SELECT '{nombre}', '{codigo}', '{desc}', '{ruta}', '{icono}', PROGRAMA_ID, {orden}, 1
                FROM ODO_PROGRAMAS WHERE CODIGO = 'COMPRAS'
            """, f"Sub-programa {codigo}")

        # ============================================================
        # 2. SUB-MÓDULOS DE CONFIGURACIONES (nuevos - los 3 existentes ya están)
        # ============================================================
        print("\n2. Insertando sub-módulos nuevos de Configuraciones...")
        print("-"*60)

        config_submodules = [
            ("Roles y Módulos", "CONFIG_ROLES", "Configuración de roles y accesos", "/configuraciones/roles", "🎭", 4),
            ("Datos de la Clínica", "CONFIG_CLINICA", "Información general de la clínica", "/configuraciones/clinica", "🏥", 5),
            ("Catálogo de Tratamientos", "CONFIG_TRATAMIENTOS", "Gestión del catálogo de tratamientos", "/configuraciones/tratamientos", "💊", 6),
            ("Cajas", "CONFIG_CAJAS", "Configuración de cajas", "/configuraciones/cajas", "💵", 7),
            ("Sucursales", "CONFIG_SUCURSALES", "Gestión de sucursales", "/configuraciones/sucursales", "📍", 8),
        ]

        for nombre, codigo, desc, ruta, icono, orden in config_submodules:
            execute_dml(cursor, f"""
                INSERT INTO ODO_PROGRAMAS (NOMBRE, CODIGO, DESCRIPCION, RUTA_FRONTEND, ICONO, MODULO_PADRE_ID, ORDEN, CREADO_POR)
                SELECT '{nombre}', '{codigo}', '{desc}', '{ruta}', '{icono}', PROGRAMA_ID, {orden}, 1
                FROM ODO_PROGRAMAS WHERE CODIGO = 'CONFIGURACIONES'
            """, f"Sub-programa {codigo}")

        # ============================================================
        # 3. PESTAÑAS DE PACIENTE
        # ============================================================
        print("\n3. Insertando pestañas de Paciente como sub-programas...")
        print("-"*60)

        paciente_tabs = [
            ("Información Personal", "PAC_INFO", "Pestaña de datos personales del paciente", None, "👤", 1),
            ("Odontograma", "PAC_ODONTOGRAMA", "Pestaña de odontograma del paciente", None, "🦷", 2),
            ("Historia Clínica", "PAC_HISTORIA", "Pestaña de historia clínica del paciente", None, "📋", 3),
            ("Plan de Tratamiento", "PAC_TRATAMIENTOS", "Pestaña de tratamientos del paciente", None, "💊", 4),
            ("Facturación / Pagos", "PAC_FACTURACION", "Pestaña de facturación del paciente", None, "💰", 5),
            ("Archivos / Rayos X", "PAC_ARCHIVOS", "Pestaña de archivos y rayos X", None, "📁", 6),
        ]

        for nombre, codigo, desc, ruta, icono, orden in paciente_tabs:
            ruta_sql = f"'{ruta}'" if ruta else "NULL"
            execute_dml(cursor, f"""
                INSERT INTO ODO_PROGRAMAS (NOMBRE, CODIGO, DESCRIPCION, RUTA_FRONTEND, ICONO, MODULO_PADRE_ID, ORDEN, CREADO_POR)
                SELECT '{nombre}', '{codigo}', '{desc}', {ruta_sql}, '{icono}', PROGRAMA_ID, {orden}, 1
                FROM ODO_PROGRAMAS WHERE CODIGO = 'PACIENTES'
            """, f"Sub-programa {codigo}")

        conn.commit()
        print("\n✓ Programas insertados correctamente")

        # ============================================================
        # 4. ASIGNACIÓN POR DEFECTO A ROLES
        # ============================================================
        print("\n4. Asignando programas a roles...")
        print("-"*60)

        # ADMIN - Todos los nuevos sub-programas
        admin_programs = [
            'COMPRAS_PROVEEDORES', 'COMPRAS_ARTICULOS', 'COMPRAS_INVENTARIO', 'COMPRAS_REGISTRO',
            'CONFIG_ROLES', 'CONFIG_CLINICA', 'CONFIG_TRATAMIENTOS', 'CONFIG_CAJAS', 'CONFIG_SUCURSALES',
            'PAC_INFO', 'PAC_ODONTOGRAMA', 'PAC_HISTORIA', 'PAC_TRATAMIENTOS', 'PAC_FACTURACION', 'PAC_ARCHIVOS'
        ]

        print("\n  ADMIN:")
        for prog_code in admin_programs:
            execute_dml(cursor, f"""
                INSERT INTO ODO_ROL_PROGRAMAS (ROL_ID, PROGRAMA_ID, ASIGNADO_POR)
                SELECT r.ROL_ID, p.PROGRAMA_ID, 1
                FROM ODO_ROLES r, ODO_PROGRAMAS p
                WHERE r.CODIGO = 'ADMIN' AND p.CODIGO = '{prog_code}'
            """, f"  ADMIN -> {prog_code}")

        # DOCTOR - Solo tabs relevantes
        doctor_programs = [
            'PAC_INFO', 'PAC_ODONTOGRAMA', 'PAC_HISTORIA', 'PAC_TRATAMIENTOS'
        ]

        print("\n  DOCTOR:")
        for prog_code in doctor_programs:
            execute_dml(cursor, f"""
                INSERT INTO ODO_ROL_PROGRAMAS (ROL_ID, PROGRAMA_ID, ASIGNADO_POR)
                SELECT r.ROL_ID, p.PROGRAMA_ID, 1
                FROM ODO_ROLES r, ODO_PROGRAMAS p
                WHERE r.CODIGO = 'DOCTOR' AND p.CODIGO = '{prog_code}'
            """, f"  DOCTOR -> {prog_code}")

        # SECRETARIA - Info, historia, facturación + compras
        secretaria_programs = [
            'PAC_INFO', 'PAC_HISTORIA', 'PAC_FACTURACION',
            'COMPRAS_PROVEEDORES', 'COMPRAS_ARTICULOS', 'COMPRAS_INVENTARIO', 'COMPRAS_REGISTRO'
        ]

        print("\n  SECRETARIA:")
        for prog_code in secretaria_programs:
            execute_dml(cursor, f"""
                INSERT INTO ODO_ROL_PROGRAMAS (ROL_ID, PROGRAMA_ID, ASIGNADO_POR)
                SELECT r.ROL_ID, p.PROGRAMA_ID, 1
                FROM ODO_ROLES r, ODO_PROGRAMAS p
                WHERE r.CODIGO = 'SECRETARIA' AND p.CODIGO = '{prog_code}'
            """, f"  SECRETARIA -> {prog_code}")

        # CAJERO - Solo info y facturación
        cajero_programs = [
            'PAC_INFO', 'PAC_FACTURACION'
        ]

        print("\n  CAJERO:")
        for prog_code in cajero_programs:
            execute_dml(cursor, f"""
                INSERT INTO ODO_ROL_PROGRAMAS (ROL_ID, PROGRAMA_ID, ASIGNADO_POR)
                SELECT r.ROL_ID, p.PROGRAMA_ID, 1
                FROM ODO_ROLES r, ODO_PROGRAMAS p
                WHERE r.CODIGO = 'CAJERO' AND p.CODIGO = '{prog_code}'
            """, f"  CAJERO -> {prog_code}")

        conn.commit()

        # ============================================================
        # 5. VERIFICACIÓN
        # ============================================================
        print("\n5. Verificando programas insertados...")
        print("-"*60)

        cursor.execute("""
            SELECT p.CODIGO, p.NOMBRE, NVL(padre.CODIGO, '-') AS PADRE
            FROM ODO_PROGRAMAS p
            LEFT JOIN ODO_PROGRAMAS padre ON p.MODULO_PADRE_ID = padre.PROGRAMA_ID
            WHERE p.MODULO_PADRE_ID IS NOT NULL
            ORDER BY padre.CODIGO, p.ORDEN
        """)

        rows = cursor.fetchall()
        current_parent = None
        for codigo, nombre, padre in rows:
            if padre != current_parent:
                print(f"\n  [{padre}]")
                current_parent = padre
            print(f"    - {codigo}: {nombre}")

        print("\n" + "="*60)
        print("DEPLOY COMPLETADO EXITOSAMENTE")
        print("="*60)

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"\nError fatal: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        cursor.close()
        conn.close()
        sys.exit(1)

if __name__ == "__main__":
    main()
