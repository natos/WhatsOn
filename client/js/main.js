require.config({
	
	paths : {
        //create alias to plugins (not needed if plugins are on the baseUrl)
        text: 'lib/require-plugins/text',
        //async: 'lib/requirejs-plugins/async',
        //depend: 'lib/requirejs-plugins/depend',
        //font: 'lib/requirejs-plugins/font',
        //goog: 'lib/requirejs-plugins/goog',
        //image: 'lib/requirejs-plugins/image',
        json: 'lib/require-plugins/json',
        //noext: 'lib/requirejs-plugins/noext',
        //mdown: 'lib/requirejs-plugins/mdown',
        //propertyParser : 'lib/requirejs-plugins/propertyParser',
        //markdownConverter : 'lib/Markdown.Converter'
    }

});


require([

	'modules/app'

],
function(App) {

	/* safe console */
	if (!window.console || !window.console.log) {
		window.console = {
			assert: function(){},
			log: function(){},
			warn: function(){},
			error: function(){},
			debug: function(){},
			dir: function(){},
			info: function(){}
		};
	}

	/* global signature */
	window.upc = App.initialize();
	window.app = App;

});