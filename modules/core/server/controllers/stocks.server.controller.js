'use strict';

var path = require('path'),
  mongoose = require('mongoose'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  Stocks = mongoose.model('Stocks');

exports.list = function (req, res) {
  Stocks.find().exec(function (err, stocks) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(stocks);
    }
  });
};

exports.stockByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Stock is invalid'
    });
  }

  Stocks.findById(id).exec(function (err, stock) {
    if (err) {
      return next(err);
    } else if (!stock) {
      return res.status(404).send({
        message: 'No stock with that identifier has been found'
      });
    }
    req.stock = stock;
    next();
  });
};