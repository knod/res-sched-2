// constraints.js

'use strict'

var residents = [
	// MAX 3 VACATIONS IN `vacationMonths`!!! OTHERS CAN GO IN `extraVacationMonths`
	// `rejects` is monts and rotations that the resident definitely doesn't want to do
	// each working schedule should be kept with final results
	{
		name: 'Roxi', dh_uh: 'dh', locked: true,
		vacationMonths: ['Jan', 'Feb', 'Apr'], extraVacationMonths: [],
		requested: [{month: 'Jan', rotation: 'Elec'}, {month: 'Mar', rotation: 'FMS'}],
		rejected: [{month: 'Apr', rotations: ['Derm', 'Ger']}],
		possible: [],//, schedule: []
		lockedMonths: [],
		selected: []  // there will be repeats from requested
	},
	{
		name: 'Sarah', dh_uh: 'dh', locked: false,
		vacationMonths: [], extraVacationMonths: [],
		requested: [/*{month:'Aug', rotation:'Rural'}*/],
		rejected: [/*{month:'Aug', rotations: ['FMS','Elec']}*/],
		possible: [],//, schedule: []
		lockedMonths: ['Jul'],
		selected: []  // there will be repeats from requested
	},
	{
		name: 'Will', dh_uh: 'dh', locked: false,
		vacationMonths: [/*"May", "Dec"*/], extraVacationMonths: [],
		requested: [],
		rejected: [],
		possible: [],//, schedule: []
		lockedMonths: [],
		selected: []  // there will be repeats from requested
	},
	{
		name: 'Hayley', dh_uh: 'dh', locked: false,
		vacationMonths: [], extraVacationMonths: [],
		requested: [ {month: 'Jul', rotation: 'Elec'} ],
		rejected: [],
		possible: [],//, schedule: []
		lockedMonths: [],
		selected: []  // there will be repeats from requested
	},
	{
		name: 'Beka', dh_uh: 'uh', locked: false,
		vacationMonths: [], extraVacationMonths: [],
		requested: [ {month: 'Aug', rotation: 'W-P'} ],
		rejected: [],
		possible: [],//, schedule: []
		lockedMonths: [],
		selected: []  // there will be repeats from requested
	},
	{
		name: 'Ali', dh_uh: 'uh', locked: false,
		vacationMonths: [], extraVacationMonths: [],
		requested: [ {month: 'Jul', rotation: 'Elec'} ],
		rejected: [],
		possible: [],//, schedule: []
		lockedMonths: [],
		selected: []  // there will be repeats from requested
	},
	{
		name: 'Alex', dh_uh: 'uh', locked: false,
		vacationMonths: [], extraVacationMonths: [],
		requested: [],
		rejected: [],
		possible: [],//, schedule: []
		lockedMonths: [],
		selected: []  // there will be repeats from requested
	},
	{
		name: 'Lisa', dh_uh: 'uh', locked: false,
		vacationMonths: [], extraVacationMonths: [],
		requested: [],
		rejected: [],
		possible: [],//, schedule: []
		lockedMonths: [],
		selected: []  // there will be repeats from requested
	},
	{
		name: 'Emily', dh_uh: 'uh', locked: false,
		vacationMonths: [], extraVacationMonths: [],
		requested: [],
		rejected: [],
		possible: [],//, schedule: []
		lockedMonths: [],
		selected: []  // there will be repeats from requested
	},
	{
		name: 'Kelly', dh_uh: 'uh', locked: false,
		vacationMonths: [], extraVacationMonths: [],
		requested: [ {month: 'Aug', rotation: 'W-P'} ],
		rejected: [],
		possible: [],//, schedule: []
		lockedMonths: [],
		selected: []  // there will be repeats from requested
	}
];


var numResidents = residents.length,
	numR = numResidents;


var rotations = [
	// Rotation numbers start with 1, so 0 is a placeholder
	// perResident is FMS per resident. Not sure we need it.
	{
		name:'None',
		// perMonth: [ 'Jan', 'Feb', 'Mar',
		// 	'Apr', 'May', 'Jun',
		// 	'Jul', 'Aug', 'Sep',
		// 	'Oct', 'Nov', 'Dec'
		// ],
		perMonth: [ {min: 0, max: numR}, {min: 0, max: numR}, {min: 0, max: numR},
			{min: 0, max: numR}, {min: 0, max: numR}, {min: 0, max: numR},
			{min: 0, max: numR}, {min: 0, max: numR}, {min: 0, max: numR},
			{min: 0, max: numR}, {min: 0, max: numR}, {min: 0, max: numR}
		],
		resTypes: [ 'dh', 'uh' ],
		perResident: {'dh': 0, 'uh': 0},  // Already fulfilled by pre-made combinations
		easy: true,
		vacation: true
	},
	// {  // 1
	// 	name: 'FMS',
	// 	perMonth: [ {min: 3, max: 3}, {min: 3, max: 3}, {min: 3, max: 3},
	// 		{min: 3, max: 3}, {min: 3, max: 3}, {min: 2, max: 2},
	// 		{min: 3, max: 3}, {min: 3, max: 3}, {min: 3, max: 3},
	// 		{min: 3, max: 3}, {min: 3, max: 3}, {min: 2, max: 2}
	// 	],
	//  resTypes: [ 'dh', 'uh' ],
	// 	perResident: {'dh': 1, 'uh': 1},  // Already fulfilled by pre-made combinations
	// 	easy: false,
	// 	vacation: false
	// },
	{  // 1 FMS + AFM
		name: 'FMS',
		perMonth: [ {min: 4, max: 4}, {min: 4, max: 4}, {min: 4, max: 4},
			{min: 4, max: 4}, {min: 4, max: 4}, {min: 2, max: 2},
			{min: 3, max: 3}, {min: 3, max: 3}, {min: 3, max: 3},
			{min: 3, max: 3}, {min: 3, max: 3}, {min: 3, max: 3}
		],
		resTypes: [ 'dh', 'uh' ],
		perResident: {'dh': 4, 'uh': 4},  // Already fulfilled by pre-made combinations
		easy: false,
		vacation: false
	},
	{  // 2
		name: 'Rural',  // Maybe 0 to 1
		perMonth: [ {min: 0, max: numR}, {min: 0, max: numR}, {min: 0, max: numR},
			{min: 0, max: numR}, {min: 0, max: numR}, {min: 0, max: numR},
			{min: 0, max: numR}, {min: 0, max: numR}, {min: 0, max: numR},
			{min: 0, max: numR}, {min: 0, max: numR}, {min: 0, max: numR}
		],
		resTypes: [ 'uh' ],
		perResident: {'dh': 0, 'uh': 1},
		easy: false,
		vacation: false
	},
	{  // 3
		name: 'Elec',
		perMonth: [ {min: 0, max: numR}, {min: 0, max: numR}, {min: 0, max: numR},
			{min: 0, max: numR}, {min: 0, max: numR}, {min: 0, max: numR},
			{min: 0, max: numR}, {min: 0, max: numR}, {min: 0, max: numR},
			{min: 0, max: numR}, {min: 0, max: numR}, {min: 0, max: numR}
		],
		resTypes: [ 'dh', 'uh' ],
		perResident: {'dh': 3, 'uh': 2},
		easy: true,
		vacation: true
	},
	{  // 4
		name: 'Cardio',
		perMonth: [ {min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1},
			{min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1},
			{min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1},
			{min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1}
		],
		resTypes: [ 'dh', 'uh' ],
		perResident: {'dh': 1, 'uh': 1},
		easy: true,
		vacation: false
	},
	{  // 5
		name: 'W-P',
		perMonth: [ {min: 2, max: 2}, {min: 1, max: 1}, {min: 1, max: 1},
			{min: 1, max: 1}, {min: 0, max: 0}, {min: 0, max: 0},
			{min: 0, max: 0}, {min: 2, max: 2}, {min: 0, max: 0},
			{min: 0, max: 0}, {min: 1, max: 1}, {min: 2, max: 2}
		],
		resTypes: [ 'dh', 'uh' ],
		perResident: {'dh': 1, 'uh': 1},
		easy: true,
		vacation: false
	},
	{  // 6
		name: 'Ger',
		perMonth: [ {min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1},
			{min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1},
			{min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1},
			{min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1}
		],
		resTypes: [ 'dh', 'uh' ],
		perResident: {'dh': 1, 'uh': 1},
		easy: true,
		vacation: true
	},
	{  // 7
		name: 'pcmh',
		perMonth: [ {min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1},
			{min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1},
			{min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1},
			{min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1}
		],
		resTypes: [ 'dh', 'uh' ],
		perResident: {'dh': 1, 'uh': 1},
		easy: true,
		vacation: false
	},
	{  // 8
		name: 'Derm',
		perMonth: [ {min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1},
			{min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1},
			{min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1},
			{min: 0, max: 1}, {min: 0, max: 1}, {min: 0, max: 1}
		],
		resTypes: [ 'dh', 'uh' ],
		perResident: {'dh': 1, 'uh': 1},
		easy: true,
		vacation: true
	}
];


// Should be a bit different for DH vs. UH?
// Somehow don't allow vacations for Rural
var vacationRotations = [3, 6, 8];

// dh residents don't have rural, uh residents do
var rural = { dh: false, uh: true };
// Cardio and Derm shouldn't be at the same time
var uhConflicts = [4, 8];


// Also account for no uh in Cardio with uh in Derm
var requirementTracker = [
	[],  // Rotation numbers start with 1, so 0 is a placeholder
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // 1, FMS
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // 2, Rural
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // 3, Elective
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // 4, Cardiology
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // 5, Winter Park
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // 6, Geriatrics
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // 7, PCMH
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],  // 8, Dermatology
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]   // 9, UH in either Derm or Cardio
];

var maxes = [
	[],  // Rotation numbers start with 1, so 0 is a placeholder
	[4, 4, 4, 4, 4, 2, 3, 3, 3, 3, 3, 3],  // 1, FMS
	[9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],  // 2, Rural (actually 10)
	[9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],  // 3, Elective (actually 10)
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // 4, Cardiology
	[2, 1, 1, 1, 0, 0, 0, 2, 0, 0, 1, 2],  // 5, Winter Park
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // 6, Geriatrics
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // 7, PCMH
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],   // 8, Derm
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]   // 9, UH in either Derm or Cardio
];

var rotationMap = { 'None': 0,
	'FMS': 1, 'Rural': 2, 'Elec': 3, 'Cardio': 4,
	'W-P': 5, 'Ger': 6, 'pcmh': 7, 'Derm': 8
	
};

var monthMap = {
	'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
	'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
};

// For node
module.exports = {
	residents: residents, rotations: rotations, requirementTracker: requirementTracker,
	rotationMap: rotationMap, monthMap: monthMap, vacationRotations: vacationRotations,
	uhConflicts: uhConflicts
}
