import requests
import json

def test_ords():
    base_url = "https://g04d6b70b49b5da-escanor.adb.sa-vinhedo-1.oraclecloudapps.com/ords/admin/facturas/timbrados"
    params = {"empresa_id": 1}
    
    print(f"Testing ORDS at: {base_url}")
    print(f"Params: {params}")
    
    try:
        response = requests.get(base_url, params=params, timeout=10)
        print(f"Status Code: {response.status_code}")
        print("Response Headers:")
        print(json.dumps(dict(response.headers), indent=2))
        
        try:
            data = response.json()
            print("Response Data:")
            print(json.dumps(data, indent=2))
        except:
            print("Response is not JSON:")
            print(response.text[:500])
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_ords()
