
const fs = require('fs').promises;

main();

async function main() {

  let raw_zip_data;
  try {
    raw_zip_data = JSON.parse(await fs.readFile('./zip.geojson'));
  } catch (e) {
    console.log(e);
    process.exit();
  }

  // create a zip:{lat,lng} lookup among known zips
  const known_zip_lookup = {};

  raw_zip_data.features.forEach(zip => {
    known_zip_lookup[zip.properties.ZCTA5CE10] = {lat: Number(zip.properties.INTPTLAT10), lng: Number(zip.properties.INTPTLON10)};
  });


  // create an aggregated lookup for every 1, 2, 3, 4 and 5 digit zip combination
  const calc_avg = {};

  [1,2,3,4,5].forEach(digit => {
    for(let i = 0; i <= String("9".repeat(digit)); i++) {
      let lat = 0;
      let lng = 0;
      let count = 0;
      Object.keys(known_zip_lookup).forEach(key => {
        if( ("0" + String(i)).slice(-digit) === key.substring(0,digit)) {
          lat += known_zip_lookup[key].lat;
          lng += known_zip_lookup[key].lng;
          count++;
        }
      });
      if(count) {
        calc_avg[("0".repeat(digit) + String(i)).slice(-digit)] = {lat: (lat/count), lng: (lng/count)};
      }
    }
  });

  // create final zip lookup, going down the chain between 5, 4, 3, 2 and 1 digit zips as needed
  // until a populated zip is found
  const keyed_lookup = {};

  for(let i = 0; i <= 99999; i++) {
    const str_zip_5 = ("00000" + String(i)).slice(-5);
    const str_zip_4 = ("00000" + String(i)).slice(-4);
    const str_zip_3 = ("00000" + String(i)).slice(-3);
    const str_zip_2 = ("00000" + String(i)).slice(-2);
    const str_zip_1 = ("00000" + String(i)).slice(-1);

    if(calc_avg[str_zip_5]) {
      keyed_lookup[str_zip_5] = calc_avg[str_zip_5];
    } else if(calc_avg[str_zip_4]) {
      keyed_lookup[str_zip_5] = calc_avg[str_zip_4];
    }else if(calc_avg[str_zip_3]) {
      keyed_lookup[str_zip_5] = calc_avg[str_zip_3];
    }else if(calc_avg[str_zip_2]) {
      keyed_lookup[str_zip_5] = calc_avg[str_zip_2];
    }else if(calc_avg[str_zip_1]) {
      keyed_lookup[str_zip_5] = calc_avg[str_zip_1];
    }

  }

  // TODO add entropy to avoid zips having same coordinates

  await fs.writeFile('./zip_lookup.json', JSON.stringify(keyed_lookup), 'utf8');

}