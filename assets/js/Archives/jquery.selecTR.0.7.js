//-------------------------------------------------
// selecTR : a jQuery plugin
// table row selection / deselection "a la" Gmail
// @version: 0.7
// @date : 20111001
// @author: Neofyt
// 
//-------------------------------------------------

(function($) {
	
	$.fn.selecTR = function(options) {
		var opts = $.extend({}, $.fn.selecTR.defaults, options);
			
		$this = $(this);
		
		var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
		
		$this.find('thead tr').append('<th><input type="checkbox" class="'+ o.selectAll +'" /></th>');
		$this.find('tbody tr').append('<td><input type="checkbox" class="'+ o.selectOne +'" /></td>');
			
		$this.find('.'+o.selectOne).click(function() {           
			if($(this).is(':checked'))  {
				$(this).parent().parent().addClass(o.className);
				//console.log('checkedOne');
			} else {
				$(this).parent().parent().removeClass(o.className);
				//console.log('uncheckedOne');
				if ($this.find('.'+o.selectAll).is(':checked')){
					$this.find('.'+o.selectAll).prop('indeterminate',true);
				}
			}
		});
		
		$this.find('.'+o.selectAll).click(function() {     
			if($(this).is(':checked'))  {
				$this.find('.'+o.selectOne).prop('checked',true).parent().parent().addClass(o.className);
				//console.log('checkedAll');
			} else {
				$this.find('.'+o.selectOne).prop('checked',false).parent().parent().removeClass(o.className);
				//console.log('uncheckedAll');
			}
		});
	};
    
	$.fn.selecTR.defaults = {
		selectOne : "selecTR",
		selectAll : "selecTRall",
		className : "selected"
	};
	
})(jQuery);