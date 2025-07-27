const express = require("express");
const router = express.Router();
const { createPost, getAllPosts, getPostById, updatePost, deletePost } = require("../Controllers/postController");
const { verifyToken } = require("../Middleware/authMiddleware");
const upload = require("../Middleware/postImageUpload");

router.post("/create", verifyToken, upload.array("imageLinks"), createPost);
router.get("/all", getAllPosts);
router.get('/:id', getPostById);
router.put("/:id", verifyToken, upload.array("imageLinks"), updatePost);
router.delete("/:id", verifyToken, deletePost);

module.exports = router;
