
const fs = require('fs');
const Papa = require('papaparse');

let data;

exports.loadData = function() {
  //
  const file = fs.createReadStream('../cfs_data/cfs_2012_pumf.csv');

  Papa.parse(file, {
    header: true,
    worker: true,
    step: function(result) {
      console.log(result);
      process.exit();
      return {};
    },
    complete: function(results, file) {
      console.log('done');
    }
  });
};