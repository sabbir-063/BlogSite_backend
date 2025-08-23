const { User } = require("../Models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { deleteImage } = require("../utils/cloudinary");

const registerUser = async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        });
        if (user) return res.status(400).send("User already registered");

        // Handle Cloudinary profile image
        let profilePicture = req.body.profilePicture; // Default fallback
        let profileImage = null;

        if (req.cloudinaryProfile) {
            profileImage = req.cloudinaryProfile;
            profilePicture = req.cloudinaryProfile.url;
        }

        // console.log("Profile Picture URL: ", profilePicture);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = await new User({
            ...req.body,
            profilePicture: profilePicture,
            profileImage: profileImage,
            password: hashedPassword
        }).save();

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                username: newUser.username,
                email: newUser.email,
                profilePicture: newUser.profilePicture,
                role: newUser.role
            }
        });
    } catch (err) {
        // Handle duplicate error
        if (err.code === 11000) {
            const duplicateField = Object.keys(err.keyPattern)[0];
            return res.status(400).json(`${duplicateField} already exists`);
        }
        res.status(500).json({ error: err.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json("Invalid email or password");

        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) return res.status(400).json("Invalid email or password");

        const token = jwt.sign(
            { id: user._id, role: "author" },
            process.env.JWT_SECRET,
            { expiresIn: "10h" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                datathOfBirth: user.datathOfBirth,
                profilePicture: user.profilePicture,
                profileImage: user.profileImage,
                username: user.username,
                email: user.email,
                role: "author"
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json("User not found");
        const updatedData = { ...req.body };

        // Handle Cloudinary profile image
        if (req.cloudinaryProfile) {
            updatedData.profileImage = req.cloudinaryProfile;
            updatedData.profilePicture = req.cloudinaryProfile.url;

            // Delete old profile image from Cloudinary if exists
            if (user.profileImage && user.profileImage.public_id) {
                try {
                    await deleteImage(user.profileImage.public_id);
                } catch (deleteError) {
                    console.error("Error deleting old profile image:", deleteError);
                }
            }
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            updatedData.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(req.user.id, updatedData, { new: true });
        res.json({
            message: "User updated successfully",
            user: {
                id: updatedUser._id,
                firstname: updatedUser.firstname,
                lastname: updatedUser.lastname,
                datathOfBirth: updatedUser.datathOfBirth,
                profilePicture: updatedUser.profilePicture,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


module.exports = {
    registerUser,
    loginUser,
    updateUser,
};
