const OTP = require('../models/OTP');
const user = require('../models/User');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const profileDetails = require('../models/Profile');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//sendOTP for Sign UP
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
        let otp = otpGenerator.generate(6,{
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        console.log("Generate OTP is", otp);
        //Check OTP is unique or not
        let isUnique = await OTP.findOne({otp});

        //if not unique the regenrate oTP till oTP is not unique -> BAD Practice
        while(isUnique){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });

            isUnique = await OTP.findOne({otp});
        }
        
        //create object of OTP and entry saved in DB 
        let OTPPayload = {email, otp};

        let OTPBody = OTP.create(OTPPayload);
        console.log(OTPBody);
        res.status(200).json({
            success: true,
            message: "OTP Generated Successfully",
            otp,
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
            otp,
        } = req.body;

        //Validate the data
        if(!firstName || !lastName || !email || !password || !confirmpassword){
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
        //Find most recent 
        //-> -1 means descending order , 1 means ascendint order, createdAt: -1 means  sort by latest time in descending order
        //-> limit (1) means its return only one document but here it is redundant bacause findOne only return one document
        const recentOTP = await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        console.log("Recent OTP Is -> ", recentOTP);
        if(recentOTP.length === 0){
            //OTP Not Found
            return res.status(400).json({
                success: false,
                message: "OTP Not Found",
            });
        }
        else if(otp !== recentOTP.otp){
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
            accountType,
            additionalDetails:(AdditionalDetails)._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        };

        const userData = await user.create(signUPData);
        
        console.log("User Data is -> ", userData);
        return res.status(200).json({
            success: true,
            userData,
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
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });
            ExistingUser.token = token;
            ExistingUser.password = undefined;
            console.log("token while login the user -> ", token);
            //Create Cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true,
            }
            return res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                ExistingUser,
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
            err: err.message
        });
    }
}
//Change Password
exports.changePassword = async (req, res) =>{
    try{
        //Fetch Email for Change password
        const email = req.body.email;

        //Check this is present in DB or not
        const exisitngUser = await user.findOne({email});
        if(!exisitngUser){
            return res.status(404).json({
                success: 'false',
                message: 'User Not Found',
            })
        }

        //when user present then next page show in which field is old password , newpassword, confirm new password
        const {oldPassword, newPassword, confirmNewPassword} = req.body;

        if(!oldPassword || !newPassword || !confirmNewPassword){
            return res.status(401).json({
                success: 'false',
                message: 'Data Missing',
            })
        }

        //Check old password is match with respective to user emailed
        const MatchedPassword = await bcrypt.compare(oldPassword, exisitngUser.password);
        if(!MatchedPassword){
            return res.status(401).json({
                success: 'false',
                message: 'Password is Not Matched',
            })
        }

        //if old password is matched with existing password then check if new password and confirm password matched or not
        if(newPassword !== confirmNewPassword){
            return res.status(401).json({
                success: 'false',
                message: 'New Password and Confirm New Password Should be the same',
            })
        }
        
        //bcrypt the password and update in DB;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //Save in DB
        const response = user.updateOne({email : email}, {$set: {password : hashedPassword}},{new: true});
        return res.status(200).json({
            success: 'true',
            message: 'password updated successfully',
            response: 'response'
        })
    }
    catch(err){
        return res.status(500).json({
            success: 'false',
            message: 'Something went wrong, while updating the password',
            error:err.message
        })
    }
}
