const eventoService = require("../services/evento.service");
const HttpError = require("../utils/httpError");

// Controlador: delega en el servicio y responde con el código HTTP; los errores van a errorHandler

// Convierte :id a número; 400 si no es numérico
const parseId = (req) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
  return id;
};

// GET / → 200
const list = async (req, res, next) => {
  try {
    res.json(await eventoService.list());
  } catch (err) {
    next(err);
  }
};

// GET /:id → 200
const getById = async (req, res, next) => {
  try {
    res.json(await eventoService.getById(parseId(req)));
  } catch (err) {
    next(err);
  }
};

// POST / → 201 con el evento creado
const create = async (req, res, next) => {
  try {
    const item = await eventoService.create(req.body ?? {});
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// PUT /:id → 200 con el evento actualizado
const update = async (req, res, next) => {
  try {
    res.json(await eventoService.update(parseId(req), req.body ?? {}));
  } catch (err) {
    next(err);
  }
};

// DELETE /:id → 204 sin cuerpo
const remove = async (req, res, next) => {
  try {
    await eventoService.remove(parseId(req));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

const createMany = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0)
      throw new HttpError(400, "El cuerpo debe ser un arreglo con al menos un evento");
    res.status(201).json(await eventoService.createMany(req.body));
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById, create, update, remove, createMany };
