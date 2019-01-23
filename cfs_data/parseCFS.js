const fs = require('fs');
const Papa = require('papaparse');

const file = fs.createReadStream('./cfs_2012_pumf.csv');

console.log('Loading CFS-ZIP lookup');
const cfs_lookup = require('./cfs_lookup.json');
console.log('Finished loading CFS-ZIP lookup');

let data = [];
let count = 0;


Papa.parse(file, {
  header: true,
  worker: false,
  step: function(result) {
    count++;

    if(count % 100000 === 0) {
      console.log('row: ' + count);
    }
    const row = result.data[0];

    // only truckload movements
    const truck_mode = row.MODE === '03' || row.MODE === '04' || row.MODE === '05';
    const local_shipment = row.ORIG_CFS_AREA === row.DEST_CFS_AREA;
    const non_contiguous = ['02-99999', '15-46520', '15-99999'];
    const contiguous_usa = !non_contiguous.includes[row.ORIG_CFS_AREA] && !non_contiguous.includes[row.DEST_CFS_AREA];
    const suppressed = row.ORIG_CFS_AREA.includes('00000') || row.DEST_CFS_AREA.includes('00000');
    if(truck_mode && !local_shipment && contiguous_usa && !suppressed ){
      const mod_row = {
        ID: Number(row.SHIPMT_ID),
        S: row.SCTG,
        O: cfs_lookup[row.ORIG_CFS_AREA].ZCTA5CE10,
        D: cfs_lookup[row.DEST_CFS_AREA].ZCTA5CE10,
        W: Number(row.WGT_FACTOR)
      };
      data.push(mod_row);
    }

    return {};
  },
  complete: function(results, file) {
    console.log("Total Rows: " + data.length);

    const stream = fs.createWriteStream("parsed_cfs.json");
    stream.once("open", fd => {
      stream.write('[');
      const len = data.length;
      data.forEach((d, i)=> {
        if(i===len-1) {
          stream.write(JSON.stringify(d));
        } else {
          stream.write(JSON.stringify(d) + ',\n');
        }
      });
      stream.write(']');
      stream.end();
      console.log('Finished parsing CFS data.');
    });

  },
  error: function(err) {
    console.log(err);
  }
});
