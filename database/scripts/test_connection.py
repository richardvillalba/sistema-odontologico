#!/usr/bin/env python3
"""
Script de prueba de conexión a Oracle Cloud Database

Uso:
    python3 test_connection.py

Descripción:
    Intenta conectarse a la base de datos Oracle usando las credenciales
    configuradas en config/oracle/credentials.json
"""

import sys
import json
import os
from pathlib import Path

try:
    import oracledb
except ImportError:
    print("❌ Error: módulo 'oracledb' no instalado")
    print("Instalar con: pip3 install oracledb")
    sys.exit(1)


def load_credentials():
    """Carga las credenciales desde el archivo JSON"""
    cred_path = Path(__file__).parent.parent.parent / "config" / "oracle" / "credentials.json"

    if not cred_path.exists():
        print(f"❌ Error: Archivo de credenciales no encontrado: {cred_path}")
        print("Crear el archivo desde credentials.example.json")
        sys.exit(1)

    with open(cred_path) as f:
        return json.load(f)["oracle_cloud"]


def test_connection():
    """Prueba la conexión a Oracle Cloud"""
    print("🔄 Cargando credenciales...")
    config = load_credentials()

    print(f"📁 Usuario: {config['user']}")
    print(f"📁 DSN: {config['dsn']}")

    # Inicializar cliente Oracle (thick mode) si es necesario
    if "config_dir" in config and config["config_dir"]:
        wallet_path = Path(__file__).parent.parent.parent / config["config_dir"]
        if wallet_path.exists():
            print(f"🔐 Inicializando con wallet: {wallet_path}")
            try:
                oracledb.init_oracle_client(config_dir=str(wallet_path))
                print("✅ Cliente Oracle inicializado (thick mode)")
            except Exception as e:
                print(f"⚠️  Advertencia al inicializar cliente: {e}")
                print("Intentando continuar en thin mode...")

    try:
        print("\n🔄 Intentando conectar...")
        connection = oracledb.connect(
            user=config["user"],
            password=config["password"],
            dsn=config["dsn"]
        )

        print("✅ ¡Conexión exitosa!")

        # Obtener información básica
        cursor = connection.cursor()
        cursor.execute("SELECT user, sys_context('userenv', 'db_name') FROM dual")
        user, db_name = cursor.fetchone()

        print(f"\n📊 Información de la conexión:")
        print(f"   Usuario conectado: {user}")
        print(f"   Base de datos: {db_name}")

        # Listar tablas del usuario
        cursor.execute("""
            SELECT table_name
            FROM user_tables
            ORDER BY table_name
        """)
        tables = cursor.fetchall()

        print(f"\n📋 Tablas encontradas ({len(tables)}):")
        for table in tables:
            print(f"   - {table[0]}")

        cursor.close()
        connection.close()
        print("\n✅ Conexión cerrada correctamente")

        return True

    except oracledb.DatabaseError as e:
        error, = e.args
        print(f"\n❌ Error de base de datos:")
        print(f"   Código: {error.code}")
        print(f"   Mensaje: {error.message}")
        return False
    except Exception as e:
        print(f"\n❌ Error inesperado: {str(e)}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("🔧 Test de Conexión a Oracle Cloud Database")
    print("=" * 60)
    print()

    success = test_connection()

    print()
    print("=" * 60)
    if success:
        print("✅ Test completado exitosamente")
    else:
        print("❌ Test falló - revisar configuración")
    print("=" * 60)

    sys.exit(0 if success else 1)
