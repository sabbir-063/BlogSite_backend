const router = require("express").Router();
const { registerUser, loginUser } = require("../Controllers/authController");
const { upload, uploadProfilePicture } = require("../Middleware/cloudinaryUpload");

// POST /api/auth/register
router.post("/register", upload.single("profilePicture"), uploadProfilePicture, registerUser);

// POST /api/auth/login
router.post("/login", loginUser);


module.exports = router;
