//-------------------------------------------------
// selecTR : a jQuery plugin
// table row selection / deselection "a la" Gmail
// @version: 0.8
// @date : 20111011
// @author: Neofyt
//-------------------------------------------------

(function($) {

	$.fn.selecTR = function(options) {
		var opts = $.extend({}, $.fn.selecTR.defaults, options);

		$this = $(this);
		$head = $this.find("thead");
		$body = $this.find("tbody");

		var o = $.meta ? $.extend({}, opts, $this.data()) : opts;

		// Creation of the radioboxes
		$head.find('tr').append('<th><input type="checkbox" class="'+ o.selectTR +'" /></th>');
		$body.find('tr').append('<td><input type="checkbox" class="'+ o.selectTR +'" /></td>');
		
		// Caching the radioboxes
		$headRad = $head.find('.'+o.selectTR);
		$bodyRad = $body.find('.'+o.selectTR);

		// Count of the number of checkboxes
		var total = $("td input[type=checkbox]").length;

		// In case of a click on a radiobox on the table body
		$body.find('.'+o.selectOne).click(function() {
		
			if($(this).is(':checked'))  {
				$(this).parent().parent().addClass(o.highlight); // we add the highlighted style to the row
				if ($headRad.is(':not(:checked)')){
					$headRad.prop('indeterminate',true).prop('checked',false); // and indeterminate value to the th radiobox
				}
				if ($("td input[type=checkbox]:checked").length == total) { // check if all tbody radioboxes are checked
					$headRad.prop('indeterminate',false).prop('checked',true); // if yes we give checked attribute to the th checkbox
				}
			} else {
				$(this).parent().parent().removeClass(o.highlight);
				if ($headRad.is(':checked')){
					$headRad.prop('indeterminate',true).prop('checked',false);
				}
				if ($("td input[type=checkbox]:checked").length == 0) {
					$headRad.prop('indeterminate',false).prop('checked',false);
				}
			}
		});

		// If we click on the checkbox in the header
		$headRad.click(function() {
			if($(this).is(':checked'))  {
				$bodyRad.prop('checked',true).prop('indeterminate',false).parent().parent().addClass(o.highlight);
			} else {
				$bodyRad.prop('checked',false).prop('indeterminate',false).parent().parent().removeClass(o.highlight);
			}
		});
	};

	$.fn.selecTR.defaults = {
		selecTR : "selecTR",
		highlight : "highlighted"
	};

})(jQuery);