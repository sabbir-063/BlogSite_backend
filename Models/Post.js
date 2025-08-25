const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
    public_id: { type: String, required: true },
    url: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    size: { type: Number }
}, { _id: false });

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true });

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    imageLinks: { type: [String], default: [] }, // Keep for backward compatibility
    images: { type: [imageSchema], default: [] }, // New Cloudinary images array
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    comments: [commentSchema],
    viewCount: {
        type: Number,
        default: 0
    },
    tags: [{ type: String, trim: true }] // Added tags for better filtering
},
    { timestamps: true });

// Virtual for like count
postSchema.virtual('likeCount').get(function () {
    return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function () {
    return this.comments.length;
});

// Ensure virtuals are serialized
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// Create text index for search functionality
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Post = mongoose.model("Post", postSchema);

module.exports = { Post };