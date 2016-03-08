// schedule.js
// Middleman between front end sending data to back end
// '/' refers to whatever we have in app.js to pick up this info (app.use('/settings', require('./routes/schedule'));)

'use strict' ;

var schedModel 	= require('../models/schedule.js');
var generate 	= require('../public/javascripts/server/generate.js');


var schedRouter = require('express').Router();
module.exports 	= schedRouter;


// LOADING SCHEDULE (Not used yet)
schedRouter.get( '/sched', function onGETRequest( request, response, next ) {
// If schedRouter gets a get request for '/' (user is loading),
// get data about all keys and send it to the user

	schedModel.find( function (err, schedData) {
		if (err) { next( err ) }
		else { response.send( schedData ) }
	});

});  // End on get '/'


// SAVING SCHEDULES (Not used yet)
schedRouter.post( '/save', function onPOSTRequest( request, response, next ) {
// If schedRouter gets a POST (edit) request for '/submit' (user wants to save
// a schedule), generate new data for the schedule so they can be retrieved
	console.log('saving for user to look at/download later');//:', request.body);
	
	schedModel.create( request.body, function(err, schedData) {
		// ??: Should convert to csv data first?
		if (err) { next( err ) }
		else {
			// Don't know the right number
			response.status( 201 );  // Can use this to show visually that it's been processed
			response.json( schedData );  // Does this send too?
			// ??: Do we need id to be able to delete it later?
			// response.send( generated );
		}

	});
});  // End on post '/submit'


// PROCESSING AND RETURNING
schedRouter.put( '/', function onPUTRequest( request, response, next ) {
// If schedRouter gets a PUT (edit) request for '/' (user is editing),
// generate new data for the schedule and send it back
	console.log('generating object to be displayed on page');//:', request.body);
	
	var myRequirements 	= request.body;
	// As long as generate runs synchronously
	var generated 		= generate( myRequirements );

	if (err) { next( err ) }
	else {
		response.status( 200 );  // Can use this to show visually that it's been processed
		response.json( generated );  // Does this send too?
		// response.send( generated );
	}
});  // End on put '/'


// DELETING (Not used yet)
schedRouter.delete( '/:id', function onDELETERequest( request, response, next ) {
// If schedRouter gets a DELETE request for '/' (user is deleting),
// delete an existing key in the database
	console.log('destroying object with id:', request.params.id)

	// .id matches :id. Could be .bob if it were :bob
	schedModel.findByIdAndRemove( request.params.id, function ( err, x ) {
		console.log('what is this?', x)
		if (err) { next( err ) }
		else {
			response.status( 204 );  // Can use this to show visually that it's been edited (and saved)
			response.send();  // Don't really need to send them anything
		}
	});
});  // End on post '/'
