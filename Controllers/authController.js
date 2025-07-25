const {User} = require("../Models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        });
        if (user) return res.status(400).send("User already registered");

        const profilePicURL = req.file
            ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
            : undefined;

        console.log("Profile Picture URL: ", profilePicURL);
        console.log("Request Body : ", req.body);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        await new User({
            ...req.body,
            profilePicture: profilePicURL || req.body.profilePicture,
            password: hashedPassword
        }).save();
        res.status(201).send("User created successfully");
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

        if (req.file) {
            updatedData.profilePicture = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
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
