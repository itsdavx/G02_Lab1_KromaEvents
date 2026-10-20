const { Router } = require("express");
const eventoRoutes = require("./evento.routes");

// Monta cada recurso bajo su prefijo dentro de /api
const router = Router();

router.use("/eventos", eventoRoutes);

module.exports = router;
