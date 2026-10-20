const { readFile, writeFile } = require("node:fs/promises");

// Modelo Evento: campos permitidos y persistencia en archivo JSON
const FILE = process.env.DATA_FILE || "data/eventos.json";

// El id lo asigna el servicio
const FIELDS = ["nombre", "fecha", "lugar", "capacidad", "precio"];

const readAll = async () => JSON.parse(await readFile(FILE, "utf8"));
const writeAll = (items) => writeFile(FILE, JSON.stringify(items, null, 2));

// Conserva solo los campos definidos en FIELDS
const pick = (data) =>
  Object.fromEntries(FIELDS.filter((k) => data[k] !== undefined).map((k) => [k, data[k]]));

module.exports = { FIELDS, readAll, writeAll, pick };
