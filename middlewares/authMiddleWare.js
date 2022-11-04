// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//     const token = req.headers["authorization"].split(" ")[1];
//   const user = jwt.verify(token, "doctorappointment");
//   if (user) {
//     req.body.user = user;
//     next();
//   } else {
//     res.status(500).send({ success:false ,message: "Invalid or Expired Token" });
//   }
// };

const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token, "doctorappointment", (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Auth failed",
          success: false,
        });
      } else {
        req.body.userId = decoded._id;
        next();
      }
    });
  } catch (error) {
    return res.status(401).send({
      message: "Auth failed",
      success: false,
    });
  }
};
