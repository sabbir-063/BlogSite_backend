const {User} = require("../Models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        });
        if (user) return res.status(400).send("User already registered");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        await new User({
            ...req.body,
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
                username: user.username,
                role: "author"
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = {
    registerUser,  
    loginUser
};
