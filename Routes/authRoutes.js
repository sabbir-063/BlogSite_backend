const router = require("express").Router();
const { registerUser, loginUser } = require("../Controllers/authController");

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

module.exports = router;
