const { Router } = require("express");
const authRoutes = require("./auth.routes");
const eventoRoutes = require("./evento.routes");

// Monta cada recurso bajo su prefijo dentro de /api
const router = Router();

router.use("/auth", authRoutes);
router.use("/eventos", eventoRoutes);

module.exports = router;
