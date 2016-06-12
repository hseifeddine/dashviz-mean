'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var censusesSchema = new Schema({
  undergradStatus: {
    type: String,
    required: true
  },
  entryStatus: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  raceEthnicity: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  count: {
    type: Number,
    required: true
  }
}, {
    timestamps: true
  });

var Censuses = mongoose.model('Censuses', censusesSchema);
