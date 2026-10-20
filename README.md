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
