const { default: mongoose } = require('mongoose');
const course = require('../models/Course');
const user = require('../models/User');
const { instance } = require('../config/razorpay');
const mailSender = require('../utils/mailSender');

exports.caturePayment = async (req, res) => {
    try{

        //get userID
        const {userID} = req.body;
        //get courseID
        const courseID = req.body.courseID;
        //Validation
        //Valid CourseID
        if(!userID){
            return res.status(400).json({
                success:false,
                message:"User ID can not be Empty, Have Some Value",
            })
        }
        //Valid CourseDetails
        try{
            let courseDetails = await course.findById(courseID);
            if(!courseDetails){
                return res.status(400).json({
                    success:false,
                    message:"User Details is not Found, Something wrong",
                })
            }

            //check user already enrolled for the course or pay for the course
            //in course the user id is present in form of object id but here i have the id in string sor first convert
            //string to objectID
            const uuid = mongoose.Types.ObjectId(userID); 

            //student Enrolled is array
            if(courseDetails.studentsEnrolled.includes(uuid)){
                return res.status(200).json({
                    success:false,
                    message:"User is Already Enrolled in this course",
                })
            }
        }
        catch(error){
            return res.status(404).json({
                success:false,
                message:"Error Occured While fetching Course Details",
            })
        }
        //order create
        const Amount = course.price;
        const Currency = 'INR';

        const options = {
            Amount: Amount * 100,
            Currency,
            reciept: Math.random(Date.now()).toString(),
            notes:{
                courseID : courseID,
                userID
            }
        }

        try{

            //Initiate the payment using Razorpay
            const PaymentResponse = await instance.orders.create(options);
            console.log(PaymentResponse);

            //Return Response
            return res.status(200).json({
                success:true,
                CourseName: courseDetails.CourseName,
                CourseDescription: courseDetails.CourseDescription,
                ThumbNail: courseDetails.ThumbNail,
                OrderID: PaymentResponse.id,
                Currency: PaymentResponse.Currency,
                Amount: PaymentResponse.Amount
            })
        }
        catch(error){
            return res.status(500).json({
                success:false,
                message:"Internal Server Error, While Initiate the payment",
                error:err.message,
            })
        }
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error, While Payment Process",
            error:err.message,
        })
    }
}

//Verify Signature and server secret key

exports.verifySignature = async (req , res) =>{
    try{

        const webHookSecret = '12345678';

        //In request sent headers from Razorpay side
        const signature = req.headers["x-razorpay-signature"];

        const shasum = crypto.createHMAC('SHA256', webHookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if(signature === digest){

            console.log("Signature is Authorised");

            const{courseID, userID} = req.body.payload.payment.entity.notes;

            try{
                //fullfill the action

                //find the course and enroll the student in it
                const enrolledcourse = await course.findOneAndUpdate({_id: courseID},{
                    $push:{
                        studentsEnrolled: userID
                    }
                },{new: true});

                if(!enrolledcourse){
                    return res.status(404).json({
                        success: false,
                        message: "Course Not Found while verifying the signature"
                    })
                }
                console.log(enrolledcourse);

                //find the student and add the course to their list of enrolled courses
                const enrolledStudents = await user.findOneAndUpdate({_id:userID},{
                    $push:{courses: courseID}
                },{new: true});

                console.log(enrolledStudents);

                //Send Confirmation mail to user 
                const emailResponse = await mailSender(
                    enrolledStudents.email,
                    "Congratulations from StudyNotion",
                    "You are onboarded into the StudyNotion course"
                );
                console.log("Email send to the user after payment Authorised -> ", emailResponse);

                return res.status(200).json({
                    success: true,
                    message: "Signature Verified and Student Enrolled in Course Successfully",
                })
            }
            catch(err){
                return res.status(500).json({
                    success: false,
                    message: "Some thing went wrong while, course allocated to the user !",
                })
            }
        }
        else{
            return res.status(401).json({
                success: false,
                message: "Signature is Not Verified",
            })
        }
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Some thing went wrong while, Verifying the signature!",
        })
    }
}