var requirejs = require('requirejs');

/**
 * require configuration.
 */

requirejs.config({
    baseUrl: 'server',
    nodeRequire: require
});

requirejs([

	'controllers/app'
,	'utils/metadata'

],

function(App, Metadata) {

	new App();

/*
				// Meta data
				var _metadata = [
					{ property: "og:type"			, content: "upc-whatson:tv_channel" }
				,	{ property: "og:url"			, content: "http://upcwhatson.herokuapp.com/channel/7A.html" }
				,	{ property: "og:title"			, content: 'Channel' }
				,	{ property: "og:description"	, content: 'Cool channel' }
				,	{ property: "og:image"			, content: "http://upcwhatson.herokuapp.com/assets/upclogo.jpg" }
				];

				var __metadata = new Metadata();

				console.log('metadata', __metadata.get());

				__metadata.override(_metadata, 'property');

				console.log('metadata', __metadata.get());
*/

});