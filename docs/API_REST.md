# API REST - Sistema de Odontología

## Configuración

- **Schema**: ADMIN
- **Módulo**: odontologia
- **Base Path**: `/api/v1/`
- **Status**: PUBLISHED

## URL Base

```
https://<tu-id-adb>.adb.<region>.oraclecloudapps.com/ords/admin/api/v1/
```

Para obtener la URL exacta:
1. Oracle Cloud Console → Autonomous Database → Tu BD
2. Database Actions → RESTful Services

---

## Endpoints Disponibles

### Pacientes

#### GET /pacientes
Lista todos los pacientes.

**Parámetros Query:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| empresa_id | NUMBER | ID de empresa (default: 1) |
| activo | CHAR | 'S' o 'N' para filtrar por estado |

**Ejemplo:**
```bash
curl "https://...ords/admin/api/v1/pacientes?activo=S"
```

**Respuesta:**
```json
{
  "items": [
    {
      "paciente_id": 1,
      "numero_historia": "HC-000001",
      "nombre": "Juan",
      "apellido": "Pérez",
      "nombre_completo": "Juan Pérez",
      "documento_numero": "1234567",
      "edad": 35,
      "telefono_principal": "0981123456",
      "activo": "S"
    }
  ],
  "hasMore": false,
  "limit": 25,
  "offset": 0
}
```

---

#### GET /pacientes/:id
Obtiene un paciente específico.

**Parámetros Path:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | NUMBER | ID del paciente |

**Ejemplo:**
```bash
curl "https://...ords/admin/api/v1/pacientes/1"
```

---

#### GET /pacientes/search
Busca pacientes por término.

**Parámetros Query:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| q | VARCHAR | Término de búsqueda (nombre, apellido, documento) |
| empresa_id | NUMBER | ID de empresa (default: 1) |

**Ejemplo:**
```bash
curl "https://...ords/admin/api/v1/pacientes/search?q=perez"
```

---

#### POST /pacientes
Crea un nuevo paciente.

**Body (JSON):**
```json
{
  "documento_numero": "1234567",
  "nombre": "Juan",
  "apellido": "Pérez",
  "fecha_nacimiento": "1990-05-15",
  "sexo": "M",
  "telefono_principal": "0981123456",
  "email": "juan@email.com",
  "direccion": "Calle Principal 123",
  "ciudad_id": 1,
  "tipo_documento": "CI",
  "empresa_id": 1
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "paciente_id": 4,
  "mensaje": "Paciente creado exitosamente"
}
```

---

#### PUT /pacientes/:id
Actualiza un paciente existente.

**Body (JSON):** Solo los campos a actualizar
```json
{
  "telefono_principal": "0982999888",
  "email": "nuevo@email.com"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "mensaje": "Paciente actualizado exitosamente"
}
```

---

#### DELETE /pacientes/:id
Elimina un paciente (soft delete - marca como inactivo).

**Respuesta (200):**
```json
{
  "success": true,
  "mensaje": "Paciente eliminado exitosamente"
}
```

---

### Citas

#### GET /citas
Lista todas las citas.

**Parámetros Query:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| empresa_id | NUMBER | ID de empresa (default: 1) |
| estado | VARCHAR | PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA |
| doctor_id | NUMBER | Filtrar por doctor |
| fecha | VARCHAR | Fecha en formato YYYY-MM-DD |

**Ejemplo:**
```bash
curl "https://...ords/admin/api/v1/citas?estado=PENDIENTE&fecha=2026-01-26"
```

---

#### GET /citas/:id
Obtiene una cita específica.

---

#### GET /citas/agenda/:doctor_id
Obtiene la agenda del día de un doctor.

**Parámetros Path:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| doctor_id | NUMBER | ID del doctor |

**Parámetros Query:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| fecha | VARCHAR | Fecha en formato YYYY-MM-DD (default: hoy) |

**Ejemplo:**
```bash
curl "https://...ords/admin/api/v1/citas/agenda/2?fecha=2026-01-26"
```

---

#### POST /citas
Crea una nueva cita.

**Body (JSON):**
```json
{
  "paciente_id": 1,
  "doctor_id": 2,
  "fecha_hora": "2026-01-27 10:00",
  "duracion_minutos": 30,
  "tipo_cita": "CONSULTA",
  "motivo": "Control mensual",
  "notas": "Paciente prefiere mañana",
  "empresa_id": 1,
  "sucursal_id": 1
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "cita_id": 5,
  "mensaje": "Cita creada exitosamente"
}
```

---

#### PUT /citas/:id
Actualiza una cita existente.

**Body (JSON):**
```json
{
  "fecha_hora": "2026-01-27 11:00",
  "duracion_minutos": 45,
  "motivo": "Control + limpieza"
}
```

---

#### PUT /citas/:id/estado
Cambia el estado de una cita.

**Body (JSON):**
```json
{
  "estado": "CONFIRMADA",
  "motivo_cancelacion": null
}
```

**Estados válidos:** PENDIENTE, CONFIRMADA, COMPLETADA, CANCELADA

---

#### DELETE /citas/:id
Cancela una cita.

**Body (JSON) opcional:**
```json
{
  "motivo": "Paciente no puede asistir"
}
```

---

### Doctores

#### GET /doctores
Lista todos los doctores activos.

**Parámetros Query:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| empresa_id | NUMBER | ID de empresa (default: 1) |

**Respuesta:**
```json
{
  "items": [
    {
      "usuario_id": 2,
      "nombre_completo": "Dr. Carlos García",
      "especialidad": "Odontología General",
      "registro_profesional": "OD-12345",
      "activo": "S"
    }
  ]
}
```

---

### Tratamientos

#### GET /tratamientos/catalogo
Lista el catálogo de tratamientos disponibles.

**Parámetros Query:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| categoria | VARCHAR | Filtrar por categoría |
| activo | CHAR | 'S' o 'N' (default: S) |

**Respuesta:**
```json
{
  "items": [
    {
      "catalogo_id": 1,
      "codigo": "LIMP-001",
      "nombre": "Limpieza Dental",
      "categoria": "PREVENTIVO",
      "precio_base": 150000,
      "duracion_estimada": 30,
      "requiere_anestesia": "N"
    }
  ]
}
```

---

#### GET /tratamientos/paciente/:paciente_id
Lista los tratamientos de un paciente.

**Parámetros Path:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| paciente_id | NUMBER | ID del paciente |

**Parámetros Query:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| estado | VARCHAR | PENDIENTE, EN_PROGRESO, COMPLETADO, CANCELADO |

---

#### POST /tratamientos/asignar
Asigna un tratamiento a un paciente.

**Body (JSON):**
```json
{
  "paciente_id": 1,
  "catalogo_id": 5,
  "doctor_id": 2,
  "historia_id": null,
  "numero_diente": "18",
  "fecha_propuesta": "2026-02-01",
  "precio_acordado": 500000,
  "descuento": 10,
  "sesiones_totales": 3
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "tratamiento_paciente_id": 1,
  "mensaje": "Tratamiento asignado con ID: 1"
}
```

---

#### PUT /tratamientos/paciente/:id/update
Actualiza un tratamiento de paciente.

**Body (JSON):**
```json
{
  "precio_acordado": 450000,
  "descuento": 15,
  "sesiones_totales": 4
}
```

---

#### PUT /tratamientos/paciente/:id/estado
Cambia el estado de un tratamiento.

**Body (JSON):**
```json
{
  "estado": "EN_PROGRESO"
}
```

**Estados válidos:** PENDIENTE, EN_PROGRESO, COMPLETADO, CANCELADO

---

#### POST /tratamientos/paciente/:id/sesion
Registra una sesión de tratamiento.

**Body (JSON):**
```json
{
  "cita_id": 5,
  "doctor_id": 2,
  "procedimiento_realizado": "Primera sesión de endodoncia",
  "observaciones": "Paciente tolera bien el procedimiento"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "sesion_id": 1,
  "mensaje": "Sesión registrada exitosamente"
}
```

---

### Historias Clínicas

#### GET /historias/paciente/:paciente_id
Lista las historias clínicas de un paciente.

**Parámetros Path:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| paciente_id | NUMBER | ID del paciente |

---

#### GET /historias/:id
Obtiene una historia clínica específica con todos los detalles.

**Respuesta incluye:**
- Datos del paciente (alergias, medicamentos, enfermedades)
- Datos del doctor
- Anamnesis, examen clínico, diagnóstico
- Signos vitales
- Plan de tratamiento

---

#### POST /historias
Crea una nueva historia clínica.

**Body (JSON):**
```json
{
  "paciente_id": 1,
  "cita_id": 5,
  "doctor_id": 2,
  "tipo_consulta": "PRIMERA_VEZ",
  "motivo_consulta": "Dolor en muela",
  "anamnesis": "Paciente refiere dolor desde hace 3 días",
  "examen_clinico": "Se observa caries profunda en pieza 18",
  "diagnostico": "Caries profunda con compromiso pulpar",
  "plan_tratamiento": "Endodoncia + corona",
  "observaciones": "Paciente ansioso"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "historia_id": 3,
  "mensaje": "Historia clínica creada exitosamente"
}
```

---

#### PUT /historias/:id
Actualiza una historia clínica.

**Body (JSON):**
```json
{
  "diagnostico": "Caries profunda - actualizado",
  "plan_tratamiento": "Endodoncia + corona de porcelana",
  "observaciones": "Se agregó radiografía"
}
```

---

#### POST /historias/:id/prescripcion
Agrega una prescripción a la historia clínica.

**Body (JSON):**
```json
{
  "medicamento": "Amoxicilina 500mg",
  "dosis": "1 cápsula",
  "frecuencia": "Cada 8 horas",
  "duracion": "7 días",
  "indicaciones": "Tomar con alimentos"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "prescripcion_id": 1,
  "mensaje": "Prescripción agregada exitosamente"
}
```

---

### Autenticación

#### POST /auth/login
Autentica un usuario.

**Body (JSON):**
```json
{
  "email": "doctor@clinica.com",
  "password": "mipassword",
  "empresa_id": 1
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "usuario_id": 2,
  "mensaje": "Autenticación exitosa"
}
```

**Respuesta fallida (401):**
```json
{
  "success": false,
  "usuario_id": null,
  "mensaje": "Credenciales inválidas"
}
```

---

### Odontograma

#### GET /odontograma/paciente/:paciente_id
Obtiene el odontograma más reciente de un paciente con todos sus dientes.

**Parámetros Path:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| paciente_id | NUMBER | ID del paciente |

**Respuesta:**
```json
{
  "success": true,
  "mensaje": "Odontograma obtenido exitosamente",
  "odontograma_id": 1,
  "paciente_nombre": "Juan Pérez",
  "numero_historia": "HC-000001",
  "tipo": "PERMANENTE",
  "dientes": [
    {
      "diente_id": 1,
      "numero_fdi": 11,
      "tipo_diente": "INCISIVO_CENTRAL",
      "estado": "SANO",
      "cuadrante": 1,
      "posicion": 1,
      "observaciones": null
    }
  ]
}
```

---

#### GET /odontograma/:id
Obtiene el detalle completo de un odontograma específico.

---

#### GET /odontograma/historial/:paciente_id
Obtiene el historial de todos los odontogramas de un paciente.

**Respuesta:**
```json
{
  "success": true,
  "items": [
    {
      "odontograma_id": 1,
      "tipo": "PERMANENTE",
      "observaciones": "Evaluación inicial",
      "fecha_creacion": "2026-01-27 10:00:00",
      "creado_por": "Dr. García",
      "dientes_afectados": 3,
      "total_dientes": 32
    }
  ]
}
```

---

#### GET /odontograma/:id/resumen
Obtiene un resumen agrupado por estados del odontograma.

**Respuesta:**
```json
{
  "success": true,
  "resumen": [
    { "estado": "SANO", "cantidad": 28, "dientes": "11, 12, 13..." },
    { "estado": "CARIES", "cantidad": 2, "dientes": "16, 26" },
    { "estado": "OBTURADO", "cantidad": 2, "dientes": "36, 46" }
  ]
}
```

---

#### POST /odontograma
Crea un nuevo odontograma para un paciente. Inicializa automáticamente los 32 dientes (PERMANENTE) o 20 dientes (TEMPORAL).

**Body (JSON):**
```json
{
  "paciente_id": 1,
  "empresa_id": 1,
  "tipo": "PERMANENTE",
  "observaciones": "Evaluación inicial",
  "creado_por": 2
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "odontograma_id": 4,
  "mensaje": "Odontograma creado con ID: 4"
}
```

**Tipos válidos:** PERMANENTE (32 dientes), TEMPORAL (20 dientes niños)

---

#### PUT /odontograma/:id/diente
Actualiza el estado de un diente específico.

**Parámetros Path:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | NUMBER | ID del odontograma |

**Body (JSON):**
```json
{
  "numero_fdi": 16,
  "estado": "CARIES",
  "observaciones": "Caries en cara oclusal",
  "modificado_por": 2
}
```

**Estados válidos:** SANO, CARIES, OBTURADO, AUSENTE, CORONA, ENDODONCIA, IMPLANTE, PROTESIS, FRACTURADO, EXTRACCION_INDICADA

**Respuesta (200):**
```json
{
  "success": true,
  "mensaje": "Diente 16 actualizado a CARIES"
}
```

---

#### PUT /odontograma/:id/dientes
Actualiza múltiples dientes a la vez (operación bulk).

**Body (JSON):**
```json
{
  "dientes": [
    { "numero_fdi": 16, "estado": "CARIES", "observaciones": "Caries profunda" },
    { "numero_fdi": 26, "estado": "OBTURADO", "observaciones": "Amalgama" },
    { "numero_fdi": 36, "estado": "CORONA", "observaciones": "Corona porcelana" }
  ],
  "modificado_por": 2
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "mensaje": "3 dientes actualizados exitosamente"
}
```

---

#### POST /odontograma/hallazgo
Registra un hallazgo clínico en un diente específico.

**Body (JSON):**
```json
{
  "diente_id": 5,
  "cita_id": 10,
  "tipo_hallazgo": "CARIES",
  "superficies_afectadas": "O,M",
  "severidad": "MODERADA",
  "descripcion": "Caries ocluso-mesial",
  "requiere_tratamiento": "S",
  "doctor_id": 2
}
```

**Tipos de hallazgo:** CARIES, FRACTURA, DESGASTE, MOVILIDAD, GINGIVITIS, PERIODONTITIS, etc.

**Superficies:** O (Oclusal), M (Mesial), D (Distal), V (Vestibular), P/L (Palatino/Lingual)

**Respuesta (201):**
```json
{
  "success": true,
  "hallazgo_id": 1,
  "mensaje": "Hallazgo registrado con ID: 1"
}
```

---

#### GET /odontograma/diente/:id/hallazgos
Obtiene todos los hallazgos registrados para un diente.

**Respuesta:**
```json
{
  "success": true,
  "items": [
    {
      "hallazgo_id": 1,
      "tipo_hallazgo": "CARIES",
      "superficies_afectadas": "O,M",
      "severidad": "MODERADA",
      "descripcion": "Caries ocluso-mesial",
      "requiere_tratamiento": "S",
      "doctor_nombre": "Dr. García",
      "fecha_deteccion": "2026-01-27 10:30:00"
    }
  ]
}
```

---

## Paginación

Todos los endpoints de colección soportan paginación automática de ORDS:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| limit | NUMBER | Registros por página (default: 25) |
| offset | NUMBER | Registros a saltar |

**Ejemplo:**
```bash
curl "https://...ords/admin/api/v1/pacientes?limit=10&offset=20"
```

---

## Códigos de Respuesta

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Error en los datos enviados |
| 401 | Unauthorized - Credenciales inválidas |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error |

---

## CORS

Para habilitar CORS en el frontend, agregar en Oracle Cloud Console:
1. Database Actions → RESTful Services
2. Módulo "odontologia" → Settings
3. Configurar "Origins Allowed"

---

## Autenticación

Actualmente los endpoints están abiertos (AUTO_REST_AUTH: DISABLED).

Para producción, se recomienda:
1. Habilitar OAuth2 en ORDS
2. O usar API Gateway de Oracle Cloud
3. O implementar autenticación en el frontend con tokens

---

## Ejemplos con JavaScript (Fetch)

```javascript
// Obtener pacientes
const response = await fetch(
  'https://...ords/admin/api/v1/pacientes?activo=S'
);
const data = await response.json();
console.log(data.items);

// Buscar paciente
const search = await fetch(
  'https://...ords/admin/api/v1/pacientes/search?q=juan'
);
const results = await search.json();

// Obtener agenda del doctor
const agenda = await fetch(
  'https://...ords/admin/api/v1/citas/agenda/2?fecha=2026-01-26'
);
const citas = await agenda.json();
```

---

## Resumen de Endpoints

### Lectura (GET) - 16 endpoints
| Endpoint | Descripción |
|----------|-------------|
| GET /pacientes | Lista pacientes |
| GET /pacientes/:id | Detalle de paciente |
| GET /pacientes/search | Buscar pacientes |
| GET /citas | Lista citas |
| GET /citas/:id | Detalle de cita |
| GET /citas/agenda/:doctor_id | Agenda del doctor |
| GET /doctores | Lista doctores |
| GET /tratamientos/catalogo | Catálogo de tratamientos |
| GET /tratamientos/paciente/:id | Tratamientos de paciente |
| GET /historias/:id | Detalle de historia |
| GET /historias/paciente/:id | Historias de paciente |
| GET /odontograma/paciente/:id | Odontograma actual del paciente |
| GET /odontograma/:id | Detalle de odontograma |
| GET /odontograma/historial/:paciente_id | Historial de odontogramas |
| GET /odontograma/:id/resumen | Resumen por estados |
| GET /odontograma/diente/:id/hallazgos | Hallazgos de un diente |

### Escritura (POST/PUT/DELETE) - 19 endpoints
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| /pacientes | POST | Crear paciente |
| /pacientes/:id | PUT | Actualizar paciente |
| /pacientes/:id | DELETE | Eliminar paciente |
| /citas | POST | Crear cita |
| /citas/:id | PUT | Actualizar cita |
| /citas/:id/estado | PUT | Cambiar estado |
| /citas/:id | DELETE | Cancelar cita |
| /tratamientos/asignar | POST | Asignar tratamiento |
| /tratamientos/paciente/:id/update | PUT | Actualizar tratamiento |
| /tratamientos/paciente/:id/estado | PUT | Cambiar estado |
| /tratamientos/paciente/:id/sesion | POST | Registrar sesión |
| /historias | POST | Crear historia |
| /historias/:id | PUT | Actualizar historia |
| /historias/:id/prescripcion | POST | Agregar prescripción |
| /auth/login | POST | Login |
| /odontograma | POST | Crear odontograma |
| /odontograma/:id/diente | PUT | Actualizar un diente |
| /odontograma/:id/dientes | PUT | Actualizar múltiples dientes |
| /odontograma/hallazgo | POST | Registrar hallazgo dental |

---

## Próximos Pasos

- [x] ~~Agregar endpoints POST para crear registros~~
- [x] ~~Agregar endpoints PUT para actualizar~~
- [x] ~~Agregar endpoints DELETE~~
- [x] ~~Agregar endpoints para odontograma~~
- [ ] Configurar autenticación OAuth2
- [ ] Agregar endpoints para facturación
