import requests
import json

# Configuración
BASE_URL = "https://g04d6b70b49b5da-escanor.adb.sa-vinhedo-1.oraclecloudapps.io/ords/admin/facturas/dashboard"
# Nota: Usamos https y desactivamos verificación de SSL por el entorno local
EMPRESA_ID = 1

def test_stats():
    print(f"Probando GET /stats?empresa_id={EMPRESA_ID}...")
    try:
        response = requests.get(f"{BASE_URL}/stats?empresa_id={EMPRESA_ID}", verify=False)
        print(f"Status: {response.status_code}")
        print("Response JSON:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

def test_actividad():
    print(f"\nProbando GET /actividad-semanal?empresa_id={EMPRESA_ID}...")
    try:
        response = requests.get(f"{BASE_URL}/actividad-semanal?empresa_id={EMPRESA_ID}", verify=False)
        print(f"Status: {response.status_code}")
        print("Response JSON (first item):")
        data = response.json()
        if "items" in data and len(data["items"]) > 0:
            print(json.dumps(data["items"][0], indent=2))
        else:
            print("No items found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_stats()
    test_actividad()
