// node --max-old-space-size=2048 createPoints.js

const express = require("express");
const app = express();
const path = require('path');


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

require("./routes/api.js")(app);

const server = app.listen(8080, function() {
  console.log("Listening on port %s...", server.address().port);
});