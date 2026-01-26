# Frontend - Sistema de Odontología

Frontend de la aplicación de gestión odontológica construido con React, TypeScript y Vite.

## 🚀 Stack Tecnológico

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite 6
- **Router**: React Router v6
- **HTTP Client**: Axios
- **Linting**: ESLint
- **Styling**: Vanilla CSS con CSS Variables

## 📁 Estructura del Proyecto

```
frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── assets/         # Imágenes, iconos, etc.
│   ├── components/     # Componentes reutilizables
│   ├── pages/          # Páginas/Vistas principales
│   ├── services/       # Servicios de API (llamadas ORDS)
│   ├── hooks/          # Custom React Hooks
│   ├── types/          # TypeScript types/interfaces
│   ├── utils/          # Funciones utilitarias
│   ├── styles/         # Estilos CSS globales
│   ├── App.tsx         # Componente principal
│   └── main.tsx        # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🛠️ Comandos Disponibles

```bash
# Instalar dependencias
npm install

# Modo desarrollo (puerto 3000)
npm run dev

# Compilar para producción
npm run build

# Vista previa de build de producción
npm run preview

# Linting
npm run lint
```

## 🔌 Conexión con Backend

El frontend se conecta al backend Oracle ORDS mediante un proxy configurado en `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080', // ORDS server
    changeOrigin: true,
  }
}
```

Todas las llamadas a `/api/*` serán redirigidas automáticamente al servidor ORDS.

## 📦 Módulos Principales

1. **Pacientes** - Gestión de pacientes
2. **Citas** - Agenda y programación
3. **Historia Clínica** - Registro médico
4. **Odontograma** - Odontograma digital FDI
5. **Tratamientos** - Catálogo y seguimiento
6. **Facturación** - Facturación electrónica Paraguay

## 🎨 Sistema de Diseño

El proyecto utiliza un sistema de diseño basado en CSS Variables definidas en `src/styles/index.css`:

- **Colores**: Paleta profesional para aplicaciones médicas
- **Spacing**: Sistema de espaciado consistente
- **Typography**: Tipografía optimizada para legibilidad
- **Shadows**: Sistema de sombras para jerarquía visual
- **Transitions**: Animaciones suaves y profesionales

## 🔐 Autenticación

(Por implementar)
- Login con credenciales Oracle
- Manejo de sesiones
- Protección de rutas

## 📝 Convenciones de Código

- Componentes en PascalCase: `MyComponent.tsx`
- Archivos de servicios: `xxxService.ts`
- Custom hooks con prefijo `use`: `useAuth.ts`
- Estilos por módulo cuando sea necesario
- Interfaces TypeScript para todas las entidades

## 🌐 Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=Sistema de Odontología
```

## 📚 Recursos

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Router](https://reactrouter.com/)

## 👥 Desarrollo

Este proyecto es parte de un sistema mayor que incluye:
- **Frontend** (esta carpeta) - React
- **Backend** - Oracle PL/SQL + ORDS
- **Database** - Oracle Cloud

Ver documentación en `/docs` para más información sobre la arquitectura completa.

## 📄 Licencia

Privado - Todos los derechos reservados
