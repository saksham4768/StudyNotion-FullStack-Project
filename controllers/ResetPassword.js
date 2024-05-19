const user = require('../models/User');
const mailsender = require('../utils/mailSender');
const bcrypt = require('bcrypt');
//ResetPasswordToken
exports.resetPasswordToken = async (req, res) =>{
    try{
        //get Email from request body
        const email = req.body.email;

        //Check user is exist or not
        const ExistingUser = await user.findOne({email}).populate("additionalDetails");

        if(!ExistingUser){
            res.status(401).json({
                success: false,
                message: "User is not Exist, Firslty registered the user",
            })
        }

        //generate Token
        const token = crypto.randomUUID();
        //update user by token and expiration time
        const updatedDetails = await user.findOneAndUpdate({email: email},
            {
                token: token,
                resetPasswordExpires: Date.now + 5*60*1000
            },
            {new: true}
        );

        //create url
        const url = `http://localhost:3000/update-password/${token}`;
        //send mail containing the url
        await mailsender(email, 
            "Password Reset Link",
            `Password Reset Link : ${url}`
        );

        return res.status(200).json({
            success: true,
            message: "Email sent successfully please check email and reset the password"
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: "Something Went Wrong, Please try again"
        })
    }
}

//Reset Password
exports.resetPassword = async (req, res) =>{
    try{
        //get email from req body
        const{password, confirmPassword, token} = req.body;

        //Validation
        if(password !== confirmPassword){
            return res.json({
                success: false,
                message: "Password is not matched, please Re-Enter the Password",
            })
        }

        //get userDetails from DB using token
        const userDetails = await user.findOne({token: token});
        
        //if no-entry invalid Token
        if(!userDetails){
            return res.json({
                success: false,
                message:"Token is Invalid",
            })
        }

        //token time check
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success: false,
                message:"Token is expired, Please Re-Generate the token",
            })
        }

        //hash pwd
        const hashedPassword = bcrypt.hash(password, 10);

        //password update
        await user.findOneAndUpdate(
            {token : token},
            {password: hashedPassword},
            {confirmPassword: hashedPassword},
            {new:true},
        );

        //return response 
        return res.status(200).json({
            success: true,
            message: "Password Reset Successfully, Enjoy!"
        })
    }
    catch(err){
        return res.status(500).json({
            success: true,
            message: "Something went wrong, While Reset the Password",
        })
    }
}