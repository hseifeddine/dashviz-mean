'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var earthquakesSchema = new Schema({
    
    FID: {
        type: String,
        required: true,
    },
    publicid: {
        type: String,
        required: true,
        unique: true
    },
    origintime: {
        type: String,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },    
    depth: {
        type: Number,
        required: true
    }, 
    magnitude: {
        type: Number,
        required: true
    },     
    magnitudetype: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },       
    phases: {
        type: Number,
        required: true
    },    
    type: {
        type: String,
        required: true
    },
    agency: {
        type: String,
        required: true
    },
    updatetime: {
        type: String,
        required: true
    },
    origin_geom: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

var EarthQuakes = mongoose.model('EarthQuakes', earthquakesSchema);
