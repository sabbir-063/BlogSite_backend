require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { dbConnect } = require("./DB/dbConnect");
const authRoutes = require("./Routes/authRoutes");
const postRoutes = require("./Routes/postRoutes");

// Database connection
dbConnect();

// Middleware setup
app.use(cors());
app.use(express.json());


// Routes setup
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);




PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});