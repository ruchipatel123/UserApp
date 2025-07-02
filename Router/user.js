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
        console.log('File being uploaded:', file.originalname, 'Type:', file.mimetype);
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed!'), false);
            }
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware to handle multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer error:', err.message);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.redirect("/create?error=file-too-large");
        }
        return res.redirect("/create?error=upload-error");
    } else if (err) {
        console.error('File upload error:', err.message);
        return res.redirect("/create?error=invalid-file");
    }
    next();
};

router.post("/create", isAuthenticated, (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        handleMulterError(err, req, res, next);
    });
}, async (req, res) => {
    try {
        console.log("Create user request received from:", req.user.email);
        console.log("Body:", req.body);
        console.log("File:", req.file);

        if(!req.body.name || !req.body.email){
            console.log("Missing required fields");
            return res.redirect("/create?error=missing-fields");
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if(existingUser){
            console.log("User already exists");
            return res.redirect("/create?error=user-exists");
        }

        // Handle image upload - use default avatar if no image uploaded
        let imagePath = '/uploads/default-avatar.png'; // Default image
        if(req.file) {
            try {
                // Convert uploaded file to base64 for immediate display
                const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
                console.log('File uploaded successfully:', req.file.originalname);
                imagePath = base64Image;
            } catch (fileError) {
                console.error('Error processing file:', fileError);
                // Continue with default image if file processing fails
            }
        } else {
            console.log('No file uploaded, using default avatar');
        }

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            image: imagePath,
            createdBy: req.user.email
        });
        
        await user.save();
        console.log('User created successfully');
        res.redirect("/?success=user-created");
    } catch (error) {
        console.error("Error creating user:", error);
        res.redirect("/create?error=server-error");
    }
});  

router.get("/create", isAuthenticated, (req, res) => {
    res.render("create");
});

router.get("/", isAuthenticated, async(req,res)=>{
    try {
        console.log("Current user:", req.user.email);

        const users = await User.find({createdBy: req.user.email});
        console.log("Found users:", users.length);
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

// Middleware to handle multer errors for edit
const handleEditMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer error during edit:', err.message);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.redirect(`/edit/${req.params.id}?error=file-too-large`);
        }
        return res.redirect(`/edit/${req.params.id}?error=upload-error`);
    } else if (err) {
        console.error('File upload error during edit:', err.message);
        return res.redirect(`/edit/${req.params.id}?error=invalid-file`);
    }
    next();
};

router.post("/edit/:id", isAuthenticated, (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        handleEditMulterError(err, req, res, next);
    });
}, async (req, res) => {
    try {
        console.log("Edit user request received for ID:", req.params.id);
        console.log("Body:", req.body);
        console.log("File:", req.file);

        if(!req.body.name || !req.body.email){
            console.log("Missing required fields");
            return res.redirect(`/edit/${req.params.id}?error=missing-fields`);
        }
        
        const updateData = {
            name: req.body.name,
            email: req.body.email
        };
        
        if(req.file){
            try {
                // Convert uploaded file to base64 for immediate display
                const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
                console.log('New file uploaded for edit:', req.file.originalname);
                updateData.image = base64Image;
            } catch (fileError) {
                console.error('Error processing file during edit:', fileError);
                // Continue without updating image if file processing fails
            }
        } else {
            console.log('No new file uploaded, keeping existing image');
        }
        // If no new file uploaded, keep existing image (don't update image field)
        
        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!user) {
            console.log("User not found for ID:", req.params.id);
            return res.redirect("/?error=user-not-found");
        }
        
        console.log('User updated successfully');
        res.redirect("/?success=user-updated");
    } catch (error) {
        console.error("Error updating user:", error);
        res.redirect(`/edit/${req.params.id}?error=server-error`);
    }
});

module.exports = router;

