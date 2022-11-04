const mongoose = require("mongoose");

// mongoose.connect(process.env.MONGO_URL);

// const connection = mongoose.connection;

// connection.on("connected", () => {
//   console.log("MongoDB connection is successful");
// });

// connection.on("error", (error) => {
//   console.log("Error in MongoDB connection", error);
// });

mongoose.connect("mongodb://localhost:27017/doctor_appointment", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB Connection Sucessfull ")
}).catch(err => {
    console.log(err.message)
})

module.exports = mongoose;