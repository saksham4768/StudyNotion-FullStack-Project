// Import the required modules
const express = require("express");
const { Authentication, IsStudent } = require("../middlewares/auth");
const { deleteAccount, updateProfileDetails, getUserDetails, getEnrolledCourses, updateDisplayPicture } = require("../controllers/Profile");
const router = express.Router();




// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

//Delete User Profile Account
router.delete("/deleteProfile", Authentication, IsStudent, deleteAccount);

//Update Profile
router.put("/updateProfile", Authentication, IsStudent, updateProfileDetails);

//get All User Details
router.get("/getUserDetails",Authentication, getUserDetails);

// Get Enrolled Courses
router.get("/getEnrolledCourses", Authentication, getEnrolledCourses);

//Update Prfile Display Picture
router.put("/updateDisplayPicture", Authentication, updateDisplayPicture);

// Export the router for use in the main application
module.exports = router


