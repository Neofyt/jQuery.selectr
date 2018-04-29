//-------------------------------------------------
// selectr : a jQuery plugin
//
// Table row selection / deselection "a la" Gmail
// with added functionalities
//
// @version: 1.0.c
// @date : 20120923
// @author: Neofyt
//-------------------------------------------------

;(function($) {

	$.fn.selectr = function(options, callback) {

		var opts = $.extend({}, $.fn.selectr.defaults, options);

		return this.each(function() {

			// Declaring some variables
			var $this = $(this),
				$head = $this.find("thead"),
				$body = $this.find("tbody"),
				$foot = $this.find("tfoot"),
				$checkboxes = "input[type=checkbox].",
				o = $.meta ? $.extend({}, opts, $this.data()) : opts;

			// Creating the radioboxes
			if (o.position === "right"){
				o.checkMax === 0 ?
					$head.find("tr").append('<th><input type="checkbox" class="'+ o.selectr +'" /></th>') :
					$head.find("tr").append('<th></th>');
				$body.find("tr").each(function() {
					$(this).append('<td><input type="checkbox" class="'+ o.selectr +'" id="'+ $(this).prop('id') +'"  /></td>');
				});
			} else {
				o.checkMax === 0 ?
					$head.find("tr").prepend('<th><input type="checkbox" class="'+ o.selectr +'" /></th>') :
					$head.find("tr").prepend('<th></th>');
				$body.find("tr").each(function() {
					$(this).prepend('<td><input type="checkbox" class="'+ o.selectr +'" id="'+ $(this).prop('id') +'"  /></td>');
				});
			}
			
			// Caching the radioboxes
			var $headRad = $head.find("."+o.selectr),
				$bodyRad = $body.find("."+o.selectr);

			// Setting the counter
			//$.fn.selectr.settingCount($this, o.position, o.selectrCount, o.checkMax, $bodyRad, o.leadingZero, o.count);
			$.fn.selectr.settingCount($this, $bodyRad, options);
			
			var $total = $body.parent().data("total");

			// In case of a click on a radiobox in the table body
			$bodyRad.click(function(){

				// Getting the css class to apply to checked rows
				if(!$body.data("highlight")){
					$body.data("highlight", o.highlight);
				}

				var highlight = $body.data("highlight");

				// Highligting or not the row
				$(this).parent().parent().toggleClass(highlight);

				// Requesting an update of the counter
				$.fn.selectr.updateCount($body, $foot, $checkboxes, $total, highlight, options);

				// Enabling/disabling the checkboxes according to the maximum value given in the parameters
				if (o.checkMax !== 0){
					$disCheck = $body.find($checkboxes + o.selectr + ":not(:checked)");
					$totCheck === o.checkMax ?
						$disCheck.prop("disabled", true) :
						$disCheck.prop("disabled", false);

					// Running the checkMax callback function when the limit is reach
					if ($totCheck == $total && o.callbackType === "checkMax" && typeof callback === 'function') {
						callback.call(this); // brings the scope to the callback
					}
				}

				// Enabling multiple rows selection via Shift key press
				var rowIndex =  $(this).closest("tr")[0].rowIndex,
					checkedBoxes = 1;

				// If shift key pressed
				if (window.shiftkey){

					// Get rows numbers of manually checked boxes in order to obtain the range of boxes to programatically check 
					// Determine which of the two checked boxes is the upper or lower one
					$body.parent().data(o.lastChecked) > rowIndex ? (
						first = rowIndex,
						last = $body.parent().data(o.lastChecked)
					) : (
						first = $body.parent().data(o.lastChecked),
						last = rowIndex
					);

					// For any checkbox in the range of rows numbers
					for (i=first; i<last+1; i=i+1){

						// If the maximum number is not yet reached
						if (checkedBoxes != o.checkMax){

							// Get the line
							var currentRow = $body.find("tr:nth-child("+i+")");

							// Toggle css class depending of the state of the checkbox
							if ($body.parent().data(o.lastCheckedState) === true){
								currentRow.addClass(highlight)
							} else {
								currentRow.removeClass(highlight)
							}

							// Toggle checkbox state
							currentRow.find("."+o.selectr).prop("checked", $body.parent().data(o.lastCheckedState));

							// Increment the counter
							checkedBoxes = checkedBoxes + 1;
						}
					}

					// Set back global shift state to false
					window.shiftkey = false;
				}

				// Requesting an update of the counter
				$.fn.selectr.updateCount($body, $foot, $checkboxes, $total, highlight, options);

				// Updating the header checkbox
				if (o.checkMax === 0){
					if ($totCheck == 0) {
						// No checkbox checked
						$headRad.prop({indeterminate:false, checked:false});
					} else if ($totCheck == $total) {
						// All checkboxes checked
						$headRad.prop({indeterminate:false, checked:true});
					} else {
						// Not all checkboxes checked
						$headRad.prop({indeterminate:true, checked:false});
					}
				}

				// Attaching the number of the last checked row and his state to the table, accessible with $('#tableId').data("...")
				$body.parent().data(o.lastChecked, rowIndex);
				$body.parent().data(o.lastCheckedState, $(this).prop("checked"));

				// Running immediate callback function
				if (o.callbackType === "immediate" && typeof callback === 'function') {
					callback.call(this); // brings the scope to the callback
				}
			});

			// If we click on the checkbox in the header
			$headRad.click(function() {

				// Setting the class to apply if not defined earlier
				if(!$body.data("highlight")){
					$body.data("highlight", o.highlight);
				}

				// Applying the class
				var highlight = $body.data("highlight");

				// Setting the body checkboxes checked state according to the state of the header one
				// and applying the css class
				$bodyRad.prop("checked", function(){
					return $headRad.prop("checked");
				}).parent().parent().toggleClass(highlight, $headRad.prop("checked"));

				// Updating the counter
				$.fn.selectr.updateCount($body, $foot, $checkboxes, $total, highlight, options);
				
				// Checking if a callback function is present
				if (o.callbackType === "immediate" && typeof callback === 'function') {
					callback.call(this); // brings the scope to the callback
				}
			});
		});
	};

	// Setting the counter
	$.fn.selectr.settingCount = function(table, bodyRad, options){

		// Recovering the options
		var opts = $.extend({}, $.fn.selectr.defaults, options),
			o = $.meta ? $.extend({}, opts, $this.data()) : opts;
		
		// Counting the checkboxes, total equals number of rows or checkmax parameter if set
		var total,
			foot = table.find("tfoot");

		o.checkMax === 0 ?
			total = bodyRad.length :
			total = (o.leadingZero + o.checkMax).slice(-2);

		// Creating the counter
		if (o.count){
			if (foot.find("." + o.selectrCount).length === 0){
				if (o.position === "right"){
					foot.find("tr").append('<td><span class="'+ o.selectrCount +'">'+ ("0" + o.leadingZero).slice(-2) + "/" + total +'</span></td>');
				} else {
					foot.find("tr").prepend('<td><span class="'+ o.selectrCount +'">'+ ("0" + o.leadingZero).slice(-2) + "/" + total +'</span></td>');
				}
			}
		}
		table.data("total", total);
	};

	// Updating the counter
	$.fn.selectr.updateCount = function(body, foot, checkboxes, total, highlight, options){

		// Recovering the options
		var opts = $.extend({}, $.fn.selectr.defaults, options),
			o = $.meta ? $.extend({}, opts, $this.data()) : opts;

		// Determining the number of checked radioboxes
		$totChecked = body.find(checkboxes + o.selectr + ":checked");
		$totCheck = $totChecked.length;

		if (o.count){
			// Displaying the result
			foot.find("."+o.selectrCount).text(
				(o.leadingZero + $totCheck).slice(-2) + "/" + total
			);

			// Highlighting the counter if the limit is reached
			$totCheck == total ?
				foot.find("."+o.selectrCount).parent().addClass(highlight) :
				foot.find("."+o.selectrCount).parent().removeClass(highlight);
		}

		// Updating the list of checked rows
		$.fn.selectr.checkedRows(body, checkboxes, o.selectr, o.checkedRows);
	};

	// Creating the list of checked radioboxes
	$.fn.selectr.checkedRows = function(body, checkboxes, selectr, checkedRows){

		// Creating an empty array which will contain the list of checked boxes
		var $checkedRows = new Array();

		// Finding each checked box and populating the array
		body.find(checkboxes + selectr + ":checked").each(function() {
			$checkedRows.push($(this).prop('id'));
		});

		// Attaching the array to the table, accessible with $('#tableId').data("checkedRows")
		body.parent().data(checkedRows, $checkedRows);
	};

	// 
	$.fn.selectr.listToCheck = function(table, list, options, callback){

		// Recovering the options
		var opts = $.extend({}, $.fn.selectr.defaults, options),
			o = $.meta ? $.extend({}, opts, $this.data()) : opts;

		// Recovering informations on the table in order to pass it to the other functions
		var table = $(table),
			headerbox = table.find("thead ." + o.selectr),
			body = table.find("tbody"),
			foot = table.find("tfoot"),
			checkboxes = "[type=checkbox].",
			bodyRad = body.find(checkboxes + o.selectr),
			listLength = list.length;

		// Detecting css class to apply to highlighted rows
		if(!body.data("highlight")){
			body.data("highlight", o.highlight);
		}
		var highlight = body.data("highlight");

		// Setting the counter
		$.fn.selectr.settingCount(table, bodyRad, options);

		// Checking the radioboxes
		if (listLength !== 0){
			if (listLength === bodyRad.length){
				headerbox.prop("checked", true);
			} else {
				headerbox.prop("indeterminate", true);
			}

			for (i=0; i<listLength; i=i+1){
				table.find("#" + list[i]).find("." + o.selectr).prop("checked", true).parent().parent().addClass(highlight);
			}
		}	

		// Updating the counter
		var total = body.parent().data("total");

		$.fn.selectr.updateCount(body, foot, checkboxes, total, highlight, options);

		// Running the callback
		if (typeof callback === 'function') {
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
		position: "right"
	};

})(jQuery);