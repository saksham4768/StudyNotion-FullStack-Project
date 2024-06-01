const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const otpTemplate = require("../mail/templates/emailVerificationTemplate");

const otpSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
    },
    otp:{
        type:String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now(),
        expires: 5*60,
    },
});


//-> Function to Send email for verification
async function sendVerificationEmail(email, otp){
    try{

        const mailResponse = await mailSender(email, "Verification mail from StudyNotion", otpTemplate(otp));
        console.log("Email sent Successfully", mailResponse);
    }
    catch(error){
        console.log("Error occured while send Email", error);
        throw error;
    }
}

otpSchema.pre("save", async function (next){
    if (this.isNew) {
        console.log("Email is ->", this.email, "OTP IS ->", this.otp);
		await sendVerificationEmail(this.email, this.otp);
	}
    next();
})

module.exports = mongoose.model("OTP", otpSchema);