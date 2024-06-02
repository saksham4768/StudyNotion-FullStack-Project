const Category = require('../models/Category');
require('dotenv').config();

exports.createCategory = async (req, res) =>{
    try{
        console.log("Inside Create Category");
        //Fetch Data
        const {name, description} = req.body;

        console.log("Name and Description", name, description);
        //validation 
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: 'All Data Should be Mandatory',
            })
        }
        //Check Category is present alredy or not
        const ExisitngCategory = await Category.findOne({name : name});

        if(ExisitngCategory){
            return res.status(400).json({
                success: false,
                message: "Category is Already Exist",
            })
        }
        //Create Entry in DB
        const CategoryDetails = await Category.create({
            name: name,
            description: description,
        },{new: true});

        console.log("Category Details is ->", CategoryDetails);

        return res.status(200).json({
            success: true,
            message: "Category Created Successfully",
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

exports.getallCategory = async (req, res) =>{
    try{

        //Find all Category, but make sure in Category name and description present
        const allCategory = Category.find({},{name:true, description: true});

        return res.status(200).json({
            success: true,
            allCategory: allCategory,
            message: 'All Category shown Above'
        })
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        })
    }
}

exports.categoryPageDetails = async (req, res) => {
    try {
            //get categoryId
            const {categoryId} = req.body;
            //get courses for specified categoryId
            const selectedCategory = await Category.findById(categoryId)
                                            .populate("courses")
                                            .exec();
            //validation
            if(!selectedCategory) {
                return res.status(404).json({
                    success:false,
                    message:'Data Not Found',
                });
            }
            //get coursesfor different categories
            const differentCategories = await Category.find({
                                         _id: {$ne: categoryId},
                                         })
                                         .populate("courses")
                                         .exec();

            //get top 10 selling courses
            //HW - write it on your own

            //return response
            return res.status(200).json({
                success:true,
                data: {
                    selectedCategory,
                    differentCategories,
                },
            });

    }
    catch(error ) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}