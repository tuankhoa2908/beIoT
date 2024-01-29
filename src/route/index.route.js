const express = require("express");
const router = express.Router();

const data = require('./data.route');
const user = require("./user.route");

router.use("/data", data);
router.use("/user", user);

module.exports = router;