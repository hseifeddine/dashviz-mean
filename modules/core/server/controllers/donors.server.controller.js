'use strict';

var path = require('path'),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  Donors = mongoose.model('Donors');

exports.list = function (req, res) {
  Donors.find().exec(function (err, donors) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(donors);
    }
  });
};

exports.donorByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Donor is invalid'
    });
  }

  Donors.findById(id).exec(function (err, donor) {
    if (err) {
      return next(err);
    } else if (!donor) {
      return res.status(404).send({
        message: 'No donor with that identifier has been found'
      });
    }
    req.donor = donor;
    next();
  });
};