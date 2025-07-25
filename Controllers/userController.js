const { User } = require("../Models/userSchema");
const { Post } = require("../Models/Post");

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user.id })
            .populate("author", "firstname lastname username profilePicture")
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUserStats = async (req, res) => {
    try {
        const totalPosts = await Post.countDocuments({ author: req.user.id });
        const userInfo = await User.findById(req.user.id).select("-password");

        const stats = {
            totalPosts,
            joinedDate: userInfo.createdAt,
            lastActive: userInfo.updatedAt
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getUserProfile,
    getUserPosts,
    getUserStats
};
