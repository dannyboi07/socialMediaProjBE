const searchRouter = require("express").Router();
const db = require("../db");

searchRouter.get("/", async (req, res, next) => {
    const { query } = req.query;

    // let decodedToken = null;
    // if (req.token) {
    //     decodedToken = jwt.verify(req.token, process.env.SECRET);
    //     if (!decodedToken) return res.status(401).json({ error: "Token missing or invalid" });
    // };

    try {
        const foundUsers = await db.query(`SELECT u_id, name, username, imgloc, email FROM users 
            WHERE username ILIKE '%' || $1 || '%' 
            OR name ILIKE '%' || $1 || '%'`, [query]);

        if (foundUsers.rows.length > 0) {
            // const userPosts = await db.query("SELECT * from post WHERE user_id = $1", [foundUser.rows[0].u_id]);

            // if (decodedToken) {
            //     const followsOrNot = await db.query("SELECT COUNT(*) from user_followers WHERE u_id_fk = $1 AND u_flwr_id_fk = $2", [foundUser.rows[0].u_id, decodedToken.id]);

            //     if (followsOrNot.rows[0].count === "1") {

            //         const response = {
            //             ...foundUser.rows[0],
            //             follows: true,
            //             posts: [
            //                 ...userPosts.rows
            //             ]
            //         };

            //         return res.status(200).json(response);
            //     } else {

            //         const response = {
            //             ...foundUser.rows[0],
            //             follows: false,
            //             posts: [
            //                 ...userPosts.rows
            //             ]
            //         }

            //         return res.status(200).json(response);
            //     }
            // }
            // const response = {
            //     ...foundUser.rows[0],
            //     posts: [
            //         ...userPosts.rows
            //     ],
            // };

            const response = [
                ...foundUsers.rows,
            ];

            return res.status(200).json(response);
        } else return res.status(404).json({ error: "No results" });
    } catch (err) {
        console.error(err);
        next();
    }; 
});

module.exports = searchRouter;