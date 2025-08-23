require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const { dbConnect } = require("./DB/dbConnect");
const authRoutes = require("./Routes/authRoutes");
const postRoutes = require("./Routes/postRoutes");
const userRoutes = require('./Routes/userRoutes');
// Database connection
dbConnect();
corsOptions = {
    origin: "http://localhost:5173",
    // origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
};
app.use(cors(corsOptions));

// Middleware setup
app.use(cors());
app.use(express.json());
// Removed static file serving for uploads since we're using Cloudinary

// Routes setup
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use('/api/user', userRoutes);



PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});