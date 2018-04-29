//-------------------------------------------------
// selectr : a jQuery plugin
//-------------------------------------------------
// Table row selection / deselection "a la" Gmail
// with added functionalities
//-------------------------------------------------
// @version: 1.0.d
// @date : 20130418
// @author: Neofyt
//-------------------------------------------------

;(function($) {

	$.fn.selectr = function(options, callback) {

		return this.each(function() {

			// Declaring some variables
			var table = $(this),
				head = table.find("thead"),
				body = table.find("tbody"),
				foot = table.find("tfoot"),
				checkboxes = "[type=checkbox].",
				o = $.extend({}, $.fn.selectr.defaults, options);

			// Creating the radioboxes
			if (o.position === "right"){
				o.checkMax === 0 ?
					head.find("tr").append('<th><input type="checkbox" class="'+ o.selectr +'" /></th>') :
					head.find("tr").append('<th></th>');
				body.find("tr").each(function() {
					$(this).append('<td><input type="checkbox" class="'+ o.selectr +'" /></td>');
				});
			} else {
				o.checkMax === 0 ?
					head.find("tr").prepend('<th><input type="checkbox" class="'+ o.selectr +'" /></th>') :
					head.find("tr").prepend('<th></th>');
				body.find("tr").each(function() {
					$(this).prepend('<td><input type="checkbox" class="'+ o.selectr +'" /></td>');
				});
			}
			
			// Caching the radioboxes
			var headRad = head.find("." + o.selectr),
				bodyRad = body.find("." + o.selectr);

			// Setting the counter
			$.fn.selectr.settingCount(table, bodyRad, options);
			
			var total = table.data("total");

			// In case of a click on a radiobox in the table body
			bodyRad.click(function(){

				// Highligting or not the row
				$(this).parent().parent().toggleClass(o.highlight);

				// Requesting an update of the counter
				$.fn.selectr.updateCount(table, foot, checkboxes, total, options, false, false);

				var totCheck = table.data("totCheck") || 0;

				// Enabling/disabling the checkboxes according to the maximum value given in the parameters
				if (o.checkMax !== 0){

					body.find(checkboxes + o.selectr + ":not(:checked)").prop("disabled", totCheck === o.checkMax );

					// Running the checkMax callback function when the limit is reached
					if (totCheck == total && o.callbackType === "checkMax" && typeof callback === "function") {
						callback.call(this); // brings the scope to the callback
					}
				}

				// Enabling multiple rows selection via Shift key press
				var rowIndex = $(this).parent().parent()[0].rowIndex,
					checkedBoxes = 1;

				// If shift key pressed
				if (window.shiftkey){

					// Get rows numbers of manually checked boxes in order to obtain the range of boxes to programatically check 
					// Determine which of the two checked boxes is the upper or lower one
					table.data(o.lastChecked) > rowIndex ? (
						first = rowIndex,
						last = table.data(o.lastChecked)
					) : (
						first = table.data(o.lastChecked),
						last = rowIndex
					);

					// For any checkbox in the range of rows numbers
					for (i=first; i<last+1; i=i+1){

						// If the maximum number is not yet reached
						if (checkedBoxes != o.checkMax){

							// Get the line
							var currentRow = body.find("tr:nth-child(" + i + ")");

							// Toggle css class depending of the state of the checkbox
							currentRow.toggleClass(o.highlight, table.data(o.lastCheckedState) === true );

							// Toggle checkbox state
							currentRow.find("." + o.selectr).prop("checked", table.data(o.lastCheckedState));

							// Increment the counter
							checkedBoxes += 1;
						}
					}

					// Set back global shift state to false
					window.shiftkey = false;
				}

				// Attaching the number of the last checked row and his state to the table, accessible with $('#tableId').data("...")
				table.data(o.lastChecked, rowIndex);
				table.data(o.lastCheckedState, $(this).prop("checked"));

				// Requesting an update of the counter
				$.fn.selectr.updateCount(table, foot, checkboxes, total, options, true, false);

				// Updating the header checkbox
				if (o.checkMax === 0){
					if (totCheck == 0) {
						// No checkbox checked
						headRad.prop({indeterminate:false, checked:false});
					} else if (totCheck == total) {
						// All checkboxes checked
						headRad.prop({indeterminate:false, checked:true});
					} else {
						// Not all checkboxes checked
						headRad.prop({indeterminate:true, checked:false});
					}
				}

				// Running immediate callback function
				if (o.callbackType === "immediate" && typeof callback === "function") {
					callback.call(this); // brings the scope to the callback
				}
			});

			// If we click on the checkbox in the header
			headRad.click(function() {

				// Setting the body checkboxes checked state according to the state of the header one
				// and applying the css class
				bodyRad.prop("checked", headRad.prop("checked")).parent().parent().toggleClass(o.highlight, headRad.prop("checked"));

				// Updating the counter
				$.fn.selectr.updateCount(table, foot, checkboxes, total, options, true, true);
				
				// Checking if a callback function is present
				if (o.callbackType === "immediate" && typeof callback === "function") {
					callback.call(this); // brings the scope to the callback
				}
			});
		});
	};

	// Setting the counter
	$.fn.selectr.settingCount = function(table, bodyRad, options){

		// Recovering the options
		var o = $.extend({}, $.fn.selectr.defaults, options);
		
		// Counting the checkboxes, total equals number of rows or checkmax parameter if set
		var foot = table.find("tfoot"),
			total = (o.checkMax === 0) ? bodyRad.length : (o.leadingZero + o.checkMax).slice(-2);

		// Creating the counter
		if (o.count){
			if (foot.find("." + o.selectrCount).length === 0){
				var box = '<td><span class="'+ o.selectrCount +'">'+ ("0" + o.leadingZero).slice(-2) + "/" + total +'</span></td>';
				o.position === "right" ?
					foot.find("tr").append(box) :
					foot.find("tr").prepend(box);
			}
		}
		table.data("total", total);
	};

	// Updating the counter
	$.fn.selectr.updateCount = function(table, foot, checkboxes, total, options, list, head){

		// Recovering the options
		var o = $.extend({}, $.fn.selectr.defaults, options);

		// Determining the number of checked radioboxes
		var totChecked = table.find("tbody " + checkboxes + o.selectr + ":checked"),
			totCheck = totChecked.length;

		if (o.count){
			// Displaying the result
			foot.find("." + o.selectrCount).text(
				(o.leadingZero + totCheck).slice(-2) + "/" + total
			);

			// Highlighting the counter if the limit is reached
			foot.find("." + o.selectrCount).parent().toggleClass(o.highlight, (totCheck == total));
		}
		table.data("totCheck", totCheck);

		// Updating the list of checked rows
		if (list === true){ $.fn.selectr.checkedRows(table, checkboxes, options, head); }
	};

	// Creating an array containing the list of checked radioboxes
	$.fn.selectr.checkedRows = function(table, checkboxes, options, head){

		// Recovering the options
		var o = $.extend({}, $.fn.selectr.defaults, options),
			checkedRows = new Array();

		// If we decided to collect rows by order of clicks
		if(o.order === "by_click" && head === false){
			var checkedRows = table.data(o.checkedRows) || checkedRows; 

			// Finding each checked box and populating the array
			if (table.data(o.lastChecked)){
				var currentRow = table.find("tbody tr:nth-child(" + table.data(o.lastChecked) + ")"),
					currentRowInfo = currentRow.prop("id") || currentRow[0].rowIndex;

				table.data(o.lastCheckedState) === true ? 
					checkedRows.push(currentRowInfo) : 
					checkedRows.splice(checkedRows.indexOf(currentRowInfo), 1);
			}

		} else {
			// Finding each checked box and populating the array
			table.find("tbody " + checkboxes + o.selectr + ":checked").each(function() {
				var currentRow = $(this).parent().parent();
				checkedRows.push(currentRow.prop("id") || currentRow[0].rowIndex);
			});
		}

		// Attaching the array to the table, accessible with $('#tableId').data("checkedRows")
		table.data(o.checkedRows, checkedRows);
	};

	// Checking boxes given in parameter
	$.fn.selectr.listToCheck = function(tab, list, options, callback){

		// Recovering the options
		var o = $.extend({}, $.fn.selectr.defaults, options);

		// Recovering informations on the table in order to pass it to the other functions
		var table = $(tab),
			headerbox = table.find("thead ." + o.selectr),
			body = table.find("tbody"),
			foot = table.find("tfoot"),
			checkboxes = "[type=checkbox].",
			bodyRad = body.find(checkboxes + o.selectr),
			listLength = list.length;

		// Setting the counter
		$.fn.selectr.settingCount(table, bodyRad, options);

		// Checking the radioboxes
		if (listLength !== 0){
			listLength === bodyRad.length ?
				headerbox.prop("checked", true) :
				headerbox.prop("indeterminate", true);

			for (i=0; i<listLength; i=i+1){
				table.find("#" + list[i]).find("." + o.selectr).prop("checked", true).parent().parent().addClass(o.highlight);
			}
		}	

		// Updating the counter
		var total = table.data("total");

		$.fn.selectr.updateCount(table, foot, checkboxes, total, options, true);

		// Running the callback
		if (typeof callback === "function") {
			callback.call(this); // brings the scope to the callback
		}
	};

	$.fn.selectr.defaults = {
		selectr : "selectr",
		selectrCount : "selectrCount",
		highlight : "highlighted",
		count: false,
		leadingZero: "",
		checkMax: 0,
		checkedRows : "checkedRows",
		lastChecked: "lastChecked",
		lastCheckedState: "lastCheckedState",
		callbackType: "immediate",
		position: "right",
		order: ""
	};

})(jQuery);