const express = require('express');
const authMiddleWare = require("../middlewares/authMiddleWare");
const {getDoctor,changeDoctorStatus,getuserinfo,changeUserStatus,getAllAppointments,getPendingDoctor}= require  ("../controllers/adminControllers")




const router = express.Router();


router.get("/get-all-doctors",authMiddleWare,getDoctor);
router.post("/change-doctor-account-status",authMiddleWare,changeDoctorStatus)
router.get('/get-all-users',authMiddleWare,getuserinfo)
router.post('/change-user-account-status',authMiddleWare,changeUserStatus)
router.get('/get-all-appointmenst',authMiddleWare,getAllAppointments)
router.get('/get-pending-doctor',authMiddleWare,getPendingDoctor)







module.exports = router;
