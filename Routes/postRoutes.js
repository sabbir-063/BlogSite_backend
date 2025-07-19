const express = require("express");
const router = express.Router();
const { createPost, getAllPosts } = require("../Controllers/postController");
const {verifyToken} = require("../Middleware/authMiddleware");

router.post("/create", verifyToken, createPost);
router.get("/all", getAllPosts);

module.exports = router;
