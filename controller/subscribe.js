const subscriptionRouter = require("express").Router();
const db = require("../db");
const { tokenValidation } = require("../utils/middleware")

subscriptionRouter.get("/pubkey", (req, res, next) => {
    res.status(200).json({ vapidKey: process.env.PUBLIC_VAPID_KEY });
})

subscriptionRouter.post("/", tokenValidation, async (req, res, next) => {

    try {
        const subscription = req.body;
    
        if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) 
        return res.status(400).json({ error: "Bad req: No subscription keys" });

        await db.query("UPDATE users SET sub_endpoint = $1, sub_pub_key = $2, sub_auth_key = $3 WHERE u_id = $4", 
            [subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, token.id]);

        res.status(200).end();

    } catch(err) {
        console.error(err);
        next();
    };
});

module.exports = subscriptionRouter;