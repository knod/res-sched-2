// convert-one-month.js

var fs = require('fs');

'use strict'

// Based on http://stackoverflow.com/a/7431565/3791179
var oneMontCSVtoJSON = function ( oldFilePath, newFilePath ) {
// Only converts my very specific csv's. And only arrays, not objects.

	var data 	= fs.readFileSync( oldFilePath ),
		allText = data.toString();

    var allTextLines = allText.split(/\r\n|\n/);

    var schedIndexes = [];
    for (var i = 0; i < allTextLines.length; i++) {
        var item = parseInt( allTextLines[ i ] );

        // If there's a blank paragraph at the end (or anywhere). Don't include it.
        if ( !isNaN(item) ) {
            schedIndexes.push( parseInt( allTextLines[ i ] ) );
        } else {
            // console.log('*********** one blank paragraph at the end ***********', item);
        }

    }

    if ( newFilePath ) {
        var json = JSON.stringify( schedIndexes )
    	fs.writeFileSync( newFilePath, json );
    }

    return schedIndexes;
};

module.exports = oneMontCSVtoJSON;


// ===================================
// Tests
// ===================================
// console.log( oneMontCSVtoJSON( 'csv-test/csv-test1.csv' ) )
