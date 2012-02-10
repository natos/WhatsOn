// ChannelTemplate.js

define([], function(){

var t = '<div id="programme" class="view">'
	+ '<h2><%= title %></h2>'
	+ '<p><strong><%= subcategory.category.name %></strong> &gt; <strong><%= subcategory.name %></strong></p>'
	+ '<p><%= shortDescription %></p>'
	+ '<div id="events"><img src="assets/loader.gif"><div>'
	+ '</div>'

	return t;

});