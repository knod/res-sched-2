/* page.js
* 
* Placeholder till settings works
*/

var Page = function () {

	var settings = Settings();
	var schedHandler = ScheduleHandler();

	var page = {}

	page.load = function ( tbody, residents ) {
		settings.load( tbody, residents, true );
	}

	page.update = function ( tbody ) {
		var residents = settings.update( tbody, true );
		return residents;
	}


	return page;
};


