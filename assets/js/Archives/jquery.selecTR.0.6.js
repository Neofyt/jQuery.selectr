//-------------------------------------------------
// selecTR : a jQuery plugin
// table row selection / deselection "a la" Gmail
// @version: 0.6
// @date : 20110223
// @author: Neofyt
// 
//-------------------------------------------------

(function($) {
	
	$.fn.selecTR = function(options) {
		var opts = $.extend({}, $.fn.selecTR.defaults, options);
		//return this.each(function() {
			
			$this = $(this);
			
			var o = $.meta ? $.extend({}, opts, $this.data()) : opts;
			
			$this.find(o.selectOne).click(function() {           
				if($(this).is(':checked'))  {
					$(this).parent().parent().addClass(o.className);
					console.log('checkedOne');
				} else {
					$(this).parent().parent().removeClass(o.className);
					console.log('uncheckedOne');
					if ($this.find(o.selectAll).is(':checked')){
						$this.find(o.selectAll).attr('checked','');
                        $this.find(o.selectAll).attr('indeterminate','');
					}
				}
			});
			
			$this.find(o.selectAll).click(function() {     
				if($(this).is(':checked'))  {
					$this.find(o.selectOne).attr('checked','checked').parent().parent().addClass(o.className);
					console.log('checkedAll');
				} else {
					$this.find(o.selectOne).attr('checked','').parent().parent().removeClass(o.className);
					console.log('uncheckedAll');
				}
			});
	};
    
	$.fn.selecTR.defaults = {
		selectOne : ".selecTR",
		selectAll : ".selecTRall",
		className : "selected"
	};
	
})(jQuery);