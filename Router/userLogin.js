const express = require("express");
const mongoose = require("mongoose");
const AppUser = require("../models/appuser");
const { redirectIfAuthenticated } = require("../middleware/auth");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


router.get("/login", redirectIfAuthenticated, (req, res) => {
    res.render("login");
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if(!email || !password){
            return res.status(400).json({ message: "Email and password are required" });
        }
        
        const user = await AppUser.findOne({ email });
      
        if(!user){
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const result = await bcrypt.compare(password, user.password);
        if(result){
            console.log("User logged in successfully:", {
                id: user._id,
                name: user.name,
                email: user.email,
                loginTime: new Date().toISOString()
            });
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'Ruchi@123');
            res.cookie("token", token);
            res.cookie("email", user.email);
            res.redirect("/");
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error during login" });
    }
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.clearCookie("email");
    res.redirect("/login");
});

router.get("/register", redirectIfAuthenticated, (req, res) => {
    res.render("register");
});


router.post("/register", async (req, res) => {
    try {
        if(!req.body.name || !req.body.email || !req.body.password){
            return res.status(400).json({ message: "All fields are required" });
        }

        const { name, email, password } = req.body;
        
        // Check MongoDB connection before performing operations
        if (!mongoose.connection.readyState) {
            console.error("MongoDB connection not ready, readyState:", mongoose.connection.readyState);
            return res.status(503).json({ message: "Database connection not available. Please try again later." });
        }
        
        // Check if user already exists with timeout
        console.log("Checking if user exists with email:", email);
        const existingUser = await AppUser.findOne({ email }).maxTimeMS(15000);
        if(existingUser){
            return res.status(400).json({ message: "User already exists with this email" });
        }

        console.log("Creating new user with email:", email);
        const hash = await bcrypt.hash(password, 10);
        const user = await AppUser.create({ name, email, password: hash });
        console.log("User created successfully:", user._id);
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'Ruchi@123');
        res.cookie("token", token);
        res.redirect("/login");
    } catch (error) {
        console.error("Registration error:", error);
        
        // Handle specific MongoDB timeout errors
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            return res.status(503).json({ 
                message: "Database connection timeout. Please check your internet connection and try again." 
            });
        }
        
        if (error.name === 'MongoTimeoutError' || error.message.includes('timed out')) {
            return res.status(503).json({ 
                message: "Database operation timed out. Please try again later." 
            });
        }
        
        res.status(500).json({ message: "Internal server error during registration" });
    }
});



module.exports = router;