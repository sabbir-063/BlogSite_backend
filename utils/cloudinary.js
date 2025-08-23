const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image with optimization
const uploadImage = async (file, folder = 'blog-images') => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: folder,
            transformation: [
                { quality: 'auto:good', fetch_format: 'auto' },
                { width: 1200, height: 800, crop: 'limit' },
                { effect: 'sharpen' }
            ],
            resource_type: 'image',
        });

        return {
            public_id: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes
        };
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = 'blog-images') => {
    try {
        const uploadPromises = files.map(file => uploadImage(file, folder));
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        throw new Error(`Multiple image upload failed: ${error.message}`);
    }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Image deletion failed: ${error.message}`);
    }
};

// Delete multiple images
const deleteMultipleImages = async (publicIds) => {
    try {
        const deletePromises = publicIds.map(publicId => deleteImage(publicId));
        const results = await Promise.all(deletePromises);
        return results;
    } catch (error) {
        throw new Error(`Multiple image deletion failed: ${error.message}`);
    }
};

// Generate optimized URL with transformations
const getOptimizedUrl = (publicId, options = {}) => {
    const defaultOptions = {
        quality: 'auto:good',
        fetch_format: 'auto',
        width: 800,
        height: 600,
        crop: 'limit',
        ...options
    };

    return cloudinary.url(publicId, {
        transformation: [defaultOptions],
        secure: true
    });
};

// Generate responsive image URLs
const getResponsiveUrls = (publicId) => {
    return {
        thumbnail: getOptimizedUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
        small: getOptimizedUrl(publicId, { width: 400, height: 300, crop: 'limit' }),
        medium: getOptimizedUrl(publicId, { width: 800, height: 600, crop: 'limit' }),
        large: getOptimizedUrl(publicId, { width: 1200, height: 800, crop: 'limit' }),
        original: getOptimizedUrl(publicId, { quality: 'auto:best' })
    };
};

module.exports = {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    deleteMultipleImages,
    getOptimizedUrl,
    getResponsiveUrls,
    cloudinary
};
