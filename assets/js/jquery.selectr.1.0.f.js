//-------------------------------------------------
// selectr : a jQuery plugin
//-------------------------------------------------
// Table row selection / deselection "a la" Gmail
// with added functionalities
//-------------------------------------------------
// @version: 1.0.f
// @date : 20130506
// @author: Neofyt
//-------------------------------------------------

;(function($) {

	$.fn.selectr = function(options, callback) {

		$.fn.selectr.initKey();

		return this.each(function() {

			// Declaring some variables
			var table = $(this),
				head = table.find("thead"),
				body = table.find("tbody"),
				foot = table.find("tfoot"),
				o = $.extend({}, $.fn.selectr.defaults, options),
				boxTmpl = '<input type="checkbox" class="'+ o.selectr +'" />',
				cell = (o.checkMax === 0) ? '<th>' + boxTmpl + '</th>' : '<th></th>';

			// Creating the radioboxes
			o.position == "right" ? (
				head.find("tr").append(cell),
				body.find("tr").each(function() {
					$(this).append('<td>' + boxTmpl + '</td>')
				})
			) : (
				head.find("tr").prepend(cell),
				body.find("tr").each(function() {
					$(this).prepend('<td>' + boxTmpl + '</td>')
				})
			);

			// Caching the radioboxes
			var headRad = head.find("." + o.selectr),
				bodyRad = body.find("." + o.selectr);

			// Setting the counter
			$.fn.selectr.settingCount(table, bodyRad, o);
			
			var total = table.data("total");

			// In case of a click on a radiobox in the table body
			bodyRad.click(function(){

				// Highligting or not the row
				$(this).closest("tr").toggleClass(o.highlight);

				// Requesting an update of the counter
				$.fn.selectr.updateCount(table, foot, total, o, false, false);

				var totCheck = table.data("totCheck") || 0;

				// Enabling/disabling the checkboxes according to the maximum value given in the parameters
				if (o.checkMax !== 0){

					body.find("." + o.selectr + ":not(:checked)").prop("disabled", totCheck === o.checkMax);

					// Running the checkMax callback function when the limit is reached
					if (totCheck == total && o.callbackType === "checkMax" && typeof callback === "function") {
						callback.call(this); // brings the scope to the callback
					}
				}

				// Enabling multiple rows selection via Shift key press
				var rowIndex = $(this).closest("tr")[0].rowIndex,
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
					for (i=first; i<last+1; i++){

						// If the maximum number is not yet reached
						if (checkedBoxes != o.checkMax){

							// Get the line
							var currentRow = body.find("tr:nth-child(" + i + ")");

							// Toggle css class depending of the state of the checkbox
							currentRow.toggleClass(o.highlight, table.data(o.lastCheckedState) === true);

							// Toggle checkbox state
							currentRow.find("." + o.selectr).prop("checked", table.data(o.lastCheckedState));

							// Increment the counter
							checkedBoxes++;
						}
					}

					// Set back global shift state to false
					window.shiftkey = false;
				}

				// Attaching the number of the last checked row and his state to the table, accessible with $('#tableId').data("...")
				table.data(o.lastChecked, rowIndex);
				table.data(o.lastCheckedState, $(this).prop("checked"));

				// Requesting an update of the counter
				$.fn.selectr.updateCount(table, foot, total, o, true, false);

				// Updating the header checkbox
				if (o.checkMax === 0) {
					if (totCheck == 0) {
						// No checkbox checked
						headRad.prop({indeterminate:0, checked:0});
					} else if (totCheck == total) {
						// All checkboxes checked
						headRad.prop({indeterminate:0, checked:1});
					} else {
						// Not all checkboxes checked
						headRad.prop({indeterminate:1, checked:0});
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
				bodyRad.prop("checked", headRad.prop("checked")).closest("tr").toggleClass(o.highlight, headRad.prop("checked"));

				// Updating the counter
				$.fn.selectr.updateCount(table, foot, total, o, true, true);
				
				// Checking if a callback function is present
				if (o.callbackType === "immediate" && typeof callback === "function") {
					callback.call(this); // brings the scope to the callback
				}
			});

			// List of checkboxes to implement ?
			if (o.list !== []){
				$.fn.selectr.listToCheck(table, o, callback, headRad, bodyRad, foot);
			}
		});
	};

	// Setting the counter
	$.fn.selectr.settingCount = function(table, bodyRad, o){
		
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
	$.fn.selectr.updateCount = function(table, foot, total, o, list, head){

		// Determining the number of checked radioboxes
		var totChecked = table.find("tbody ." + o.selectr + ":checked"),
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
		if (list){ 
			$.fn.selectr.checkedRows(table, o, head);
		}
	};

	// Creating an array containing the list of checked radioboxes
	$.fn.selectr.checkedRows = function(table, o, head){

		var	checkedRows = [];

		// If we decided to collect rows by order of clicks
		if(o.order === "by_click" && head === false){
			checkedRows = table.data(o.checkedRows) || checkedRows; 

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
			table.find("tbody ." + o.selectr + ":checked").each(function() {
				var currentRow = $(this).closest("tr");
				checkedRows.push(currentRow.prop("id") || currentRow[0].rowIndex);
			});
		}

		// Attaching the array to the table, accessible with $('#tableId').data("checkedRows")
		table.data(o.checkedRows, checkedRows);
	};

	// Checking boxes given in parameter
	$.fn.selectr.listToCheck = function(table, o, callback, headRad, bodyRad, foot){

		var listLength = o.list.length;

		// Checking the radioboxes
		if (listLength !== 0){
			listLength === bodyRad.length ?
				headRad.prop("checked", 1) :
				headRad.prop("indeterminate", 1);

			// If the provided list is composed of ids...
			if (isNaN(o.list[0])){ // IDs can't be composed of just integers
				for (i=0; i<listLength; i++){
					table.find("#" + o.list[i] + " ." + o.selectr).prop("checked", 1).closest("tr").addClass(o.highlight);
				}

			// ... or row numbers
			} else {
				for (i=0; i<listLength; i++){
					table.find("tbody tr:nth-child(" + o.list[i] + ") ." + o.selectr).prop("checked", 1).closest("tr").addClass(o.highlight);
				}
			}
		}

		// Updating the counter
		var total = table.data("total");

		$.fn.selectr.updateCount(table, foot, total, o, true);

		// Running the callback
		if (o.callbackType === "loaded" && typeof callback === "function") {
			callback.call(this); // brings the scope to the callback
		}
	};

	// Helper function
	$.fn.selectr.initKey = function(){
		$(document).keydown(function(e) {
			if (e.keyCode == 16) {
				window.shiftkey = true;
			}
		}).keyup(function(e) {
			if (e.keyCode == 16) {
				window.shiftkey = false;
			}
		});
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
		callbackType: "immediate", // immediate - loaded
		position: "right", // left - right
		order: "", // by_click
		list: []
	};

})(jQuery);