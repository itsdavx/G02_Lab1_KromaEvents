const agendaService = require("../services/agenda.service");

const create = async (req, res, next) => {
  try {
    res.status(201).json(await agendaService.create(req.body ?? {}));
  } catch (err) {
    next(err);
  }
};

module.exports = { create };
