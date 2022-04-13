const loginRouter = require("express").Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

loginRouter.post("/", async(req, res, next) => {
  const { username, password, u_time_zone } = req.body;

  if ( !username || !password ) return res.status(400).json({ error: "Login details not provided" });

  try {
    const doesExist = await db.query("SELECT * FROM users where username = $1 LIMIT 1", [username]);

    if (doesExist.rows.length === 0) return res.status(404).json({ error: "Username doesn't exist" });

    const pwCorrect = await bcrypt.compare(password, doesExist.rows[0].password_hash);
    if (!pwCorrect) return res.status(401).json({ error: "The password is incorrect" });

    if (u_time_zone) await db.query("UPDATE users SET u_time_zone = $1 WHERE u_id = $2", [u_time_zone, doesExist.rows[0].u_id]);

    const preToken = {
      username: doesExist.rows[0].username,
      id: doesExist.rows[0].u_id
    };

    const token = jwt.sign(preToken, process.env.SECRET);

    res.status(200).json({ 
      token,
      uId: doesExist.rows[0].u_id,
      username: doesExist.rows[0].username, 
      name: doesExist.rows[0].name, 
      profImgSrc: doesExist.rows[0].imgloc 
    });
  } catch(err) {
    console.error(err);
    next();
  };
});

module.exports = loginRouter;