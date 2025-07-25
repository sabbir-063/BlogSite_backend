const express = require("express");
const router = express.Router();
const { getUserProfile, getUserPosts, getUserStats } = require("../Controllers/userController");
const {verifyToken} = require("../Middleware/authMiddleware");

router.get("/profile", verifyToken, getUserProfile);
router.get("/posts", verifyToken, getUserPosts);
router.get("/stats", verifyToken, getUserStats);

module.exports = router;
