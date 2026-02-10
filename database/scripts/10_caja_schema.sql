-- =============================================================================
-- MÓDULO DE CAJA - CREACIÓN DE TABLAS
-- =============================================================================

-- ============================================================================
-- TABLA: ODO_CATEGORIAS_MOVIMIENTO_CAJA
-- Categorías de ingresos y egresos de caja
-- ============================================================================
CREATE TABLE ODO_CATEGORIAS_MOVIMIENTO_CAJA (
    CATEGORIA_ID     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    NOMBRE           VARCHAR2(100) NOT NULL,
    TIPO             CHAR(7) NOT NULL CHECK (TIPO IN ('INGRESO', 'EGRESO')),
    DESCRIPCION      VARCHAR2(500),
    ACTIVO           CHAR(1) DEFAULT 'S' CHECK (ACTIVO IN ('S', 'N')),
    FECHA_CREACION   TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CREADO_POR       NUMBER,
    CONSTRAINT FK_CATMOV_CREADO_POR FOREIGN KEY (CREADO_POR)
        REFERENCES ODO_USUARIOS(USUARIO_ID),
    CONSTRAINT UQ_CATMOV_NOMBRE_TIPO UNIQUE (NOMBRE, TIPO)
)
/
COMMENT ON TABLE ODO_CATEGORIAS_MOVIMIENTO_CAJA IS 'Categorías para clasificar ingresos y egresos de caja'
/

-- ============================================================================
-- TABLA: ODO_CAJAS
-- Cajas registradoras / puntos de cobro
-- ============================================================================
CREATE TABLE ODO_CAJAS (
    CAJA_ID              NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EMPRESA_ID           NUMBER NOT NULL,
    NOMBRE               VARCHAR2(100) NOT NULL,
    DESCRIPCION          VARCHAR2(500),
    USUARIO_ASIGNADO_ID  NUMBER,
    SALDO_INICIAL        NUMBER(15,2) DEFAULT 0 NOT NULL,
    SALDO_FINAL          NUMBER(15,2),
    TOTAL_INGRESOS       NUMBER(15,2) DEFAULT 0 NOT NULL,
    TOTAL_EGRESOS        NUMBER(15,2) DEFAULT 0 NOT NULL,
    ESTADO               VARCHAR2(8) DEFAULT 'CERRADA' NOT NULL CHECK (ESTADO IN ('ABIERTA', 'CERRADA')),
    FECHA_APERTURA       TIMESTAMP WITH TIME ZONE,
    FECHA_CIERRE         TIMESTAMP WITH TIME ZONE,
    OBSERVACIONES        VARCHAR2(1000),
    FECHA_CREACION       TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    CREADO_POR           NUMBER,
    FECHA_MODIFICACION   TIMESTAMP WITH TIME ZONE,
    MODIFICADO_POR       NUMBER,
    CONSTRAINT FK_CAJA_EMPRESA FOREIGN KEY (EMPRESA_ID)
        REFERENCES ODO_EMPRESAS(EMPRESA_ID),
    CONSTRAINT FK_CAJA_USUARIO FOREIGN KEY (USUARIO_ASIGNADO_ID)
        REFERENCES ODO_USUARIOS(USUARIO_ID),
    CONSTRAINT FK_CAJA_CREADO_POR FOREIGN KEY (CREADO_POR)
        REFERENCES ODO_USUARIOS(USUARIO_ID),
    CONSTRAINT FK_CAJA_MODIFICADO_POR FOREIGN KEY (MODIFICADO_POR)
        REFERENCES ODO_USUARIOS(USUARIO_ID),
    CONSTRAINT CHK_CAJA_SALDO_INICIAL CHECK (SALDO_INICIAL >= 0)
)
/
COMMENT ON TABLE ODO_CAJAS IS 'Cajas registradoras de la empresa'
/
COMMENT ON COLUMN ODO_CAJAS.ESTADO IS 'ABIERTA: caja activa con sesion abierta; CERRADA: sin sesion activa'
/

-- ============================================================================
-- TABLA: ODO_MOVIMIENTOS_CAJA
-- Movimientos de ingresos y egresos por sesion de caja
-- ============================================================================
CREATE TABLE ODO_MOVIMIENTOS_CAJA (
    MOVIMIENTO_ID    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CAJA_ID          NUMBER NOT NULL,
    TIPO             CHAR(7) NOT NULL CHECK (TIPO IN ('INGRESO', 'EGRESO')),
    CATEGORIA_ID     NUMBER,
    CONCEPTO         VARCHAR2(500) NOT NULL,
    MONTO            NUMBER(15,2) NOT NULL,
    REFERENCIA       VARCHAR2(200),
    FACTURA_ID       NUMBER,
    REGISTRADO_POR   NUMBER NOT NULL,
    FECHA_HORA       TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
    OBSERVACIONES    VARCHAR2(1000),
    CONSTRAINT FK_MOVCAJA_CAJA FOREIGN KEY (CAJA_ID)
        REFERENCES ODO_CAJAS(CAJA_ID),
    CONSTRAINT FK_MOVCAJA_CATEGORIA FOREIGN KEY (CATEGORIA_ID)
        REFERENCES ODO_CATEGORIAS_MOVIMIENTO_CAJA(CATEGORIA_ID),
    CONSTRAINT FK_MOVCAJA_REGISTRADO FOREIGN KEY (REGISTRADO_POR)
        REFERENCES ODO_USUARIOS(USUARIO_ID),
    CONSTRAINT CHK_MOVCAJA_MONTO CHECK (MONTO > 0)
)
/
COMMENT ON TABLE ODO_MOVIMIENTOS_CAJA IS 'Registros de ingresos y egresos de caja'
/
COMMENT ON COLUMN ODO_MOVIMIENTOS_CAJA.REFERENCIA IS 'Nro. de recibo, factura u otro comprobante externo'
/
COMMENT ON COLUMN ODO_MOVIMIENTOS_CAJA.FACTURA_ID IS 'Factura asociada al movimiento si aplica'
/

-- ============================================================================
-- ÍNDICES
-- ============================================================================
CREATE INDEX IDX_CAJAS_EMPRESA ON ODO_CAJAS(EMPRESA_ID)
/
CREATE INDEX IDX_CAJAS_USUARIO ON ODO_CAJAS(USUARIO_ASIGNADO_ID)
/
CREATE INDEX IDX_CAJAS_ESTADO ON ODO_CAJAS(ESTADO)
/
CREATE INDEX IDX_MOV_CAJA ON ODO_MOVIMIENTOS_CAJA(CAJA_ID)
/
CREATE INDEX IDX_MOV_FECHA ON ODO_MOVIMIENTOS_CAJA(FECHA_HORA)
/
CREATE INDEX IDX_MOV_TIPO ON ODO_MOVIMIENTOS_CAJA(TIPO)
/

-- ============================================================================
-- DATOS INICIALES - Categorías comunes
-- ============================================================================
INSERT INTO ODO_CATEGORIAS_MOVIMIENTO_CAJA (NOMBRE, TIPO, DESCRIPCION, CREADO_POR)
VALUES ('Cobro de consulta', 'INGRESO', 'Ingreso por consulta médica odontológica', 1)
/
INSERT INTO ODO_CATEGORIAS_MOVIMIENTO_CAJA (NOMBRE, TIPO, DESCRIPCION, CREADO_POR)
VALUES ('Cobro de tratamiento', 'INGRESO', 'Ingreso por tratamiento odontológico', 1)
/
INSERT INTO ODO_CATEGORIAS_MOVIMIENTO_CAJA (NOMBRE, TIPO, DESCRIPCION, CREADO_POR)
VALUES ('Cobro de factura', 'INGRESO', 'Pago de factura emitida', 1)
/
INSERT INTO ODO_CATEGORIAS_MOVIMIENTO_CAJA (NOMBRE, TIPO, DESCRIPCION, CREADO_POR)
VALUES ('Otros ingresos', 'INGRESO', 'Ingresos varios no clasificados', 1)
/
INSERT INTO ODO_CATEGORIAS_MOVIMIENTO_CAJA (NOMBRE, TIPO, DESCRIPCION, CREADO_POR)
VALUES ('Compra de materiales', 'EGRESO', 'Compra de materiales e insumos dentales', 1)
/
INSERT INTO ODO_CATEGORIAS_MOVIMIENTO_CAJA (NOMBRE, TIPO, DESCRIPCION, CREADO_POR)
VALUES ('Pago de servicios', 'EGRESO', 'Pago de servicios (luz, agua, teléfono, etc.)', 1)
/
INSERT INTO ODO_CATEGORIAS_MOVIMIENTO_CAJA (NOMBRE, TIPO, DESCRIPCION, CREADO_POR)
VALUES ('Pago de personal', 'EGRESO', 'Pago de sueldos y salarios', 1)
/
INSERT INTO ODO_CATEGORIAS_MOVIMIENTO_CAJA (NOMBRE, TIPO, DESCRIPCION, CREADO_POR)
VALUES ('Gastos varios', 'EGRESO', 'Egresos varios no clasificados', 1)
/
COMMIT
/
