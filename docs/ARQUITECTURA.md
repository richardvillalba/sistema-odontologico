# Arquitectura del Sistema

## Visión General

Sistema de gestión odontológica con arquitectura de 3 capas lógicas:

```
┌─────────────────────────────────────┐
│       React Frontend (UI)           │
│     - Componentes React             │
│     - State Management              │
│     - Axios/Fetch para APIs         │
└──────────────┬──────────────────────┘
               │ HTTP/REST
               │ JSON
┌──────────────▼──────────────────────┐
│    Oracle REST Data Services        │
│           (ORDS)                    │
│     - Endpoints REST                │
│     - Autenticación                 │
│     - Mapeo PL/SQL → REST          │
└──────────────┬──────────────────────┘
               │ SQL/PL/SQL
               │
┌──────────────▼──────────────────────┐
│      Oracle Database Cloud          │
│                                     │
│  ┌─────────────────────────────┐  │
│  │   PL/SQL Packages           │  │
│  │   - PKG_PACIENTES           │  │
│  │   - PKG_CITAS               │  │
│  │   - PKG_TRATAMIENTOS        │  │
│  │   - PKG_FACTURACION         │  │
│  └─────────────┬───────────────┘  │
│                │                   │
│  ┌─────────────▼───────────────┐  │
│  │   Tablas y Datos            │  │
│  │   - TB_PACIENTE             │  │
│  │   - TB_CITA                 │  │
│  │   - TB_TRATAMIENTO          │  │
│  │   - TB_FACTURA              │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Capa de Presentación (Frontend)

### Tecnología
- **Framework**: React 18+
- **Routing**: React Router
- **HTTP Client**: Axios
- **UI Library**: (Por definir - Material-UI, Ant Design, etc.)

### Responsabilidades
- Renderizar la interfaz de usuario
- Capturar entrada del usuario
- Validación básica en cliente
- Consumir APIs REST de ORDS
- Gestionar estado de la aplicación

## Capa de API (ORDS)

### Oracle REST Data Services

#### Configuración
- Instalado en Oracle Cloud
- Expone packages PL/SQL como endpoints REST
- Maneja autenticación OAuth 2.0 o Basic Auth

#### Endpoints Típicos
```
GET    /api/pacientes           -> PKG_PACIENTES.get_all()
GET    /api/pacientes/:id       -> PKG_PACIENTES.get_by_id()
POST   /api/pacientes           -> PKG_PACIENTES.insert()
PUT    /api/pacientes/:id       -> PKG_PACIENTES.update()
DELETE /api/pacientes/:id       -> PKG_PACIENTES.delete()
```

## Capa de Lógica de Negocio (PL/SQL)

### Packages PL/SQL

Toda la lógica de negocio reside en packages:

#### PKG_PACIENTES
- Gestión CRUD de pacientes
- Validaciones de datos
- Búsquedas y filtros

#### PKG_CITAS
- Programación de citas
- Validación de disponibilidad
- Recordatorios

#### PKG_TRATAMIENTOS
- Gestión de tratamientos
- Odontograma
- Historial clínico

#### PKG_FACTURACION
- Generación de facturas
- Control de pagos
- Reportes financieros

### Ventajas de este Enfoque

✅ **Centralización**: Toda la lógica en un solo lugar
✅ **Performance**: Procesamiento cerca de los datos
✅ **Transacciones**: Control ACID nativo
✅ **Seguridad**: Un solo punto de control de acceso
✅ **Mantenibilidad**: Código organizado en packages

## Flujo de una Operación Típica

### Ejemplo: Crear un Paciente

1. **Usuario** llena formulario en React
2. **React** valida datos y hace POST a `/api/pacientes`
3. **ORDS** recibe el request y llama a `PKG_PACIENTES.insert_paciente()`
4. **Package PL/SQL**:
   - Valida datos
   - Verifica duplicados
   - Inserta en `TB_PACIENTE`
   - Registra auditoría
   - Retorna resultado
5. **ORDS** convierte resultado a JSON
6. **React** recibe respuesta y actualiza UI

## Seguridad

### Autenticación
- ORDS maneja autenticación
- Tokens JWT o sesiones
- Roles de usuario en Oracle

### Autorización
- Permisos a nivel de package
- Row-level security en tablas críticas
- Validación de roles en cada operación

## Escalabilidad

### Consideraciones
- Oracle Cloud permite escalamiento vertical
- Connection pooling en ORDS
- Cache en React para datos estáticos
- Índices apropiados en BD

## Monitoreo y Logs

- Logs de ORDS para APIs
- Tabla de auditoría en Oracle
- Triggers para rastrear cambios críticos

## Tecnologías Futuras (Opcional)

- Oracle APEX para módulos administrativos
- Oracle Analytics Cloud para reportes avanzados
- Notificaciones push con Firebase
