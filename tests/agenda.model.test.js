// Pruebas unitarias del MODELO (hito 3): validan el esquema sin conectarse a MongoDB
// Ejecutar: npm test
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const Agenda = require("../src/models/agenda");

const valida = () => ({
  eventoId: 4,
  titulo: "Programa Noche de Jazz",
  tipo: "concierto",
  edadMinima: 18,
  contacto: "Jazz@KromaEvents.com",
  actividades: [
    { hora: "21:30", titulo: "Cierre con jam session" },
    { hora: "19:00", titulo: "Apertura de puertas" },
    { hora: "20:00", titulo: "Cuarteto Kroma" },
  ],
  etiquetas: ["Jazz", " jazz ", "Música en vivo"],
});

// Devuelve { campo: mensaje } de un ValidationError (o {} si el documento es válido)
const errores = async (data) => {
  try {
    await new Agenda(data).validate();
    return {};
  } catch (err) {
    assert.equal(err.name, "ValidationError");
    return Object.fromEntries(Object.entries(err.errors).map(([campo, e]) => [campo, e.message]));
  }
};

describe("Modelo Agenda · documento válido", () => {
  test("un documento correcto pasa la validación", async () => {
    assert.deepEqual(await errores(valida()), {});
  });

  test("edadMinima tiene valor por defecto 0", () => {
    const { edadMinima, ...sinEdad } = valida();
    assert.equal(new Agenda(sinEdad).edadMinima, 0);
  });

  test("contacto se guarda sin espacios y en minúsculas", () => {
    assert.equal(new Agenda({ ...valida(), contacto: "  Jazz@KromaEvents.COM " }).contacto, "jazz@kromaevents.com");
  });
});

describe("Modelo Agenda · required con mensaje", () => {
  test("documento vacío: un mensaje por cada campo obligatorio", async () => {
    const e = await errores({});
    assert.equal(e.eventoId, "El evento es obligatorio");
    assert.equal(e.titulo, "El título de la agenda es obligatorio");
    assert.equal(e.tipo, "El tipo de evento es obligatorio");
    assert.equal(e.contacto, "El correo de contacto es obligatorio");
  });

  test("actividad sin hora ni título", async () => {
    const e = await errores({ ...valida(), actividades: [{}] });
    assert.equal(e["actividades.0.hora"], "La hora de la actividad es obligatoria");
    assert.equal(e["actividades.0.titulo"], "El título de la actividad es obligatorio");
  });
});

describe("Modelo Agenda · enum, min/max, minlength/maxlength y match", () => {
  test("enum: tipo no permitido", async () => {
    const e = await errores({ ...valida(), tipo: "fiesta" });
    assert.equal(e.tipo, "fiesta no es un tipo válido (concierto, taller, feria o conferencia)");
  });

  test("enum: acepta los 4 tipos", async () => {
    for (const tipo of ["concierto", "taller", "feria", "conferencia"]) {
      assert.deepEqual(await errores({ ...valida(), tipo }), {}, tipo);
    }
  });

  test("min: eventoId debe ser al menos 1", async () => {
    assert.equal((await errores({ ...valida(), eventoId: 0 })).eventoId, "El eventoId debe ser mayor o igual a 1");
  });

  test("min/max: edadMinima entre 0 y 21 (límites incluidos)", async () => {
    assert.equal((await errores({ ...valida(), edadMinima: -1 })).edadMinima, "La edad mínima no puede ser negativa");
    assert.equal((await errores({ ...valida(), edadMinima: 22 })).edadMinima, "La edad mínima no puede ser mayor a 21");
    assert.deepEqual(await errores({ ...valida(), edadMinima: 0 }), {});
    assert.deepEqual(await errores({ ...valida(), edadMinima: 21 }), {});
  });

  test("minlength/maxlength: título de 5 a 120 caracteres", async () => {
    assert.equal((await errores({ ...valida(), titulo: "Prog" })).titulo, "El título debe tener al menos 5 caracteres");
    assert.equal((await errores({ ...valida(), titulo: "x".repeat(121) })).titulo, "El título no puede superar los 120 caracteres");
  });

  test("minlength: título de la actividad de al menos 3 caracteres", async () => {
    const e = await errores({ ...valida(), actividades: [{ hora: "10:00", titulo: "DJ" }] });
    assert.equal(e["actividades.0.titulo"], "El título de la actividad debe tener al menos 3 caracteres");
  });

  test("match: hora en formato HH:MM de 24 horas", async () => {
    for (const hora of ["25:00", "9:00", "12:60", "doce"]) {
      const e = await errores({ ...valida(), actividades: [{ hora, titulo: "Bienvenida" }] });
      assert.equal(e["actividades.0.hora"], "La hora debe tener el formato HH:MM (24 horas)", hora);
    }
    assert.deepEqual(await errores({ ...valida(), actividades: [{ hora: "00:00", titulo: "Bienvenida" }] }), {});
    assert.deepEqual(await errores({ ...valida(), actividades: [{ hora: "23:59", titulo: "Bienvenida" }] }), {});
  });

  test("tipo de dato inválido: eventoId no numérico", async () => {
    assert.match((await errores({ ...valida(), eventoId: "abc" })).eventoId, /Cast to Number failed/);
  });
});

describe("Modelo Agenda · validaciones propias", () => {
  test("contacto debe ser un correo válido (validator.isEmail)", async () => {
    assert.equal((await errores({ ...valida(), contacto: "no-es-correo" })).contacto, "no-es-correo no es un correo válido");
  });

  test("la agenda debe tener al menos una actividad", async () => {
    assert.equal((await errores({ ...valida(), actividades: [] })).actividades, "La agenda debe tener al menos una actividad");
  });
});

describe("Modelo Agenda · virtual y pre('validate')", () => {
  test("pre('validate') ordena las actividades por hora", async () => {
    const doc = new Agenda(valida());
    await doc.validate();
    assert.deepEqual(doc.actividades.map((a) => a.hora), ["19:00", "20:00", "21:30"]);
  });

  test("pre('validate') deja las etiquetas en minúsculas, sin espacios ni repetidas", async () => {
    const doc = new Agenda({ ...valida(), etiquetas: ["Jazz", " jazz ", "Música en vivo", "  ", null] });
    await doc.validate();
    assert.deepEqual([...doc.etiquetas], ["jazz", "música en vivo"]);
  });

  test("virtual horario: primera y última actividad (después de ordenar)", async () => {
    const doc = new Agenda(valida());
    await doc.validate();
    assert.equal(doc.horario, "19:00 - 21:30");
  });

  test("virtual horario es null sin actividades", () => {
    assert.equal(new Agenda({}).horario, null);
  });

  test("el virtual aparece en el JSON y no se guarda en la base", () => {
    const doc = new Agenda(valida());
    assert.ok("horario" in doc.toJSON());
    assert.ok(!("horario" in doc.toObject({ virtuals: false })));
  });

  test("pre('validate') no usa next (Mongoose 9)", () => {
    const fuente = require("node:fs").readFileSync(require.resolve("../src/models/agenda"), "utf8");
    assert.match(fuente, /pre\("validate", function \(\) \{/);
  });
});
