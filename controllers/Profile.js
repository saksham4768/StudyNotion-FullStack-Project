const profile = require('../models/Profile');
const user = require('../models/User');
const { uploadFileToCloudinary } = require('../utils/FileUploader');
require('dotenv').config();

exports.updateProfileDetails = async (req, res) =>{
    try{

        //Fetch Data
        const{dateOfBirth="", about="",gender, contactNumber=""}= req.body;

        console.log("About is ->", about);
        //getUser iD
        const userID = req.user.id;
        console.log("user is ->", userID);
        //Validation
        if(!gender || !contactNumber){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        //find Profile
        const userDetails = await user.findById(userID);
        const Profile = userDetails.additionalDetails;
        console.log("profile ID is ->",Profile)
        const profileDetails  = await profile.findById(Profile);

        console.log("Profile Details ->", about);
        console.log("About is ->", about);
        //updateProfile
        profileDetails.about = about;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        profileDetails.save();

        return res.status(200).json({
            success: true,
            profileDetails,
            message: "Profile Updated Successfully"
        }) 

    }
    catch(err){
        return res.status(500).json({
            success: false,
            message:"Failed to update profile",
            error: err.message,
        })
    }
}

exports.deleteAccount = async (req, res) =>{
    try{

        //Get User id
        const userID = req.user.id;

        //validation
        const userDetails = await user.findById(userID);
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: "User Details is not found for this ID"
            })
        }

        //Detele Profile for this ID
        const profileID = userDetails.additionalDetails;
        await profile.findByIdAndDelete(profileID);

        await user.findByIdAndDelete(userID);

        return res.status(200).json({
            success: false,
            message:"User and Profile is deleted successfully",
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message:"Failed to delete user",
            error: err.message,
        })
    }
}

exports.getUserDetails = async (req, res) =>{
    try{
        console.log("Inside getUserDetails")
        //Get Id
        const userID = req.user.id;
        console.log("User ID for to get All details", userID);
        const UserDetails = await user.findById(userID).populate('additionalDetails').exec();

        console.log("User Details", UserDetails);
        return res.status(200).json({
            success: true,
            message:"Fetch Successfully User Details",
            UserDetails: UserDetails
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message:"Failed to get AllUser Details",
            error: err.message,
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
  console.log("In Update Display Picture");
    try {
      const displayPicture = req.files.displayPicture;
      console.log("In Update Display Picture -> ", displayPicture);
      const userId = req.user.id;
      const image = await uploadFileToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image);
      const updatedProfile = await user.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      return res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};