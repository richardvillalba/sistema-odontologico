// En desarrollo: usa /api (proxy de Vite evita CORS)
// En producción: llama directo a ORDS
const ORDS_BASE = 'https://g04d6b70b49b5da-escanor.adb.sa-vinhedo-1.oraclecloudapps.com/ords/admin';

export const API_BASE_URL = import.meta.env.DEV ? '/api' : ORDS_BASE;
export const IS_PRODUCTION = !import.meta.env.DEV;
