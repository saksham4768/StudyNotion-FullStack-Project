const user = require('../models/User');
const ratingReview = require('../models/RatingAndReview');
const course = require('../models/Course');
const { default: mongoose } = require('mongoose');
require('dotenv').config();

exports.createRating = async (req, res) =>{
    try{

        //get User ID
        const userID = req.user.id;

        //get Course ID
        const {courseID,rating,review} = req.body;

        if(!userID || !courseID || !rating || !review){
            return res.status(400).json({
                success: false,
                message: 'Required All fields for rating'
            })
        }

        //check if user is enrolled in the course or not

        //const courseDetails = await course.findOne({_id:courseID, studentsEnrolled:{$elemMatch: {$eq: userID}}});
        const courseDetails = await course.findById(courseID).populate('ratingAndReview');
        if(!courseDetails){
            return res.status(400).json({
                success: false,
                message: `Course Details could not found for this ID ${courseID}`
            })
        }
        const uuid = mongoose.Types.ObjectId(userID);
        if(!courseDetails.studentsEnrolled.includes(uuid)){
            return res.status(401).json({
                success: false,
                message: `Student is not enrolled for this course ID ${courseID}`
            })
        }

        //Check if user is already giving the review or not
        //const ratingReview = await ratingReview.findOne({user:userID, course:CourseID});
        if(courseDetails.ratingAndReview.includes(uuid)){
            return res.status(401).json({
                success: false,
                message: `Already give the Rating for this course ${courseID}`
            })
        }
        //Create entry in Rating AND review schema
        const RatingData = await ratingReview.create({
            rating, review,
            course: courseID,
            user: userID,
        });
        
        //Update rating also in course schema
        await course.findByIdAndUpdate({_id: courseID, ratingAndReview:RatingData._id});

        return res.status(200).json({
            success: true,
            message: 'Rating Created Successfully'
        })

    } 
    catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: 'Error occured , While save the rating in DB'
        })
    }
}

exports.getAvgRating = async (req, res) =>{
    try{
        
        //get Course ID
        const courseID = req.body.courseid;

        //calculate avg
        const result = await ratingReview.aggregate([
            {
                $match:{
                    course: mongoose.Types.ObjectId(courseID),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating: {$avg : "Rating"},
                },
            },
        ]);

        if(result.length === 0){
            return res.status(200).json({
                success: true,
                message: 'Average Rating is zero, no rating present'
            })
        }
        if(result.length > 0){
            return res.status(200).json({
                success: true,
                message: 'Average Rating Calculate Successfully',
                AverageRating: result[0].averageRating,
            })
        }
    }
    catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: 'Error occured , While Calculate the Average Rating'
        })
    }
}

exports.getAllRatingAndReview = async (req, res) => {
    try{

        const AllRating = ratingReview.find({}).sort({rating:"desc"}).populate({
            path:"user",
            select:"firstName lastName email image",
        }).populate({
            path:"course",
            select:"courseName",
        }).exec();

        return res.status(200).json({
            success: true,
            message: 'All Rating fetched Successfully',
            data: AllRating,
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message: 'Error occured , while Fetching all rating and review'
        })
    }
}