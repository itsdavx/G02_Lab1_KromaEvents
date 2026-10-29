# Laboratorio 1 · Mini-API MVC con CRUD

**Desarrollo Web Avanzado (A0R04) · ESPE · Unidad 1: Persistencia de datos y ORM**

| Dato | Valor |
|---|---|
| Grupo | G02 |
| Emprendimiento | KromaEvents |
| Integrantes | 1. Bonilla Caiza David Alejandro <br> 2. Villa Andrango José Daniel <br> 3. Quiroz Herrera María Laura <br> 4. Sánchez Verduga Julio Esteban |
| NRC | 36878 |
| Fecha | 19/10/2026 |
| Repositorio | https://github.com/itsdavx/G02_Lab1_KromaEvents.git |

## Cómo ejecutar

```bash
npm install
cp .env.example .env      # en Windows: copy .env.example .env
npm run dev               # http://localhost:3000
```

Importa en Postman `postman/G02_Lab1.postman_collection.json` y ejecuta **Run collection** (8 peticiones, 13 pruebas, incluidas las de 400 y 404). Evidencias en `evidencias`.

## Estructura MVC en capas

```
src/
├─ app.js            ← arma la app: express.json, middlewares y prefijo /api
├─ server.js         ← solo levanta el servidor (lee .env)
├─ routes/
│  ├─ index.js       ← archivo principal: monta cada recurso (/api/<entidad>)
│  └─ <entidad>.routes.js  ← verbo + URL → acción del controlador
├─ controllers/      ← lee req, llama al servicio, decide código + JSON
├─ services/         ← reglas de negocio, validaciones y acceso a datos
├─ models/           ← campos de la entidad y archivo JSON (Lab 2: schema.prisma)
├─ middlewares/      ← logger, notFound, errorHandler
└─ utils/httpError.js
data/                ← archivo JSON con los registros
```

Flujo de una petición: **ruta → controlador → servicio → modelo** y de vuelta. El proyecto usa CommonJS (`require` / `module.exports`).

## Endpoints de la entidad

| Verbo | Ruta | Acción | Éxito | Errores |
|---|---|---|---|---|
| GET | /api/eventos | Listar | 200 | — |
| GET | /api/eventos/:id | Ver uno | 200 | 400, 404 |
| POST | /api/eventos | Crear | 201 | 400 |
| PUT | /api/eventos/:id | Actualizar | 200 | 400, 404 |
| DELETE | /api/eventos/:id | Eliminar | 204 | 404 |

## Validaciones del servicio

Se aplican en `POST` (todos los campos son obligatorios) y en `PUT` (solo los campos enviados). Si una falla, la API responde **400** con `{ "error": "<mensaje>" }`.

| # | Campo | Regla | Mensaje (400) |
|---|---|---|---|
| 1 | nombre | Texto de al menos 3 caracteres | nombre es obligatorio y debe tener al menos 3 caracteres |
| 2 | fecha | Fecha válida con formato AAAA-MM-DD | fecha es obligatoria y debe tener el formato AAAA-MM-DD |
| 3 | lugar | Texto no vacío | lugar es obligatorio |
| 4 | capacidad | Número entero mayor o igual a 1 | capacidad debe ser un número entero mayor o igual a 1 |
| 5 | precio | Número mayor o igual a 0 | precio debe ser un número mayor o igual a 0 |

Además, un `id` no numérico responde 400 y un cuerpo con JSON mal formado responde 400.

## Aporte de cada integrante

| Integrante | Qué hizo (archivos / pasos) |
|---|---|
| Bonilla Caiza David Alejandro | **Paso 1 · Proyecto, propuesta y modelo.** Completó los datos del grupo en la cabecera de `src/app.js` y en `README.md`. Redactó `PROPUESTA.md` (nombre, problema, usuarios, 3 funciones, 3 entidades Evento–Cliente–Reserva y 3 endpoints) y elaboró el mapa frontend–backend (`mapa.png`). Eligió la entidad principal **Evento** y renombró `product` → `evento` en modelo, servicio, controlador, rutas, el prefijo `/api/eventos` de `routes/index.js`, `data/eventos.json` (3 registros de ejemplo) y `.env.example`. Definió `FIELDS` (nombre, fecha, lugar, capacidad, precio) en `src/models/evento.model.js` y programó `validate()` en `src/services/evento.service.js` con 5 validaciones. |
| Villa Andrango José Daniel | **Paso 3 · Middlewares y códigos HTTP.** Programó `src/middlewares/logger.js`, que registra hora, verbo, ruta, código de estado y duración de cada petición, y lo ubicó antes de `express.json()` en `src/app.js` para registrar también las peticiones con JSON mal formado. Completó `src/middlewares/errorHandler.js`: JSON mal formado responde 400 y un error 500 responde «Error interno del servidor», con `err.stack` solo fuera de producción. Verificó que una ruta inexistente responde 404 en JSON y que ningún error responde 200. Tomó la captura `evidencias/logger.png`. |
| Quiroz Herrera María Laura | **Paso 4 · Colección Postman, README y entrega.** Adaptó la colección a `postman/G02_Lab1.postman_collection.json` (v2.1): número de grupo, ruta `/api/eventos` y campos del evento en los cuerpos JSON, manteniendo las pruebas 400 y 404. Ejecutó las 13 pruebas aprobadas y tomó la capturas. Completó en este README las instrucciones de ejecución y la sección de validaciones. |
| Sánchez Verduga Julio Esteban | **Paso 2 · Servicio, controlador y rutas CRUD.** Completó `create`, `update` y `remove` en `src/services/evento.service.js` (validación con 400, 404 si el id no existe, lectura y escritura del JSON mediante el modelo). Completó `create` (201), `update` (200) y `remove` (204) en `src/controllers/evento.controller.js`, delegando en el servicio y pasando los errores a `next(err)`. Conectó `router.post`, `router.put` y `router.delete` en `src/routes/evento.routes.js`, llenó la tabla «Endpoints» de este README y probó cada endpoint con sus códigos 200, 201, 204, 400 y 404. |

## Declaración de uso de IA

- Herramienta(s) usada(s): Canva IA, Claude (Anthropic) y Gemini (Google).
- Para qué la usamos (consultar, depurar, explicar un error…):
  - Paso 1 (Bonilla Caiza David Alejandro): Use Canva IA para realizar el mapa presentado en PROPUESTA.md, en principio me dio la base estrucutral y yo lo mejore agregando el resto de conceptos teoricos para esta propuesta.
  - Paso 2 (Sánchez Verduga Julio Esteban): Claude, para corregir algunos errores en los endpoints.
  - Paso 3 (Villa Andrango José Daniel): Claude, para corregir algunos errores de código y sintaxis en los middlewares que no lograba ver a simple vista; y Gemini, para mejorar la redacción de su aporte en este README.
  - Paso 4 (Quiroz Herrera María Laura): Use Claude para saber como modificar las colecciones de postman ya que no comprendia muy bien y la ia me ayudo a entenderlo.
- Qué verificamos o corregimos nosotros: revisamos cada corrección sugerida antes de aplicarla y probamos los endpoints para confirmar que respondieran con los códigos esperados (200, 201, 204, 400 y 404), pero en su mayoria se uso ia para entender el fundamente teorico y realizar la practica manualmente.

---

# Lab 2 · Persistencia con Prisma y PostgreSQL

| Dato | Valor |
|---|---|
| Herramientas | Node.js 20.19 o superior · Prisma 7.10.1 con `@prisma/adapter-pg` · PostgreSQL 17 (Docker) · Postman |
| Fecha | 26/10/2026 |

En el Lab 1 los eventos se guardaban en un archivo JSON. Ahora se guardan en una base de datos PostgreSQL y se manejan con Prisma. Solo cambió la capa de datos: el controlador y las rutas del Lab 1 siguen iguales, con una sola ruta nueva (`/lote`).

## Cómo crear la base

```bash
npm install
cp .env.example .env      # en Windows: copy .env.example .env  (completa DATABASE_URL con los datos de docker-compose.yml)
docker compose up -d      # levanta PostgreSQL 17
npx prisma migrate dev    # crea las tablas eventos y clientes
npx prisma generate       # genera el cliente de Prisma
npx prisma db seed        # carga 3 eventos y 2 clientes de prueba
npm run dev               # http://localhost:3000
```

Al arrancar, el servidor muestra `PostgreSQL conectado`. Si la base no responde, muestra el error y se detiene.

## Comandos de Prisma

| Script | Comando | Para qué sirve |
|---|---|---|
| `npm run db:migrate` | `prisma migrate dev` | Crea o actualiza las tablas según `schema.prisma` y guarda el cambio en `prisma/migrations/` |
| `npm run db:generate` | `prisma generate` | Genera el cliente de Prisma (en Prisma 7 se ejecuta después de cada migración) |
| `npm run db:seed` | `prisma db seed` | Borra los datos y carga los de prueba; se puede ejecutar varias veces |
| `npm run db:studio` | `prisma studio` | Abre en el navegador una vista de las tablas y sus datos |

## Modelo de datos

- `MODELO_ER.md`: diagrama con las 3 entidades del emprendimiento (Evento, Cliente y Reserva) y cómo se relacionan.
- `prisma/schema.prisma`: las tablas `eventos` y `clientes`. Reserva y las relaciones se programan en el Lab 3.
- No se pueden repetir el `nombre` de un evento ni el `correo` de un cliente.

## Endpoints

| Verbo | Ruta | Acción | Éxito | Errores |
|---|---|---|---|---|
| GET | /api/eventos | Listar | 200 | — |
| GET | /api/eventos/:id | Ver uno | 200 | 400, 404 |
| POST | /api/eventos | Crear | 201 | 400, 409 |
| PUT | /api/eventos/:id | Actualizar | 200 | 400, 404, 409 |
| DELETE | /api/eventos/:id | Eliminar | 204 | 404 |
| POST | /api/eventos/lote | Crear varios a la vez | 201 | 400, 409 |

El error **409** aparece cuando se intenta guardar un evento con un nombre que ya existe.

## Endpoint /lote (transacción: todo o nada)

`POST /api/eventos/lote` recibe un arreglo de eventos y los guarda juntos:

- Si todos están bien, se guardan todos y responde **201** con la lista creada (COMMIT).
- Si uno tiene datos inválidos, no se guarda ninguno y responde **400** indicando qué ítem falló, por ejemplo `Ítem 2: precio debe ser un número mayor o igual a 0` (ROLLBACK).
- Si uno tiene un nombre que ya existe, no se guarda ninguno y responde **409** (ROLLBACK).
- Si el cuerpo no es un arreglo o está vacío, responde **400**.

Ejemplo de cuerpo:

```json
[
  { "nombre": "Noche de Jazz", "fecha": "2026-12-12", "lugar": "Teatro Sucre, Quito", "capacidad": 80, "precio": 12 },
  { "nombre": "Feria del Libro", "fecha": "2026-12-19", "lugar": "Casa de la Cultura, Quito", "capacidad": 200, "precio": 0 }
]
```

## Pruebas en Postman

Importa `postman/G02_Lab2.postman_collection.json` y ejecuta **Run collection** después de `npx prisma db seed` (13 peticiones, 18 pruebas). La carpeta «CRUD con Prisma» prueba los 5 endpoints con los códigos 200, 201, 204, 400, 404 y 409, y la carpeta «Transacción (todo o nada)» comprueba el COMMIT y que los lotes fallidos no dejen nada guardado. Evidencias en `evidencias/prisma-studio.png` y `evidencias/postman-run.png`.

## Aporte de cada integrante (Lab 2)

| Integrante | Qué hizo |
|---|---|
| Bonilla Caiza David Alejandro | **Paso 1 · Modelo ER y conexión con la base.** Dibujó en `MODELO_ER.md` el modelo de datos del emprendimiento: eventos, clientes y reservas, y cómo se relacionan entre sí. Instaló Prisma en la versión del curso, levantó PostgreSQL con Docker y puso la dirección de la base en el archivo `.env`. También hizo que el servidor revise la conexión con la base antes de arrancar. |
| Villa Andrango José Daniel | **Paso 2 · Tablas, migración y datos de prueba.** Escribió en `schema.prisma` cómo son las tablas de eventos y clientes: qué datos guarda cada una, cuáles no se pueden repetir y cuál es opcional. Creó la primera migración, que construye esas tablas en la base, y el seed, que carga 3 eventos y 2 clientes de prueba sin duplicarlos aunque se ejecute varias veces. Agregó los comandos `db:migrate`, `db:generate`, `db:seed` y `db:studio`. |
| Quiroz Herrera María Laura | **Paso 3 · El CRUD ahora usa la base de datos.** Cambió el servicio de eventos para que guarde, lea, actualice y borre en PostgreSQL en lugar del archivo JSON, sin tocar el controlador ni las rutas. Cambió el manejador de errores para que avise con un 409 cuando se repite el nombre de un evento. Borró las carpetas `data/` y `src/models/`, que ya no se usan, y revisó los datos en Prisma Studio. |
| Sánchez Verduga Julio Esteban | **Paso 4 · Guardar varios eventos a la vez, Postman y README.** Creó la ruta `/api/eventos/lote`, que guarda varios eventos juntos: si uno falla, no se guarda ninguno. Adaptó la colección de Postman a KromaEvents, la ejecutó completa comprobando que los lotes fallidos no dejen nada guardado y escribió esta sección del README. |

## Declaración de uso de IA (Lab 2)

- Herramienta(s) usada(s): ChatGpt
- Para qué la usamos:
  - Paso 4 (Sánchez Verduga Julio Esteban): Se uso unicamente para redactar las instrucciones en el README.md.
- Qué verificamos o corregimos nosotros: Se escribio de forma "bulgar" o "simple" el README.md, y chat gpt se encargo de mejorar el orden y la redaccion.

---

# Lab 3 · Relaciones, autenticación y despliegue

| Dato | Valor |
|---|---|
| URL pública (API) | https://kromaevents-api.onrender.com |
| Base de datos | PostgreSQL 17 en Neon (AWS US East 1, N. Virginia) |
| Herramientas | Node.js 20.19 o superior · Express · Prisma 7.10.1 con `@prisma/adapter-pg` · jsonwebtoken · bcryptjs · Postman · Render · Neon |
| Fecha | 27/10/2026 |

La API de KromaEvents ahora tiene usuarios con roles, eventos relacionados con sus reservas, una reserva que consume cupos dentro de una transacción, un módulo de administración con consultas avanzadas y está publicada en internet.

> **Despliegue en Render + Neon:** Railway tenía desactivado el registro de cuentas nuevas. Según la sección 3 del enunciado, se usa Render (API) + Neon (PostgreSQL) con la misma colección. La guía paso a paso está en `RENDER.md`. El plan gratuito de Render suspende el servicio tras unos minutos sin uso: la **primera petición puede tardar hasta un minuto** mientras despierta; las siguientes responden normal.

## Cómo ejecutar en local

```bash
npm install                 # también ejecuta prisma generate (postinstall)
cp .env.example .env        # en Windows: copy .env.example .env  (completa DATABASE_URL y JWT_SECRET)
docker compose up -d        # PostgreSQL 17
npx prisma migrate deploy   # aplica las migraciones init, auth y relaciones
npx prisma db seed          # 3 eventos, 1 admin, 2 clientes y 3 reservas
npm run dev                 # http://localhost:3000
```

`npm start` ejecuta `prisma migrate deploy` antes de levantar la API: así la base de Render/Neon siempre queda al día.

## Usuarios de prueba (seed)

| Correo | Contraseña | Rol | Perfil de cliente |
|---|---|---|---|
| admin@kromaevents.com | Admin123* | ADMIN | No |
| ana.torres@correo.com | Ana12345* | USER | Sí (1 reserva confirmada) |
| carlos.mena@correo.com | Carlos123* | USER | Sí (1 reserva pendiente y 1 cancelada) |

Cualquier persona puede crear su propio usuario con `POST /api/auth/register`; se crea con rol `USER` y con su perfil de cliente.

## Organización en capas

```
src/
├─ routes/        ← auth, eventos, reservas, admin (verbo + URL + middlewares de auth)
├─ controllers/   ← leen req, llaman al servicio y responden código + JSON
├─ services/      ← reglas, validaciones, bcrypt, JWT y todas las consultas de Prisma
├─ middlewares/   ← authenticateToken, requireRole, logger, notFound, errorHandler
├─ db/prisma.js · utils/httpError.js
prisma/           ← schema.prisma, migrations/ (init, auth, relaciones) y seed.js
```

Ninguna ruta ni controlador consulta la base: todo el acceso con Prisma está en `services/`.

## Endpoints

| Verbo | Ruta | Rol | Acción | Éxito | Errores |
|---|---|---|---|---|---|
| GET | / | Público | Estado de la API | 200 | — |
| POST | /api/auth/register | Público | Registrar usuario con su perfil de cliente (1:1) | 201 | 400, 409 |
| POST | /api/auth/login | Público | Iniciar sesión y recibir el JWT | 200 | 400, 401 |
| GET | /api/auth/me | Token | Ver el perfil propio | 200 | 401, 403, 404 |
| GET | /api/eventos | Público | Listar eventos | 200 | — |
| GET | /api/eventos/:id | Público | Ver un evento | 200 | 400, 404 |
| POST | /api/eventos | ADMIN | Crear evento | 201 | 400, 401, 403, 409 |
| POST | /api/eventos/lote | ADMIN | Crear varios eventos (todo o nada) | 201 | 400, 401, 403, 409 |
| PUT | /api/eventos/:id | ADMIN | Actualizar evento | 200 | 400, 401, 403, 404, 409 |
| DELETE | /api/eventos/:id | ADMIN | Eliminar evento | 204 | 400, 401, 403, 404, 409 |
| POST | /api/reservas | USER (con perfil de cliente) | Reservar cupos en uno o varios eventos (transacción) | 201 | 400, 401, 403, 404, 409 |
| GET | /api/reservas | USER (con perfil de cliente) | Mis reservas con su evento | 200 | 401, 403 |
| PATCH | /api/reservas/:id/cancelar | USER (dueño de la reserva) | Cancelar y devolver los cupos | 200 | 400, 401, 403, 404, 409 |
| GET | /api/admin/reservas | ADMIN | Listado con filtros y paginación | 200 | 400, 401, 403 |
| PATCH | /api/admin/reservas/:id/estado | ADMIN | Cambiar el estado de una reserva | 200 | 400, 401, 403, 404, 409 |
| GET | /api/admin/reportes/top-eventos | ADMIN | Eventos con más cupos vendidos (groupBy) | 200 | 401, 403 |

**Códigos de autenticación:** sin token → **401**; token inválido o expirado → **403**; rol insuficiente → **403**; correo o contraseña incorrectos → **401** con el mismo mensaje genérico («Correo o contraseña inválidos»). Las contraseñas se guardan con `bcrypt` y ninguna respuesta las devuelve.

**Otros 409:** correo o nombre de evento repetido; reserva sin cupos suficientes; cancelar una reserva que ya no está pendiente; bajar la capacidad de un evento por debajo de lo reservado; borrar un evento que tiene reservas (FK con `Restrict`).

### Ejemplos de cuerpos

```json
POST /api/auth/register
{ "email": "nuevo@correo.com", "password": "Clave123*", "name": "Cliente Nuevo", "phone": "0990000000" }

POST /api/auth/login
{ "email": "ana.torres@correo.com", "password": "Ana12345*" }

POST /api/reservas            (Authorization: Bearer <token>)
{ "items": [ { "eventoId": 1, "cantidad": 2 }, { "eventoId": 3, "cantidad": 1 } ] }

PATCH /api/admin/reservas/5/estado   (token de ADMIN)
{ "estado": "CONFIRMADA" }
```

`GET /api/admin/reservas` acepta `estado` (`PENDIENTE`, `CONFIRMADA`, `CANCELADA`), `eventoId`, `from` y `to` (AAAA-MM-DD), `page` y `limit` (máximo 50), y responde `{ page, limit, total, pages, data }`.

## Reserva con transacción (recurso limitado: cupos)

`POST /api/reservas` corre dentro de `prisma.$transaction`. Por cada evento descuenta los cupos con una actualización condicional (`updateMany` con `cuposDisponibles >= cantidad`); si un evento no existe responde **404** y si no alcanzan los cupos responde **409**. En ambos casos se hace **ROLLBACK** y no se guarda ninguna reserva ni se descuenta ningún cupo (lo comprueban las peticiones 12 y 13 de la colección). Como la condición se evalúa en la propia actualización, dos reservas simultáneas no pueden ocupar el mismo cupo.

Cancelar (`PATCH /api/reservas/:id/cancelar`) responde 404 si la reserva no existe, 403 si es de otro usuario y 409 si ya no está pendiente; si procede, cambia el estado a `CANCELADA` y devuelve los cupos al evento en la misma transacción.

## Relaciones y decisiones de onDelete

El detalle completo (diagrama, entidades y mapeo) está en `MODELO_ER.md`.

| Relación | Cardinalidad | onDelete | Por qué |
|---|---|---|---|
| User → Cliente | 1:1 | Cascade | El cliente es el perfil del usuario y no tiene sentido sin él. |
| Cliente → Reserva | 1:N | Restrict | Las reservas son el historial de ventas: no se borra un cliente con reservas. |
| Evento → Reserva | 1:N | Restrict | Un evento con reservas tiene asistentes y pagos: no se puede borrar (409). |
| Cliente ↔ Evento | N:M (tabla intermedia explícita `reservas`) | Restrict | Reserva guarda datos propios: cantidad, precio unitario, total y estado. |

Mapeo: enums `Role` y `EstadoReserva`, `Decimal(10,2)` para precio y total, `DateTime` para fechas, índices compuestos `[eventoId, estado]` y `[estado, fechaReserva]`, y `@map`/`@@map` en snake_case.

Evidencias: `evidencias/prisma-studio.png` (tablas y claves foráneas en el Visualizer de Prisma Studio) y `evidencias/prisma-studio-usuarios.png` (usuarios del seed, con la contraseña guardada como hash de bcrypt).

## Pruebas en Postman

Importa `postman/G02_Lab3.postman_collection.json` (25 peticiones, 42 pruebas) y los entornos `postman/G02_Lab3_Local.postman_environment.json` y `postman/G02_Lab3_Render.postman_environment.json`. Ejecuta primero `npx prisma db seed` (una sola vez; la colección se puede repetir).

| Carpeta | Qué prueba |
|---|---|
| Auth | Registro con perfil 1:1, correo repetido (409), login incorrecto (401), login correcto (JWT), perfil sin token (401), con token inválido (403) y con token (200) |
| Eventos (rol ADMIN) | Crear como USER (403) y como ADMIN (201, precio Decimal y cupos iniciales) |
| Reservas (transacción) | Reserva (201), sin cupos con ROLLBACK (409), evento inexistente (404), datos inválidos (400), mis reservas con include, cancelación y devolución de cupos, cancelar otra vez (409) |
| Admin y consultas avanzadas | Filtros y paginación, estado inválido (400), rol USER (403), reporte con groupBy, cambio de estado y borrado bloqueado por Restrict (409) |

Evidencias: `evidencias/postman-local.png` (colección en local) y `evidencias/render-run.png` (colección contra la URL pública de Render).

## Aporte de cada integrante (Lab 3)

| Integrante | Qué hizo |
|---|---|
| Bonilla Caiza David Alejandro | **Paso 1 · Registro, inicio de sesión y permisos.** Hizo que las personas puedan crear su cuenta e iniciar sesión, y que al registrarse se cree también su ficha de cliente. Las contraseñas se guardan protegidas y nunca se muestran. Además, dejó que cualquiera pueda ver los eventos, pero solo el administrador pueda crearlos, editarlos o borrarlos. |
| Quiroz Herrera María Laura | **Paso 2 · Relaciones entre los datos.** Conectó a los usuarios con sus clientes, y a los clientes y eventos con sus reservas. Decidió qué pasa al borrar cada cosa: por ejemplo, no se puede borrar un evento que ya tiene reservas. Actualizó el diagrama en `MODELO_ER.md`, preparó los datos de prueba (administrador, clientes, eventos y reservas) y tomó las capturas en Prisma Studio. |
| Villa Andrango José Daniel | **Paso 3 · Reservas y administración.** Hizo que reservar descuente los cupos del evento y que, si no alcanzan, no se guarde nada. Agregó la opción de cancelar una reserva y devolver sus cupos, y la lista de reservas de cada cliente. Para el administrador, creó la lista de todas las reservas con filtros y páginas, el cambio de estado y el reporte de los eventos con más cupos vendidos. |
| Sánchez Verduga Julio Esteban | **Paso 4 · Publicación en internet** Como Railway no permitía crear cuentas, publicó la API en Render con la base de datos en Neon. Preparó el proyecto para que la base se actualice sola al arrancar y escribió la guía `RENDER.md`. Ejecutó la colección de Postman en local y contra la URL pública, tomó las capturas y completó esta sección del README. |

## Declaración de uso de IA (Lab 3)

- Herramienta(s) usada(s): Claude (Anthropic)
- Para qué la usamos: Como ayuda y apoyo para el paso 4, debido a que Railway no funciona al dia de la practica, Se opto por la opcion que solicita el docente (Neon+Render), pero debido a que no sabemos nada sobre esas herramientas, se uso claude para que guie paso a paso en el proceso, nos ayudo como "tutorial" para realizar el despliegue, ademas, se le solicito un "RENDER.md", para complementar el tutorial.
- Qué verificamos o corregimos nosotros: Se fue implementando paso a paso lo que indico claude para poder levantar el servicio en Render y Neon con exito.

---

# Taller · Nuevas funcionalidades para KromaEvents

| Dato | Valor |
|---|---|
| Punto de partida | API del Lab 3 (auth, eventos, reservas con transacción y módulo de administración) |
| Despliegue | Render + Neon, igual que en el Lab 3 (el docente indicó ignorar la cláusula de Railway) |
| Migración del taller | Una sola: `prisma/migrations/20261029094906_taller` con los modelos de las 4 tarjetas |

Nombres del enunciado adaptados a KromaEvents: *Product* → **Evento**, *Order* → **Reserva**, *OrderStatus* → **EstadoReserva**, *Customer* → **Cliente**.

| Tarjeta | Funcionalidad | Integrante |
|---|---|---|
| A | Reseñas de eventos | Bonilla Caiza David Alejandro |
| B | Categorías y búsqueda avanzada | Quiroz Herrera María Laura |
| C | Flujo de estados con historial | Villa Andrango José Daniel |
| D | Mi cuenta y panel de indicadores | Sánchez Verduga Julio Esteban |

## Taller · Tarjeta A · Reseñas · Bonilla Caiza David Alejandro

| Método | Ruta | Rol | Body | Respuestas |
|---|---|---|---|---|
| POST | /api/eventos/:id/resenas | Autenticado que asistió al evento (reserva `ASISTIDA`) | `{ calificacion: 1-5, comentario? }` | 201 reseña · 400 calificación fuera de 1–5, comentario > 300 o id no numérico · 401 sin token · 403 token inválido o no asistió al evento · 404 evento · 409 ya reseñó ese evento |
| GET | /api/eventos/:id/resenas | Público | — (query: `page`, `limit`) | 200 `{ eventoId, promedio, total, page, limit, pages, data }` · 400 id no numérico · 404 evento |
| DELETE | /api/resenas/:id | Autor o ADMIN | — | 204 · 400 id no numérico · 401 sin token · 403 no es el autor ni ADMIN · 404 reseña |

Modelo: `Resena` (tabla `resenas`) con relación 1:N hacia `User` y 1:N hacia `Evento`. `calificacion` es `SmallInt` (se valida de 1 a 5 en el servicio) y `comentario` es opcional de hasta 300 caracteres. `@@unique([userId, eventoId])` garantiza una sola reseña por usuario y evento, incluso con dos peticiones simultáneas (P2002 → 409). `onDelete: Cascade` en ambos lados porque una reseña no tiene sentido sin su autor ni sin su evento. El promedio se calcula con `aggregate` (`_avg`) y la lista se pagina con `skip`/`take`. Reto opcional: solo reseña quien tiene una reserva `ASISTIDA` en ese evento (filtro `some`), si no → 403.

## Taller · Tarjeta B · Categorías y búsqueda · Quiroz Herrera María Laura

| Método | Ruta | Rol | Body | Respuestas |
|---|---|---|---|---|
| POST | /api/categorias | ADMIN | `{ nombre }` | 201 categoría · 400 nombre vacío o > 50 · 401 · 403 · 409 duplicada |
| GET | /api/categorias | Público | — | 200 `[ { id, nombre, _count: { eventos } } ]` |
| PUT | /api/eventos/:id/categorias | ADMIN | `{ categoriaIds: [1, 2] }` | 200 evento con sus categorías · 400 no es arreglo de enteros o id no numérico · 401 · 403 · 404 evento o categoría inexistente |
| GET | /api/eventos/buscar | Público | — (query: `q`, `categoria`, `min`, `max`, `sort` = `precio_asc`, `precio_desc` o `nombre`, `page`, `limit`) | 200 `{ page, limit, total, pages, data }` · 400 sort o rango de precio inválido |
| GET | /api/categorias/:id/eventos | Público | — (query: `page`, `limit`) | 200 `{ categoriaId, nombre, page, limit, total, pages, data }` · 400 id no numérico · 404 categoría |

Modelo: `Categoria` (tabla `categorias`) con relación N:M implícita con `Evento`; Prisma crea la tabla intermedia `_CategoriaToEvento`. `nombre` es único. Las categorías de un evento se reemplazan con `set`. La búsqueda combina `contains` sin distinguir mayúsculas, la relación con `some`, rango de precio, orden dinámico y paginación. `/buscar` se declara antes de `/:id`. El nombre de la categoría tampoco distingue mayúsculas (`Música` y `música` se consideran duplicadas). Reto opcional: `GET /api/categorias/:id/eventos` con paginación.

## Taller · Tarjeta C · Flujo de estados con historial · Villa Andrango José Daniel

| Método | Ruta | Rol | Body | Respuestas |
|---|---|---|---|---|
| PATCH | /api/admin/reservas/:id/estado | ADMIN | `{ estado, nota? }` | 200 reserva con el estado nuevo · 400 estado inválido o nota > 200 · 401 · 403 · 404 · 409 transición no permitida o la reserva cambió mientras tanto |
| GET | /api/reservas/:id/historial | Dueño o ADMIN | — | 200 `{ reservaId, estado, historial }` · 400 id no numérico · 401 · 403 no es el dueño · 404 |

Transiciones válidas: `PENDIENTE → CONFIRMADA → ASISTIDA` y `PENDIENTE` o `CONFIRMADA → CANCELADA` (al cancelar se devuelven los cupos). Modelo: `ReservaHistorial` (tabla `reserva_historial`) con dos relaciones 1:N: hacia `Reserva` (`onDelete: Cascade`, el historial pertenece a la reserva) y hacia `User` como quien hizo el cambio (`onDelete: Restrict`, no se borra un usuario que dejó registros en el historial). Se agrega `ASISTIDA` al enum `EstadoReserva` y un `@@index([reservaId])`. El cambio de estado y su registro se guardan en la misma `$transaction` con un `updateMany` condicionado al estado actual. Desde `ASISTIDA` o `CANCELADA` no se puede salir (409); este cambio de estado reemplaza al del Lab 3, que permitía reactivar una reserva cancelada. El historial se devuelve en orden cronológico con el nombre de quien hizo cada cambio. Reto opcional: la cancelación que hace el propio cliente (`PATCH /api/reservas/:id/cancelar`) también queda registrada en el historial.

## Taller · Tarjeta D · Mi cuenta e indicadores · Sánchez Verduga Julio Esteban

| Método | Ruta | Rol | Body | Respuestas |
|---|---|---|---|---|
| GET | /api/me | Autenticado | — | 200 usuario con su cliente y el número de reservas (`_count`), sin contraseña · 401 · 403 · 404 usuario ya no existe |
| PATCH | /api/me | Autenticado | `{ name?, phone? }` | 200 usuario actualizado · 400 name < 3, phone no numérico de 7–15 dígitos, body vacío o phone en un usuario sin perfil de cliente · 401 · 403 |
| PATCH | /api/me/password | Autenticado | `{ currentPassword, newPassword }` | 204 · 400 nueva < 8 o igual a la actual · 401 contraseña actual incorrecta o sin token · 403 |
| GET | /api/admin/estadisticas | ADMIN | — (query: `from`, `to`) | 200 `{ periodo, reservasPorEstado, ingresos, topClientes }` · 400 fecha inválida o from > to · 401 · 403 |

Modelo: se agrega `lastLoginAt` (`last_login_at`) a `User`, que el login actualiza. `PATCH /api/me` actualiza `User` y su perfil `Cliente` con una escritura anidada (1:1). Las estadísticas se calculan en una `$transaction` de lecturas: reservas por estado (`groupBy`), ingresos total y promedio de las reservas `ASISTIDA` (`aggregate`) y los 3 clientes que más gastaron. Solo cuentan como ingreso las reservas `ASISTIDA` (el evento ya se realizó). `reservasPorEstado` siempre trae los 4 estados, con 0 si no hay reservas en el periodo. La contraseña nueva se guarda con `bcrypt.hash` después de comprobar la actual con `bcrypt.compare`; ninguna respuesta devuelve la contraseña.

## Taller · Pruebas en Postman

Importa `postman/G02_Taller.postman_collection.json` (101 peticiones, 208 pruebas) con el entorno `G02_Lab3 · Local` o `G02_Lab3 · Render`. Ejecuta primero `npx prisma db seed` y luego **Run collection** completa: las carpetas del taller usan el usuario que registra la carpeta «Auth» del Lab 3. La colección se puede repetir sin volver a cargar el seed.

| Carpeta | Peticiones | Qué prueba |
|---|---|---|
| Carpetas del Lab 3 | 25 | Auth, roles, reserva con transacción, cancelación y admin (la 24 ahora comprueba que una reserva cancelada no se reactiva: 409) |
| Taller · A · David Bonilla | 17 | Reseña creada (201), duplicada (409), calificación y comentario inválidos (400), sin token (401), sin haber asistido (403), evento inexistente (404), lista con promedio, borrado por autor y por ADMIN (204), ajena (403) |
| Taller · B · Laura Quiroz | 18 | Categoría creada (201), duplicada sin importar mayúsculas (409), nombre vacío (400), 401/403, lista con `_count`, `set` de categorías, búsqueda combinada, orden por precio, sort y rango inválidos (400), reto por categoría |
| Taller · C · José Villa | 22 | Flujo PENDIENTE → CONFIRMADA → ASISTIDA, transición no permitida (409), estado y nota inválidos (400), 401/403/404, historial cronológico del dueño y del ADMIN, reserva ajena (403), devolución de cupos al cancelar, reto de cancelación del cliente |
| Taller · D · Julio Sánchez | 19 | Mi cuenta con `_count` y `lastLoginAt`, escritura anidada de nombre y teléfono, validaciones (400), cambio de contraseña (204) con actual incorrecta (401) y nueva inválida (400), login con la clave vieja y la nueva, estadísticas con `groupBy`/`aggregate`, periodo vacío, fecha inválida, 401/403 |

## Declaración de uso de IA (Taller)

- Herramienta(s) usada(s): Claude
- Para qué la usamos: Redaccion del README.md
- Qué verificamos o corregimos nosotros: Nos aseguramos que tenga exactamente lo que hicimos y no se invente cosas.
