/* 
* ProgrammeController
* ------------------
*
*/

define([

	'config/app',
	'config/user',
	'config/programme',
	'modules/app',
	'lib/flaco/controller',
	'views/programme'

], function ProgrammeController(a, u, p, App, Controller, ProgrammeView) {


	var name = 'programme';

/* private */

	function record(url) {

		FB.api('/me/upcsocial:record', 'post', { tv_show: url }, function(response) {

			console.log('recorded');
			console.log(response);

			App.emit(u.FETCH_RECORDINGS);

		});

	};

	function favorite(url) {

		FB.api('/me/upcsocial:favorite', 'post', { tv_show: url }, function(response) {

			console.log('favoritered');
			console.log(response);
			App.emit(u.FETCH_FAVORITES);

		});
	};


/* public */

	function initialize(State) {

		console.log('Programme Controller init State: ', State)

		App.on(p.RECORD, record);
		App.on(p.FAVORITE, favorite);
		
		return this;
	
	};

	function finalize() {

		return this;

	};

/* export */

	return new Controller({
		name: name,
		initialize: initialize,
		finalize: finalize,
		view: ProgrammeView
	});

});