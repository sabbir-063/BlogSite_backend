// const router = require('express').Router();
const { User, validateUser } = require('../Models/userSchema');
const bcrypt = require('bcrypt');

const user = async (req, res) => {
    try {
        const { error } = validateUser(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({
            email: req.body.email
        });
        // console.log("hhh")
        if (user) return res.status(400).send("User already registered");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        await new User({
            ...req.body,
            password: hashedPassword
        }).save();
        res.status(201).send("User created successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }

};

module.exports = {user};