const Evento = require("../models/evento.model");
const HttpError = require("../utils/httpError");

// SERVICIO: reglas de negocio y acceso a datos a través del modelo.
// Lanza HttpError (400, 404) cuando una regla no se cumple. En el Lab 2 este archivo
// usará Prisma; el controlador y las rutas no cambian.

// Devuelve un mensaje de error o null si los datos son válidos.
// partial = true en PUT: valida solo los campos que llegan.
const validate = (data, { partial = false } = {}) => {
  const debeValidar = (campo) => !partial || data[campo] !== undefined;

  if (debeValidar("nombre") && (typeof data.nombre !== "string" || data.nombre.trim().length < 3))
    return "nombre es obligatorio y debe tener al menos 3 caracteres";

  if (
    debeValidar("fecha") &&
    (typeof data.fecha !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.fecha) ||
      Number.isNaN(Date.parse(data.fecha)))
  )
    return "fecha es obligatoria y debe tener el formato AAAA-MM-DD";

  if (debeValidar("lugar") && (typeof data.lugar !== "string" || data.lugar.trim() === ""))
    return "lugar es obligatorio";

  if (debeValidar("capacidad") && (!Number.isInteger(data.capacidad) || data.capacidad < 1))
    return "capacidad debe ser un número entero mayor o igual a 1";

  if (debeValidar("precio") && (typeof data.precio !== "number" || data.precio < 0))
    return "precio debe ser un número mayor o igual a 0";

  return null;
};

// ✅ Ya resuelto: úsalo como guía
const list = () => Evento.readAll();

// ✅ Ya resuelto
const getById = async (id) => {
  const item = (await Evento.readAll()).find((e) => e.id === id);
  if (!item) throw new HttpError(404, "Evento no encontrado");
  return item;
};

// TODO Paso 2: valida (400), genera el id (máximo + 1), agrega el registro con Evento.pick, guarda y devuélvelo
const create = async (data) => {
  throw new HttpError(501, "create() pendiente en el servicio");
};

// TODO Paso 2: valida con { partial: true } (400); si el id no existe lanza 404; mezcla los campos, guarda y devuélvelo
const update = async (id, data) => {
  throw new HttpError(501, "update() pendiente en el servicio");
};

// TODO Paso 2: elimina por id; si no existía lanza 404
const remove = async (id) => {
  throw new HttpError(501, "remove() pendiente en el servicio");
};

module.exports = { list, getById, create, update, remove };
