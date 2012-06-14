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

], function ProgrammeControllerScope(a, u, p, App, Controller, ProgrammeView) {


	var name = 'programme';

/* private */

	function record(url) {

		FB.api('/me/upcsocial:record', 'post', { tv_show: url }, function(response) {

			console.log('recorded');
			console.log(response);

			App.emit(u.FETCH_RECORDINGS);

		});

	}

	function favorite(url) {

		FB.api('/me/upcsocial:favorite', 'post', { tv_show: url }, function(response) {

			console.log('favoritered');
			console.log(response);
			App.emit(u.FETCH_FAVORITES);

		});
	}


/* public */

/* abstract */ 

	function initialize(State) {

		App.on(p.RECORD, record);
		App.on(p.FAVORITE, favorite);
		
		return this;
	
	}

	function finalize() {

		App.off(p.RECORD, record);
		App.off(p.FAVORITE, favorite);

		return this;

	}

/* export */

	return new Controller({
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		view		: ProgrammeView
	});

});