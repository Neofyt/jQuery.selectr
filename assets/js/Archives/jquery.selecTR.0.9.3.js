//-------------------------------------------------
// selecTR : a jQuery plugin
// table row selection / deselection "a la" Gmail
// @version: 0.9.3
// @date : 20111118
// @author: Neofyt
//-------------------------------------------------

(function($) {

	$.fn.selecTR = function(options) {
		var opts = $.extend({}, $.fn.selecTR.defaults, options);

		// We will reuse these after
		$this = $(this);
		$head = $this.find("thead");
		$body = $this.find("tbody");
		$foot = $this.find("tfoot");

		var o = $.meta ? $.extend({}, opts, $this.data()) : opts;

		// Creating the radioboxes
		o.checkMax === 0 ? $head.find("tr").append('<th><input type="checkbox" class="'+ o.selecTR +'" /></th>') : $head.find("tr").append('<th></th>');
		$body.find("tr").append('<td><input type="checkbox" class="'+ o.selecTR +'" /></td>');
		if (o.count) { 
			$foot.find("tr").append('<td><span id="selecTRCompt"></span></td>');
		}
		
		// Caching the radioboxes
		$headRad = $head.find("."+o.selecTR);
		$bodyRad = $body.find("."+o.selecTR);

		// Counting the checkboxes
		var total = $bodyRad.length;
		if(o.count){
			$("#selecTRCompt").text(("0" + o.leadingZero).slice (-2) + "/" + total);
		}

		// In case of a click on a radiobox on the table body
		$bodyRad.click(function(){
		
			$(this).parent().parent().toggleClass(o.highlight);

			// Updating the counter
			$.fn.selecTR.updateCount(o.count, total, o.leadingZero, o.selecTR);
			
			// Updating the header checkbox
			$headRad.prop({indeterminate:true, checked:false});
			if ($totCheck === 0) {
				$headRad.prop({indeterminate:false, checked:false});
			}
			if ($totCheck === total) {
				$headRad.prop({indeterminate:false, checked:true});
			}
			
			// Enabling/disabling the checkboxes according to the maximum value given in the parameters 
			if (o.checkMax !== 0){
				$disCheck = $("td input[type=checkbox]." + o.selecTR + ":not(:checked)");
				$totCheck === o.checkMax ? $disCheck.prop({disabled: true}) : $disCheck.prop({disabled: false});
			}
		});

		// If we click on the checkbox in the header
		$headRad.click(function() {
			$bodyRad.prop("checked", function(){
				return $headRad.prop("checked");
			}).parent().parent().toggleClass(o.highlight, $headRad.prop("checked"));
			$.fn.selecTR.updateCount(o.count, total, o.leadingZero, o.selecTR);
		});
	};
	
	$.fn.selecTR.updateCount = function(count, total, leadingZero, selecTR){
		$totCheck = $("td input[type=checkbox]." + selecTR + ":checked").length;
		if(count){ 
			$("#selecTRCompt").text(
				(leadingZero + $totCheck).slice (-2) + "/" + total
			); 
		}
	}
	
	$.fn.selecTR.defaults = {
		selecTR : "selecTR",
		highlight : "highlighted",
		count: true,
		leadingZero: "0",
		checkMax: 3,
		displayMax: false
	};

})(jQuery);