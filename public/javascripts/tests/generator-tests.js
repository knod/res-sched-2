// generator-tests.js

var residents = require('../server/constraints.js').residents;
var generate = require('../server/generate.js')

// // vactationLimitation() - can't without exporting more
// var rotObj = {
// 	All: [],
// 	Jan: {
// 		All: [
// 			[8,7,6,5,4,1,3,1,2,3,1,1],
// 			[8,7,6,5,4,1,3,2,1,3,1,1],
// 			[8,7,6,5,4,2,1,3,1,1,3,1],
// 			[8,7,6,5,4,2,1,3,1,3,1,1]
// 		],
// 		Feb: {
// 			All: [
// 				[8,7,6,5,4,1,3,1,2,3,1,1],
// 				[8,7,6,5,4,1,3,2,1,3,1,1],
// 				[8,7,6,5,4,2,1,3,1,1,3,1],
// 				[8,7,6,5,4,2,1,3,1,3,1,1]
// 			],
// 			Aug: {
// 				All: [
// 					[8,7,6,5,4,2,1,3,1,1,3,1],
// 					[8,7,6,5,4,2,1,3,1,3,1,1]
// 				]
// 			}
// 		}
// 	},
// 	Dec: {
// 		All: [
// 			[1,1,3,1,1,3,2,4,5,6,7,8],
// 			[1,1,3,1,1,3,2,4,5,6,8,7],
// 			[1,1,3,1,1,3,2,4,5,7,6,8]
// 		]
// 	}
// };

// console.log( vacationLimitation( ['Jan', 'Feb', 'Aug'], 0, rotObj ) );
// Result should be: [[8,7,6,5,4,2,1,3,1,1,3,1], [8,7,6,5,4,2,1,3,1,3,1,1]]

// Whole thing
var result = generate(residents, false)
console.log( result[0].selected );
