// node --max-old-space-size=4096 createPoints.js

const fs = require('fs').promises;
const turf = require('@turf/turf');
const martinez = require('martinez-polygon-clipping');

main();

async function main() {
  const cfs_raw = fs.readFile('./CFS.geojson');
  const usa_raw = fs.readFile('./USA.geojson');

  const [cfs, usa] = await Promise.all([cfs_raw, usa_raw]);

  const cfsGeo = (JSON.parse(cfs)).features.map(d => {
    // intersection seems to only work if everything is named 'MultiPolygon'
    d.geometry.type = 'MultiPolygon';
    return d;
  });
  const usaGeo = (JSON.parse(usa)).features;

  const parts = [];
  let multi = 0;

  usaGeo.forEach(usa => {
    cfsGeo.forEach(cfs => {
      const part = martinez.intersection((usa.geometry.coordinates), (cfs.geometry.coordinates));
      if (part) {
        if (part.length > 1) {
          multi++;
        }
        const updated = JSON.parse(JSON.stringify(cfs));
        updated.geometry.coordinates = part;
        parts.push(updated);
      }
    });
  });

  // if you want to see the intermediate polygon layer, uncomment the line below
  await fs.writeFile("cfs_clipped.geojson", JSON.stringify(turf.featureCollection(parts)), "utf8");

  const pts = parts.map(part => {
    const centroid = turf.pointOnFeature(part);
    return Object.assign({}, part, {geometry: centroid.geometry});
  });

  // if you want to see the intermediate point layer, uncomment the line below
  await fs.writeFile("cfs_points.geojson", JSON.stringify(turf.featureCollection(pts)), "utf8");


  // assign a zip
  const zip_geojson = JSON.parse(await fs.readFile('./zip.geojson'));

  var tagged = turf.tag(turf.featureCollection(pts), zip_geojson, 'ZCTA5CE10', 'ZCTA5CE10');


  // if you want to see the intermediate tagged layer, uncomment the line below
  await fs.writeFile("tagged.geojson", JSON.stringify(tagged), "utf8");

  // to flat json
  const json = tagged.features.map(pt=> {
    return Object.assign({}, pt.properties, {lat: pt.geometry.coordinates[1], lng: pt.geometry.coordinates[0]});
  });

  // to keyed object
  const obj = {};

  // manual overrides
  const override = {
    '02-99999': { lat: 0, lng: 0, ZCTA5CE10: '99503'},
    '06-348': { lat: 0, lng: 0, ZCTA5CE10: '90280'},
    '06-488': { lat: 0, lng: 0, ZCTA5CE10: '94110'},
    '08-216': { lat: 0, lng: 0, ZCTA5CE10: '80203'},
    '12-370': { lat: 0, lng: 0, ZCTA5CE10: '33019'},
    '13-496': { lat: 0, lng: 0, ZCTA5CE10: '31401'},
    '15-99999': { lat: 0, lng: 0, ZCTA5CE10: '96732'},
    '24-12580': { lat: 0, lng: 0, ZCTA5CE10: '21202'},
    '26-99999': { lat: 0, lng: 0, ZCTA5CE10: '49686'},
    '32-332': { lat: 0, lng: 0, ZCTA5CE10: '89102'},
    '48-204': { lat: 0, lng: 0, ZCTA5CE10: '78405'},
    '48-238': { lat: 0, lng: 0, ZCTA5CE10: '79916'}
  };

  json.forEach(d=> {
    if(override[`${d.ANSI_ST}-${d.CFS12_AREA}`]) {
      d.lat = override[`${d.ANSI_ST}-${d.CFS12_AREA}`].lat;
      d.lng = override[`${d.ANSI_ST}-${d.CFS12_AREA}`].lng;
      d.ZCTA5CE10 = override[`${d.ANSI_ST}-${d.CFS12_AREA}`].ZCTA5CE10;
    }
    obj[`${d.ANSI_ST}-${d.CFS12_AREA}`] = d;
  });

  await fs.writeFile("cfs_lookup.json", JSON.stringify(obj), "utf8");
}