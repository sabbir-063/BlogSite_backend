const { Post } = require("../Models/Post");
const fs = require('fs');
const path = require('path');

const createPost = async (req, res) => {
    const { title, content } = req.body;
    const { role, id: userId } = req.user;

    if (!["admin", "author"].includes(role)) {
        return res.status(403).json({ error: "Only authors or admins can create posts" });
    }

    try {
        const files = req.files || [];
        const imageLinks = files.map(file => `${req.protocol}://${req.get("host")}/uploads/post-images/${file.filename}`);

        if (imageLinks.length > 0) {
            req.body.imageLinks = imageLinks;
        }
        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }
        const post = await Post.create({ title, content, author: userId, imageLinks });
        // console.log("Post created successfully:(userId) ", userId);
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: "Post creation failed" });
    }
};

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "firstname lastname username role profilePicture")
            .sort({ createdAt: -1 });
        // console.log("Fetched posts: ", posts);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};

const getPostById = async (req, res) => {
    const { id } = req.params;
    // console.log("backend : Fetching post with ID:", id);
    try {
        const post = await Post.findById(id)
            .populate("author", "firstname lastname username role profilePicture");
        // .populate("comments.author", "username role");
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json(post);
    } catch (err) {
        console.error("Error fetching post:", err);
        res.status(500).json({ error: "Failed to fetch post" });
    }
};

const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    let keepImages = [];
    try {
        keepImages = JSON.parse(req.body.keepImages || '[]');
    } catch {
        keepImages = Array.isArray(req.body.keepImages) ? req.body.keepImages : [];
    }
    const { role, id: userId } = req.user;
    if (!["admin", "author"].includes(role)) {
        return res.status(403).json({ error: "Only authors or admins can update posts" });
    }
    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.author.toString() !== userId) {
            return res.status(403).json({ error: "You are not authorized to update this post" });
        }
        post.title = title || post.title;
        post.content = content || post.content;
        // Remove images not in keepImages
        const imagesToDelete = post.imageLinks.filter(img => !keepImages.includes(img));
        for (const imgUrl of imagesToDelete) {
            const filename = imgUrl.split('/').pop();
            const filePath = path.join(__dirname, '../uploads/post-images', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        // Keep only the images in keepImages
        let updatedImageLinks = keepImages;
        // Add new images if any
        if (req.files && req.files.length > 0) {
            const newImageLinks = req.files.map(file => `${req.protocol}://${req.get("host")}/uploads/post-images/${file.filename}`);
            updatedImageLinks = [...updatedImageLinks, ...newImageLinks];
        }
        // Validation: at least one image must remain
        if (updatedImageLinks.length === 0) {
            return res.status(400).json({ error: "At least one image is required for a post." });
        }
        post.imageLinks = updatedImageLinks;
        await post.save();
        res.json(post);
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ error: "Failed to update post" });
    }
};

const deletePost = async (req, res) => {
    const { id } = req.params;
    const { role, id: userId } = req.user;
    if (!["admin", "author"].includes(role)) {
        return res.status(403).json({ error: "Only authors or admins can delete posts" });
    }
    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.author.toString() !== userId) {
            return res.status(403).json({ error: "You are not authorized to delete this post" });
        }
        await Post.findByIdAndDelete(id);
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ error: "Failed to delete post" });
    }
};

module.exports = { createPost, getAllPosts, getPostById, updatePost, deletePost };
