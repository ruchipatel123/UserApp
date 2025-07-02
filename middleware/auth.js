const jwt = require("jsonwebtoken");
const AppUser = require("../models/appuser");

// Middleware to check if user is authenticated
const isAuthenticated = async (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.redirect("/login");
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Ruchi@123');
        
        // Fetch full user data from database
        const user = await AppUser.findById(decoded.id);
        if (!user) {
            res.clearCookie("token");
            res.clearCookie("email");
            return res.redirect("/login");
        }
        
        req.user = {
            id: user._id,
            email: user.email,
            name: user.name
        };
        next();
    } catch (error) {
        // Invalid token, clear it and redirect to login
        res.clearCookie("token");
        res.clearCookie("email");
        return res.redirect("/login");
    }
};

// Middleware to redirect authenticated users away from login/register pages
const redirectIfAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET || 'Ruchi@123');
            return res.redirect("/");
        } catch (error) {
            // Invalid token, clear it and continue
            res.clearCookie("token");
        }
    }
    next();
};

module.exports = {
    isAuthenticated,
    redirectIfAuthenticated
}; 