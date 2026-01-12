# Guía de Conexión a Oracle Cloud

## Estado Actual

✅ **Configuración Completada:**
- Driver `oracledb` instalado
- Credenciales configuradas en `config/oracle/credentials.json`
- Wallet descargado en `config/Wallet_escanor/`
- Archivo `sqlnet.ora` actualizado con rutas de Linux

## Problema Identificado

Oracle Cloud ATP requiere **conexión segura con wallet** (SSL/TLS). El modo "thin" de `oracledb` para Python tiene limitaciones con wallets en Oracle Cloud ATP.

## Soluciones Disponibles

### Opción 1: Instalar Oracle Instant Client (Recomendado)

Para usar el modo "thick" con wallet desde Python:

```bash
# Descargar e instalar Oracle Instant Client
cd /opt/oracle
wget https://download.oracle.com/otn_software/linux/instantclient/instantclient-basiclite-linuxx64.zip
unzip instantclient-basiclite-linuxx64.zip
export LD_LIBRARY_PATH=/opt/oracle/instantclient_XX_X:$LD_LIBRARY_PATH
```

Luego en Python:
```python
import oracledb
oracledb.init_oracle_client(lib_dir="/opt/oracle/instantclient_XX_X")
```

### Opción 2: Usar SQL Developer o SQLcl

Si tienes SQL Developer o SQLcl instalado localmente con el wallet configurado, puedes:

1. Ejecutar queries directamente
2. Exportar resultados
3. Compartir scripts SQL

### Opción 3: Usar ORDS (Oracle REST Data Services)

Configurar ORDS para exponer APIs REST y conectarse desde Python vía HTTP/REST (sin necesidad de wallet).

### Opción 4: Generar Scripts SQL

Puedo generar todos los scripts SQL necesarios (packages, procedures, DDL) y tú los ejecutas manualmente en SQL Developer.

## Archivos de Configuración

### credentials.json
```json
{
  "oracle_cloud": {
    "user": "ADMIN",
    "password": "Rv_19_12_1997",
    "dsn": "escanor_high",
    "service_name": "g04d6b70b49b5da_escanor_high.adb.oraclecloud.com",
    "host": "adb.sa-vinhedo-1.oraclecloud.com",
    "port": 1522,
    "wallet_location": "/root/proyectos/sistema-odontologia/config/Wallet_escanor",
    "config_dir": "/root/proyectos/sistema-odontologia/config/Wallet_escanor",
    "connection_type": "thick"
  }
}
```

### Wallet
- Ubicación: `/root/proyectos/sistema-odontologia/config/Wallet_escanor/`
- Archivos: `cwallet.sso`, `ewallet.p12`, `tnsnames.ora`, `sqlnet.ora`
- DSN disponibles: `escanor_high`, `escanor_medium`, `escanor_low`

## ¿Qué podemos hacer ahora?

1. **Generar scripts SQL** - Puedo crear todos los packages, procedures y DDL necesarios
2. **Diseñar modelo de datos** - Crear la estructura de tablas
3. **Documentar API** - Diseñar los endpoints REST que necesitarás
4. **Trabajar en el frontend** - Inicializar el proyecto React
5. **Instalar Instant Client** - Para habilitar conexión desde Python

## Próximos Pasos Recomendados

1. Diseñar modelo de datos (tablas principales)
2. Generar scripts DDL
3. Crear primer package PL/SQL de ejemplo
4. Tú ejecutas los scripts en SQL Developer
5. Documentamos la estructura creada

¿Con cuál quieres continuar?
