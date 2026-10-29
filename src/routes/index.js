const { Router } = require("express");
const authRoutes = require("./auth.routes");
const eventoRoutes = require("./evento.routes");
const reservaRoutes = require("./reserva.routes");
const adminRoutes = require("./admin.routes");
const resenaRoutes = require("./resena.routes");
const categoriaRoutes = require("./categoria.routes");

// Monta cada recurso bajo su prefijo dentro de /api
const router = Router();

router.use("/auth", authRoutes);
router.use("/eventos", eventoRoutes);
router.use("/reservas", reservaRoutes);
router.use("/admin", adminRoutes);
router.use("/resenas", resenaRoutes);
router.use("/categorias", categoriaRoutes);

module.exports = router;
