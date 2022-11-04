const express = require('express');
const authMiddleWare = require("../middlewares/authMiddleWare");
const {doctorData,updateDoctor,getdoctorbyId,DoctorAppointments,ChangeAppointmentStatus,DoctorHome} = require("../controllers/doctorControllers")
const storage = require ("../utils/multer");






const router = express.Router();


router.post("/doctor-info",authMiddleWare,doctorData)
router.post("/doctorupdate-profile",storage.single('image'),authMiddleWare,updateDoctor)
router.post("/get-doctor-info-by-id",getdoctorbyId)
router.get("/get-appointments-by-doctor-id",authMiddleWare,DoctorAppointments)
router.post("/change-appointment-status",authMiddleWare,ChangeAppointmentStatus)
router.get("/doctorhome",authMiddleWare,DoctorHome)




module.exports = router;