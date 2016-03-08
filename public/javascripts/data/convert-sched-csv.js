// convert-sched-csv.js

var fs = require('fs');

'use strict'

// Based on http://stackoverflow.com/a/7431565/3791179
var csvSchedToJSON = function ( oldFilePath, newFilePath ) {
// Only converts my very specific csv's. And only arrays, not objects.

	var data 	= fs.readFileSync( oldFilePath ),
		allText = data.toString();

    var allTextLines = allText.split(/\r\n|\n/);
    // var headers = allTextLines[0].split(',');
    var lines = [];

    for (var i = 0; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');

        var row = [];
        for ( var dati = 0; dati < data.length; dati++ ) {
        	row.push( parseInt( data[ dati ] ) );
        }

        lines.push( row );
    }

    if ( newFilePath ) {
        var json = JSON.stringify( lines )
    	fs.writeFileSync( newFilePath, json );
    }

    return lines;
};

module.exports = csvSchedToJSON;


// ===================================
// Tests
// ===================================
// console.log( csvSchedToJSON( 'combo-csv-test.csv' ) )
