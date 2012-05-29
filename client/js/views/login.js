/* 
* LoginView
* ----------
*
* Emitting events, UI changes
* Listen to the model for data changes
*
*/

define([

	'config/app',
	'modules/app'

], function LoginView(c, App) {

/* private */

	/* constructor */
	function initialize() {

		App.emit(c.VIEW_LOADED, this);

		return this;

	};

/* public */
	return {
		initialize: initialize
	};

});