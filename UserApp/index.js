require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

// MongoDB connection string - use environment variable or fallback
const uri = process.env.MONGODB_URI || "mongodb+srv://ruchip:ruchip@cluster0.ue1bwh4.mongodb.net/userapp?retryWrites=true&w=majority&appName=Cluster0";



// Import authentication middleware
const { isAuthenticated, redirectIfAuthenticated } = require("./middleware/auth");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));
app.use(cookieParser());
app.use(cors(
    {
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "https://user-app-nine-beta.vercel.app",
            /\.vercel\.app$/
        ],
        methods: ["POST", "GET", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
    }
));

const User = require("./models/user");

const PORT = process.env.PORT || 3001;


app.get("/create", isAuthenticated, (req, res) => {
    res.render("create");
});

const userRouter = require("./Router/user");
app.use("/", userRouter);

const userLoginRouter = require("./Router/userLogin");
app.use("/", userLoginRouter);

// Connect to MongoDB using Mongoose with timeout options
mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 5, // Maintain a minimum of 5 socket connections
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    bufferMaxEntries: 0, // Disable mongoose buffering
    bufferCommands: false, // Disable mongoose buffering
})
.then(() => {
    console.log("Connected to MongoDB successfully at port " + PORT);
    // Test the connection with a simple operation
    mongoose.connection.db.admin().ping()
        .then(() => console.log("MongoDB ping successful"))
        .catch(err => console.error("MongoDB ping failed:", err));
})
.catch((error) => {
    console.error("MongoDB connection error:", error);
    console.error("Please check:");
    console.error("1. Your internet connection");
    console.error("2. MongoDB Atlas IP whitelist settings");
    console.error("3. Database credentials in .env file");
    process.exit(1); // Exit the process if MongoDB connection fails
});

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export the app for Vercel
module.exports = app;
