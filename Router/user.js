const express = require("express");
const User = require("../models/user");

const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();
const path = require("path");
const multer = require("multer");


// Use memory storage for Vercel compatibility
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

router.post("/create", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
        console.log(req.cookies.email);

        if(!req.body.name || !req.body.email){
            return res.status(400).json({ message: "Name and email are required" });
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if(existingUser){
            return res.status(400).json({ message: "User already exists" });
        }

        // Handle image upload - make it optional for Vercel compatibility
        let imagePath = '/uploads/default-avatar.png'; // Default image
        if(req.file) {
            // For now, we'll use a placeholder since Vercel doesn't support file uploads to disk
            // In production, you'd upload to cloud storage (Cloudinary, AWS S3, etc.)
            imagePath = '/uploads/user-avatar.png';
        }

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            image: imagePath,
            createdBy: req.cookies.email
        });
        
        await user.save();
        res.redirect("/");
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});  

router.get("/", isAuthenticated, async(req,res)=>{
    try {
        console.log(req.cookies.email);

        const users = await User.find({createdBy: req.cookies.email});
        console.log(users);
        res.render("home", { users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).render("home", { users: [], error: "Error loading users" });
    }
});

router.get("/delete/:id", isAuthenticated, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect("/");
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).redirect("/?error=delete-failed");
    }
});

router.get("/edit/:id", isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).redirect("/?error=user-not-found");
        }
        res.render("edit", { user });
    } catch (error) {
        console.error("Error fetching user for edit:", error);
        res.status(500).redirect("/?error=fetch-failed");
    }
});

router.post("/edit/:id", isAuthenticated, upload.single("image"), async (req, res) => {
    try {
        if(!req.body.name || !req.body.email){
            return res.status(400).json({ message: "Name and email are required" });
        }
        
        const updateData = {
            name: req.body.name,
            email: req.body.email
        };
        
        if(req.file){
            // For Vercel compatibility, use placeholder image
            updateData.image = '/uploads/user-avatar.png';
        }
        
        const user = await User.findByIdAndUpdate(req.params.id, updateData);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.redirect("/");
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error during update" });
    }
});

module.exports = router;

