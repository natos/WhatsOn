// TopBookingsTemplate.js

define([], function(){

var t = '<div id="topbookings" class="view">'
	+ '<ul class="list">'
	+ '<% _.each(models, function( item ){ %>'
	+ '<li>'
	+ '<h2><%= item.get("title") %></h2>'
	+ '<p>on <strong><%= item.get("channel") %></strong>, <date><%= item.get("start") %></date></p>'
	+ '</li>'
	+ '<% }); %>'
	+ '</ul>'
	+ '</div>'

	return t;

});