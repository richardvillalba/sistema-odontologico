from connect_db import get_connection

# Simple test to apply security schema
conn = get_connection()
cursor = conn.cursor()

# Test if tables already exist
try:
    cursor.execute("SELECT COUNT(*) FROM ODO_ROLES")
    print("ODO_ROLES already exists")
    result = cursor.fetchone()
    print(f"Roles count: {result[0]}")
except Exception as e:
    print(f"ODO_ROLES doesn't exist or error: {e}")

try:
    cursor.execute("SELECT COUNT(*) FROM ODO_PROGRAMAS")
    print("ODO_PROGRAMAS already exists")
    result = cursor.fetchone()
    print(f"Programs count: {result[0]}")
except Exception as e:
    print(f"ODO_PROGRAMAS doesn't exist or error: {e}")

cursor.close()
conn.close()
