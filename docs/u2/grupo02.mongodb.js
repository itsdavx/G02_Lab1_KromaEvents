// Hito 2 · Playground del grupo 02 · KromaEvents (MongoDB for VS Code o mongosh)
use("kromaevents_lab");

// Se puede ejecutar varias veces: empieza desde cero
db.agendas.drop();
db.ponentes.drop();

// 1. createCollection con $jsonSchema: 1 enum, 1 rango (minimum/maximum) y 1 arreglo
db.createCollection("agendas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["eventoId", "titulo", "tipo", "actividades"],
      additionalProperties: false,
      properties: {
        _id: { bsonType: "objectId" },
        eventoId: { bsonType: "number", minimum: 1, description: "id del evento en PostgreSQL" },
        titulo: { bsonType: "string", minLength: 5, maxLength: 120 },
        tipo: { enum: ["concierto", "taller", "feria", "conferencia"], description: "enum" },
        edadMinima: { bsonType: "number", minimum: 0, maximum: 21, description: "rango de 0 a 21" },
        actividades: {
          bsonType: "array",
          minItems: 1,
          description: "arreglo con al menos una actividad",
          items: {
            bsonType: "object",
            required: ["hora", "titulo"],
            properties: {
              hora: { bsonType: "string", pattern: "^([01][0-9]|2[0-3]):[0-5][0-9]$" },
              titulo: { bsonType: "string" },
              ponenteId: { bsonType: "objectId" },
            },
          },
        },
        etiquetas: { bsonType: "array", items: { bsonType: "string" } },
      },
    },
  },
});

// Colección referenciada: un ponente participa en varios eventos
const ponentes = db.ponentes.insertMany([
  { nombre: "Cuarteto Kroma", especialidad: "Jazz contemporáneo", redes: ["@cuartetokroma"] },
  { nombre: "Andrea Salazar", especialidad: "Fotografía urbana", redes: ["@andreasalazar.foto"] },
]);
const [cuartetoId, andreaId] = Object.values(ponentes.insertedIds);

// 2. Dos inserts válidos
db.agendas.insertOne({
  eventoId: 4,
  titulo: "Programa Noche de Jazz",
  tipo: "concierto",
  edadMinima: 18,
  actividades: [
    { hora: "19:00", titulo: "Apertura de puertas" },
    { hora: "20:00", titulo: "Concierto principal", ponenteId: cuartetoId },
  ],
  etiquetas: ["jazz", "música en vivo"],
});
db.agendas.insertOne({
  eventoId: 3,
  titulo: "Programa Taller de Fotografía Urbana",
  tipo: "taller",
  edadMinima: 15,
  actividades: [
    { hora: "09:00", titulo: "Composición y luz", ponenteId: andreaId },
    { hora: "11:00", titulo: "Salida fotográfica por el centro", ponenteId: andreaId },
  ],
  etiquetas: ["fotografía", "taller"],
});
print("Agendas válidas guardadas:", db.agendas.countDocuments());

// 3. Dos inserts rechazados: envueltos en try/catch, se imprime qué campo falló
const campoQueFallo = (e) =>
  JSON.stringify(e.errInfo?.details?.schemaRulesNotSatisfied ?? e.message, null, 1);

try {
  db.agendas.insertOne({ eventoId: 1, titulo: "Fiesta de fin de año", tipo: "fiesta", actividades: [{ hora: "22:00", titulo: "DJ" }] });
} catch (e) {
  print("Rechazado 1 → campo 'tipo' (enum: fiesta no está permitido):", campoQueFallo(e));
}

try {
  db.agendas.insertOne({ eventoId: 2, titulo: "Programa Feria Gastronómica", tipo: "feria", edadMinima: 30, actividades: [] });
} catch (e) {
  print("Rechazado 2 → campos 'edadMinima' (rango 0–21) y 'actividades' (minItems 1):", campoQueFallo(e));
}

// 4. $lookup entre dos colecciones (+ $unwind para tener una fila por actividad con su ponente)
printjson(db.agendas.aggregate([
  { $unwind: "$actividades" },
  { $match: { "actividades.ponenteId": { $exists: true } } },
  { $lookup: { from: "ponentes", localField: "actividades.ponenteId", foreignField: "_id", as: "ponente" } },
  { $unwind: "$ponente" },
  { $project: { _id: 0, eventoId: 1, agenda: "$titulo", hora: "$actividades.hora", actividad: "$actividades.titulo", ponente: "$ponente.nombre" } },
  { $sort: { eventoId: 1, hora: 1 } },
]).toArray());
