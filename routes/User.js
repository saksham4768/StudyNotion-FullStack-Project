// Import the required modules
const express = require("express");
const router = express.Router();


// Import the required controllers and middleware functions
const { login, signUp, sendOTP, changePassword } = require("../controllers/Auth");
const { resetPasswordToken, resetPassword } = require("../controllers/ResetPassword");

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

//Route login User
router.post("/login", login);

//Route for user Sign Up
router.post("/signUp", signUp);

//Route for the sending otp for user's email
router.post("/sendotp", sendOTP);

//Route for changing the password
router.post("/changePassword", changePassword);

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

//Route for Generating the Reset Password Token
router.post("/reset-password-token", resetPasswordToken);

//Route for user's resetting after verification
router.post("/reset-password", resetPassword);

// Export the router for use in the main application
module.exports = router