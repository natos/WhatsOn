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
	'modules/app',
	'lib/flaco/view'

], function LoginView(a, App, View) {

/* private */

	/* constructor */
	function initialize() {

		App.emit(a.VIEW_RENDERED, this);

		return this;

	};

/* public */
	return {
		initialize: initialize
	};

});