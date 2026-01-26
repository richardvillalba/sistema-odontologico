# Documentación del Frontend

## 1. Stack Tecnológico

El frontend del Sistema de Odontología está construido con:

- **React 18**: Biblioteca UI principal
- **Vite 6**: Build tool y servidor de desarrollo
- **TypeScript**: Tipado estático
- **React Router v6**: Navegación SPA
- **Axios**: Cliente HTTP para consumir APIs
- **CSS Modules/Variables**: Estrategia de estilos (Vanilla CSS con arquitectura)

## 2. Arquitectura de Directorios

```
frontend/
├── src/
│   ├── assets/         # Recursos estáticos
│   ├── components/     # Componentes compartidos (atomic design)
│   ├── pages/          # Vistas principales (page-level components)
│   ├── services/       # Capa de comunicación con API
│   ├── hooks/          # Hooks personalizados (lógica de negocio)
│   ├── types/          # Definiciones de tipos TypeScript
│   ├── utils/          # Helpers y utilidades puras
│   └── styles/         # Sistema de diseño global
```

## 3. Conexión con Backend (ORDS)

El frontend se comunica con Oracle Rest Data Services (ORDS).
En desarrollo, se utiliza el proxy de Vite para evitar problemas de CORS:

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  }
}
```

### Endpoints
La estructura base de los endpoints debe seguir: `/api/odo/[modulo]/[recurso]`

## 4. Sistema de Diseño

Utilizamos variables CSS nativas para el theming:

- Colores principales: `--primary`, `--secondary`, `--accent`
- Espaciado: `--spacing-xs` hasta `--spacing-2xl`
- Tipografía: `--font-sans`

Ver `frontend/src/styles/index.css` para la definición completa.

## 5. Convenciones de Desarrollo

1. **Componentes**: Function Components con Hooks y Types.
2. **Estado**: Preferir estado local o Context API para estado global simple.
3. **Async**: Usar Async/Await en servicios y `useEffect` o React Query (futuro) en componentes.
4. **Tipos**: **NO usar `any`**. Definir interfaces claras para modelos de datos (Paciente, Cita, etc.).

## 6. Configuración de Entorno

Variables necesarias en `.env`:
- `VITE_API_URL`: URL base del backend ORDS
