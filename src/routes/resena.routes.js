const { Router } = require("express");
const resenaController = require("../controllers/resena.controller");
const { authenticateToken } = require("../middlewares/auth");

const router = Router();

router.delete("/:id", authenticateToken, resenaController.remove);

module.exports = router;
