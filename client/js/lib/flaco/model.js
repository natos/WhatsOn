/* 
* GenericModel
* ------------
*
*/

define([], function GenericModelScope() {

/* private */

	var EVENT_EMITTER_URI = 'modules/event';

/* public */

	function ModelConstructor(o) {

	/* subclass Model */

		var Model = {},

			event = o.event,

			// iterator
			member;

	/* protected */

		// helper to find reserved words
		function isInherited(member) { return ['set', 'get'].indexOf(member) >= 0; }

		// define public members
		function definePublicMember(member) { if (!isInherited(member)) { Model[member] = o[member]; } }

	/* public */

		// process members, mark as public
		for (member in o) { definePublicMember(member);	}

		// sets new data on the model
		// rises a event with a change object
		Model.set = function set(key, value) {

			// save it
			Model[key] = value;

			// create a change object
			// with the new data
			var obj = {};
				obj[key] = value;

			// emit event
			if (event) { require([EVENT_EMITTER_URI], function trigger(EventEmitter) { EventEmitter.emit(event, obj); }); }

			return obj;
		};

	/* export subclass */

		return Model;

	}

/* 
 *	Return constructor
 *	Use: new ModelContructor({ ..lots of properties and stuff.. });
 */

	return ModelConstructor;

});