const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    imageLinks: { type: [String], default: [] },
}, 
{ timestamps: true });

const Post = mongoose.model("Post", postSchema);

module.exports = { Post };