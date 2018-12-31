
const present = require('present');

const start_time = present();
console.log('Attempting to load CFS data.  This may take a while.');

const data = require('../cfs_data/parsed_cfs.json');
const time = present() - start_time;

exports.loadData = async function() {
  //
  if(data.length) {
    console.log('Data has been loaded: ' + time + ' ms.');
  } else {
    console.log('Problem loading data');
  }

};