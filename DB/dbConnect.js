const mongoose = require("mongoose");

// Database connection
const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
        });
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
};

// Export the mongoose connection
module.exports = {dbConnect};
