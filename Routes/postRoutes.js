const express = require("express");
const router = express.Router();
const { createPost, getAllPosts, getPostById } = require("../Controllers/postController");
const { verifyToken } = require("../Middleware/authMiddleware");
const upload = require("../Middleware/postImageUpload");

router.post("/create", verifyToken, upload.array("imageLinks"), createPost);
router.get("/all", getAllPosts);
router.get("/:id", getPostById);

module.exports = router;
