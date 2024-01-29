const User = require('../model/user.model');
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { generateToken, generateRefreshToken } = require("../config/token");
const { sendEmail } = require("./email.controller");
const { validateMongoDbId } = require("../utils/validateMongodbId")


module.exports = {

    // Create Account 
    createUser: asyncHandler(async (req, res) => {
        const data = req.body;
        console.log(data);
        const findUser = await User.findOne({ email: data.email });
        if (!findUser) {
            // Create new user
            const newUser = await User.create(data);
            res.json(newUser)
        }
        else {
            throw new Error("User Already Exists");
        }
    }),

    // AdminLogin
    loginAdmin: asyncHandler(async (req, res) => {
        const data = req.body;
        const findAdmin = await User.findOne({ email: data.email });
        console.log(findAdmin)
        if (findAdmin.role !== "admin") throw new Error("Not Authorised");
        if (findAdmin && (await findAdmin.isPasswordMatched(data.password))) {
            const refreshToken = generateRefreshToken(findAdmin._id);
            await User.findByIdAndUpdate(findAdmin._id, {
                refreshToken: refreshToken,
            }, {
                new: true,
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 72 * 60 * 60 * 1000,
            })
            res.json({
                _id: findAdmin?._id,
                name: findAdmin?.name,
                email: findAdmin?.email,
                token: generateToken(findAdmin?._id),
            });
        }
        else {
            throw new Error("Invalid Credentials");
        }
    }),

    changePassword: asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const { password } = req.body;
        validateMongoDbId(_id);
        const user = await User.findById(_id);
        if (password) {
            user.password = password;
            const updatePassword = await user.save();
            res.json(updatePassword);
        }
        else {
            res.json(user);
        }
    }),

    handleRefreshToken: asyncHandler(async (req, res) => {
        const cookie = req.cookies;
        if (!cookie) throw new Error("No Refresh Token in cookies");
        const refreshToken = cookie.refreshToken;
        const user = await User.findOne({ refreshToken })
        if (!user) throw new Error("No Refresh token present in db or not matched");
        jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
            if (err || user.id !== decoded.id) {
                throw new Error("There is something wrong with refresh token");
            }
            const accessToken = generateToken(user?._id);
            res.json({ accessToken });
        })
    }),

    logoutUser: asyncHandler(async (req, res) => {
        const cookie = req.cookies;
        if (!cookie?.refreshToken) throw new Error("No Refresh Token in cookies");
        const refreshToken = cookie.refreshToken;
        const user = await User.findOne({ refreshToken });
        if (!user) {
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
            });
            return res.sendStatus(204);
        };
        await User.findOneAndUpdate({ refreshToken }, {
            refreshToken: "",
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204);
    }),

    forgotPasswordToken: asyncHandler(async (req, res) => {
        const { email } = req.body;
        console.log(email);
        const user = await User.findOne({ email });
        if (!user) throw new Error("User not found with this email");
        try {
            const token = await user.createPasswordResetToken();
            await user.save();
            const resetURL = `Hi, please follow the link to reset your Password. This link is valid till 10 minutes from now. <a href='http://localhost:8080/api/user/reset-password/${token}'>Click Here</a>`
            const data = {
                to: email,
                subject: "Forgot Password Link",
                html: resetURL,
                text: "Hey User",
            };
            sendEmail(data);
            res.json({ token })
        } catch (error) {
            throw new Error(error);
        }
    }),

    resetPassword: asyncHandler(async (req, res) => {
        const { password } = req.body;
        const { token } = req.params;
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        })
        if (!user) throw new Error("Token Expired, Please try again later");
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.json({ user });
    }),

    changePassword: asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const { password } = req.body;
        validateMongoDbId(_id);
        const user = await User.findById(_id);
        if (password) {
            user.password = password;
            const updatePassword = await user.save();
            res.json(updatePassword);
        }
        else {
            res.json(user);
        }
    }),
}