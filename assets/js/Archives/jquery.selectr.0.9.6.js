//-------------------------------------------------
// selectr : a jQuery plugin
// table row selection / deselection "a la" Gmail
// @version: 0.9.6
// @date : 20111119
// @author: Neofyt
//-------------------------------------------------

;(function($) {

	$.fn.selectr = function(options, callback) {
		var opts = $.extend({}, $.fn.selectr.defaults, options);
		return this.each(function() {

			//console.log(this);
		
			// We will reuse these after
			var $this = $(this),
				$head = $this.find("thead"),
				$body = $this.find("tbody"),
				$foot = $this.find("tfoot");

			var o = $.meta ? $.extend({}, opts, $this.data()) : opts;

			// Creating the radioboxes
			o.checkMax === 0 ?
				$head.find("tr").append('<th><input type="checkbox" class="'+ o.selectr +'" /></th>') :
				$head.find("tr").append('<th></th>');
			$body.find("tr").append('<td><input type="checkbox" class="'+ o.selectr +'" /></td>');
			if (o.count) {
				$foot.find("tr").append('<td><span class="selectrCount"></span></td>');
			}

			// Caching the radioboxes
			var $headRad = $head.find("."+o.selectr),
				$bodyRad = $body.find("."+o.selectr),
				$footCount = $foot.find(".selectrCount");

			// Counting the checkboxes
			var total;
			o.checkMax === 0 ?
				total = $bodyRad.length :
				total =  (o.leadingZero + o.checkMax).slice (-2);
			if(o.count){
				$foot.find(".selectrCount").text(("0" + o.leadingZero).slice (-2) + "/" + total);
			}
			
			// In case of a click on a radiobox on the table body
			$bodyRad.click(function(){

				$(this).parent().parent().toggleClass(o.highlight);

				// Updating the counter
				$.fn.selectr.updateCount($body, $foot, o.count, total, o.leadingZero, o.selectr, o.highlight);

				// Updating the header checkbox
				if (o.checkMax === 0){
					$headRad.prop({indeterminate:true, checked:false});
					if ($totCheck === 0) {
						$headRad.prop({indeterminate:false, checked:false});
					}
					if ($totCheck === total) {
						$headRad.prop({indeterminate:false, checked:true});
					}
				}

				// Enabling/disabling the checkboxes according to the maximum value given in the parameters
				if (o.checkMax !== 0){
					$disCheck = $body.find("td input[type=checkbox]." + o.selectr + ":not(:checked)");
					$totCheck === o.checkMax ?
						$disCheck.prop({disabled: true}) :
						$disCheck.prop({disabled: false});
					
					// If we reach the limit then run callback function
					if ($totCheck == total && typeof callback == 'function') {
						callback.call(this); // brings the scope to the callback
					}
				}
			});
		
			// If we click on the checkbox in the header
			$headRad.click(function() {
				$bodyRad.prop("checked", function(){
					return $headRad.prop("checked");
				}).parent().parent().toggleClass(o.highlight, $headRad.prop("checked"));
				$.fn.selectr.updateCount($body, $foot, o.count, total, o.leadingZero, o.selectr, o.highlight);
			});
		});
	};

	$.fn.selectr.updateCount = function(body, foot, count, total, leadingZero, selectr, highlight){
		$totCheck = body.find("td input[type=checkbox]." + selectr + ":checked").length;
		if(count){
			foot.find(".selectrCount").text(
				(leadingZero + $totCheck).slice (-2) + "/" + total
			);
		}
		$totCheck == total ?
			foot.find(".selectrCount").parent().addClass(highlight) :
			foot.find(".selectrCount").parent().removeClass(highlight);
	}

	$.fn.selectr.defaults = {
		selectr : "selectr",
		highlight : "highlighted",
		count: true,
		leadingZero: "0",
		checkMax: 0
	};

})(jQuery);