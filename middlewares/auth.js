const jwt = require("jsonwebtoken");
require("dotenv").config();
const user = require('../models/User');

//Authentication
exports.Authentication = async (req, res, next) =>{
    try{
        //Extract Token
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");

        //if token is missing the return response
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Token is Missing",
            })
        }

        //Verify the token
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded Token is -> ", decode);
            req.user = decode;
        }
        catch(error){
            return res.status(401).json({
                success: false,
                message: "Token is Invalid",
            });
        }
        next();
    }
    catch(err){
        return res.status(401).json({
            success: false,
            message: "Something went wrong, while validation the token",
        });
    }
}

//IsStudent
exports.IsStudent = async (req, res, next) => {
    try{

        if(req.user.accountType !== 'Student'){
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Student only",
            })
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User role can not be verified, please try again"
        })
    }
}

//IsAdmin
exports.IsAdmin = async (req, res, next) => {
    try{

        if(req.user.accountType !== 'Admin'){
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Admin only",
            })
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User role can not be verified, please try again"
        })
    }
}

//IsInstructor
exports.IsInstructor = async (req, res, next) => {
    try{

        if(req.user.accountType !== 'Instructor'){
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Instructor only",
            })
        }
        next();
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "User role can not be verified, please try again"
        })
    }
}