const Evento = require("../models/evento.model");
const HttpError = require("../utils/httpError");

// Servicio: validaciones y reglas de negocio; lanza HttpError 400 o 404

// Devuelve el primer error encontrado o null; con partial solo revisa los campos recibidos (PUT)
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

// Lista todos los eventos
const list = () => Evento.readAll();

// Busca un evento por id; 404 si no existe
const getById = async (id) => {
  const item = (await Evento.readAll()).find((e) => e.id === id);
  if (!item) throw new HttpError(404, "Evento no encontrado");
  return item;
};

// Valida, asigna el id (máximo + 1) y guarda el evento
const create = async (data) => {
  const error = validate(data);
  if (error) throw new HttpError(400, error);

  const items = await Evento.readAll();
  const id = items.reduce((max, e) => Math.max(max, e.id), 0) + 1;
  const item = { id, ...Evento.pick(data) };
  items.push(item);
  await Evento.writeAll(items);
  return item;
};

// Valida los campos recibidos y actualiza el evento; 404 si no existe
const update = async (id, data) => {
  const error = validate(data, { partial: true });
  if (error) throw new HttpError(400, error);

  const items = await Evento.readAll();
  const index = items.findIndex((e) => e.id === id);
  if (index === -1) throw new HttpError(404, "Evento no encontrado");

  items[index] = { ...items[index], ...Evento.pick(data), id };
  await Evento.writeAll(items);
  return items[index];
};

// Elimina un evento por id; 404 si no existe
const remove = async (id) => {
  const items = await Evento.readAll();
  const restantes = items.filter((e) => e.id !== id);
  if (restantes.length === items.length) throw new HttpError(404, "Evento no encontrado");
  await Evento.writeAll(restantes);
};

module.exports = { list, getById, create, update, remove };
