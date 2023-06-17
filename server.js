"use strict";

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const passport = require("passport");

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require("./config");
const { router: tripRouter } = require("./trips");
const { router: authRouter, localStrategy, jwtStrategy } = require("./auth");
const { router: usersRouter } = require("./users");

app.use(express.static("public"));
app.use(morgan("common"));

app.use(express.json());

//CORS
app.use(cors());

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use("/api/users/", usersRouter);
app.use("/api/auth/", authRouter);

app.use("/api/trips", tripRouter);

app.use("*", (req, res) => {
  return res.status(404).json({ message: "Not Found" });
});


if (require.main === module) {
  mongoose
    .connect(
      "mongodb+srv://abhi:<password>@cluster0.ddjrd0k.mongodb.net/sideproj",
      //"mongodb+srv://shravaniparsi26:shravaniparsi26@cluster0.kxgrxvx.mongodb.net/280",
      { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((err) => console.log(err));

    const port = 8080;

    app.listen(port, () => console.log(`Server is running on port ${port}`));
}

module.exports = { app};
