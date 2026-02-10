from connect_db import get_connection

def dump_tables():
    conn = get_connection()
    cursor = conn.cursor()
    
    print("--- ODO_USUARIOS ---")
    cursor.execute("SELECT USUARIO_ID, NOMBRE, APELLIDO, EMAIL FROM ODO_USUARIOS WHERE ROWNUM <= 5")
    for row in cursor:
        print(row)
        
    print("\n--- ODO_TIMBRADOS ---")
    cursor.execute("SELECT TIMBRADO_ID, NUMERO_TIMBRADO, ACTIVO FROM ODO_TIMBRADOS")
    for row in cursor:
        print(row)
        
    print("\n--- ODO_USUARIO_PUNTOS_EXPEDICION ---")
    cursor.execute("SELECT * FROM ODO_USUARIO_PUNTOS_EXPEDICION")
    for row in cursor:
        print(row)
        
    cursor.close()
    conn.close()

if __name__ == "__main__":
    dump_tables()
