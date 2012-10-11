/* 
* EventModule 
* -----------
*
* Singleton! This is the central event emitter for the whole app.
*/

define([

	'lib/event/event'

], function EventModuleScope(EventEmitter) {

/* private */

/* public */

	return new EventEmitter();

});