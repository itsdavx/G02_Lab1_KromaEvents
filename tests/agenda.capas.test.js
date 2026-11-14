// Pruebas unitarias de las CAPAS (hito 3): ruta → controlador → servicio → modelo y errorHandler
// Cada capa se prueba sola, reemplazando la de abajo con un mock (sin base de datos)
const { test, describe, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Agenda = require("../src/models/agenda");
const agendaService = require("../src/services/agenda.service");
const agendaController = require("../src/controllers/agenda.controller");
const errorHandler = require("../src/middlewares/errorHandler");

// res falso de Express que guarda el código y el JSON
const fakeRes = () => {
  const res = { statusCode: 200, body: undefined };
  res.status = (code) => ((res.statusCode = code), res);
  res.json = (body) => ((res.body = body), res);
  return res;
};

afterEach(() => mock.restoreAll());

describe("Servicio agenda.service", () => {
  test("create usa el modelo: Agenda.create(data)", async () => {
    const creado = { _id: "abc" };
    const spy = mock.method(Agenda, "create", async () => creado);
    const data = { titulo: "Programa" };
    assert.equal(await agendaService.create(data), creado);
    assert.equal(spy.mock.callCount(), 1);
    assert.equal(spy.mock.calls[0].arguments[0], data);
  });

  test("create deja pasar el ValidationError del modelo", async () => {
    mock.method(Agenda, "create", async () => {
      throw new mongoose.Error.ValidationError();
    });
    await assert.rejects(agendaService.create({}), { name: "ValidationError" });
  });
});

describe("Controlador agenda.controller", () => {
  test("create responde 201 con lo que devuelve el servicio", async () => {
    const doc = { _id: "abc", horario: "19:00 - 21:30" };
    const spy = mock.method(agendaService, "create", async () => doc);
    const res = fakeRes();
    await agendaController.create({ body: { titulo: "x" } }, res, () => assert.fail("no debe llamar a next"));
    assert.equal(res.statusCode, 201);
    assert.equal(res.body, doc);
    assert.deepEqual(spy.mock.calls[0].arguments[0], { titulo: "x" });
  });

  test("create sin body envía {} al servicio", async () => {
    const spy = mock.method(agendaService, "create", async () => ({}));
    await agendaController.create({}, fakeRes(), () => {});
    assert.deepEqual(spy.mock.calls[0].arguments[0], {});
  });

  test("create pasa los errores a next(err) y no responde", async () => {
    const error = new Error("falló");
    mock.method(agendaService, "create", async () => {
      throw error;
    });
    const res = fakeRes();
    let recibido;
    await agendaController.create({ body: {} }, res, (err) => (recibido = err));
    assert.equal(recibido, error);
    assert.equal(res.body, undefined);
  });
});

describe("Middleware de Express errorHandler", () => {
  test("ValidationError de Mongoose → 400 con un mensaje por campo", async () => {
    let err;
    try {
      await new Agenda({ tipo: "fiesta", actividades: [{ hora: "25:00", titulo: "Bienvenida" }] }).validate();
    } catch (e) {
      err = e;
    }
    const res = fakeRes();
    errorHandler(err, {}, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, "Datos inválidos");
    assert.ok(Array.isArray(res.body.errors));
    const campos = res.body.errors.map((e) => e.campo);
    assert.ok(campos.includes("tipo"));
    assert.ok(campos.includes("actividades.0.hora"));
    for (const e of res.body.errors) assert.equal(typeof e.mensaje, "string");
  });

  test("CastError de Mongoose → 400", () => {
    const res = fakeRes();
    errorHandler(new mongoose.Error.CastError("ObjectId", "xyz", "_id"), {}, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, "_id tiene un tipo inválido");
  });

  test("los errores de la Unidad 1 siguen igual (HttpError y JSON mal formado)", () => {
    const HttpError = require("../src/utils/httpError");
    const res1 = fakeRes();
    errorHandler(new HttpError(404, "Evento no encontrado"), {}, res1, () => {});
    assert.deepEqual([res1.statusCode, res1.body], [404, { error: "Evento no encontrado" }]);

    const res2 = fakeRes();
    errorHandler(Object.assign(new SyntaxError("x"), { type: "entity.parse.failed", status: 400 }), {}, res2, () => {});
    assert.equal(res2.statusCode, 400);
  });
});

describe("Rutas", () => {
  test("agenda.routes declara POST / hacia el controlador", () => {
    const router = require("../src/routes/agenda.routes");
    const capa = router.stack.find((l) => l.route?.path === "/");
    assert.ok(capa.route.methods.post);
    assert.equal(capa.route.stack.at(-1).handle, agendaController.create);
  });

  test("routes/index.js monta el recurso en /agendas", () => {
    const index = require("../src/routes");
    const montada = index.stack.some((l) => l.handle === require("../src/routes/agenda.routes"));
    assert.ok(montada);
  });
});

describe("Conexión src/db/mongo.js", () => {
  test("connectMongo usa process.env.MONGODB_URI", async () => {
    const spy = mock.method(mongoose, "connect", async () => mongoose);
    const anterior = process.env.MONGODB_URI;
    process.env.MONGODB_URI = "mongodb://usuario:clave@localhost:27017/prueba?authSource=admin";
    try {
      await require("../src/db/mongo").connectMongo();
      assert.equal(spy.mock.calls[0].arguments[0], process.env.MONGODB_URI);
      assert.equal(spy.mock.calls[0].arguments.length, 1, "Mongoose 9: sin callback ni opciones antiguas");
    } finally {
      process.env.MONGODB_URI = anterior;
    }
  });

  test("connectMongo falla si falta MONGODB_URI", async () => {
    const anterior = process.env.MONGODB_URI;
    delete process.env.MONGODB_URI;
    try {
      await assert.rejects(require("../src/db/mongo").connectMongo(), /Falta la variable MONGODB_URI/);
    } finally {
      if (anterior !== undefined) process.env.MONGODB_URI = anterior;
    }
  });
});
