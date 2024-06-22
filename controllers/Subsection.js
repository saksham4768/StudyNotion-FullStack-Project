const subsection = require('../models/Subsection');
const section = require('../models/Section');
const { uploadFileToCloudinary } = require('../utils/FileUploader');
require('dotenv').config();

exports.createSubSection = async(req, res)=>{
    try{

        console.log("Inside Create Sub Section");
        //Data fetch
        const{title, timeDuration, description, sectionId} = req.body;
        console.log(title , "--", timeDuration, '--', description, '--', sectionId);
        //File fetch
        const videoFile = req.files.VideoFile;
        console.log(videoFile);
        //Validation
        if(!title || !timeDuration || !description || !sectionId || !videoFile){
            return res.status(400).json({
                success: false,
                message:"Fields are manadatory",
            })
        };

        //upload file to cloudinary
        const videoUploadToCloudinary = uploadFileToCloudinary(videoFile, process.env.FOLDER_NAME);

        //create a new subsection
        const newSubSection = await subsection.create(
            {
                title: title,
                timeDuration: timeDuration,
                description: description,
                videoUrl: videoUploadToCloudinary.secure_url,
            }
        );

        //Update the subsection in section
        const updatedSection = await section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: newSubSection._id } },
            { new: true }
          ).populate("subSection");

        return res.status(200).json({
            success: true,
            message:"Subsection Created Successfully",
            newSubSection: newSubSection,
            updatedSection: updatedSection,
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message:"Error occured, while creating subsection"
        })
    }
}

exports.updatedSubSection = async (req, res) => {
    try{
        const{title, description, subSectionId} = req.body;

        const videoFileForUpdate = req.files.updateVideoFile;

        if(!subSectionId){
            return res.status(400).json({
                success: false,
                message:"For Updating the sub section Subsection ID is mandatory",
            })
        }

        //Check If Subsection ID present or not
        const subSectionDetails = await subsection.findOne({subSectionId});

        if(!subSectionDetails){
            return res.status(404).json({
                success: false,
                message:`Details not found for this ID ${subSectionId}`,
            })
        };

        if(title !== undefined){
            subSectionDetails.title = title;
        }
        if(description !== undefined){
            subSectionDetails.description = description;
        }

        if(videoFileForUpdate !== undefined){
            const video = req.files.video
            const uploadDetails = await uploadImageToCloudinary(
            video,
            process.env.FOLDER_NAME
            )
            subSectionDetails.videoUrl = uploadDetails.secure_url;
            subSectionDetails.timeDuration = `${uploadDetails.duration}`;
        }
        await subSectionDetails.save();
        return res.json({
            success: true,
            message: "Section updated successfully",
          })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message:"Error occured, while updating subsection"
        })
    }
}

//Return By me without reference
exports.deleteSubSection = async (req, res) => {
    try{

        const{subSectionId, SectionID} = req.body;

        if(!subSectionId || !SectionID){
            return res.status(400).json({
                success: false,
                message:"ID is required for deleting the subsection",
            })
        }

        //check the sectionID and subsectionID is present or not if present then delete
        const isDeleted = section.findOneAndDelete(SectionID, subSectionId);
        if(!isDeleted){
            return res.status(404).json({
                success: false,
                message:"Section Could not be deleted please check IDs"
            })
        }
        const iseletedsubSection = subsection.findOneAndDelete(subSectionId);
        //delete subsection from Subsection schema
        if(!iseletedsubSection){
            return res.status(404).json({
                success: false,
                message:"subSection Could not be deleted please check IDs"
            })
        }

        //Update section is 
        const sectionDetails = section.findById({SectionID}).populate("subSection");
        return res.status(200).json({
            success: true,
            error: err.message,
            sectionDetails:sectionDetails,
            message:"SubSection deleted successfully"
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message:"Error occured, while deleting subsection"
        })
    }
}