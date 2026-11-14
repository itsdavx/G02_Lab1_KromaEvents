const { Router } = require("express");
const agendaController = require("../controllers/agenda.controller");

const router = Router();

router.post("/", agendaController.create);

module.exports = router;
