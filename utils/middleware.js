const jwt = require("jsonwebtoken");

function requestLogger(req, res, next) {
  console.log("Method: ", req.method);
  console.log("Path: ", req.path);
  console.log("Body: ", req.body);
  console.log('-----------------');
  next();
};

function extractToken(req, res, next) {
  const auth = req.get("Authorization");
  if (auth && auth.toLowerCase().startsWith("bearer")) {
    req.token = auth.substring(7);
  };

  next();
};

function tokenValidation(req, res, next) {
  if (!req.token) return res.status(401).json({ error: "Token missing" });

  try {
    
    req.decodedToken = jwt.verify(req.token, process.env.SECRET);
    next();
  } catch (err) {
    console.error(err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired" });
    }
    else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Malformed auth token, re-login" });
    };
  };
};

function fileValidationHandler(err, req, res, next) {
  if (err) {
    return res.status(413).json({ error: err });
  } else {
    next();
  }
}

function unknownEndpoint(req, res) {
  res.status(404).json({ error: "Unknown Endpoint" });
}

module.exports = { 
  requestLogger, 
  extractToken,
  tokenValidation,
  fileValidationHandler,
  unknownEndpoint
};