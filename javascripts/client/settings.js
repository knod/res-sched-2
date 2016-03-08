/* input.js
* 
* - Settings -
* save/update settings (maybe for undo)
* load settings
* 
* What I need to do in general
* - Save data on change to settings
* - Generate data on "submit"
* - Save and provide data on "save"
* - "locked" is just about being able to change options,
* 	not about what data gets processed
* 
* TODO:
* - Make sure month or user can't be locked if a rotation
* 	isn't selected
* - When the user hand-selects a rotation, automatically lock
* 	that month. If then unlocked, keep the selection the same.
* 
*/

'use strict'


var Settings = function() {

	var settings = {};

	settings.history = [];

	// Example resident object
	var resEx = {
		name: 'Judy', 'dh_uh': 'dh', locked: false,
		vacationMonths: ['x'], extraVacationMonths: ['y'],
		requested: [{month: 'x', roation: 'a'}],
		rejected: [{month: 'x', roations: ['b', 'c']}],
		possible: [[4*12]],
		lockedMonths: ['q', 'r'],
		selected: [{month: 's', rotation: 'd'}]
	}


	// ===================================================
	// SAVING/UPDATING
	// ===================================================
	var saveByCell = function( $cell, res ) {
	/*
	*res = { 
	*	name: '', dh_uh: 'dh', locked: false, 
	*	vacationMonths: [], extraVacationMonths: [],
	*	requested: [], rejected: [],  lockedMonths: [],
	*	possible: [],  // Needs to be empty when sent to generator
	* 	selected: []
	*}; 
	*/
		var month 	= $cell.data('month');

		// - Vacations -
		var isVac = $($cell.find('input[name=vacation]:checked')).length > 0;
		if ( isVac ) {
			var vacations = res.vacationMonths;
			// Have a max of 3 regular vacation requests (to access schedule by vacation file structure)
			if ( vacations.length < 3 ) {
				res.vacationMonths.push( month );
			// File structure doesn't support more. Have to do those with logic. Fewer to go through, though
			} else {
				res.extraVacationMonths.push( month );
			}
		}
		
		// - Locked (just for storage) -
		var locked 	= $($cell.find('.locker')).hasClass('fa-lock');
		if ( locked === true ) {
			res.lockedMonths.push( month );
		}

		// - Requested -
		// if res.locked, get all of them
		if ( locked === true || res.locked === true ) {
			// Should not be able to lock if input is "None". Nevertheless, good to check?
			// So that it's independent of whatever comes in. But then what do we do about res.locked?
			var $selected = $($cell.find('input[name=rot_request]:checked')).val() || 'None';
			if ( $selected !== 'None' ) {
				// Name of selected rotation or empty string if "None" selected
				requested.push({ month: month, rotation: $selected });
			}

		}

		// - Selected/Generated -
		var $generated = $cell.find('input[name=rot_request:checked').eq(0);
		res.selected.push( {month: month, rotation: $generated.val()} )

		// - Rejections/Exclusions -
		// http://stackoverflow.com/questions/786142/how-to-retrieve-checkboxes-values-in-jquery
		var $rejects = $($cell.find('input[name=rot_reject]:checked')),
			rejects  = [];
		$rejects.each(function() {
			rejects.push($(this).val());
		});

		res.rejected.push({ month: month, rejected: rejects });

		return res;
	};  // End saveByCell()


	var updateResident = function( $row ) {
	/* ( $Node ) -> {}
	* 
	* Returns a resident object from the values in the
	* inputs in that row
	*/
		var res = {
			name: '', dh_uh: 'dh', locked: false,
			vacationMonths: [], extraVacationMonths: [],
			requested: [], rejected: [], lockedMonths: [],
			possible: [],  // Needs to be empty when sent to generator
		};

		var $header = $($row.find('th')[0]);
		res.name 	= $($header.find('.res-name')).val();
		res.locked 	= $($header.find('.locker')).hasClass('fa-lock');
		res.dh_uh 	= $($header.find('input[name=dh_uh]')).val();
		
		// The td's in the tr
		var $cells 	 = $(th).find('td');

		for ( var celli = 0; celli < $cells.length; celli++ ) {
			var $cell = $($cells[ celli ]);
			var res   = saveByCell( $cell, res );

		}  // end for each cell

		return res;
	};  // End updateResident()


	var save = function( residents, callback ) {
	// Save to database

		// Asynchronous $.ajax
		$.ajax({
			url: '/settings',  // Stuff in start of app.js (app.use('/keys', require('./routes/keys') );)
			method: 'POST',
			data: residents
		})  // End $.ajax() (sort of)
		.then( function successHandler( databaseResidents, responseText ) {
		// Only fires on a successful request. If this gets run, we've actually saved
		// responseText should be the string 'created'
			console.log('created');
			if ( responseText === 'created' ) { console.log('response was "created"'); }
			callback( null, databaseResidents );

		}, function errHandler( err ) {
			console.error( err );
			callback( err, null );
		});  // End .then(), which ends $.ajax()

	};  // End save()


	settings.historyLevel = 0;
	settings.addHistory = function( err, dbResidentData ) {

		if ( err ) {
			console.error('save errored:', err );
		} else {
			console.log('saved, front end:', dbResidentData);
			// ??: Just the id somehow?
			settings.history.push( dbResidentData )
		}

		return dbResidentData;
	};  // End settings.addHistory()


	settings.update = function( tbody ) {
	// updates resident data

		var residents = [];

		// Header is in thead
		var $rows = $(tbody).find('tr');

		for ( var rowi = 0; rowi < $rows.length; rowi++ ) {
			var $row = $($rows[ rowi ]);
			var res  = updateResident( $row );
			residents.push( res );
		}  // end for every table row

		save( residents, settings.addHistory );  // end saving
		// Index of latest history is now at the last history item
		settings.historyLevel = settings.history.length - 1;

		return residents;
	};  // End settings.update()


	// ===================================================
	// LOADING/DISPLAYING
	// ===================================================

	var lockIf = function( $tr, resident ) {

		var id = $tr.attr('id');

		if (resident.locked) {
			$tr.find('input').prop('disabled', true)
			// $('#' + id + ' input').prop('disabled', true);
			$tr.find('.locker').removeClass('fa-unlock').addClass('fa-lock');
			$tr.addClass('locked');
		}


		return $tr;
	}


	var monthMap = {'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
					'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11};
	var months 	 = [ 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec' ];

	var buildCell = function( $cell, month, resident ) {
	// For each property of the resident, check if this month is in there
	// If so, do stuff

		// - VACATIONS -
		var allVacs = resident.vacationMonths.concat( resident.extraVacationMonths );
		// console.log( 'all vacation months:', allVacs );
		// If this month is listed in the vacation months, check its vacation checkbox
		if ( allVacs.indexOf(month) > -1 ) {
			$($cell.find('input[name=vacation]')[0]).prop('checked', true);
		}

		// - REQUESTED -
		console.log($cell.attr('data-month'))
		// Give this set of radio groups a unique name
		var sanitzd = resident.name.replace(/\W+/g, "_"),
			name 	= sanitzd + '_' + $cell.attr('data-month') + '_rot_request';
		$cell.find('input[name=rot_request]').attr('name', name);

		// var requested = resident.requested;
		// for ( var reqi = 0; reqi < requested.length; reqi++ ) {
		// 	var request = requested[ reqi ];

		// 	// If it's a month that's requested
		// 	if ( month === request.month ) {
		// 		// select the correct rotation
		// 		var $choice = $($cell.find('.request-choice.' + request.rotation )[0]);
		// 		$($choice.find( 'input' )[0]).prop('checked', true);
		// 	}
		// }  // end for requested


		// - GENTERATED -
		var generated 	= resident.selected.concat(resident.requested),
			choice 		= 'None';
		for ( var geni = 0; geni < generated.length; geni++ ) {

			var gened = generated[ geni ];

			// If it's a month that's generated
			// select the correct rotation
			if ( month === gened.month ) {
				choice = gened.rotation;
				// if nothing's been generated for this month, choice will be 'None'
			}

		}  // End for each pre-generated, but not locked

		var $choice = $cell.find('.request-choice.' + choice ).eq(0);
		// console.log($choice.find( 'input' )[0])
		$choice.find( 'input' ).eq(0).prop('checked', true);
		// and update the name to the right name
		var $name = $cell.find('.rot-output').eq(0);
		// console.log($name)
		$name.text( choice );


		// - REJECTED -
		var rejected = resident.rejected;
		for ( var reji = 0; reji < rejected.length; reji++ ) {

			var reject = rejected[ reji ];
			if ( month === reject.month ) {

				var rotations = reject.rotations
				for ( var roti = 0; roti < rotations.length; roti++ ) {
					var rotation = rotations[ roti ];
					var $choice = $($cell.find('.reject-choice.' + rotation )[0]);
					$($choice.find('input')[0]).prop('checked', true);
				}
			}  // end for every rotation in a rejection
		}  // end for every rejection

		// - LOCKING -
		var lockedMonths = resident.lockedMonths;
		if ( lockedMonths.indexOf(month) > -1 ) {
			$cell.find('input').prop('disabled', true);

			var $locker = $($cell.find('.locker')[0]);
			$locker.removeClass('fa-unlock');
			$locker.addClass('fa-lock');
			$cell.addClass('locked');
		}

		return $cell;
	};  // End buildCell()


	var buildCells = function( $tr, td, resident ) {
	// Iterates through 12 months, building a cell for each month

		for ( var monthi = 0; monthi < months.length; monthi++ ) {
			var monthNum = (monthi + 6)  % 12,
				month 	 = months[ monthNum ];
			// TODO: Test with resident with known rotation preferences
			// console.log('Am I doing months reordering right?', month );

			var $td = $(td);
			$tr.append( $td );

			$td.addClass( month );
			$td.prop('data-month', month);
			// $td.data('month', month)
			console.log($td.prop('data-month'))

			buildCell( $td, month, resident )

		}

		return $tr;
	};  // End buildCells()


	var buildRowHeader = function( $tr, resident ) {

		var $th = $tr.find('th');

		// - NAME -
		$($th.find('.res-name input')[0]).val( resident.name );
		
		// - DH/UH -
		// Add the resident name
		var dhuhName = resident.name.replace(/\W+/g, "_") + '_dh_uh';
		$($th.find('input[name=dh_uh]')).attr('name', dhuhName);

		$th.find('input[name=' + dhuhName + '][value=' + resident.dh_uh + ']').eq(0).prop('checked', true);

		// - LOCKING -
		var $locker = $($th.find('.locker')[0]);

		if ( resident.locked ) {
			$locker.removeClass('fa-unlock');
			$locker.addClass('fa-lock');
		} else {
			$locker.removeClass('fa-lock');
			$locker.addClass('fa-unlock');
		}

		return $tr;
	};


	var buildRows = function( err, tr, td, tbody, residents ) {
	/* (str?, str, str, {}) -> None
	* 
	* 
	*/
		if ( err ) {
			console.error('get tr and td templates errored:', err );
		} else {
			// console.log('got tr and td templates template:', tr, td);

			var $tbody  = $(tbody);

			// Use jade to load template, then alter it from there
			for ( var resi = 0; resi < residents.length; resi++ ) {

				var resident = residents[ resi ];
				var $trNode = $(tr);

				$tbody.append( $trNode );

				// Not sure what my stuff looks like now, so I'm just going to
				// start fresh with the node I know I have
				var id = resident.name.replace(/\W+/g, "_");
				$trNode.attr('id', 'tr_' + id);

				buildRowHeader( $trNode, resident );
				buildCells( $trNode, td, resident );
				// Lock all if necessary
				lockIf( $trNode, resident );

			}  // end for every table row
		}  // end if/if not err

		// Don't pretend to return something for asynchronous call
	};  // End buildRows() (callback)


	var getCell = function( err, tr, tbody, residents ) {

		var callback = buildRows;

		if ( err ) {
			console.error('get tr template errored:', err );
		} else {
			// console.log('got tr template:', tr);

			$.ajax({
				url: '/cell',
				method: 'GET'//,
				// data: residents // ??: Is this how to send residents with a GET request?
			})  // End $.ajax() (sort of)
			// If no .then(), no way to get residents back
			.then( function successHandler( td ) {
				
				// Will not mutate the back end td object
				callback( null, tr, td, tbody, residents );

			}, function errHandler( err ) {
				console.error(err);
				callback( err, null, null, tbody, residents );
			});  // End $.ajax
		}

	};  // End getCell() (callback)


	var getRow = function( tbody, residents ) {

		var callback = getCell;

		$.ajax({
			url: '/row',
			method: 'GET'//,
			// data: residents // ??: Is this how to send residents with a GET request?
		})  // End $.ajax() (sort of)
		// If no .then(), no way to get residents back
		.then( function successHandler( tr ) {
			
			// Will not mutate the back end tr object
			callback( null, tr, tbody, residents );

		}, function errHandler( err ) {
			console.error(err);
			callback( err, null, null );
		});  // End $.ajax

	};  // End getRow()


	settings.load = function( tbody, residents ) {

		getRow( tbody, residents );

		// Don't pretend to return something when this is asynchronous
	};  // End settings.load()


	return settings;
};  // End Settings() {}


