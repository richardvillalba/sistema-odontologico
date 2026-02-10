from connect_db import get_connection

conn = get_connection()
cursor = conn.cursor()

print("="*60)
print("LISTANDO TODOS LOS ENDPOINTS ORDS DEL MÓDULO FACTURAS")
print("="*60)

try:
    # 1. Listar todos los templates del módulo facturas
    print("\n1. Templates registrados:")
    cursor.execute("""
        SELECT uri_prefix, uri_template
        FROM user_ords_templates
        ORDER BY uri_template
    """)
    
    templates = cursor.fetchall()
    print(f"\nTotal templates: {len(templates)}")
    for template in templates:
        print(f"  - {template[0]}{template[1]}")
    
    # 2. Verificar si existen datos en ODO_USUARIOS
    print("\n2. Verificando datos en ODO_USUARIOS:")
    cursor.execute("SELECT COUNT(*) FROM ODO_USUARIOS")
    user_count = cursor.fetchone()[0]
    print(f"  Total usuarios: {user_count}")
    
    if user_count > 0:
        cursor.execute("""
            SELECT USUARIO_ID, NOMBRE, APELLIDO, EMAIL, ROL_ID
            FROM ODO_USUARIOS
            WHERE ROWNUM <= 3
            ORDER BY USUARIO_ID
        """)
        users = cursor.fetchall()
        print("\n  Primeros 3 usuarios:")
        for user in users:
            print(f"    - ID:{user[0]} {user[1]} {user[2]} ({user[3]}) - Rol:{user[4]}")
    
    # 3. Verificar datos en ODO_ROLES
    print("\n3. Verificando datos en ODO_ROLES:")
    cursor.execute("SELECT COUNT(*) FROM ODO_ROLES")
    role_count = cursor.fetchone()[0]
    print(f"  Total roles: {role_count}")
    
    if role_count > 0:
        cursor.execute("""
            SELECT ROL_ID, CODIGO, NOMBRE, ACTIVO
            FROM ODO_ROLES
            ORDER BY ROL_ID
        """)
        roles = cursor.fetchall()
        print("\n  Roles disponibles:")
        for role in roles:
            print(f"    - ID:{role[0]} {role[1]} - {role[2]} (Activo:{role[3]})")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"\n✗ Error: {e}")
    import traceback
    traceback.print_exc()
    cursor.close()
    conn.close()
