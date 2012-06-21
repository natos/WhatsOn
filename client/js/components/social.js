/*
* SocialComponent
* ---------------
*/

define([

	'config/app',
	'config/user',
	'modules/app',
	'models/user'

], function(a, u, App, UserModel) {

	var name = 'social',

/* private */

	url = $('meta[property="og:url"]').attr('content'),

	template_name = '#' + name + '-template';

	function handleModelChanges(changes) {
		// check if favorites has changed
		if (changes.favorites) {
			render(changes); 
		}
	}

/* public */

	function initialize() {

		// subscribe to get favorites
		App.on(u.MODEL_CHANGED, handleModelChanges);

	}

	function render(model) {

	}

	function finalize() {

		App.off(u.MODEL_CHANGED, handleModelChanges);

	}

/* export */

	return {
		name		: name,
		initialize	: initialize,
		finalize	: finalize,
		render		: render
	};

});