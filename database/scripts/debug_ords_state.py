from connect_db import get_connection

def check_ords_state():
    conn = get_connection()
    cursor = conn.cursor()
    
    print("--- ORDS MODULES ---")
    cursor.execute("SELECT name, uri_prefix FROM user_ords_modules")
    for row in cursor:
        print(row)
        
    print("\n--- ORDS TEMPLATES ---")
    cursor.execute("SELECT module_name, uri_template FROM user_ords_templates")
    for row in cursor:
        print(row)
        
    print("\n--- ORDS HANDLERS ---")
    cursor.execute("SELECT module_name, uri_template, method, source_type FROM user_ords_handlers")
    for row in cursor:
        print(row)
        
    cursor.close()
    conn.close()

if __name__ == "__main__":
    check_ords_state()
