//
const present = require('present');

const start_time = present();
console.log('Attempting to load CFS data.  This may take a while.');

const data = require('../../cfs_data/parsed_cfs.json');
const time = present() - start_time;
console.log(`CFS data loaded in ${time} ms.`);

const appRouter = function(app) {

  // data to populate place name list on the client
  app.get("/get-data", function(req, res) {

    const naics = (req.query.naics || '').split(",").map(d=> Number(d));

    const result = naics.length === 0 ? data : data.filter(d=> {
      return naics.includes(d.N)
    });


    return res.status(200).send({data: result});

  });


};

module.exports = appRouter;