require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ruchip:ruchip@cluster0.ovwrjkz.mongodb.net";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
  },
});




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
        origin: ["http://localhost:3000","https://user-app-nine-beta.vercel.app/"],
        methods: ["POST", "GET"],
        credentials: true
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

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await client.connect();
    console.log("Connected to MongoDB");
});
