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

// var combosFile 	= fs.readFileSync('combos-test.json');
var combosFile 	= fs.readFileSync(__dirname + '/../data/easy/combos.json');
var combosArr 	= JSON.parse(combosFile);

// Path to where combo data by vacation month is kept, in format for fs.readFile()
var monthsDir 	= __dirname + '/../data/easy/by-month';  // For local call
// console.log('--------- directory:', fs.readdirSync(__dirname + '/../')); //+ '/../res-sched-app/'));// + '/../javascripts'));

// var residents 	= [constraints.residents[0], constraints.residents[1]],
// var residents 	= constraints.residents,
// var residents 	= constraints.residents.splice(-9),
var rotations 	= constraints.rotations,
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
	// !!! something wrong with this. requirementsRot is undefined.
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


var wpVsRuralConflicts = function( sched, resident ) {
// If the resident is a 'uh' resident, make sure
// there's no consecutive Rural and Winter Park
	var failed 		= false;

	// If they're uh, they can't have rural next to wp
	if ( resident['dh_uh'] === 'uh' ) {

		// Use the July to Jun calendar to check (that's their actual calendar)
		var lastHalf 	= sched.slice(6),
			firstHalf 	= sched.slice(0, 6),
			julyStart 	= lastHalf.concat( firstHalf );

		// schedule to string so we can check it more easily
		var str = julyStart.join('');
		// // DEBUGGING
		// if (resi === 9) {
		// 	console.log('sched joined:', str);
		// }

		// .match() returns null if nothing was found
		var found1 = str.match(/25/),
			found2 = str.match(/52/);
		// If found1 or found2 found something, failed is true
		// Force it to be a boolean
		failed = !!found1 || !!found2;

	}  // end if resident is 'uh'

	return failed;
};  // End wpVsRuralConflicts()


var tooMany = function ( resident, sched, tracker, num ) {
// resi for debugging

	var exceedsLimit = false;

	for ( var monthi = 0; monthi < sched.length; monthi++ ) {

		// Get the index of the rotation so we can find it in the rotation list
		var rotationIndx = sched[ monthi ];
		// and in the requirements tracker. Get a temporary number to check against requirements
		var tempAdd = tracker[ rotationIndx ][ monthi ] + 1;
		// Get the max allowed in this rotation in this month
		var max = rotations[ rotationIndx ].perMonth[ monthi ].max;

		// // Give more leniency to the last resident in hopes of finding a solution...
		// // Allow another person to be put into one of the flexible rotations
		// if ( resident.last && (rotationIndx === 2 || rotationIndx === 3 ) ) {
		// 	max += 1;
		// }

		// If any of the rotationsn go over the limit, this schedule won't work
		if ( tempAdd > max ) {
			// console.log('Exceeds:', resident.name, monthi, sched, tracker )
			exceedsLimit = true;
			// if ( resident.last && num < 2 ) {
			// 	console.log('----------------', tracker)
			// 	console.log( sched );
			// 	console.log( rotations[rotationIndx].name )
			// }
			break;
		}

		// // Comment out this to try to reduce number of requirements just to see if a solution can be found that way
		// // Make sure UH student isn't in both Cardio and Derm
		// // If the rotation index indicates this rotation is Cardio or Derm
		// if ( cardioDermLimit
		// 		&& uhConflicts.indexOf(rotationIndx) > -1
		// 		// and if resident is a UH resident
		// 		&& resident['dh_uh'] === 'uh'
		// 		// and if this month already has a resident in Cardio or Derm
		// 		&& tracker[9][monthi] >= 1 ) {
		// 	// console.log('conflicting resident', resident.name, resident.dh_uh, tracker[9], monthi)
		// 	// This isn't a valid schedule
		// 	exceedsLimit = true;
		// 	break;
		// }  // end don't conflict uh resident in Cardio and Derm

	}  // end for every month

	return exceedsLimit;
};  // End tooMany()


var meetsAllReqs = function( resident, sched, tracker ) {
// Tests out all the requirements

	var meetsMaxes 		= !tooMany( resident, sched, tracker );//,
		//meetsUHConflict = !wpVsRuralConflicts( sched, resident );

	// Both have to be true to return true
	return meetsMaxes;  // && meetsUHConflict;
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
	var newTime = newTime || Date.now(),
		ms 		= newTime - oldTime;
	
	var secs 	= ms/1000,
		min 	= secs/60,  min = Math.floor(min % 60),
		hours 	= Math.floor(min / 60), secs = secs % 60;

	return hours + ':' + min + ':' + secs;// + ':' + ms/100 - secs;
	// return ms;
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
var tryCount = 0;
var tryOne = function( residents ) {
// For meeting max requirements

	// DEBUGGING
	var reachedCount = { '7': 0, '8': 0, '9': 0 }

	var thisTracker = JSON.parse(JSON.stringify( tracker ));  // global object `tracker`


	for ( var resi = 0; resi < residents.length; resi++ ) {
		reached = resi;

		var resident = residents[ resi ];
		var possible = resident.possible;
		var selected = [];

		var searching 	= true,
			schedIndx 	= 0,
			attemptNum 	= 1;

		// DEBUGGING
		var firstSchedIndx;

		// http://stackoverflow.com/a/5915122/3791179
		// Get random schedule
		while ( searching ) {
			if ( stop ) { return null; }

			// DEBUGGING
			if ( resi > 6 ) { reachedCount[ resi + '' ] += 1 }

			if ( !(resi === (residents.length - 1)) ) {
				// Only try a certain number of times before starting
				// all over again with the first resident
				if (attemptNum > 100000) {
					// if ( resi > 6 ) {
					// 	console.log('OVER 9000; reached resident', reachedCount);
					// }
					return null;
				}

				// Get a random index for the resident's schedule
				schedIndx = Math.floor(Math.random() * possible.length)

				// Make sure we don't go over our limit of attempts
				// Will help if we're stuck on a combination that just doesn't work
				attemptNum += 1

			// for the last resident, go through all of them (took us long enough
			// to get here. Might as we be thorough.)
			} else {
				reachedCount[ resi + '' ] += 1

				// -1 because schedIndx gets increased after this check
				if ( !(schedIndx < (possible.length - 1)) ) {
					// console.log('NONE FOUND FOR #10', reachedCount, firstSchedIndx );
					// console.log( thisTracker )
					// console.log('tryOne() Time elapsed:', elapsed( oldTime1 ) );
					console.log( tryCount++ );  // , elapsed( oldTime ) );  // Just to know something is happening
					return null;
				}
				schedIndx += 1;
			}
 
			// DEBUGGING
			if ( attemptNum === 1 ) { firstSchedIndx = schedIndx; }

			var sched 		= possible[ schedIndx ];

			// if ( resident.name === 'Kelly' ) {
			// 	if ( sched[11] === 7 ) {
			// 		console.log('pcmh in vacation slot.', sched );
			// 	}
			// }
			// var meetsReqs 	= !tooMany( resident, sched, thisTracker, (possible.length - schedIndx) );
			var meetsReqs 	= meetsAllReqs( resident, sched, thisTracker );

			// If there's a match
			if ( meetsReqs ) {
				// console.log('-----------------', resident.name, thisTracker)
				// Increment the tracker so we can match against the next one
					// var oldTime6 = Date.now();
				trackItUp( resident, sched, thisTracker );

				// !!! NEW !!! for just changing residents/residents
				// selected.push( sched );
				resident.selected = sched;
				// console.log(resident.name);

				// Move on to the next resident
				searching = false;
			}  // end if meets reqs
			else {
				// console.log('no fit:', resident.name, sched, tracker)
			}
		}  // end while searching

		// resident.selected = selected;

	}  // end for every resident

	// Rank based on rank of each schedule (though this doesn't
	// work right now because stuff isn't in order of rank)
	// result.rank = rankResult( result );

	// // CAN'T TEST MINS TILL WE TRY 10 ALL TOGETHER
	// // If the final result doesn't meet our minimum requirements
	// var metMins = bareMinimum( thisTracker );
	// if ( !metMins ) {
	// 	// Send it back to try again
	// 	result = null;
	// }

	// return result;
	return residents;
};


var oneResult = function( residents ) {
// If haven't met min requirements, try again

	var result 	= null;

	while ( result === null ) {
		// console.log( 'in oneResult() while loop. stop:', stop )
		if ( stop ) {
			return null;
		}

		result = tryOne( residents );
	}

	return result;
};  // End oneResult()


// temp
var attempts = 1;
var oldTime = Date.now();
var generateYears = function( residents, numWanted ) {
	// 	// // DEBUGGING
	//	// console.log('-------------------Starting oneResult() while loop-------------------')
	// 	// console.log('Time elapsed:', elapsed( oldTime ), ', loop number:', loopNumber);
	// 	// // END DEBUGGING

		var result = oneResult( residents );
		// console.log('----------Ending oneResult()------------')
		// console.log( residents[0].name)

	return result;
};  // End generateYears()



// =============================================================
// |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
// =============================================================
// ===============================
// POSSIBLE INDIVIDUAL SCHEDULES
// ===============================

var dhTransform = function( sched, resident ) {
// Replace Rural with Elec in all DH residents

	var newSched = null;

	if ( resident.dh_uh === 'dh' ) {
		var index = sched.indexOf(2);

		if (index !== -1) {  // Don't think we need this check, but meh
			newSched = sched.slice();
		    newSched[index] = 3;
		}
	}

	return newSched || sched;
};  // End dhTransform


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

	var accept = true;

	for ( var wantedi = 0; wantedi < wanted.length; wantedi++ ) {

		var desired 	= wanted[ wantedi ],
			rotationi 	= rotationMap[ desired.rotation ],
			monthi 		= monthMap[ desired.month ];

		// If a month in the schedule doesn't have the requested rotation, no good
		if ( sched[ monthi ] !== rotationi ) { accept = false; }
	}

	return accept;
};  // End upToSnuff()


var customLimiters = function( resident, possible ) {
/*
Takes out schedules that don't mesh with either already
requested months/rotations or months/rotations that are
specifically not desired
*/
// var length1 = possible.length; var length2 = resident.possible.length; 
// console.log('res possible:', length2, '; original possible:', length1);
	var unwanted = resident.rejected,
		booked 	 = resident.requested,
		actual 	 = [];

	for ( var schedi = 0; schedi < possible.length; schedi++ ) {

		var sched = possible[ schedi ];
		// Not sure it fits here, but don't want to loop through again
		// Replace Rural with Elec in all DH residents
		sched = dhTransform( sched, resident );

		var hasDesired = upToSnuff( sched, booked );
		if ( hasDesired ) {
			// and doesn't contain slots the resident has rejected
			var reject = mustExterminate( sched, unwanted );
			if ( !reject ) {
				// add it to the list of their possible schedules
				actual.push( sched );
			}
		}
	}  // end for every possible schedule

	return actual;
};  // End customLimiters()


var addVacations = function( resident, possible ) {
// NOT WORKING

	var extras = resident.extraVacationMonths;
	console.log( resident.name, extras );

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
		result = combosArr.slice();
	} else {
		// Get file with info ordered by vacation months
		var indexes = convertMonth( monthsDir + '/' + filename + '.csv' );

		// This array just contains the indexes of the actual combos in the main combo array
		// Get the actual combos
		for ( var i = 0; i < indexes.length; i++ ) {
			// brobot started schedule combo indexes at 1
			var indx = indexes[i] - 1;
			// DEBUGGING
			if ( filename === '12' ) {
				// if ( (combosArr[ (indx + 1) ] )[11] === 7 ) {
				// 	console.log('pcmh in vacation slot. Using low. High:', (indx), combosArr[ indx], ', High:', (indx + 1), combosArr[ (indx + 1) ]);
				// }
				if ( (combosArr[ indx ] )[11] === 7 ) {
					console.log('pcmh in vacation slot. Using low. Low:', (indx), combosArr[ indx], ', High:', (indx + 1), combosArr[ (indx + 1) ]);
				}
			}
			result.push( combosArr[ indexes[i] - 1 ].slice() );
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


var unPossible = function( residents ) {
// Make sure not to send back an unnecessary huge list

	for (var resi = 0; resi < residents.length; resi++ ) {
		residents[ resi ].possible = [];
	}

	return residents;
};  // End unPossible()


var stop = false;
var cancel = function() {
	stop = true;
};


// =============================================================
// |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
// =============================================================
// =============================
// DO IT! (ESTABLISH RESIDENTS, FORMAT RESULTS)
// =============================
var cardioDermLimit;
var generate = function( resids, includeLimit ) {
// This is all with a specific set of input for the program
// If we get different input, all bets are off, though maybe
// we should save the results we got from the old inputs
// console.log('----- generating from:', resids);
	residents = resids;
	cardioDermLimit = includeLimit;

	// Assign all possible schedules to each resident
	for ( var resi = 0; resi < residents.length; resi++ ) {//residents.length; resi++ ) {
		// Start with a seed resident
		var resident = residents[ resi ];

		// Get their list of possible schedules using their vacation months
		var possible 	  = vacationLimitation( resident.vacationMonths );
		possible 		  = addVacations( resident, possible );
		resident.possible = customLimiters( resident, possible );

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

	var oneOption = generateYears( residents );
	oneOption 	  = unPossible( oneOption );

	if ( oneOption === null ) {};  // Is this in case of cancel?
	// var sorted 	  = sortOptions( oneOption );  // Can't do this easily with no pre-ranked lists
	// var simplified = simplify( oneOption );  // Move this to generating csv's
	console.log( elapsed( oldTime ) );
	var oneOption = residents;

	// return sorted;
	return oneOption;
	// return simplified;
};  // End getOptions()


// var oneOption = generate(constraints.residents, false)
// console.log(oneOption[0].selected);


module.exports = {generate: generate, cancel: cancel};
