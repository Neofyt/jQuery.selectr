//-------------------------------------------------
// selecTR : a jQuery plugin
// table row selection / deselection "a la" Gmail
// @version: 0.9.3
// @date : 20111113
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
		$head.find("tr").append('<th><input type="checkbox" class="'+ o.selectTR +'" /></th>');
		$body.find("tr").append('<td><input type="checkbox" class="'+ o.selectTR +'" /></td>');
		if(o.count){ $foot.find("tr").append('<td><span id="selecTRCompt"></span></td>'); }
		
		// Caching the radioboxes
		$headRad = $head.find("."+o.selectTR);
		$bodyRad = $body.find("."+o.selectTR);

		// Counting the checkboxes
		var total = $bodyRad.length;
		if(o.count){ $("#selecTRCompt").text("00/" + total); }

		// In case of a click on a radiobox on the table body
		$bodyRad.click(function(){
		
			$(this).parent().parent().toggleClass(o.highlight);

			// Updating the counter
			$.fn.selecTR.updateCount(o.count, total);
			
			// Updating the header checkbox
			$headRad.prop({indeterminate:true, checked:false});
			if ($totCheck === 0) {
				$headRad.prop({indeterminate:false, checked:false});
			}
			if ($totCheck === total) {
				$headRad.prop({indeterminate:false, checked:true});
			}
			
			// Enabling/disabling the checkboxes according to the value given in the parameters 
			if (o.maxChecked !== 0){
				$disCheck = $("td input[type=checkbox]:not(:checked)");
				$totCheck === o.maxChecked ? $disCheck.prop({disabled: true}) : $disCheck.prop({disabled: false});
			}
		});

		// If we click on the checkbox in the header
		$headRad.click(function() {
			$bodyRad.prop("checked", function(){
				return $headRad.prop("checked");
			}).parent().parent().toggleClass(o.highlight, $headRad.prop("checked"));
			$.fn.selecTR.updateCount(o.count, total);
		});
	};
	
	$.fn.selecTR.updateCount = function(count, total){
		$totCheck = $("td input[type=checkbox]:checked").length;
		if(count){ $("#selecTRCompt").text($totCheck + "/" + total); }
	}
	
	$.fn.selecTR.defaults = {
		selecTR : "selecTR",
		highlight : "highlighted",
		count: true,
		maxChecked: 3
	};

})(jQuery);