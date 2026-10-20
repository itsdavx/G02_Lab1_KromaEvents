# Laboratorio 1 · Mini-API MVC con CRUD

**Desarrollo Web Avanzado (A0R04) · ESPE · Unidad 1: Persistencia de datos y ORM**

| Dato | Valor |
|---|---|
| Grupo | G03 |
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

Importa en Postman `postman/GXX_Lab1.postman_collection.json` y ejecuta **Run collection**.

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
| GET | /api/... | Listar | 200 | — |
| GET | /api/.../:id | Ver uno | 200 | 400, 404 |
| POST | /api/... | Crear | 201 | 400 |
| PUT | /api/.../:id | Actualizar | 200 | 400, 404 |
| DELETE | /api/.../:id | Eliminar | 204 | 404 |

## Validaciones del servicio

1.
2.

## Aporte de cada integrante

| Integrante | Qué hizo (archivos / pasos) |
|---|---|
| Bonilla Caiza David Alejandro | **Paso 1 · Proyecto, propuesta y modelo.** Completó los datos del grupo en la cabecera de `src/app.js` y en `README.md`. Redactó `PROPUESTA.md` (nombre, problema, usuarios, 3 funciones, 3 entidades Evento–Cliente–Reserva y 3 endpoints) y elaboró el mapa frontend–backend (`mapa.png`). Eligió la entidad principal **Evento** y renombró `product` → `evento` en modelo, servicio, controlador, rutas, el prefijo `/api/eventos` de `routes/index.js`, `data/eventos.json` (3 registros de ejemplo) y `.env.example`. Definió `FIELDS` (nombre, fecha, lugar, capacidad, precio) en `src/models/evento.model.js` y programó `validate()` en `src/services/evento.service.js` con 5 validaciones. |
| Villa Andrango José Daniel | |
| Quiroz Herrera María Laura | |
| Sánchez Verduga Julio Esteban | |

## Declaración de uso de IA

- Herramienta(s) usada(s): ___ (o «No se usó IA»)
- Para qué la usamos (consultar, depurar, explicar un error…):
- Qué verificamos o corregimos nosotros:
