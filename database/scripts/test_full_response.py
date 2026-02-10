import requests
import json

def test_full_response():
    base_url = "https://g04d6b70b49b5da-escanor.adb.sa-vinhedo-1.oraclecloudapps.com/ords/admin/facturas"
    usuario_id = 1
    
    print(f"--- TESTING GET PUNTOS FOR USER {usuario_id} ---")
    try:
        res = requests.get(f"{base_url}/usuarios/{usuario_id}/puntos")
        print(f"Status: {res.status_code}")
        print("Response JSON:")
        print(json.dumps(res.json(), indent=2))
    except Exception as e:
        print(f"Failed: {e}")

    timbrado_id = 27
    print(f"\n--- TESTING GET USERS FOR TIMBRADO {timbrado_id} ---")
    try:
        res = requests.get(f"{base_url}/timbrados/{timbrado_id}/usuarios")
        print(f"Status: {res.status_code}")
        print("Response JSON:")
        print(json.dumps(res.json(), indent=2))
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_full_response()
