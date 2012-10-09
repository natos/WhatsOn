/* 
* EventModule 
* -----------
*
* Singleton! This is the central event emitter for the whole app.
*/

define([

	'/js/lib/event/event.js'

], function EventModuleScope(EventEmitter) {

/* private */

/* public */

	return new EventEmitter();

});