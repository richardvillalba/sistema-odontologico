import requests
import json

def test_ords():
    # URL original que funcionaba para los otros servicios
    base_url = "https://g04d6b70b49b5da-escanor.adb.sa-vinhedo-1.oraclecloudapps.com/ords/admin/api/v1/pacientes"
    
    print(f"Testing ORDS OLD URL at: {base_url}")
    
    try:
        response = requests.get(base_url, timeout=10)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ El backend original sigue respondiendo correctamente.")
        else:
            print(f"❌ El backend original respondió con error {response.status_code}.")
            print(response.text[:200])
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_ords()
