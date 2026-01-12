# Configuración de Conexión a Oracle Cloud

Esta carpeta contiene las credenciales y configuración para conectarse a Oracle Cloud Database.

## ⚠️ IMPORTANTE - SEGURIDAD

**NUNCA** commitear archivos con credenciales reales a Git:
- ✅ `credentials.example.json` - Plantilla (OK para git)
- ✅ `.env.example` - Plantilla (OK para git)
- ❌ `credentials.json` - Credenciales reales (NO commitear)
- ❌ `.env` - Credenciales reales (NO commitear)
- ❌ `wallet/` - Archivos del wallet (NO commitear)

Estos archivos ya están en `.gitignore` del proyecto.

## Estructura de Archivos

```
config/oracle/
├── README.md                      # Este archivo
├── credentials.example.json       # Plantilla JSON
├── .env.example                   # Plantilla variables de entorno
├── credentials.json               # TUS CREDENCIALES (crear manualmente)
├── .env                           # TUS VARIABLES (crear manualmente)
└── wallet/                        # Wallet de Oracle Cloud (descargar)
    ├── cwallet.sso
    ├── ewallet.p12
    ├── tnsnames.ora
    ├── sqlnet.ora
    └── ...
```

## Configuración Paso a Paso

### 1. Descargar el Wallet de Oracle Cloud

1. Ir a Oracle Cloud Console
2. Navegar a: **Autonomous Database → Tu Base de Datos → DB Connection**
3. Descargar el **Wallet** (archivo ZIP)
4. Crear carpeta: `mkdir -p wallet`
5. Descomprimir el wallet en la carpeta `wallet/`:
   ```bash
   unzip Wallet_NOMBRE.zip -d ./config/oracle/wallet/
   ```

### 2. Crear Archivo de Credenciales

**Opción A: Usar JSON** (recomendado para scripts Python)

```bash
cp credentials.example.json credentials.json
```

Editar `credentials.json` con tus datos reales:
```json
{
  "oracle_cloud": {
    "user": "ADMIN",
    "password": "tu_password_real",
    "dsn": "tu_instancia_high",
    "service_name": "tu_servicio_high",
    "wallet_location": "./config/oracle/wallet",
    "wallet_password": "password_del_wallet",
    "config_dir": "./config/oracle/wallet"
  }
}
```

**Opción B: Usar .env** (recomendado para aplicaciones)

```bash
cp .env.example .env
```

Editar `.env` con tus datos reales.

### 3. Verificar Permisos

```bash
chmod 600 credentials.json
chmod 600 .env
chmod -R 600 wallet/*
```

## Tipos de Conexión

### Thick Mode (Oracle Cloud ATP/ADW) - Recomendado

Requiere:
- ✅ Wallet descargado
- ✅ Librería Oracle Instant Client (se instala automáticamente)
- ✅ `wallet_location` configurado

```python
import oracledb
oracledb.init_oracle_client(config_dir="./config/oracle/wallet")
```

### Thin Mode (sin Wallet)

Solo funciona con bases de datos que no requieren wallet:
```python
connection = oracledb.connect(
    user="usuario",
    password="password",
    dsn="host:port/service"
)
```

## Obtener el DSN/Service Name

El **DSN** o **Service Name** está en el archivo `tnsnames.ora` dentro del wallet.

Ejemplo de `tnsnames.ora`:
```
midb_high = (description= ...)
midb_medium = (description= ...)
midb_low = (description= ...)
```

Usar el nombre (ej: `midb_high`) como `dsn` en las credenciales.

## Ejemplo de Conexión Python

```python
import oracledb
import json

# Leer credenciales
with open('config/oracle/credentials.json') as f:
    config = json.load(f)['oracle_cloud']

# Inicializar cliente (thick mode)
oracledb.init_oracle_client(config_dir=config['config_dir'])

# Conectar
connection = oracledb.connect(
    user=config['user'],
    password=config['password'],
    dsn=config['dsn']
)

print("Conectado exitosamente!")
connection.close()
```

## Troubleshooting

### Error: "DPI-1047: Cannot locate a 64-bit Oracle Client library"
- Instalar Oracle Instant Client:
  ```bash
  pip install oracledb
  ```
- El modo thick se inicializa automáticamente

### Error: "ORA-12154: TNS:could not resolve the connect identifier"
- Verificar que el `dsn` coincida con un nombre en `tnsnames.ora`
- Verificar que `config_dir` apunte a la carpeta del wallet

### Error: "ORA-01017: invalid username/password"
- Verificar credenciales en Oracle Cloud Console
- El usuario por defecto suele ser `ADMIN`

### Error de permisos en wallet
```bash
chmod -R 600 wallet/*
```

## Scripts de Utilidad

Ver `/database/scripts/` para scripts de conexión y pruebas.

## Soporte

Para problemas de conexión, consultar:
- [Oracle Database Python Driver Documentation](https://python-oracledb.readthedocs.io/)
- [Oracle Cloud ATP Connection Guide](https://docs.oracle.com/en/cloud/paas/atp-cloud/)
