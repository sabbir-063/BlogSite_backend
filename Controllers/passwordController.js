// At the top
const CryptoJS = require('crypto-js');
const nodemailer = require('nodemailer');
const {User} = require('../Models/userSchema');
const bcrypt = require('bcryptjs');


exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    // console.log(email);
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });

    // Generate token
    const token = CryptoJS.lib.WordArray.random(32).toString();
    user.resetPasswordToken = CryptoJS.SHA256(token).toString();
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send email
    const resetUrl = `${process.env.CLIENT_URL}reset-password/${token}`;
    // const resetUrl = `${process.env.LOCAL_URL}reset-password/${token}`;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    await transporter.sendMail({
        to: user.email,
        from: 'no-reply@nextblog.com',
        subject: 'Password Reset Request',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
    });

    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
};



exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required.' });

    const hashedToken = CryptoJS.SHA256(token).toString();
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token.' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
};