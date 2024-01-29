const nodemailer = require('nodemailer');
const asyncHandler = require("express-async-handler");

module.exports = {
    sendEmail: asyncHandler(async (data, req, res) => {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_ID,
                pass: process.env.PASSWORD_MAIL,
            }
        });

        const info = await transporter.sendMail({
            from: '"Hey 👻" <foo@gmail.com>',
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html,
        });

        console.log("Message sent: %s", info.messageId);
    })

}