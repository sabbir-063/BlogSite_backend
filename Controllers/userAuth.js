const bcrypt = require('bcrypt');
const Joi = require('joi');
const { User } = require('../Models/userSchema');

const auth = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        const user = await User.findOne({
            email: req.body.email
        });
        if (!user) return res.status(400).send("Invalid email or password");

        const validPassword = bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).send("Invalid email or password");
        const token = user.generateAuthToken();
        res.status(200).send({
            message: "Login successful",
            data: token,
        });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }

};

const validate = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    // console.log("Validation schema:", schema.validate(data));
    return schema.validate(data);
};

module.exports = { auth, validate };