const user = require('../models/Course');
const Category = require('../models/Category');
const course = require('../models/Course');
const imageUpload = require('../utils/FileUploader');
require('dotenv').config();

exports.createCourse = async(req, res) =>{
    try{

        //Fetch Data
        const{courseName, courseDescription, whatWillYouLearn, price, category} = req.body;

        //Fetch File
        const {thumbNail} = req.files.thumbNailImage;

        //Validation
        if(!courseName || !courseDescription || !whatWillYouLearn || !price || !category || !thumbNail){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        //fetch details of instructor becz for each course instructor data required
        const userId = req.user.id;
        const instructorDetails = await user.findById({userId});
        console.log('Instructor Details ->', instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: "Instructor Details not Found"
            })
        }
        
        //check given category is valid or not
        const categoryDetails = await Category.findById({category});

        if(!categoryDetails){
            return res.status(404).json({
                success: false,
                message: "category Details not Found"
            })
        }

        //upload Image to Cloudinary
        const Image = await imageUpload(thumbNail, process.env.FOLDER_NAME);

        //Create an Entry for new course
        const newCourse = await course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatWillYouLearn:whatWillYouLearn,
            price,
            category:categoryDetails._id,
            thumbNail: Image.secure_url
        },{new:true});

        //Add the new course in user schema
        const updatedUser = await user.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    course: newCourse._id
                }
            },
            {new:true}
        );
        console.log("After Update the course user is -> ", updatedUser);

        //update the Course in Category Schema
        const updatedCategory = await Category.findByIdAndUpdate(
            {_id:categoryDetails._id},
            {
                $push:{
                    course: newCourse._id
                }
            },
            {new:true},
        );

        console.log("After update the course the category schema is -> ", updatedCategory);

        return res.status(200).json({
            success: true,
            message: "Course Created Successfully",
            course: newCourse,
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message:"Failed to Create Course",
            error: err.message,
        })
    }
}

exports.getAllCourses = async (req, res) =>{
    try{

        const AllCourses = await course.find({},{
            courseName:true,
            price:true,
            thumbNail:true,
            ratingAndReview:true,
            studentsEnrolled:true,
            instructor:true
        }).populate("instructor").exec();

        return res.status(200).json({
            success: true,
            message:"All Courses fetch Successfully",
            Coureses: AllCourses
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message:"Cannot fetch data of All Courses",
            error: err.message,
        })
    }
}

exports.getCourseDetails = async (req,res) =>{
    try{

        //get ID
        const {courseID} = req.body;

        //get Course Details
        const courseDetails = course.findById(courseID).populate({
                                                path:"instructor",
                                                populate:{
                                                    path:"additionalDetails"
                                                }
                                            }).populate({
                                                path:"courseContent",
                                                populate:{
                                                    path:"subSection"
                                                }
                                            }).populate("category")
                                            .populate("ratingAndReview").exec();

        if(!courseDetails){
            return res.status(404).json({
                success: false,
                error: err.message,
                message: 'Course Details could not found'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'Course Details fetch successfully',
            courseDetails: courseDetails
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: 'Error occured , While fetching course details'
        })
    }
}