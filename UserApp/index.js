require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

// Disable mongoose buffering to prevent timeout issues
mongoose.set('bufferCommands', false);

// MongoDB connection string - use environment variable or fallback
const uri = process.env.MONGODB_URI || "mongodb+srv://ruchip:ruchip@cluster0.ue1bwh4.mongodb.net/userapp?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB using Mongoose with serverless-optimized options
const connectToMongoDB = async () => {
    if (mongoose.connection.readyState === 0) {
        try {
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 10000, // Shorter timeout for serverless
                socketTimeoutMS: 20000, // Shorter socket timeout for serverless
                maxPoolSize: 1, // Smaller pool for serverless
                minPoolSize: 0, // No minimum connections for serverless
                maxIdleTimeMS: 10000, // Shorter idle time for serverless
            });
            console.log("Connected to MongoDB successfully");
        } catch (error) {
            console.error("MongoDB connection error:", error);
            throw error;
        }
    }
};

// Import authentication middleware
const { isAuthenticated, redirectIfAuthenticated } = require("./middleware/auth");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
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

// Middleware to ensure MongoDB connection in production
app.use(async (req, res, next) => {
    try {
        await connectToMongoDB();
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        return res.status(503).json({ 
            message: "Database connection failed. Please try again later." 
        });
    }
    next();
});

const User = require("./models/user");

const PORT = process.env.PORT || 3001;

// Health check endpoint for Vercel
app.get("/api/health", (req, res) => {
    res.status(200).json({ 
        status: "OK", 
        message: "Server is running",
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
});

app.get("/create", isAuthenticated, (req, res) => {
    res.render("create");
});

const userRouter = require("./Router/user");
app.use("/", userRouter);

const userLoginRouter = require("./Router/userLogin");
app.use("/", userLoginRouter);

// Global error handler
app.use((error, req, res, next) => {
    console.error("Global error handler:", error);
    res.status(500).json({ 
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Initialize connection for local development
if (process.env.NODE_ENV !== 'production') {
    connectToMongoDB()
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
}

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
