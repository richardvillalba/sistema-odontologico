#!/usr/bin/env python3
"""
Helper para conectarse a la base de datos Oracle Cloud

Uso:
    from connect_db import get_connection

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM odo_pacientes")
    # ... usar la conexión
    cursor.close()
    conn.close()
"""

import oracledb
import json
import os
from pathlib import Path

# Variable global para controlar si ya se inicializó el cliente
_oracle_client_initialized = False


def get_connection():
    """
    Obtiene una conexión a la base de datos Oracle Cloud.

    Returns:
        oracledb.Connection: Conexión activa a Oracle

    Raises:
        Exception: Si no puede conectarse
    """
    global _oracle_client_initialized

    # Cargar credenciales
    config_path = Path(__file__).parent.parent.parent / "config" / "oracle" / "credentials.json"

    if not config_path.exists():
        raise FileNotFoundError(f"Archivo de credenciales no encontrado: {config_path}")

    with open(config_path) as f:
        config = json.load(f)['oracle_cloud']

    # Configurar LD_LIBRARY_PATH
    lib_path = '/opt/oracle/instantclient_23_6'
    os.environ['LD_LIBRARY_PATH'] = f"{lib_path}:{os.environ.get('LD_LIBRARY_PATH', '')}"

    # Inicializar cliente Oracle (solo la primera vez)
    if not _oracle_client_initialized:
        try:
            oracledb.init_oracle_client(
                lib_dir=lib_path,
                config_dir=config['config_dir']
            )
            _oracle_client_initialized = True
        except Exception as e:
            # Si ya estaba inicializado, ignorar
            if "already been initialized" not in str(e):
                raise

    # Conectar
    connection = oracledb.connect(
        user=config['user'],
        password=config['password'],
        dsn=config['dsn']
    )

    return connection


def execute_query(query, params=None, fetch_one=False):
    """
    Ejecuta una query y retorna los resultados.

    Args:
        query (str): Query SQL a ejecutar
        params (dict, optional): Parámetros para la query
        fetch_one (bool): Si True, retorna solo la primera fila

    Returns:
        list o tuple: Resultados de la query
    """
    conn = get_connection()
    cursor = conn.cursor()

    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)

        if fetch_one:
            result = cursor.fetchone()
        else:
            result = cursor.fetchall()

        return result
    finally:
        cursor.close()
        conn.close()


def execute_dml(query, params=None, commit=True):
    """
    Ejecuta un INSERT, UPDATE o DELETE.

    Args:
        query (str): Query DML a ejecutar
        params (dict, optional): Parámetros para la query
        commit (bool): Si True, hace commit automáticamente

    Returns:
        int: Número de filas afectadas
    """
    conn = get_connection()
    cursor = conn.cursor()

    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)

        rows_affected = cursor.rowcount

        if commit:
            conn.commit()

        return rows_affected
    finally:
        cursor.close()
        conn.close()


def get_table_structure(table_name):
    """
    Obtiene la estructura de una tabla.

    Args:
        table_name (str): Nombre de la tabla

    Returns:
        list: Lista de tuplas con (columna, tipo, longitud, nullable)
    """
    query = """
        SELECT column_name, data_type, data_length, nullable
        FROM user_tab_columns
        WHERE table_name = :table_name
        ORDER BY column_id
    """
    return execute_query(query, {'table_name': table_name.upper()})


def list_tables():
    """
    Lista todas las tablas del usuario.

    Returns:
        list: Lista de nombres de tablas
    """
    query = "SELECT table_name FROM user_tables ORDER BY table_name"
    results = execute_query(query)
    return [row[0] for row in results]


# Ejemplo de uso
if __name__ == "__main__":
    print("🔄 Probando conexión...")

    try:
        # Test de conexión
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT user, sys_context('userenv', 'db_name') FROM dual")
        user, db = cursor.fetchone()

        print(f"✅ Conectado como {user} a {db}")

        # Listar tablas
        tables = list_tables()
        print(f"\n📋 Tablas encontradas: {len(tables)}")
        for table in tables:
            print(f"   - {table}")

        cursor.close()
        conn.close()

        print("\n✅ Test completado exitosamente")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
