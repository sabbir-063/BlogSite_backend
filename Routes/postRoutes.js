const express = require("express");
const router = express.Router();
const {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
    toggleCommentLike
} = require("../Controllers/postController");
const { verifyToken } = require("../Middleware/authMiddleware");
const { upload, uploadToCloudinary } = require("../Middleware/cloudinaryUpload");

// Post CRUD routes
router.post("/create", verifyToken, upload.array("imageLinks"), uploadToCloudinary, createPost);
router.get("/all", getAllPosts);
router.get('/:id', getPostById);
router.put("/:id", verifyToken, upload.array("imageLinks"), uploadToCloudinary, updatePost);
router.delete("/:id", verifyToken, deletePost);

// Like/Unlike routes
router.post("/:id/like", verifyToken, toggleLike);

// Comment routes
router.post("/:id/comments", verifyToken, addComment);
router.delete("/:id/comments/:commentId", verifyToken, deleteComment);
router.post("/:id/comments/:commentId/like", verifyToken, toggleCommentLike);

module.exports = router;
