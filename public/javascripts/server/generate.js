/* generate.js
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

// var combosFile 	= fs.readFileSync('combos-test.json');
var combosFile 	= fs.readFileSync(__dirname + '/../data/combos.json');
var combosArr 	= JSON.parse(combosFile);

// Path to where combo data by vacation month is kept, in format for fs.readFile()
var monthsDir 	= '../../../../../../../Dropbox/ResSchedule';

// var residents 	= [constraints.residents[0], constraints.residents[1]],
var residents 	= constraints.residents,
// var residents 	= constraints.residents.splice(-9),
	rotations 	= constraints.rotations,
	vacRot 		= constraints.vacationRotations,
	tracker 	= constraints.requirementTracker,
	uhConflicts = constraints.uhConflicts,
	rotationMap = constraints.rotationMap,
	monthMap 	= constraints.monthMap;



// =============================================================
// |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
// =============================================================
// ============================
// CHECKERS AND TRACKERS
// ============================
var bareMinimum = function ( tracker ) {
// Depends on global var `rotations`
// rotations = [ {}, {...perMonth: [ {min: #, max: #} * 12 ]} ]
// tracker = [ [], [# * 12] ]
// Same indexes for rotations and for tracker
	var meetsMins = true;

	// Remember, these start at 1 because of brobot's data generation methods (uses R)
	for ( var roti = 1; roti < tracker.length; roti++ ) {

		var requirementsRot = rotations[ roti ],
			trackerRot 		= tracker[ roti ];

		// For every month in every rotation requirements and tracker accumulations
		for ( var monthi = 0; monthi < requirementsRot.length; monthi++ ) {
			// Get the minimum requirement for residents per month
			var min 	= requirementsRot[ monthi ].min,
				actual 	= trackerRot[ monthi ];
			// If even one minimum requirement isn't met, this schedule isn't valid
			if ( actual < min ) { meetsMins = false; }
		}


	}  // end for every tracker and requirement rotation record

	return meetsMins;
};  // End bareMinimum()


var wpVsruralConflicts = function( sched, resident ) {
// If the resident is a 'uh' resident, make sure
// there's no consecutive Rural and Winter Park

	var failed = false;

	// If they're uh, they can't have rural next to wp
	if ( resident['dh_uh'] === 'uh' ) {
		// schedule to string so we can check it more easily
		var str = sched.join('');
		// DEBUGGING
		if (resi === 9) {
			console.log('sched joined:', str);
		}

		// .match() returns null if nothing was found
		var found1 = str.match(/25/),
			found2 = str.match(/52/);
		// If found1 or found2 found something, failed is true
		// Force it to be a boolean
		failed = !!found1 || !!found2;
	}

	return failed;
};  // End wpVsruralConflicts()


var tooMany = function ( sched, tracker, resident ) {
// resi for debugging

	var exceedsLimit = false;

	for ( var monthi = 0; monthi < sched.length; monthi++ ) {

		// Get the index of the rotation so we can find it in the rotation list
		var rotationIndx = sched[ monthi ];
		// and in the requirements tracker. Get a temporary number to check against requirements
		var tempAdd = tracker[ rotationIndx ][ monthi ] + 1;
		// Get the max allowed in this rotation in this month
		var max = rotations[ rotationIndx ].perMonth[ monthi ].max;

		// If any of the rotationsn go over the limit, this schedule won't work
		if ( tempAdd > max ) {
			exceedsLimit = true;
			// // DEBUGGING
			// if ( resi === 9 ) {
			// 	console.log( 'tooMany() failed. Month:', monthi, '; Rotation:', rotationIndx )
			// }

			// Without break, 115 tries takes ~ 74882ms
			// With break, 115 tries takes ~ 48572 (~1.5 times faster)
			break;
		}
		//console.log('exceeds limit? how? max:', max, ', temp:', tempAdd, ', rotIndx:', rotationIndx, ', month:', monthi )}

		// Make sure UH student isn't in both Cardio and Derm
		// If the rotation index indicates this rotation is Cardio or Derm
		if ( uhConflicts.indexOf(rotationIndx) > -1
				// and if resident is a UH resident
				&& resident['dh_uh'] === 'uh'
				// and if this month already has a resident in Cardio or Derm
				&& tracker[9][monthi] >= 1 ) {

			// This isn't a valid schedule
			exceedsLimit = true;
			break;
		}  // end don't conflict uh resident in Cardio and Derm

	}  // end for every month

	return exceedsLimit;
};  // End tooMany()


var meetsAllReqs = function( resident, sched, tracker) {
// Tests out all the requirements

	var meetsAllReqs 	= true;

	var meetsMaxes 		= !tooMany( sched, tracker, resident ),
		meetsUHConflict = !wpVsruralConflicts( sched, resident );

	// Both have to be true to return true
	return meetsMaxes && meetsUHConflict;
};  // End meetsAllReqs


var trackItUp = function ( resident, sched, tracker ) {
// Updates the program requirements tracker with +1 to the rotation
// in each month of the schedule

	for ( var monthi = 0; monthi < sched.length; monthi++ ) {
		var rotationIndx = sched[ monthi ];
		tracker[ rotationIndx ][ monthi ] = tracker[ rotationIndx ][ monthi ] + 1

		// Update whether a UH student is in Cardio or in Dermatology 
		if ( resident['dh_uh'] === 'uh'
			&& uhConflicts.indexOf(rotationIndx) > -1 ) {
			tracker[9][monthi] += 1
		}
	}

	return sched;
};  // End trackItUp()


// =============================================================
// FOR DEBUGGING
var elapsed = function( oldTime, newTime ) {
	var newTime = newTime || Date.now()
	var ms = newTime - oldTime;
	
	var secs = ms/1000,
		min 	= secs/60,  min = Math.floor(min % 60),
		hours 	= Math.floor(min / 60), secs = secs % 60;

	// return hours + ':' + min + ':' + secs;// + ':' + ms/100 - secs;
	return ms;
};  // End now()
// =============================================================


// =============================================================
// |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
// =============================================================
// ============================
// GETTING RESULTS
// ============================

var rankResult = function( resultArray ) {
// resultArray = [ { resident: resident, sched: schedule, rank: sched index } ]
// Adds up the ranks of all the resident's schedules to get a final rank for
// the year's/program's whole schedule

	var rank = 0;

	for ( var resi = 0; resi < resultArray.length; resi++ ) {
		rank += resultArray[ resi ].rank;
	}

	return rank;
};  // End rankResult()

var tryingOne = 0;  // DEBUGGING
var tryOne = function( residents ) {
// For meeting max requirements
	// var oldTime1 = Date.now();

	var result = {
		scheds: [],
		rank: 0
	};
		// var oldTime2 = Date.now();
	var thisTracker = JSON.parse(JSON.stringify( tracker ));  // global object `tracker`
		// var newTime2 = Date.now();
		// console.log('copy tracker object:', elapsed(oldTime2, newTime2))

	var reached = 0;
		// var oldTime3 = Date.now();
	for ( var resi = 0; resi < residents.length; resi++ ) {
		reached = resi;

		var resident = residents[ resi ];
		var possible = resident.possible;

		var searching 	= true,
			schedIndx 	= 0,
			attemptNum 	= 1;

		// http://stackoverflow.com/a/5915122/3791179
		// Get random schedule
			// var oldTime4 = Date.now();
		while ( searching ) {

			if ( !(resi === (residents.length - 1)) ) {
				// Only try a certain number of times before starting
				// all over again with the first resident
				if (attemptNum > 100000) {
					// console.log('OVER 9000; reached resident', reached);
					// console.log('tryOne() Time elapsed:', elapsed( oldTime1 ) );
					return null;
				}

				// Make sure we don't go over our limit of attempts
				attemptNum += 1
				// Get a random index for the resident's schedule
				schedIndx = Math.floor(Math.random() * possible.length)
			// for the last resident, go through all of them
			} else {
				// -1 because schedIndx gets increased after this check
				if ( !(schedIndx < (possible.length - 1)) ) {
					console.log('NONE FOUND FOR #10', elapsed(oldTime) );
					// console.log( thisTracker )
					// console.log('tryOne() Time elapsed:', elapsed( oldTime1 ) );
					return null;
				}
				schedIndx += 1;
			}
			
			var sched 		= possible[ schedIndx ];
			var meetsReqs 	= !tooMany( resident, sched, thisTracker );
				// var oldTime5 = Date.now();
			// If there's a match
			if ( meetsReqs ) {
				// Increment the tracker so we can match against the next one
					// var oldTime6 = Date.now();
				trackItUp( resident, sched, thisTracker );
					// var newTime6 = Date.now();
					// console.log('trackItUp():', elapsed(oldTime6, newTime6));

				// Rank each result so we can add them at the end?
				result.scheds.push( {
					resident: resident,
					schedule: sched,
					rank: schedIndx
				} )  // add it and go to the next resident

				// Move on to the next resident
				searching = false;

			}  // end if meets reqs
				// var newTime5 = Date.now();
				// console.log('if meetsReqs:', elapsed(oldTime5, newTime5));

		}  // end while searching
			// var newTime4 = Date.now();
			// console.log('while searching:', elapsed(oldTime4, newTime4));

	}  // end for every resident
		// var newTime3 = Date.now();
		// console.log('loop through every resident:', elapsed(oldTime3, newTime3));

	// Rank based on rank of each schedule (though this doesn't
	// work right now because stuff isn't in order of rank)
		var oldTime7 = Date.now();
	result.rank = rankResult( result );
		// var newTime7 = Date.now();
		// console.log('result.rank:', elapsed(oldTime7, newTime7));

	// CAN'T TEST MINS TILL WE TRY 10 ALL TOGETHER
	// // If the final result doesn't meet our minimum requirements
	// var metMins = bareMinimum( thisTracker );
	// if ( !metMins ) {
		// // Send it back to try again
		// result = null;
	// }

	// console.log('tryOne() Time elapsed:', elapsed( oldTime1 ) );

	return result;
};


var oneResult = function( residents ) {
// If haven't met min requirements, try again

	var oldTime = Date.now();
	var result = null;

	while ( result === null ) {
		result = tryOne( residents );
	}

	// console.log('oneResult() Time elapsed:', elapsed( oldTime ) );
	return result;
};  // End oneResult()


// temp
var attempts = 1;
var oldTime = Date.now();
// // ??: Should use indexes of residents below so we can keep track
// // of what's been tried?
// var resCombosUsed = [];
var generateYears = function( residents, numWanted ) {
// Returns
// [ { scheds: [ {resident: {}, schedule: [], rank: #} ], rank: # } ]
	// // DEBUGGING
	// var oldTime = Date.now();
	// console.log('START. Time elapsed:', elapsed( oldTime ));
	// var loopNumber = 1;

	var results = [];

	var done = 0;
	while ( done < numWanted ) {

		// // 1/3.6 mill chance of getting the same combo of residents
		// var randomized 	= shuffle( residents.slice() ),
		// 	progress 	= blankProgress( randomized );

		// // DEBUGGING
		// console.log('-------------------Starting oneResult() while loop-------------------')
		// console.log('Time elapsed:', elapsed( oldTime ), ', loop number:', loopNumber);
		// // END DEBUGGING
		
		var result = oneResult( residents );

		// TODO: Remember successes and never try them again
		results.push( result );
		done += 1;

		// // DEBUGGING
		// loopNumber += 1;
		// console.log('XXXXXXXXXXXXXXXXXX', results.length, 'RESULTS FOUND XXXXXXXXXXXXXXXXXX')
		// // END DEBUGGING

	}

	// Store results somewhere (id by what info was provided?)

	// DEBUGGING
	console.log('END. Time elapsed:', elapsed( oldTime ));

	// console.log('generateYears() Time elapsed:', elapsed( oldTime ) );

	return results;
};  // End generateYears()



// =============================================================
// |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
// =============================================================
// ===============================
// POSSIBLE INDIVIDUAL SCHEDULES
// ===============================

var mustExterminate = function( sched, unwanted ) {
/*
Figures out if this schedule contains stuff the resident
doesn't want
unwanted takes the form [{ month: str, rotations: [str] }]
*/
	var reject = false;

	for ( var uni = 0; uni < unwanted.length; uni++ ) {

		var currReject 	= unwanted[ uni ],
			monthi 		= monthMap[ currReject.month ],
			rotations 	= currReject.rotations;

		for ( var roti = 0; roti < rotations.length; roti++ ) {
			var rotationi = rotationMap[ rotations[ roti ] ]

			// If that month in the schedule contains the rejected rotation, reject
			// If any of rejected slots are hit, it will be rejected
			if ( sched[ monthi ] === rotationi ) { reject = true; }
		}
	}  // end for all unwanted

	return reject;
};  // End mustExterminate()


var upToSnuff = function( sched, wanted ) {
/*
Makes sure the schedule contains the slots desired
*/

	// If there aren't any specified, every schedule is fine
	if ( !(wanted.length > 0) ) { return true; }

	var accept = false;

	for ( var wantedi = 0; wantedi < wanted.length; wantedi++ ) {

		var desired 	= wanted[ wantedi ],
			rotationi 	= rotationMap[ desired.rotation ],
			monthi 		= monthMap[ desired.month ];

		// If that month in the schedule contains the accepted rotation, accept
		// If any of accepted slots are hit, it will be accepted
		if ( sched[ monthi ] === rotationi ) { accept = true; }
	}

	return accept;
};  // End upToSnuff()


var customLimiters = function( resident, possible ) {
/*

Takes out schedules that don't mesh with either already
requested months/rotations or months/rotations that are
specifically not desired
*/
	var unwanted = resident.rejected,
		booked 	 = resident.requested,
		actual 	 = [];

	for ( var schedi = 0; schedi < possible.length; schedi++ ) {

		var sched = possible[ schedi ];

		var hasDesired = upToSnuff( sched, resident.requested );
		if ( hasDesired ) {
			// and doesn't contain slots the resident has rejected
			var reject = mustExterminate( sched, resident.rejected );
			if ( !reject ) {
				// add it to the list of their possible schedules
				actual.push( sched );
			}
		}
	}

	return actual;
};  // End customLimiters()


var addVacations = function( resident, possible ) {

	var extras = resident.extraVacationMonths;

	// If there are no more to add, limits with, don't add any more
	if ( extras.length <= 0 ) { return possible; }

	// Otherwise, get all the months without those vacation months in them
	var actual = [];
	for ( var schedi = 0; schedi < possible.length; schedi++ ) {
	// For each possible schedule

		var sched = possible[ schedi ];
		// For each desired rotation month
		for ( var monthi = 0; monthi < extras.length; monthi++ ) {

			var monthNum = monthMap[ extras[ monthi ] ];
			// Get the rotation number from the current desired month
			// in the current schedule
			var rotationNum = sched[ monthNum ];

			// If that number is one of the rotations that allow vacations, add it
			if ( vacRot.indexOf( rotationNum ) ) {
				actual.push( sched )
			}

		}  // end for every desired month
	}  // end for every possible schedule

	return actual;
};  // End addVacations()


var vacationLimitation = function( vacations ) {
// MAX 3 VACATIONS IN THIS PARAMETER!!!
// Access files instead Returns the possible schedules available to someone with
// vacations requested in their vacations array
// In a file, each row is one index number. The numbers/indexes start at 1, not 0
// add 1? subtract 1?

	var filename 	= '',
		result 		= [];

	for ( var vaci = 0; vaci < vacations.length; vaci++ ) {

		// This assumes we get months as a string of Jan, Feb, etc., not ints
		// brobot started with Jan = 1;
		var month = monthMap[ vacations[ vaci ] ] + 1;
		filename += month;
		if ( vaci !== vacations.length - 1 ) { filename += '_' }

	}

	// If there were no vacations requested, just return the big list
	if ( filename === '' ) {
		result = combosArr;
	} else {
		// Get file with info ordered by vacation months
		// var file 	= fs.readFileSync( monthsDir + '/' + filename + '.json' ),
		// 	indexes = JSON.parse( file );
		var indexes = convertMonth( monthsDir + '/' + filename + '.csv' );

		// This array just contains the indexes of the actual combos in the main combo array
		// Get the actual combos
		for ( var i = 0; i < indexes.length; i++ ) {
			// if ( i === 0 ) { console.log( 'filename:', filename, ', check first entry, should be one more that;', combosArr[ indexes[i] - 1 ] ) }  // Shows we get the right indexes - check against file

			// brobot started schedule combo indexes at 1
			result.push( combosArr[ indexes[i] - 1 ] );
		}
	}  // end if any filename

	return result;
};  // End vacationLimitation()



// =============================================================
// |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
// =============================================================
// ===============================
// POLISH
// ===============================

var sortOptions = function( options ) {
// `options` = [ { scheds: [ {resident: {}, schedule: [], rank: #} ], rank: # } ]

	// I think it's like golf in that we want the lowest rank #
	options.sort(function(a, b) {
		return a.rank - b.rank
	})

	return options;
};  // End sortOptions()



// =============================================================
// |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
// =============================================================
// =============================
// DO IT! (ESTABLISH RESIDENTS, FORMAT RESULTS)
// =============================
var generate = function( resids, numWanted ) {
// This is all with a specific set of input for the program
// If we get different input, all bets are off, though maybe
// we should save the results we got from the old inputs

	residents = resids;

	// Assign all possible schedules to each resident
	for ( var resi = 0; resi < residents.length; resi++ ) {//residents.length; resi++ ) {
		// Start with a seed resident
		var resident = residents[ resi ];

		// Get their list of possible schedules using their vacation months
		// var possible = vacationLimitation( residents.vacationMonths, 0, {All: [ [1, 2, 3, 4] ] } );  // Actually use dict of months to patterns
		var possible 	  = vacationLimitation( resident.vacationMonths );  // Actually use dict of months to patterns
		possible 		  = addVacations( resident, possible );
		resident.possible = customLimiters( resident, possible );

		// If this is the case, something has gone wrong earlier on.
		// Try to figure it out and tell the person running the program
		// TODO: Better - try to make sure this can't possibly happen by limiting input
			// No rejections same as desired slots
			// No vacations more than there are vacation months (actually, no more than 3 atm)
			// May want to add way to have additional vacation months
		if (resident.possible.length <= 0 ) {
			console.error('Hmm, no schedule for this resident?', resident.possible );
		}
	}  // end for every resident, assign possible schedules


	var numWanted = numWanted || 10;  // Later will be option users can set

	var options = generateYears( residents, numWanted );
	// var sorted 	= sortOptions( options );  // Can't do this while testing with no metMins
	// var simplified = simplify( options );  // Move this to generating csv's

	// return sorted;
	return options;
	// return simplified;
};  // End getOptions()


module.exports = generate;
