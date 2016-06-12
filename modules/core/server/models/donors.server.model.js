'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var donorsSchema = new Schema({
    _projectid: { type: String, required: true },
    _teacher_acctid: { type: String, required: true },
    _schoolid: { type: String, required: true },
    school_ncesid: { type: Number, required: true },
    school_latitude: { type: Number, required: true },
    school_longitude: { type: Number,required: true },
    school_city: { type: String, required: true },
    school_state: { type: String, required: true },
    school_zip: { type: Number, required: true },
    school_metro: { type: String, required: true },
    school_district: { type: String, required: true },
    school_county: { type: String, required: true },
    school_charter: { type: String, required: true },
    school_magnet: { type: String, required: true },
    school_year_round: { type: String, required: true },
    school_nlns: { type: String, required: true },
    school_kipp: { type: String, required: true },
    school_charter_ready_promise: { type: String, required: true },
    teacher_prefix : { type: String, required: true },
    teacher_teach_for_america: { type: String, required: true },
    teacher_ny_teaching_fellow: { type: String, required: true },
    primary_focus_subject: { type: String, required: true },
    primary_focus_area: { type: String, required: true },
    secondary_focus_subject: { type: String },
    secondary_focus_area: { type: String },
    resource_type: { type: String, required: true },
    poverty_level: { type: String, required: true },
    grade_level: { type: String, required: true },
    vendor_shipping_charges: { type: String },
    sales_tax: { type: String },
    payment_processing_charges: { type: String },
    fulfillment_labor_materials: { type: String },
    total_price_excluding_optional_support: { type: Number, required: true },
    total_price_including_optional_support: { type: Number, required: true },
    students_reached: { type: Number, required: true },
    total_donations: { type: Number, required: true },
    num_donors: { type: Number, required: true },
	eligible_double_your_impact_match: { type: String, required: true },
	eligible_almost_home_match: { type: String, required: true },
	funding_status: { type: String, required: true },
	date_posted: { type: String, required: true },
	date_completed: { type: String, required: true },
	date_thank_you_packet_mailed: { type: String, required: true },
	date_expiration: { type: String, required: true }
}, {
    timestamps: true
});

var Donors  = mongoose.model('Donors', donorsSchema);
