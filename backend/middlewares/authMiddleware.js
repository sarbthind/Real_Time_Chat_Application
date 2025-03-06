const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const asyncHandler = require('express-async-handler');

//protecting routes
exports.protect = asyncHandler( async(req, res, next) => {
    //1. Read the token & check if it exist
    const testToken = req.headers.authorization;
    let token;
    if(testToken && testToken.startsWith('Bearer')){
        try {
            token = testToken.split(' ')[1];
            
            const decodeToken =  jwt.verify(token, process.env.JWT_SECRET); 
            req.user = await User.findById(decodeToken.id).select("-password");
            next();

        } catch (error) {
            res.status(401);
            throw new Error(`Not authorized, token failed`);
        }
    }
    
    if(!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }
});