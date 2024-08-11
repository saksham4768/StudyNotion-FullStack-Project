const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payment");
const courseRoutes = require("./routes/course");
const ContactUsRoutes = require("./routes/contactUs");

console.log(typeof userRoutes);  // Debug: should print "function"
console.log(typeof profileRoutes);  // Debug: should print "function"
console.log(typeof paymentRoutes);  // Debug: should print "function"
console.log(typeof courseRoutes); // Debug: should print "function"

const DataBase = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

//DataBase Connection
DataBase.DBConnect();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:3000",
    credentials: true,
}));

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir: "/tmp"
}));

//Cloudinary Connection
cloudinaryConnect();

//Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach",ContactUsRoutes);

//Default Routes
// app.use("/" , (req, res) => {
//     return res.json({
//         success: true,
//         message: "Your Server is Up and running...."
//     })
// });

//Activate Server
app.listen(PORT, () => {
    console.log(`Server is started successfully ${PORT}`)
})