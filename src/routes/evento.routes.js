const { Router } = require("express");
const eventoController = require("../controllers/evento.controller");

// Rutas CRUD de /api/eventos
const router = Router();

router.get("/", eventoController.list);
router.get("/:id", eventoController.getById);
router.post("/", eventoController.create);
router.post("/lote", eventoController.createMany);
router.put("/:id", eventoController.update);
router.delete("/:id", eventoController.remove);

module.exports = router;
