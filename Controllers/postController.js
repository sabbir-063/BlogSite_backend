const { Post } = require("../Models/Post");
const fs = require('fs');
const path = require('path');
const { deleteMultipleImages } = require("../utils/cloudinary");

const createPost = async (req, res) => {
    const { title, content } = req.body;
    const { role, id: userId } = req.user;

    if (!["admin", "author"].includes(role)) {
        return res.status(403).json({ error: "Only authors or admins can create posts" });
    }

    try {
        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required" });
        }

        // Handle Cloudinary images
        let imageLinks = [];
        let images = [];

        if (req.cloudinaryImages && req.cloudinaryImages.length > 0) {
            images = req.cloudinaryImages;
            imageLinks = req.cloudinaryImages.map(img => img.url);
        }

        const post = await Post.create({
            title,
            content,
            author: userId,
            imageLinks,
            images
        });

        res.status(201).json(post);
    } catch (err) {
        console.error("Post creation error:", err);
        res.status(500).json({ error: "Post creation failed" });
    }
};

const getAllPosts = async (req, res) => {
    try {
        // Extract query parameters for sorting and pagination
        const { sort = 'latest', page = 1, limit = 12 } = req.query;
        const skip = (page - 1) * limit;
        
        // Define sort options
        let sortOption = {};
        switch (sort) {
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'most_viewed':
                sortOption = { viewCount: -1 };
                break;
            case 'most_liked':
                sortOption = { likeCount: -1 };
                break;
            case 'most_commented':
                sortOption = { commentCount: -1 };
                break;
            case 'latest':
            default:
                sortOption = { createdAt: -1 };
        }

        // Get total count for pagination info
        const total = await Post.countDocuments();
        
        // Fetch posts with sorting and pagination
        const posts = await Post.find()
            .populate("author", "firstname lastname username role profilePicture profileImage")
            .populate("comments.user", "firstname lastname username profilePicture profileImage")
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));
        
        // Add pagination metadata
        res.json({
            posts,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
};

const getPostById = async (req, res) => {
    const { id } = req.params;
    // console.log("backend : Fetching post with ID:", id);
    try {
        const post = await Post.findById(id)
            .populate("author", "firstname lastname username role profilePicture profileImage")
            .populate("comments.user", "firstname lastname username profilePicture profileImage")
            .populate("likes", "firstname lastname username profilePicture profileImage");

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Increment view count
        post.viewCount += 1;
        await post.save();

        res.status(200).json(post);
    } catch (err) {
        console.error("Error fetching post:", err);
        res.status(500).json({ error: "Failed to fetch post" });
    }
};

const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    let keepImages = [];
    try {
        keepImages = JSON.parse(req.body.keepImages || '[]');
    } catch {
        keepImages = Array.isArray(req.body.keepImages) ? req.body.keepImages : [];
    }
    const { role, id: userId } = req.user;
    if (!["admin", "author"].includes(role)) {
        return res.status(403).json({ error: "Only authors or admins can update posts" });
    }
    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.author.toString() !== userId) {
            return res.status(403).json({ error: "You are not authorized to update this post" });
        }

        post.title = title || post.title;
        post.content = content || post.content;

        // Handle Cloudinary images
        let updatedImageLinks = keepImages;
        let updatedImages = post.images.filter(img => keepImages.includes(img.url));

        // Add new Cloudinary images if any
        if (req.cloudinaryImages && req.cloudinaryImages.length > 0) {
            updatedImages = [...updatedImages, ...req.cloudinaryImages];
            updatedImageLinks = [...updatedImageLinks, ...req.cloudinaryImages.map(img => img.url)];
        }

        // Delete removed images from Cloudinary
        const imagesToDelete = post.images.filter(img => !keepImages.includes(img.url));
        if (imagesToDelete.length > 0) {
            const publicIds = imagesToDelete.map(img => img.public_id);
            try {
                await deleteMultipleImages(publicIds);
            } catch (deleteError) {
                console.error("Error deleting images from Cloudinary:", deleteError);
            }
        }

        // Validation: at least one image must remain
        if (updatedImageLinks.length === 0) {
            return res.status(400).json({ error: "At least one image is required for a post." });
        }

        post.imageLinks = updatedImageLinks;
        post.images = updatedImages;
        await post.save();
        res.json(post);
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).json({ error: "Failed to update post" });
    }
};

const deletePost = async (req, res) => {
    const { id } = req.params;
    const { role, id: userId } = req.user;
    if (!["admin", "author"].includes(role)) {
        return res.status(403).json({ error: "Only authors or admins can delete posts" });
    }
    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.author.toString() !== userId) {
            return res.status(403).json({ error: "You are not authorized to delete this post" });
        }

        // Delete images from Cloudinary
        if (post.images && post.images.length > 0) {
            const publicIds = post.images.map(img => img.public_id);
            try {
                await deleteMultipleImages(publicIds);
            } catch (deleteError) {
                console.error("Error deleting images from Cloudinary:", deleteError);
            }
        }

        await Post.findByIdAndDelete(id);
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ error: "Failed to delete post" });
    }
};

// Like/Unlike a post
const toggleLike = async (req, res) => {
    const { id } = req.params;
    const { id: userId } = req.user;

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(userId);
        }

        await post.save();

        // Populate the updated post
        const updatedPost = await Post.findById(id)
            .populate("author", "firstname lastname username role profilePicture profileImage")
            .populate("comments.user", "firstname lastname username profilePicture profileImage")
            .populate("likes", "firstname lastname username profilePicture profileImage");

        res.json({
            message: likeIndex > -1 ? "Post unliked" : "Post liked",
            post: updatedPost,
            isLiked: likeIndex === -1
        });
    } catch (err) {
        console.error("Error toggling like:", err);
        res.status(500).json({ error: "Failed to toggle like" });
    }
};

// Add comment to a post
const addComment = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const { id: userId } = req.user;

    if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: "Comment content is required" });
    }

    if (content.length > 1000) {
        return res.status(400).json({ error: "Comment is too long (max 1000 characters)" });
    }

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const newComment = {
            user: userId,
            content: content.trim(),
            likes: []
        };

        post.comments.push(newComment);
        await post.save();

        // Populate the updated post
        const updatedPost = await Post.findById(id)
            .populate("author", "firstname lastname username role profilePicture profileImage")
            .populate("comments.user", "firstname lastname username profilePicture profileImage")
            .populate("likes", "firstname lastname username profilePicture profileImage");

        res.json({
            message: "Comment added successfully",
            post: updatedPost
        });
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ error: "Failed to add comment" });
    }
};

// Delete comment from a post
const deleteComment = async (req, res) => {
    const { id, commentId } = req.params;
    const { id: userId, role } = req.user;

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Only comment author or admin can delete
        if (comment.user.toString() !== userId && role !== "admin") {
            return res.status(403).json({ error: "Not authorized to delete this comment" });
        }

        comment.deleteOne();
        await post.save();

        // Populate the updated post
        const updatedPost = await Post.findById(id)
            .populate("author", "firstname lastname username role profilePicture profileImage")
            .populate("comments.user", "firstname lastname username profilePicture profileImage")
            .populate("likes", "firstname lastname username profilePicture profileImage");

        res.json({
            message: "Comment deleted successfully",
            post: updatedPost
        });
    } catch (err) {
        console.error("Error deleting comment:", err);
        res.status(500).json({ error: "Failed to delete comment" });
    }
};

// Like/Unlike a comment
const toggleCommentLike = async (req, res) => {
    const { id, commentId } = req.params;
    const { id: userId } = req.user;

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        const likeIndex = comment.likes.indexOf(userId);
        if (likeIndex > -1) {
            // Unlike
            comment.likes.splice(likeIndex, 1);
        } else {
            // Like
            comment.likes.push(userId);
        }

        await post.save();

        // Populate the updated post
        const updatedPost = await Post.findById(id)
            .populate("author", "firstname lastname username role profilePicture profileImage")
            .populate("comments.user", "firstname lastname username profilePicture profileImage")
            .populate("likes", "firstname lastname username profilePicture profileImage");

        res.json({
            message: likeIndex > -1 ? "Comment unliked" : "Comment liked",
            post: updatedPost,
            isLiked: likeIndex === -1
        });
    } catch (err) {
        console.error("Error toggling comment like:", err);
        res.status(500).json({ error: "Failed to toggle comment like" });
    }
};

// Search posts
const searchPosts = async (req, res) => {
    try {
        const { query, author, tags, sort = 'latest', page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        
        // Build search query
        let searchQuery = {};
        
        // Text search if query parameter exists
        if (query) {
            searchQuery.$text = { $search: query };
        }
        
        // Filter by author if provided
        if (author) {
            searchQuery.author = author;
        }
        
        // Filter by tags if provided
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            searchQuery.tags = { $in: tagArray };
        }
        
        // Define sort options
        let sortOption = {};
        switch (sort) {
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'most_viewed':
                sortOption = { viewCount: -1 };
                break;
            case 'most_liked':
                sortOption = { likeCount: -1 };
                break;
            case 'most_commented':
                sortOption = { commentCount: -1 };
                break;
            case 'relevance':
                if (query) {
                    // If doing text search, sort by text score for relevance
                    sortOption = { score: { $meta: 'textScore' } };
                } else {
                    sortOption = { createdAt: -1 };
                }
                break;
            case 'latest':
            default:
                sortOption = { createdAt: -1 };
        }
        
        // Get total count for pagination
        const total = await Post.countDocuments(searchQuery);
        
        // Find posts with pagination
        let postsQuery = Post.find(searchQuery);
        
        // Add text score projection if doing text search
        if (query) {
            postsQuery = postsQuery.select({ score: { $meta: 'textScore' } });
        }
        
        const posts = await postsQuery
            .populate("author", "firstname lastname username role profilePicture profileImage")
            .populate("comments.user", "firstname lastname username profilePicture profileImage")
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));
        
        res.json({
            posts,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("Error searching posts:", err);
        res.status(500).json({ error: "Failed to search posts" });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
    toggleCommentLike,
    searchPosts
};
