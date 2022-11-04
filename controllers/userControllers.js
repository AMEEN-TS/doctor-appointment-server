const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require('../verify/sendEmail');
const Token = require("../models/tokenModel");
const cloudinary = require("../utils/cloudinary");
const moment = require('moment');
const Razorpay = require("razorpay");
const crypto = require("crypto");

module.exports.register = async (req, res, next) => {
  try {
    const exitingUser = await User.findOne({ email: req.body.email });
    if (exitingUser)
      return res
        .status(200)
        .send({ success: false, message: "User Already Registered" });

    const password = req.body.password;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    const hashPassword = await bcrypt.hash(password, salt);
    req.body.password = hashPassword;
    const newUser = new User(req.body);
    const result = await newUser.save();
    await sendEmail(result, 'verifyemail')
    res
      .status(200)
      .send({ success: true, message: "Registration successfull , Please verify your email" });
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const passwordsMached = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (passwordsMached) {
        if (user.isverifed) {
          if (user.isBlock === "unBlock") {
            const dataForFrontend = {
              _id: user._id,
              email: user.email,
              name: user.name,
            };
            const token = jwt.sign(dataForFrontend, "doctorappointment", {
              expiresIn: 3 * 24 * 60 * 60,
            });
            res.status(200).send({
              success: true,
              message: "user Login Sucesssfull",
              data: token,
              userData: user,
            });
          } else {
            res.status(200).send({ success: false, message: "your are blocked" })
          }

        } else {
          res
            .status(200)
            .send({ success: false, message: "Email Not Verified ,Please Check Email" });
        }


      } else
        res.status(200).send({ success: false, message: "Incorrect Password" });
    } else {
      res
        .status(200)
        .send({ success: false, message: "user Does Not Exists", data: null });
    }
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports.userinfo = async (req, res) => {
  // try {
  //   res.send({ success: true, data: req.body.user });
  // } catch (error) {
  //   res.status(400).send(error);
  // }
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.password = undefined;


    if (!user) {
      return res.status(200).send({ message: "User does not exist", success: false })

    } else {
      res.status(200).send({ success: true, data: user })

    }
  } catch (error) {
    res.status(500).send({ message: "Error getting user info", success: false, error })
  }

};

module.exports.verifyemail = async (req, res) => {
  try {
    const tokenData = await Token.findOne({ token: req.body.token });

    if (tokenData) {

      // await User.findOneAndUpdate({ _id: tokenData.userid, isverifed: true });
      await User.findByIdAndUpdate({ _id: tokenData.userid }, { isverifed: true })

      // await Token.findOneAndDelete({ token: req.body.token });
      res.send({ success: true, message: "Email Verified Sucesslly" });
    } else {
      res.send({ sucess: false, message: "Invalid token" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.deletetoken = async (req, res) => {
  try {
    await Token.findOneAndDelete({ token: req.body.token });
    res.send({ sucess: true })
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.resetlink = async (req, res) => {
  try {
    const result = await User.findOne({ email: req.body.email });
    await sendEmail(result, "resestpassword");
    res.send({ success: true, message: "Password rest link sent to your email successfully" });

  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.resetpassword = async (req, res) => {

  try {

    const tokenData = await Token.findOne({ token: req.body.token });
    if (tokenData) {

      const password = req.body.data.password;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await User.findOneAndUpdate({ _id: tokenData.userid }, { password: hashedPassword });
      await Token.findOneAndDelete({ token: req.body.token });
      res.send({ success: true, message: "Password reset successfull" });
    } else {
      res.send({ success: false, message: "Invalid token" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.applyDoctor = async (req, res) => {




  try {

    const result = await cloudinary.uploader.upload(req.file.path)
    const starttime = moment(req.body.start, ["HH:mm"]).format("hh:mm a");
    const endtime = moment(req.body.end, ["HH:mm"]).format("hh:mm a");


    const newdoctor = new Doctor({

      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      website: req.body.website,
      specialization: req.body.specialization,
      experience: req.body.experience,
      feePerCunsultation: req.body.feePerConsultation,
      start: starttime,
      end: endtime,
      image: result.url,
      userId: req.body.userId,

      status: "pending"
    });
    await newdoctor.save();
    const adminUser = await User.findOne({ isAdmin: true });
    const unseenNotifications = adminUser.unseenNotifications;
    unseenNotifications.push({
      type: "new-doctor-request",
      message: `${newdoctor.firstName} ${newdoctor.lastName} has applied for a doctor account`,
      data: {
        doctorId: newdoctor._id,
        name: newdoctor.firstName + " " + newdoctor.lastName,
      },
      onClickPath: "/admin/doctorslist",
    });
    await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
    res.status(200).send({ success: true, message: "Doctor account applied successfully" })
  } catch (error) {
    res.status(500).send({ message: "Error applying doctor account", success: false, error, });
  }
};

module.exports.markNotifications = async (req, res) => {



  try {
    const user = await User.findOne({ _id: req.body.userId });
    const unseenNotifications = user.unseenNotifications;
    const seenNotifications = user.seenNotifications;
    seenNotifications.push(...unseenNotifications);
    user.unseenNotifications = [];
    user.seenNotifications = seenNotifications;
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "All notifications marked as seen",
      data: updatedUser,
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

module.exports.deleteNotification = async (req, res) => {

  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.seenNotifications = [];
    user.unseenNotifications = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "All notifications cleared",
      data: updatedUser,
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

module.exports.getApprovedDoctor = async (req, res) => {

  try {
    const doctors = await Doctor.find({ status: "approved" });
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
module.exports.checkAvilable = async (req, res) => {
  console.log("fffffffffffffffff")
  try {

    const timeAnddate = moment(req.body.dateAndtime).format('llll');


    const doctorId = req.body.doctorId;


    const appointment = await Appointment.find({
      doctorId: doctorId,
      dateAndtime: timeAnddate

    });
    console.log(appointment, "sssssssssss")
    if (appointment.length > 0) {
      return res.status(200).send({ message: "Appointments not available", success: false, })
    } else {
      return res.status(200).send({ message: "Appointments avaialable", success: true })
    }

  } catch (error) {

  }
};

module.exports.bookAppointment = async (req, res) => {

  try {

    req.body.dateAndtime = moment(req.body.dateAndtime).format('llll');

    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    const user = await User.findOne({ _id: req.body.doctorInfo.userId })
    user.unseenNotifications.push({
      type: "new-appointment-request",
      message: `A new appointment request has been made by ${req.body.userInfo.name}`,
      onClickPath: "/doctor/appointments",
    })
    await user.save();
    res.status(200).send({ message: "Appointment booked successfully", success: true, data: newAppointment })

  } catch (error) {
    res.status(500).send({ message: "Error booking appointment", success: false })
  }
};

module.exports.appointmentData = async (req, res) => {

  try {
    const appointmentData = await Appointment.findOne({
      _id: req.body.appointmentId
    })

    res.status(200).send({ message: " data fetched successfully", success: true, data: appointmentData })
  } catch (error) {
    res.status(500).send({ message: "dont get appointment id", success: false, error })
  }

};

module.exports.checkOut = async (req, res) => {

  try {

    const appointmentData = await Appointment.findByIdAndUpdate(
      {
        _id: req.body.appointmentId
      },
      {
        payment: "online"
      }
    )

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_ID,
      key_secret: process.env.RAZORPAY_KEY,
    });

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: "Something Went Wrong!" });
      }
      res.status(200).send({ data: order });
    });


  } catch (error) {

    res.status(500).send({ message: "Internal Server Error!" });
    console.log(error);
  }

};

module.exports.verifyPayment = async (req, res) => {


  try {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({
        message: "Payment verified successfully",
        success: true
      });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }

  } catch (error) {

    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);

  }

};

module.exports.cashPayment = async(req,res) =>{
  
  try{
    const cashpayment = await Appointment.findByIdAndUpdate(
      {
        _id: req.body.appointmentId
      },
      {
        payment: "Cash"
      }
    )
    res.status(200).send({message:"Payment verified successfully",success:true})
  }catch(error){
    res.status(500).json({ message: "payment Not success" });
  }
}

module.exports.Appointments = async (req,res)=>{

  try{
    const appointments = await Appointment.find({ userId: req.body.userId }).sort({_id:-1});
    res.status(200).send({
      message: "Appointments fetched successfully",
      success: true,
      data: appointments,
    });

  }catch(error){
    res.status(500).send({
      message: "Error fetching appointments",
      success: false,
      error,
    });

  }
};





// module.exports.login = async (req, res) => {
//   try {
//     const user = await User.findOne({ email: req.body.email });

//     if (user) {
//       const passwordsMached = await bcrypt.compare(
//         req.body.password,
//         user.password
//       );
//       if (passwordsMached) {
//         if (user.isverifed) {
//           const dataForFrontend = {
//             _id: user._id,
//             email: user.email,
//             name: user.name,
//           };
//           const token = jwt.sign(dataForFrontend, "doctorappointment", {
//             expiresIn: 3 * 24 * 60 * 60,
//           });
//           res.status(200).send({
//             success: true,
//             message: "user Login Sucesssfull",
//             data: token,
//           });
//         } else {
//           res
//             .status(200)
//             .send({ success: false, message: "Email Not Verified ,Please Check Email" });
//         }


//       } else
//         res.status(200).send({ success: false, message: "Incorrect Password" });
//     } else {
//       res
//         .status(200)
//         .send({ success: false, message: "user Does Not Exists", data: null });
//     }
//   } catch (error) {
//     res.status(400).send(error);
//   }
// };