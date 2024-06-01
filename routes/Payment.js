// Import the required modules
const express = require("express");
const router = express.Router();


//Payment Related Controller
const { Authentication, IsStudent } = require("../middlewares/auth");
const { caturePayment, verifySignature } = require("../controllers/Payment");

//Capture the Payment
router.post("/capturePayment", Authentication, IsStudent, caturePayment);

//Verify Signature After capture the Payment
router.post("/verifySignature", verifySignature);

// Export the router for use in the main application
module.exports = router