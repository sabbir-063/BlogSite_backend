const express = require("express");
const router = express.Router();
const { getUserProfile, getUserPosts, updateProfile, updatePassword } = require("../Controllers/userController");
const { verifyToken } = require("../Middleware/authMiddleware");
const { upload, uploadProfilePicture } = require("../Middleware/cloudinaryUpload");

router.get("/profile", verifyToken, getUserProfile);
router.get("/posts", verifyToken, getUserPosts);
router.put("/profile", verifyToken, upload.single("profilePicture"), uploadProfilePicture, updateProfile);
router.put("/password", verifyToken, updatePassword);

module.exports = router;
