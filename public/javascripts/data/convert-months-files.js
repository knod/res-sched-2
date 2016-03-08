// convert-months-files.js
// http://stackoverflow.com/questions/7041638/walking-a-directory-with-node-js
// Converts a folder full of csv files into another folder
// full of json files. Specifically for files with lines
// of csv's that are ints

// Specifically to convert the by-month list of combo indexes

var fs 				= require( 'fs' );
	montshToJSON 	= require('./convert-one-month.js');

var convertAllMonthFiles = function ( csvDir, jsonDir ) {
// csvDir = folder the csv files are already in
// jsonDir = folder the new json files should go in (old files
// will be overwritten)

	fs.readdir( csvDir, function each(err, list) {

		list.forEach(function convert(filename) {

			var path 	= csvDir + '/' + filename,
				newPath = filename.split('.')[0],
				newPath	= jsonDir + '/' + newPath + '.json';

			montshToJSON( path, newPath );

		});  // end for each file
	});  // end readdir()
}

module.exports = convertAllMonthFiles;

// ===================================
// Tests
// ===================================
convertAllMonthFiles( 'csv-test', 'json-test' );
