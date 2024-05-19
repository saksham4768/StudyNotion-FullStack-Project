const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({

    courseName:{
        type: String,
        required: true,
    },
    courseDescription:{
        type: String,
        required: true,
    },
    instructor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    whatWillYouLearn:{
        type: String,
    },
    courseContent:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Section",
        }
    ],
    ratingAndReview:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"RatingAndReview",
        }
    ],
    price:{
        type:Number,
    },
    thumbNail:{
        type: Number,
    },
    tag:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Tag",
    },
    studentsEnrolled:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
        }
    ]
});

module.exports = mongoose.model("Course", courseSchema);