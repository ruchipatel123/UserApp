const express = require("express");
const User = require("../models/user");

const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();
const path = require("path");
const multer = require("multer");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post("/create", isAuthenticated, upload.single("image"), async (req, res) => {

    console.log(req.cookies.email);

    if(!req.body.name || !req.body.email || !req.file){
        return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if(existingUser){
        return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        image: `/uploads/${req.file.filename}`,
        createdBy: req.cookies.email
    });
    await user.save();
    res.redirect("/");
});  

router.get("/", isAuthenticated, async(req,res)=>{
    console.log(req.cookies.email);

    const users = await User.find({createdBy: req.cookies.email});
    console.log(users);
    res.render("home", { users });
});

router.get("/delete/:id", isAuthenticated, async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    res.redirect("/");
});

router.get("/edit/:id", isAuthenticated, async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render("edit", { user });
});

router.post("/edit/:id", isAuthenticated, upload.single("image"), async (req, res) => {
    if(!req.body.name || !req.body.email){
        return res.status(400).json({ message: "All fields are required" });
    }
    if(req.file){
    const user = await User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
            image: `/uploads/${req.file.filename}`
        });
    }else{
        const user = await User.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            email: req.body.email
        });
    }
    res.redirect("/");
});

module.exports = router;

