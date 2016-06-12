'use strict';

module.exports = function (app) {
  // Root routing
  var core = require('../controllers/core.server.controller'),
    censuses = require('../controllers/censuses.server.controller'),
    donors = require('../controllers/donors.server.controller'),
    earthquakes = require('../controllers/earthquakes.server.controller'),
    stocks = require('../controllers/stocks.server.controller');

  var censusPolicy = require('../policies/censuses.server.policy');
  var donorsPolicy = require('../policies/donors.server.policy');
  var earthquakesPolicy = require('../policies/earthquakes.server.policy');
  var stocksPolicy = require('../policies/stocks.server.policy');

  // Census
  app.route('/api/censuses').all(censusPolicy.isAllowed).get(censuses.list);
  // Donors
  app.route('/api/donors').all(donorsPolicy.isAllowed).get(donors.list);
  // EarthQuakes
  app.route('/api/earthquakes').all(earthquakesPolicy.isAllowed).get(earthquakes.list);
  // Stocks
  app.route('/api/stocks').all(stocksPolicy.isAllowed).get(stocks.list);

  // Define error pages
  app.route('/server-error').get(core.renderServerError);

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get(core.renderNotFound);

  // Define application route
  app.route('/*').get(core.renderIndex);
};
