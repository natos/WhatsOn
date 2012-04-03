/*
 * Require
 */

var events = require('events')
,	mongoose = requier('mongoose');


/*
 * Schema
 */

var PersonaSchema = new Schema({
	name		: String
,	picture		: String
,	lastlogon	: Date
,	ua			: [String]
,	comments	: [Comments]
,	favorites	: [Favorites]
});


/*
 * Persona.js
 */

var Persona = module.exports = function() {

	// borrow constructor
	events.EventEmitter.call(this);

	return this;
};

Persona.prototype = new EventEmitter();

// inherit events.EventEmitter
Persona.super_ = events.EventEmitter;
Persona.prototype = Object.create(events.EventEmitter.prototype, {
    constructor: {
        value: Persona,
        enumerable: false
    }
});