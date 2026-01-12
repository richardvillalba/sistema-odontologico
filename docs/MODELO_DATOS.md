# Modelo de Datos - Sistema de Odontología

## Resumen

**Total de tablas**: 26 tablas ODO_
**Base de datos**: G04D6B70B49B5DA_ESCANOR
**Usuario**: ADMIN
**Última actualización**: 2026-01-12

---

## Módulos del Sistema

### 1. Módulo de Pacientes

#### ODO_PACIENTES (3 registros)
Registro completo de pacientes con información personal, contacto y médica.

**Campos principales:**
- `PACIENTE_ID` (PK) - Identificador único
- `NUMERO_HISTORIA` - Número de historia clínica (único)
- `NOMBRE`, `APELLIDO` - Datos personales
- `DOCUMENTO_TIPO`, `DOCUMENTO_NUMERO` - Identificación
- `FECHA_NACIMIENTO`, `GENERO`, `GRUPO_SANGUINEO`
- `EMAIL`, `TELEFONO_PRINCIPAL`, `TELEFONO_SECUNDARIO`
- `DIRECCION_CALLE`, `DIRECCION_CIUDAD`, `CODIGO_POSTAL`
- `CONTACTO_EMERGENCIA_*` - Datos de emergencia
- `ALERGIAS` (CLOB), `MEDICAMENTOS_ACTUALES` (CLOB), `ENFERMEDADES_CRONICAS` (CLOB)
- `DEPARTAMENTO_ID`, `CIUDAD_ID`, `BARRIO_ID` - Ubicación geográfica

**Relaciones:**
- → ODO_DEPARTAMENTOS, ODO_CIUDADES, ODO_BARRIOS (geografía)
- → ODO_USUARIOS (registrado_por, modificado_por)
- → ODO_EMPRESAS (empresa_id)

---

### 2. Módulo de Citas

#### ODO_CITAS (4 registros)
Gestión de citas médicas con pacientes.

**Campos principales:**
- `CITA_ID` (PK)
- `PACIENTE_ID` (FK), `DOCTOR_ID` (FK)
- `FECHA_HORA_INICIO`, `FECHA_HORA_FIN`, `DURACION_MINUTOS`
- `MOTIVO_CONSULTA`, `TIPO_CITA`
- `ESTADO` - Estado de la cita (pendiente, confirmada, completada, cancelada)
- `CONSULTORIO`
- `OBSERVACIONES` (CLOB)
- `RECORDATORIO_ENVIADO`, `FECHA_RECORDATORIO`
- `MOTIVO_CANCELACION`, `CANCELADO_POR`
- `EMPRESA_ID`, `SUCURSAL_ID`

**Relaciones:**
- → ODO_PACIENTES (paciente_id)
- → ODO_USUARIOS (doctor_id, creado_por, cancelado_por)
- → ODO_EMPRESAS, ODO_SUCURSALES

---

### 3. Módulo de Historia Clínica

#### ODO_HISTORIAS_CLINICAS (2 registros)
Registro de consultas y evolución clínica.

**Campos principales:**
- `HISTORIA_ID` (PK)
- `PACIENTE_ID` (FK), `DOCTOR_ID` (FK), `CITA_ID` (FK)
- `FECHA_CONSULTA`
- `MOTIVO_CONSULTA`, `ANAMNESIS` (CLOB), `EXAMEN_CLINICO` (CLOB)
- `DIAGNOSTICO`, `CODIGO_CIE10`
- `PLAN_TRATAMIENTO` (CLOB)
- `PRESION_ARTERIAL`, `FRECUENCIA_CARDIACA`, `TEMPERATURA`
- `PROXIMA_CITA`
- `OBSERVACIONES` (CLOB)

**Relaciones:**
- → ODO_PACIENTES, ODO_USUARIOS, ODO_CITAS, ODO_EMPRESAS

---

### 4. Módulo de Odontograma

#### ODO_ODONTOGRAMAS (3 registros)
Odontograma del paciente (permanente o temporal).

**Campos:**
- `ODONTOGRAMA_ID` (PK)
- `PACIENTE_ID` (FK), `EMPRESA_ID` (FK)
- `TIPO` - PERMANENTE o TEMPORAL
- `OBSERVACIONES`

**Relaciones:**
- → ODO_PACIENTES, ODO_EMPRESAS

#### ODO_DIENTES (96 registros)
Registro individual de cada diente en el odontograma.

**Campos:**
- `DIENTE_ID` (PK)
- `ODONTOGRAMA_ID` (FK)
- `NUMERO_FDI` - Numeración FDI (11-48 para permanente, 51-85 para temporal)
- `TIPO_DIENTE` - Tipo de diente
- `ESTADO` - Estado actual
- `CUADRANTE` (1-4), `POSICION` (1-8)
- `OBSERVACIONES`

**Relaciones:**
- → ODO_ODONTOGRAMAS

#### ODO_HALLAZGOS_DIENTE (3 registros)
Hallazgos patológicos detectados en dientes.

**Campos:**
- `HALLAZGO_DIENTE_ID` (PK)
- `DIENTE_ID` (FK), `CITA_ID` (FK), `DOCTOR_ID` (FK)
- `TIPO_HALLAZGO` - Tipo de patología
- `SUPERFICIES_AFECTADAS`, `SEVERIDAD`
- `DESCRIPCION`, `REQUIERE_TRATAMIENTO`
- `FECHA_DETECCION`

**Relaciones:**
- → ODO_DIENTES, ODO_USUARIOS

#### ODO_TRATAMIENTOS_DIENTE (3 registros)
Tratamientos aplicados a dientes específicos.

**Campos:**
- `TRATAMIENTO_DIENTE_ID` (PK)
- `DIENTE_ID` (FK), `CITA_ID` (FK), `DOCTOR_ID` (FK)
- `TIPO_TRATAMIENTO`
- `SUPERFICIES_AFECTADAS`
- `DESCRIPCION`, `COSTO`
- `FECHA_TRATAMIENTO`

**Relaciones:**
- → ODO_DIENTES, ODO_USUARIOS

---

### 5. Módulo de Tratamientos

#### ODO_CATALOGOS_TRATAMIENTOS (33 registros)
Catálogo de tratamientos disponibles.

**Campos:**
- `CATALOGO_ID` (PK)
- `CODIGO`, `NOMBRE`, `DESCRIPCION`
- `CATEGORIA` - Categoría del tratamiento
- `PRECIO_BASE`, `DURACION_ESTIMADA`
- `REQUIERE_ANESTESIA`
- `ACTIVO`

#### ODO_TRATAMIENTOS_PACIENTE (0 registros)
Tratamientos asignados a pacientes.

**Campos:**
- `TRATAMIENTO_PACIENTE_ID` (PK)
- `PACIENTE_ID` (FK), `HISTORIA_ID` (FK), `CATALOGO_ID` (FK), `DOCTOR_ID` (FK)
- `NUMERO_DIENTE` - Diente específico si aplica
- `ESTADO` - pendiente, en_progreso, completado, cancelado
- `FECHA_PROPUESTA`, `FECHA_INICIO`, `FECHA_FINALIZACION`
- `PRECIO_ACORDADO`, `DESCUENTO`, `PRECIO_FINAL`
- `SESIONES_TOTALES`, `SESIONES_COMPLETADAS`

**Relaciones:**
- → ODO_PACIENTES, ODO_HISTORIAS_CLINICAS, ODO_CATALOGOS_TRATAMIENTOS, ODO_USUARIOS

#### ODO_SESIONES_TRATAMIENTO (0 registros)
Sesiones individuales de tratamientos.

**Campos:**
- `SESION_ID` (PK)
- `TRATAMIENTO_PACIENTE_ID` (FK), `CITA_ID` (FK), `DOCTOR_ID` (FK)
- `NUMERO_SESION`, `FECHA_SESION`
- `DESCRIPCION`, `MATERIALES_USADOS`
- `OBSERVACIONES` (CLOB)
- `COMPLETADA`

**Relaciones:**
- → ODO_TRATAMIENTOS_PACIENTE, ODO_CITAS, ODO_USUARIOS

#### ODO_PRESCRIPCIONES (0 registros)
Prescripciones médicas.

**Campos:**
- `PRESCRIPCION_ID` (PK)
- `HISTORIA_ID` (FK), `PACIENTE_ID` (FK), `DOCTOR_ID` (FK)
- `FECHA_EMISION`
- `MEDICAMENTO`, `PRINCIPIO_ACTIVO`, `PRESENTACION`, `CONCENTRACION`
- `DOSIS`, `VIA_ADMINISTRACION`, `DURACION_DIAS`
- `INDICACIONES`

**Relaciones:**
- → ODO_HISTORIAS_CLINICAS, ODO_PACIENTES, ODO_USUARIOS

---

### 6. Módulo de Facturación

#### ODO_FACTURAS (6 registros)
Facturas emitidas a pacientes.

**Campos principales:**
- `FACTURA_ID` (PK)
- `NUMERO_FACTURA`, `NUMERO_FACTURA_COMPLETO`
- `PACIENTE_ID` (FK), `TIMBRADO_ID` (FK)
- `TIPO_FACTURA`, `FECHA_EMISION`, `FECHA_VENCIMIENTO`
- `SUBTOTAL`, `DESCUENTO`, `IMPUESTOS`, `TOTAL`
- `ESTADO` - pendiente, pagada, anulada, vencida
- `SALDO_PENDIENTE`
- **Facturación Electrónica Paraguay:**
  - `NUMERO_TIMBRADO`, `ESTABLECIMIENTO`, `PUNTO_EXPEDICION`
  - `CDC` - Código de Control (44 caracteres)
  - `XML_FACTURA` (CLOB), `QR_CODE` (BLOB)
  - `ESTADO_SET`, `RESPUESTA_SET` (CLOB)
  - `FECHA_ENVIO_SET`, `FECHA_APROBACION_SET`
- **Datos del Cliente:**
  - `TIPO_DOCUMENTO_CLIENTE`, `NUMERO_DOCUMENTO_CLIENTE`
  - `NOMBRE_CLIENTE`, `DIRECCION_CLIENTE`, `CIUDAD_CLIENTE`
  - `TELEFONO_CLIENTE`, `EMAIL_CLIENTE`
- `CONDICION_OPERACION`, `PLAZO_CREDITO_DIAS`
- `CAE`, `FECHA_CAE`, `VENCIMIENTO_CAE`

**Relaciones:**
- → ODO_PACIENTES, ODO_USUARIOS, ODO_EMPRESAS, ODO_SUCURSALES, ODO_TIMBRADOS

#### ODO_DETALLES_FACTURA (6 registros)
Líneas de detalle de facturas.

**Campos:**
- `DETALLE_ID` (PK)
- `FACTURA_ID` (FK), `TRATAMIENTO_PACIENTE_ID` (FK)
- `DESCRIPCION`, `CANTIDAD`
- `PRECIO_UNITARIO`, `DESCUENTO`, `SUBTOTAL`

**Relaciones:**
- → ODO_FACTURAS, ODO_TRATAMIENTOS_PACIENTE

#### ODO_PAGOS (0 registros)
Registro de pagos recibidos.

**Campos:**
- `PAGO_ID` (PK)
- `FACTURA_ID` (FK), `PACIENTE_ID` (FK)
- `FECHA_PAGO`, `MONTO`
- `METODO_PAGO` - efectivo, tarjeta, transferencia, etc.
- `REFERENCIA`, `BANCO`
- `RECIBO_NUMERO`
- `REGISTRADO_POR` (FK)

**Relaciones:**
- → ODO_FACTURAS, ODO_PACIENTES, ODO_USUARIOS, ODO_EMPRESAS

#### ODO_TIMBRADOS (1 registro)
Gestión de timbrados fiscales (Paraguay).

**Campos:**
- `TIMBRADO_ID` (PK)
- `EMPRESA_ID` (FK)
- `NUMERO_TIMBRADO` (8 dígitos)
- `ESTABLECIMIENTO` (3 dígitos), `PUNTO_EXPEDICION` (3 dígitos)
- `TIPO_DOCUMENTO`
- `NUMERO_INICIO`, `NUMERO_FIN`, `NUMERO_ACTUAL`
- `FECHA_INICIO`, `FECHA_VENCIMIENTO`
- `ACTIVO`

**Relaciones:**
- → ODO_EMPRESAS, ODO_USUARIOS

---

### 7. Módulo de Usuarios y Seguridad

#### ODO_USUARIOS (4 registros)
Usuarios del sistema (doctores, recepcionistas, admin).

**Campos:**
- `USUARIO_ID` (PK)
- `USERNAME`, `EMAIL`, `PASSWORD_HASH`
- `NOMBRE`, `APELLIDO`
- `DOCUMENTO_TIPO`, `DOCUMENTO_NUMERO`
- `TELEFONO`
- `ESPECIALIDAD`, `REGISTRO_PROFESIONAL`
- `ACTIVO`, `ULTIMO_LOGIN`
- `EMPRESA_ID` (FK)

**Relaciones:**
- → ODO_EMPRESAS
- → ODO_USUARIOS (creado_por, modificado_por) - auto-referencia

#### ODO_ROLES (4 registros)
Roles del sistema.

**Campos:**
- `ROL_ID` (PK)
- `CODIGO`, `NOMBRE`, `DESCRIPCION`
- `ACTIVO`

#### ODO_USUARIO_ROLES (3 registros)
Asignación de roles a usuarios (Many-to-Many).

**Campos:**
- `USUARIO_ID` (PK, FK), `ROL_ID` (PK, FK)
- `FECHA_ASIGNACION`, `ASIGNADO_POR` (FK)

**Relaciones:**
- → ODO_USUARIOS, ODO_ROLES

#### ODO_USUARIO_SUCURSALES (4 registros)
Sucursales asignadas a usuarios.

**Campos:**
- `USUARIO_SUCURSAL_ID` (PK)
- `USUARIO_ID` (FK), `SUCURSAL_ID` (FK)
- `ES_PRINCIPAL`, `ACTIVO`
- `FECHA_ASIGNACION`, `ASIGNADO_POR`

**Relaciones:**
- → ODO_USUARIOS, ODO_SUCURSALES

---

### 8. Módulo de Empresa y Sucursales

#### ODO_EMPRESAS (1 registro)
Datos de la empresa odontológica.

**Campos principales:**
- `EMPRESA_ID` (PK)
- `RAZON_SOCIAL`, `NOMBRE_COMERCIAL`, `NOMBRE_FANTASIA`
- `RUC`, `DV_RUC`
- `DIRECCION`, `DIRECCION_FISCAL`
- `TELEFONO`, `TELEFONO_FISCAL`
- `EMAIL`, `EMAIL_FISCAL`
- `SITIO_WEB`, `LOGO_URL`
- `MONEDA`, `SIMBOLO_MONEDA`
- `ACTIVIDAD_ECONOMICA`
- `DEPARTAMENTO`, `CIUDAD`, `CODIGO_POSTAL`
- `TIPO_CONTRIBUYENTE`, `REGIMEN_TRIBUTARIO`
- `ACTIVO`

#### ODO_SUCURSALES (1 registro)
Sucursales de la empresa.

**Campos:**
- `SUCURSAL_ID` (PK)
- `EMPRESA_ID` (FK)
- `CODIGO`, `NOMBRE`
- `DIRECCION`, `TELEFONO`, `EMAIL`
- `CIUDAD`, `PROVINCIA`, `PAIS`
- `HORARIO_ATENCION`
- `ES_PRINCIPAL`, `ACTIVO`

**Relaciones:**
- → ODO_EMPRESAS

---

### 9. Módulo de Geografía

#### ODO_DEPARTAMENTOS (7 registros)
Departamentos/Estados/Provincias.

**Campos:**
- `DEPARTAMENTO_ID` (PK)
- `CODIGO`, `NOMBRE`
- `ACTIVO`, `ORDEN`

#### ODO_CIUDADES (14 registros)
Ciudades por departamento.

**Campos:**
- `CIUDAD_ID` (PK)
- `DEPARTAMENTO_ID` (FK)
- `CODIGO`, `NOMBRE`
- `ACTIVO`, `ORDEN`

**Relaciones:**
- → ODO_DEPARTAMENTOS

#### ODO_BARRIOS (0 registros)
Barrios por ciudad.

**Campos:**
- `BARRIO_ID` (PK)
- `CIUDAD_ID` (FK), `DEPARTAMENTO_ID` (FK)
- `CODIGO`, `NOMBRE`
- `ACTIVO`, `ORDEN`

**Relaciones:**
- → ODO_CIUDADES, ODO_DEPARTAMENTOS

---

### 10. Módulo de Auditoría y Archivos

#### ODO_AUDITORIA (5 registros)
Log de auditoría del sistema.

**Campos:**
- `AUDITORIA_ID` (PK)
- `USUARIO_ID` (FK)
- `FECHA_HORA`
- `ACCION` - CREATE, UPDATE, DELETE, LOGIN, etc.
- `ENTIDAD_TIPO`, `ENTIDAD_ID`
- `DESCRIPCION`
- `IP_ADDRESS`, `USER_AGENT`
- `DATOS_ANTES` (CLOB), `DATOS_DESPUES` (CLOB)

**Relaciones:**
- → ODO_USUARIOS

#### ODO_ARCHIVOS (0 registros)
Gestión de archivos adjuntos.

**Campos:**
- `ARCHIVO_ID` (PK)
- `ENTIDAD_TIPO`, `ENTIDAD_ID` - Entidad a la que pertenece
- `NOMBRE_ARCHIVO`, `TIPO_ARCHIVO`, `MIME_TYPE`
- `TAMANIO_BYTES`, `RUTA_ARCHIVO`
- `DESCRIPCION`
- `FECHA_SUBIDA`, `SUBIDO_POR` (FK)

**Relaciones:**
- → ODO_USUARIOS

---

## Diagrama de Relaciones Principales

```
ODO_EMPRESAS
    ├── ODO_SUCURSALES
    ├── ODO_USUARIOS
    │   ├── ODO_USUARIO_ROLES → ODO_ROLES
    │   ├── ODO_USUARIO_SUCURSALES → ODO_SUCURSALES
    │   └── (utilizado en múltiples tablas como creado_por, modificado_por, doctor_id)
    ├── ODO_PACIENTES
    │   ├── ODO_CITAS
    │   │   └── ODO_HISTORIAS_CLINICAS
    │   │       ├── ODO_TRATAMIENTOS_PACIENTE
    │   │       │   └── ODO_SESIONES_TRATAMIENTO
    │   │       └── ODO_PRESCRIPCIONES
    │   ├── ODO_ODONTOGRAMAS
    │   │   └── ODO_DIENTES
    │   │       ├── ODO_HALLAZGOS_DIENTE
    │   │       └── ODO_TRATAMIENTOS_DIENTE
    │   └── ODO_FACTURAS
    │       ├── ODO_DETALLES_FACTURA
    │       └── ODO_PAGOS
    └── ODO_TIMBRADOS → ODO_FACTURAS

ODO_CATALOGOS_TRATAMIENTOS → ODO_TRATAMIENTOS_PACIENTE

ODO_DEPARTAMENTOS
    └── ODO_CIUDADES
        └── ODO_BARRIOS

ODO_ARCHIVOS (genérico)
ODO_AUDITORIA (log)
```

---

## Estadísticas de Datos

| Tabla | Registros |
|-------|-----------|
| ODO_DIENTES | 96 |
| ODO_CATALOGOS_TRATAMIENTOS | 33 |
| ODO_CIUDADES | 14 |
| ODO_DEPARTAMENTOS | 7 |
| ODO_FACTURAS | 6 |
| ODO_DETALLES_FACTURA | 6 |
| ODO_AUDITORIA | 5 |
| ODO_CITAS | 4 |
| ODO_USUARIOS | 4 |
| ODO_ROLES | 4 |
| ODO_USUARIO_SUCURSALES | 4 |
| ODO_PACIENTES | 3 |
| ODO_ODONTOGRAMAS | 3 |
| ODO_HALLAZGOS_DIENTE | 3 |
| ODO_USUARIO_ROLES | 3 |
| ODO_TRATAMIENTOS_DIENTE | 3 |
| ODO_HISTORIAS_CLINICAS | 2 |
| ODO_EMPRESAS | 1 |
| ODO_SUCURSALES | 1 |
| ODO_TIMBRADOS | 1 |
| Otras | 0 |

**Total de registros**: ~166

---

## Convenciones y Estándares

### Nomenclatura
- Todas las tablas tienen prefijo `ODO_`
- Primary Keys: `[TABLA_SINGULAR]_ID`
- Timestamps con timezone: `TIMESTAMP(6) WITH TIME ZONE`
- Campos de auditoría: `FECHA_CREACION`, `CREADO_POR`, `FECHA_MODIFICACION`, `MODIFICADO_POR`
- Estado activo: `ACTIVO CHAR(1)` ('S'/'N')

### Campos Comunes
- `ACTIVO` - Borrado lógico
- `FECHA_CREACION`, `FECHA_MODIFICACION` - Auditoría temporal
- `CREADO_POR`, `MODIFICADO_POR` → ODO_USUARIOS - Auditoría de usuario
- `EMPRESA_ID` - Multi-tenancy

### CLOBs y BLOBs
- `CLOB`: Observaciones extensas, datos JSON, XML
- `BLOB`: QR codes, imágenes

---

## Características del Sistema

### 1. Multi-Tenancy
El sistema soporta múltiples empresas mediante `EMPRESA_ID` en tablas principales.

### 2. Facturación Electrónica Paraguay
Implementación completa del sistema de facturación electrónica con:
- Timbrados fiscales
- CDC (Código de Control)
- XML y QR
- Integración con SIFEN/SET

### 3. Auditoría Completa
- Tabla ODO_AUDITORIA con tracking de cambios
- Campos de auditoría en todas las tablas
- Registro de IP y User Agent

### 4. Gestión Documental
- ODO_ARCHIVOS permite adjuntar documentos a cualquier entidad
- Sistema genérico con `ENTIDAD_TIPO` + `ENTIDAD_ID`

### 5. Odontograma Digital
- Soporte para odontograma permanente y temporal
- Numeración FDI estándar
- Tracking de hallazgos y tratamientos por diente

---

## Próximos Pasos Sugeridos

1. ✅ Documentar modelo (completado)
2. Generar packages PL/SQL para cada módulo
3. Configurar ORDS para APIs REST
4. Inicializar frontend React
5. Implementar módulos por prioridad:
   - Pacientes y Citas (básico)
   - Historia Clínica y Odontograma
   - Tratamientos
   - Facturación
