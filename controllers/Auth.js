const OTP = require('../models/OTP');
const user = require('../models/User');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const profileDetails = require('../models/Profile');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//sendOTP
exports.sendOTP = async (req, res) =>{
    try{

        //Fetch Email from Request Body
        const{email} = req.body;

        //Check user from this email already exit or not
        const ExistingUser = await user.findOne({email});

        if(ExistingUser){
            res.status(401).json({
                success: false,
                message: "User is Already Exist",
            })
        }

        //Geneate the OTP from otp-Generator
        let OTP = otpGenerator.generate(6,{
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        console.log("Generate OTP is", OTP);
        //Check OTP is unique or not
        let isUnique = await OTP.findOne({OTP});

        //if not unique the regenrate oTP till oTP is not unique -> BAD Practice
        while(isUnique){
            OTP = otpGenerator.generate(6,{
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });

            isUnique = await OTP.findOne({OTP});
        }
        
        //create object of OTP and entry saved in DB 
        let OTPPayload = {email, OTP};

        let OTPBody = OTP.create(OTPPayload);

        res.status(200).json({
            success: true,
            message: "OTP Generated Successfully",
            OTP,
        })
    }
    catch(error){
        console.log("Error in Generate OTP", error.message);
        return res.status(500).json({
            success: false,
            message: "Something Went Wrong",
        });
    }
}
//SignUp
exports.signUp = async (req, res) =>{
    try{
        //fetch The Data from req.body
        const{
            firstName,
            lastName,
            email,
            password,
            confirmpassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;

        //Validate the data
        if(!firstName || !lastName || !email || !password || !confirmpassword || !contactNumber){
            return res.status(403).json({
                success: false,
                message: "All field is Required",
            })
        }

        //Check user from this email already exit or not
        const ExistingUser = await user.findOne({email});

        if(ExistingUser){
            res.status(401).json({
                success: false,
                message: "User is Already Exist",
            })
        }
        //Check password is same or not
        if(password !== confirmpassword){
            return res.status(403).json({
                success: false,
                message: "Password and Confirm Password Should be the same",
            })
        }

        //Find most recent OTP
        const recentOTP = OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        console.log("Recent OTP Is -> ", recentOTP);

        if(recentOTP.length === 0){
            //OTP Not Found
            return res.status(400).json({
                success: false,
                message: "OTP Not Found",
            });
        }
        else if(otp !== recentOTP){
            //Invalid OTP
            return res.status(400).json({
                success: false,
                message: "OTP is INVALID",
            });
        }

        //Hashed the PASSWORD
        let hashedPassword = await bcrypt.hash(password, 10);
        //Create Entry in DB and save data in DB'
        const AdditionalDetails = await profileDetails.create({
            gender: null,
            about: null,
            contactNumber: null,
            dateOfBirth: null
        });

        let signUPData = {firstName,
            lastName,
            email,
            password:hashedPassword,
            confirmpassword:hashedPassword,
            accountType,
            contactNumber,
            additionalDetails:(AdditionalDetails)._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        };

        const userData = user.create({signUPData});
        
        console.log("User Data is -> ", userData);
        return res.status(200).json({
            success: true,
            message: "User Signed Up Successfully, Enjoy!",
        });
    }
    catch(error){
        console.log("AWW! Something Went Wrong", error.message);
        return res.status(500).json({
            success: false,
            message: "User Can not be registered",
        });
    }
}
//Login
exports.login = async (req, res) =>{
    try{

        //fetch Data from req.body
        const{email, password} = req.body;

        //Validate the data
        if(!email || !password){
            res.status(401).json({
                success: false,
                message: "Both Fields are required",
            })
        }
        //check user is exit or not
        const ExistingUser = await user.findOne({email}).populate("additionalDetails");

        if(!ExistingUser){
            res.status(401).json({
                success: false,
                message: "User is not Exist, Firslty registered the user",
            })
        }

        //Generate JWT after matching the password
        let DBPassword = ExistingUser.password;
        let isMatched = await bcrypt.compare(password, DBPassword);

        if(isMatched){
            const payload = {
                email: ExistingUser.email,
                id: ExistingUser._id,
                accountType: ExistingUser.accountType,
            }
            const token = jwt.sign(payload, JWT_SECRET, {
                expiresIn: "2h",
            });
            ExistingUser.token = token;
            ExistingUser.password = undefined;

            //Create Cookie and send response
            const options = {
                expires: new Date(Date.now() * 3*24*60*60*1000),
                httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message:"Logged in Successfully",
            })
        }
        else{
            return res.status(401).json({
                success: false,
                message: "Password is Incorrect",
            });
        }
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: "User is not logged In kindly see the login details",
        });
    }
}
//Change Password
exports.changePassword = async (req, res) =>{

}
