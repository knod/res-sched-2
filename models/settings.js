// settings.js

'use strict';

var mongoose = require('mongoose');

// // About the validity of the data. What a key will look like.
// var settSchema = new mongoose.Schema([
// 	{
// 		name: String,
// 		vacationMonths: [String],
// 		extraVacationMonths: [String],
// 		requested: [{month: String, rotation: String}],
// 		rejected: [{month: String, rotation: String}],
// 		possible: [[int]],
// 		'dh-uh': String,
// 		selected: String,
// 		locked: boolean,
// 		lockedMonths: [String]
// 	}
// ]);

// Non-strict, for now till I understand what the structure should look like
var settSchema = new mongoose.Schema( {}, {strict: false} );

// Register the schema to a model, which is actually in charge of persisting the data.
// String is like a folder name. Usually wouldn't be plural
var settModel = mongoose.model( 'Settings', settSchema );

module.exports = settModel;
