import oracledb
from connect_db import get_connection

def check_data():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        print("--- TIMBRADOS ---")
        cursor.execute("SELECT TIMBRADO_ID, EMPRESA_ID, NUMERO_TIMBRADO, ESTABLECIMIENTO, PUNTO_EXPEDICION, ACTIVO FROM ODO_TIMBRADOS")
        rows = cursor.fetchall()
        if not rows:
            print("No hay timbrados cargados.")
        for row in rows:
            print(row)
            
        print("\n--- EMPRESAS ---")
        cursor.execute("SELECT EMPRESA_ID, NOMBRE FROM ODO_EMPRESAS")
        for row in cursor.fetchall():
            print(row)
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_data()
