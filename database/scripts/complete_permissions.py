from connect_db import get_connection
import time

def safe_insert(cursor, sql, description):
    """Execute insert with retry and better error handling"""
    try:
        cursor.execute(sql)
        rows = cursor.rowcount
        if rows > 0:
            print(f"✓ {description} ({rows} fila(s))")
        return True
    except Exception as e:
        error_str = str(e)
        if "ORA-00001" in error_str:
            print(f"⊙  {description} (ya existe)")
            return True
        elif "ORA-12801" in error_str or "ORA-12860" in error_str:
            # Deadlock, retry after small delay
            time.sleep(0.5)
            try:
                cursor.execute(sql)
                print(f"✓ {description} (reintentar exitoso)")
                return True
            except Exception as e2:
                if "ORA-00001" in str(e2):
                    print(f"⊙ {description} (ya existe)")
                    return True
                print(f"✗ Error en {description}: {e2}")
                return False
        else:
            print(f"✗ Error en {description}: {e}")
            return False

def main():
    print("="*60)
    print("COMPLETANDO DATOS DE SEGURIDAD - PERMISOS Y ASIGNACIONES")
    print("="*60)
    
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # Get IDs first to avoid subqueries causing deadlocks
        print("\n1. Obteniendo IDs de Programas...")
        print("-"*60)
        
        cursor.execute("SELECT PROGRAMA_ID FROM ODO_PROGRAMAS WHERE CODIGO = 'CONFIG_EMPRESAS'")
        empresa_prog_id = cursor.fetchone()[0] if cursor.rowcount > 0 else None
        print(f"CONFIG_EMPRESAS ID: {empresa_prog_id}")
        
        cursor.execute("SELECT PROGRAMA_ID FROM ODO_PROGRAMAS WHERE CODIGO = 'FACTURACION'")
        facturacion_prog_id = cursor.fetchone()[0] if cursor.rowcount > 0 else None
        print(f"FACTURACION ID: {facturacion_prog_id}")
        
        cursor.execute("SELECT PROGRAMA_ID FROM ODO_PROGRAMAS WHERE CODIGO = 'CAJA'")
        caja_prog_id = cursor.fetchone()[0] if cursor.rowcount > 0 else None
        print(f"CAJA ID: {caja_prog_id}")
        
        # Insert specific permissions with fixed IDs
        print("\n2. Insertando Permisos Específicos para Empresas...")
        print("-"*60)
        
        if empresa_prog_id:
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Crear empresas', 'EMPRESA_CREAR', 'Crear nuevas empresas en el sistema', {empresa_prog_id})
            """, "EMPRESA_CREAR")
            
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Editar todas las empresas', 'EMPRESA_EDITAR_TODAS', 'Editar cualquier empresa del sistema', {empresa_prog_id})
            """, "EMPRESA_EDITAR_TODAS")
            
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Editar solo su empresa', 'EMPRESA_EDITAR_PROPIA', 'Editar solo los datos de su empresa', {empresa_prog_id})
            """, "EMPRESA_EDITAR_PROPIA")
            
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Activar/Inactivar empresas', 'EMPRESA_ACTIVAR', 'Activar o inactivar empresas', {empresa_prog_id})
            """, "EMPRESA_ACTIVAR")
            
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Ver todas las empresas', 'EMPRESA_VER_TODAS', 'Ver listado completo de empresas', {empresa_prog_id})
            """, "EMPRESA_VER_TODAS")
        
        print("\n3. Insertando Permisos Específicos para Facturación...")
        print("-"*60)
        
        if facturacion_prog_id:
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Crear facturas', 'FACTURA_CREAR', 'Crear nuevas facturas', {facturacion_prog_id})
            """, "FACTURA_CREAR")
            
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Anular facturas', 'FACTURA_ANULAR', 'Anular facturas existentes', {facturacion_prog_id})
            """, "FACTURA_ANULAR")
            
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Ver todas las facturas', 'FACTURA_VER_TODAS', 'Ver facturas de todas las empresas', {facturacion_prog_id})
            """, "FACTURA_VER_TODAS")
            
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Aplicar descuentos', 'FACTURA_DESCUENTO', 'Aplicar descuentos en facturas', {facturacion_prog_id})
            """, "FACTURA_DESCUENTO")
        
        print("\n4. Insertando Permisos Específicos para Caja...")
        print("-"*60)
        
        if caja_prog_id:
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Abrir caja', 'CAJA_ABRIR', 'Abrir una caja al inicio del día', {caja_prog_id})
            """, "CAJA_ABRIR")
            
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Cerrar caja', 'CAJA_CERRAR', 'Cerrar caja al final del día', {caja_prog_id})
            """, "CAJA_CERRAR")
            
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Registrar ingresos', 'CAJA_INGRESO', 'Registrar ingresos en caja', {caja_prog_id})
            """, "CAJA_INGRESO")
            
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Registrar egresos', 'CAJA_EGRESO', 'Registrar egresos/gastos', {caja_prog_id})
            """, "CAJA_EGRESO")
            
            safe_insert(cursor, f"""
                INSERT INTO ODO_PERMISOS (NOMBRE, CODIGO, DESCRIPCION, PROGRAMA_ID)
                VALUES ('Ver arqueo de otras cajas', 'CAJA_VER_TODAS', 'Ver movimientos de todas las cajas', {caja_prog_id})
            """, "CAJA_VER_TODAS")
        
        # Assign role to admin user
        print("\n5. Asignando rol ADMIN al usuario 1...")
        print("-"*60)
        
        cursor.execute("SELECT ROL_ID FROM ODO_ROLES WHERE CODIGO = 'ADMIN'")
        admin_rol_id = cursor.fetchone()[0] if cursor.rowcount > 0 else None
        
        if admin_rol_id:
            safe_insert(cursor, f"""
                UPDATE ODO_USUARIOS
                SET ROL_ID = {admin_rol_id}
                WHERE USUARIO_ID = 1 AND (ROL_ID IS NULL OR ROL_ID != {admin_rol_id})
            """, "Asignar rol ADMIN a usuario 1")
        
        conn.commit()
        print("\n¡Datos completados con éxito!")
        print("="*60)
        
        # Show summary
        print("\nResumen:")
        cursor.execute("SELECT COUNT(*) FROM ODO_ROLES")
        print(f"  - Roles: {cursor.fetchone()[0]}")
        cursor.execute("SELECT COUNT(*) FROM ODO_PROGRAMAS")
        print(f"  - Programas: {cursor.fetchone()[0]}")
        cursor.execute("SELECT COUNT(*) FROM ODO_PERMISOS")
        print(f"  - Permisos: {cursor.fetchone()[0]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\nError fatal: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        cursor.close()
        conn.close()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
