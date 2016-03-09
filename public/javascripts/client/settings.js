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
* NOTES:
* - Push just front end: https://gist.github.com/cobyism/4730490
*/

'use strict'


var Settings = function() {

	var settings = {};

	settings.history = [];

	// // Example resident object
	// var resEx = {
	// 	name: 'Judy', 'dh_uh': 'dh', locked: false,
	// 	vacationMonths: ['x'], extraVacationMonths: ['y'],
	// 	requested: [{month: 'x', roation: 'a'}],
	// 	rejected: [{month: 'x', roations: ['b', 'c']}],
	// 	possible: [[4*12]],
	// 	lockedMonths: ['q', 'r'],
	// 	selected: [{month: 's', rotation: 'd'}]
	// }


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
		var $generated = $cell.find('input[name=rot_request]:checked').eq(0);
		res.selected.push( {month: month, rotation: $generated.val()} )

		// - Rejections/Exclusions -
		// http://stackoverflow.com/questions/786142/how-to-retrieve-checkboxes-values-in-jquery
		var $rejects = $($cell.find('input[name=rot_reject]:checked')),
			rejects  = [];
		$rejects.each(function() {
			rejects.push($(this).val());
		});

		res.rejected.push({ month: month, rotations: rejects });

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
			selected: []
		};

		var $header = $($row.find('th')[0]);
		res.name 	= $($header.find('input[name=res_name]')).val();
		res.locked 	= $($header.find('.locker')).hasClass('fa-lock');
		res.dh_uh 	= $($header.find('input[name=dh_uh]')).val();
		
		// The td's in the tr
		var $cells 	 = $row.find('td');

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
			url: '/settings',  // Stuff in start of app.js (app.use('/settings', require('./routes/settings') );)
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

			// Index of latest history is now at the last history item
			settings.historyLevel = settings.history.length - 1;
		}


		return dbResidentData;
	};  // End settings.addHistory()


	settings.update = function( tbody, skipSave ) {
	// updates resident data

		var residents = [];

		// Header is in thead
		var $rows = $(tbody).find('tr');

		for ( var rowi = 0; rowi < $rows.length; rowi++ ) {
			var $row = $($rows[ rowi ]);
			var res  = updateResident( $row );
			residents.push( res );
		}  // end for every table row

		// console.log('update() residents:', residents)

		if ( !skipSave ) {
			save( residents, settings.addHistory );  // end saving
		}

		settings.residents = residents;

		// Not to do with asynchronous saving, can return residents
		return residents;
	};  // End settings.update()

	settings.residents = [];

	// ===================================================
	// LOADING/DISPLAYING
	// ===================================================

	var lockIf = function( $tr, resident ) {

		var id = $tr.attr('id');

		if (resident.locked) {
			$tr.find('input').prop('disabled', true)
			$tr.find('.locker').removeClass('fa-unlock').addClass('fa-lock');
			$tr.addClass('locked');
		}


		return $tr;
	}


	var monthMap = {'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
					'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11};
	var months 	 = [ 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec' ];
	var rotationNames = [ 'None', 'FMS', 'Rural', 'Elec', 'Cardio', 'W-P', 'Ger', 'pcmh', 'Derm' ];

	var buildCell = function( $cell, month, resident ) {
	// For each property of the resident, check if this month is in there
	// If so, do stuff

		var monthi = monthMap[ month ];

		// - VACATIONS -
		var allVacs = resident.vacationMonths.concat( resident.extraVacationMonths );

		// If this month is listed in the vacation months, check its vacation checkbox
		if ( allVacs.indexOf(month) > -1 ) {
			$($cell.find('input[name=vacation]')[0]).prop('checked', true);
		}

		// - REQUESTED -
		// Give this set of radio groups a unique name
		var sanitzd = resident.name.replace(/\W+/g, "_"),
			name 	= sanitzd + '_' + month + '_rot_request';
		$cell.find('input[name=rot_request]').prop('name', name);

		// - GENTERATED -
		var selected = resident.selected,
			choice 	 = 'None';
		for ( var seli = 0; seli < selected.length; seli++ ) {
			if ( seli === monthi ) {
				var selection = selected[ seli ];
				// console.log(selected, selection, rotationNames, rotationNames[selection])
				choice = rotationNames[selection];
			}
		}  // End for each pre-selected, but not locked

		// Update radio button selection and cell text
		var $choice = $cell.find('.request-choice.' + choice ).eq(0);
		$choice.find( 'input' ).eq(0).prop('checked', true);
		var $name = $cell.find('.rot-output').eq(0);
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

		// Lock a month if it's requested
		var requested = resident.requested;
		for ( var reqi = 0; reqi < requested.length; reqi++ ) {
			var request = requested[ reqi ]

			if ( request.month === month ) {

				var rot = request.rotation;
				// Update radio button selection and cell text
				var $choice = $cell.find('.request-choice.' + rot ).eq(0);
				$choice.find( 'input' ).eq(0).prop('checked', true);
				var $name = $cell.find('.rot-output').eq(0);
				$name.text( rot );

				$cell.find('input').prop('disabled', true);

				var $locker = $($cell.find('.locker')[0]);
				$locker.removeClass('fa-unlock');
				$locker.addClass('fa-lock');
				$cell.addClass('locked');
			}
		}

		return $cell;
	};  // End buildCell()


	var buildCells = function( $tr, td, resident ) {
	// Iterates through 12 months, building a cell for each month

		for ( var monthi = 0; monthi < months.length; monthi++ ) {
			// var monthNum = (monthi + 6)  % 12,
			// 	month 	 = months[ monthNum ];
			var month = months[ monthi ];

			var $td = $(td);
			$tr.append( $td );

			$td.addClass( month );
			$td.attr('data-month', month);
			// console.log($td.prop('data-month'))  // still not working

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

	var haveDoneThis = false;

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

				if ( resident.name === 'Roxi' ) {console.log(resident.name, ':', resident.vacationMonths)}

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

			$('input').change(function(evnt) {
				// settings.update( $tbody[0] );
				page.update( $tbody[0] );
			});

			var generate = function() {
				schedHandler.generate( settings.residents );
			}

			console.trace( '****** Roxi vacations:', residents[0].vacationMonths)

			if (!haveDoneThis) {
				haveDoneThis = true;
				$('button[name=generate]').click( generate );
				$('button[name=cancel]').click(function cancel() {
					schedHandler.cancel();
				});
			}

		}  // end if/if not err

		// Don't pretend to return something for asynchronous call
	};  // End buildRows() (callback)


	settings.getSettings = function( err, td, tr, tbody, residents ) {

		var callback = buildRows;

		if ( err ) {
			console.error('get td errored:', err );
			callback( null, tr, td, tbody, residents )
		} else {
			console.log('got td');

			$.ajax({
				url: '/settings',
				method: 'GET'//,
				// data: residents // ??: Is this how to send residents with a GET request?
			})  // End $.ajax() (sort of)
			// If no .then(), no way to get residents back
			.then( function successHandler( ress ) {
				// Will not mutate the back end td object
				console.log( 'Did settings contain an array? ', ress.isArray() )
				if ( ress.isArray() ) {
					callback( null, tr, td, tbody, ress );
				} else {
					// Do it anyway, but with our stock data
					callback( null, tr, td, tbody, residents );
				}
				
			}, function errHandler( err ) {
				// !!: Takes over 4 min. to error
				console.error('error getting settings', err);
				callback( null, tr, td, tbody, residents );
			});  // End $.ajax
		}

	};  // settings.getSettings() (callback)


	settings.getCell = function( err, tr, tbody, residents, skipSettings ) {

		var callback1 = settings.getSettings,
			callback2 = buildRows;

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
				console.log('got tr')
				
				// Will not mutate the back end td object
				if ( skipSettings ) {
					callback2(  null, tr, td, tbody, residents  )
				} else {
					callback1( null, td, tr, tbody, residents );
				}

			}, function errHandler( err ) {
				console.error(err);
				callback1( err, td, tr, tbody, residents );
			});  // End $.ajax
		}
	};  // End settings.getCell() (callback)


	settings.getRow = function( tbody, residents, skipSettings ) {

		var callback = settings.getCell;

		$.ajax({
			url: '/row',
			method: 'GET'//,
			// data: residents // ??: Is this how to send residents with a GET request?
		})  // End $.ajax() (sort of)
		// If no .then(), no way to get residents back
		.then( function successHandler( tr ) {
			
			// Will not mutate the back end tr object
			callback( null, tr, tbody, residents, skipSettings );

		}, function errHandler( err ) {
			console.error(err);
			callback( err, null, tbody, residents, skipSettings );
		});  // End $.ajax

	};  // End settings.getRow()


	settings.load = function( tbody, residents, skipSettings ) {

		$(tbody).html('');
		settings.residents = residents;
		settings.getRow( tbody, residents, skipSettings );

		// Will return before synchronous stuff is done I guess
		return residents;
	};  // End settings.load()


	// settings.build = function( tbody, residents ) {

	// 	settings.getRow()

	// }


	return settings;
};  // End Settings() {}


