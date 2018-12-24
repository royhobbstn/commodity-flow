// created by people much smarter than myself
// derived from: https://github.com/chelm/mbtiles-server && https://github.com/tobinbradley/mbtiles-server

var express = require('express'),
  app = express(),
  MBTiles = require('mbtiles'),
  p = require('path');


// path to the mbtiles; default is the server.js directory
var tilesDir = __dirname + '../network_data';

// Set return header
function getContentType(t) {
  var header = {};

  // CORS
  header['Access-Control-Allow-Origin'] = '*';
  header['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept';

  // Cache
  // header["Cache-Control"] = "public, max-age=2592000";

  // request specific headers
  if (t === 'png') {
    header['Content-Type'] = 'image/png';
  }
  if (t === 'jpg') {
    header['Content-Type'] = 'image/jpeg';
  }
  if (t === 'pbf') {
    header['Content-Type'] = 'application/x-protobuf';
    header['Content-Encoding'] = 'gzip';
  }

  return header;
}

// tile cannon
app.get('/:s/:z/:x/:y.:t', function (req, res) {
  new MBTiles(p.join(tilesDir, req.params.s + '.mbtiles'), function (err, mbtiles) {

    if (err) {
      console.log('error opening database');
      res.set(getContentType('')); // set CORS headers but don't add content type
      res.sendStatus(404);
    }
    else {
      mbtiles.getTile(req.params.z, req.params.x, req.params.y, function (err, tile, headers) {
        if (err) {
          res.set(getContentType('')); // set CORS headers but don't add content type
          res.sendStatus(204);
        }
        else {
          res.set(getContentType(req.params.t));
          res.send(tile);
        }
      });
    }

  });
});

// start up the server
console.log('Listening on port: ' + 4001);
app.listen(4001);