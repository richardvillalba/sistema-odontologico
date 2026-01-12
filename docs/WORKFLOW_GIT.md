# Workflow de Git para Múltiples IAs

## Organización del Trabajo

### División de Responsabilidades

**IA Backend (Claude):**
- Carpeta: `/database`
- Responsable de:
  - Packages PL/SQL
  - Procedures y Functions
  - Triggers
  - Views
  - Scripts SQL
  - Configuración ORDS
  - Optimización de queries
  - Migraciones de BD

**IA Frontend (Otra IA):**
- Carpeta: `/frontend`
- Responsable de:
  - Aplicación React
  - Componentes UI
  - Estilos
  - Routing
  - State management
  - Integración con APIs
  - Testing frontend

**Áreas Compartidas:**
- `/docs` - Documentación (coordinar actualizaciones)
- `ESTADO.md` - Estado del proyecto (actualizar al terminar sesión)
- `README.md` - Readme principal (actualizar según avances)

---

## Estrategia de Branches

### Branch Principal
- `main` - Branch principal, siempre estable

### Branches de Trabajo

**Para Backend:**
- `feature/backend-[nombre]` - Nuevas features de backend
- `fix/backend-[nombre]` - Correcciones de backend

**Para Frontend:**
- `feature/frontend-[nombre]` - Nuevas features de frontend
- `fix/frontend-[nombre]` - Correcciones de frontend

**Ejemplos:**
```bash
# Backend
git checkout -b feature/backend-pkg-pacientes
git checkout -b fix/backend-query-citas

# Frontend
git checkout -b feature/frontend-login
git checkout -b fix/frontend-datepicker
```

---

## Workflow Completo

### 1. Antes de Empezar a Trabajar

```bash
# Actualizar tu repositorio local
git checkout main
git pull origin main

# Crear branch para tu trabajo
git checkout -b feature/backend-pkg-pacientes

# Verificar ESTADO.md
cat ESTADO.md
```

**Verificar:**
- ✅ Que nadie más esté trabajando en lo mismo
- ✅ Leer "Notas para el Próximo Agente"
- ✅ Revisar "Tareas en Progreso"

### 2. Durante el Trabajo

```bash
# Hacer commits frecuentes
git add database/packages/PKG_PACIENTES.sql
git commit -m "feat: add PKG_PACIENTES with CRUD operations

- get_paciente procedure
- insert_paciente procedure
- update_paciente procedure
- delete_paciente (logical delete)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Actualizar ESTADO.md
# - Marcar tarea como "in_progress"
# - Documentar avances
```

**Convenciones de Commits:**
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `refactor:` - Refactorización de código
- `test:` - Añadir o modificar tests
- `chore:` - Tareas de mantenimiento

### 3. Al Terminar tu Sesión

```bash
# Actualizar ESTADO.md
# - Marcar tareas completadas
# - Añadir notas para el próximo agente
# - Actualizar fecha

git add ESTADO.md
git commit -m "docs: update ESTADO.md - completed PKG_PACIENTES"

# Push de tu branch
git push origin feature/backend-pkg-pacientes
```

### 4. Crear Pull Request

En GitHub:
1. Ir a la página del repositorio
2. Click en "Pull Requests" → "New Pull Request"
3. Seleccionar tu branch
4. Título: `[Backend] PKG_PACIENTES - CRUD operations`
5. Descripción detallada:
   ```
   ## Cambios
   - Implementado PKG_PACIENTES con operaciones CRUD
   - Procedures: get, insert, update, delete
   - Delete lógico implementado

   ## Testing
   - Probado manualmente con test_connection.py
   - Todos los procedures funcionan correctamente

   ## Notas
   - Listo para integrar con ORDS
   - Frontend puede consumir estos endpoints
   ```
6. Asignar reviewers (opcional)
7. Click "Create Pull Request"

### 5. Merge (Usuario Decide)

El usuario humano revisa y hace merge:
```bash
# Usuario hace:
git checkout main
git merge feature/backend-pkg-pacientes
git push origin main
```

---

## Prevención de Conflictos

### Regla de Oro
**Cada IA trabaja en su carpeta asignada:**
- Backend → `/database`
- Frontend → `/frontend`

### Archivos Compartidos

**ESTADO.md:**
- Actualizar AL FINAL de tu sesión
- Hacer pull antes de modificar
- Solo tocar tu sección

**README.md:**
- Coordinar cambios grandes
- Commits pequeños y frecuentes

**docs/:**
- Frontend documenta componentes en `docs/FRONTEND.md`
- Backend documenta packages en `docs/BACKEND.md`
- Documentación general en archivos separados

### Si Hay Conflictos

```bash
# Si al hacer pull hay conflictos
git pull origin main

# Git te mostrará los archivos en conflicto
# Resolver manualmente:
# 1. Abrir archivo
# 2. Buscar marcadores: <<<<<<, ======, >>>>>>
# 3. Elegir o combinar cambios
# 4. Remover marcadores

# Después de resolver:
git add archivo-resuelto.md
git commit -m "fix: resolve merge conflict in ESTADO.md"
git push
```

---

## Comandos Útiles

### Ver Estado
```bash
git status                    # Ver cambios
git log --oneline -10         # Ver últimos 10 commits
git diff                      # Ver cambios sin commitear
git diff main                 # Ver diferencias con main
```

### Branches
```bash
git branch                    # Ver branches locales
git branch -a                 # Ver todos los branches
git checkout main             # Cambiar a main
git branch -d feature/nombre  # Borrar branch local
```

### Sincronización
```bash
git pull origin main          # Actualizar desde remoto
git push origin branch-name   # Subir branch
git fetch origin              # Descargar info sin merge
```

### Deshacer Cambios
```bash
git restore archivo.sql       # Deshacer cambios locales
git reset HEAD~1              # Deshacer último commit (mantiene cambios)
git reset --hard HEAD~1       # Deshacer último commit (borra cambios)
```

---

## Ejemplo de Sesión Completa

### Backend (Claude)

```bash
# 1. Iniciar
cd /root/proyectos/sistema-odontologia
git checkout main
git pull origin main

# 2. Crear branch
git checkout -b feature/backend-pkg-citas

# 3. Trabajar
# ... crear database/packages/PKG_CITAS.sql

# 4. Commits
git add database/packages/PKG_CITAS.sql
git commit -m "feat: add PKG_CITAS package

- get_citas_by_paciente
- get_citas_by_doctor
- insert_cita
- update_cita
- cancel_cita

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 5. Actualizar estado
# ... editar ESTADO.md
git add ESTADO.md
git commit -m "docs: update ESTADO.md - PKG_CITAS completed"

# 6. Push
git push origin feature/backend-pkg-citas

# 7. Crear PR en GitHub
```

### Frontend (Otra IA)

```bash
# 1. Iniciar
git checkout main
git pull origin main

# 2. Crear branch
git checkout -b feature/frontend-pacientes-list

# 3. Trabajar
# ... crear frontend/src/components/PacientesList.jsx

# 4. Commits
git add frontend/src/components/PacientesList.jsx
git commit -m "feat: add PacientesList component

- Display patients in table
- Search and filter functionality
- Pagination support
- Connected to ORDS API"

# 5. Push y PR
git push origin feature/frontend-pacientes-list
```

---

## Checklist de Seguridad

Antes de hacer commit, verificar:

- [ ] NO hay credenciales en el código
- [ ] NO hay archivos del wallet
- [ ] NO hay passwords o tokens
- [ ] NO hay IPs de producción hardcodeadas
- [ ] Archivos sensibles están en .gitignore
- [ ] Solo código y documentación

**Archivos NUNCA commitear:**
- ❌ `config/oracle/credentials.json`
- ❌ `config/Wallet_escanor/*`
- ❌ `.env` con datos reales
- ❌ Cualquier archivo con passwords

---

## Contacto y Coordinación

### Cuando Necesites Coordinar

**Dejar nota en ESTADO.md:**
```markdown
## Notas para el Otro Agente

**[Backend → Frontend]:**
He terminado PKG_PACIENTES. Ya puedes consumir estos endpoints:
- GET /api/pacientes
- POST /api/pacientes
Ver docs/API_ENDPOINTS.md para detalles.

**[Frontend → Backend]:**
Necesito un endpoint para buscar pacientes por documento.
¿Puedes agregar search_by_documento en PKG_PACIENTES?
```

### Archivos de Coordinación

Crear si es necesario:
- `docs/API_ENDPOINTS.md` - Documentar APIs disponibles
- `docs/PENDIENTES.md` - Tareas que requieren coordinación
- `docs/DECISIONES.md` - Decisiones de diseño tomadas

---

## Resumen Rápido

**Antes de trabajar:**
```bash
git checkout main && git pull && git checkout -b feature/[area]-[nombre]
```

**Durante trabajo:**
```bash
git add . && git commit -m "tipo: descripción"
```

**Al terminar:**
```bash
git push origin nombre-branch
# Crear PR en GitHub
# Actualizar ESTADO.md
```

**Regla de Oro:**
- Backend → `/database`
- Frontend → `/frontend`
- Commits frecuentes
- Actualizar ESTADO.md
- Sin credenciales
