// templates.js

'use strict'


var templateRouter = require('express').Router();
module.exports 	= templateRouter;


// SENDING cell/td html template (Not used yet)
templateRouter.get( '/cell', function onGETRequest( request, response, next ) {
// If templateRouter gets a get request for '/' (user is loading),
// get data about all keys and send it to the user

	response.render('custom/cell.jade', {} );  // sends it automatically back

});  // End on get '/'


// SENDING tr/trth html template (Not used yet)
templateRouter.get( '/row', function onGETRequest( request, response, next ) {
// If templateRouter gets a get request for '/' (user is loading),
// get data about all keys and send it to the user

	response.render('custom/tr-th-name.jade', {} );  // sends it automatically back

});  // End on get '/'
