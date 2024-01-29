const express = require("express");
const router = express.Router();

const { data } = require('../controller/index.js');

router.post("/newRecord", data.newRecord);
router.get("/get-data", data.getAllRecord);
router.get("/get-record/:id", data.getRecord);

module.exports = router;