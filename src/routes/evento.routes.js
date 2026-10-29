const { Router } = require("express");
const eventoController = require("../controllers/evento.controller");
const resenaController = require("../controllers/resena.controller");
const { authenticateToken, requireRole } = require("../middlewares/auth");

// Rutas CRUD de /api/eventos
const router = Router();
const onlyAdmin = [authenticateToken, requireRole("ADMIN")];

router.get("/", eventoController.list);
router.get("/:id", eventoController.getById);
router.post("/", onlyAdmin, eventoController.create);
router.post("/lote", onlyAdmin, eventoController.createMany);
router.put("/:id", onlyAdmin, eventoController.update);
router.delete("/:id", onlyAdmin, eventoController.remove);
router.get("/:id/resenas", resenaController.listByEvento);
router.post("/:id/resenas", authenticateToken, resenaController.create);

module.exports = router;
