const serverless = require('serverless-http');
const express = require("express");
const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

require("./routes/api.js")(app);

const server = app.listen(4001, function() {
  console.log("Listening on port %s...", server.address().port);
});

module.exports.handler = serverless(app);