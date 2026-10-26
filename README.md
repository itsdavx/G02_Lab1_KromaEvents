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
