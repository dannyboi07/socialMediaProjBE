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

function fSizeLimitHandler(err, req, res, next) {
  if (err) {
    return res.status(413).json({ error: "File size limit exceeded, max of 2MB" });
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
  fSizeLimitHandler,
  unknownEndpoint
};