from connect_db import get_connection
import sys

def execute_dml(cursor, sql, description):
    """Execute a DML statement and handle errors"""
    try:
        cursor.execute(sql)
        rows = cursor.rowcount
        if rows > 0:
            print(f"✓ {description} ({rows} filas)")
        else:
            print(f"⊙ {description} (sin cambios)")
        return True
    except Exception as e:
        error_str = str(e)
        if "ORA-00001" in error_str:  # Unique constraint violated
            print(f"⊙ {description} (datos ya existen)")
            return True
        else:
            print(f"✗ Error en {description}: {e}")
            return False

def main():
    print("="*60)
    print("INSERTANDO DATOS INICIALES - MÓDULO DE SEGURIDAD")
    print("="*60)
    
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # 1. ROLES
        print("\n1. Insertando Roles...")
        print("-"*60)
        
        # Insert CAJERO role which may be missing
        execute_dml(cursor, """
            INSERT INTO ODO_ROLES (NOMBRE, CODIGO, DESCRIPCION, CREADO_POR)
            VALUES ('Cajero', 'CAJERO', 'Personal de caja con acceso limitado a cobros y reportes', 1)
        """, "Rol CAJERO")
        
        # 2. PROGRAMAS
        print("\n2. Insertando Programas...")
        print("-"*60)
        
        programs = [
            ("Dashboard", "DASHBOARD", "Página principal", "/", "📊", 1),
            ("Pacientes", "PACIENTES", "Gestión de pacientes", "/pacientes", "👥", 2),
            ("Citas", "CITAS", "Gestión de citas y agenda", "/citas", "📅", 3),
            ("Tratamientos", "TRATAMIENTOS", "Gestión de tratamientos odontológicos", "/tratamientos", "🦷", 4),
            ("Facturación", "FACTURACION", "Módulo de facturación", "/facturas", "🧾", 5),
            ("Caja", "CAJA", "Control de caja", "/caja", "💰", 6),
            ("Reportes", "REPORTES", "Reportes y estadísticas", "/reportes", "📈", 7),
            ("Configuraciones", "CONFIGURACIONES", "Configuraciones del sistema", "/configuraciones", "⚙️", 10)
        ]
        
        for nombre, codigo, desc, ruta, icono, orden in programs:
            execute_dml(cursor, f"""
                INSERT INTO ODO_PROGRAMAS (NOMBRE, CODIGO, DESCRIPCION, RUTA_FRONTEND, ICONO, ORDEN, CREADO_POR)
                VALUES ('{nombre}', '{codigo}', '{desc}', '{ruta}', '{icono}', {orden}, 1)
            """, f"Programa {codigo}")
        
        # Sub-módulos de Configuraciones
        print("\n3. Insertando Sub-Módulos de Configuraciones...")
        print("-"*60)
        
        execute_dml(cursor, """
            INSERT INTO ODO_PROGRAMAS (NOMBRE, CODIGO, DESCRIPCION, RUTA_FRONTEND, ICONO, MODULO_PADRE_ID, ORDEN, CREADO_POR)
            SELECT 'Gestión de Empresas', 'CONFIG_EMPRESAS', 'Administración de empresas/clínicas', '/configuraciones/empresas', '🏢', PROGRAMA_ID, 1, 1
            FROM ODO_PROGRAMAS WHERE CODIGO = 'CONFIGURACIONES'
        """, "Programa CONFIG_EMPRESAS")
        
        execute_dml(cursor, """
            INSERT INTO ODO_PROGRAMAS (NOMBRE, CODIGO, DESCRIPCION, RUTA_FRONTEND, ICONO, MODULO_PADRE_ID, ORDEN, CREADO_POR)
            SELECT 'Timbrados', 'CONFIG_TIMBRADOS', 'Gestión de timbrados fiscales', '/configuraciones/timbrados', '🧾', PROGRAMA_ID, 2, 1
            FROM ODO_PROGRAMAS WHERE CODIGO = 'CONFIGURACIONES'
        """, "Programa CONFIG_TIMBRADOS")
        
        execute_dml(cursor, """
            INSERT INTO ODO_PROGRAMAS (NOMBRE, CODIGO, DESCRIPCION, RUTA_FRONTEND, ICONO, MODULO_PADRE_ID, ORDEN, CREADO_POR)
            SELECT 'Usuarios y Roles', 'CONFIG_USUARIOS', 'Gestión de usuarios y permisos', '/configuraciones/usuarios', '👥', PROGRAMA_ID, 3, 1
            FROM ODO_PROGRAMAS WHERE CODIGO = 'CONFIGURACIONES'
        """, "Programa CONFIG_USUARIOS")
        
        # 4. PERMISOS GENERALES
        print("\n4. Insertando Permisos Generales...")
        print("-"*60)
        
        general_perms = [
            ("Crear registros", "CREAR", "Permiso para crear nuevos registros"),
            ("Editar registros", "EDITAR", "Permiso para modificar registros existentes"),
            ("Eliminar registros", "ELIMINAR", "Permiso para eliminar registros"),
            ("Ver registros", "VER", "Permiso para visualizar registros"),
            ("Anular documentos", "ANULAR", "Permiso para anular documentos (facturas, recibos, etc.)"),
            ("Exportar datos", "EXPORTAR", "Permiso para exportar información")
        ]
        
        for nombre, codigo, desc in general_perms:
            execute_dml(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, CREADO_POR)
                VALUES ('{nombre}', '{codigo}', '{desc}', 1)
            """, f"Permiso {codigo}")
        
        # 5. PERMISOS ESPECÍFICOS
        print("\n5. Insertando Permisos Específicos...")
        print("-"*60)
        
        # Empresas
        empresa_perms = [
            ("Crear empresas", "EMPRESA_CREAR", "Crear nuevas empresas en el sistema"),
            ("Editar todas las empresas", "EMPRESA_EDITAR_TODAS", "Editar cualquier empresa del sistema"),
            ("Editar solo su empresa", "EMPRESA_EDITAR_PROPIA", "Editar solo los datos de su empresa"),
            ("Activar/Inactivar empresas", "EMPRESA_ACTIVAR", "Activar o inactivar empresas"),
            ("Ver todas las empresas", "EMPRESA_VER_TODAS", "Ver listado completo de empresas")
        ]
        
        for nombre, codigo, desc in empresa_perms:
            execute_dml(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID, CREADO_POR)
                SELECT '{nombre}', '{codigo}', '{desc}', PROGRAMA_ID, 1
                FROM ODO_PROGRAMAS WHERE CODIGO = 'CONFIG_EMPRESAS'
            """, f"Permiso {codigo}")
        
        # Facturación
        factura_perms = [
            ("Crear facturas", "FACTURA_CREAR", "Crear nuevas facturas"),
            ("Anular facturas", "FACTURA_ANULAR", "Anular facturas existentes"),
            ("Ver todas las facturas", "FACTURA_VER_TODAS", "Ver facturas de todas las empresas"),
            ("Aplicar descuentos", "FACTURA_DESCUENTO", "Aplicar descuentos en facturas")
        ]
        
        for nombre, codigo, desc in factura_perms:
            execute_dml(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID, CREADO_POR)
                SELECT '{nombre}', '{codigo}', '{desc}', PROGRAMA_ID, 1
                FROM ODO_PROGRAMAS WHERE CODIGO = 'FACTURACION'
            """, f"Permiso {codigo}")
        
        # Caja
        caja_perms = [
            ("Abrir caja", "CAJA_ABRIR", "Abrir una caja al inicio del día"),
            ("Cerrar caja", "CAJA_CERRAR", "Cerrar caja al final del día"),
            ("Registrar ingresos", "CAJA_INGRESO", "Registrar ingresos en caja"),
            ("Registrar egresos", "CAJA_EGRESO", "Registrar egresos/gastos"),
            ("Ver arqueo de otras cajas", "CAJA_VER_TODAS", "Ver movimientos de todas las cajas")
        ]
        
        for nombre, codigo, desc in caja_perms:
            execute_dml(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID, CREADO_POR)
                SELECT '{nombre}', '{codigo}', '{desc}', PROGRAMA_ID, 1
                FROM ODO_PROGRAMAS WHERE CODIGO = 'CAJA'
            """, f"Permiso {codigo}")
        
        conn.commit()
        print("\n¡Datos iniciales insertados con éxito!")
        print("="*60)
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\nError fatal: {e}")
        conn.rollback()
        cursor.close()
        conn.close()
        sys.exit(1)

if __name__ == "__main__":
    main()
