from connect_db import get_connection

def check_errors():
    conn = get_connection()
    cursor = conn.cursor()
    
    print("--- USER_ERRORS (PKG_FACTURAS) ---")
    cursor.execute("""
        SELECT NAME, TYPE, LINE, POSITION, TEXT 
        FROM USER_ERRORS 
        WHERE NAME = 'PKG_FACTURAS'
        ORDER BY TYPE, LINE
    """)
    errors = cursor.fetchall()
    if not errors:
        print("No errors found in USER_ERRORS for PKG_FACTURAS.")
    else:
        for row in errors:
            print(row)
            
    cursor.close()
    conn.close()

if __name__ == "__main__":
    check_errors()
