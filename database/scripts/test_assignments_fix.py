import requests
import json

def keys_to_lower(obj):
    if isinstance(obj, list):
        return [keys_to_lower(v) for v in obj]
    elif isinstance(obj, dict):
        return {k.lower(): keys_to_lower(v) for k, v in obj.items()}
    return obj

def test_assignments():
    base_url = "https://g04d6b70b49b5da-escanor.adb.sa-vinhedo-1.oraclecloudapps.com/ords/admin/facturas"
    
    # 1. Test GET Users (Was 555 in user screenshot?)
    print(f"--- TESTING GET ALL USERS (/facturas/usuarios) ---")
    try:
        res = requests.get(f"{base_url}/usuarios")
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = keys_to_lower(res.json())
            print(f"Items found: {len(data.get('items', []))}")
        else:
            print(f"Response: {res.text}")
    except Exception as e:
        print(f"Failed: {e}")

    # 2. Test GET Users for Timbrado (Was 404)
    timbrado_id = 25 # Looking at user screenshot, it might be 25
    print(f"\n--- TESTING GET USERS FOR TIMBRADO {timbrado_id} (/facturas/timbrados/{timbrado_id}/usuarios) ---")
    try:
        res = requests.get(f"{base_url}/timbrados/{timbrado_id}/usuarios")
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = keys_to_lower(res.json())
            print(f"Items: {len(data.get('items', []))}")
        else:
            print(f"Response: {res.text}")
    except Exception as e:
        print(f"Failed: {e}")

    # 3. Test GET Puntos for User (Was 555)
    usuario_id = 1
    print(f"\n--- TESTING GET PUNTOS FOR USER {usuario_id} (/facturas/usuarios/{usuario_id}/puntos) ---")
    try:
        res = requests.get(f"{base_url}/usuarios/{usuario_id}/puntos")
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = keys_to_lower(res.json())
            print(f"Items: {len(data.get('items', []))}")
        else:
            print(f"Response: {res.text}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_assignments()
