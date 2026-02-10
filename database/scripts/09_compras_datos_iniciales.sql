-- =============================================================================
-- DATOS INICIALES - MÓDULO DE COMPRAS E INVENTARIO
-- Inserciones de categorías, artículos y proveedores de prueba
-- =============================================================================

-- Asumiendo EMPRESA_ID = 1, SUCURSAL_ID = 1, USUARIO_ID = 1

-- =============================================================================
-- 1. CATEGORÍAS DE ARTÍCULOS
-- =============================================================================

INSERT INTO ODO_CATEGORIAS_ARTICULOS (
  NOMBRE, DESCRIPCION, ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'Materiales Dentales',
  'Materiales de consumo para tratamientos dentales',
  'S',
  SYSTIMESTAMP,
  1
);

INSERT INTO ODO_CATEGORIAS_ARTICULOS (
  NOMBRE, DESCRIPCION, ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'Instrumental',
  'Instrumentos y herramientas dentales',
  'S',
  SYSTIMESTAMP,
  1
);

INSERT INTO ODO_CATEGORIAS_ARTICULOS (
  NOMBRE, DESCRIPCION, ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'Insumos de Esterilización',
  'Productos para esterilización y desinfección',
  'S',
  SYSTIMESTAMP,
  1
);

INSERT INTO ODO_CATEGORIAS_ARTICULOS (
  NOMBRE, DESCRIPCION, ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'Equipamiento',
  'Equipos y máquinas dentales',
  'S',
  SYSTIMESTAMP,
  1
);

INSERT INTO ODO_CATEGORIAS_ARTICULOS (
  NOMBRE, DESCRIPCION, ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'Consumibles de Oficina',
  'Papelería y consumibles administrativos',
  'S',
  SYSTIMESTAMP,
  1
);

COMMIT;

-- =============================================================================
-- 2. ARTÍCULOS
-- =============================================================================

INSERT INTO ODO_ARTICULOS (
  CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID, UNIDAD_MEDIDA,
  COSTO_UNITARIO, PRECIO_VENTA, CANTIDAD_MINIMA, CANTIDAD_MAXIMA,
  ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'MAT-001',
  'Resina Composite Microhíbrida',
  'Resina para restauraciones anteriores y posteriores',
  1, 'Jeringa',
  150000, 220000, 10, 50,
  'S', SYSTIMESTAMP, 1
);

INSERT INTO ODO_ARTICULOS (
  CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID, UNIDAD_MEDIDA,
  COSTO_UNITARIO, PRECIO_VENTA, CANTIDAD_MINIMA, CANTIDAD_MAXIMA,
  ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'MAT-002',
  'Cemento Glass Ionómero',
  'Cemento para bases y sellado',
  1, 'Tubo',
  80000, 120000, 15, 40,
  'S', SYSTIMESTAMP, 1
);

INSERT INTO ODO_ARTICULOS (
  CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID, UNIDAD_MEDIDA,
  COSTO_UNITARIO, PRECIO_VENTA, CANTIDAD_MINIMA, CANTIDAD_MAXIMA,
  ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'MAT-003',
  'Amalgama Dental',
  'Amalgama de plata para restauraciones',
  1, 'Cápsula',
  50000, 80000, 20, 60,
  'S', SYSTIMESTAMP, 1
);

INSERT INTO ODO_ARTICULOS (
  CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID, UNIDAD_MEDIDA,
  COSTO_UNITARIO, PRECIO_VENTA, CANTIDAD_MINIMA, CANTIDAD_MAXIMA,
  ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'MAT-004',
  'Gutapercha',
  'Conos de gutapercha para endodoncia',
  1, 'Caja',
  120000, 180000, 5, 20,
  'S', SYSTIMESTAMP, 1
);

INSERT INTO ODO_ARTICULOS (
  CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID, UNIDAD_MEDIDA,
  COSTO_UNITARIO, PRECIO_VENTA, CANTIDAD_MINIMA, CANTIDAD_MAXIMA,
  ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'INST-001',
  'Espejo Bucal',
  'Espejo para examen intraoral',
  2, 'Unidad',
  45000, 70000, 5, 15,
  'S', SYSTIMESTAMP, 1
);

INSERT INTO ODO_ARTICULOS (
  CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID, UNIDAD_MEDIDA,
  COSTO_UNITARIO, PRECIO_VENTA, CANTIDAD_MINIMA, CANTIDAD_MAXIMA,
  ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'INST-002',
  'Explorador Dental',
  'Explorador de doble extremo',
  2, 'Unidad',
  35000, 55000, 10, 20,
  'S', SYSTIMESTAMP, 1
);

INSERT INTO ODO_ARTICULOS (
  CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID, UNIDAD_MEDIDA,
  COSTO_UNITARIO, PRECIO_VENTA, CANTIDAD_MINIMA, CANTIDAD_MAXIMA,
  ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'INST-003',
  'Fresa Dental',
  'Fresa de carburo para fresadora',
  2, 'Unidad',
  28000, 45000, 20, 50,
  'S', SYSTIMESTAMP, 1
);

INSERT INTO ODO_ARTICULOS (
  CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID, UNIDAD_MEDIDA,
  COSTO_UNITARIO, PRECIO_VENTA, CANTIDAD_MINIMA, CANTIDAD_MAXIMA,
  ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'ESTER-001',
  'Gasas Estériles',
  'Gasas 10x10 cm estériles',
  3, 'Paquete',
  15000, 25000, 30, 100,
  'S', SYSTIMESTAMP, 1
);

INSERT INTO ODO_ARTICULOS (
  CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID, UNIDAD_MEDIDA,
  COSTO_UNITARIO, PRECIO_VENTA, CANTIDAD_MINIMA, CANTIDAD_MAXIMA,
  ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'ESTER-002',
  'Alcohol 70%',
  'Alcohol para desinfección',
  3, 'Litro',
  22000, 35000, 10, 30,
  'S', SYSTIMESTAMP, 1
);

INSERT INTO ODO_ARTICULOS (
  CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID, UNIDAD_MEDIDA,
  COSTO_UNITARIO, PRECIO_VENTA, CANTIDAD_MINIMA, CANTIDAD_MAXIMA,
  ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'EQUIP-001',
  'Lámpara de Fotocurado',
  'Lámpara LED para fotopolimerización',
  4, 'Unidad',
  2500000, 3500000, 1, 3,
  'S', SYSTIMESTAMP, 1
);

INSERT INTO ODO_ARTICULOS (
  CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID, UNIDAD_MEDIDA,
  COSTO_UNITARIO, PRECIO_VENTA, CANTIDAD_MINIMA, CANTIDAD_MAXIMA,
  ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'CONS-001',
  'Papel A4',
  'Papel blanco para impresora',
  5, 'Resma',
  45000, 65000, 5, 20,
  'S', SYSTIMESTAMP, 1
);

INSERT INTO ODO_ARTICULOS (
  CODIGO, NOMBRE, DESCRIPCION, CATEGORIA_ID, UNIDAD_MEDIDA,
  COSTO_UNITARIO, PRECIO_VENTA, CANTIDAD_MINIMA, CANTIDAD_MAXIMA,
  ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  'CONS-002',
  'Bolígrafos',
  'Bolígrafos azules caja x12',
  5, 'Caja',
  18000, 28000, 10, 30,
  'S', SYSTIMESTAMP, 1
);

COMMIT;

-- =============================================================================
-- 3. PROVEEDORES
-- =============================================================================

INSERT INTO ODO_PROVEEDORES (
  PROVEEDOR_ID, NOMBRE, RUC, NOMBRE_CONTACTO, TELEFONO, EMAIL,
  DIRECCION, CIUDAD, DEPARTAMENTO, PAIS,
  CONDICIONES_PAGO, MONEDA, ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  SEQ_PROVEEDORES.NEXTVAL,
  'Distribuidora Dental Plus',
  '80456123-7',
  'Juan Pérez',
  '0985123456',
  'contacto@dentalplu.com.py',
  'Av. Mariscal López 1234',
  'Asunción',
  'Central',
  'Paraguay',
  'Crédito 30 días',
  'PYG',
  'S',
  SYSTIMESTAMP,
  1
);

INSERT INTO ODO_PROVEEDORES (
  PROVEEDOR_ID, NOMBRE, RUC, NOMBRE_CONTACTO, TELEFONO, EMAIL,
  DIRECCION, CIUDAD, DEPARTAMENTO, PAIS,
  CONDICIONES_PAGO, MONEDA, ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  SEQ_PROVEEDORES.NEXTVAL,
  'Dental Supplies International',
  '80234567-1',
  'María García',
  '0971654321',
  'ventas@dentalsupplies.com.ar',
  'Calle Florida 567',
  'Buenos Aires',
  'Buenos Aires',
  'Argentina',
  'Crédito 45 días',
  'ARS',
  'S',
  SYSTIMESTAMP,
  1
);

INSERT INTO ODO_PROVEEDORES (
  PROVEEDOR_ID, NOMBRE, RUC, NOMBRE_CONTACTO, TELEFONO, EMAIL,
  DIRECCION, CIUDAD, DEPARTAMENTO, PAIS,
  CONDICIONES_PAGO, MONEDA, ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  SEQ_PROVEEDORES.NEXTVAL,
  'Implantes y Materiales Ltda.',
  '80789456-3',
  'Carlos López',
  '0983456789',
  'info@implantespy.com.py',
  'Barrio San Cristóbal',
  'Asunción',
  'Central',
  'Paraguay',
  'Contado',
  'USD',
  'S',
  SYSTIMESTAMP,
  1
);

INSERT INTO ODO_PROVEEDORES (
  PROVEEDOR_ID, NOMBRE, RUC, NOMBRE_CONTACTO, TELEFONO, EMAIL,
  DIRECCION, CIUDAD, DEPARTAMENTO, PAIS,
  CONDICIONES_PAGO, MONEDA, ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  SEQ_PROVEEDORES.NEXTVAL,
  'Equipo Dental Moderno',
  '80565432-9',
  'Ana Rodríguez',
  '0961234567',
  'pedidos@equipodentalmodern.com.py',
  'Zona Centro',
  'Ciudad del Este',
  'Itapúa',
  'Paraguay',
  'Crédito 60 días',
  'PYG',
  'S',
  SYSTIMESTAMP,
  1
);

INSERT INTO ODO_PROVEEDORES (
  PROVEEDOR_ID, NOMBRE, RUC, NOMBRE_CONTACTO, TELEFONO, EMAIL,
  DIRECCION, CIUDAD, DEPARTAMENTO, PAIS,
  CONDICIONES_PAGO, MONEDA, ACTIVO, FECHA_CREACION, CREADO_POR
) VALUES (
  SEQ_PROVEEDORES.NEXTVAL,
  'Pharma Dental Solutions',
  '80111222-5',
  'Roberto Silva',
  '0975678901',
  'soporte@pharmadentalsoluciones.com.br',
  'Avenida Brasil 2000',
  'São Paulo',
  'São Paulo',
  'Brasil',
  'Crédito 30 días',
  'BRL',
  'S',
  SYSTIMESTAMP,
  1
);

COMMIT;

-- =============================================================================
-- 4. INICIALIZAR INVENTARIO
-- =============================================================================

-- Inicializar stock para artículos creados
BEGIN
  PKG_INVENTARIO.SP_INICIALIZAR_INVENTARIO(
    p_articulo_id => (SELECT ARTICULO_ID FROM ODO_ARTICULOS WHERE CODIGO = 'MAT-001'),
    p_empresa_id => 1,
    p_sucursal_id => 1,
    p_cantidad_inicial => 25,
    p_ubicacion => 'Armario A - Estante 1',
    p_usuario_id => 1
  );
END;
/

BEGIN
  PKG_INVENTARIO.SP_INICIALIZAR_INVENTARIO(
    p_articulo_id => (SELECT ARTICULO_ID FROM ODO_ARTICULOS WHERE CODIGO = 'MAT-002'),
    p_empresa_id => 1,
    p_sucursal_id => 1,
    p_cantidad_inicial => 20,
    p_ubicacion => 'Armario A - Estante 2',
    p_usuario_id => 1
  );
END;
/

BEGIN
  PKG_INVENTARIO.SP_INICIALIZAR_INVENTARIO(
    p_articulo_id => (SELECT ARTICULO_ID FROM ODO_ARTICULOS WHERE CODIGO = 'INST-001'),
    p_empresa_id => 1,
    p_sucursal_id => 1,
    p_cantidad_inicial => 8,
    p_ubicacion => 'Estuche de Instrumental',
    p_usuario_id => 1
  );
END;
/

BEGIN
  PKG_INVENTARIO.SP_INICIALIZAR_INVENTARIO(
    p_articulo_id => (SELECT ARTICULO_ID FROM ODO_ARTICULOS WHERE CODIGO = 'ESTER-001'),
    p_empresa_id => 1,
    p_sucursal_id => 1,
    p_cantidad_inicial => 50,
    p_ubicacion => 'Estantería Esterilización',
    p_usuario_id => 1
  );
END;
/

BEGIN
  PKG_INVENTARIO.SP_INICIALIZAR_INVENTARIO(
    p_articulo_id => (SELECT ARTICULO_ID FROM ODO_ARTICULOS WHERE CODIGO = 'CONS-001'),
    p_empresa_id => 1,
    p_sucursal_id => 1,
    p_cantidad_inicial => 10,
    p_ubicacion => 'Almacén - Estante Centro',
    p_usuario_id => 1
  );
END;
/

COMMIT;

-- =============================================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =============================================================================

SELECT 'CATEGORÍAS' as TIPO, COUNT(*) as TOTAL FROM ODO_CATEGORIAS_ARTICULOS
UNION ALL
SELECT 'ARTÍCULOS', COUNT(*) FROM ODO_ARTICULOS
UNION ALL
SELECT 'PROVEEDORES', COUNT(*) FROM ODO_PROVEEDORES
UNION ALL
SELECT 'INVENTARIO', COUNT(*) FROM ODO_INVENTARIO;

-- =============================================================================
-- FIN - DATOS INICIALES
-- =============================================================================
