import oracledb
from connect_db import get_connection

def check_errors():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        print("--- ERRORES EN PKG_FACTURAS (BODY) ---")
        cursor.execute("""
            SELECT line, position, text 
            FROM user_errors 
            WHERE name = 'PKG_FACTURAS' 
              AND type = 'PACKAGE BODY' 
            ORDER BY line
        """)
        errors = cursor.fetchall()
        if not errors:
            print("No se encontraron errores en el cuerpo del paquete (según user_errors).")
        else:
            for line, pos, text in errors:
                print(f"Línea {line}, Pos {pos}: {text}")

        print("\n--- ERRORES EN PKG_FACTURAS (SPEC) ---")
        cursor.execute("""
            SELECT line, position, text 
            FROM user_errors 
            WHERE name = 'PKG_FACTURAS' 
              AND type = 'PACKAGE' 
            ORDER BY line
        """)
        for line, pos, text in cursor.fetchall():
            print(f"Línea {line}, Pos {pos}: {text}")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_errors()
