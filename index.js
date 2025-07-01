require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");


mongoose.connect("mongodb+srv://ruchip:Ruchi@456@cluster0.85467.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");



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
        origin: ["http://localhost:3000","https://user-app-nine-beta.vercel.app/", "https://user-module-frontend.vercel.app"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
