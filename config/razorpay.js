const razorpay = require('razorpay');

exports.instance = new razorpay({
    key_id:process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
})