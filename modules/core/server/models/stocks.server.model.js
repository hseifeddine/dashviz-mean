'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stocksSchema = new Schema({
    date: {
        type: String,
        required: true
    },
    open: {
        type: Number,
        required: true
    },
    high: {
        type: Number,
        required: true
    },
    low: {
        type: Number,
        required: true
    },
	close: {
        type: Number,
        default:false
    },
	volume: {
        type: Number,
        default:false
    },
    oi: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

var Stocks = mongoose.model('Stocks', stocksSchema);