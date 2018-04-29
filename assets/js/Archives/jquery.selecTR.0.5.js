//-------------------------------------------------
// selecTR : a jQuery plugin
// table row selection / deselection "a la" Gmail
// @version: 0.5
// @date : 20120207
// @author: Neofyt
// 
//-------------------------------------------------

(function($) {
	
	$.fn.selecTR = function(options) {
		//var opts = $.extend({}, $.fn.jav.defaults, options);
		//return this.each(function() {
			
			$this = $(this);
			
			//var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
			
			$this.find('.selecTR').click(function() {           
				if($(this).is(':checked'))  {
					$(this).parent().parent().addClass('selected');
					console.log('checkedOne');
				} else {
					$(this).parent().parent().removeClass('selected');
					console.log('uncheckedOne');
					if ($this.find('.selecTRall').is(':checked')){
						$this.find('.selecTRall').attr('checked','')
					}
				}
			});
			
			$this.find('.selecTRall').click(function() {     
				if($(this).is(':checked'))  {
					$this.find('.selecTR').attr('checked','checked').parent().parent().addClass('selected');
					console.log('checkedAll');
				} else {
					$this.find('.selecTR').attr('checked','').parent().parent().removeClass('selected');
					console.log('uncheckedAll');
				}
			});
			
	};
	
	$.fn.selecTR.defaults = {
		selectOne : "selecTR",
		selectAll : "selecTRall",
		className : ""
	};
	
})(jQuery);