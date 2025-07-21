const router = require("express").Router();
const { registerUser, loginUser } = require("../Controllers/authController");
const upload = require("../Middleware/upload");

// POST /api/auth/register
router.post("/register", upload.single("profilePicture") , registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

module.exports = router;
