const router = require("express").Router();
const { registerUser, loginUser } = require("../Controllers/authController");
const { upload, uploadProfilePicture } = require("../Middleware/cloudinaryUpload");

const { forgotPassword, resetPassword } = require('../Controllers/passwordController');

// POST /api/auth/register
router.post("/register", upload.single("profilePicture"), uploadProfilePicture, registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
