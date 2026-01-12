# Guía de Conexión a la Base de Datos para Agentes IA

## Para el Usuario (Cómo Indicarle a Otra IA)

Cuando otra IA comience a trabajar en este proyecto, simplemente dile:

```
"Conéctate a la base de datos Oracle. Las credenciales están en
config/oracle/credentials.json y el wallet en config/Wallet_escanor/"
```

O más directo:

```
"Lee el archivo docs/GUIA_CONEXION_IA.md y conéctate a la base de datos"
```

---

## Para la IA que va a Conectarse

### Paso 1: Verificar Requisitos

Primero verifica que estén instalados:

```bash
# Verificar Python y oracledb
python3 --version
python3 -c "import oracledb; print('oracledb instalado')"

# Verificar Oracle Instant Client
ls /opt/oracle/instantclient_23_6/libclntsh.so

# Verificar libaio
ls -la /usr/lib/x86_64-linux-gnu/libaio.so.1
```

Si falta algo, ejecuta:

```bash
# Instalar oracledb
python3 -m pip install --break-system-packages --ignore-installed oracledb

# Instalar libaio
apt-get install -y libaio-dev

# Crear symlink para libaio si es necesario
ln -sf /usr/lib/x86_64-linux-gnu/libaio.so.1t64 /usr/lib/x86_64-linux-gnu/libaio.so.1
```

### Paso 2: Script de Conexión

Usa este script Python para conectarte:

```python
import oracledb
import json
import os

# Leer credenciales
with open('config/oracle/credentials.json') as f:
    config = json.load(f)['oracle_cloud']

# Configurar LD_LIBRARY_PATH
os.environ['LD_LIBRARY_PATH'] = '/opt/oracle/instantclient_23_6:' + os.environ.get('LD_LIBRARY_PATH', '')

# Inicializar Oracle Client (thick mode con wallet)
oracledb.init_oracle_client(
    lib_dir="/opt/oracle/instantclient_23_6",
    config_dir=config['config_dir']
)

# Conectar
connection = oracledb.connect(
    user=config['user'],
    password=config['password'],
    dsn=config['dsn']
)

print("✅ Conectado a Oracle Cloud")

# Usar la conexión
cursor = connection.cursor()
cursor.execute("SELECT COUNT(*) FROM odo_pacientes")
total = cursor.fetchone()[0]
print(f"Total pacientes: {total}")

# Cerrar
cursor.close()
connection.close()
```

### Paso 3: Ejecución con Bash

Si usas Bash directamente, asegúrate de exportar LD_LIBRARY_PATH:

```bash
export LD_LIBRARY_PATH=/opt/oracle/instantclient_23_6:$LD_LIBRARY_PATH

python3 << 'EOF'
import oracledb
import json

with open('config/oracle/credentials.json') as f:
    config = json.load(f)['oracle_cloud']

oracledb.init_oracle_client(
    lib_dir="/opt/oracle/instantclient_23_6",
    config_dir=config['config_dir']
)

connection = oracledb.connect(
    user=config['user'],
    password=config['password'],
    dsn=config['dsn']
)

print("✅ Conectado!")
connection.close()
EOF
```

### Paso 4: Script Reutilizable

Crea un helper Python para reutilizar:

```python
# database/scripts/connect_db.py
import oracledb
import json
import os
from pathlib import Path

def get_connection():
    """Obtiene una conexión a la base de datos Oracle"""

    # Cargar credenciales
    config_path = Path(__file__).parent.parent.parent / "config" / "oracle" / "credentials.json"
    with open(config_path) as f:
        config = json.load(f)['oracle_cloud']

    # Configurar LD_LIBRARY_PATH
    os.environ['LD_LIBRARY_PATH'] = '/opt/oracle/instantclient_23_6:' + os.environ.get('LD_LIBRARY_PATH', '')

    # Inicializar cliente (solo una vez por sesión)
    try:
        oracledb.init_oracle_client(
            lib_dir="/opt/oracle/instantclient_23_6",
            config_dir=config['config_dir']
        )
    except:
        pass  # Ya estaba inicializado

    # Conectar
    connection = oracledb.connect(
        user=config['user'],
        password=config['password'],
        dsn=config['dsn']
    )

    return connection

# Uso:
# from connect_db import get_connection
# conn = get_connection()
# cursor = conn.cursor()
# cursor.execute("SELECT * FROM odo_pacientes")
```

## Información de la Base de Datos

### Credenciales
- **Usuario**: ADMIN
- **Base de datos**: G04D6B70B49B5DA_ESCANOR
- **DSN**: escanor_high
- **Wallet**: `/root/proyectos/sistema-odontologia/config/Wallet_escanor/`

### Tablas Disponibles (28 tablas)

**Pacientes y Clínica:**
- ODO_PACIENTES
- ODO_HISTORIAS_CLINICAS
- ODO_ODONTOGRAMAS
- ODO_DIENTES
- ODO_HALLAZGOS_DIENTE
- ODO_TRATAMIENTOS_DIENTE

**Citas y Tratamientos:**
- ODO_CITAS
- ODO_CATALOGOS_TRATAMIENTOS
- ODO_TRATAMIENTOS_PACIENTE
- ODO_SESIONES_TRATAMIENTO
- ODO_PRESCRIPCIONES

**Facturación:**
- ODO_FACTURAS
- ODO_DETALLES_FACTURA
- ODO_PAGOS
- ODO_TIMBRADOS

**Usuarios y Seguridad:**
- ODO_USUARIOS
- ODO_ROLES
- ODO_USUARIO_ROLES
- ODO_USUARIO_SUCURSALES

**Estructura Organizacional:**
- ODO_EMPRESAS
- ODO_SUCURSALES

**Geografía:**
- ODO_CIUDADES
- ODO_DEPARTAMENTOS
- ODO_BARRIOS
- CIUDAD

**Otros:**
- ODO_ARCHIVOS
- ODO_AUDITORIA
- DBTOOLS$EXECUTION_HISTORY

## Comandos Rápidos

### Ver estructura de una tabla
```python
cursor.execute("""
    SELECT column_name, data_type, data_length, nullable
    FROM user_tab_columns
    WHERE table_name = 'ODO_PACIENTES'
    ORDER BY column_id
""")
for row in cursor:
    print(row)
```

### Listar todas las tablas
```python
cursor.execute("SELECT table_name FROM user_tables ORDER BY table_name")
tables = [row[0] for row in cursor]
print(tables)
```

### Ver packages existentes
```python
cursor.execute("""
    SELECT object_name, object_type, status
    FROM user_objects
    WHERE object_type IN ('PACKAGE', 'PACKAGE BODY')
    ORDER BY object_name
""")
```

## Troubleshooting

### Error: "Cannot locate libclntsh.so"
```bash
export LD_LIBRARY_PATH=/opt/oracle/instantclient_23_6:$LD_LIBRARY_PATH
```

### Error: "libaio.so.1: cannot open shared object"
```bash
ln -sf /usr/lib/x86_64-linux-gnu/libaio.so.1t64 /usr/lib/x86_64-linux-gnu/libaio.so.1
```

### Error: "DPI-1047"
Instala Oracle Instant Client:
```bash
cd /opt/oracle
wget https://download.oracle.com/otn_software/linux/instantclient/2360000/instantclient-basic-linux.x64-23.6.0.24.10.zip -O instantclient-basic.zip
unzip -o instantclient-basic.zip
```

### Error: "module 'oracledb' has no attribute 'init_oracle_client'"
```bash
python3 -m pip install --break-system-packages --ignore-installed oracledb
```

## Seguridad

⚠️ **IMPORTANTE:**
- NUNCA commitear `config/oracle/credentials.json`
- NUNCA commitear archivos del wallet
- Estos archivos están protegidos en `.gitignore`
- Las credenciales son solo para uso local/desarrollo

## Para el Siguiente Agente IA

Si eres una IA leyendo esto:

1. Lee el archivo `config/oracle/credentials.json` para obtener las credenciales
2. Usa el código de ejemplo arriba para conectarte
3. Recuerda exportar `LD_LIBRARY_PATH` si usas Bash
4. La base de datos ya tiene 28 tablas creadas - explóralas antes de crear nuevas
5. Actualiza el archivo `ESTADO.md` después de tu sesión

¡Buena suerte! 🚀
