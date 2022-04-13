const userRouter = require("express").Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const { tokenValidation } = require("../utils/middleware")

userRouter.get("/", async (req, res, next) => {
    const { uname } = req.query;

    if (!uname) return res.status(400).json({ error: "Missing search query" });
    
    try {

        let decodedToken = null;
        if (req.token) {
            decodedToken = jwt.verify(req.token, process.env.SECRET);
            if (!decodedToken) return res.status(401).json({ error: "Missing or invalid token" });
        };
    
        const foundUser = await db.query("SELECT u_id, name, username, imgloc, email FROM users WHERE username = $1", [uname]);

        if (foundUser.rows.length === 1) {

            if (decodedToken) {
                const userPosts = await db.query(`SELECT p_id, text, post.date, p_pics, user_id as u_id, 
                    (SELECT COUNT(*) FROM likes_post_rel WHERE p_id_fk = post.p_id) as likes, 
                    (SELECT TRUE FROM likes_post_rel WHERE p_id_fk = post.p_id AND u_id_fk = $2) as liked, 
                    (SELECT COUNT(*) FROM comments_post_rel WHERE p_id_fk = post.p_id) AS no_comments from post 
                    WHERE user_id = $1`, [foundUser.rows[0].u_id, decodedToken.id]);

                const followsOrNot = await db.query(`SELECT EXISTS (SELECT TRUE FROM user_followers WHERE u_id_fk = $1 AND u_flwr_id_fk = $2 
                    OR u_id_fk = $2 AND u_flwr_id_fk = $1) AS friends`, [foundUser.rows[0].u_id, decodedToken.id]);

                const response = {
                    ...foundUser.rows[0],
                    ...followsOrNot.rows[0],
                    posts: [
                        ...userPosts.rows
                    ]
                }

                return res.status(200).json(response);
            }

            const userPosts = await db.query(`SELECT p_id, text, post.date, p_pics, user_id as u_id, 
                (SELECT COUNT(*) FROM likes_post_rel WHERE p_id_fk = post.p_id) as likes, 
                (SELECT COUNT(*) FROM comments_post_rel WHERE p_id_fk = post.p_id) AS no_comments from post 
                WHERE user_id = $1`, [foundUser.rows[0].u_id]);

            const response = {
                ...foundUser.rows[0],
                posts: [
                    ...userPosts.rows
                ],
            };

            return res.status(200).json(response);
        } else return res.status(404).json({ error: "No user found" });
    } catch (err) {
        console.error(err);
        next();
    }; 
});

userRouter.get("/follows/:uid", tokenValidation, async (req, res, next) => {

    const userToCheck = parseInt(req.params.uid);

    try {
        const followsOrNot = await db.query("SELECT COUNT(*) FROM user_followers WHERE u_id_fk = $1 AND u_flwr_id_fk = $2", [userToCheck, req.decodedToken.id]);
        console.log(followsOrNot.rows[0]);

        if (followsOrNot.rows[0].count === "1") return res.status(200).json({ follows: true });
        else return res.status(404).json({ follows: false });
    } catch(err) {
        console.error(err);
        next();
    };
});

userRouter.post("/follow/:uid", tokenValidation, async (req, res, next) => {

    if (!req.params.uid) return res.status(400).json({ error: "Details of the user to befriend are not provided" });

    const userToFollowId = req.params.uid; // Not parse-inting this param so that I can directly compare it as a string to decToken.id which is a string too

    if (req.decodedToken.id === userToFollowId) return res.status(400).json({ success: false, error: "Cannot follow your own account" });

    try {
        const foundUserToFollow = await db.query("SELECT COUNT(*) FROM users WHERE u_id = $1", [userToFollowId]);

        if (foundUserToFollow.rows.length === 1) {
            await db.query("INSERT INTO user_followers (u_id_fk, u_flwr_id_fk) VALUES ($1, $2) ON CONFLICT DO NOTHING", [userToFollowId, req.decodedToken.id]);

            return res.status(200).json({ success: true });
        } else return res.status(404).json({ success: false, error: "User not found" });
    } catch(err) {
        console.error(err);
        next();
    };
});

userRouter.delete("/follow/:uid", tokenValidation, async (req, res, next) => {

    if (!req.params.uid) return res.status(400).json({ error: "Details of user to unfriend are missing" });
    const userToUnfollowId = parseInt(req.params.uid);

    try {
        
        await db.query("DELETE FROM user_followers WHERE u_id_fk = $1 AND u_flwr_id_fk = $2", [userToUnfollowId, req.decodedToken.id]);

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error(err);
        next();
    };
});

userRouter.get("/notifscount", tokenValidation, async (req, res, next) => {
    try {

        const notifsCount = await db.query("SELECT COUNT(*) FROM notification WHERE u_id_fk = $1", [req.decodedToken.id]);

        return res.json(notifsCount.rows[0]);
    } catch (err) {
        console.error(err);
        next();
    }
})

userRouter.get("/notifs", tokenValidation, async (req, res, next) => {

    try {
        const userNotifs = await db.query(`SELECT notif_id as \"primaryKey\", title, body, icon, url FROM notification 
            WHERE u_id_fk = $1 ORDER BY date`, [req.decodedToken.id]);

        res.json(userNotifs.rows);
    } catch(err) {
        console.error(err);
        next();
    };
});

userRouter.delete("/notif/:id", tokenValidation, async (req, res, next) => {

    if (!req.params.id) return res.status(400).json({ error: "Notification id required" });

    try {
        const notifId = parseInt(req.params.id);

        await db.query("DELETE FROM notification WHERE notif_id = $1 AND u_id_fk = $2", [notifId, req.decodedToken.id]);

        res.status(200).json({ success: true });
    } catch(err) {
        console.error(err);
        next();
    };
});

module.exports = userRouter;