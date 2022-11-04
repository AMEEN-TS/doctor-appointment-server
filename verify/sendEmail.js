const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");
const Token = require("../models/tokenModel");




module.exports = async (user, mailtype) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 587,
            secure: true, // upgrade later with STARTTLS
            auth: {
                user: "ameents.ts@gmail.com",
                pass: "dpyfijeigpbevjhr",
            },
        });

        const encryptedToken = bcrypt.hashSync(user._id.toString(), 10).replaceAll("/", "");


        const token = new Token({ userid: user._id, token: encryptedToken });
        await token.save();

        let emailContent, mailOptions;

        if (mailtype == "verifyemail") {

            emailContent = `<div><h1>Please click on the below link to verify your email address</h1> <a href="http://localhost:3000/verifyemail/${encryptedToken}">${encryptedToken}</a> </div>`
            mailOptions = {
                from: 'ameents.ts@gmail.com',
                to: user.email,
                subject: 'verify Email',
                html: emailContent,

            };
        } else {
            emailContent = `<div><h1>Please click on the below link to reset your password</h1> <a href="http://localhost:3000/resetpassword/${encryptedToken}">${encryptedToken}</a>  </div>`;

            mailOptions = {
                from: "ameents.ts@gmail.com",
                to: user.email,
                subject: "Reset password ",
                html: emailContent,
            };
        }

        await transporter.sendMail(mailOptions)

    } catch (error) {
        console.log(error)
    }

};

