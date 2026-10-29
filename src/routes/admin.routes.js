const { Router } = require("express");
const adminController = require("../controllers/admin.controller");
const { authenticateToken, requireRole } = require("../middlewares/auth");

// Módulo de administración: un solo lugar con la protección de rol
const router = Router();
router.use(authenticateToken, requireRole("ADMIN"));

router.get("/reservas", adminController.listReservas);
router.patch("/reservas/:id/estado", adminController.updateReservaEstado);
router.get("/reportes/top-eventos", adminController.topEventos);
router.get("/estadisticas", adminController.estadisticas);

module.exports = router;
