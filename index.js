"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const app = express();

const indexRouter = require("./src/route/index.route.js");
const dbConnect = require("./src/config/dbConnect.js");
const { notFound, errorHandler } = require("./src/middlewares/errorHandler.js");


const PORT = process.env.PORT;

dbConnect();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/api", indexRouter);
app.use(notFound);
app.use(errorHandler);

// app.use("/api/user", authRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});
