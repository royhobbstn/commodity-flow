const fs = require('fs');
const Papa = require('papaparse');

let data = [];

//
const file = fs.createReadStream('./cfs_2012_pumf.csv');

Papa.parse(file, {
  header: true,
  step: function (result) {
    const row = result.data[0];
    const updated = {
      ORIG: row.ORIG_CFS_AREA,
      DEST: row.DEST_CFS_AREA,
      NAICS: row.NAICS,
      WGT: row.WGT_FACTOR
    };
    if(row.MODE === '03' || row.MODE === '04' || row.MODE === '05'){
      data.push(updated);
    }
  },
  complete: function (results, file) {
    console.log(data.length);
    fs.writeFile('parsed_cfs.json', JSON.stringify(data), 'utf8', (err) => {
      if(err) {
        console.log(err);
      }
      console.log('parsing cfs done.');
    })
  }
});
