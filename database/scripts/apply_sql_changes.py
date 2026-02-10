import oracledb
import os
import sys
from pathlib import Path
from connect_db import get_connection

def run_script(conn, script_path):
    print(f"Executing {script_path}...")
    with open(script_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Split by '/' on a line by itself
    blocks = []
    current_block = []
    for line in lines:
        if line.strip() == '/':
            blocks.append("\n".join(current_block))
            current_block = []
        else:
            current_block.append(line)
    
    if current_block:
        blocks.append("\n".join(current_block))

    cursor = conn.cursor()
    try:
        for block in blocks:
            clean_block = block.strip()
            if not clean_block: continue
            
            # Standard Oracle DB-API:
            # - PL/SQL blocks (BEGIN/DECLARE/CREATE) MUST end with a semicolon
            # - Simple SQL statements (SELECT/INSERT/etc) MUST NOT end with a semicolon
            
            upper_block = clean_block.upper()
            if upper_block.startswith(('BEGIN', 'DECLARE', 'CREATE')) or 'BEGIN' in upper_block[:50]:
                # Ensure it ends with a semicolon
                if not clean_block.endswith(';'):
                    clean_block += ';'
            else:
                # Remove trailing semicolon for simple statements
                clean_block = clean_block.rstrip(';')
            
            cursor.execute(clean_block)
            print("Successfully executed a block")
        print(f"Finished {script_path}")
    except Exception as e:
        print(f"Error executing {script_path}: {e}")
        raise
    finally:
        cursor.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 apply_sql_changes.py <script_path1> <script_path2> ...")
        sys.exit(1)

    try:
        conn = get_connection()
        for script_path in sys.argv[1:]:
            run_script(conn, script_path)
        conn.commit()
        print("All scripts executed and committed successfully.")
        conn.close()
    except Exception as e:
        print(f"Failed to apply changes: {e}")
        sys.exit(1)
