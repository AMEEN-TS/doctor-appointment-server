const express = require("express");
const app = express();
app.use(express.json());
require('dotenv').config()
const dbConfig = require('./config/dbConfig');
const userRoute = require("./routes/userRouter");
const adminRoute = require('./routes/adminRouter');
const doctorRouter = require("./routes/doctorRouter");

const port = process.env.PORT || 5000;


app.listen(port, () =>console.log(`server start ${port}`));

app.use('/api/user',userRoute);
app.use('/api/admin',adminRoute);
app.use('/api/doctor',doctorRouter);