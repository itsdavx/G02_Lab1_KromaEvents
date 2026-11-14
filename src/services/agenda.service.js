const Agenda = require("../models/agenda");

// El SERVICIO usa el modelo (models/ no reemplaza a services/)
const create = async (data) => Agenda.create(data);

module.exports = { create };
