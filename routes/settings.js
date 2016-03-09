// settings.js

'use strict'

var settModel 	= require('../models/settings.js');


var settRouter = require('express').Router();
module.exports 	= settRouter;


// LOADING Settings (Not used yet)
settRouter.get( '/settings', function onGETRequest( request, response, next ) {
// If settRouter gets a get request for '/' (user is loading),
// get data about all keys and send it to the user

	// /settings/:id <- from ._id of object
	//.findById( request.params.id, function(err, foundObj ) {})
	// /settings/:foo <- from ._id of object
	//.findById( request.params.foo, function(err, foundObj ) {})
	console.log('getting settings');
	settModel.find( function (err, residentData) {
		if (err) {
			console.log('err getting settings')
			response.status(500).send('No settings?');
			next( err )
		}
		else { 
			console.log('no error getting settings')
			response.json( residentData )
		}
	});

});  // End on get '/'


// SAVING Settings (Not used yet)
// !!??: Is '/settings' right?
settRouter.post( '/settings', function onPOSTRequest( request, response, next ) {
// If settRouter gets a POST request for '/' (user is saving),
// save the changes in the database
	console.log('saving request.body to save settings:', request.body)
	settModel.create( request.body, function (err, residentData) {
	// request.body contains the new schedule data
		
		if (err) {
			next( err )
			response.status(500).send('No settings?');
		}
		else {
			response.status( 201 );  // Can use this to show visually that it's been saved
			// this residentData will be the data from the database, so it'll have a ._id
			// !!??: How to get id again?
			response.json( residentData._id );  // Send this so we can get the id?
		}
	});
});  // End on post '/settings'
