const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async(email, title, body) =>{
    try{

        //Create Transport
        console.log("**********IN MAILSENDER ****************");
        let Transport = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        let info = await Transport.sendMail({
            from : "StudyNotion - The Tech Plateform",
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`,
        });

        console.log(info);
        return info;
    }
    catch(error){
        console.log("Throw Error while send email -> ",error.message);
    }
};

module.exports = mailSender;

