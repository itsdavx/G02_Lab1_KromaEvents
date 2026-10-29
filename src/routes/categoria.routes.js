const { Router } = require("express");
const categoriaController = require("../controllers/categoria.controller");
const { authenticateToken, requireRole } = require("../middlewares/auth");

const router = Router();

router.get("/", categoriaController.list);
router.post("/", authenticateToken, requireRole("ADMIN"), categoriaController.create);
router.get("/:id/eventos", categoriaController.listEventos);

module.exports = router;
