const { Router } = require("express");
const reservaController = require("../controllers/reserva.controller");
const { authenticateToken } = require("../middlewares/auth");

// Todas las rutas de reservas requieren un usuario autenticado
const router = Router();
router.use(authenticateToken);

router.post("/", reservaController.create);
router.get("/", reservaController.listMine);
router.patch("/:id/cancelar", reservaController.cancel);

module.exports = router;
