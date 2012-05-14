/* 
* ProgrammeController
* ------------------
*
*/

define([

	'config/app',
	'config/programme',
	'controllers/app',
	'views/programme'

], function ProgrammeController(c, p, App, ProgrammeView) {

/* private */

	function initialize() {

		// Let the App know your here
		App.controllers.programme = this;

		upc.on(p.RECORD, record);
		upc.on(p.FAVORITE, favorite);
		
		return this;
	
	};


	function record(url) {

		FB.api('/me/upcsocial:record', { tv_show: url }, function(response) {

			console.log('recorded');
			console.log(response);

		});

	};

	function favorite(url) {

		FB.api('/me/upcsocial:favorite', { tv_show: url }, function(response) {

			console.log('favoritered');
			console.log(response);

		});
	};


/* public */
	return {
		/* constructor */
		initialize: initialize,
		view: ProgrammeView.initialize()
	};

});