const jwt = require("jsonwebtoken");

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.redirect("/login");
    }
    
    try {
        const decoded = jwt.verify(token, 'Ruchi@123');
        req.user = decoded;
        next();
    } catch (error) {
        // Invalid token, clear it and redirect to login
        res.clearCookie("token");
        return res.redirect("/login");
    }
};

// Middleware to redirect authenticated users away from login/register pages
const redirectIfAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    
    if (token) {
        try {
            jwt.verify(token, 'Ruchi@123');
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