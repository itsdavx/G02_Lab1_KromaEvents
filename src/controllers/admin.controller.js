const adminService = require("../services/admin.service");
const HttpError = require("../utils/httpError");

// GET /api/admin/reservas?estado=PENDIENTE&from=2026-10-01&page=1&limit=10
const listReservas = async (req, res, next) => {
  try {
    res.json(await adminService.listReservas(req.query));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/reservas/:id/estado  { "estado": "CONFIRMADA" }
const updateReservaEstado = async (req, res, next) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw new HttpError(400, "El id debe ser numérico");
    res.json(await adminService.updateReservaEstado(req.user.id, id, req.body ?? {}));
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/reportes/top-eventos?limit=5
const topEventos = async (req, res, next) => {
  try {
    res.json(await adminService.topEventos(req.query.limit));
  } catch (err) {
    next(err);
  }
};

const estadisticas = async (req, res, next) => {
  try {
    res.json(await adminService.estadisticas(req.query));
  } catch (err) {
    next(err);
  }
};

module.exports = { listReservas, updateReservaEstado, topEventos, estadisticas };
