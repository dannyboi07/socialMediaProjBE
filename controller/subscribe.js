const subscriptionRouter = require("express").Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

subscriptionRouter.get("/pubkey", (req, res, next) => {
    res.status(200).json({ vapidKey: process.env.PUBLIC_VAPID_KEY });
})

subscriptionRouter.post("/", async (req, res, next) => {
    
    const token = jwt.verify(req.token, process.env.SECRET);

    if (!token) return res.status(400).json({ error: "Token missing or invalid" });

    const subscription = req.body;

    console.log("subscription", subscription);
    console.log("token", token);

    try {
        if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) 
        return res.status(400).json({ error: "Bad req: No subscription keys" });

        res.status(201).json({});

        await db.query("UPDATE users SET sub_endpoint = $1, sub_pub_key = $2, sub_auth_key = $3 WHERE u_id = $4", 
            [subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, token.id]);

    } catch(err) {
        console.error(err);
        next();
    };
});

module.exports = subscriptionRouter;