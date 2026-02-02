# Instrucciones para IA Frontend - Sistema de Odontología

## Contexto del Proyecto

Estás trabajando en un sistema de odontología. El **backend ya está completo** con:
- Base de datos Oracle Cloud con 26 tablas
- 5 packages PL/SQL compilados y funcionando
- **26 endpoints REST** configurados en ORDS (11 GET + 15 POST/PUT/DELETE)

Tu tarea es crear el **frontend en React** con CRUD completo.

---

## Estructura del Proyecto

```
/root/proyectos/sistema-odontologia/
├── frontend/          # <-- TU ÁREA DE TRABAJO
├── database/          # Backend (ya completado)
├── config/            # Configuración Oracle
└── docs/              # Documentación
```

---

## Tu Tarea: Inicializar Frontend React

### 1. Crear proyecto React con Vite

```bash
cd /root/proyectos/sistema-odontologia/frontend
npm create vite@latest . -- --template react
npm install
```

### 2. Instalar dependencias recomendadas

```bash
npm install axios react-router-dom @tanstack/react-query
npm install tailwindcss postcss autoprefixer -D
npx tailwindcss init -p
```

### 3. Configurar API Base URL

Crear archivo `frontend/src/config/api.js`:

```javascript
// La URL se obtiene de Oracle Cloud Console
// Autonomous Database > Database Actions > RESTful Services
export const API_BASE_URL = 'https://<tu-id>.adb.<region>.oraclecloudapps.com/ords/admin/api/v1';

// Para desarrollo local, pedir al usuario la URL exacta
```

---

## API REST Disponible

### Endpoints GET (Lectura) - 16 endpoints

| Endpoint | Descripción |
|----------|-------------|
| `GET /pacientes` | Lista pacientes (`?activo=S&empresa_id=1`) |
| `GET /pacientes/:id` | Detalle de paciente |
| `GET /pacientes/search?q=texto` | Buscar pacientes |
| `GET /citas` | Lista citas (`?estado=PENDIENTE&fecha=2026-01-26`) |
| `GET /citas/:id` | Detalle de cita |
| `GET /citas/agenda/:doctor_id` | Agenda del doctor (`?fecha=2026-01-26`) |
| `GET /doctores` | Lista doctores activos |
| `GET /tratamientos/catalogo` | Catálogo de tratamientos |
| `GET /tratamientos/paciente/:id` | Tratamientos de un paciente |
| `GET /historias/:id` | Historia clínica completa |
| `GET /historias/paciente/:id` | Historias de un paciente |
| `GET /odontograma/paciente/:id` | **Odontograma actual del paciente** |
| `GET /odontograma/:id` | **Detalle de odontograma** |
| `GET /odontograma/historial/:paciente_id` | **Historial de odontogramas** |
| `GET /odontograma/:id/resumen` | **Resumen por estados** |
| `GET /odontograma/diente/:id/hallazgos` | **Hallazgos de un diente** |

### Endpoints POST/PUT/DELETE (Escritura) - 19 endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/pacientes` | POST | Crear paciente |
| `/pacientes/:id` | PUT | Actualizar paciente |
| `/pacientes/:id` | DELETE | Eliminar paciente (soft delete) |
| `/citas` | POST | Crear cita |
| `/citas/:id` | PUT | Actualizar cita |
| `/citas/:id/estado` | PUT | Cambiar estado (PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA) |
| `/citas/:id` | DELETE | Cancelar cita |
| `/tratamientos/asignar` | POST | Asignar tratamiento a paciente |
| `/tratamientos/paciente/:id/update` | PUT | Actualizar tratamiento |
| `/tratamientos/paciente/:id/estado` | PUT | Cambiar estado tratamiento |
| `/tratamientos/paciente/:id/sesion` | POST | Registrar sesión de tratamiento |
| `/historias` | POST | Crear historia clínica |
| `/historias/:id` | PUT | Actualizar historia |
| `/historias/:id/prescripcion` | POST | Agregar prescripción |
| `/auth/login` | POST | Login de usuario |
| `/odontograma` | POST | **Crear nuevo odontograma** |
| `/odontograma/:id/diente` | PUT | **Actualizar un diente** |
| `/odontograma/:id/dientes` | PUT | **Actualizar múltiples dientes (bulk)** |
| `/odontograma/hallazgo` | POST | **Registrar hallazgo dental** |

### Formato de Respuesta GET

```json
{
  "items": [...],
  "hasMore": false,
  "limit": 25,
  "offset": 0
}
```

### Formato de Respuesta POST/PUT/DELETE

```json
{
  "success": true,
  "paciente_id": 4,
  "mensaje": "Paciente creado exitosamente"
}
```

---

## Módulos/Componentes Sugeridos

### Estructura de carpetas recomendada:

```
frontend/src/
├── components/
│   ├── common/          # Botones, inputs, modales
│   ├── pacientes/       # Componentes de pacientes
│   ├── citas/           # Componentes de citas
│   ├── tratamientos/    # Componentes de tratamientos
│   └── historias/       # Componentes de historias
├── pages/
│   ├── Dashboard.jsx
│   ├── Pacientes.jsx
│   ├── PacienteDetalle.jsx
│   ├── Citas.jsx
│   ├── AgendaDoctor.jsx
│   └── Tratamientos.jsx
├── services/
│   └── api.js           # Llamadas a la API
├── hooks/
│   └── useApi.js        # Custom hooks
└── config/
    └── api.js           # Configuración
```

---

## Ejemplo de Servicio API

```javascript
// frontend/src/services/api.js
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const pacientesService = {
  // GET
  getAll: (params) => api.get('/pacientes', { params }),
  getById: (id) => api.get(`/pacientes/${id}`),
  search: (q) => api.get('/pacientes/search', { params: { q } }),
  // POST/PUT/DELETE
  create: (data) => api.post('/pacientes', data),
  update: (id, data) => api.put(`/pacientes/${id}`, data),
  delete: (id) => api.delete(`/pacientes/${id}`),
};

export const citasService = {
  // GET
  getAll: (params) => api.get('/citas', { params }),
  getById: (id) => api.get(`/citas/${id}`),
  getAgenda: (doctorId, fecha) =>
    api.get(`/citas/agenda/${doctorId}`, { params: { fecha } }),
  // POST/PUT/DELETE
  create: (data) => api.post('/citas', data),
  update: (id, data) => api.put(`/citas/${id}`, data),
  cambiarEstado: (id, estado, motivo) =>
    api.put(`/citas/${id}/estado`, { estado, motivo_cancelacion: motivo }),
  cancelar: (id, motivo) => api.delete(`/citas/${id}`, { data: { motivo } }),
};

export const tratamientosService = {
  // GET
  getCatalogo: () => api.get('/tratamientos/catalogo'),
  getByPaciente: (pacienteId) =>
    api.get(`/tratamientos/paciente/${pacienteId}`),
  // POST/PUT
  asignar: (data) => api.post('/tratamientos/asignar', data),
  update: (id, data) => api.put(`/tratamientos/paciente/${id}/update`, data),
  cambiarEstado: (id, estado) =>
    api.put(`/tratamientos/paciente/${id}/estado`, { estado }),
  registrarSesion: (id, data) =>
    api.post(`/tratamientos/paciente/${id}/sesion`, data),
};

export const historiasService = {
  // GET
  getById: (id) => api.get(`/historias/${id}`),
  getByPaciente: (pacienteId) =>
    api.get(`/historias/paciente/${pacienteId}`),
  // POST/PUT
  create: (data) => api.post('/historias', data),
  update: (id, data) => api.put(`/historias/${id}`, data),
  agregarPrescripcion: (id, data) =>
    api.post(`/historias/${id}/prescripcion`, data),
};

export const doctoresService = {
  getAll: () => api.get('/doctores'),
};

export const authService = {
  login: (email, password, empresaId = 1) =>
    api.post('/auth/login', { email, password, empresa_id: empresaId }),
};

// =====================================
// ODONTOGRAMA - Módulo Principal
// =====================================
export const odontogramaService = {
  // GET - Lectura
  getActual: (pacienteId) => api.get(`/odontograma/paciente/${pacienteId}`),
  getById: (id) => api.get(`/odontograma/${id}`),
  getHistorial: (pacienteId) => api.get(`/odontograma/historial/${pacienteId}`),
  getResumen: (id) => api.get(`/odontograma/${id}/resumen`),
  getHallazgosDiente: (dienteId) => api.get(`/odontograma/diente/${dienteId}/hallazgos`),

  // POST - Crear
  create: (data) => api.post('/odontograma', data),
  registrarHallazgo: (data) => api.post('/odontograma/hallazgo', data),

  // PUT - Actualizar
  actualizarDiente: (odontogramaId, data) =>
    api.put(`/odontograma/${odontogramaId}/diente`, data),
  actualizarDientesBulk: (odontogramaId, data) =>
    api.put(`/odontograma/${odontogramaId}/dientes`, data),
};
```

---

## Prioridades de Desarrollo

1. **Fase 1 - Básico:**
   - [ ] Configurar proyecto React + Vite
   - [ ] Configurar TailwindCSS
   - [ ] Crear layout principal con navegación
   - [ ] Página de listado de pacientes
   - [ ] Búsqueda de pacientes

2. **Fase 2 - CRUD Pacientes:**
   - [ ] Detalle de paciente
   - [ ] **Formulario crear paciente**
   - [ ] **Formulario editar paciente**
   - [ ] **Botón eliminar paciente**
   - [ ] Historial de tratamientos del paciente
   - [ ] Historial clínico del paciente

3. **Fase 3 - CRUD Citas:**
   - [ ] Listado de citas
   - [ ] Agenda del doctor (vista calendario)
   - [ ] Filtros por fecha/estado
   - [ ] **Formulario crear cita**
   - [ ] **Formulario editar cita**
   - [ ] **Botones cambiar estado** (Confirmar, Completar, Cancelar)

4. **Fase 4 - Dashboard:**
   - [ ] Resumen de citas del día
   - [ ] Pacientes recientes
   - [ ] Estadísticas básicas

5. **Fase 5 - Tratamientos e Historias:**
   - [ ] **Asignar tratamiento a paciente**
   - [ ] **Registrar sesiones de tratamiento**
   - [ ] **Crear historia clínica**
   - [ ] **Agregar prescripciones**

6. **Fase 6 - Odontograma (Módulo Principal):**
   - [ ] **Visualización interactiva del odontograma**
   - [ ] Mostrar 32 dientes (permanente) o 20 dientes (temporal)
   - [ ] **Click en diente para ver/editar estado**
   - [ ] **Actualización bulk de múltiples dientes**
   - [ ] Código de colores por estado (SANO, CARIES, OBTURADO, etc.)
   - [ ] Historial de odontogramas del paciente
   - [ ] **Registro de hallazgos por diente**
   - [ ] Resumen visual de estados

7. **Fase 7 - Autenticación:**
   - [ ] Pantalla de login
   - [ ] Proteger rutas
   - [ ] Manejo de sesión

---

## Notas Importantes

1. **CORS**: Si hay problemas de CORS, el usuario debe configurarlo en Oracle Cloud:
   - Database Actions → RESTful Services → Módulo "odontologia" → Origins Allowed

2. **URL de API**: Pedir al usuario que proporcione la URL exacta de ORDS desde Oracle Cloud Console.

3. **API Completa**: Ya están disponibles todos los endpoints CRUD (POST/PUT/DELETE).

4. **Empresa ID**: Por defecto usar `empresa_id=1` en todas las llamadas.

5. **Moneda**: Los precios están en Guaraníes (PYG), sin decimales.

6. **Estados de Citas**: PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA

7. **Estados de Tratamientos**: PENDIENTE, EN_PROGRESO, COMPLETADO, CANCELADO

---

## Ejemplos de Uso CRUD

### Crear Paciente
```javascript
const nuevoPaciente = {
  documento_numero: "1234567",
  nombre: "Juan",
  apellido: "Pérez",
  fecha_nacimiento: "1990-05-15",
  sexo: "M",
  telefono_principal: "0981123456",
  email: "juan@email.com",
  empresa_id: 1
};

const response = await pacientesService.create(nuevoPaciente);
// { success: true, paciente_id: 4, mensaje: "Paciente creado exitosamente" }
```

### Crear Cita
```javascript
const nuevaCita = {
  paciente_id: 1,
  doctor_id: 2,
  fecha_hora: "2026-01-27 10:00",
  duracion_minutos: 30,
  tipo_cita: "CONSULTA",
  motivo: "Control mensual",
  empresa_id: 1,
  sucursal_id: 1
};

const response = await citasService.create(nuevaCita);
// { success: true, cita_id: 5, mensaje: "Cita creada exitosamente" }
```

### Cambiar Estado de Cita
```javascript
await citasService.cambiarEstado(5, "CONFIRMADA");
// { success: true, mensaje: "Estado actualizado" }
```

### Asignar Tratamiento
```javascript
const tratamiento = {
  paciente_id: 1,
  catalogo_id: 5,
  doctor_id: 2,
  numero_diente: "18",
  precio_acordado: 500000,
  sesiones_totales: 3
};

const response = await tratamientosService.asignar(tratamiento);
// { success: true, tratamiento_paciente_id: 1, mensaje: "Tratamiento asignado" }
```

### Login
```javascript
const response = await authService.login("doctor@clinica.com", "password123");
// { success: true, usuario_id: 2, mensaje: "Autenticación exitosa" }
```

### Crear Odontograma
```javascript
const nuevoOdontograma = {
  paciente_id: 1,
  empresa_id: 1,
  tipo: "PERMANENTE",  // o "TEMPORAL" para niños
  observaciones: "Evaluación inicial",
  creado_por: 2  // usuario_id del doctor
};

const response = await odontogramaService.create(nuevoOdontograma);
// { success: true, odontograma_id: 4, mensaje: "Odontograma creado con ID: 4" }
// Se crean automáticamente 32 dientes (PERMANENTE) o 20 dientes (TEMPORAL)
```

### Obtener Odontograma del Paciente
```javascript
const odontograma = await odontogramaService.getActual(pacienteId);
// Retorna el odontograma más reciente con todos sus dientes
// {
//   success: true,
//   odontograma_id: 1,
//   paciente_nombre: "Juan Pérez",
//   tipo: "PERMANENTE",
//   dientes: [
//     { diente_id: 1, numero_fdi: 11, estado: "SANO", cuadrante: 1, posicion: 1 },
//     { diente_id: 2, numero_fdi: 12, estado: "CARIES", cuadrante: 1, posicion: 2 },
//     ...
//   ]
// }
```

### Actualizar Estado de un Diente
```javascript
await odontogramaService.actualizarDiente(odontogramaId, {
  numero_fdi: 16,
  estado: "CARIES",
  observaciones: "Caries en cara oclusal",
  modificado_por: 2
});
// { success: true, mensaje: "Diente 16 actualizado a CARIES" }
```

### Actualizar Múltiples Dientes (Bulk)
```javascript
await odontogramaService.actualizarDientesBulk(odontogramaId, {
  dientes: [
    { numero_fdi: 16, estado: "CARIES", observaciones: "Caries profunda" },
    { numero_fdi: 26, estado: "OBTURADO", observaciones: "Amalgama" },
    { numero_fdi: 36, estado: "CORONA", observaciones: "Corona porcelana" }
  ],
  modificado_por: 2
});
// { success: true, mensaje: "3 dientes actualizados exitosamente" }
```

### Registrar Hallazgo en un Diente
```javascript
await odontogramaService.registrarHallazgo({
  diente_id: 5,
  cita_id: 10,
  tipo_hallazgo: "CARIES",
  superficies_afectadas: "O,M",  // Oclusal, Mesial
  severidad: "MODERADA",
  descripcion: "Caries ocluso-mesial",
  requiere_tratamiento: "S",
  doctor_id: 2
});
// { success: true, hallazgo_id: 1, mensaje: "Hallazgo registrado con ID: 1" }
```

### Estados de Dientes Disponibles
```javascript
const ESTADOS_DIENTE = [
  'SANO',                 // Diente sin patología
  'CARIES',               // Caries dental
  'OBTURADO',             // Restauración/empaste
  'AUSENTE',              // Diente extraído/ausente
  'CORONA',               // Corona protésica
  'ENDODONCIA',           // Tratamiento de conducto
  'IMPLANTE',             // Implante dental
  'PROTESIS',             // Prótesis
  'FRACTURADO',           // Fractura dental
  'EXTRACCION_INDICADA'   // Pendiente de extracción
];
```

### Numeración FDI (ISO 3950)
```
Dentición PERMANENTE (32 dientes):
  Cuadrante 1 (Sup-Der): 11-18
  Cuadrante 2 (Sup-Izq): 21-28
  Cuadrante 3 (Inf-Izq): 31-38
  Cuadrante 4 (Inf-Der): 41-48

Dentición TEMPORAL (20 dientes):
  Cuadrante 5 (Sup-Der): 51-55
  Cuadrante 6 (Sup-Izq): 61-65
  Cuadrante 7 (Inf-Izq): 71-75
  Cuadrante 8 (Inf-Der): 81-85
```

---

## Documentación Adicional

- Modelo de datos: `docs/MODELO_DATOS.md`
- API REST completa: `docs/API_REST.md`
- Estado del proyecto: `ESTADO.md`

---

## Git

El repositorio ya está configurado:
- URL: https://github.com/richardvillalba/sistema-odontologico
- Branch principal: `main`

Para trabajar:
```bash
cd /root/proyectos/sistema-odontologia
git pull origin main
# Crear tu branch
git checkout -b feature/frontend-init
# ... hacer cambios ...
git add frontend/
git commit -m "feat: inicializar proyecto React"
git push origin feature/frontend-init
```

---

¡Buena suerte! El backend está listo para consumir.
