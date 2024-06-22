const section = require('../models/Section');
const course = require('../models/Course');
require('dotenv').config();

exports.createSection = async(req, res) =>{
    try{

        console.log("Inside Create Section");
        //data fetch
        const{sectionName, courseId} = req.body;
        console.log("Section Name -> ", sectionName, " Course ID is ->", courseId);
        //validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message:"Fields are manadatory",
            })
        };

        //create section
        const newSection = await section.create({sectionName:sectionName});
        console.log("New Section is->", newSection);
        //update course
        const updatedCourse = await course.findByIdAndUpdate(
            {_id:courseId},
            {
                $push:{
                    courseContent: newSection._id
                },
            },{new:true}
        ).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            },
        })
        .exec();
        console.log("Update Course when create a section -> ", updatedCourse);
        return res.status(200).json({
            success: true,
            message:"Section Created Successfully",
            updatedCourse: updatedCourse
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message:"Error occured, while creating section"
        })
    }
}

exports.updateSection = async (req, res) =>{
    try{

        //Fetch Data
        const {sectionName,sectionId} = req.body;

        //validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success: false,
                message:"Data can not be Empty"
            })
        };

        //Update in section
        const updatedSection = await section.findByIdAndUpdate(
            {_id:sectionId},
            {
                $set:{
                    sectionName: sectionName
                }
            },{new:true}
        );

        return res.status(200).json({
            success: true,
            message:"Section Updated Successfully",
            updatedSection: updatedSection
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message:"Error occured, while update section"
        })
    }
}

exports.deleteSection = async(req,res) =>{
    try{
        //data fetch
        const {sectionId, courseId} = req.body;

        if(!sectionId || !courseId){
            return res.status(400).json({
                success: false,
                message:"Fields are manadatory",
            })
        }

        //delete the section from course schema
        await course.findByIdAndDelete(courseId, {courseContent:sectionId});

        //delete the section from section schema
        await section.findByIdAndDelete(sectionId);

        return res.status(200).json({
            success: true,
            message:"Section Deleted Successfully"
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            error: err.message,
            message:"Error occured, while deleting section"
        })
    }
}