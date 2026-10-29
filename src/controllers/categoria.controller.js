const categoriaService = require("../services/categoria.service");
const HttpError = require("../utils/httpError");

const parseId = (req) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
  return id;
};

const create = async (req, res, next) => {
  try {
    res.status(201).json(await categoriaService.create(req.body ?? {}));
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    res.json(await categoriaService.list());
  } catch (err) {
    next(err);
  }
};

const setEventoCategorias = async (req, res, next) => {
  try {
    res.json(await categoriaService.setEventoCategorias(parseId(req), req.body?.categoriaIds));
  } catch (err) {
    next(err);
  }
};

const buscarEventos = async (req, res, next) => {
  try {
    res.json(await categoriaService.buscarEventos(req.query));
  } catch (err) {
    next(err);
  }
};

const listEventos = async (req, res, next) => {
  try {
    res.json(await categoriaService.listEventos(parseId(req), req.query));
  } catch (err) {
    next(err);
  }
};

module.exports = { create, list, setEventoCategorias, buscarEventos, listEventos };
