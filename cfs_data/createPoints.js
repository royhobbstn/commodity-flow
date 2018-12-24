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

  // to flat json
  const json = pts.map(pt=> {
    return Object.assign({}, pt.properties, {lat: pt.geometry.coordinates[1], lng: pt.geometry.coordinates[0]});
  });

  // to keyed object
  const obj = {};

  json.forEach(d=> {
    obj[`${d.ANSI_ST}-${d.CFS12_AREA}`] = d;
  });

  await fs.writeFile("cfs_lookup.json", JSON.stringify(obj), "utf8");
}