const { User } = require("../Models/userSchema");
const { Post } = require("../Models/Post");
const bcrypt = require("bcrypt");
const { deleteImage } = require("../utils/cloudinary");

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        // console.log(req);
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

const updateProfile = async (req, res) => {
    try {
        const { firstname, lastname, datathOfBirth, username, profilePicture } = req.body;

        // Check if username is already taken by another user
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ error: "Username already taken" });
            }
        }

        const updateData = {};
        if (firstname) updateData.firstname = firstname;
        if (lastname) updateData.lastname = lastname;
        if (datathOfBirth) updateData.datathOfBirth = datathOfBirth;
        if (username) updateData.username = username;
        if (profilePicture) updateData.profilePicture = profilePicture;

        // Handle Cloudinary profile image
        if (req.cloudinaryProfile) {
            updateData.profileImage = req.cloudinaryProfile;
            updateData.profilePicture = req.cloudinaryProfile.url;
            
            // Delete old profile image from Cloudinary if exists
            const currentUser = await User.findById(req.user.id);
            if (currentUser.profileImage && currentUser.profileImage.public_id) {
                try {
                    await deleteImage(currentUser.profileImage.public_id);
                } catch (deleteError) {
                    console.error("Error deleting old profile image:", deleteError);
                }
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: "All password fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "New passwords do not match" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Get user with password
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Current password is incorrect" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getUserProfile,
    getUserPosts,
    getUserStats,
    updateProfile,
    updatePassword
};
