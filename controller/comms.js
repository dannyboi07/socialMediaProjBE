const commsRouter = require("express").Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const webpush = require("web-push");
const { tokenValidation } = require("../utils/middleware")

commsRouter.get("/contacted", tokenValidation, async (req, res, next) => {

    try {

        const contacted = await db.query(`SELECT DISTINCT u_id, name, username, imgloc FROM users 
            JOIN message ON message.u_id_to = u_id AND u_id_from  = $1 
            OR message.u_id_from = u_id AND u_id_to = $1`, [req.decodedToken.id]);

        res.json( contacted.rows );
    } catch (err) {
        console.error(err);
        next();
    };
});

commsRouter.get("/messages/:id", tokenValidation, async (req, res, next) => {

    try {

        if (!req.params.id) return res.status(400).json({ error: "Missing user details" });
        const friendId = parseInt(req.params.id);
    
        const u_time_zone = await db.query("SELECT u_time_zone FROM users WHERE u_id = $1", [req.decodedToken.id]);
        
        const msgs = await db.query(`SELECT msg_id, u_id_from, u_id_to, msg_text, 
            to_char(date AT TIME ZONE 'UTC' AT TIME ZONE $3, 'HH12:MI AM') AS time, 
            to_char(date AT TIME ZONE 'UTC' AT TIME ZONE $3, 'Month DD, YYYY') AS date FROM message 
            WHERE u_id_from = $1 AND u_id_to = $2 OR u_id_to = $1 
            AND u_id_from = $2 ORDER BY message.date DESC`, 
        [req.decodedToken.id, friendId, u_time_zone.rows[0].u_time_zone]);

        return res.json( msgs.rows );
    } catch(err) {
        console.error(err);
        next();
    };
});

commsRouter.post("/message/:id", tokenValidation, async (req, res, next) => {

    try {

        if (!req.params.id) return res.status(400).json({ error: "Missing user details" });
        const friendId = parseInt(req.params.id);
    
        if (!req.body.msgText) return res.status(400).json({ error: "Empty messages are not allowed" });    
        
        const msgIns = await db.query(`INSERT INTO message (u_id_from, u_id_to, msg_text) VALUES ($1, $2, $3) 
            RETURNING msg_id, u_id_from, u_id_to, msg_text,to_char(date, 'HH12:MI AM') as time, 
            to_char(date, 'Month DD, YYYY') as date`, [req.decodedToken.id, friendId, req.body.msgText]);

        res.json(msgIns.rows);

        const frndSubKeys = await db.query(`SELECT sub_endpoint, sub_auth_key, sub_pub_key, 
            (SELECT name FROM users WHERE u_id = $1) as sender_name, (SELECT username FROM users WHERE u_id = $1) as sender_uname, 
            (SELECT imgloc FROM users WHERE u_id = $1) as sender_img FROM users 
            WHERE u_id = $2`, [req.decodedToken.id, friendId]);

        const subscription = {
            endpoint: frndSubKeys.rows[0].sub_endpoint,
            keys: {
                p256dh: frndSubKeys.rows[0].sub_pub_key,
                auth: frndSubKeys.rows[0].sub_auth_key
            }
        };

        const payload = {
            notifType: "message",
            title: frndSubKeys.rows[0].sender_name,
            body: req.body.msgText,
            icon: frndSubKeys.rows[0].sender_img,
            url: `https://secure-meadow-40264.herokuapp.com/messages/${frndSubKeys.rows[0].sender_uname}`,
            u_id_from: friendId,
            u_id_to: req.decodedToken.id,
            msg_id: msgIns.rows[0].msg_id,
            time: msgIns.rows[0].time,
            date: msgIns.rows[0].date
        };

        const primKey = await db.query(`INSERT INTO notification (u_id_fk, title, body, icon, url) VALUES ($1, $2, $3, $4, $5) 
            RETURNING notif_id`, [friendId, payload.title, payload.body.slice(51), payload.icon, payload.url]);

        webpush.sendNotification(subscription, JSON.stringify({ ...payload, primaryKey: primKey.rows[0].notif_id }))
            .catch(err => console.error(err));

    } catch (err) {
        console.error(err);
        next();
    };
});

commsRouter.get("/contacts", tokenValidation, async (req, res, next) => {
    try {

        const contacts = await db.query(`SELECT u_id, name, username, imgloc FROM users 
            JOIN user_followers ON user_followers.u_id_fk = $1 AND user_followers.u_flwr_id_fk = u_id 
            OR user_followers.u_flwr_id_fk = $1 AND user_followers.u_id_fk = u_id`, 
            [req.decodedToken.id]);

        res.json( contacts.rows );
    } catch (err) {
        console.error(err);
        next();
    };
});

module.exports = commsRouter;
