'use strict';

var path = require('path'),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  Censuses = mongoose.model('Censuses');

exports.list = function (req, res) {
  Censuses.find().exec(function (err, censuses) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(censuses);
    }
  });
};

exports.censusByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Census is invalid'
    });
  }

  Censuses.findById(id).exec(function (err, census) {
    if (err) {
      return next(err);
    } else if (!census) {
      return res.status(404).send({
        message: 'No census with that identifier has been found'
      });
    }
    req.census = census;
    next();
  });
};