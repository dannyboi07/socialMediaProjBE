const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const webpush = require("web-push");
const middleware = require("./utils/middleware");
const registerRouter = require("./controller/register");
const loginRouter = require("./controller/login");
const contentRouter = require("./controller/content");
const userRouter = require("./controller/user");
const searchRouter = require("./controller/search");
const subscriptionRouter = require("./controller/subscribe");
const commsRouter = require("./controller/comms");

const imageRouter = require("./controller/images");

webpush.setVapidDetails("mailto:test@test.com", process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);
app.use(cors());
app.use(express.json());

app.use(middleware.requestLogger);

app.use(express.static("build"));

app.use("/api/images/public", imageRouter);
app.use("/api/content", middleware.extractToken, contentRouter);
app.use("/api/comms", middleware.extractToken, commsRouter);
app.use("/api/search", searchRouter);
app.use("/api/user", middleware.extractToken, userRouter);

app.use("/api/login", loginRouter);
app.use("/api/register", registerRouter);

app.use("/api/subscribe", middleware.extractToken, subscriptionRouter);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.use(middleware.unknownEndpoint);

module.exports = app;