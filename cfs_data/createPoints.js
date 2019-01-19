// node --max-old-space-size=4096 createPoints.js

const fs = require('fs').promises;
const turf = require('@turf/turf');

main();

async function main() {

  // load manually created cfs points file
  const cfs_points = JSON.parse(await fs.readFile('./cfs_points.geojson'));

  // read census zcta areas
  const zip_geojson = JSON.parse(await fs.readFile('./zip.geojson'));

  // tag cfs_points with the zip number that they fall within
  const tagged = turf.tag(cfs_points, zip_geojson, 'ZCTA5CE10', 'ZCTA5CE10');

  // to flat json
  const json = tagged.features.map(pt=> {
    return pt.properties;
  });

  // to keyed object
  const obj = {};
  json.forEach(d=> {
    obj[d.cfs] = d;
  });

  await fs.writeFile("cfs_lookup.json", JSON.stringify(obj), "utf8");
}