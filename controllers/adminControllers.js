
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");








module.exports.getDoctor = async (req, res) => {

    try {
        const doctors = await Doctor.find({});
        res.status(200).send({
            message: "Doctors fetched successfully",
            success: true,
            data: doctors,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error applying doctor account",
            success: false,
            error,
        });
    }

};

module.exports.changeDoctorStatus = async (req, res) => {

    try {
        const { doctorId, status } = req.body;
        const doctor = await Doctor.findByIdAndUpdate(doctorId, {
            status,
        });

        const user = await User.findOne({ _id: doctor.userId });
        const unseenNotifications = user.unseenNotifications;
        unseenNotifications.push({
            type: "new-doctor-request-changed",
            message: `Your doctor account has been ${status}`,
            onClickPath: "/notifications",
        });
        user.isDoctor = status === "approved" ? true : false;
        await user.save();

        res.status(200).send({
            message: "Doctor status updated successfully",
            success: true,
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error applying doctor account",
            success: false,
            error,
        });
    }

};

module.exports.getuserinfo = async (req, res) => {

    try {
        const users = await User.find({});
        // users.exclude('title Image');
        // console.log(users.length,"fffffffffffffffffff")
        res.status(200).send({
            message: "Users fetched successfully",
            success: true,
            data: users,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error applying doctor account",
            success: false,
            error,
        });
    }

};

module.exports.changeUserStatus = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate({ _id: req.body.userid }, { isBlock: req.body.status })
        res.status(200).send({ message: ` ${user.name} ${req.body.status}`, success: true })
    }
    catch (error) {
        res.status(400).send({
            message: "Not find user",
            success: false,
            error,
        })
    }
};

module.exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({}).sort({ _id: -1 });
        res.status(200).send({ message: "sucess", success: true, data: appointments })
    } catch (error) {
        res.status(500).send({ message: "can't fetch data from Appoinments model", success: false, error })
    }
};

module.exports.getPendingDoctor = async (req, res) => {
    try {
        const pendingdoctor = await Doctor.find({ status: "pending" });
        const pendingdoctorcount = pendingdoctor.length;
        const approveddoctor = await Doctor.find({status:"approved"})
        const approveddoctorcount = approveddoctor.length;
        const verifyuser = await User.find({isverifed:true})
        const verifyusercount = verifyuser.length;
        const appointments = await Appointment.find({});
        const appointmentscount = appointments.length;
        res.status(200).send({ message: "sucess", success: true, data: pendingdoctor, datacount: pendingdoctorcount,doctorcount:approveddoctorcount,usercount:verifyusercount,appointmentcount:appointmentscount })
    } catch (error) {
        res.status(500).send({ message: "can't fetch data", success: false, error })
    }
};