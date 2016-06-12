'use strict';

var path = require('path'),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  EarthQuakes = mongoose.model('EarthQuakes');

exports.list = function (req, res) {
  EarthQuakes.find().exec(function (err, earthQuakes) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(earthQuakes);
    }
  });
};

exports.earthQuakeByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'EarthQuake is invalid'
    });
  }

  EarthQuakes.findById(id).exec(function (err, earthQuake) {
    if (err) {
      return next(err);
    } else if (!earthQuake) {
      return res.status(404).send({
        message: 'No earthQuake with that identifier has been found'
      });
    }
    req.earthQuake = earthQuake;
    next();
  });
};