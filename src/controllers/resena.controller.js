const resenaService = require("../services/resena.service");
const HttpError = require("../utils/httpError");

const parseId = (req) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
  return id;
};

const create = async (req, res, next) => {
  try {
    res.status(201).json(await resenaService.create(req.user, parseId(req), req.body ?? {}));
  } catch (err) {
    next(err);
  }
};

const listByEvento = async (req, res, next) => {
  try {
    res.json(await resenaService.listByEvento(parseId(req), req.query));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await resenaService.remove(req.user, parseId(req));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

module.exports = { create, listByEvento, remove };
