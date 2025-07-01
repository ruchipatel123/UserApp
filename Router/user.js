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
    },
    fileFilter: (req, file, cb) => {
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

router.post("/create", isAuthenticated, (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            console.error("File upload error:", err.message);
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        console.log(req.cookies.email);

        if(!req.body.name || !req.body.email){
            return res.status(400).json({ message: "Name and email are required" });
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if(existingUser){
            return res.status(400).json({ message: "User already exists" });
        }

        // Handle image upload - use default avatar if no image uploaded
        let imagePath = '/uploads/default-avatar.png'; // Default image
        if(req.file) {
            // Convert uploaded file to base64 for immediate display
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            console.log('File uploaded:', req.file.originalname);
            imagePath = base64Image;
        } else {
            console.log('No file uploaded, using default avatar');
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

router.post("/edit/:id", isAuthenticated, (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            console.error("File upload error:", err.message);
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        if(!req.body.name || !req.body.email){
            return res.status(400).json({ message: "Name and email are required" });
        }
        
        const updateData = {
            name: req.body.name,
            email: req.body.email
        };
        
        if(req.file){
            // Convert uploaded file to base64 for immediate display
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            console.log('New file uploaded for edit:', req.file.originalname);
            updateData.image = base64Image;
        }
        // If no new file uploaded, keep existing image (don't update image field)
        
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

