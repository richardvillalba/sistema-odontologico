# Sistema de Gestión para Odontología

## Descripción
Sistema integral de gestión para consultorios odontológicos, desarrollado con arquitectura moderna separando frontend y backend en base de datos.

## Arquitectura

### Stack Tecnológico
- **Frontend**: React
- **Backend**: Oracle PL/SQL (Packages, Procedures, Functions)
- **API REST**: Oracle REST Data Services (ORDS)
- **Base de Datos**: Oracle Cloud

### Flujo de Datos
```
React Frontend <---> ORDS (REST APIs) <---> PL/SQL Packages <---> Oracle Database
```

## Estructura del Proyecto

```
sistema-odontologia/
├── frontend/                 # Aplicación React
│   └── (código React por crear)
├── database/                 # Todo el código de base de datos
│   ├── packages/            # PL/SQL Packages (lógica de negocio)
│   ├── procedures/          # Stored Procedures
│   ├── functions/           # Functions
│   ├── triggers/            # Database Triggers
│   ├── views/               # Database Views
│   ├── scripts/             # Scripts DDL (CREATE TABLE, etc.)
│   └── migrations/          # Scripts de migración/actualización
├── docs/                    # Documentación del proyecto
└── README.md               # Este archivo
```

## Módulos Funcionales (Planificados)

- [ ] Gestión de Pacientes
- [ ] Historia Clínica
- [ ] Agenda de Citas
- [ ] Tratamientos y Odontograma
- [ ] Facturación
- [ ] Inventario
- [ ] Reportes

## Configuración de Desarrollo

### Prerequisitos
- Node.js (para React)
- Oracle Cloud Account
- Oracle SQL Developer o similar
- ORDS configurado

### Base de Datos
1. Conectar a Oracle Cloud
2. Ejecutar scripts en orden:
   - `database/scripts/` (crear tablas)
   - `database/packages/` (crear packages)
   - Configurar ORDS para exponer APIs REST

### Frontend
```bash
cd frontend
npm install
npm start
```

## Convenciones de Código

### PL/SQL
- Nombres de packages: `PKG_NOMBRE`
- Nombres de procedures: `SP_NOMBRE`
- Nombres de functions: `FN_NOMBRE`
- Comentarios obligatorios en cada procedimiento/función

### React
- Componentes en PascalCase
- Hooks personalizados con prefijo `use`
- Organización por features

## Estado del Proyecto
Ver [ESTADO.md](ESTADO.md) para información actualizada sobre el progreso.

## Contribución
Este es un proyecto privado. Consultar con el propietario antes de realizar cambios.

## Licencia
Privado - Todos los derechos reservados
