# Base de Datos - Sistema Odontología

## Estructura

### /packages
Contiene los PL/SQL packages que encapsulan la lógica de negocio principal.
- Nomenclatura: `PKG_[MODULO].sql`
- Ejemplo: `PKG_PACIENTES.sql`, `PKG_CITAS.sql`

### /procedures
Stored procedures independientes (si no pertenecen a un package).
- Nomenclatura: `SP_[NOMBRE].sql`

### /functions
Funciones independientes.
- Nomenclatura: `FN_[NOMBRE].sql`

### /triggers
Database triggers para validaciones y auditoría.
- Nomenclatura: `TRG_[TABLA]_[EVENTO].sql`

### /views
Vistas para simplificar consultas complejas.
- Nomenclatura: `VW_[NOMBRE].sql`

### /scripts
Scripts DDL para crear tablas, índices, secuencias, etc.
- `01_crear_tablas.sql`
- `02_crear_indices.sql`
- `03_crear_secuencias.sql`
- `04_datos_iniciales.sql`

### /migrations
Scripts de migración/actualización ordenados cronológicamente.
- Nomenclatura: `YYYYMMDD_descripcion.sql`
- Ejemplo: `20260112_agregar_campo_email.sql`

## Orden de Ejecución

1. Scripts DDL (`/scripts`)
2. Sequences
3. Functions
4. Procedures
5. Packages
6. Triggers
7. Views

## Convenciones

### Nomenclatura de Tablas
- Prefijo: `TB_`
- Singular
- Ejemplo: `TB_PACIENTE`, `TB_CITA`, `TB_TRATAMIENTO`

### Nomenclatura de Campos
- Snake_case en mayúsculas
- Primary Key: `ID_[TABLA]`
- Foreign Key: `ID_[TABLA_REFERENCIADA]`
- Ejemplo: `ID_PACIENTE`, `NOMBRE_PACIENTE`, `FECHA_NACIMIENTO`

### Convenciones de Código PL/SQL
```sql
-- Comentario obligatorio al inicio
-- Autor: [Nombre]
-- Fecha: [YYYY-MM-DD]
-- Descripción: [Descripción breve]

CREATE OR REPLACE PACKAGE PKG_NOMBRE AS
  -- Declaraciones públicas
END PKG_NOMBRE;
/

CREATE OR REPLACE PACKAGE BODY PKG_NOMBRE AS
  -- Implementación
END PKG_NOMBRE;
/
```

## Configuración ORDS

Los packages deben exponer procedimientos que ORDS pueda mapear a endpoints REST.

Ejemplo:
```sql
CREATE OR REPLACE PACKAGE PKG_PACIENTES AS
  PROCEDURE get_paciente(p_id IN NUMBER, p_cursor OUT SYS_REFCURSOR);
  PROCEDURE insert_paciente(p_data IN CLOB, p_result OUT VARCHAR2);
END;
```

## Seguridad

- No incluir credenciales en los scripts
- Usar bind variables siempre
- Validar todos los inputs
- Implementar auditoría en tablas críticas
