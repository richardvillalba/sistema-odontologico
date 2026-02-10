from connect_db import get_connection

# Check structure of ODO_ROLES table
conn = get_connection()
cursor = conn.cursor()

print("Estructura de ODO_ROLES:")
cursor.execute("""
    SELECT COLUMN_NAME, DATA_TYPE, NULLABLE
    FROM USER_TAB_COLUMNS
    WHERE TABLE_NAME = 'ODO_ROLES'
    ORDER BY COLUMN_ID
""")

for row in cursor.fetchall():
    print(f"  - {row[0]}: {row[1]} (NULL={row[2]})")

print("\nRoles existentes:")
cursor.execute("SELECT ROL_ID, NOMBRE, CODIGO FROM ODO_ROLES")
for row in cursor.fetchall():
    print(f"  - {row[0]}: {row[1]} ({row[2]})")

print("\nProgramas existentes:")
cursor.execute("SELECT COUNT(*) FROM ODO_PROGRAMAS")
print(f"  Total: {cursor.fetchone()[0]}")

print("\nPermisos existentes:")
cursor.execute("SELECT COUNT(*) FROM ODO_PERMISOS")
print(f"  Total: {cursor.fetchone()[0]}")

cursor.close()
conn.close()
