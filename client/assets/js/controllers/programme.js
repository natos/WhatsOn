/* 
* ProgrammeController
* ------------------
*
*/

define([

	'config/app',
	'config/programme',
	'modules/app',
	'views/programme'

], function ProgrammeController(c, p, App, ProgrammeView) {

/* private */

	function initialize() {

		upc.on(p.RECORD, record);
		upc.on(p.FAVORITE, favorite);
		
		return this;
	
	};


	function record(url) {

		FB.api('/me/upcsocial:record', 'post', { tv_show: url }, function(response) {

			console.log('recorded');
			console.log(response);

		});

	};

	function favorite(url) {

		FB.api('/me/upcsocial:favorite', 'post', { tv_show: url }, function(response) {

			console.log('favoritered');
			console.log(response);

		});
	};


/* public */
	return {
		name: 'programme',
		/* constructor */
		initialize: initialize,
		view: ProgrammeView
	};

});