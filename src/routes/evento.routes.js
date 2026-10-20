const { Router } = require("express");
const eventoController = require("../controllers/evento.controller");

// RUTAS: conectan cada verbo + URL con una acción del controlador
const router = Router();

// ✅ Ya resueltas
router.get("/", eventoController.list);
router.get("/:id", eventoController.getById);

// TODO Paso 2: agrega POST "/" → create, PUT "/:id" → update y DELETE "/:id" → remove

module.exports = router;
