//

const appRouter = function(app) {

  // data to populate place name list on the client
  app.get("/data", function(req, res) {

    return res.status(200).send({data: 'data'});

  });


};

module.exports = appRouter;