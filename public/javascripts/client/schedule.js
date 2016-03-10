/* schedule.js
* 
* - Data/Schedule -
* generate data/schedule
* display data/schedule
* save data/schedule
* convert data/schedule to csv and make available
* 
*/

// knod: try adding the ajax option contentType: 'application/json' and if you're expecting a json response, leave dataType: 'json'

'use strict'

var ScheduleHandler = function( settingsHandler ) {

	var handler = {};


	handler.load = function( err, residents ) {
	/* 
	* residents = [ {resident: {}, schedule: []} ]
	*/
		// For now. There must be a better way.
		if ( err ) {
			console.log('generation err:', err )
		} else {
			if ( residents !== null ) {
				// Loading new settings
				page.load( $('tbody')[0], residents );
			}
		}

		return residents;
	};  // End handler.load()


	handler.generate = function( residents, callback ) {
	/* 
	* 
	* Generates a schedule with residents
	* TODO: Add way to tell if uh cardio/derm limit should be attempted
	*/
		// Show loading visuals
		$('.loading').removeClass('ghost');
		$('table').addClass('hidden');
		$('.generate').addClass('hidden');

		// Asynchronous $.ajax
		$.ajax({
			// ??!!: Is this right?
			url: '/generate/',// + newObj._id,  // Stuff in start of app.js (app.use('/x', require('./routes/x') );) & mongo's _id for objects
			method: 'PUT',  // Basically 'edit'
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify( {residents: residents, limiter: false} )
		})  // End $.ajax() (sort of)
		.then( function successHandler( residentData, responseText ) {
		// Only fires on a successful request. If this gets run, we've actually saved
		// responseText should be the string 'created'
			if ( responseText === 'No Content' ) { console.log('response was "No Content"'); }
			console.log('inside handler.generate() success')
			// console.log('generated:', residentData);
			handler.load( null, residentData );  // ??: Does this have a ._id?

			// Hide loading visuals
			$('.loading').addClass('ghost');
			$('table').removeClass('hidden');
			$('.generate').removeClass('hidden');

		}, function errHandler( err ) {
			console.error( 'tried to generate:', err );
			handler.load( err, null );

			// Hide loading visuals
			$('.loading').addClass('ghost');
			$('table').removeClass('hidden');
		});  // End .then(), which ends $.ajax()

	};  // End handler.generate()


	handler.save = function() {};  // End handler.save()


	handler.csv = function() {};  // End handler.csv()


	handler.cancel = function() {
		// Asynchronous $.ajax
		$.ajax({
			// ??!!: Is this right?
			url: '/cancel',// + newObj._id,  // Stuff in start of app.js (app.use('/x', require('./routes/x') );) & mongo's _id for objects
			method: 'PUT',  // Basically 'edit'
			data: 'cancel'
		})  // End $.ajax() (sort of)
		.then( function successHandler( residentData, responseText ) {
		// Only fires on a successful request. If this gets run, we've actually saved
		// responseText should be the string 'created'
			if ( responseText === 'No Content' ) { console.log('response was "No Content"'); }

		}, function errHandler( err ) {
			console.error( 'tried canceling:', err );
		});  // End .then(), which ends $.ajax()
	};  // End handler.cancel()



	return handler;
};  // End ScheduleHandler() {}
