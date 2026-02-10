from connect_db import get_connection
import sys

def execute_ddl(cursor, sql, description):
    """Execute a DDL statement and handle errors"""
    try:
        cursor.execute(sql)
        print(f"✓ {description}")
        return True
    except Exception as e:
        error_str = str(e)
        if "ORA-00955" in error_str:  # Object already exists
            print(f"⊙ {description} (ya existe)")
            return True
        elif "ORA-01430" in error_str:  # Column being added already exists
            print(f"⊙ {description} (ya existe)")
            return True
        elif "ORA-02275" in error_str:  # Such a referential constraint already exists
            print(f"⊙ {description} (constraint ya existe)")
            return True
        else:
            print(f"✗ Error en {description}: {e}")
            return False

def execute_dml(cursor, sql, description):
    """Execute a DML statement and handle errors"""
    try:
        cursor.execute(sql)
        rows = cursor.rowcount
        print(f"✓ {description} ({rows} filas)")
        return True
    except Exception as e:
        error_str = str(e)
        if "ORA-00001" in error_str:  # Unique constraint violated
            print(f"⊙ {description} (datos ya existen)")
            return True
        else:
            print(f"✗ Error en {description}: {e}")
            return False

def main():
    print("="*60)
    print("APLICANDO MÓDULO DE SEGURIDAD - ROLES Y PERMISOS")
    print("="*60)
    
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        # 1. CREATE TABLES
        print("\n1. Creando Tablas...")
        print("-"*60)
        
        execute_ddl(cursor, """
            CREATE TABLE ODO_ROLES (
                ROL_ID              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                NOMBRE              VARCHAR2(100) NOT NULL UNIQUE,
                CODIGO              VARCHAR2(50) NOT NULL UNIQUE,
                DESCRIPCION         VARCHAR2(500),
                ES_SUPERADMIN       CHAR(1) DEFAULT 'N' CHECK (ES_SUPERADMIN IN ('S', 'N')),
                ACTIVO              CHAR(1) DEFAULT 'S' CHECK (ACTIVO IN ('S', 'N')),
                FECHA_CREACION      TIMESTAMP DEFAULT SYSTIMESTAMP,
                CREADO_POR          NUMBER,
                FECHA_MODIFICACION  TIMESTAMP,
                MODIFICADO_POR      NUMBER
            )
        """, "Tabla ODO_ROLES")
        
        execute_ddl(cursor, """
            CREATE TABLE ODO_PROGRAMAS (
                PROGRAMA_ID         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                NOMBRE              VARCHAR2(100) NOT NULL,
                CODIGO              VARCHAR2(50) NOT NULL UNIQUE,
                DESCRIPCION         VARCHAR2(500),
                RUTA_FRONTEND       VARCHAR2(200),
                ICONO               VARCHAR2(50),
                MODULO_PADRE_ID     NUMBER,
                ORDEN               NUMBER DEFAULT 0,
                ACTIVO              CHAR(1) DEFAULT 'S' CHECK (ACTIVO IN ('S', 'N')),
                FECHA_CREACION      TIMESTAMP DEFAULT SYSTIMESTAMP,
                CREADO_POR          NUMBER,
                CONSTRAINT FK_PROGRAMA_PADRE FOREIGN KEY (MODULO_PADRE_ID)
                    REFERENCES ODO_PROGRAMAS(PROGRAMA_ID)
            )
        """, "Tabla ODO_PROGRAMAS")
        
        execute_ddl(cursor, """
            CREATE TABLE ODO_PERMISOS (
                PERMISO_ID          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                NOMBRE              VARCHAR2(100) NOT NULL,
                CODIGO              VARCHAR2(50) NOT NULL UNIQUE,
                DESCRIPCION         VARCHAR2(500),
                PROGRAMA_ID         NUMBER,
                ACTIVO              CHAR(1) DEFAULT 'S' CHECK (ACTIVO IN ('S', 'N')),
                FECHA_CREACION      TIMESTAMP DEFAULT SYSTIMESTAMP,
                CREADO_POR          NUMBER,
                CONSTRAINT FK_PERMISO_PROGRAMA FOREIGN KEY (PROGRAMA_ID)
                    REFERENCES ODO_PROGRAMAS(PROGRAMA_ID)
            )
        """, "Tabla ODO_PERMISOS")
        
        execute_ddl(cursor, """
            CREATE TABLE ODO_ROL_PROGRAMAS (
                ROL_PROGRAMA_ID     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                ROL_ID              NUMBER NOT NULL,
                PROGRAMA_ID         NUMBER NOT NULL,
                FECHA_ASIGNACION    TIMESTAMP DEFAULT SYSTIMESTAMP,
                ASIGNADO_POR        NUMBER,
                CONSTRAINT FK_ROLPROG_ROL FOREIGN KEY (ROL_ID) REFERENCES ODO_ROLES(ROL_ID),
                CONSTRAINT FK_ROLPROG_PROG FOREIGN KEY (PROGRAMA_ID) REFERENCES ODO_PROGRAMAS(PROGRAMA_ID),
                CONSTRAINT UK_ROL_PROGRAMA UNIQUE (ROL_ID, PROGRAMA_ID)
            )
        """, "Tabla ODO_ROL_PROGRAMAS")
        
        execute_ddl(cursor, """
            CREATE TABLE ODO_ROL_PERMISOS (
                ROL_PERMISO_ID      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                ROL_ID              NUMBER NOT NULL,
                PERMISO_ID          NUMBER NOT NULL,
                FECHA_ASIGNACION    TIMESTAMP DEFAULT SYSTIMESTAMP,
                ASIGNADO_POR        NUMBER,
                CONSTRAINT FK_ROLPERM_ROL FOREIGN KEY (ROL_ID) REFERENCES ODO_ROLES(ROL_ID),
                CONSTRAINT FK_ROLPERM_PERM FOREIGN KEY (PERMISO_ID) REFERENCES ODO_PERMISOS(PERMISO_ID),
                CONSTRAINT UK_ROL_PERMISO UNIQUE (ROL_ID, PERMISO_ID)
            )
        """, "Tabla ODO_ROL_PERMISOS")
        
        # 2. MODIFY EXISTING TABLES
        print("\n2. Modificando Tablas Existentes...")
        print("-"*60)
        
        execute_ddl(cursor, """
            ALTER TABLE ODO_USUARIOS ADD (
                ROL_ID NUMBER,
                CONSTRAINT FK_USUARIO_ROL FOREIGN KEY (ROL_ID)
                    REFERENCES ODO_ROLES(ROL_ID)
            )
        """, "Añadir ROL_ID a ODO_USUARIOS")
        
        execute_ddl(cursor, """
            ALTER TABLE ODO_EMPRESAS ADD (
                ACTIVO CHAR(1) DEFAULT 'S' CHECK (ACTIVO IN ('S', 'N'))
            )
        """, "Añadir ACTIVO a ODO_EMPRESAS")
        
        conn.commit()
        print("\n¡Esquema de base de datos aplicado con éxito!")
        print("="*60)
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\nError fatal: {e}")
        conn.rollback()
        cursor.close()
        conn.close()
        sys.exit(1)

if __name__ == "__main__":
    main()
