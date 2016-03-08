/* schedule.js
* 
* - Data/Schedule -
* generate data/schedule
* display data/schedule
* save data/schedule
* convert data/schedule to csv and make available
* 
*/

'use strict'

var ScheduleHandler = function( settingsHandler ) {

	var handler = {};


	handler.load = function( err, options ) {
	/* 
	* 
	* options = [ { scheds: [ {resident: {}, schedule: [], rank: #} ], rank: # } ]
	* 
	*/
		var schedule = options[0];

		// For now. There must be a better way.
		var residents = [];
		for ( var resi = 0; resi < schedule.length; resi++ ) {}



		return options;
	};  // End handler.load()


	handler.generate = function( residentData ) {
	/* 
	* 
	* Generates a schedule with residentData
	* 
	*/
		// Asynchronous $.ajax
		$.ajax({
			// ??!!: Is this right?
			url: '/schedule/',// + newObj._id,  // Stuff in start of app.js (app.use('/x', require('./routes/x') );) & mongo's _id for objects
			method: 'PUT',  // Basically 'edit'
			data: residentData
		})  // End $.ajax() (sort of)
		.then( function successHandler( schedule, responseText ) {
		// Only fires on a successful request. If this gets run, we've actually saved
		// responseText should be the string 'created'
			console.log('saved over/edited');
			if ( responseText === 'No Content' ) { console.log('response was "No Content"'); }
			handler.load( null, schedule );  // ??: Does this have a ._id?

		}, function errHandler( err ) {
			console.error( err );
			handler.load( err, null );
		});  // End .then(), which ends $.ajax()

	};  // End handler.generate()


	handler.save = function() {};  // End handler.save()


	handler.csv = function() {};  // End handler.csv()





	return handler;
};  // End ScheduleHandler() {}
