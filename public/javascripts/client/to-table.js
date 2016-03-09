// to-table.js

'use strict'

var csvSchedToJSON = function ( residents ) {
// 
// Should I make this start with July?

	var $table = $('.plain-table');
	var months 	 = [ 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec' ];
	var monthMap = {'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
					'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11};
	var rotations = [ 'None', 'FMS', 'Rural', 'Elec', 'Cardio','W-P', 'Ger', 'pcmh', 'Derm' ];

	// Make a table if it's not already there
	if ( $table[0] === undefined ) {
		var explain = '<div class="copy-explained">Just after you generate a table, copy this, but start with your cursor outside the table:</div>';
		// $('.generating-area').append( $(explain) );
		$(document.body).append( $(explain) );

		$table = $(document.createElement('table')).addClass('plain-table');
		// $('.generating-area').append( $table );
		$(document.body).append( $table );
	}

	$table.html('');

	// Get ready to copy these over and over again
	var tr = '<tr></tr>',
		td = '<td></td>';

	for ( var resi = -1; resi < residents.length; resi++ ) {

		var isHeaderRow = resi === -1;

		var resident 	= residents[ resi ],
			$tr 		= $(tr),
			$td 		= $(td);

		// Add the row and the first cell
		$table.append( $tr );
		$tr.append( $td );

		// First column, first row has year value
		if ( isHeaderRow ) {
			$td.text( '2016' );
		// Others first cells are resident names
		} else {
			$td.text( resident.name );
		}

		for ( var monthi = 0; monthi < 12; monthi++ ) {

			// Add the cell to the row
			var $cell = $(td);
			$tr.append( $cell );

			// First row gets month names
			if ( isHeaderRow ) {
				$cell.text( months[monthi] ).addClass( months[monthi] );

			// Other cell values are rotations
			} else {
				var rotIndx = resident.selected[ monthi ],
					rot = rotations[ rotIndx ];
				$cell.text( rot ).addClass( months[monthi] );

			}  // end if header row
		}  // end for every month/column
	}  // end for every resident/row + first column

	return residents;
};
