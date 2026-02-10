import oracledb
from connect_db import get_connection

def deploy_ords():
    script_path = "database/scripts/02_billing_ords_endpoints.sql"
    print(f"Reading {script_path}...")
    
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove final / if present (not needed for full script execution in Python)
    content = content.strip()
    if content.endswith('/'):
        content = content[:-1].strip()
        
    print(f"Content length: {len(content)}")
    print(f"Executing block...")
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(content)
        conn.commit()
        print("Successfully deployed ORDS endpoints!")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Deployment failed: {e}")
        # Print line numbers for debugging
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if i > 560 and i < 590: # Check around line 575
                print(f"{i+1}: {line}")

if __name__ == "__main__":
    deploy_ords()
