const { Router } = require("express");
const meController = require("../controllers/me.controller");
const { authenticateToken } = require("../middlewares/auth");

const router = Router();
router.use(authenticateToken);

router.get("/", meController.getMe);
router.patch("/", meController.updateMe);
router.patch("/password", meController.changePassword);

module.exports = router;
