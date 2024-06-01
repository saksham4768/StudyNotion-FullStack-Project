// Import the required modules
const express = require("express");
const { createCourse, getAllCourses, getCourseDetails } = require("../controllers/Course");
const router = express.Router();

//Controllers
const { createSection, updateSection, deleteSection } = require("../controllers/Section");
const { deleteSubSection, createSubSection } = require("../controllers/Subsection");
const { createCategory, getallCategory, categoryPageDetails } = require("../controllers/Category");
const { createRating, getAvgRating, getAllRatingAndReview } = require("../controllers/RatingAndReview");

// Importing Middlewares
const { Authentication, IsInstructor, IsAdmin, IsStudent } = require("../middlewares/auth");

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Instructors
router.post("/createCourse", Authentication, IsInstructor, createCourse);

//Add a Section to a Course
router.post("/createSection", Authentication, IsInstructor, createSection);

//Update a Section 
router.put("/updateSection", Authentication, IsInstructor, updateSection);

//Delete a section
router.delete("/deleteSection", Authentication, IsInstructor, deleteSection);

//Edit SubSection
router.put("/updateSubSection", Authentication, IsInstructor, updateSection);

//Delete Sub Section
router.delete("/deleteSubSection", Authentication, IsInstructor, deleteSubSection);

//Add a Subsection to a Section
router.post("/createSubSection", Authentication, IsInstructor, createSubSection);

//get All Registered Courses
router.get("/getAllCourses",getAllCourses);

//Get Details for Specific Course
router.get("/getCourseDetails", getCourseDetails);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************

// Category can Only be Created by Admin
router.post("/createCategory", Authentication, IsAdmin, createCategory);

//Show All Category Which is Present
router.get("/showAllCategories", getallCategory);

//get Specific Category Details with Courses
router.get("/getCategoryPageDetails", categoryPageDetails);


// ********************************************************************************************************
//                                      Rating and Review (only for Students)
// ********************************************************************************************************

//Create Rating by Students
router.post("/createRating", Authentication, IsStudent, createRating);

//Get AverageRating
router.get("/getAvhRating", getAvgRating);

//get All Ratinf with Reviews
router.get("/getAllRatingReviews", getAllRatingAndReview);

// Export the router for use in the main application
module.exports = router
