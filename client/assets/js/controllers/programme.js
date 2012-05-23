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


	/**
	 * Activate the associated view, and set up event handlers
	 * @public
	 */
	function initialize(params) {

		ProgrammeView.initialize(params);

		upc.on(p.RECORD, record);
		upc.on(p.FAVORITE, favorite);
		
		return this;
	
	};

	/**
	 * Deactivate the associated view, and clean up event handlers
	 * @public
	 */
	function finalize() {

		ProgrammeView.finalize();

	}

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
		initialize: initialize,
		finalize: finalize,
		view: ProgrammeView
	};

});