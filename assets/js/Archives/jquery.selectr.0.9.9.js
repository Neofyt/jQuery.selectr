//-------------------------------------------------
// selectr : a jQuery plugin
// table row selection / deselection "a la" Gmail
// @version: 0.9.8
// @date : 20111229
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
				$checkboxes = "td input[type=checkbox].",
				o = $.meta ? $.extend({}, opts, $this.data()) : opts;

			// Creating the radioboxes
			o.checkMax === 0 ?
				$head.find("tr").append('<th><input type="checkbox" class="'+ o.selectr +'" /></th>') :
				$head.find("tr").append('<th></th>');
			$body.find("tr").each(function() {
				$(this).append('<td><input type="checkbox" class="'+ o.selectr +'" id="'+ $(this).prop('id') +'"  /></td>');
			});
			if (o.count) {
				$foot.find("tr").append('<td><span class="'+ o.selectrCount +'" ></span></td>');
			}

			// Caching the radioboxes
			var $headRad = $head.find("."+o.selectr),
				$bodyRad = $body.find("."+o.selectr);

			// Counting the checkboxes
			var total;
			o.checkMax === 0 ?
				total = $bodyRad.length :
				total = (o.leadingZero + o.checkMax).slice (-2);
			if(o.count){
				$foot.find("."+o.selectrCount).text(("0" + o.leadingZero).slice (-2) + "/" + total);
			}

			// In case of a click on a radiobox in the table body
			$bodyRad.click(function(){

				$(this).parent().parent().toggleClass(o.highlight);

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

				// Enabling/disabling the checkboxes according to the maximum value given in the parameters
				if (o.checkMax !== 0){
					$disCheck = $body.find($checkboxes + o.selectr + ":not(:checked)");
					$totCheck === o.checkMax ?
						$disCheck.prop({disabled: true}) :
						$disCheck.prop({disabled: false});

					// Running callback function when the limit is reach
					if ($totCheck === total && typeof callback === 'function') {
						callback.call(this); // brings the scope to the callback
					}
				}
			});

			// If we click on the checkbox in the header
			$headRad.click(function() {
				$bodyRad.prop("checked", function(){
					return $headRad.prop("checked");
				}).parent().parent().toggleClass(o.highlight, $headRad.prop("checked"));
				$.fn.selectr.updateCount($body, $foot, $checkboxes, o.selectrCount, o.count, total, o.leadingZero, o.selectr, o.highlight, o.checkedRows);
			});
		});
	};

	// Updating the counter
	$.fn.selectr.updateCount = function(body, foot, checkboxes, counter, count, total, leadingZero, selectr, highlight, checkedRows){
		$totChecked = body.find(checkboxes + selectr + ":checked").parent().parent();
		$totCheck = $totChecked.length;
		if(count){
			foot.find(counter).text(
				(leadingZero + $totCheck).slice (-2) + "/" + total
			);
		}
		$totCheck === total ?
			foot.find(counter).parent().addClass(highlight) :
			foot.find(counter).parent().removeClass(highlight);

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
		count: true,
		leadingZero: "0",
		checkMax: 0,
		checkedRows : "checkedRows"
	};

})(jQuery);