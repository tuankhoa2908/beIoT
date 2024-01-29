const express = require("express");
const router = express.Router();

const { user } = require('../controller/index.js');
const middleware = require("../middlewares/authMiddleware.js");

router.post("/register", user.createUser);
router.post("/login", user.loginAdmin);
router.post("/change-password", middleware.verifyToken, user.changePassword);
router.put("/reset-password/:token", user.resetPassword);
router.post("/forgot-password-token", user.forgotPasswordToken);


module.exports = router; 