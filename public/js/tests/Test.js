// Test.js
// Test Skeleton

define([],

function() {

	var Test = function() {

	$('<div id="tests-layer">'
	+ '<h1 id="qunit-header">QUnit example</h1>'
	+ '<h2 id="qunit-banner"></h2>'
	+ '<div id="qunit-testrunner-toolbar"></div>'
	+ '<h2 id="qunit-userAgent"></h2>'
	+ '<ol id="qunit-tests"></ol>'
	+ '<div id="qunit-fixture">test markup, will be hidden</div>'
	+ '</div>')
	.css({
		'position'	: 'fixed'
	,	'top'		: '0'
	,	'left'		: '0'
	,	'bottom'	: '0'
	,	'right'		: '0'
	,	'margin'	: '0'
	,	'padding'	: '50px'
	,	'background': '#fff'
	,	'opacity'	: '.8'
	,	'z-index'	: '9999'
	,	'overflow'	: 'scroll'
	})
	.appendTo('body');

		this.run &&	this.run();

		return this;

	}

	return Test;

}); // define