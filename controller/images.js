const imageRouter = require("express").Router();
const { getS3Obj } = require("../s3/s3Client");

imageRouter.get("/profile-pics/:key", async (req, res, next) => {

    if (!req.params.key) return res.status(400).json({ error: "No file name provided" });
    try {

        const s3Res = await getS3Obj("public/profile-pics/" + req.params.key);

        s3Res.Body.pipe(res);

    } catch (err) {
        console.error(err);
        next();
    };
});

imageRouter.get("/post-images/:key", async (req, res, next) => {

    if (!req.params.key) return res.status(400).json({ error: "No file name provided" });

    try {
        
        const s3Res = await getS3Obj("public/post-images/" + req.params.key);

        s3Res.Body.pipe(res);
    } catch (err) {
        console.error(err);
        next();
    };
});

imageRouter.get("/profile-pics/default-prof-img/user-default.png", async(req, res, next) => {
    try {
        const s3Res = await getS3Obj("profile-pics/default-prof-img/user-default.png");

        s3Res.Body.pipe(res);
    } catch (err) {
        console.error(err);
        next();
    };
});

module.exports = imageRouter;