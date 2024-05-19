const mongoose = require('mongoose');
require('dotenv').config;

exports.DBConnect = () =>{
    mongoose.connect(process.env.DATABASE_URL, {
        useUnifiedTopology : true,
        useNewUrlParser: true
    }).then(() =>console.log("DB Connected Successfully"))
    .catch((err) =>{
        console.log("DB Connection Failed");
        console.error(err);
        process.exit(1);
    })
}