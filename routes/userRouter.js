const express = require('express');

const{
    register,
    login,
    userinfo,
    verifyemail,
    deletetoken,
    resetlink,
    resetpassword,
    applyDoctor,
    markNotifications,
    deleteNotification,
    getApprovedDoctor,
    checkAvilable,
    bookAppointment,
    appointmentData,
    checkOut,
    verifyPayment,
    Appointments,
    cashPayment
} = require("../controllers/userControllers");
const authMiddleWare = require("../middlewares/authMiddleWare");
const storage = require ("../utils/multer");



const router = express.Router();




router.post('/register',register);
router.post('/login',login);
router.get('/getuserinfo',authMiddleWare,userinfo)
router.post('/verifyemail',verifyemail)
router.post('/deletetoken',deletetoken)
router.post('/send-password-reset-link',resetlink)
router.post('/reset-password',resetpassword)
router.post('/apply-doctor-account',storage.single('image'),authMiddleWare,applyDoctor)
router.post('/mark-all-notifications-as-seen',authMiddleWare,markNotifications)
router.post('/delete-all-notifications',authMiddleWare,deleteNotification)
router.get('/get-all-approved-doctors',getApprovedDoctor)
router.post('/check-booking-avilability',authMiddleWare,checkAvilable)
router.post('/book-appointment',authMiddleWare,bookAppointment)
router.post('/get-appointment-details-by-id',authMiddleWare,appointmentData)
router.post('/checkout',authMiddleWare,checkOut)
router.post('/verify',verifyPayment)
router.get('/get-appointments-by-user-id',authMiddleWare,Appointments)
router.post('/cashpayment',authMiddleWare,cashPayment)








module.exports = router;