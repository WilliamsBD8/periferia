# Periferia IT - Gestor de Tareas

Aplicacion fullstack para gestion de tareas, construida con:

- `Frontend`: Angular
- `Backend`: Node.js + Express + Prisma
- `Base de datos`: PostgreSQL

Este proyecto esta documentado con enfoque **docker-first**.

## Arquitectura general

- `frontend/`: cliente Angular.
- `backend/`: API REST y logica de negocio.
- `docker-compose.yml`: orquestacion de servicios.

## Prerrequisitos

- Docker
- Docker Compose

## Variables de entorno

Crear un archivo `.env` en la raiz del proyecto.

Plantilla sugerida:

```env
# Database
DB_HOST=db
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=periferia
DB_PORT=5432
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# Ports
ADMINER_PORT=8081
BACKEND_PORT=3000
FRONTEND_PORT=4200

# JWT
JWT_SECRET=tu_jwt_secreto
JWT_EXPIRES_IN=3600

# Frontend
FRONTEND_URL=http://localhost:${FRONTEND_PORT}

# Notifications
API_RESEND_KEY=re_4q9zLZdo_8Dp5DNKTggP71rwVZNAFUYKE
```

## Instalacion y ejecucion con Docker

### 1) Construir e iniciar servicios

Desde la raiz del proyecto:

```bash
docker compose up --build -d
```

Esto levanta automaticamente:

- `db` (PostgreSQL)
- `backend` (Express + Prisma)
- `frontend` (Angular)
- `adminer`

### 2) Accesos

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- API base: `http://localhost:3000/api/v1`
- Adminer: `http://localhost:8081`

### 3) Detener servicios

```bash
docker compose down
```

Para eliminar volumenes (reset DB):

```bash
docker compose down -v
```

## Datos de prueba (seed)

Al iniciar en Docker, el backend ejecuta migraciones y seed.

Usuarios de prueba (password: `123456`):

- `admin@email.com`
- `administrator@email.com`
- `wsbonilladiaz@gmail.com`

## Verificacion rapida

1. Abrir `http://localhost:4200`.
2. Iniciar sesion con un usuario de prueba.
3. Validar CRUD de tareas:
   - Crear
   - Editar
   - Cambiar estado
   - Eliminar

## Comandos utiles (Docker)

Levantar en segundo plano:

```bash
docker compose up -d --build
```

Ver logs:

```bash
docker compose logs -f
```

Reiniciar backend:

```bash
docker compose restart backend
```

## Uso del sistema:
- Ir a la pagina de login:
  - `http://localhost:4200/login`
- Iniciar sesion con un usuario de prueba (password: `123456`):
  - `admin@email.com`
  - `administrator@email.com`
  - `wsbonilladiaz@gmail.com`
- Crear una tarea:
   - Titulo
   - Descripcion
   - Fecha de expiracion
   - Asignar a
   - Estado
- Dar clic en la tarea para ver los detalles:
   - Informacion de la tarea
   - Boton de editar
   - Boton de eliminar
- Editar una tarea:
   - Titulo
   - Descripcion
   - Fecha de expiracion
   - Asignar a
   - Estado
- Arrastrar y soltar una tarea para cambiar su estado:
   - Pendiente
   - En progreso
   - Completado
   - Cancelado
- Eliminar una tarea:
   - Dar clic en el boton de eliminar
   - Confirmar la eliminacion
- Ver notificaciones:
   - Dar clic en el boton de notificaciones
   - Ver las notificaciones
- Ver dashboard:
   - Dar clic en el boton de dashboard
   - Ver el dashboard
## Ejecucion local (opcional)

Si necesitas ejecutar sin Docker, usa PostgreSQL local y corre backend/frontend en dos terminales.

### 1) Configurar variables para local

Asegura en tu `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=periferia
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
BACKEND_PORT=3000
FRONTEND_PORT=4200
JWT_SECRET=tu_jwt_secreto
API_RESEND_KEY=tu_api_resend_key
```

### 2) Backend (terminal 1)

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm start
```

### 3) Frontend (terminal 2)

```bash
cd frontend
npm install
npm start
```

### 4) Accesos en local

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- API base: `http://localhost:3000/api/v1`



## Solucion de problemas comunes

- Si backend no conecta a DB, revisar `DATABASE_URL` y `DB_*`.
- Si algun contenedor falla, revisar logs con `docker compose logs -f`.
- Si necesitas limpiar todo, usar `docker compose down -v`.
