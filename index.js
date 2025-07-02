require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

// MongoDB connection string - use environment variable or fallback
const uri = process.env.MONGODB_URI || "mongodb+srv://ruchip:ruchip@cluster0.ovwrjkz.mongodb.net/userapp?retryWrites=true&w=majority";




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

// Connect to MongoDB using Mongoose
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to MongoDB successfully");
})
.catch((error) => {
    console.error("MongoDB connection error below:", error);
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export the app for Vercel
module.exports = app;