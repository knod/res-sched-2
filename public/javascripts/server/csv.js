// csv.js

'use strict'


var rotations = require('./constraints.js').rotations;


var toCSV = function( optionsArray ) {

	var csv = '';

	// '2016' for extra cell at beginning of table
	var months = [ '2016',
		'Jul', 'Aug', 'Sep', 'Oct',
		'Nov', 'Dec', 'Jan', 'Feb',
		'Mar', 'Apr', 'May', 'Jun'
	];
	// Months row
	for ( var monthi = 0; monthi < months.length; monthi++ ) {
		csv += months[ monthi ];
		// Add a comma to all but the last one
		if ( monthi !== months.length ) {
			csv += ',';
		}
	}
	// Add a new line to prepare for next row
	csv += '\n';

	// Residents rows
	for ( var opi = 0; opi < optionsArray.length; opi++ ) {
		var option = optionsArray[ opi ].scheds;

		var residentRow = '';

		for ( var resi = 0; resi < option.length; resi++ ) {
			var res = option[ resi ];
			// Add name as first cell
			residentRow += res.name + ',';

			var sched = res.schedule;
			// Add other months for other cells
			for ( var monthi = 0; monthi < sched.length; monthi++ ) {
				residentRow += rotations[ sched[ monthi ] ].name;
				// Add a comma to all but the last one
				if ( monthi !== months.length ) {
					csv += ',';
				}
			}

			csv += residentRow + '\n';  // Don't add to last one?
		}  // end for each resident
	}  // end for each option

	return csv;
};  // End toCSV()


module.exports = toCSV;
