if (!window.CompareI18N) {

	window.CompareI18N = {
	
		init : function() {
		
			var lang = null;
			
			switch (FAOSTATCompare.language) {
				case 'F' : lang = 'fr'; break;
				case 'S' : lang = 'es'; break;
				default: lang = 'en'; break;
			}
			
			$.i18n.properties({
			
				name: 'I18N',
				path: FAOSTATCompare.prefix + 'src/I18N/',
				mode: 'both',
				language: lang
			
			});
			
		},
		
		translate : function (id) {
			try {
				return($.i18n.prop(id));
			} catch (err) {
				//console.log(id + ", " + err);
			}
		},
		
		translateButton : function (className, id) {
			$('.' + className).attr('value', $.i18n.prop(id));
		}
	
	};

}