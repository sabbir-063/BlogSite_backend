const {Post} = require("../Models/Post");

const createPost = async (req, res) => {
    const { title, content } = req.body;
    const { role, id: userId } = req.user;

    console.log("User role:", role);
    if (!["admin", "author"].includes(role)) {
        return res.status(403).json({ error: "Only authors or admins can create posts" });
    }

    try {
        const post = await Post.create({ title, content, author: userId });
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: "Post creation failed" });
    }
};

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "username role") // show author's username + role
            .sort({ createdAt: -1 }); // newest first

        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};

module.exports = { createPost, getAllPosts };
