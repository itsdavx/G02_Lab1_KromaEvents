// Prueba de integración (hito 3): POST /api/agendas contra MongoDB real (docker compose up -d mongo)
// Usa una base aparte (kromaevents_test) que se borra al terminar. Si Mongo no responde, se omite.
require("dotenv").config();
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const app = require("../src/app");

let server;
let baseUrl;
let sinMongo = false;

const post = async (body) => {
  const res = await fetch(`${baseUrl}/api/agendas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

before(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "kromaevents_test", serverSelectionTimeoutMS: 3000 });
  } catch {
    sinMongo = true;
    return;
  }
  server = app.listen(0);
  baseUrl = `http://localhost:${server.address().port}`;
});

after(async () => {
  if (server) server.close();
  if (!sinMongo) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

describe("POST /api/agendas (MongoDB real)", () => {
  test("201: guarda el documento y devuelve _id, virtual y cambios del pre('validate')", async (t) => {
    if (sinMongo) return t.skip("MongoDB no está disponible");
    const { status, body } = await post({
      eventoId: 4,
      titulo: "Programa Noche de Jazz",
      tipo: "concierto",
      edadMinima: 18,
      contacto: "Jazz@KromaEvents.com",
      actividades: [
        { hora: "21:30", titulo: "Cierre con jam session" },
        { hora: "19:00", titulo: "Apertura de puertas" },
      ],
      etiquetas: ["Jazz", " jazz "],
    });
    assert.equal(status, 201);
    assert.match(body._id, /^[a-f0-9]{24}$/);
    assert.equal(body.horario, "19:00 - 21:30");
    assert.deepEqual(body.etiquetas, ["jazz"]);

    // Quedó guardado en la colección agendas, sin el virtual
    const guardado = await mongoose.connection.collection("agendas").findOne({ _id: new mongoose.Types.ObjectId(body._id) });
    assert.equal(guardado.titulo, "Programa Noche de Jazz");
    assert.equal(guardado.contacto, "jazz@kromaevents.com");
    assert.equal(guardado.horario, undefined);
  });

  test("400: body vacío con un mensaje por campo y no guarda nada", async (t) => {
    if (sinMongo) return t.skip("MongoDB no está disponible");
    const antes = await mongoose.connection.collection("agendas").countDocuments();
    const { status, body } = await post({});
    assert.equal(status, 400);
    assert.ok(body.errors.length >= 5);
    assert.equal(await mongoose.connection.collection("agendas").countDocuments(), antes);
  });

  test("400: enum, rango, match y validación propia", async (t) => {
    if (sinMongo) return t.skip("MongoDB no está disponible");
    const { status, body } = await post({
      eventoId: 1,
      titulo: "Prog",
      tipo: "fiesta",
      edadMinima: 30,
      contacto: "no-es-correo",
      actividades: [{ hora: "25:00", titulo: "Bienvenida" }],
    });
    assert.equal(status, 400);
    const campos = body.errors.map((e) => e.campo).sort();
    assert.deepEqual(campos, ["actividades.0.hora", "contacto", "edadMinima", "tipo", "titulo"]);
  });

  test("400: JSON mal formado (errorHandler de la Unidad 1)", async (t) => {
    if (sinMongo) return t.skip("MongoDB no está disponible");
    const { status } = await post("{ esto no es json");
    assert.equal(status, 400);
  });
});
