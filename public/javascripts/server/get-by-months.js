/* generate.js
* 
* public/javascripts/server/generate.js
* 
* TODO:
* - ??: Somehow keep track of which resident's schedule is
* 	being most difficult?
* - ??: Somehow make sure residents can't reject slots that
* 	they've already scheduled/say they want
* - Polish - (UH has rural) if (resident['dh_uh'] === 'dh')
* 	{ turn Rural into Elective }
* 	- Maybe make sure it hasn't got easy months on both sides,
* 		or turn it into Elective then rank based on bro's ranking
* 		algorithm
* - !!: Turn any dh resident's 2's into 3's
* 
* DONE:
* - UH - no Rural and Winter Park next to each other
* - No UH in both Derm and Cardio at the same time
* 
*/

var fs 				= require('fs');
var constraints 	= require('./constraints.js');
var convertMonth 	= require('../data/convert-one-month.js');

'use strict';

// Path to where combo data by vacation month is kept, in format for fs.readFile()
var monthsDir 	= __dirname + '/../data/easy/by-month';  // For local call
// console.log('--------- directory:', fs.readdirSync(__dirname + '/../')); //+ '/../res-sched-app/'));// + '/../javascripts'));

var monthMap = constraints.monthMap;

// =============================================================
// |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
// =============================================================
// =============================
// GET LIST OF INDEXES OF POSSIBLITIES FOR RESIDENTS
// =============================

var vacationLimitation = function( vacations ) {
// MAX 3 VACATIONS IN THIS PARAMETER!!!
// Access files instead Returns the possible schedules available to someone with
// vacations requested in their vacations array
// In a file, each row is one index number. The numbers/indexes start at 1, not 0
// add 1? subtract 1?

	var filename 	= '',
		indexes 	= [];

	for ( var vaci = 0; vaci < vacations.length; vaci++ ) {

		// This assumes we get months as a string of Jan, Feb, etc., not ints
		// brobot started with Jan = 1;
		var month = monthMap[ vacations[ vaci ] ] + 1;
		filename += month;
		if ( vaci !== vacations.length - 1 ) { filename += '_' }

	}

	// If there were no vacations requested, just return the big list
	if ( filename !== '' ) {
		// Get file with info ordered by vacation months
		indexes = convertMonth( monthsDir + '/' + filename + '.csv' );
	}  // end if any filename

	return indexes;
};  // End vacationLimitation()


var getPossible = function( resids, includeLimit ) {
// This is all with a specific set of input for the program
// If we get different input, all bets are off, though maybe
// we should save the results we got from the old inputs
// console.log('----- generating from:', resids);
	residents = resids;

	// Assign all possible schedules to each resident
	for ( var resi = 0; resi < residents.length; resi++ ) {//residents.length; resi++ ) {
		// Start with a seed resident
		var resident = residents[ resi ];
		// Get their list of possible schedules using their vacation months
		resident.possible 	  = vacationLimitation( resident.vacationMonths );

		// If this is the case, something has gone wrong earlier on.
		// Try to figure it out and tell the person running the program
		// TODO: Better - try to make sure this can't possibly happen by limiting input
			// No rejections same as desired slots
			// No vacations more than there are vacation months (xxactually, no more than 3 atm)
				// DONE: Added way to add more possible vacations. Max is not checked though.
			// May want to add way to have additional vacation months
		if (resident.possible.length <= 0 ) {
			console.error('Hmm, no schedule for this resident?', resident.possible );
		}
	}  // end for every resident, assign possible schedules


	// return sorted;
	return residents;
	// return simplified;
};  // End getPossible()


// var oneOption = generate(constraints.residents, false)
// console.log(oneOption[0].selected);


module.exports = getPossible;
