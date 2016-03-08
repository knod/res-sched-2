// manage-db.js

'use-strict'

var mongoose 	= require('mongoose');
var connection 	= mongoose.connect( 'mongodb://localhost/not-sure-what-goes-here' );

module.exports 	= connection;
