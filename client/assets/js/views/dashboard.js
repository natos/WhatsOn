/* 
* DashboardView
* -------------
*
*/

define([

	'config/app',
	'controllers/app',
	'components/carousel'

], function DashboardView(c, App, Carousel) {

/* private */

function initialize() {

	App.emit(c.VIEW_LOADED, this);
	
	return this;

};

/* public */

/* @class Dashboard */
	return {
		/* constructor */
		initialize: initialize
	};

});