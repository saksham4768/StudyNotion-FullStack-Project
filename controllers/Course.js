const user = require('../models/User');
const Category = require('../models/Category');
const course = require('../models/Course');
const { uploadFileToCloudinary } = require('../utils/FileUploader');
require('dotenv').config();

exports.createCourse = async(req, res) =>{
    try{
        console.log("Inside the create Course")
        //Fetch Data
        const{courseName, courseDescription, whatWillYouLearn, price, category} = req.body;

        //Fetch File
        const thumbNail = req.files.thumbNailImage;

        console.log(courseName , "--", courseDescription, "--", whatWillYouLearn, "--", price, "--", category, "--", thumbNail);
        //Validation
        if(!courseName || !courseDescription || !whatWillYouLearn || !price || !category || !thumbNail){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        //fetch details of instructor becz for each course instructor data required
        const userId = req.user.id;
        console.log("user ID is ->", userId);
        const instructorDetails = await user.findById(userId);
        console.log('Instructor Details ->', instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: "Instructor Details not Found"
            })
        }
        
        //check given category is valid or not
        const categoryDetails = await Category.findById(category);

        if(!categoryDetails){
            return res.status(404).json({
                success: false,
                message: "category Details not Found"
            })
        }

        //upload Image to Cloudinary
        const Image = await uploadFileToCloudinary(thumbNail, process.env.FOLDER_NAME);

        console.log("ThumbNail Image Response is -> ", Image);
        //Create an Entry for new course
        const newCourse = await course.create({
            courseName:courseName,
            courseDescription:courseDescription,
            instructor: instructorDetails._id,
            whatWillYouLearn:whatWillYouLearn,
            price:price,
            category:categoryDetails._id,
            thumbNail: Image.secure_url
        });

        console.log("Course is Added is->", newCourse);
        //Add the new course in user schema
        const updatedUser = await user.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id
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

        console.log("Inside the getCourse Details");
        //get ID
        const {courseID} = req.body;

        console.log("Course ID is->", courseID);
        //get Course Details
        const courseDetails = await course.findById({_id: courseID}).populate({
                                                path:"instructor",
                                                populate:{
                                                    path:"additionalDetails"
                                                }
                                            }).populate({
                                                path:"courseContent",
                                                populate:{
                                                    path:"subSection"
                                                }
                                            }).populate("category").exec();

        console.log("Course Details is ->", courseDetails);
        if(!courseDetails){
            return res.status(404).json({
                success: false,
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