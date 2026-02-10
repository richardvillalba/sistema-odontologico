import requests
import json

def keys_to_lower(obj):
    if isinstance(obj, list):
        return [keys_to_lower(v) for v in obj]
    elif isinstance(obj, dict):
        return {k.lower(): keys_to_lower(v) for k, v in obj.items()}
    return obj

def test_full_stack():
    # 1. Test Billing Alerts (Simulating AlertasTimbrados.jsx)
    url = "https://g04d6b70b49b5da-escanor.adb.sa-vinhedo-1.oraclecloudapps.com/ords/admin/facturas/timbrados/alertas"
    params = {"empresa_id": 1}
    
    print(f"--- TESTING BILLING ALERTS ---")
    try:
        res = requests.get(url, params=params)
        data = res.json()
        standardized = keys_to_lower(data)
        
        # Verify keys expected by AlertasTimbrados.jsx
        items = standardized.get('items', [])
        if items:
            alerta = items[0]
            print(f"Verified keys in first alert:")
            print(f" - tipo_alerta: {alerta.get('tipo_alerta')}")
            print(f" - numero_timbrado: {alerta.get('numero_timbrado')}")
            
            if 'tipo_alerta' in alerta and alerta['tipo_alerta']:
                print(f"SUCCESS: 'tipo_alerta' found and has value: {alerta['tipo_alerta']}")
            else:
                print(f"FAILURE: 'tipo_alerta' is missing or null!")
        else:
            print("No alerts returned, but keys names cannot be verified.")
            
    except Exception as e:
        print(f"Alerts test failed: {e}")

    # 2. Test Timbrados (Simulating TimbradosList.jsx)
    url = "https://g04d6b70b49b5da-escanor.adb.sa-vinhedo-1.oraclecloudapps.com/ords/admin/facturas/timbrados"
    print(f"\n--- TESTING TIMBRADOS ---")
    try:
        res = requests.get(url, params=params)
        data = res.json()
        standardized = keys_to_lower(data)
        items = standardized.get('items', [])
        if items:
            timbrado = items[0]
            print(f"Verified keys in first timbrado:")
            print(f" - timbrado_id: {timbrado.get('timbrado_id')}")
            print(f" - numero_timbrado: {timbrado.get('numero_timbrado')}")
        else:
            print("No timbrados returned.")
    except Exception as e:
        print(f"Timbrados test failed: {e}")

if __name__ == "__main__":
    test_full_stack()
