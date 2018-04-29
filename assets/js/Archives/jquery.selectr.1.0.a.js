//-------------------------------------------------
// selectr : a jQuery plugin
// table row selection / deselection "a la" Gmail
// @version: 1.0.a
// @date : 20120827
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
			o.checkMax === 0 ?
				$head.find("tr").append('<th><input type="checkbox" class="'+ o.selectr +'" /></th>') :
				$head.find("tr").append('<th></th>');
			$body.find("tr").each(function() {
				$(this).append('<td><input type="checkbox" class="'+ o.selectr +'" id="'+ $(this).prop('id') +'"  /></td>');
			});

			// Creating the counter
			if (o.count) {
				$foot.find("tr").append('<td><span class="'+ o.selectrCount +'" ></span></td>');
			}

			// Caching the radioboxes
			var $headRad = $head.find("."+o.selectr),
				$bodyRad = $body.find("."+o.selectr);

			// Counting the checkboxes, total equals number of rows or checkmax parameter if set
			var total;
			o.checkMax === 0 ?
				total = $bodyRad.length :
				total = (o.leadingZero + o.checkMax).slice(-2);
			if(o.count){
				$foot.find("."+o.selectrCount).text(("0" + o.leadingZero).slice(-2) + "/" + total);
			}

			// In case of a click on a radiobox in the table body
			$bodyRad.click(function(){

				// Highligting or not the row
				$(this).parent().parent().toggleClass(o.highlight);

				// Requesting an update of the counter
				$.fn.selectr.updateCount($body, $foot, $checkboxes, o.selectrCount, o.count, total, o.leadingZero, o.selectr, o.highlight, o.checkedRows);

				// Enabling/disabling the checkboxes according to the maximum value given in the parameters
				if (o.checkMax !== 0){
					$disCheck = $body.find($checkboxes + o.selectr + ":not(:checked)");
					$totCheck === o.checkMax ?
						$disCheck.prop({disabled: true}) :
						$disCheck.prop({disabled: false});

					// Running the checkMax callback function when the limit is reach
					if ($totCheck == total && o.callbackType === "checkMax" && typeof callback === 'function') {
						callback.call(this); // brings the scope to the callback
					}
				}

				// Enabling multiple rows selection via Shift key press
				var rowIndex =  $(this).closest("tr")[0].rowIndex,
					checkedBoxes = 1;

				if (window.shiftkey){
					$body.parent().data(o.lastChecked) > rowIndex ? (
					    first = rowIndex,
					    last = $body.parent().data(o.lastChecked)
					) : (
					    first = $body.parent().data(o.lastChecked),
					    last = rowIndex
					);

					for (i=first; i<last+1; i=i+1){
						if(checkedBoxes != o.checkMax){
							var currentRow = $body.find("tr:nth-child("+i+")");

							if($body.parent().data(o.lastCheckedState) === true){
								currentRow.addClass(o.highlight)
							} else {
								currentRow.removeClass(o.highlight)
							}
							currentRow.find("."+o.selectr).prop({checked: $body.parent().data(o.lastCheckedState)});
							checkedBoxes = checkedBoxes + 1;
						}
					}
					window.shiftkey = false;
				}

				// Requesting an update of the counter
				$.fn.selectr.updateCount($body, $foot, $checkboxes, o.selectrCount, o.count, total, o.leadingZero, o.selectr, o.highlight, o.checkedRows);

				// Updating the header checkbox
				if (o.checkMax === 0){
					if ($totCheck === 0) {
						$headRad.prop({indeterminate:false, checked:false});
					} else if ($totCheck === total) {
						$headRad.prop({indeterminate:false, checked:true});
					} else {
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
				$bodyRad.prop("checked", function(){
					return $headRad.prop("checked");
				}).parent().parent().toggleClass(o.highlight, $headRad.prop("checked"));
				$.fn.selectr.updateCount($body, $foot, $checkboxes, o.selectrCount, o.count, total, o.leadingZero, o.selectr, o.highlight, o.checkedRows);
				
				if (o.callbackType === "immediate" && typeof callback === 'function') {
					callback.call(this); // brings the scope to the callback
				}
			});
		});
	};

	// Updating the counter
	$.fn.selectr.updateCount = function(body, foot, checkboxes, counter, count, total, leadingZero, selectr, highlight, checkedRows){
		//$totChecked = body.find(checkboxes + selectr + ":checked").parent().parent();
		$totChecked = body.find(checkboxes + selectr + ":checked");
		$totCheck = $totChecked.length;
		if(count){
			foot.find("."+counter).text(
				(leadingZero + $totCheck).slice(-2) + "/" + total
			);
		}
		$totCheck == total ?
			foot.find("."+counter).parent().addClass(highlight) :
			foot.find("."+counter).parent().removeClass(highlight);

		$.fn.selectr.checkedRows(body, checkboxes, selectr, checkedRows);
	};

	// Creating the list of checked radioboxes
	$.fn.selectr.checkedRows = function(body, checkboxes, selectr, checkedRows){
		var $checkedRows = new Array();

		body.find(checkboxes + selectr + ":checked").each(function() {
			$checkedRows.push($(this).prop('id'));
		});

		// Attaching the list to the table, accessible with $('#tableId').data("checkedRows")
		body.parent().data(checkedRows, $checkedRows);
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
		callbackType: "immediate"
	};

})(jQuery);