const { Router } = require("express");
const eventoRoutes = require("./evento.routes");

// Archivo principal de rutas: cada recurso se monta en su propio prefijo
const router = Router();

router.use("/eventos", eventoRoutes); // → /api/eventos

module.exports = router;
