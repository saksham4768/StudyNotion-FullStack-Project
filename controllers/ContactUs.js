const { contactUsEmail } = require("../mail/templates/contactUsRes");
const mailSender = require("../utils/mailSender");


exports.contactUsController = async(req, res) =>{
    const {email, firstname, lastname, message, phone, countryCode} = req.body;
    console.log("In ContactUsForm Request Body is -> ", req.body);

    try{
        const sendEmail = await mailSender(email, "Your Data Send Successfully",
            contactUsEmail(email, firstname, lastname, message, phone, countryCode)
        );

        console.log("Email Response in case Contact US-> ", sendEmail);
        return res.json({
            success: true,
            message: "Email send successfully",
        })
    }
    catch(error){
        console.log("Error", error)
        console.log("Error message :", error.message)
        return res.json({
          success: false,
          message: "Something went wrong...",
        })
    }
}