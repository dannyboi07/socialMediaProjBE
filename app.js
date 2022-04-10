const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

const webpush = require("web-push");
const middleware = require("./utils/middleware");
const registerRouter = require("./controller/register");
const loginRouter = require("./controller/login");
const contentRouter = require("./controller/content");
const userRouter = require("./controller/user");
const searchRouter = require("./controller/search");
const subscriptionRouter = require("./controller/subscribe");
const commsRouter = require("./controller/comms");
const db = require("./db");

//const { s3Client, ListBucketsCommand, getS3Obj, uploadFile } = require("./s3/s3Client");
const imageRouter = require("./controller/images");

console.log(process.env.PRIVATE_VAPID_KEY, process.env.PUBLIC_VAPID_KEY);
webpush.setVapidDetails("mailto:test@test.com", process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);
app.use(cors());
app.use(express.json());

app.use("/", express.static("build"));

app.use(middleware.requestLogger);

//app.use("/api/images", imageRouter);
app.use("/api/images/public", imageRouter);
app.use("/api/content", middleware.extractToken, contentRouter);
app.use("/api/comms", middleware.extractToken, commsRouter);
app.use("/api/search", searchRouter);
app.use("/api/user", middleware.extractToken, userRouter);

app.use("/api/login", loginRouter);
app.use("/api/register", registerRouter);

app.get("/testrds", async (req, res, next) => {

    try {
        
        const dbRes = await db.query("SELECT * FROM users");

        res.json(dbRes.rows)
    } catch (err) {
        console.error(err);
        next();
    }
})

// app.get("/testpush", (req, res, next) => {
//     const subscription = {
//         endpoint: "https://fcm.googleapis.com/fcm/send/d5A8SuvKqQ4:APA91bHxXcxTGJTzNYD8emFkm893TeXsYVCcVz5PLh77wFYxTxI1_aXPaL0AhbcqKHGGQbY_WG4B2CU1j_LN1JgdgLMvSRPbKfphDVdKdRexhZRpkCtIeeYZn0y57xdlhF2K63ObGhow",
//         keys: {
//             p256dh: "BEmjNMQWVKH2nDlha4ut7cyXl4i8Y3r2LUlhb7dDLsB8yg7BMH9TDzqFqYqR8hDVCQ05CgcQEZ_E3c_nkmKts7M",
//             auth: "6VxiW5rtMTeZuHRAuvy1yA"
//         }
//     };

//     const payload = {
//         title: "Test push",
//         icon: "http://localhost:3500/images/profile-pics/profileimg-1645003992638-711595105.jpg",
//         body: "Testing service workers push to notif and push to clientMessage",
//         url: "http://localhost:3000/home",
//         primaryKey: 5
//     };

//     webpush.sendNotification(subscription, JSON.stringify(payload))
//         .catch(err => console.error(err));
//     res.end();
// });

// app.get("/testq", async (req, res, next) => {
//     try {
//         const resu = await db.query("INSERT INTO message (u_id_from, u_id_to, msg_text) VALUES ($1, $2, $3) RETURNING msg_id, u_id_from, u_id_to, msg_text,to_char(date, 'HH12:MI AM') as time, to_char(date, 'Month DD, YYYY') as date", [36, 39, "test"]);

//         res.json(resu.rows)
//     } catch(err) {
//         console.error(err);
//         next();
//     }
// });

// app.get("/testbuckets3", async (req, res, next) => {
//     try {
//         const s3res = await s3Client.send(new ListBucketsCommand({}));

//         res.send(s3res.Buckets).end();

//     } catch(err) {
//         console.error(err);
//         next()
//     };
// });

// app.get("/testobjs3", async (req, res, next) => {
//     try {
//         // const params = {
//         //     Bucket: "social-media-proj-bucket-1",
//         //     Key: "public/profile-pics/avatar-michelle.jpg"
//         // }

//         //const s3Res = await s3Client.send(new GetObjectCommand(params));
//         const s3Res = await getS3Obj("public/post-images/profileimg-1649427562831-628854109.jpg");

//         s3Res.Body.pipe(res);

//         // if (s3Res.$metadata.httpStatusCode === 400 || s3Res.$metadata.httpStatusCode === 401) {
//         //     return res.status(500).json({ error: "Internal server error" });
//         // }
//         // else if (s3Res.$metadata.httpStatusCode === 404) {
//         //     return res.status(404).json({ error: "Resource doesn't exist" });
//         // };
//         // //console.log(s3Res.Body, 123123123);

//         // s3Res.Body.on("data", chunk => res.write(chunk));
//         // s3Res.Body.on("error", () => {
//         //     s3Res.Body.destroy();
//         //     return res.status(400).json({ error: "S3 GET stream error" });
//         // });
//         // s3Res.Body.on("end", () => res.status(204).end());
//         //s3Res.Body.on("finish", () => res.status(201).end());

//     } catch (err) {
//         console.error(err);
//         next();
//     }
// });

// // app.get("/testup", async (req, res, next) => {
// //     try {
        
// //         const s3Res = await uploadFile()
// //     } catch (err) {
// //         console.error(err);
// //         next();
// //     };
// // });

app.use("/api/subscribe", middleware.extractToken, subscriptionRouter);

app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
});

app.use(middleware.unknownEndpoint);

module.exports = app;