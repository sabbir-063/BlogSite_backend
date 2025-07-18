require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { dbConnect } = require("./DB/dbConnect");
const authRoutes = require("./Routes/userRouter");


// Database connection
dbConnect();

// Middleware setup
const allowedOrigins = [
    "https://blog-site-frontend-five.vercel.app",  // ✅ your frontend domain
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // if using cookies or authorization headers
}));
app.use(express.json());


// Routes setup
app.use("/api", authRoutes);




PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});