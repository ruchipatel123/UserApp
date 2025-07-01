const express = require("express");
const AppUser = require("../models/appuser");
const { redirectIfAuthenticated } = require("../middleware/auth");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


router.get("/login", redirectIfAuthenticated, (req, res) => {
    res.render("login");
});

router.post("/login", async (req, res) => {
    
    const { email, password } = req.body;
    const user = await AppUser.findOne({ email });
  
    if(!user){
        return res.status(401).json({ message: "Invalid credentials" });
    }
    
    
    bcrypt.compare(password, user.password, (err, result) => {
        if(result){
            console.log("User logged in successfully:", {
                id: user._id,
                name: user.name,
                email: user.email,
                loginTime: new Date().toISOString()
            });
            const token = jwt.sign({ id: user._id }, 'Ruchi@123');
            res.cookie("token", token);
            res.cookie("email", user.email);
            res.redirect("/");
        }
        else{
            return res.status(401).json({ message: "Invalid credentials" });
        }
    });
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});

router.get("/register", redirectIfAuthenticated, (req, res) => {
    res.render("register");
});


router.post("/register",  (req, res) => {
    if(!req.body.name || !req.body.email || !req.body.password){
        return res.status(400).json({ message: "All fields are required" });
    }
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
        if(err){
            return res.status(500).json({ message: "Error hashing password" });
        }
        const { name, email, password } = req.body;
            //const existingUser = await AppUser.findOne({ email });

            const user = await AppUser.create({ name, email, password: hash });
            const token = jwt.sign({ id: user._id }, 'Ruchi@123');
            res.cookie("token", token);
            res.redirect("/login");
    });
});



module.exports = router;