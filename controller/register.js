const registerRouter = require("express").Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const path = require("path");
const { fSizeLimitHandler } = require("../utils/middleware");
const { uploadFile }  = require("../s3/s3Client");
const { unlink } = require("fs/promises");

const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./tempuploads/")
  },
  filename: function (req, file, cb) {
    if ( !(/jpg|jpeg|png|svg/.test(file.mimetype)) ) {
      return cb(null, new Error("Wrong file type, only jpg/jpeg/png/svg are supported"));
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
})
const upload = multer({ storage: storage, limits: { files: 1, fileSize: 2000000 } });

registerRouter.post("/", upload.single("profileimg"), fSizeLimitHandler, async(req, res, next) => {

  const { name, username, password } = req.body;
  if (!name || !username || !password) return res.status(400).json({ error: "Incomplete request" });

  if (username.length < 6 || username.length > 30) {
    return res.status(400).json({ 
      error: "Username must be between the length of 6-30 characters"
    });
  } 
  else if ( / /.test(username) ) {
    return res.status(400).json({
      error: "Username cannot have spaces"
    })
  }
  else if (password.length < 8 || password.length > 100) {
    return res.status(400).json({
      error: "Password must be between the length of 8-100 characters"
    });
  }
  else if ( name.length < 1 || name.length > 30 ) {
    return res.status(400).json({
      error: "Name must be between the length of 1-30 characters"
    })
  }

  let profImgPath = "https://secure-meadow-40264.herokuapp.com/api/images/public/profile-pics/default-prof-img/user-default.svg";
  if (req.file) {
    profImgPath = `http://secure-meadow-40264.herokuapp.com/api/images/public/profile-pics/${req.file.filename}`;
  }

  try {
    const doesExist = await db.query("SELECT * FROM users WHERE username = $1 LIMIT 1", [username]);
    if (doesExist.rows.length > 0) return res.status(400).json({ error: "Username taken" });

    const pwHash = await bcrypt.hash(password, 10);

    await uploadFile(req.file);

    await db.query("INSERT INTO USERS (name, username, password_hash, imgloc) VALUES ($1, $2, $3, $4)", [name, username, pwHash, profImgPath]);

    res.status(200).json({ success: true });

    await unlink(req.file.path);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error, please try again" });
    next();
  };
});

module.exports = registerRouter;