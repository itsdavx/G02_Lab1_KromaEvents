const reservaService = require("../services/reserva.service");
const HttpError = require("../utils/httpError");

const parseId = (req) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
  return id;
};

// POST /api/reservas → crea las reservas del usuario autenticado
const create = async (req, res, next) => {
  try {
    res.status(201).json(await reservaService.create(req.user.id, req.body?.items)); // 201
  } catch (err) {
    next(err);
  }
};

// GET /api/reservas → reservas del usuario con su evento
const listMine = async (req, res, next) => {
  try {
    res.json(await reservaService.listByUser(req.user.id));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/reservas/:id/cancelar → cancela y devuelve los cupos
const cancel = async (req, res, next) => {
  try {
    res.json(await reservaService.cancel(req.user.id, parseId(req)));
  } catch (err) {
    next(err);
  }
};

const historial = async (req, res, next) => {
  try {
    res.json(await reservaService.historial(req.user, parseId(req)));
  } catch (err) {
    next(err);
  }
};

module.exports = { create, listMine, cancel, historial };
